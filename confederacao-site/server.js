/**
 * Confederacao Brasileira Cannabica Xamaniaca - servidor
 * Express + sessao. Area privada: somente membros APROVADOS veem midia.
 * Novos cadastros ficam PENDENTES ate o dono (conta premium) aprovar.
 */
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
// Em producao (Railway/VPS) defina HOST=0.0.0.0 para o site ficar acessivel.
// No seu computador o padrao 127.0.0.1 mantem o site apenas local.
const HOST = process.env.HOST || '127.0.0.1';

// Pasta de uploads: usa STORAGE_DIR (volume permanente) se definido.
const UPLOADS = process.env.UPLOADS_DIR
  || (process.env.STORAGE_DIR
    ? path.join(process.env.STORAGE_DIR, 'uploads')
    : path.join(__dirname, 'uploads'));
if (!fs.existsSync(UPLOADS)) fs.mkdirSync(UPLOADS, { recursive: true });

// ---- Dono / conta premium (semente no primeiro boot) ----
const OWNER_USER = process.env.OWNER_USER || 'dono';
const OWNER_PASS = process.env.OWNER_PASS || 'trocar-esta-senha';
(function seedOwner() {
  const users = db.getUsers();
  if (!users.some((u) => u.role === 'owner')) {
    users.push({
      id: db.id(),
      username: OWNER_USER,
      displayName: 'Dono do Site',
      passwordHash: bcrypt.hashSync(OWNER_PASS, 10),
      role: 'owner', // owner = conta premium / administrador
      plan: 'premium',
      status: 'approved',
      createdAt: new Date().toISOString(),
    });
    db.saveUsers(users);
    console.log(`\n⭐ Conta do DONO criada: usuario "${OWNER_USER}" / senha "${OWNER_PASS}"`);
    console.log('   >> Troque a senha em producao (variaveis OWNER_USER / OWNER_PASS).\n');
  }
})();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 * 7 },
  })
);

// ---- Helpers de autenticacao ----
function currentUser(req) {
  if (!req.session.userId) return null;
  return db.findUserById(req.session.userId) || null;
}
function requireMember(req, res, next) {
  const u = currentUser(req);
  if (!u || u.status !== 'approved') {
    return res.status(401).json({ error: 'Acesso restrito a membros aprovados.' });
  }
  req.user = u;
  next();
}
function requireOwner(req, res, next) {
  const u = currentUser(req);
  if (!u || u.role !== 'owner') {
    return res.status(403).json({ error: 'Apenas o dono do site pode fazer isso.' });
  }
  req.user = u;
  next();
}
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---- Upload (fotos e videos) ----
const storage = multer.diskStorage({
  destination: (req, f, cb) => cb(null, UPLOADS),
  filename: (req, f, cb) => {
    const ext = path.extname(f.originalname).toLowerCase().slice(0, 10);
    cb(null, db.id() + ext);
  },
});
const ALLOWED = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
};
const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB
  fileFilter: (req, f, cb) => {
    if (ALLOWED.image.includes(f.mimetype) || ALLOWED.video.includes(f.mimetype)) {
      return cb(null, true);
    }
    cb(new Error('Tipo de arquivo nao permitido (apenas imagens e videos).'));
  },
});

// ====================  ROTAS DE AUTENTICACAO  ====================

// Cadastro: entra como PENDENTE, aguardando aprovacao do dono.
app.post('/api/register', (req, res) => {
  const { username, displayName, password } = req.body || {};
  if (!username || !password || String(password).length < 6) {
    return res.status(400).json({ error: 'Informe usuario e senha (minimo 6 caracteres).' });
  }
  if (db.findUserByUsername(username)) {
    return res.status(409).json({ error: 'Este usuario ja existe.' });
  }
  const users = db.getUsers();
  users.push({
    id: db.id(),
    username: String(username).trim(),
    displayName: String(displayName || username).trim().slice(0, 60),
    passwordHash: bcrypt.hashSync(String(password), 10),
    role: 'member',
    plan: 'free',
    status: 'pending', // <-- precisa de aprovacao do dono
    createdAt: new Date().toISOString(),
  });
  db.saveUsers(users);
  res.json({ ok: true, message: 'Pedido enviado! Aguarde a aprovacao do dono do site.' });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  const user = db.findUserByUsername(username || '');
  if (!user || !bcrypt.compareSync(String(password || ''), user.passwordHash)) {
    return res.status(401).json({ error: 'Usuario ou senha invalidos.' });
  }
  if (user.status === 'pending') {
    return res.status(403).json({ error: 'Seu cadastro ainda aguarda aprovacao do dono.' });
  }
  if (user.status === 'rejected') {
    return res.status(403).json({ error: 'Seu pedido de acesso foi recusado.' });
  }
  req.session.userId = user.id;
  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/me', (req, res) => {
  const u = currentUser(req);
  if (!u) return res.json({ user: null });
  res.json({
    user: {
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      role: u.role,
      plan: u.plan,
      status: u.status,
    },
  });
});

// ====================  ADMIN (DONO / PREMIUM)  ====================

// Lista pedidos pendentes
app.get('/api/admin/pending', requireOwner, (req, res) => {
  const pend = db
    .getUsers()
    .filter((u) => u.status === 'pending')
    .map((u) => ({ id: u.id, username: u.username, displayName: u.displayName, createdAt: u.createdAt }));
  res.json({ pending: pend });
});

// Aprova ou recusa um pedido
app.post('/api/admin/decide', requireOwner, (req, res) => {
  const { userId, decision } = req.body || {};
  const users = db.getUsers();
  const u = users.find((x) => x.id === userId);
  if (!u) return res.status(404).json({ error: 'Usuario nao encontrado.' });
  if (decision !== 'approve' && decision !== 'reject') {
    return res.status(400).json({ error: 'Decisao invalida.' });
  }
  u.status = decision === 'approve' ? 'approved' : 'rejected';
  db.saveUsers(users);
  res.json({ ok: true, status: u.status });
});

module.exports = {
  app,
  PORT,
  HOST,
  UPLOADS,
  db,
  upload,
  requireMember,
  requireOwner,
  escapeHtml,
  ALLOWED,
};

require('./routes-media')(module.exports);

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, HOST, () => {
  console.log(`\n✅ Site da Confederacao rodando em http://${HOST}:${PORT}`);
  console.log('   (Para liberar na rede, configure um proxy reverso com HTTPS.)\n');
});
