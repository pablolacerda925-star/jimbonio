# Roteiro

## Feito

- Inventário dos 11 PDFs e cobertura por tema (`03`, `04`).
- Decisões do usuário registradas (`02`).
- Busca externa do tema IC (`06`).
- Piloto v0.1 (rejeitado: texto demais) em `legado/`.
- Piloto v0.2 em `src/`: fluxo de IC e EAP com cinco medicamentos, testado (50 contas, 29 casos no Chrome de computador em largura de celular).
- Lote 1 (v0.3): PCR, taquiarritmia com pulso (com cardioversão) e bradiarritmia, pelos algoritmos da AHA 2025. 15 medicamentos novos. Testes: 78 contas e 96 casos no navegador. "Novo atendimento" agora pergunta o tema; os medicamentos da busca e do rodapé são os do tema.

- v0.4: interface refeita como fluxograma vivo por paciente (pedido em `08`); lote 1 conferido contra CNP e DRG. Testes: 91 contas e 104 casos no navegador.
- v0.5: entrada por sinais e sintomas com hipóteses, perguntas ao paciente e à família, plano de cada medicamento (pedido em `09`). Testes: 91 contas e 127 casos no navegador.
- v0.6: fluxograma de cartões, texto livre de sintomas, sinais vitais só quando decidem, resumo atrás de botão (pedido em `10`). Testes: 91 contas e 94 casos no navegador.

## Em aberto com o usuário

1. Confirmar que o formato v0.6 é o desejado (v0.2, v0.3 e, em parte, v0.4 e v0.5 foram criticados).
2. Senha dos atendimentos: voltar como opção?
3. Trauma: precisa do protocolo do SAMU 192 (Ministério da Saúde) ou de outro PDF; a rede bloqueou o download.
4. PSZ2 recebido em 12/11; falta a conferência completa do lote 1 contra ele.

## Ordem dos lotes

| Lote | Temas | Fontes principais |
| --- | --- | --- |
| 1 | Parada cardiorrespiratória, taquiarritmias com pulso, bradiarritmias, cardioversão | ACLS-F, ACLS-T, ACLS-B, CNP 77-117, PSZ2 8-15, DRG 62-67 e 88 |
| 2 | Sepse e choque séptico, choque cardiogênico, anafilaxia, intubação e sedoanalgesia, drogas vasoativas, VNI e ventilação | ILAS-F, DRG, CNP 66-70 e 139-151, PSZ2 154-156, 165-169, 193-204 |
| 3 | Síndrome coronariana aguda, urgência e emergência hipertensiva, dissecção de aorta, TEP e TVP | CNP, PSZ2 15-27, DRG 51-58 e 69-86 |
| 4 | AVC isquêmico, AVC hemorrágico e HSA, crise convulsiva, cefaleia, vertigem | CNP 152-177, DRG 69-74, PSZ2 27-39 |
| 5 | Asma, DPOC, pneumonia, cetoacidose, hipoglicemia, distúrbios hidroeletrolíticos | PSZ2 39-47, 95-102, 132-141 |
| 6 | Infecção urinária, dengue, infecções de pele, diarreia e vômitos, hemorragia digestiva, pancreatite e vias biliares, abdome agudo, cólica nefrética | PSZ2 |
| 7 | Intoxicações, animais peçonhentos, psiquiatria, dor | PSZ2 |
| 8 | Temas ambulatoriais, hemocomponentes, antimicrobianos, receitas de alta | DRV, PSZ2 |

Os atalhos da tela inicial ficam em dois grupos separados: "Atendimento imediato" (lotes 1 e 2) e "Frequentes" (lotes 5 e 6). Frequência não é gravidade.

## Como fazer um lote

1. Ler as páginas do lote. Nos PDFs de imagem (CNP, DRG) e em qualquer tabela ou fluxograma, olhar a página rasterizada.
2. Listar o que falta para o fluxo andar (critérios, exames, reavaliação, destino) e buscar em diretriz de sociedade, Ministério da Saúde ou bula. Guardar a referência com seção e página.
3. Onde os PDFs divergirem, escolher uma conduta: diretriz mais recente quando houver; na dúvida, PS Zerado 2ª edição. Anotar em `05`.
4. Escrever o quadro em `src/fluxo.js` no formato descrito no `CLAUDE.md` (manejo inicial, gravidade, investigar, exames, classificar, passos, reavaliação, alertas, destino), com `como` e `ref` em cada item.
5. Acrescentar em `testes/calc.test.js` as contas à mão de cada dose e, em `testes/e2e.py`, pelo menos um caminho completo por ramo.
6. `python3 build.py`, rodar os dois testes, abrir `dist/guia-ps.html` no computador e em largura de celular.
7. Entregar com um resumo curto: o que entrou, quais condutas foram escolhidas entre opções, o que ficou pendente.

## Funcionalidades ainda não feitas

- Senha opcional e backup por arquivo dos atendimentos (havia no v0.1, em `legado/app.js`: PBKDF2 + AES-GCM pelo Web Crypto; pode ser reaproveitado).
- Encerrar e arquivar atendimento; hoje ele só fica marcado como encerrado ao chegar ao fim.
- Voltar e corrigir já funciona; falta marcar no histórico o que mudou depois de uma correção.
- Tela de triagem por queixa quando houver mais de um tema possível.
- Aviso de outro protocolo (ex.: choque cardiogênico) com confirmação do médico, e mais de um problema no mesmo atendimento.
- Prescrição de alta ao escolher "Alta".
- Pediatria e gestantes.
- Teste em iPhone e Android; hospedagem com HTTPS; cache offline da versão hospedada; indicador de versão do conteúdo.
- Processo para incorporar PDF novo (lista do que acrescenta, altera e contradiz).

## Relatórios originais (artifacts no Claude)

- Fases 1 e 2, inventário e cobertura: https://claude.ai/artifact/PHhJKicJSpvUTSAwVymWi7
- Fase 3, estrutura e arquitetura: https://claude.ai/artifact/6gnPC2EaWCLQ5LWRPQX6V8
- Fase 4, achados externos do piloto e relatório de conferência: https://claude.ai/artifact/11SrpirvjV3wVnNXsde5vP
