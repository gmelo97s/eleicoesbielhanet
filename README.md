# Apuração do Grupo (zap1)

Sátira entre amigos: urna e apuração ao vivo do "2º turno" do grupo, com Haanet (69), Biel (24) e Carlos (104).
A votação fecha sozinha no 300º voto. Os votos ficam numa planilha do Google (aba **Votos**: horário e voto, sem identificar ninguém).

## Publicar na Vercel

1. Importe este repositório na Vercel (cada push na `main` publica sozinho).
2. No projeto da Vercel: **Storage → Create Database → Upstash Redis** (plano grátis) e conecte ao projeto.
3. Faça um **Redeploy**. Pronto: os votos ficam no Redis e todo mundo vê a mesma apuração.
4. Opcional, para zerar votos de teste: crie a variável `ZERAR_CHAVE` em Settings → Environment Variables e
   acesse `DELETE /api/votos?chave=SUA_CHAVE` (ex.: `curl -X DELETE "https://SEU-SITE.vercel.app/api/votos?chave=SUA_CHAVE"`).

## Arquivos

- `Code.gs` — código do Google Apps Script (grava os votos na planilha e serve a página)
- `api/votos.js` — API da Vercel (lê e grava os votos no Upstash Redis)
- `index.html` — a página (urna, apuração, plantão, mapa, plenário, gráfico e planos de governo)

## Alternativa: publicar pelo Google Sheets (Apps Script)

1. Abra [sheets.new](https://sheets.new) e dê um nome à planilha.
2. **Extensões → Apps Script**.
3. Cole o conteúdo de `Code.gs` no arquivo Code.gs.
4. **+ → HTML**, chame de `index` e cole o conteúdo de `index.html`. Salve.
5. **Implantar → Nova implantação → App da Web**. Executar como: *Eu*. Quem pode acessar: *Qualquer pessoa*. Autorize.
6. Mande o link que termina em `/exec` no grupo.

Para limpar os votos de teste: na planilha, menu **Apuração → Zerar todos os votos**.
Para atualizar depois de mudar o código: **Implantar → Gerenciar implantações → lápis → Nova versão**.
