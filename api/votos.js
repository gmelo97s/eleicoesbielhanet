// API da urna na Vercel. Os votos ficam na planilha "Apuração do Grupo - votos" do Google Drive,
// através do Apps Script publicado como App da Web (Code.gs deste repositório).
// GET  /api/votos         -> placar {votos: [{t, c, n}], url}
// POST /api/votos {c, n}  -> registra um voto (fecha no 300º)

const PLANILHA_URL = process.env.APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwwAsmOBYLUPdAl51QEVWXvoPAkuNRHOobX-sz9Yp-3fsozDtrjbzubu9ouaRPjOfsQ/exec';
const OPCOES = ['24', '69', '104', 'branco', 'nulo'];

async function planilha(method, body) {
  const r = await fetch(PLANILHA_URL, {
    method,
    redirect: 'follow',
    headers: body ? {'Content-Type': 'text/plain;charset=utf-8'} : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const texto = await r.text();
  try { return JSON.parse(texto); } catch (e) { throw new Error('a planilha respondeu algo inesperado (' + r.status + ')'); }
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const url = host ? 'https://' + host + '/' : null;
  try {
    if (req.method === 'GET') {
      const s = await planilha('GET');
      res.status(200).json({votos: s.votos || [], url});
      return;
    }
    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
      const c = String((body && body.c) || '').trim().toLowerCase();
      if (!OPCOES.includes(c)) { res.status(400).json({erro: 'Voto inválido.'}); return; }
      const r = await planilha('POST', {c, n: String((body && body.n) || '')});
      if (r.erro) { res.status(400).json({erro: r.erro}); return; }
      res.status(200).json({ok: !!r.ok, motivo: r.motivo, estado: {votos: (r.estado && r.estado.votos) || [], url}});
      return;
    }
    res.status(405).json({erro: 'Método não permitido.'});
  } catch (e) {
    res.status(502).json({erro: 'Falha ao falar com a planilha: ' + e.message});
  }
};
