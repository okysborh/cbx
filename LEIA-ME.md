# 🌿 Confederação Brasileira Cannabica Xamaniáca

Site privado para o grupo de amigos. Tem:

- 🔐 **Login** e cadastro
- 📸 **Aba de Fotos** (enviar e ver)
- 🎥 **Aba de Vídeos** (enviar e ver)
- 💬 **Aba de Comentários** (mural embaixo)
- ⭐ **Aprovação de membros**: todo novo cadastro fica *pendente* e só entra
  depois que o **dono do site (conta premium)** aprovar o pedido.
- 🔒 As fotos e vídeos **só aparecem para membros aprovados** — quem não está
  logado e aprovado não consegue nem abrir os arquivos.

---

## 🚀 Como rodar

1. Instale o **Node.js 18+** (https://nodejs.org).
2. No terminal, dentro desta pasta:
   ```bash
   npm install
   npm start
   ```
3. Abra no navegador: **http://127.0.0.1:3000**

No primeiro boot, o sistema cria a **conta do dono** e mostra o login/senha no
terminal. O padrão é:

- Usuário: `dono`
- Senha: `trocar-esta-senha`

### ⚠️ Troque a senha do dono!
Antes de usar de verdade, defina suas próprias credenciais (e um segredo de
sessão) por variáveis de ambiente:

```bash
OWNER_USER=seunome OWNER_PASS=umaSenhaForte SESSION_SECRET=algo-bem-aleatorio npm start
```

> Se mudar o usuário do dono depois que a conta já foi criada, ele NÃO cria
> outra — a conta de dono só é gerada uma vez. Para recomeçar, apague os
> arquivos em `data/`.

---

## 👥 Como funciona a entrada de novos membros

1. A pessoa clica em **“Pedir acesso”** e preenche nome, usuário e senha.
2. O cadastro fica **pendente** (ela ainda não consegue logar).
3. O **dono** entra no site, vai na aba **“⭐ Pedidos”** e clica em
   **Aprovar** ou **Recusar**.
4. Depois de aprovada, a pessoa já pode entrar e ver tudo.

---

## 🛡️ Segurança (importante)

- As senhas são guardadas com **hash bcrypt** (nunca em texto puro).
- Comentários são **escapados** para evitar injeção de código (XSS).
- Fotos e vídeos só são servidos através de uma rota **protegida por login**.
- O servidor escuta **somente em `127.0.0.1`** (apenas no seu computador).
  Para deixar o site acessível pela internet com segurança, coloque na frente
  um **proxy reverso com HTTPS** (ex.: Nginx ou Caddy) e um domínio. Não
  exponha a porta direto sem HTTPS.
- Os dados ficam em arquivos JSON na pasta `data/` e os arquivos em `uploads/`.
  Faça backup dessas duas pastas.

---

## 🧩 Interface

- **Menu lateral** (à esquerda) com as abas: Fotos, Vídeos, Comentários e, só
  para o dono, Pedidos. No celular o menu vira um botão ☰.
- **Banner temático** (mandala xamânica + folhas) aparece no topo de todas as abas.
- Cada aba é uma página própria:
  - `fotos.html` — galeria de fotos
  - `videos.html` — galeria de vídeos
  - `comentarios.html` — mural de comentários
  - `pedidos.html` — aprovação de membros (só o dono)

Depois do login o site abre direto em `fotos.html`.

## 🗂️ Estrutura

```
confederacao-site/
  server.js         # servidor + login + aprovação de membros
  routes-media.js   # rotas de fotos, vídeos e comentários
  db.js             # armazenamento em JSON
  public/
    index.html      # tela de login / pedir acesso
    fotos.html      # aba Fotos
    videos.html     # aba Vídeos
    comentarios.html# aba Comentários
    pedidos.html    # aba Pedidos (dono)
    css/style.css   # estilos (menu lateral + banner)
    js/layout.js    # menu lateral + banner + sessão
    js/features.js  # funções de fotos/vídeos/comentários/pedidos
  data/             # banco de dados (JSON) - criado ao rodar
  uploads/          # arquivos enviados - criado ao rodar
```

---

Quer que eu adicione algo? (ex.: reservações, curtidas nas fotos, categorias,
notificação por e-mail quando chega um pedido, ou um app pra celular). É só pedir!
