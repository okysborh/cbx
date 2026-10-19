const $ = (s) => document.querySelector(s);
const msg = $('#auth-msg');
const formLogin = $('#form-login');
const formReg = $('#form-register');

function show(text, ok) {
  msg.textContent = text;
  msg.className = 'msg ' + (ok ? 'ok' : 'err');
}

// Se ja estiver logado, vai direto para a area de membros
fetch('/api/me').then(r => r.json()).then(d => {
  if (d.user && d.user.status === 'approved') location.href = '/fotos.html';
});

$('#tab-login').onclick = () => {
  $('#tab-login').classList.add('active');
  $('#tab-register').classList.remove('active');
  formLogin.classList.remove('hidden');
  formReg.classList.add('hidden');
  show('', true);
};
$('#tab-register').onclick = () => {
  $('#tab-register').classList.add('active');
  $('#tab-login').classList.remove('active');
  formReg.classList.remove('hidden');
  formLogin.classList.add('hidden');
  show('', true);
};

formLogin.onsubmit = async (e) => {
  e.preventDefault();
  const body = Object.fromEntries(new FormData(formLogin));
  const r = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const d = await r.json();
  if (r.ok) location.href = '/fotos.html';
  else show(d.error || 'Erro ao entrar.', false);
};

formReg.onsubmit = async (e) => {
  e.preventDefault();
  const body = Object.fromEntries(new FormData(formReg));
  const r = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const d = await r.json();
  if (r.ok) {
    show(d.message || 'Pedido enviado! Aguarde aprovacao.', true);
    formReg.reset();
  } else {
    show(d.error || 'Erro ao cadastrar.', false);
  }
};
