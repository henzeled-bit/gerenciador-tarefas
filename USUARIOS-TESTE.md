# 👥 Como Criar Usuários para Testes

Este guia explica como criar usuários admin e comum para testar o sistema.

## Método 1: Via Supabase Dashboard (Recomendado)

### Criar Usuário Admin

1. **Acesse o Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Login com sua conta

2. **Selecione seu projeto**
   - Clique no projeto: pjxvvhtsinqzjieiraff

3. **Ir para Authentication**
   - Menu lateral → Authentication → Users

4. **Criar novo usuário**
   - Clique em "Add user" → "Create new user"
   - Preencha:
     - Email: `admin@teste.com`
     - Password: `Admin@123` (ou uma senha forte)
     - Auto Confirm User: ✅ (marcar)
   - Clique em "Create user"

5. **Anotar o UUID do usuário**
   - Na lista de usuários, copie o UUID do admin (ex: `123e4567-e89b-12d3-a456-426614174000`)

6. **Criar perfil admin**
   - Menu lateral → Table Editor → profiles
   - Clique em "Insert" → "Insert row"
   - Preencha:
     - id: (cole o UUID copiado)
     - nome: `Administrador`
     - role: `admin`
     - created_at: (deixe o padrão ou coloque a data atual)
   - Clique em "Save"

### Criar Usuário Comum

Repita o processo acima, mas com:
- Email: `usuario@teste.com`
- Password: `Usuario@123`
- role: `user`
- nome: `Usuário Teste`

## Método 2: Via SQL Editor

### Passo 1: Criar o usuário no Auth

No Supabase Dashboard → SQL Editor, execute:

```sql
-- Criar usuário admin
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@teste.com',
  crypt('Admin@123', gen_salt('bf')),
  NOW(),
  '{"nome": "Administrador"}',
  NOW(),
  NOW()
);
```

### Passo 2: Criar o perfil

```sql
-- Buscar o ID do usuário criado
SELECT id, email FROM auth.users WHERE email = 'admin@teste.com';

-- Criar perfil admin (substitua o UUID pelo retornado acima)
INSERT INTO public.profiles (id, nome, role, created_at)
VALUES (
  'UUID-DO-USUARIO',  -- Substitua aqui
  'Administrador',
  'admin',
  NOW()
);
```

## Método 3: Usar Trigger Automático (Recomendado)

Se você configurou o trigger `handle_new_user()` do arquivo `supabase-setup.sql`, basta criar o usuário e o perfil será criado automaticamente!

### Criar Admin

```sql
-- Via SQL Editor, crie o usuário com metadados
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@teste.com',
  crypt('Admin@123', gen_salt('bf')),
  NOW(),
  '{"nome": "Administrador", "role": "admin"}',  -- Importante!
  NOW(),
  NOW()
);
```

O trigger criará automaticamente o perfil com role `admin`.

## Método 4: Via API Supabase (Programático)

Se você tiver acesso à Service Role Key (NUNCA use no frontend):

```javascript
// Script Node.js para criar usuários
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://pjxvvhtsinqzjieiraff.supabase.co'
const supabaseServiceKey = 'SUA_SERVICE_ROLE_KEY_AQUI'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdmin() {
  // 1. Criar usuário
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'admin@teste.com',
    password: 'Admin@123',
    email_confirm: true,
    user_metadata: {
      nome: 'Administrador'
    }
  })

  if (authError) {
    console.error('Erro ao criar usuário:', authError)
    return
  }

  console.log('Usuário criado:', authData.user.id)

  // 2. Criar perfil
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([
      {
        id: authData.user.id,
        nome: 'Administrador',
        role: 'admin'
      }
    ])

  if (profileError) {
    console.error('Erro ao criar perfil:', profileError)
    return
  }

  console.log('Admin criado com sucesso!')
}

createAdmin()
```

## Dados de Teste Completos

### Usuários Sugeridos

| Email | Senha | Role | Nome |
|-------|-------|------|------|
| admin@teste.com | Admin@123 | admin | Administrador |
| usuario1@teste.com | User@123 | user | João Silva |
| usuario2@teste.com | User@123 | user | Maria Santos |
| usuario3@teste.com | User@123 | user | Pedro Costa |

### Tarefas de Teste

Após criar os usuários, você pode criar tarefas de teste via SQL:

