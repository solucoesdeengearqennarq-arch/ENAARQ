# ENAARQ – Site e App

## Estrutura (tudo na raiz, para o GitHub enxergar)
- `index.html`, `style.css`, `site.js`, `img/` – site (front-end)
- `server/` – back-end Node.js + Express + SQLite (regras de acesso em `server/routes.js`)
- `scripts/seed-admin.js` – cria o primeiro administrador
- `data/` – banco e documentos enviados (**nunca vai ao Git**)

## Rodar localmente
```bash
npm install
cp .env.example .env     # preencha JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run seed:admin
npm start                # http://localhost:3000
```

## Publicar no Render (passo a passo)
1. Rode `npm install` uma vez e envie também o `package-lock.json` ao GitHub.
2. No Render: **New → Blueprint**, escolha este repositório privado (usa o `render.yaml`).
3. Preencha `ADMIN_EMAIL` e `ADMIN_PASSWORD` (mín. 12 caracteres) quando o Render pedir. `JWT_SECRET` é gerado sozinho.
4. Faça o deploy, abra o endereço `https://enaarq.onrender.com` (ou o que o Render indicar) e entre com esse e-mail.
5. **Depois do primeiro acesso, apague `ADMIN_PASSWORD` das variáveis do Render.**
6. Conecte seu domínio em Settings → Custom Domains (HTTPS automático).
- O plano gratuito não tem disco persistente: os dados seriam perdidos a cada deploy. Use plano pago com o disco do `render.yaml`.
- Faça backup periódico do disco (snapshots do Render) e, para crescer, migre para PostgreSQL.
- O GitHub Pages não serve para a parte de contas (só páginas estáticas).

## Como funciona o banco de dados (data/enaarq.db)
| Tabela | Guarda |
|---|---|
| `usuarios` | nome, e-mail, senha criptografada, perfil (cliente, colaborador, ti, adm), cargo, "atende clientes", ativo |
| `solicitacoes` | pedidos de serviço dos clientes, status e devolutiva da equipe |
| `obras` | obras/serviços da empresa |
| `membros` | liga colaborador a obra com um papel: líder, membro ou leitura |
| `documentos` | registro dos arquivos (os arquivos ficam em `data/uploads`, com nome aleatório) |
| `auditoria` | quem fez o quê, quando e de qual IP |

## Contas e acessos
- **Cliente:** cria a própria conta no site (e-mail e senha). Vê só as próprias solicitações.
- **Equipe:** NINGUÉM se cadastra sozinho como equipe. ADM/TI criam a conta em Equipe → Administração (perfil, cargo, "atende clientes") e vinculam à obra.
- **ADM e TI:** acesso total (usuários, obras, equipes, solicitações, documentos).
- **Por obra:** líder controla a obra e valida documentos; membro envia documentos; leitura só consulta.
- **Delegação:** o líder concede ou remove acessos de membro/leitura na própria obra (aba Equipe da obra). Só ADM/TI nomeiam líderes. Cada pessoa só concede acessos abaixo do seu nível.
- As regras são checadas no servidor a cada requisição; esconder botões no site não é a proteção.

## Segurança implementada
Senhas bcrypt (custo 12) · cookie HttpOnly + SameSite=Strict (+Secure em produção) · proteção CSRF · bloqueio após 5 falhas e limite de requisições · validação (zod) e SQL parametrizado · CSP e cabeçalhos (helmet) · uploads de até 10 MB com tipo checado pelo conteúdo · auditoria · erros genéricos.

## Ainda falta
Recuperação de senha por e-mail · 2FA · testes automáticos · política de privacidade (LGPD) · revisão de segurança antes de usar dados reais.
