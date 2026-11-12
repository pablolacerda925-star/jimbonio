# Pedido do v0.6 (12/11/2026, tarde)

Crítica ao v0.5, nas palavras do usuário, com dois modelos de tela (cartões em linha ligados por setas; interruptor "Entrada por sintomas / Queixa" × "Ir direto para doença"; cabeçalho "Paciente 01 • 68 anos • Leito 04"):

1. "Eu quero escrever os sintomas e quero que o site já me dê a conduta baseado nos sintomas e depois de examinar pode mudar a conduta."
2. "Essa barra verde lateral pode ser bem menor."
3. "Tem muita informação na tela, muita letra, precisa ser algo mais dinâmico, mais fácil de identificar, a intenção é realmente ficar parecendo um fluxograma dinâmico."
4. "Não precisa ter os sinais vitais lá em cima; cobre só quando for definidor de conduta no meio do fluxograma, e apenas os sinais que serão usados."
5. "O resumo das coisas do lado pode aparecer quando eu clicar em um botão e não a todo momento. A barra lateral pode ser menor também."
6. "Mandei dois modelos [...] pra tirar esse ar de blog dos anos 2000."

## O que foi feito

| Pedido | No site |
| --- | --- |
| 1 | Caixa de texto livre logo abaixo do cabeçalho, com o cursor nela ao abrir o atendimento. O texto é lido a cada letra: sintomas, achados de exame, negação, história (remédios que baixam a frequência, asma, sildenafila) e sinais vitais (FC, sat, PA, FR). Conduta, hipóteses e cartões se atualizam na hora. Marcar à mão depois (exame) vale por cima do texto. |
| 2 e 5 | Trilho de pacientes de 58 px com "01", "02" ou iniciais. Resumo, pendências e linha do tempo num painel que abre pelo botão "Resumo" (com contador). |
| 3 e 6 | Fluxograma de cartões com setas. Cada cartão: ícone, título curto, uma decisão ou ação. O cartão "Agora" fica destacado. Detalhes ao tocar (o cartão se abre no lugar). Interruptores no lugar das abas. No celular, cartões em coluna com setas para baixo. |
| 4 | Barra de sinais vitais removida. Cada quadro declara os sinais que decidem a conduta (`pedeVitais`): entrada por sintomas pede FC e saturação; IC pede PAS só quando há congestão; os demais quadros não pedem. Peso só na calculadora. |

## Regras do site (não vêm de diretriz)

- "Compatível" = dois ou mais motivos a favor e nenhum contra; "Possível" = um a favor; "Pouco provável" = algum contra.
- Negação: "sem", "nega", "negou", "não", "ausência" até três palavras antes do termo.
- Trauma escrito no texto mostra o cartão "Ainda sem protocolo" (nenhum PDF tem trauma).
