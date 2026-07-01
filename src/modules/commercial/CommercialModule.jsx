import { useMemo, useState } from 'react';
import { BriefcaseBusiness, CalendarClock, CheckCircle2, Factory, Plus, Search } from 'lucide-react';
import { HubPanel, HubStatCard } from '../../components/hub/HubComponents';

const EMPTY_FORM = {
  cliente: '',
  contato: '',
  telefone: '',
  oportunidade: '',
  equipamento: '',
  valor: '',
  etapa: 'Lead',
  followUp: '',
  proximoPasso: '',
};

const INITIAL_OPPORTUNITIES = [
  {
    id: 'engindustrie-demo-1',
    cliente: 'Cliente industrial exemplo',
    contato: 'Responsavel de manutencao',
    telefone: '',
    oportunidade: 'Venda de maquina + entrega tecnica',
    equipamento: 'Serra industrial / acionamento mecanico',
    valor: 'A definir',
    etapa: 'Proposta',
    followUp: '05/07/2026',
    proximoPasso: 'Validar escopo de instalacao, treinamento e preventiva inicial.',
  },
  {
    id: 'engindustrie-demo-2',
    cliente: 'Cliente metal-mecanico',
    contato: 'Compras / manutencao',
    telefone: '',
    oportunidade: 'Contrato de assistencia tecnica recorrente',
    equipamento: 'Equipamentos pneumaticos e hidraulicos',
    valor: 'Recorrente',
    etapa: 'Negociacao',
    followUp: '08/07/2026',
    proximoPasso: 'Mapear parque de maquinas e periodicidade preventiva.',
  },
];

const STAGES = ['Lead', 'Qualificacao', 'Proposta', 'Negociacao', 'Ganho'];

function Field({ label, children }) {
  return <label className="commercial-field"><span>{label}</span>{children}</label>;
}

export default function CommercialModule({ orders = [], clients = [] }) {
  const [opportunities, setOpportunities] = useState(INITIAL_OPPORTUNITIES);
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return opportunities;
    return opportunities.filter((item) =>
      [item.cliente, item.contato, item.oportunidade, item.equipamento, item.etapa]
        .some((value) => String(value || '').toLowerCase().includes(term)),
    );
  }, [opportunities, query]);

  const metrics = useMemo(() => ({
    total: opportunities.length,
    proposals: opportunities.filter((item) => ['Proposta', 'Negociacao'].includes(item.etapa)).length,
    won: opportunities.filter((item) => item.etapa === 'Ganho').length,
    equipmentOrders: orders.filter((order) => Array.isArray(order.equipamentos) && order.equipamentos.length).length,
  }), [opportunities, orders]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function createOpportunity(event) {
    event.preventDefault();
    const record = { id: `opp-${Date.now()}`, ...form };
    setOpportunities((current) => [record, ...current]);
    setForm(EMPTY_FORM);
    setFormOpen(false);
  }

  function advance(item) {
    const currentIndex = STAGES.indexOf(item.etapa);
    const nextStage = STAGES[Math.min(currentIndex + 1, STAGES.length - 1)] || 'Qualificacao';
    setOpportunities((current) => current.map((row) => row.id === item.id ? { ...row, etapa: nextStage } : row));
  }

  return (
    <section className="content commercial-page">
      <div className="commercial-hero">
        <div>
          <span className="eyebrow">Piloto EngIndustrie</span>
          <h2>Comercial Industrial</h2>
          <p>Controle leads, propostas, visitas comerciais e equipamentos vendidos para transformar venda em entrega tecnica, OS e preventiva.</p>
        </div>
        <button className="primary-button" type="button" onClick={() => setFormOpen((value) => !value)}><Plus size={18} /> Nova oportunidade</button>
      </div>

      <div className="hub-stat-grid">
        <HubStatCard icon={BriefcaseBusiness} label="Oportunidades" value={metrics.total} detail="Pipeline ativo" />
        <HubStatCard icon={CalendarClock} label="Propostas / negociacao" value={metrics.proposals} detail="Follow-up comercial" tone="amber" />
        <HubStatCard icon={CheckCircle2} label="Vendas ganhas" value={metrics.won} detail="Virar entrega tecnica" tone="green" />
        <HubStatCard icon={Factory} label="Clientes no Hub" value={clients.length || '-'} detail="Base operacional" tone="purple" />
      </div>

      {formOpen ? (
        <HubPanel title="Nova oportunidade" subtitle="Registre a venda desde o primeiro contato." icon={Plus}>
          <form className="commercial-form-grid" onSubmit={createOpportunity}>
            <Field label="Cliente"><input value={form.cliente} onChange={(event) => updateForm('cliente', event.target.value)} required /></Field>
            <Field label="Contato"><input value={form.contato} onChange={(event) => updateForm('contato', event.target.value)} /></Field>
            <Field label="Telefone"><input value={form.telefone} onChange={(event) => updateForm('telefone', event.target.value)} /></Field>
            <Field label="Oportunidade"><input value={form.oportunidade} onChange={(event) => updateForm('oportunidade', event.target.value)} required /></Field>
            <Field label="Equipamento"><input value={form.equipamento} onChange={(event) => updateForm('equipamento', event.target.value)} /></Field>
            <Field label="Valor"><input value={form.valor} onChange={(event) => updateForm('valor', event.target.value)} /></Field>
            <Field label="Etapa"><select value={form.etapa} onChange={(event) => updateForm('etapa', event.target.value)}>{STAGES.map((stage) => <option key={stage}>{stage}</option>)}</select></Field>
            <Field label="Follow-up"><input value={form.followUp} onChange={(event) => updateForm('followUp', event.target.value)} placeholder="dd/mm/aaaa" /></Field>
            <Field label="Proximo passo"><textarea value={form.proximoPasso} onChange={(event) => updateForm('proximoPasso', event.target.value)} /></Field>
            <div className="form-actions span-2"><button className="secondary-button" type="button" onClick={() => setFormOpen(false)}>Cancelar</button><button className="primary-button" type="submit">Salvar oportunidade</button></div>
          </form>
        </HubPanel>
      ) : null}

      <div className="commercial-toolbar">
        <Search size={17} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar cliente, proposta, equipamento ou etapa" />
      </div>

      <div className="commercial-board">
        {STAGES.map((stage) => (
          <HubPanel key={stage} title={stage} subtitle={`${filtered.filter((item) => item.etapa === stage).length} oportunidade(s)`} icon={BriefcaseBusiness}>
            <div className="commercial-card-list">
              {filtered.filter((item) => item.etapa === stage).map((item) => (
                <article className="commercial-card" key={item.id}>
                  <strong>{item.cliente}</strong>
                  <span>{item.oportunidade}</span>
                  <small>{item.equipamento || 'Equipamento a definir'}</small>
                  <div><b>{item.valor || 'Valor a definir'}</b><em>{item.followUp || 'Sem follow-up'}</em></div>
                  <p>{item.proximoPasso || 'Definir proximo passo.'}</p>
                  <button type="button" className="secondary-button" onClick={() => advance(item)}>Avancar etapa</button>
                </article>
              ))}
              {!filtered.filter((item) => item.etapa === stage).length ? <div className="hub-empty-inline">Sem oportunidades nesta etapa.</div> : null}
            </div>
          </HubPanel>
        ))}
      </div>
    </section>
  );
}
