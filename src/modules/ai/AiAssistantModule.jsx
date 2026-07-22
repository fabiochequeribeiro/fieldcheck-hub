import { useMemo, useState } from 'react';
import { Bot, Bug, CheckCircle2, MessageSquare, Send, ShieldCheck, Sparkles } from 'lucide-react';
import { askFieldCheckAi, createFieldCheckIncident } from '../../services/fieldCheckAiApi';

const QUICK_QUESTIONS = [
  'Como implantar o FieldCheck Pro em uma empresa?',
  'Como funciona o aplicativo quando fica offline?',
  'Quais informacoes devo enviar ao relatar um erro?',
];

export default function AiAssistantModule({ profile = {}, companyId, companyName, orders = [], visits = [], technicians = [], occurrences = [] }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [incident, setIncident] = useState({ tipo: 'incidente', prioridade: 'media', categoria: 'aplicativo', titulo: '', descricao: '' });
  const [ticket, setTicket] = useState(null);
  const context = useMemo(() => ({
    empresa: companyName || profile.empresa || 'empresa da sessao',
    indicadores: { ordens: orders.length, visitas: visits.length, equipe: technicians.length, ocorrencias: occurrences.length },
  }), [companyName, profile.empresa, orders.length, visits.length, technicians.length, occurrences.length]);

  async function ask(value = question) {
    const prompt = value.trim();
    if (!prompt || loading) return;
    setLoading(true); setError(''); setAnswer(''); setQuestion(prompt);
    try {
      const result = await askFieldCheckAi({ question: prompt, context });
      setAnswer(result.answer);
    } catch (requestError) {
      setError(requestError.message);
    } finally { setLoading(false); }
  }

  async function submitIncident(event) {
    event.preventDefault();
    setError(''); setTicket(null);
    if (!companyId) { setError('Selecione uma empresa antes de registrar o chamado.'); return; }
    try {
      const result = await createFieldCheckIncident({
        empresa_id: companyId,
        origem: 'portal',
        ...incident,
        contexto: { pagina: 'ia-fieldcheck', usuario: profile.email || profile.nome || '' },
      });
      setTicket(result);
      setIncident((current) => ({ ...current, titulo: '', descricao: '' }));
    } catch (requestError) { setError(requestError.message); }
  }

  return (
    <section className="content ai-live-page">
      <div className="section-header ai-live-hero">
        <div><span className="eyebrow">FieldCheck Intelligence</span><h2>FieldCheck AI</h2><p>Funcionário digital para orientar usuários, analisar o contexto autorizado da operação e transformar problemas em chamados rastreáveis.</p></div>
        <Sparkles size={42} />
      </div>

      <div className="ai-live-grid">
        <article className="hub-panel ai-chat-panel">
          <header className="hub-panel-header"><div><h3><Bot size={20} /> Converse com o FieldCheck AI</h3><p>As respostas usam a base oficial e não executam alterações sem confirmação humana.</p></div><ShieldCheck size={22} /></header>
          <div className="ai-quick-list">{QUICK_QUESTIONS.map((item) => <button key={item} type="button" onClick={() => ask(item)}>{item}</button>)}</div>
          <label className="ai-question-field">Sua pergunta<textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Descreva sua dúvida ou o resultado que precisa alcançar." /></label>
          <button className="primary-button" type="button" disabled={loading || !question.trim()} onClick={() => ask()}><Send size={17} /> {loading ? 'Analisando...' : 'Perguntar ao FieldCheck AI'}</button>
          {answer ? <div className="ai-live-answer"><MessageSquare size={21} /><div><strong>Resposta</strong><p>{answer}</p></div></div> : null}
        </article>

        <form className="hub-panel ai-incident-panel" onSubmit={submitIncident}>
          <header className="hub-panel-header"><div><h3><Bug size={20} /> Registrar incidente ou sugestão</h3><p>O chamado recebe código, prioridade e vínculo obrigatório com a empresa.</p></div></header>
          <div className="ai-form-row"><label>Tipo<select value={incident.tipo} onChange={(event) => setIncident({ ...incident, tipo: event.target.value })}><option value="incidente">Incidente</option><option value="duvida">Dúvida</option><option value="sugestao">Sugestão</option><option value="feedback">Feedback</option></select></label><label>Prioridade<select value={incident.prioridade} onChange={(event) => setIncident({ ...incident, prioridade: event.target.value })}><option value="baixa">Baixa</option><option value="media">Média</option><option value="alta">Alta</option><option value="critica">Crítica</option></select></label></div>
          <label>Categoria<select value={incident.categoria} onChange={(event) => setIncident({ ...incident, categoria: event.target.value })}><option value="aplicativo">Aplicativo</option><option value="portal">Portal</option><option value="expedicao">Expedição</option><option value="dados">Dados/sincronização</option><option value="acesso">Acesso</option></select></label>
          <label>Título<input required maxLength={140} value={incident.titulo} onChange={(event) => setIncident({ ...incident, titulo: event.target.value })} /></label>
          <label>Descrição<textarea required value={incident.descricao} onChange={(event) => setIncident({ ...incident, descricao: event.target.value })} placeholder="Informe o passo, resultado esperado e resultado observado." /></label>
          <button className="secondary-button" type="submit"><Bug size={17} /> Criar chamado</button>
          {ticket ? <div className="ai-ticket-success"><CheckCircle2 size={20} /><div><strong>{ticket.codigo}</strong><span>Chamado registrado como {ticket.status}.</span></div></div> : null}
        </form>
      </div>
      {error ? <div className="form-error">{error}</div> : null}
      <div className="ai-safety-note"><ShieldCheck size={20} /><p><strong>Limites seguros:</strong> a IA não acessa outras empresas, não publica código, não altera registros e não substitui validação humana. Dados sensíveis não devem ser enviados no chat.</p></div>
    </section>
  );
}
