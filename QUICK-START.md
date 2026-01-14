# ⚡ Quick Start - Gerenciador de Tarefas

## 🚀 Início Rápido (5 minutos)

### 1️⃣ Instalar e Rodar

```bash
# Entrar na pasta
cd gerenciador-tarefas

# Instalar dependências
npm install

# Iniciar em modo desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

### 2️⃣ Criar Usuário de Teste

**Via Supabase Dashboard:**

1. Acesse: https://supabase.com/dashboard
2. Selecione o projeto: `pjxvvhtsinqzjieiraff`
3. Menu: **Authentication** → **Users** → **Add user**
4. Preencha:
   - Email: `admin@teste.com`
   - Password: `Admin@123`
   - Auto Confirm: ✅
5. Clique em **Create user**
6. Copie o **UUID** do usuário criado
7. Menu: **Table Editor** → **profiles** → **Insert row**
8. Preencha:
   - id: (cole o UUID)
   - nome: `Admin Teste`
   - role: `admin`
9. Salvar

### 3️⃣ Fazer Login

No navegador (http://localhost:3000):
- Email: `admin@teste.com`
- Senha: `Admin@123`

### 4️⃣ Testar Funcionalidades

1. **Criar Tarefa** (botão "+ Nova Tarefa")
2. **Ver Painel Admin** (aba "Painel Admin")
3. **Exportar Excel** (botão verde no painel)

---

## 📚 Documentação Completa

- **README.md** → Documentação técnica completa
- **DEPLOY.md** → Como fazer deploy no Netlify
- **USUARIOS-TESTE.md** → Criar mais usuários de teste
- **EXECUTIVO.md** → Visão executiva do projeto
- **supabase-setup.sql** → Configuração do banco

---

## 🎯 Estrutura de Perfis

### Admin pode:
- ✅ Criar, editar e excluir tarefas
- ✅ Ver todas as tarefas
- ✅ Acessar painel com estatísticas
- ✅ Ver gráficos
- ✅ Exportar Excel
- ✅ Filtrar por responsável

### Usuário pode:
- ✅ Ver apenas suas tarefas
- ✅ Marcar como concluída
- ✅ Adicionar justificativa se atrasada
- ❌ Não pode criar/editar/excluir

---

## 🐛 Problemas Comuns

### ❌ "npm: command not found"
**Solução:** Instale o Node.js de https://nodejs.org

### ❌ "Invalid login credentials"
**Solução:** 
1. Verifique email/senha
2. Confirme o email no Supabase Dashboard
3. Verifique se o perfil foi criado

### ❌ "RLS policy violation"
**Solução:** Execute as queries do arquivo `supabase-setup.sql`

---

## 🚀 Deploy Rápido (Netlify CLI)

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify init
netlify deploy --prod
```

Pronto! Seu site estará no ar.

---

## 📦 Estrutura do Projeto

```
gerenciador-tarefas/
├── src/
│   ├── components/       → Componentes React
│   ├── hooks/           → Hooks customizados
│   ├── lib/             → Configurações (Supabase)
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── vite.config.js
├── tailwind.config.js
├── netlify.toml
└── Documentação/
    ├── README.md
    ├── DEPLOY.md
    ├── USUARIOS-TESTE.md
    └── EXECUTIVO.md
```

---

## 🔑 Credenciais do Supabase

**Já configuradas no código:**
- URL: `https://pjxvvhtsinqzjieiraff.supabase.co`
- Key: `sb_publishable_zIG8mavtXJxutTUQp5PlUg_LHwMun9I`

Não é necessário configurar variáveis de ambiente.

---

## ✅ Checklist Inicial

- [ ] Node.js instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Servidor rodando (`npm run dev`)
- [ ] Usuário admin criado
- [ ] Login funcionando
- [ ] Tarefa criada com sucesso
- [ ] Painel admin acessível
- [ ] Exportação Excel funcionando

---

## 📞 Próximos Passos

1. ✅ **Testar localmente** (já funcionando!)
2. 📖 **Ler documentação completa** (README.md)
3. 🚀 **Fazer deploy** (DEPLOY.md)
4. 👥 **Criar mais usuários** (USUARIOS-TESTE.md)
5. 🎨 **Customizar** (cores, textos, etc)

---

**Pronto para produção! 🎉**
