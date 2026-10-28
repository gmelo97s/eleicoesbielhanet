// API da urna na Vercel. Guarda os votos numa lista do Upstash Redis (plano grátis da Vercel).
// GET  /api/votos            -> placar {votos: [{t, c, n}], url}
// POST /api/votos {c, n}     -> registra um voto (fecha no 300º)
// DELETE /api/votos?chave=X  -> zera os votos (X = variável ZERAR_CHAVE configurada na Vercel)

const ELEITORADO = 300;
const CHAVE = 'apuracao:votos';
const OPCOES = ['24', '69', '104', 'branco', 'nulo'];

// Só grava se ainda houver lugar: conta e adiciona numa operação só.
const SCRIPT_VOTAR = "if redis.call('LLEN', KEYS[1]) >= tonumber(ARGV[2]) then return -1 end return redis.call('RPUSH', KEYS[1], ARGV[1])";

function config() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? {url: url.replace(/\/$/, ''), token} : null;
}

async function redis(cfg, comando) {
  const r = await fetch(cfg.url, {
    method: 'POST',
    headers: {Authorization: 'Bearer ' + cfg.token, 'Content-Type': 'application/json'},
    body: JSON.stringify(comando),
  });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(j.error || 'Redis respondeu ' + r.status);
  return j.result;
}

async function estado(cfg, req) {
  const lista = (await redis(cfg, ['LRANGE', CHAVE, 0, ELEITORADO - 1])) || [];
  const votos = lista.map(s => { try { return JSON.parse(s); } catch (e) { return null; } })
    .filter(v => v && OPCOES.includes(v.c));
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return {votos, url: host ? 'https://' + host + '/' : null};
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const cfg = config();
  if (!cfg) {
    res.status(500).json({erro: 'Banco de dados não configurado: adicione o Upstash Redis em Storage no projeto da Vercel.'});
    return;
  }
  try {
    if (req.method === 'GET') {
      res.status(200).json(await estado(cfg, req));
      return;
    }
    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
      const c = String((body && body.c) || '').trim().toLowerCase();
      if (!OPCOES.includes(c)) { res.status(400).json({erro: 'Voto inválido.'}); return; }
      const n = c === 'nulo' ? String(body.n || '').replace(/\D/g, '').slice(0, 3) : '';
      const voto = JSON.stringify({t: Date.now(), c, n});
      const r = await redis(cfg, ['EVAL', SCRIPT_VOTAR, 1, CHAVE, voto, ELEITORADO]);
      res.status(200).json({ok: r !== -1, motivo: r === -1 ? 'lotada' : undefined, estado: await estado(cfg, req)});
      return;
    }
    if (req.method === 'DELETE') {
      const chave = process.env.ZERAR_CHAVE;
      if (!chave || req.query.chave !== chave) { res.status(403).json({erro: 'Chave inválida.'}); return; }
      await redis(cfg, ['DEL', CHAVE]);
      res.status(200).json({ok: true});
      return;
    }
    res.status(405).json({erro: 'Método não permitido.'});
  } catch (e) {
    res.status(502).json({erro: 'Falha no banco de dados: ' + e.message});
  }
};
