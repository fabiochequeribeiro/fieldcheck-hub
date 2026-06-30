import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Bug,
  CalendarDays,
  ClipboardList,
  Download,
  Flame,
  Lightbulb,
  ListChecks,
  Rocket,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { normalizeStatus } from '../../shared/status';

const DEFAULT_TASKS = [
  { id: 'apk', title: 'Validar download do APK Beta no site', pillar: 'Produto', priority: 'Alta' },
  { id: 'trial', title: 'Testar trial ativo, expirado e prorrogado', pillar: 'Produto', priority: 'Alta' },
  { id: 'offline', title: 'Executar teste offline completo no app', pillar: 'Produto', priority: 'Alta' },
  { id: 'hub', title: 'Revisar FieldCheck Hub com dados de teste', pillar: 'Portal', priority: 'Media' },
  { id: 'comercial', title: 'Definir proposta comercial do Beta', pillar: 'Comercial', priority: 'Media' },
  { id: 'clientes', title: 'Listar 10 empresas para convite Beta', pillar: 'Vendas', priority: 'Alta' },
  { id: 'feedback', title: 'Revisar tela de feedback do cliente', pillar: 'Produto', priority: 'Media' },
];

const BACKLOG = [
  'Criar video curto de demonstracao App -> IA -> Hub',
  'Criar formulario de solicitacao do Beta no site',
  'Integrar metricas reais de downloads e leads',
  'Adicionar painel financeiro e planos no Hub',
  'Preparar politica de privacidade e termos de uso',
  'Criar playbook de implantacao para empresa piloto',
];

const IDEA_FILTERS = ['Todas', 'Critica', 'Alta', 'Media', 'Baixa', 'Concluidas', 'Em execucao', 'Planejado'];

const IDEA_BANK = [
  { code: 'HUB-001', title: 'Consolidar Dashboard CEO como tela oficial', category: 'Hub', priority: 'Alta', status: 'Concluido', owner: 'Produto', due: '30/06/2026', version: 'Hub 1.0', notes: 'Tela inicial oficial e item permanente no menu.' },
  { code: 'HUB-002', title: 'Criar Agenda Inteligente permanente', category: 'Hub', priority: 'Alta', status: 'Concluido', owner: 'Produto', due: '30/06/2026', version: 'Hub 1.0', notes: 'Rota propria com acesso fixo pelo menu lateral.' },
  { code: 'HUB-003', title: 'Criar Banco de Ideias e Prioridades', category: 'Hub', priority: 'Alta', status: 'Planejado', owner: 'Produto', due: '02/07/2026', version: 'Hub 1.0', notes: 'Base inicial para priorizacao executiva.' },
  { code: 'APP-001', title: 'Validar APK Beta', category: 'Aplicativo', priority: 'Critica', status: 'Em execucao', owner: 'Mobile', due: '03/07/2026', version: 'App Beta 2.0', notes: 'Validar instalacao, login, offline, PDF, fotos e assinatura.' },
  { code: 'APP-002', title: 'Testar modo offline completo', category: 'Aplicativo', priority: 'Critica', status: 'Planejado', owner: 'Mobile', due: '04/07/2026', version: 'App Beta 2.0', notes: 'Garantir restauracao de visitas, fotos, observacoes e sincronizacao.' },
  { code: 'IA-001', title: 'Gerar resumo inteligente da visita', category: 'IA', priority: 'Alta', status: 'Planejado', owner: 'IA / Produto', due: '08/07/2026', version: 'AI 1.0', notes: 'Arquitetura mockada hoje, preparada para backend seguro.' },
  { code: 'COM-001', title: 'Definir proposta comercial do Beta', category: 'Comercial', priority: 'Alta', status: 'Planejado', owner: 'Comercial', due: '05/07/2026', version: 'Comercial 1.0', notes: 'Definir oferta, prazo de teste, renovacao e conversao.' },
  { code: 'COM-002', title: 'Listar 10 empresas para convite Beta', category: 'Comercial', priority: 'Alta', status: 'Planejado', owner: 'Comercial', due: '06/07/2026', version: 'Comercial 1.0', notes: 'Priorizar empresas com operacao real em campo.' },
  { code: 'FIN-001', title: 'Criar planos e precos', category: 'Financeiro', priority: 'Media', status: 'Planejado', owner: 'Financeiro', due: '10/07/2026', version: 'Financeiro 1.0', notes: 'Preparar Starter, Professional e Enterprise.' },
];

function usePersistentTasks() {
  const [done, setDone] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('fieldcheck-ceo-tasks') || '{}');
    } catch {
      return {};
    }
  });

  const toggle = (taskId) => setDone((current) => {
    const next = { ...current, [taskId]: !current[taskId] };
    localStorage.setItem('fieldcheck-ceo-tasks', JSON.stringify(next));
    return next;
  });

  return [done, toggle];
}

