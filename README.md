# Apuração do Grupo (zap1)

Sátira entre amigos: urna e apuração ao vivo do "2º turno" do grupo, com Haanet (69), Biel (24) e Carlos (104).
A votação fecha sozinha no 300º voto. Os votos ficam numa planilha do Google (aba **Votos**: horário e voto, sem identificar ninguém).

## Como funciona

- O site está na Vercel (projeto **eleicoes2069**). Cada push na `main` publica sozinho.
- Os votos ficam na planilha **"Apuração do Grupo - votos"** do Google Drive, aba **Votos** (horário e voto, sem identificar ninguém).
- A ponte entre os dois é o `Code.gs`, publicado como App da Web no Apps Script da planilha. A função `api/votos.js` da Vercel lê e grava por ele.
- Para zerar votos de teste, apague as linhas da aba **Votos** (mantenha o cabeçalho).
- Se o Apps Script for publicado de novo com outro link, troque o link em `api/votos.js` ou crie a variável `APPS_SCRIPT_URL` na Vercel.

## Arquivos

- `Code.gs` — Apps Script da planilha (API de votos: GET placar, POST voto, fecha no 300º)
- `api/votos.js` — API da Vercel (lê e grava os votos na planilha pelo Apps Script)
- `index.html` — a página (urna, apuração, plantão, mapa, plenário, gráfico e planos de governo)
