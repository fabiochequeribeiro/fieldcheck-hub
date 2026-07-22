/* global process */
const ALLOWED_ORIGINS = new Set([
  'https://fieldcheckpro.com.br',
  'https://www.fieldcheckpro.com.br',
  'https://fieldcheck-hub.vercel.app',
]);

const KNOWLEDGE = `
FieldCheck Pro e uma plataforma empresarial formada por Site, Hub de gestao, aplicativo Android de campo e modulos operacionais.
O aplicativo executa ordens, checklists, fotos, ocorrencias, assinaturas, PDFs e sincronizacao. O modo offline preserva o trabalho local e sincroniza quando houver conexao.
O Hub administra empresas, usuarios, permissoes, modelos, ordens, aprovacoes, auditoria, licencas, downloads e indicadores.
Expedicao Inteligente organiza pedidos, OFs, equipamentos, itens, lotes, paletes, planejamento e carregamento. Desenhos e codigos sao referencias; a organizacao logistica e definida por pedido.
A demonstracao comercial nao deve usar dados reais. A versao APK piloto nao equivale a uma publicacao assinada na Play Store.
Privacidade: nunca exponha dados de outra empresa, senhas, tokens, chaves, dados pessoais desnecessarios ou evidencias fora da autorizacao do usuario.
Suporte: quando houver erro, solicite modulo, passo realizado, resultado esperado, resultado observado, versao e, se seguro, evidencia sem dados sensiveis.
`;

function cors(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.has(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
}

async function authenticate(req) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const url = process.env.SUPABASE_URL || 'https://qceafhvudijkqwspymyq.supabase.co';
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_sSWY3zbIB5rXFzAn0KqetQ_KQ6Wqha1';
  const response = await fetch(`${url}/auth/v1/user`, { headers: { apikey: key, Authorization: `Bearer ${token}` } });
  return response.ok ? response.json() : null;
}

function clean(value, max = 4000) {
  return String(value || '').split('').map((character) => character.charCodeAt(0) < 32 ? ' ' : character).join('').trim().slice(0, max);
}

function knowledgeFallback(question) {
  const value = question.toLowerCase();
  if (value.includes('offline') || value.includes('internet')) return 'O aplicativo preserva o trabalho local quando estiver sem internet e sincroniza quando a conexao voltar. Antes de encerrar uma operacao critica, confirme no indicador de sincronizacao se todos os registros foram enviados.';
  if (value.includes('erro') || value.includes('problema') || value.includes('chamado')) return 'Para registrar um problema, informe o modulo, o passo realizado, o resultado esperado, o resultado observado e a versao usada. Nao envie senhas, chaves ou dados pessoais desnecessarios. No Portal, use FieldCheck AI para criar um chamado rastreavel.';
  if (value.includes('implanta') || value.includes('piloto')) return 'A implantacao recomendada comeca por um piloto controlado: configurar empresa e usuarios no Portal, liberar os modulos contratados, instalar o APK piloto, executar uma operacao acompanhada e validar sincronizacao, evidencias e relatorios antes de expandir.';
  if (value.includes('expedi')) return 'A Expedicao Inteligente organiza pedidos, OFs, equipamentos, itens, lotes, paletes, planejamento e carregamento. Desenhos e codigos servem como referencia; a organizacao logistica deve continuar flexivel por pedido.';
  if (value.includes('fieldcheck') || value.includes('plataforma')) return 'O FieldCheck Pro integra Site, Hub de gestao, aplicativo Android para o campo e modulos como Expedicao Inteligente. A empresa administra usuarios e operacoes no Portal, enquanto a equipe executa checklists, fotos, assinaturas e registros no aplicativo.';
  return 'Posso orientar sobre implantacao, aplicativo offline, Portal, Expedicao Inteligente e registro de incidentes. Para uma decisao especifica que nao esteja na base oficial, encaminhe o caso ao atendimento humano.';
}

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo nao permitido.' });
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'FieldCheck AI ainda nao foi configurado no servidor.' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const question = clean(body.question, 3000);
  const source = clean(body.source, 30) || 'site';
  if (question.length < 3) return res.status(400).json({ error: 'Escreva uma pergunta mais completa.' });
  const user = await authenticate(req);
  if (source !== 'site' && !user) return res.status(401).json({ error: 'Sessao invalida ou expirada.' });

  const safeContext = user ? clean(JSON.stringify(body.context || {}), 5000) : 'Visitante publico; responda apenas sobre o produto e implantacao.';
  const instructions = `Voce e o FieldCheck AI, funcionario digital da FieldCheck Pro. Responda em portugues do Brasil, com objetividade e postura profissional. Use somente a base oficial e o contexto fornecido. Nao invente funcionalidades, prazos, precos, dados ou acoes executadas. Nao afirme que salvou, alterou, publicou ou contatou alguem. Nunca revele ou solicite segredos. Nao misture empresas. Se faltar evidencia, diga claramente e indique o proximo passo humano. Toda recomendacao tecnica ou operacional deve ser revisada por uma pessoa.\n\nBASE OFICIAL:\n${KNOWLEDGE}`;

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5.6-terra',
        instructions,
        input: `Origem: ${source}\nContexto autorizado: ${safeContext}\nPergunta: ${question}`,
        max_output_tokens: 900,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message || 'Falha no provedor de IA.');
    const answer = clean(data.output_text || data.output?.flatMap((item) => item.content || []).find((item) => item.type === 'output_text')?.text, 8000);
    if (!answer) throw new Error('A IA nao retornou uma resposta utilizavel.');
    return res.status(200).json({ answer, model: data.model || process.env.OPENAI_MODEL || 'gpt-5.6-terra', authenticated: Boolean(user) });
  } catch (error) {
    return res.status(200).json({ answer: knowledgeFallback(question), model: 'base-oficial-fieldcheck', authenticated: Boolean(user), degraded: true });
  }
}