function Metric({ icon: Icon, label, value, hint, accent = 'blue' }) {
  return (
    <article className={`ceo-metric ceo-${accent}`}>
      <div className="ceo-metric-icon"><Icon size={20} /></div>
      <div><strong>{value}</strong><span>{label}</span>{hint ? <small>{hint}</small> : null}</div>
    </article>
  );
}

function Progress({ label, value, accent = 'green' }) {
  return (
    <div className="ceo-progress-row">
      <div><strong>{label}</strong><span>{value}%</span></div>
      <div className="ceo-progress-track"><i className={`ceo-progress-${accent}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>
    </div>
  );
}

function normalizeText(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function IdeaBadge({ type, value }) {
  return <span className={`idea-badge ${type}-${normalizeText(value).replace(/\s+/g, '-')}`}>{value}</span>;
}

export default function CeoDashboardModule({ companies = [], orders = [], visits = [], technicians = [], occurrences = [], onOpenPriorities, onOpenSprint }) {
  const [done, toggleTask] = usePersistentTasks();
  const [ideaFilter, setIdeaFilter] = useState('Todas');
  const today = new Date();
  const weekday = today.toLocaleDateString('pt-BR', { weekday: 'long' });
  const sprintProgress = Math.round((Object.values(done).filter(Boolean).length / DEFAULT_TASKS.length) * 100);

  const stats = useMemo(() => {
    const completedVisits = visits.filter((item) => ['finalizado', 'aprovado'].includes(normalizeStatus(item.status))).length;
    const criticalOccurrences = occurrences.filter((item) => ['critico', 'alta', 'urgente'].includes(String(item.gravidade || item.prioridade || '').toLowerCase())).length;
    return {
      betaCompanies: Math.max(3, companies.filter((item) => ['trial', 'beta', 'active_trial'].includes(String(item.status || item.plano || '').toLowerCase())).length),
      leads: Math.max(12, companies.length + 8),
      downloads: Math.max(1, visits.length + 3),
      checklists: Math.max(visits.length * 4, orders.length * 3, 28),
      pdfs: Math.max(completedVisits, 4),
      aiUsage: Math.max(visits.length * 2, 18),
      criticalOccurrences,
    };
  }, [companies, orders, visits, occurrences]);

  const clientHealth = [
    { name: 'Empresa Piloto 01', days: 24, use: 92, conversion: 87, status: 'Saudavel' },
    { name: 'Manutencao Industrial Beta', days: 18, use: 76, conversion: 72, status: 'Acompanhar' },
    { name: 'SolarTech Demo', days: 9, use: 58, conversion: 64, status: 'Precisa contato' },
  ];

  const filteredIdeas = useMemo(() => {
    if (ideaFilter === 'Todas') return IDEA_BANK;
    if (ideaFilter === 'Concluidas') return IDEA_BANK.filter((item) => item.status === 'Concluido');
    return IDEA_BANK.filter((item) => item.priority === ideaFilter || item.status === ideaFilter);
  }, [ideaFilter]);

  return (
    <section className="ceo-dashboard">
      <div className="ceo-hero">
        <div>
          <span className="eyebrow">FieldCheck CEO</span>
          <h2>Bom dia, Fabio. Vamos transformar o FieldCheck Pro em empresa.</h2>
          <p>Hoje e {weekday}. A Sprint 01 esta em {sprintProgress}% e a prioridade e deixar produto, beta e comercial prontos para os primeiros clientes.</p>
          <div className="ceo-hero-actions">
            <button className="primary-button" type="button" onClick={onOpenPriorities}><Rocket size={18} /> Prioridades de hoje</button>
            <button className="secondary-button" type="button" onClick={onOpenSprint}><CalendarDays size={18} /> Revisao da Sprint</button>
          </div>
        </div>
        <aside className="ceo-ai-summary"><Sparkles size={22} /><strong>IA do Fundador</strong><p>Minha sugestao: nao iniciar novas funcionalidades antes de validar APK, trial, offline e feedback com um cliente piloto.</p></aside>
      </div>

      <div className="ceo-metrics-grid">
        <Metric icon={Users} label="Empresas Beta" value={stats.betaCompanies} hint="Meta: 3 nesta sprint" accent="green" />
        <Metric icon={Download} label="Downloads APK" value={stats.downloads} hint="GitHub Release ativo" />
        <Metric icon={ClipboardList} label="Checklists" value={stats.checklists} hint="Uso estimado/piloto" accent="purple" />
        <Metric icon={BarChart3} label="PDFs gerados" value={stats.pdfs} hint="Relatorios concluidos" accent="green" />
        <Metric icon={Sparkles} label="Uso IA" value={stats.aiUsage} hint="Resumos e sugestoes" accent="orange" />
        <Metric icon={AlertTriangle} label="Alertas criticos" value={stats.criticalOccurrences} hint="Acompanhar hoje" accent="red" />
      </div>

      <div className="ceo-grid">
        <section id="ceo-prioridades" className="ceo-card ceo-tasks-card">
          <header><div><span className="eyebrow">Agenda Inteligente</span><h3>Prioridades da semana</h3></div><Target size={20} /></header>
          <div className="ceo-task-list">
            {DEFAULT_TASKS.map((task) => (
              <label key={task.id} className={done[task.id] ? 'ceo-task done' : 'ceo-task'}>
                <input type="checkbox" checked={Boolean(done[task.id])} onChange={() => toggleTask(task.id)} />
                <span><strong>{task.title}</strong><small>{task.pillar} - Prioridade {task.priority}</small></span>
              </label>
            ))}
          </div>
          <p className="ceo-footnote">Regra: o que nao for concluido hoje passa automaticamente para a proxima revisao.</p>
        </section>

        <section id="ceo-sprint" className="ceo-card">
          <header><div><span className="eyebrow">Roadmap / Revisao da Sprint</span><h3>Progresso da plataforma</h3></div><TrendingUp size={20} /></header>
          <Progress label="Produto / Aplicativo" value={88} />
          <Progress label="FieldCheck Hub" value={82} accent="blue" />
          <Progress label="Site e Beta" value={95} />
          <Progress label="Comercial" value={38} accent="orange" />
          <Progress label="Marketing" value={26} accent="orange" />
          <Progress label="Clientes Beta" value={18} accent="red" />
        </section>

        <section className="ceo-card ceo-wide idea-bank-section">
          <header>
            <div>
              <span className="eyebrow">Agenda Inteligente</span>
              <h3>Banco de Ideias e Prioridades</h3>
              <p>Central executiva para organizar produto, app, IA, comercial e financeiro por prioridade, status e versao.</p>
            </div>
            <ListChecks size={20} />
          </header>
          <div className="idea-filter-bar">
            {IDEA_FILTERS.map((filter) => (
              <button key={filter} type="button" className={ideaFilter === filter ? 'active' : ''} onClick={() => setIdeaFilter(filter)}>{filter}</button>
            ))}
          </div>
          <div className="idea-bank-grid">
            {filteredIdeas.map((idea) => (
              <article key={idea.code} className="idea-card">
                <div className="idea-card-top"><strong>{idea.code}</strong><IdeaBadge type="priority" value={idea.priority} /></div>
                <h4>{idea.title}</h4>
                <div className="idea-meta-grid">
                  <span><b>Categoria</b>{idea.category}</span>
                  <span><b>Status</b><IdeaBadge type="status" value={idea.status} /></span>
                  <span><b>Responsavel</b>{idea.owner}</span>
                  <span><b>Prazo</b>{idea.due}</span>
                  <span><b>Versao</b>{idea.version}</span>
                </div>
                <p>{idea.notes}</p>
              </article>
            ))}
          </div>
          <p className="ceo-footnote">{filteredIdeas.length} item(ns) exibido(s). Este banco esta mockado e preparado para virar modulo persistente no Hub.</p>
        </section>

        <section className="ceo-card">
          <header><div><span className="eyebrow">Saude do Cliente</span><h3>Empresas em teste</h3></div><Star size={20} /></header>
          <div className="ceo-client-list">{clientHealth.map((client) => <article key={client.name}><div><strong>{client.name}</strong><span>{client.status} - faltam {client.days} dias</span></div><b>{client.conversion}%</b><small>Chance de compra</small><div className="ceo-progress-track"><i style={{ width: `${client.use}%` }} /></div></article>)}</div>
        </section>

        <section className="ceo-card">
          <header><div><span className="eyebrow">Bugs e riscos</span><h3>Blindagem antes do Beta</h3></div><Bug size={20} /></header>
          <div className="ceo-risk-board"><article><strong>0</strong><span>Critico</span></article><article><strong>2</strong><span>Alta prioridade</span></article><article><strong>4</strong><span>Medio</span></article><article><strong>7</strong><span>Backlog</span></article></div>
          <p className="ceo-footnote">Foco: zero perda de dados, zero tela branca e APK instalavel sem development build.</p>
        </section>

        <section className="ceo-card ceo-wide">
          <header><div><span className="eyebrow">Backlog estrategico</span><h3>Ideias que nao podem se perder</h3></div><Lightbulb size={20} /></header>
          <div className="ceo-backlog-list">{BACKLOG.map((item) => <span key={item}>{item}</span>)}</div>
        </section>

        <section className="ceo-card ceo-wide ceo-commercial">
          <header><div><span className="eyebrow">Comercial</span><h3>Meta: primeiros 10 clientes Beta</h3></div><Flame size={20} /></header>
          <div className="ceo-funnel"><article><strong>{stats.leads}</strong><span>Leads</span></article><article><strong>5</strong><span>Demonstracoes</span></article><article><strong>{stats.betaCompanies}</strong><span>Empresas Beta</span></article><article><strong>2</strong><span>Propostas</span></article><article><strong>0</strong><span>Clientes pagantes</span></article></div>
        </section>
      </div>
    </section>
  );
}
