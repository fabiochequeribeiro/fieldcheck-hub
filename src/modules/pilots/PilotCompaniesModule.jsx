import { useMemo, useState } from 'react';
import {
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Factory,
  FileText,
  PackageCheck,
  Plus,
  Search,
  Settings,
  Wrench,
} from 'lucide-react';
import { HubPanel, HubStatCard } from '../../components/hub/HubComponents';

const MODULE_CATALOG = {
  comercial: { label: 'Comercial', icon: BriefcaseBusiness, priority: 'Maxima', status: 'Ativo no Hub e app' },
  entrega: { label: 'Entrega Tecnica', icon: PackageCheck, priority: 'Muito alta', status: 'Pronto para piloto' },
  assistencia: { label: 'Assistencia Tecnica', icon: Wrench, priority: 'Muito alta', status: 'Base pronta em OS' },
  preventiva: { label: 'Manutencao Preventiva', icon: CalendarClock, priority: 'Muito alta', status: 'Tela dedicada no app' },
  inspecoes: { label: 'Inspecoes Tecnicas', icon: CheckCircle2, priority: 'Alta', status: 'Checklist + evidencias' },
  equipamentos: { label: 'Controle de Equipamentos', icon: Settings, priority: 'Alta', status: 'Historico completo no app' },
  ia: { label: 'Relatorio Inteligente IA', icon: Bot, priority: 'Diferencial', status: 'Resumo de visita' },
};

const INITIAL_PILOTS = [
  {
    id: 'engindustrie',
    name: 'EngIndustrie',
    city: 'Londrina - PR',
    segment: 'Representacao de maquinas industriais, projetos e servicos tecnicos',
    status: 'Prospeccao ativa',
    contact: 'Amigo do Fabio',
    technicians: 'A confirmar',
    source: 'Conversa + pesquisa publica',
    fitScore: 96,
    nextStep: 'Validar fluxo atual apos venda da maquina: instalacao, entrega tecnica e manutencoes.',
    modules: ['comercial', 'entrega', 'assistencia', 'preventiva', 'inspecoes', 'equipamentos', 'ia'],
    pains: [
      'Controle do pos-venda de maquinas vendidas',
      'Historico tecnico por equipamento e cliente',
      'Ordens de servico com fotos, diagnostico, pecas, horas e assinatura',
      'Preventivas por maquina, numero de serie, horimetro e prazo',
      'Relatorios profissionais para cliente final',
    ],
    meetingQuestions: [
      'Hoje, depois que voces vendem uma maquina, como controlam instalacao, entrega tecnica e manutencoes?',
      'As ordens de servico ficam em planilha, WhatsApp, papel ou ERP?',
      'Existe historico por maquina com numero de serie, fotos, pecas trocadas e PDFs?',
      'Quem precisa aprovar o servico e receber o relatorio final?',
    ],
    requestedFeatures: [
      'Cadastro de equipamentos vendidos',
      'Entrega tecnica com checklist, fotos, assinatura e PDF',
      'Assistencia tecnica com diagnostico, pecas e horas trabalhadas',
      'Plano de manutencao preventiva por maquina',
      'Resumo inteligente da visita com IA',
    ],
    notes: 'Perfil muito aderente ao FieldCheck Pro: venda de equipamento, instalacao, assistencia tecnica e manutencao industrial recorrente.',
  },
];

const EMPTY_FORM = {
  name: '',
  city: '',
  segment: '',
  status: 'Prospeccao ativa',
  contact: '',
  technicians: '',
  source: 'Cadastro manual',
  nextStep: '',
  notes: '',
};

function Field({ label, children }) {
  return <label className="pilot-field"><span>{label}</span>{children}</label>;
}

function moduleEntries(ids) {
  return ids.map((id) => ({ id, ...MODULE_CATALOG[id] })).filter((item) => item.label);
}

