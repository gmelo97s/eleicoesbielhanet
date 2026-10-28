# Apuração do Grupo (zap1)

Sátira entre amigos: urna e apuração ao vivo do "2º turno" do grupo, com Haanet (69), Biel (24) e Carlos (104).
A votação fecha sozinha no 300º voto. Os votos ficam numa planilha do Google (aba **Votos**: horário e voto, sem identificar ninguém).

## Arquivos

- `Code.gs` — código do Google Apps Script (grava os votos na planilha e serve a página)
- `index.html` — a página (urna, apuração, plantão, mapa, plenário, gráfico e planos de governo)

## Como publicar

1. Abra [sheets.new](https://sheets.new) e dê um nome à planilha.
2. **Extensões → Apps Script**.
3. Cole o conteúdo de `Code.gs` no arquivo Code.gs.
4. **+ → HTML**, chame de `index` e cole o conteúdo de `index.html`. Salve.
5. **Implantar → Nova implantação → App da Web**. Executar como: *Eu*. Quem pode acessar: *Qualquer pessoa*. Autorize.
6. Mande o link que termina em `/exec` no grupo.

Para limpar os votos de teste: na planilha, menu **Apuração → Zerar todos os votos**.
Para atualizar depois de mudar o código: **Implantar → Gerenciar implantações → lápis → Nova versão**.
