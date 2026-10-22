# 🚂 Guia passo a passo — Publicar o site no Railway

Este guia coloca o site da Confederação no ar, com um link que seus amigos
podem abrir de qualquer lugar.

> 💡 Você NÃO precisa saber programar. É só seguir os passos na ordem.

---

## 💰 Antes de começar: custo

- O Railway dá um **teste grátis de 30 dias com US$ 5 de crédito** (sem pedir
  cartão no início).
- Depois do teste, o plano **Hobby custa cerca de US$ 5/mês**. Para um site
  pequeno de amigos, o gasto real costuma ficar dentro desse valor.
- Esses valores podem mudar — confira sempre em https://railway.com/pricing

---

## Passo 1 — Colocar os arquivos no GitHub

O Railway pega o código a partir do GitHub (um "cofre" de projetos online).

1. Crie uma conta grátis em https://github.com
2. Clique no botão verde **New** (novo repositório).
3. Dê um nome (ex.: `confederacao-site`), marque como **Private** (privado) e
   clique em **Create repository**.
4. Na página seguinte, clique em **uploading an existing file**
   ("enviar arquivos existentes").
5. **Descompacte** o `confederacao-site.zip` no seu computador e **arraste
   todos os arquivos de dentro da pasta** para a área de upload do GitHub.
   - ⚠️ NÃO envie a pasta `node_modules` (se existir). Os outros arquivos, sim.
6. Clique em **Commit changes** (confirmar). Pronto, seu código está no GitHub.

---

## Passo 2 — Criar o projeto no Railway

1. Entre em https://railway.com e clique em **Login** → entre com sua conta do
   **GitHub** (mais fácil).
2. Clique em **New Project** (novo projeto).
3. Escolha **Deploy from GitHub repo** (publicar a partir do GitHub).
4. Autorize o Railway a ver seus repositórios e escolha o `confederacao-site`.
5. O Railway vai detectar que é um projeto Node.js e começar a publicar sozinho.
   Aguarde aparecer **“Success” / Deployed**.

---

## Passo 3 — Configurar as variáveis (senha do dono, etc.)

1. No painel do projeto, clique no seu serviço (o quadradinho do app) → aba
   **Variables**.
2. Adicione as variáveis abaixo (botão **New Variable**), uma a uma:

   | Nome | Valor | Para que serve |
   |------|-------|----------------|
   | `HOST` | `0.0.0.0` | deixa o site acessível pela internet |
   | `OWNER_USER` | o usuário de dono que você quiser | seu login de dono |
   | `OWNER_PASS` | uma senha forte sua | sua senha de dono |
   | `SESSION_SECRET` | um texto aleatório longo | segurança das sessões |
   | `STORAGE_DIR` | `/data` | onde salvar fotos e contas (ver Passo 4) |

3. Salve. O Railway vai reiniciar o app com as novas configurações.

---

## Passo 4 — ⚠️ IMPORTANTE: armazenamento permanente (Volume no `/data`)

Sem isso, **toda vez que o site reiniciar, as fotos, vídeos e contas somem!**
Para guardar tudo de verdade, você precisa criar um "Volume" — que é como um
HD permanente para o seu app. Isso é feito **dentro do painel do Railway**
(eu não consigo criar por você, mas é rapidinho). Siga assim:

1. No painel do projeto, **clique no quadradinho do seu serviço** (o app).
2. Agora há duas formas (use a que aparecer na sua tela):
   - **Forma A (botão direito):** clique com o **botão direito do mouse** em
     cima do quadradinho do serviço → escolha **Attach Volume** ou
     **Add Volume** (anexar/adicionar volume).
   - **Forma B (menu):** com o serviço aberto, procure o botão **Create** ou
     o ícone **+** no canto, e escolha **Volume**.
3. Vai aparecer um campo pedindo o **Mount Path** (caminho de montagem).
   Digite exatamente: `/data`