export default function PilotCompaniesModule() {
  const [pilots, setPilots] = useState(INITIAL_PILOTS);
  const [selectedId, setSelectedId] = useState(INITIAL_PILOTS[0]?.id || '');
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const filteredPilots = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return pilots;
    return pilots.filter((pilot) =>
      [pilot.name, pilot.city, pilot.segment, pilot.status, pilot.contact]
        .some((value) => String(value || '').toLowerCase().includes(term)),
    );
  }, [pilots, query]);

  const selectedPilot = pilots.find((pilot) => pilot.id === selectedId) || filteredPilots[0] || pilots[0];
  const recommendedModules = moduleEntries(selectedPilot?.modules || []);
  const highPriority = pilots.filter((pilot) => pilot.fitScore >= 85).length;

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function createPilot(event) {
    event.preventDefault();
    const pilot = {
      id: `pilot-${Date.now()}`,
      ...form,
      fitScore: 80,
      modules: ['entrega', 'assistencia', 'preventiva', 'ia'],
      pains: ['Mapear dores durante a primeira reuniao'],
      meetingQuestions: ['Como a operacao funciona hoje e onde o controle se perde?'],
      requestedFeatures: ['Definir funcionalidades solicitadas apos entrevista'],
      notes: form.notes,
    };
    setPilots((current) => [pilot, ...current]);
    setSelectedId(pilot.id);
    setForm(EMPTY_FORM);
    setModalOpen(false);
  }

  return (
    <section className="content pilot-page">
      <div className="section-header">
        <div>
          <span className="eyebrow">Produto e validacao comercial</span>
          <h2>Empresas Piloto</h2>
          <p>Cadastre clientes piloto, modulos recomendados, feedbacks e prioridades reais de desenvolvimento.</p>
        </div>
        <button className="primary-button" type="button" onClick={() => setModalOpen(true)}><Plus size={18} /> Nova empresa piloto</button>
      </div>

      <div className="hub-stat-grid">
        <HubStatCard icon={Building2} label="Pilotos" value={pilots.length} detail="Empresas em avaliacao" />
        <HubStatCard icon={Factory} label="Perfil ideal" value={highPriority} detail="Aderencia acima de 85%" tone="green" />
        <HubStatCard icon={ClipboardList} label="Modulos sugeridos" value={recommendedModules.length} detail={selectedPilot?.name || 'Selecione um piloto'} tone="amber" />
        <HubStatCard icon={Bot} label="Diferencial IA" value="Ativo" detail="Resumo e relatorio tecnico" tone="purple" />
      </div>

      <div className="pilot-layout">
        <aside className="pilot-list-panel">
          <div className="pilot-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar piloto, cidade ou segmento" /></div>
          <div className="pilot-list">
            {filteredPilots.map((pilot) => (
              <button key={pilot.id} type="button" className={selectedPilot?.id === pilot.id ? 'active' : ''} onClick={() => setSelectedId(pilot.id)}>
                <strong>{pilot.name}</strong>
                <span>{pilot.segment}</span>
                <small>{pilot.status} - {pilot.fitScore}% aderente</small>
              </button>
            ))}
          </div>
        </aside>

        {selectedPilot ? (
          <div className="pilot-detail">
            <section className="pilot-hero">
              <div>
                <span className="eyebrow">Piloto recomendado</span>
                <h3>{selectedPilot.name}</h3>
                <p>{selectedPilot.segment}</p>
              </div>
              <div className="pilot-score"><strong>{selectedPilot.fitScore}%</strong><span>Aderencia</span></div>
            </section>

            <div className="pilot-info-grid">
              <article><span>Cidade</span><strong>{selectedPilot.city}</strong></article>
              <article><span>Contato</span><strong>{selectedPilot.contact}</strong></article>
              <article><span>Tecnicos</span><strong>{selectedPilot.technicians}</strong></article>
              <article><span>Origem</span><strong>{selectedPilot.source}</strong></article>
            </div>

            <HubPanel title="Modulos certos para oferecer" subtitle="Comece pelo que resolve a dor operacional da EngIndustrie." icon={PackageCheck}>
              <div className="pilot-module-grid">
                {recommendedModules.map(({ id, label, icon: Icon, priority, status }) => (
                  <article key={id} className="pilot-module-card">
                    <Icon size={20} />
                    <div><strong>{label}</strong><span>{status}</span></div>
                    <em>{priority}</em>
                  </article>
                ))}
              </div>
            </HubPanel>

            <div className="pilot-two-columns">
              <HubPanel title="Dores provaveis" subtitle="Pontos para validar antes de vender funcionalidades." icon={Wrench}>
                <div className="pilot-check-list">
                  {selectedPilot.pains.map((item) => <div key={item}><CheckCircle2 size={17} /> {item}</div>)}
                </div>
              </HubPanel>
              <HubPanel title="Perguntas para a reuniao" subtitle="Conduza a conversa pelo processo atual deles." icon={FileText}>
                <div className="pilot-question-list">
                  {selectedPilot.meetingQuestions.map((item, index) => <div key={item}><b>{index + 1}</b><span>{item}</span></div>)}
                </div>
              </HubPanel>
            </div>

            <HubPanel title="Funcionalidades solicitadas / hipoteses" subtitle="Base inicial para transformar feedback real em prioridades de produto." icon={ClipboardList}>
              <div className="pilot-request-grid">
                {selectedPilot.requestedFeatures.map((item) => <span key={item}>{item}</span>)}
              </div>
              <p className="pilot-notes">{selectedPilot.notes}</p>
            </HubPanel>
          </div>
        ) : null}
      </div>

      {modalOpen ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setModalOpen(false)}>
          <section className="modal pilot-modal" onMouseDown={(event) => event.stopPropagation()}>
            <header className="modal-header"><h2>Nova empresa piloto</h2><button className="icon-button" type="button" onClick={() => setModalOpen(false)} title="Fechar">x</button></header>
            <form className="pilot-form-grid" onSubmit={createPilot}>
              <Field label="Nome"><input value={form.name} onChange={(event) => updateForm('name', event.target.value)} required /></Field>
              <Field label="Cidade"><input value={form.city} onChange={(event) => updateForm('city', event.target.value)} /></Field>
              <Field label="Segmento"><input value={form.segment} onChange={(event) => updateForm('segment', event.target.value)} required /></Field>
              <Field label="Status"><input value={form.status} onChange={(event) => updateForm('status', event.target.value)} /></Field>
              <Field label="Contato"><input value={form.contact} onChange={(event) => updateForm('contact', event.target.value)} /></Field>
              <Field label="Tecnicos"><input value={form.technicians} onChange={(event) => updateForm('technicians', event.target.value)} /></Field>
              <Field label="Proximo passo"><textarea value={form.nextStep} onChange={(event) => updateForm('nextStep', event.target.value)} /></Field>
              <Field label="Observacoes"><textarea value={form.notes} onChange={(event) => updateForm('notes', event.target.value)} /></Field>
              <div className="form-actions span-2"><button className="secondary-button" type="button" onClick={() => setModalOpen(false)}>Cancelar</button><button className="primary-button" type="submit">Cadastrar piloto</button></div>
            </form>
          </section>
        </div>
      ) : null}
    </section>
  );
}
