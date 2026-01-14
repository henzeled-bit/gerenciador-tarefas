# 🚀 Guia de Deploy - Netlify

Este guia irá ajudá-lo a fazer o deploy do Gerenciador de Tarefas no Netlify.

## Pré-requisitos

- Conta no [Netlify](https://netlify.com)
- Conta no [GitHub](https://github.com) (recomendado)
- Supabase já configurado (conforme especificado no projeto)

## Método 1: Deploy via Netlify CLI (Recomendado)

### Passo 1: Instalar o Netlify CLI

```bash
npm install -g netlify-cli
```

### Passo 2: Fazer login no Netlify

```bash
netlify login
```

Isso abrirá o navegador para você autorizar o CLI.

### Passo 3: Navegar até a pasta do projeto

```bash
cd gerenciador-tarefas
```

### Passo 4: Instalar dependências

```bash
npm install
```

### Passo 5: Fazer build local (teste)

```bash
npm run build
```

Se o build funcionar sem erros, prossiga para o deploy.

### Passo 6: Inicializar o projeto no Netlify

```bash
netlify init
```

Siga as instruções:
1. Escolha "Create & configure a new site"
2. Escolha sua equipe/team
3. Digite um nome único para o site (ex: gerenciador-tarefas-sua-empresa)
4. Build command: `npm run build`
5. Directory to deploy: `dist`

### Passo 7: Deploy em produção

```bash
netlify deploy --prod
```

Pronto! Seu site estará no ar em alguns segundos.

### Passo 8: Obter a URL

```bash
netlify open
```

Isso abrirá o dashboard do Netlify onde você verá a URL do seu site.

## Método 2: Deploy via Interface Web do Netlify

### Passo 1: Criar repositório no GitHub

1. Acesse [GitHub](https://github.com)
2. Crie um novo repositório
3. Clone para sua máquina:

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
```

4. Copie todos os arquivos do projeto para a pasta do repositório
5. Commit e push:

```bash
git add .
git commit -m "Initial commit - Gerenciador de Tarefas"
git push origin main
```

### Passo 2: Conectar no Netlify

1. Acesse [netlify.com](https://netlify.com)
2. Clique em "Add new site" → "Import an existing project"
3. Escolha "Deploy with GitHub"
4. Autorize o Netlify a acessar seus repositórios
5. Selecione o repositório que você criou

### Passo 3: Configurar Build Settings

Preencha os campos:
- **Branch to deploy**: main (ou master)
- **Build command**: `npm run build`
- **Publish directory**: `dist`

### Passo 4: Deploy

Clique em "Deploy site"

O Netlify irá:
1. Clonar seu repositório
2. Instalar dependências (`npm install`)
3. Executar o build (`npm run build`)
4. Publicar a pasta `dist`

### Passo 5: Configurar Domínio (Opcional)

1. No dashboard do Netlify, vá em "Domain settings"
2. Clique em "Add custom domain"
3. Digite seu domínio
4. Configure os DNS conforme as instruções

## Método 3: Deploy Manual via Drag & Drop

### Passo 1: Build local

```bash
cd gerenciador-tarefas
npm install
npm run build
```

### Passo 2: Fazer deploy

1. Acesse [netlify.com](https://netlify.com)
2. Clique em "Add new site" → "Deploy manually"
3. Arraste a pasta `dist` para a área de upload
4. Aguarde o deploy

## Configurações Adicionais

### Variáveis de Ambiente (Se necessário)

Se você decidir usar variáveis de ambiente no futuro:

1. No dashboard do Netlify, vá em "Site settings"
2. Clique em "Environment variables"
3. Adicione as variáveis necessárias

Exemplo:
```
VITE_SUPABASE_URL=https://pjxvvhtsinqzjieiraff.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_zIG8mavtXJxutTUQp5PlUg_LHwMun9I
```

E no código, use:
```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

### Configurar Redirects

O arquivo `netlify.toml` já está configurado para SPA (Single Page Application):

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Isso garante que as rotas do React funcionem corretamente.

### Configurar Deploy Contínuo

Se você usou o Método 2 (GitHub):

1. Toda vez que fizer push para o branch `main`
2. O Netlify automaticamente fará um novo deploy
3. Você receberá notificações por email

## Verificação Pós-Deploy

### 1. Testar Login

Acesse o site e tente fazer login com:
- Um usuário admin
- Um usuário comum

### 2. Testar Funcionalidades Admin

- Criar tarefas
- Editar tarefas
- Excluir tarefas
- Ver painel admin
- Exportar Excel

### 3. Testar Funcionalidades Usuário

- Ver apenas suas tarefas
- Concluir tarefas
- Adicionar justificativas

## Troubleshooting

### Erro: "Failed to compile"

**Solução:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### Erro: "Page not found" em rotas

**Solução:** Verifique se o arquivo `netlify.toml` existe e tem a configuração de redirect.

### Erro: Supabase connection failed

**Solução:** 
1. Verifique as credenciais em `src/lib/supabase.js`
2. Confirme que o projeto Supabase está ativo
3. Teste a conexão localmente primeiro

### Erro: RLS policies not working

**Solução:**
1. Acesse o Supabase Dashboard
2. Vá em "Authentication" → "Policies"
3. Verifique se as policies estão ativas
4. Execute as queries do arquivo `supabase-setup.sql`

## Logs e Monitoramento

### Ver Logs de Deploy

1. No dashboard do Netlify
2. Clique em "Deploys"
3. Clique em um deploy específico
4. Veja os logs detalhados

### Ver Logs de Funções (se aplicável)

1. No dashboard do Netlify
2. Vá em "Functions"
3. Clique na função
4. Veja os logs em tempo real

## Performance

### Otimizações Automáticas do Netlify

O Netlify aplica automaticamente:
- ✅ Compressão Gzip/Brotli
- ✅ CDN global
- ✅ Cache inteligente
- ✅ Minificação de assets
- ✅ HTTPS automático

### Cache Headers

Se quiser configurar cache customizado, adicione no `netlify.toml`:

```toml
[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## Rollback

Se algo der errado após um deploy:

1. No dashboard do Netlify
2. Vá em "Deploys"
3. Encontre o deploy anterior que funcionava
4. Clique nos três pontos (...)
5. Clique em "Publish deploy"

## Domínio Customizado

### Adicionar Domínio

1. No dashboard do Netlify
2. Vá em "Domain settings"
3. Clique em "Add domain alias"
4. Digite seu domínio (ex: tarefas.suaempresa.com.br)

### Configurar DNS

**Opção 1: Usar Netlify DNS**
1. Transfira os nameservers para o Netlify
2. Netlify gerenciará todo o DNS

**Opção 2: Configurar manualmente**
1. Adicione um registro CNAME:
   - Name: `tarefas` (ou `www`)
   - Value: `seu-site.netlify.app`

## Segurança

### HTTPS

- HTTPS é automático no Netlify
- Certificados SSL são gratuitos (Let's Encrypt)
- Renovação automática

### Headers de Segurança

Adicione no `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

## Custos

- **Free Tier**: 100GB bandwidth/mês
- **Build minutes**: 300 minutos/mês
- Normalmente suficiente para pequenas equipes

Se precisar de mais, veja os planos pagos.

## Suporte

- Documentação: https://docs.netlify.com
- Community: https://answers.netlify.com
- Status: https://netlifystatus.com

## Checklist Final

Antes de considerar o deploy completo:

- [ ] Site acessível via HTTPS
- [ ] Login funcionando
- [ ] Admin pode criar tarefas
- [ ] Usuário pode ver apenas suas tarefas
- [ ] Conclusão de tarefas funciona
- [ ] Justificativas sendo salvas
- [ ] Painel admin carregando
- [ ] Gráficos renderizando
- [ ] Exportação Excel funcionando
- [ ] Interface responsiva em mobile
- [ ] Performance satisfatória (< 3s de carregamento)

## Próximos Passos

Após o deploy:
1. Teste com usuários reais
2. Colete feedback
3. Monitore erros (considere integrar Sentry)
4. Configure alertas de uptime
5. Documente processos para a equipe

---

**Parabéns! 🎉 Seu sistema está no ar!**
