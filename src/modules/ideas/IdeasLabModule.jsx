import { useMemo, useState } from 'react';
import {
  Beaker,
  BookOpen,
  CheckCircle2,
  Code2,
  GitBranch,
  History,
  Link2,
  Package,
  Plus,
  Rocket,
  Search,
  Sparkles,
  Star,
  TestTube2,
  Wrench,
} from 'lucide-react';
import { ProductFlow, ProductKpi, ProductTabs, ProductTimeline } from './ProductCenterComponents';

const CATEGORIES = ['Produto', 'Hub', 'Aplicativo', 'IA', 'Comercial', 'Financeiro', 'Marketing', 'CRM', 'Marketplace', 'Infraestrutura', 'Cliente', 'Bug', 'Melhoria', 'Nova Funcionalidade'];
const PRIORITIES = ['Critica', 'Alta', 'Media', 'Baixa'];
const ORIGINS = ['ChatGPT', 'Codex', 'Fabio', 'Cliente', 'Equipe', 'Outro'];
const RESPONSIBLES = ['Fabio', 'Produto', 'Mobile', 'Hub', 'IA', 'Comercial', 'Financeiro', 'Marketing'];
const IMPACTS = ['Baixo', 'Medio', 'Alto', 'Estrategico'];
const EFFORTS = ['1 hora', '4 horas', '1 dia', '3 dias', '1 semana', 'Grande Projeto'];
const CUSTOMER_VALUES = ['★', '★★', '★★★', '★★★★', '★★★★★'];
const OFFICIAL_FLOW = ['IDEIA', 'ANALISE', 'APROVADA', 'PROMPT CODEX', 'DESENVOLVIMENTO', 'TESTES', 'PUBLICACAO', 'RELEASE', 'CONCLUIDA'];

const INITIAL_IDEAS = [
  {
    id: 'idea-0001',
    codigo: 'IDEIA-0001',
    titulo: 'Resumo Inteligente IA',
    descricao: 'Gerar resumo tecnico, executivo e comercial a partir da visita finalizada.',
    categoria: 'IA',
    prioridade: 'Alta',
    status: 'APROVADA',
    versao: '1.3',
    sprint: 'Sprint 02',
    responsavel: 'Fabio',
    origem: 'ChatGPT',
    impacto: 'Estrategico',
    esforco: '3 dias',
    valorCliente: '★★★★★',
    dependencias: 'APP-001',
    criado_em: '2026-06-30',
    atualizado_em: '2026-06-30',
    observacoes: 'Manter modo manual funcionando mesmo sem IA real.',
    promptCodex: '',
    pullRequest: '',
    commit: '',
    branch: 'feature/ideia-0001-resumo-ia',
    build: '',
    apk: '',
    release: '',
    documentacao: '',
    timeline: [
      { date: '30/06', title: 'Criada', description: 'Ideia registrada na Central de Produto.' },
      { date: '01/07', title: 'Aprovada', description: 'Priorizada pelo Hub Master.' },
    ],
  },
  {
    id: 'idea-0002',
    codigo: 'IDEIA-0002',
    titulo: 'Controle de Trial por Empresa',
    descricao: 'Bloquear acesso operacional apos o teste e preservar dados para reativacao.',
    categoria: 'Produto',
    prioridade: 'Critica',
    status: 'DESENVOLVIMENTO',
    versao: '1.0',
    sprint: 'Sprint 01',
    responsavel: 'Produto',
    origem: 'Fabio',
    impacto: 'Estrategico',
    esforco: '1 semana',
    valorCliente: '★★★★★',
    dependencias: '',
    criado_em: '2026-06-30',
    atualizado_em: '2026-06-30',
    observacoes: 'Precisa consultar Supabase para evitar burla por data local.',
    promptCodex: 'Implementar trial access service com Supabase e bloqueio seguro.',
    pullRequest: '',
    commit: '',
    branch: 'feature/trial-access',
    build: '',
    apk: '',
    release: '',
    documentacao: '',
    timeline: [
      { date: '30/06', title: 'Criada', description: 'Necessidade definida para beta de clientes reais.' },
      { date: '30/06', title: 'Prompt Codex', description: 'Prompt tecnico estruturado.' },
      { date: '30/06', title: 'Codex iniciou', description: 'Arquitetura preparada no aplicativo.' },
    ],
  },
  {
    id: 'idea-0003',
    codigo: 'IDEIA-0003',
    titulo: 'Central de Produto FieldCheck',
    descricao: 'Criar historico completo de ideias, sprints, prompts, commits, builds e releases.',
    categoria: 'Hub',
    prioridade: 'Alta',
    status: 'TESTES',
    versao: 'Hub 1.0',
    sprint: 'Sprint 01',
    responsavel: 'Hub',
    origem: 'Fabio',
    impacto: 'Estrategico',
    esforco: '3 dias',
    valorCliente: '★★★★',
    dependencias: '',
    criado_em: '2026-06-30',
    atualizado_em: '2026-06-30',
    observacoes: 'Modulo exclusivo do Hub Master para super admins.',
    promptCodex: 'Criar modulo permanente Central de Produto no FieldCheck Hub.',
    pullRequest: '',
    commit: '',
    branch: 'feature/product-center',
    build: '',
    apk: '',
    release: '',
    documentacao: 'docs/HUB_IDEIAS_SQL.md',
    timeline: [
      { date: '30/06', title: 'Criada', description: 'Ideia nasceu durante organizacao da versao oficial 1.0.' },
      { date: '30/06', title: 'Sprint', description: 'Adicionada a sprint ativa do Hub Master.' },
      { date: '30/06', title: 'Em testes', description: 'Modulo validado em build local.' },
    ],
  },
];

