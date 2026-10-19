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
      ownerId: req.user.id,
      ownerName: req.user.displayName,
      createdAt: new Date().toISOString(),
    };
    list.unshift(item);
    db.saveMedia(list);
    res.json({ ok: true, id: item.id });
  });

  // ---- Listar midia por tipo (photo | video) ----
  app.get('/api/media', requireMember, (req, res) => {
    const kind = req.query.kind === 'video' ? 'video' : 'photo';
    const items = db
      .getMedia()
      .filter((m) => m.kind === kind)
      .map((m) => ({
        id: m.id,
        kind: m.kind,
        caption: m.caption,
        ownerName: m.ownerName,
        createdAt: m.createdAt,
        url: '/api/file/' + m.id,
      }));
    res.json({ items });
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

  // ====================  COMENTARIOS  ====================

  // Listar comentarios (texto ja escapado para evitar XSS)
  app.get('/api/comments', requireMember, (req, res) => {
    const items = db.getComments().map((c) => ({
      id: c.id,
      author: c.author,
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
