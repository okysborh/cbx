/**
 * Rotas de midia (fotos/videos) e comentarios.
 * TODAS protegidas por requireMember: somente membros aprovados acessam.
 */
const path = require('path');
const fs = require('fs');

module.exports = function (ctx) {
  const { app, db, upload, requireMember, escapeHtml, ALLOWED, UPLOADS } = ctx;

  function kindOf(mimetype) {
    return ALLOWED.image.includes(mimetype) ? 'photo' : 'video';
  }

  // Normaliza um item antigo que ainda nao tem os campos novos (curtidas/comentarios).
  function ensureFields(m) {
    if (!Array.isArray(m.likes)) m.likes = [];
    if (!Array.isArray(m.comments)) m.comments = [];
    return m;
  }

  // ---- Enviar foto ou video ----
  app.post('/api/media', requireMember, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const list = db.getMedia();
    const item = {
      id: db.id(),
      filename: req.file.filename,
      kind: kindOf(req.file.mimetype),
      mimetype: req.file.mimetype,
      caption: String(req.body.caption || '').slice(0, 300),
      album: String(req.body.album || '').trim().slice(0, 40),
      ownerId: req.user.id,
      ownerName: req.user.displayName,
      likes: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };
    list.unshift(item);
    db.saveMedia(list);
    res.json({ ok: true, id: item.id });
  });

  // ---- Listar midia por tipo (photo | video) ----
  app.get('/api/media', requireMember, (req, res) => {
    const kind = req.query.kind === 'video' ? 'video' : 'photo';
    const album = String(req.query.album || '').trim();
    const q = String(req.query.q || '').trim().toLowerCase();
    let items = db.getMedia().map(ensureFields).filter((m) => m.kind === kind);
    if (album) items = items.filter((m) => (m.album || '') === album);
    if (q) {
      items = items.filter(
        (m) =>
          (m.caption || '').toLowerCase().includes(q) ||
          (m.ownerName || '').toLowerCase().includes(q)
      );
    }
    const out = items.map((m) => ({
      id: m.id,
      kind: m.kind,
      caption: m.caption,
      album: m.album || '',
      ownerName: m.ownerName,
      ownerId: m.ownerId,
      createdAt: m.createdAt,
      url: '/api/file/' + m.id,
      likesCount: m.likes.length,
      likedByMe: m.likes.includes(req.user.id),
      commentsCount: m.comments.length,
    }));
    res.json({ items: out });
  });

  // ---- Lista de albuns existentes (para o seletor) ----
  app.get('/api/albums', requireMember, (req, res) => {
    const kind = req.query.kind === 'video' ? 'video' : 'photo';
    const set = new Set();
    db.getMedia()
      .filter((m) => m.kind === kind && m.album)
      .forEach((m) => set.add(m.album));
    res.json({ albums: Array.from(set).sort() });
  });

  // ---- Servir o arquivo (gated: so membros aprovados) ----
  app.get('/api/file/:id', requireMember, (req, res) => {
    const m = db.getMedia().find((x) => x.id === req.params.id);
    if (!m) return res.status(404).end();
    const full = path.join(UPLOADS, m.filename);
    if (!fs.existsSync(full)) return res.status(404).end();
    res.type(m.mimetype);
    fs.createReadStream(full).pipe(res);
  });

  // ---- Curtir / descurtir (toggle) ----
  app.post('/api/media/:id/like', requireMember, (req, res) => {
    const list = db.getMedia();
    const m = list.find((x) => x.id === req.params.id);
    if (!m) return res.status(404).json({ error: 'Nao encontrado.' });
    ensureFields(m);
    const i = m.likes.indexOf(req.user.id);
    if (i === -1) m.likes.push(req.user.id);
    else m.likes.splice(i, 1);
    db.saveMedia(list);
    res.json({ ok: true, likesCount: m.likes.length, likedByMe: i === -1 });
  });

  // ---- Comentarios de uma foto/video ----
  app.get('/api/media/:id/comments', requireMember, (req, res) => {
    const m = db.getMedia().find((x) => x.id === req.params.id);
    if (!m) return res.status(404).json({ error: 'Nao encontrado.' });
    ensureFields(m);
    res.json({
      items: m.comments.map((c) => ({
        id: c.id,
        author: c.author,
        authorId: c.authorId,
        text: c.text, // ja escapado
        createdAt: c.createdAt,
      })),
    });
  });

  app.post('/api/media/:id/comments', requireMember, (req, res) => {
    const text = String((req.body && req.body.text) || '').trim();
    if (!text) return res.status(400).json({ error: 'Comentario vazio.' });
    if (text.length > 1000) return res.status(400).json({ error: 'Comentario muito longo.' });
    const list = db.getMedia();
    const m = list.find((x) => x.id === req.params.id);
    if (!m) return res.status(404).json({ error: 'Nao encontrado.' });
    ensureFields(m);
    const c = {
      id: db.id(),
      author: req.user.displayName,
      authorId: req.user.id,
      text: escapeHtml(text),
      createdAt: new Date().toISOString(),
    };
    m.comments.push(c);
    db.saveMedia(list);
    res.json({ ok: true });
  });

  app.delete('/api/media/:id/comments/:cid', requireMember, (req, res) => {
    const list = db.getMedia();
    const m = list.find((x) => x.id === req.params.id);
    if (!m) return res.status(404).json({ error: 'Nao encontrado.' });
    ensureFields(m);
    const c = m.comments.find((x) => x.id === req.params.cid);
    if (!c) return res.status(404).json({ error: 'Comentario nao encontrado.' });
    if (c.authorId !== req.user.id && req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Sem permissao.' });
    }
    m.comments = m.comments.filter((x) => x.id !== c.id);
    db.saveMedia(list);
    res.json({ ok: true });
  });

  // ---- Apagar midia (autor ou dono) ----
  app.delete('/api/media/:id', requireMember, (req, res) => {
    const list = db.getMedia();
    const m = list.find((x) => x.id === req.params.id);
    if (!m) return res.status(404).json({ error: 'Nao encontrado.' });
    if (m.ownerId !== req.user.id && req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Sem permissao.' });
    }
    const full = path.join(UPLOADS, m.filename);
    if (fs.existsSync(full)) fs.unlinkSync(full);
    db.saveMedia(list.filter((x) => x.id !== m.id));
    res.json({ ok: true });
  });

  // ====================  COMENTARIOS (MURAL GERAL)  ====================

  // Listar comentarios (texto ja escapado para evitar XSS)
  app.get('/api/comments', requireMember, (req, res) => {
    const items = db.getComments().map((c) => ({
      id: c.id,
      author: c.author,
      authorId: c.authorId,
      text: c.text, // ja armazenado escapado
      createdAt: c.createdAt,
    }));
    res.json({ items });
  });

  // Publicar comentario
  app.post('/api/comments', requireMember, (req, res) => {
    const text = String((req.body && req.body.text) || '').trim();
    if (!text) return res.status(400).json({ error: 'Comentario vazio.' });
    if (text.length > 1000) return res.status(400).json({ error: 'Comentario muito longo.' });
    const list = db.getComments();
    const item = {
      id: db.id(),
      author: req.user.displayName,
      authorId: req.user.id,
      text: escapeHtml(text), // sanitiza na entrada
      createdAt: new Date().toISOString(),
    };
    list.push(item);
    db.saveComments(list);
    res.json({ ok: true });
  });

  // Apagar comentario (autor ou dono)
  app.delete('/api/comments/:id', requireMember, (req, res) => {
    const list = db.getComments();
    const c = list.find((x) => x.id === req.params.id);
    if (!c) return res.status(404).json({ error: 'Nao encontrado.' });
    if (c.authorId !== req.user.id && req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Sem permissao.' });
    }
    db.saveComments(list.filter((x) => x.id !== c.id));
    res.json({ ok: true });
  });
};