const EMPTY_FORM = {
  titulo: '',
  descricao: '',
  categoria: 'Produto',
  prioridade: 'Alta',
  status: 'IDEIA',
  versao: '',
  sprint: '',
  responsavel: 'Fabio',
  origem: 'Fabio',
  impacto: 'Alto',
  esforco: '1 dia',
  valorCliente: '★★★★',
  dependencias: '',
  criado_em: new Date().toISOString().slice(0, 10),
  observacoes: '',
};

function nextIdeaCode(ideas) {
  const max = ideas.reduce((current, item) => Math.max(current, Number(String(item.codigo || '').replace(/\D/g, '')) || 0), 0);
  return `IDEIA-${String(max + 1).padStart(4, '0')}`;
}

function normalize(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function badgeClass(type, value) {
  return `lab-badge ${type}-${normalize(value).replace(/\s+/g, '-')}`;
}

function todayLabel() {
  return new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function buildCodexPrompt(idea) {
  return `# ${idea.codigo} - ${idea.titulo}

Objetivo:
${idea.titulo}

Descricao:
${idea.descricao}

Regras:
- Manter identidade visual atual do FieldCheck Hub.
- Nao remover funcionalidades existentes.
- Respeitar acesso exclusivo do Hub Master quando aplicavel.
- Preparar arquitetura para Supabase, GitHub e IA sem expor chaves no frontend.

Arquivos envolvidos:
- src/modules/ideas/
- src/App.jsx
- src/App.css
- docs/HUB_IDEIAS_SQL.md

Criterios de aceite:
- Fluxo oficial preservado: ${OFFICIAL_FLOW.join(' -> ')}.
- Busca e filtros continuam funcionando.
- Historico da funcionalidade mostra codigo permanente ${idea.codigo}.
- Build deve passar com npm run build.

Testes esperados:
- Criar ideia.
- Gerar prompt.
- Enviar para sprint.
- Avancar etapa sem pular fluxo.
- Marcar como publicada com versao e responsavel.

Observacoes:
Prioridade ${idea.prioridade}, impacto ${idea.impacto}, esforco ${idea.esforco}, valor para cliente ${idea.valorCliente}.
${idea.observacoes || ''}`;
}

function Field({ label, required, children }) {
  return <label className="lab-field"><span>{label}{required ? ' *' : ''}</span>{children}</label>;
}

function SelectField({ label, value, options, onChange }) {
  return (
    <Field label={label}>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </Field>
  );
}

export default function IdeasLabModule() {
  const [ideas, setIdeas] = useState(INITIAL_IDEAS);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [query, setQuery] = useState('');
  const [activePanel, setActivePanel] = useState('ideias');
  const [publishIdea, setPublishIdea] = useState(null);
  const [publishForm, setPublishForm] = useState({ versao: '', responsavel: 'Fabio', observacoes: '' });
  const [filters, setFilters] = useState({ categoria: 'Todas', prioridade: 'Todas', status: 'Todos', versao: '', responsavel: 'Todos', origem: 'Todas' });

  const stats = useMemo(() => ({
    ideias: ideas.length,
    sprint: ideas.filter((item) => item.status === 'APROVADA' || item.status === 'PROMPT CODEX').length,
    prompts: ideas.filter((item) => item.promptCodex).length,
    desenvolvimento: ideas.filter((item) => item.status === 'DESENVOLVIMENTO').length,
    testes: ideas.filter((item) => item.status === 'TESTES').length,
    publicadas: ideas.filter((item) => item.status === 'PUBLICACAO' || item.status === 'RELEASE').length,
    concluidas: ideas.filter((item) => item.status === 'CONCLUIDA').length,
    media: '4,2 dias',
  }), [ideas]);

  const tabs = [
    { id: 'ideias', label: 'Ideias', icon: Sparkles, count: stats.ideias },
    { id: 'sprint', label: 'Sprint', icon: Rocket, count: stats.sprint },
    { id: 'prompts', label: 'Prompts Codex', icon: Code2, count: stats.prompts },
    { id: 'dev', label: 'Desenvolvimento', icon: Wrench, count: stats.desenvolvimento },
    { id: 'testes', label: 'Testes', icon: TestTube2, count: stats.testes },
    { id: 'publicacoes', label: 'Publicacoes', icon: Rocket, count: stats.publicadas },
    { id: 'releases', label: 'Releases', icon: Package, count: stats.publicadas },
    { id: 'historico', label: 'Historico', icon: History, count: stats.ideias },
  ];

  const filteredIdeas = useMemo(() => {
    const text = normalize(query);
    return ideas.filter((idea) => {
      const haystack = normalize(`${idea.codigo} ${idea.titulo} ${idea.descricao} ${idea.categoria} ${idea.responsavel} ${idea.versao} ${idea.sprint} ${idea.status}`);
      if (text && !haystack.includes(text)) return false;
      if (filters.categoria !== 'Todas' && idea.categoria !== filters.categoria) return false;
      if (filters.prioridade !== 'Todas' && idea.prioridade !== filters.prioridade) return false;
      if (filters.status !== 'Todos' && idea.status !== filters.status) return false;
      if (filters.versao && !normalize(idea.versao).includes(normalize(filters.versao))) return false;
      if (filters.responsavel !== 'Todos' && idea.responsavel !== filters.responsavel) return false;
      if (filters.origem !== 'Todas' && idea.origem !== filters.origem) return false;
      if (activePanel === 'sprint' && !['APROVADA', 'PROMPT CODEX'].includes(idea.status)) return false;
      if (activePanel === 'prompts' && !idea.promptCodex) return false;
      if (activePanel === 'dev' && idea.status !== 'DESENVOLVIMENTO') return false;
      if (activePanel === 'testes' && idea.status !== 'TESTES') return false;
      if (activePanel === 'publicacoes' && !['PUBLICACAO', 'RELEASE'].includes(idea.status)) return false;
      if (activePanel === 'releases' && !['RELEASE', 'CONCLUIDA'].includes(idea.status)) return false;
      return true;
    });
  }, [ideas, query, filters, activePanel]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function createIdea(event) {
    event.preventDefault();
    const codigo = nextIdeaCode(ideas);
    const created = {
      id: `idea-${Date.now()}`,
      codigo,
      ...form,
      atualizado_em: form.criado_em,
      promptCodex: '',
      pullRequest: '',
      commit: '',
      branch: `feature/${codigo.toLowerCase()}-${normalize(form.titulo).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
      build: '',
      apk: '',
      release: '',
      documentacao: '',
      timeline: [{ date: todayLabel(), title: 'Criada', description: `Ideia registrada por ${form.origem}.` }],
    };
    setIdeas((current) => [created, ...current]);
    setModalOpen(false);
  }

  function advanceIdea(idea, target = null) {
    const currentIndex = OFFICIAL_FLOW.indexOf(idea.status);
    const nextStatus = target || OFFICIAL_FLOW[currentIndex + 1];
    if (!nextStatus || OFFICIAL_FLOW.indexOf(nextStatus) !== currentIndex + 1) return;
    setIdeas((current) => current.map((item) => item.id === idea.id ? {
      ...item,
      status: nextStatus,
      sprint: nextStatus === 'APROVADA' && !item.sprint ? 'Proxima Sprint' : item.sprint,
      atualizado_em: new Date().toISOString().slice(0, 10),
      timeline: [...item.timeline, { date: todayLabel(), title: nextStatus, description: `Etapa atualizada para ${nextStatus}.` }],
    } : item));
  }

  function sendToSprint(idea) {
    if (!['IDEIA', 'ANALISE'].includes(idea.status)) return advanceIdea(idea);
    setIdeas((current) => current.map((item) => item.id === idea.id ? {
      ...item,
      status: 'APROVADA',
      sprint: 'Proxima Sprint',
      atualizado_em: new Date().toISOString().slice(0, 10),
      timeline: [...item.timeline, { date: todayLabel(), title: 'Aprovada', description: 'Enviada para a proxima sprint.' }],
    } : item));
  }

  function generatePrompt(idea) {
    if (idea.status !== 'APROVADA') return;
    const prompt = buildCodexPrompt(idea);
    setIdeas((current) => current.map((item) => item.id === idea.id ? {
      ...item,
      status: 'PROMPT CODEX',
      promptCodex: prompt,
      atualizado_em: new Date().toISOString().slice(0, 10),
      timeline: [...item.timeline, { date: todayLabel(), title: 'Prompt Gerado', description: `Prompt tecnico gerado para ${item.codigo}.` }],
    } : item));
    setActivePanel('prompts');
  }

  function openPublish(idea) {
    setPublishIdea(idea);
    setPublishForm({ versao: idea.versao || '', responsavel: idea.responsavel || 'Fabio', observacoes: '' });
  }

  function publish(event) {
    event.preventDefault();
    setIdeas((current) => current.map((item) => item.id === publishIdea.id ? {
      ...item,
      status: 'PUBLICACAO',
      versao: publishForm.versao || item.versao,
      responsavel: publishForm.responsavel || item.responsavel,
      release: publishForm.versao || item.versao,
      atualizado_em: new Date().toISOString().slice(0, 10),
      observacoes: publishForm.observacoes || item.observacoes,
      timeline: [...item.timeline, { date: todayLabel(), title: 'Publicada', description: `Publicada na versao ${publishForm.versao || item.versao || '-'}.` }],
    } : item));
    setPublishIdea(null);
    setActivePanel('publicacoes');
  }

  return (
    <section className="ideas-lab-page">
      <div className="ideas-lab-hero">
        <div>
          <span className="eyebrow">Hub Master FieldCheck</span>
          <h2>Central de Produto</h2>
          <p>Departamento interno de desenvolvimento: da conversa inicial ate prompt Codex, desenvolvimento, testes, publicacao, release e conclusao.</p>
        </div>
        <button className="primary-button" type="button" onClick={() => { setForm({ ...EMPTY_FORM, criado_em: new Date().toISOString().slice(0, 10) }); setModalOpen(true); }}><Plus size={18} /> Nova Ideia</button>
      </div>

      <div className="ideas-kpi-grid">
        <ProductKpi icon={Sparkles} label="Ideias" value={stats.ideias} />
        <ProductKpi icon={Rocket} label="Sprint ativa" value={stats.sprint} tone="orange" />
        <ProductKpi icon={Code2} label="Prompts gerados" value={stats.prompts} tone="purple" />
        <ProductKpi icon={Wrench} label="Em desenvolvimento" value={stats.desenvolvimento} tone="orange" />
        <ProductKpi icon={Beaker} label="Em testes" value={stats.testes} tone="purple" />
        <ProductKpi icon={CheckCircle2} label="Concluidas" value={stats.concluidas} tone="green" />
        <ProductKpi icon={Rocket} label="Publicadas" value={stats.publicadas} tone="green" />
        <ProductKpi icon={Star} label="Tempo medio" value={stats.media} tone="slate" />
      </div>

      <ProductTabs tabs={tabs} activeTab={activePanel} onChange={setActivePanel} />

      <section className="ideas-lab-toolbar">
        <div className="lab-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar por codigo, titulo, categoria, responsavel, versao, sprint ou status..." /></div>
        <div className="lab-filter-grid">
          <SelectField label="Categoria" value={filters.categoria} options={['Todas', ...CATEGORIES]} onChange={(value) => setFilters((current) => ({ ...current, categoria: value }))} />
          <SelectField label="Prioridade" value={filters.prioridade} options={['Todas', ...PRIORITIES]} onChange={(value) => setFilters((current) => ({ ...current, prioridade: value }))} />
          <SelectField label="Status" value={filters.status} options={['Todos', ...OFFICIAL_FLOW]} onChange={(value) => setFilters((current) => ({ ...current, status: value }))} />
          <Field label="Versao"><input value={filters.versao} onChange={(event) => setFilters((current) => ({ ...current, versao: event.target.value }))} placeholder="Ex.: Hub 1.0" /></Field>
          <SelectField label="Responsavel" value={filters.responsavel} options={['Todos', ...RESPONSIBLES]} onChange={(value) => setFilters((current) => ({ ...current, responsavel: value }))} />
          <SelectField label="Origem" value={filters.origem} options={['Todas', ...ORIGINS]} onChange={(value) => setFilters((current) => ({ ...current, origem: value }))} />
        </div>
      </section>

      <div className="ideas-card-grid">
        {filteredIdeas.map((idea) => (
          <article key={idea.id} className="lab-idea-card product-card">
            <header><strong>{idea.codigo}</strong><span className={badgeClass('priority', idea.prioridade)}>{idea.prioridade}</span></header>
            <h3>{idea.titulo}</h3>
            <p>{idea.descricao}</p>
            <ProductFlow status={idea.status} flow={OFFICIAL_FLOW} />
            <div className="lab-idea-details">
              <span><b>Categoria</b>{idea.categoria}</span>
              <span><b>Status</b><em className={badgeClass('status', idea.status)}>{idea.status}</em></span>
              <span><b>Versao</b>{idea.versao || '-'}</span>
              <span><b>Sprint</b>{idea.sprint || '-'}</span>
              <span><b>Impacto</b>{idea.impacto}</span>
              <span><b>Esforco</b>{idea.esforco}</span>
              <span><b>Valor Cliente</b>{idea.valorCliente}</span>
              <span><b>Responsavel</b>{idea.responsavel}</span>
            </div>
            <div className="lab-traceability">
              <span><Code2 size={14} /> {idea.promptCodex ? 'Prompt Codex gerado' : 'Prompt pendente'}</span>
              <span><GitBranch size={14} /> {idea.branch || 'Branch futura'}</span>
              <span><Link2 size={14} /> PR/commit/build/release preparados</span>
            </div>
            {activePanel === 'prompts' && idea.promptCodex ? <pre className="product-prompt-preview">{idea.promptCodex}</pre> : null}
            {activePanel === 'historico' ? <ProductTimeline events={idea.timeline} /> : null}
            <footer>
              <small>{idea.observacoes || 'Sem observacoes adicionais.'}</small>
              <div className="product-action-row">
                <button className="secondary-button" type="button" onClick={() => sendToSprint(idea)} disabled={!['IDEIA', 'ANALISE'].includes(idea.status)}><Rocket size={16} /> Enviar para Sprint</button>
                <button className="secondary-button" type="button" onClick={() => generatePrompt(idea)} disabled={idea.status !== 'APROVADA'}><Code2 size={16} /> Gerar Prompt Codex</button>
                <button className="secondary-button" type="button" onClick={() => advanceIdea(idea)} disabled={idea.status === 'CONCLUIDA' || idea.status === 'APROVADA'}>Avancar etapa</button>
                <button className="primary-button" type="button" onClick={() => openPublish(idea)} disabled={idea.status !== 'TESTES'}>Marcar como Publicada</button>
              </div>
            </footer>
          </article>
        ))}
      </div>

      {modalOpen ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setModalOpen(false)}>
          <section className="modal modal-wide" onMouseDown={(event) => event.stopPropagation()}>
            <header className="modal-header"><h2>Nova Ideia</h2><button className="icon-button" type="button" onClick={() => setModalOpen(false)}>x</button></header>
            <form className="lab-form-grid" onSubmit={createIdea}>
              <div className="lab-generated-code"><span>Identificador permanente</span><strong>{nextIdeaCode(ideas)}</strong></div>
              <Field label="Titulo" required><input value={form.titulo} onChange={(event) => updateForm('titulo', event.target.value)} required /></Field>
              <Field label="Descricao completa" required><textarea value={form.descricao} onChange={(event) => updateForm('descricao', event.target.value)} required /></Field>
              <SelectField label="Categoria" value={form.categoria} options={CATEGORIES} onChange={(value) => updateForm('categoria', value)} />
              <SelectField label="Prioridade" value={form.prioridade} options={PRIORITIES} onChange={(value) => updateForm('prioridade', value)} />
              <SelectField label="Status" value={form.status} options={OFFICIAL_FLOW} onChange={(value) => updateForm('status', value)} />
              <SelectField label="Impacto" value={form.impacto} options={IMPACTS} onChange={(value) => updateForm('impacto', value)} />
              <SelectField label="Esforco" value={form.esforco} options={EFFORTS} onChange={(value) => updateForm('esforco', value)} />
              <SelectField label="Valor para o Cliente" value={form.valorCliente} options={CUSTOMER_VALUES} onChange={(value) => updateForm('valorCliente', value)} />
              <Field label="Versao prevista"><input value={form.versao} onChange={(event) => updateForm('versao', event.target.value)} /></Field>
              <Field label="Sprint"><input value={form.sprint} onChange={(event) => updateForm('sprint', event.target.value)} /></Field>
              <SelectField label="Responsavel" value={form.responsavel} options={RESPONSIBLES} onChange={(value) => updateForm('responsavel', value)} />
              <SelectField label="Origem" value={form.origem} options={ORIGINS} onChange={(value) => updateForm('origem', value)} />
              <Field label="Data" required><input type="date" value={form.criado_em} onChange={(event) => updateForm('criado_em', event.target.value)} required /></Field>
              <Field label="Dependencias"><input value={form.dependencias} onChange={(event) => updateForm('dependencias', event.target.value)} placeholder="Ex.: IDEIA-0001, APP-002" /></Field>
              <Field label="Anexos"><input disabled placeholder="Estrutura preparada para upload futuro" /></Field>
              <Field label="Observacoes"><textarea value={form.observacoes} onChange={(event) => updateForm('observacoes', event.target.value)} /></Field>
              <div className="form-actions span-2"><button className="secondary-button" type="button" onClick={() => setModalOpen(false)}>Cancelar</button><button className="primary-button" type="submit">Criar ideia</button></div>
            </form>
          </section>
        </div>
      ) : null}

      {publishIdea ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setPublishIdea(null)}>
          <section className="modal" onMouseDown={(event) => event.stopPropagation()}>
            <header className="modal-header"><h2>Marcar como Publicada</h2><button className="icon-button" type="button" onClick={() => setPublishIdea(null)}>x</button></header>
            <form className="lab-form-grid" onSubmit={publish}>
              <Field label="Versao" required><input value={publishForm.versao} onChange={(event) => setPublishForm((current) => ({ ...current, versao: event.target.value }))} required /></Field>
              <SelectField label="Responsavel" value={publishForm.responsavel} options={RESPONSIBLES} onChange={(value) => setPublishForm((current) => ({ ...current, responsavel: value }))} />
              <Field label="Observacoes"><textarea value={publishForm.observacoes} onChange={(event) => setPublishForm((current) => ({ ...current, observacoes: event.target.value }))} /></Field>
              <div className="form-actions span-2"><button className="secondary-button" type="button" onClick={() => setPublishIdea(null)}>Cancelar</button><button className="primary-button" type="submit">Publicar</button></div>
            </form>
          </section>
        </div>
      ) : null}
    </section>
  );
}
