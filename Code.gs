// Apuração do Grupo · banco de dados na planilha (API usada pelo site na Vercel)
// GET  -> placar {votos:[{t,c,n}]}
// POST {"c":"24","n":""} -> registra o voto (fecha no 300º)
const ELEITORADO = 300;
const ABA = 'Votos';
const OPCOES = ['24', '69', '104', 'branco', 'nulo'];

function doGet() { return json_(estado_()); }

function doPost(e) {
  let d = {};
  try { d = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) { d = {}; }
  const c = String(d.c || '').trim().toLowerCase();
  if (OPCOES.indexOf(c) === -1) return json_({erro: 'Voto inválido.'});
  const trava = LockService.getScriptLock();
  trava.waitLock(20000);
  try {
    const aba = aba_();
    if (aba.getLastRow() - 1 >= ELEITORADO) return json_({ok: false, motivo: 'lotada', estado: estado_()});
    const n = c === 'nulo' ? String(d.n || '').replace(/\D/g, '').slice(0, 3) : '';
    aba.appendRow([new Date(), c, n ? "'" + n : '']);
    SpreadsheetApp.flush();
    return json_({ok: true, estado: estado_()});
  } finally {
    trava.releaseLock();
  }
}

function estado_() {
  const aba = aba_();
  const linhas = aba.getLastRow() > 1 ? aba.getRange(2, 1, aba.getLastRow() - 1, 3).getValues() : [];
  const votos = linhas.map(function (l) {
    const t = l[0] instanceof Date ? l[0].getTime() : new Date(l[0]).getTime();
    return {t: isNaN(t) ? 0 : t, c: String(l[1]).trim().toLowerCase(), n: String(l[2] || '')};
  }).filter(function (v) { return OPCOES.indexOf(v.c) !== -1; }).slice(0, ELEITORADO);
  return {votos: votos};
}

function aba_() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  let aba = planilha.getSheetByName(ABA);
  if (!aba) {
    aba = planilha.insertSheet(ABA);
    aba.appendRow(['Data e hora', 'Voto', 'Número digitado (nulos)']);
    aba.setFrozenRows(1);
  }
  return aba;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
