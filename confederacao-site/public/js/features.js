/* Funcoes reutilizadas pelas paginas (fotos, videos, comentarios, pedidos).
   Dependem de layout.js ($ , toast, fmt, ME). */

/* ---- Midia (fotos/videos) ---- */
function setupUpload(formSel, progSel, kindLabel, reload) {
  const form = $(formSel);
  if (!form) return;
  form.onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const prog = $(progSel);
    if (prog) prog.classList.remove('hidden');
    try {
      const r = await fetch('/api/media', { method: 'POST', body: fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Falha no envio');
      form.reset();
      toast(kindLabel + ' enviado com sucesso!');
      reload();
    } catch (err) {
      toast(err.message, true);
    } finally {
      if (prog) prog.classList.add('hidden');
    }
  };
}

async function loadMedia(kind, gridSel) {
  const grid = $(gridSel);
  if (!grid) return;
  const d = await (await fetch('/api/media?kind=' + kind)).json();
  grid.innerHTML = '';
  if (!d.items.length) {
    grid.innerHTML = '<p class="empty">Nada por aqui ainda. Seja o primeiro a enviar!</p>';
    return;
  }
  d.items.forEach((m) => {
    const card = document.createElement('div');
    card.className = 'card-media';
    card.innerHTML =
      kind === 'video'
        ? `<video src="${m.url}" controls preload="metadata"></video>`
        : `<img src="${m.url}" loading="lazy" alt="" />`;
    const meta = document.createElement('div');
    meta.className = 'meta';
    const cap = document.createElement('div');
    cap.className = 'cap';
    cap.textContent = m.caption || '';
    const by = document.createElement('div');
    by.className = 'by';
    by.textContent = (m.ownerName || '') + ' • ' + fmt(m.createdAt);
    meta.append(cap, by);
    card.appendChild(meta);
    const del = document.createElement('button');
    del.className = 'del';
    del.textContent = 'Apagar';
    del.onclick = async () => {
      if (!confirm('Apagar este item?')) return;
      const r = await fetch('/api/media/' + m.id, { method: 'DELETE' });
      if (r.ok) { toast('Removido.'); loadMedia(kind, gridSel); }
      else toast('Sem permissão.', true);
    };
    card.appendChild(del);
    grid.appendChild(card);
  });
}

/* ---- Comentarios ---- */
async function loadComments(listSel) {
  const list = $(listSel);
  if (!list) return;
  const d = await (await fetch('/api/comments')).json();
  list.innerHTML = '';
  if (!d.items.length) {
    list.innerHTML = '<p class="empty">Nenhum comentário ainda.</p>';
    return;
  }
  d.items.forEach((c) => {
    const el = document.createElement('div');
    el.className = 'comment';
    const head = document.createElement('div');
    head.className = 'ch';
    const who = document.createElement('span');
    who.textContent = c.author;
    const when = document.createElement('span');
    when.textContent = fmt(c.createdAt);
    head.append(who, when);
    const body = document.createElement('div');
    body.className = 'ct';
    body.innerHTML = c.text; // ja escapado no servidor
    el.append(head, body);
    list.appendChild(el);
  });
}
function setupComment(formSel, listSel) {
  const form = $(formSel);
  if (!form) return;
  form.onsubmit = async (e) => {
    e.preventDefault();
    const text = new FormData(form).get('text');
    const r = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (r.ok) { form.reset(); loadComments(listSel); }
    else toast('Erro ao comentar.', true);
  };
}

/* ---- Pedidos (admin) ---- */
async function loadPending(listSel) {
  const list = $(listSel);
  if (!list) return;
  const d = await (await fetch('/api/admin/pending')).json();
  list.innerHTML = '';
  if (!d.pending || !d.pending.length) {
    list.innerHTML = '<p class="empty">Nenhum pedido pendente.</p>';
    return;
  }
  d.pending.forEach((u) => {
    const el = document.createElement('div');
    el.className = 'pending';
    const info = document.createElement('div');
    info.textContent = u.displayName + ' (@' + u.username + ')';
    const actions = document.createElement('div');
    actions.className = 'pa';
    const ap = document.createElement('button');
    ap.className = 'btn small';
    ap.textContent = 'Aprovar';
    ap.onclick = () => decide(u.id, 'approve', listSel);
    const rj = document.createElement('button');
    rj.className = 'btn small ghost';
    rj.textContent = 'Recusar';
    rj.onclick = () => decide(u.id, 'reject', listSel);
    actions.append(ap, rj);
    el.append(info, actions);
    list.appendChild(el);
  });
}
async function decide(userId, decision, listSel) {
  const r = await fetch('/api/admin/decide', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, decision }),
  });
  if (r.ok) {
    toast(decision === 'approve' ? 'Membro aprovado!' : 'Pedido recusado.');
    loadPending(listSel);
  } else toast('Erro.', true);
}
