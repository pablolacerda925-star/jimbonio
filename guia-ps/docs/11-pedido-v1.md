# Pedido da v1.0 (12/11/2026)

Nas palavras do usuário: "Muda tudo, só quero escolher a doença e que você me fale a prescrição e exames dela, todas as doenças que mandei."

## O que foi feito

- Interface nova: lista de doenças por sistema, busca (nome, sigla, medicamento), página da doença com abas Prescrição e Exames, copiar prescrição. A v0.6 foi para `legado/v06/`.
- 110 doenças do PS Zerado 2ª edição, extraídas do texto nativo do PDF (o arquivo recebido tem 4 páginas por folha; cada quadrante é lido em separado). O programa usa a fonte e a cor do livro para separar título, medicamento (vermelho), rótulo (laranja), marcadores de lista, setas e tabelas.
- 3 doenças que saíram da 2ª edição, do PS Zerado anterior: crise convulsiva, delirium, síndrome serotoninérgica. Síndrome neuroléptica maligna não está em nenhum dos dois.
- Parada cardiorrespiratória montada com a AHA 2025 (o PS Zerado não tem).
- Exames com fonte em 7 doenças (sepse pelo ILAS; IC pela SBC 2026; arritmias e PCR pela AHA 2025 e CNP). Nas outras, a aba mostra o que o guia cita ou avisa que não há exames nos documentos.
- Notas da diretriz mais recente onde ela difere do guia (IC: furosemida, nitroglicerina, nitroprussiato, dobutamina; TV: amiodarona; FA: metoprolol), seguindo `docs/02`.

## Não feito

- Doenças só do Cardiologia na Prática e do Drive de Prescrições (receitas de alta).
- Exames para a maioria das doenças (falta fonte).