```sql
-- Buscar IDs dos usuários
SELECT id, email, nome FROM profiles;

-- Criar tarefas (substitua os UUIDs)
INSERT INTO tarefas (descricao, responsavel, prazo_data, prazo_hora, status, created_by)
VALUES
  ('Revisar relatório mensal', 'João Silva', CURRENT_DATE + 2, '17:00', 'pendente', 'UUID-DO-ADMIN'),
  ('Enviar documentos para cliente X', 'Maria Santos', CURRENT_DATE + 5, NULL, 'pendente', 'UUID-DO-ADMIN'),
  ('Fazer backup do sistema', 'Pedro Costa', CURRENT_DATE - 1, '09:00', 'pendente', 'UUID-DO-ADMIN'),
  ('Atualizar base de dados', 'João Silva', CURRENT_DATE, '14:00', 'em_andamento', 'UUID-DO-ADMIN'),
  ('Preparar apresentação', 'Maria Santos', CURRENT_DATE + 7, '15:30', 'pendente', 'UUID-DO-ADMIN');
```

## Testando o Sistema

### Teste 1: Login Admin

1. Acesse o site
2. Login: `admin@teste.com`
3. Senha: `Admin@123`
4. Verifique se aparece "(Administrador)" ao lado do nome
5. Verifique se a aba "Painel Admin" está visível

### Teste 2: Login Usuário

1. Acesse o site (nova aba anônima)
2. Login: `usuario1@teste.com`
3. Senha: `User@123`
4. Verifique se vê apenas suas tarefas
5. Verifique que não há aba "Painel Admin"

### Teste 3: Criar Tarefa (Admin)

1. Login como admin
2. Aba "Tarefas Ativas"
3. Clique em "+ Nova Tarefa"
4. Preencha e salve
5. Verifique se a tarefa aparece na lista

### Teste 4: Concluir Tarefa (Usuário)

1. Login como usuário
2. Aba "Tarefas Ativas"
3. Clique em "Concluir" em uma tarefa
4. Se atrasada, adicione justificativa
5. Verifique se vai para "Arquivadas"

### Teste 5: Painel Admin

1. Login como admin
2. Aba "Painel Admin"
3. Verifique estatísticas
4. Verifique gráficos
5. Teste exportação Excel

## Troubleshooting

### Erro: "User already registered"

**Solução:** O email já está em uso. Use outro email ou delete o usuário existente:

```sql
-- Deletar usuário e perfil
DELETE FROM auth.users WHERE email = 'admin@teste.com';
DELETE FROM profiles WHERE nome = 'Administrador';
```

### Erro: "Invalid login credentials"

**Causas possíveis:**
1. Senha incorreta
2. Email não confirmado
3. Usuário não existe

**Solução:**
```sql
-- Verificar se o usuário existe e está confirmado
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'admin@teste.com';

-- Se email_confirmed_at for NULL, confirme manualmente:
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'admin@teste.com';
```

### Erro: "Profile not found"

**Solução:** O perfil não foi criado. Crie manualmente:

```sql
-- Buscar ID do usuário
SELECT id FROM auth.users WHERE email = 'admin@teste.com';

-- Criar perfil
INSERT INTO profiles (id, nome, role, created_at)
VALUES ('UUID-DO-USUARIO', 'Administrador', 'admin', NOW());
```

### Erro: RLS não permite acesso

**Solução:** Verifique as policies:

```sql
-- Listar policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Se não existirem, execute o arquivo supabase-setup.sql
```

## Resetar Dados de Teste

Para limpar tudo e começar de novo:

```sql
-- CUIDADO: Isso deleta TODOS os dados!

-- Deletar todas as tarefas
DELETE FROM tarefas;

-- Deletar todos os perfis (exceto o seu principal)
DELETE FROM profiles WHERE email != 'seu-email@real.com';

-- Deletar todos os usuários do auth (exceto o seu principal)
DELETE FROM auth.users WHERE email != 'seu-email@real.com';
```

## Dicas

1. **Use emails descritivos** para facilitar testes
2. **Documente as senhas** em um local seguro
3. **Confirme emails** automaticamente ao criar usuários de teste
4. **Crie vários usuários** para testar diferentes cenários
5. **Use dados realistas** para tarefas de teste

## Segurança em Produção

⚠️ **IMPORTANTE:**

- Nunca use senhas fracas em produção
- Nunca compartilhe credenciais de teste com usuários reais
- Delete usuários de teste antes de ir para produção
- Use senhas complexas e únicas
- Habilite autenticação de dois fatores (2FA) se disponível

---

**Pronto para testar! 🚀**
