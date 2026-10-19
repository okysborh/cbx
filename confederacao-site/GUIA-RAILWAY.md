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

## Passo 4 — ⚠️ IMPORTANTE: armazenamento permanente (Volume)

Sem isso, **toda vez que o site reiniciar, as fotos, vídeos e contas somem!**
Para guardar tudo de verdade, adicione um "Volume":

1. No seu serviço, clique com o botão direito (ou no menu **+**) e escolha
   **Add Volume** (adicionar volume).
2. No campo de caminho (**Mount Path**), coloque exatamente: `/data`
3. Confirme. (Esse `/data` é o mesmo valor que você pôs em `STORAGE_DIR`.)

Agora fotos, vídeos e cadastros ficam salvos de forma permanente. ✅

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

## 🔧 Se algo der errado

- **O site não abre / erro de conexão:** confira se a variável `HOST` está como
  `0.0.0.0` e se o deploy terminou com sucesso.
- **As fotos somem após um tempo:** o Volume (Passo 4) não foi criado ou o
  `STORAGE_DIR` está diferente do Mount Path. Os dois têm que ser `/data`.
- **Esqueci a senha do dono:** basta mudar o valor de `OWNER_PASS` nas Variables
  (funciona enquanto a conta de dono já existe? Não — a conta de dono é criada
  só uma vez). Se precisar recriar, apague os arquivos JSON dentro do Volume.

Qualquer dúvida em algum passo, me chama que eu te ajudo! 😊
