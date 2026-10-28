/**
 * Apuração do Grupo (zap1)
 *
 * A planilha é o banco de dados: cada linha da aba "Votos" é um voto
 * (data e hora, voto, número digitado quando o voto é nulo). Não guarda quem votou.
 * A votação fecha sozinha no 300º voto; não há como encerrar antes.
 *
 * Para publicar: Implantar > Nova implantação > App da Web
 *   Executar como: Eu  ·  Quem pode acessar: Qualquer pessoa
 *
 * Na planilha aparece o menu "Apuração" com a opção de zerar os votos (para limpar testes).
 */

const ELEITORADO = 300;
const ABA = 'Votos';
const OPCOES = ['24', '69', '104', 'branco', 'nulo'];

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Apuração do Grupo · zap1')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Placar atual. A página chama a cada poucos segundos. */
function placar() {
  const cache = CacheService.getScriptCache();
  const salvo = cache.get('placar');
  if (salvo) return JSON.parse(salvo);
  const estado = estado_();
  cache.put('placar', JSON.stringify(estado), 2);
  return estado;
}

/** Registra um voto. Recusa depois do 300º. */
function votar(voto, digitado) {
  voto = String(voto).trim().toLowerCase();
  if (OPCOES.indexOf(voto) === -1) throw new Error('Voto inválido.');
  const trava = LockService.getScriptLock();
  trava.waitLock(20000);
  try {
    const aba = aba_(true);
    if (aba.getLastRow() - 1 >= ELEITORADO) {
      return {ok: false, motivo: 'lotada', estado: estado_()};
    }
    const numero = voto === 'nulo' ? String(digitado || '').replace(/\D/g, '').slice(0, 3) : '';
    aba.appendRow([new Date(), voto, numero ? "'" + numero : '']);
    SpreadsheetApp.flush();
    const estado = estado_();
    CacheService.getScriptCache().put('placar', JSON.stringify(estado), 2);
    return {ok: true, estado: estado};
  } finally {
    trava.releaseLock();
  }
}

function estado_() {
  const aba = aba_(false);
  const linhas = aba && aba.getLastRow() > 1 ? aba.getRange(2, 1, aba.getLastRow() - 1, 3).getValues() : [];
  const votos = linhas
    .map(function (l) {
      const t = l[0] instanceof Date ? l[0].getTime() : new Date(l[0]).getTime();
      return {t: isNaN(t) ? 0 : t, c: String(l[1]).trim().toLowerCase(), n: String(l[2] || '')};
    })
    .filter(function (v) { return OPCOES.indexOf(v.c) !== -1; })
    .slice(0, ELEITORADO);
  let url = null;
  try { url = ScriptApp.getService().getUrl(); } catch (e) { url = null; }
  return {votos: votos, url: url};
}

function aba_(criar) {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  let aba = planilha.getSheetByName(ABA);
  if (!aba && criar) {
    aba = planilha.insertSheet(ABA);
    aba.appendRow(['Data e hora', 'Voto', 'Número digitado (nulos)']);
    aba.setFrozenRows(1);
    aba.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm:ss');
  }
  return aba;
}

/* ---------- menu da planilha (só funciona dentro do Google Sheets) ---------- */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Apuração')
    .addItem('Zerar todos os votos', 'zerarVotos')
    .addToUi();
}

function zerarVotos() {
  const ui = SpreadsheetApp.getUi();
  const resp = ui.alert('Zerar votos', 'Isso apaga todos os votos da aba "Votos". Continuar?', ui.ButtonSet.YES_NO);
  if (resp !== ui.Button.YES) return;
  const trava = LockService.getScriptLock();
  trava.waitLock(20000);
  try {
    const aba = aba_(true);
    if (aba.getLastRow() > 1) aba.getRange(2, 1, aba.getLastRow() - 1, 3).clearContent();
    CacheService.getScriptCache().remove('placar');
  } finally {
    trava.releaseLock();
  }
  ui.alert('Votos zerados. A votação recomeça do zero.');
}
