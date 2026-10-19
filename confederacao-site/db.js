/**
 * Camada de dados simples baseada em arquivos JSON.
 * Evita dependências nativas (nada de compilar) para facilitar a instalação.
 * Ideal para um grupo pequeno de amigos.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Pasta de dados: usa STORAGE_DIR (volume permanente, ex. no Railway)
// se definido; senao grava na pasta local 'data'.
const DATA_DIR = process.env.DATA_DIR
  || (process.env.STORAGE_DIR
    ? path.join(process.env.STORAGE_DIR, 'data')
    : path.join(__dirname, 'data'));
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function file(name) {
  return path.join(DATA_DIR, name);
}

function read(name, fallback) {
  try {
    const raw = fs.readFileSync(file(name), 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function write(name, data) {
  // gravação atômica: escreve em temporário e renomeia
  const tmp = file(name + '.tmp');
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file(name));
}

function id() {
  return crypto.randomBytes(12).toString('hex');
}

// ---- Usuários ----
function getUsers() {
  return read('users.json', []);
}
function saveUsers(users) {
  write('users.json', users);
}
function findUserByUsername(username) {
  return getUsers().find(
    (u) => u.username.toLowerCase() === String(username).toLowerCase()
  );
}
function findUserById(uid) {
  return getUsers().find((u) => u.id === uid);
}

// ---- Mídia (fotos e vídeos) ----
function getMedia() {
  return read('media.json', []);
}
function saveMedia(list) {
  write('media.json', list);
}

// ---- Comentários ----
function getComments() {
  return read('comments.json', []);
}
function saveComments(list) {
  write('comments.json', list);
}

module.exports = {
  id,
  getUsers,
  saveUsers,
  findUserByUsername,
  findUserById,
  getMedia,
  saveMedia,
  getComments,
  saveComments,
};