4. Clique em **Add** / **Create** para confirmar.
5. O Railway vai reiniciar o app. Pronto! Esse `/data` é o mesmo valor que
   você colocou em `STORAGE_DIR` no Passo 3 — por isso tudo se conecta.

> ✅ A partir de agora, fotos, vídeos e cadastros ficam salvos de forma
> permanente, mesmo que o site reinicie ou receba atualizações.
>
> 💡 Dica: se você já tinha enviado fotos ANTES de criar o Volume, elas podem
> ter sido perdidas no último reinício. A partir da criação do Volume, isso
> não acontece mais.

---

## Passo 5 — Gerar o link público

1. No serviço, abra a aba **Settings** → seção **Networking** (ou **Domains**).
2. Clique em **Generate Domain** (gerar domínio).
3. O Railway cria um endereço tipo
   `https://confederacao-site-production.up.railway.app`
4. **Esse é o link que você manda para os amigos!** 🎉
   (Já vem com HTTPS/cadeado de segurança automático.)

---

## Passo 6 — Entrar como dono e aprovar os amigos

1. Abra o link no navegador.
2. Faça login com o `OWNER_USER` e `OWNER_PASS` que você definiu no Passo 3.
3. Mande o link para os amigos. Eles clicam em **“Pedir acesso”** e se cadastram.
4. Você, logado como dono, entra na aba **“⭐ Pedidos”** e clica em **Aprovar**.

Pronto! Site no ar e só para quem você deixar entrar. 🌿

---

## Passo 7 — Atualizar o site (subir esta versão nova)

Você recebeu uma versão **melhorada** do site. Para o Railway publicar as
novidades, basta mandar os arquivos novos para o mesmo GitHub — o Railway
republica sozinho:

1. Descompacte o novo `confederacao-site.zip`.
2. Entre no seu repositório no GitHub (`okysborh/cbx`).
3. Clique em **Add file** → **Upload files**.
4. Arraste **todos os arquivos de dentro da pasta** `confederacao-site`
   (pode arrastar tudo; o GitHub substitui os que mudaram).
   - ⚠️ Não precisa enviar `node_modules`.
5. Desça a página e clique em **Commit changes**.
6. O Railway detecta a mudança e republica em 1-2 minutos. Atualize o site. ✅

> Suas fotos, vídeos e contas **não se perdem** nessa atualização, porque ficam
> guardadas no Volume `/data` (Passo 4), separadas do código.

---

## ✨ Novidades desta versão

- ❤️ **Curtidas** nas fotos e vídeos.
- 💬 **Comentários em cada foto/vídeo** (além do mural geral).
- 🔍 **Tela cheia** ao clicar numa foto/vídeo, com curtidas e comentários ali.
- 🗂️ **Álbuns** e **busca** por legenda/autor nas galerias.
- 👤 **Página "Meu perfil"**: avatar (emoji), bio e **troca de senha**.
- 🔔 **Aviso de pedidos** pendentes no menu do dono (bolinha vermelha).
- 🌓 **Modo claro/escuro** (botão no menu lateral).
- 📱 **Instalável no celular** (abre em "Adicionar à tela inicial" como um app).
- 🌿 **Banner novo** com arte temática.

---

## 🔧 Se algo der errado

- **O site não abre / erro de conexão:** confira se a variável `HOST` está como
  `0.0.0.0` e se o deploy terminou com sucesso.
- **As fotos somem após um tempo:** o Volume (Passo 4) não foi criado ou o
  `STORAGE_DIR` está diferente do Mount Path. Os dois têm que ser `/data`.
- **Esqueci a senha do dono:** basta mudar o valor de `OWNER_PASS` nas Variables
  (funciona enquanto a conta de dono já existe? Não — a conta de dono é criada
  só uma vez). Se precisar recriar, apague os arquivos JSON dentro do Volume.

Qualquer dúvida em algum passo, me chama que eu te ajudo! 😊
