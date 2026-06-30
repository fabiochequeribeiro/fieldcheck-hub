# Central de Produto - estrutura Supabase sugerida

Nao executar automaticamente em producao sem revisar RLS e permissoes.

```sql
create table if not exists public.hub_ideias (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  titulo text not null,
  descricao text not null,
  categoria text not null,
  prioridade text not null,
  status text not null default 'Ideia',
  versao text,
  sprint text,
  responsavel text,
  origem text,
  impacto text,
  esforco text,
  valor_cliente text,
  dependencias jsonb default '[]'::jsonb,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  observacoes text,
  empresa_id uuid,
  anexos jsonb default '[]'::jsonb,
  timeline jsonb default '[]'::jsonb,
  codex_prompt text,
  pull_requests jsonb default '[]'::jsonb,
  commits jsonb default '[]'::jsonb,
  branch text,
  builds jsonb default '[]'::jsonb,
  apk text,
  releases jsonb default '[]'::jsonb
);

create index if not exists hub_ideias_status_idx on public.hub_ideias(status);
create index if not exists hub_ideias_prioridade_idx on public.hub_ideias(prioridade);
create index if not exists hub_ideias_categoria_idx on public.hub_ideias(categoria);
create index if not exists hub_ideias_empresa_idx on public.hub_ideias(empresa_id);
create index if not exists hub_ideias_sprint_idx on public.hub_ideias(sprint);
```

RLS sugerido:

- Somente `super_admin` deve visualizar e alterar registros inicialmente.
- Clientes e empresas comuns nao devem receber permissao de select.
- Futuramente, permitir leitura filtrada por `empresa_id` apenas se a ideia virar demanda compartilhada.
