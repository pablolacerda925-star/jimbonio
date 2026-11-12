# Guia de PS

Site em HTML, em português do Brasil, que acompanha o atendimento no pronto-socorro como um fluxograma vivo: sinais e sintomas ou diagnóstico → manejo inicial → achados e exames → classificação e conduta → medicamento com cálculo → reavaliação → destino → passagem de caso. É apoio à decisão do médico, não substituto. O dono do projeto vai usar em plantão e, mais tarde, talvez compartilhar com colegas.

**Estado atual:** v0.6: fluxograma de cartões, entrada por texto livre de sintomas (pedido de 12/11/2026 à tarde em `docs/10-pedido-v06.md`). O formato de "uma pergunta por tela" (v0.2 e v0.3) foi rejeitado em 11/11/2026: ficou cru, com pouca informação, "parecendo um jogo". O formato atual é o **fluxograma de cartões**: cartões curtos ligados por setas, cada um com só o essencial, que se abrem no lugar para mostrar detalhes. Quatro protocolos (parada cardiorrespiratória, taquiarritmia com pulso, bradiarritmia, IC e edema agudo de pulmão) e a entrada por sinais e sintomas, que leva a eles. Ainda sem "aprovado" explícito. **Trauma não está em nenhum dos 11 PDFs** e a rede da sessão bloqueou o protocolo do Ministério da Saúde; ver `docs/09`. Próximo: trauma (quando houver fonte) e lote 2.

## Regras de produto (valem acima de tudo)

Os pedidos do usuário de 11/11/2026 (`docs/08-pedido-v04.md`) e de 12/11/2026 (`docs/09-pedido-v05.md` e `docs/10-pedido-v06.md`) substituem as regras antigas de "uma decisão por tela" e "referências só no rodapé".

1. **Guia de bolso interativo e integrado**, da chegada à passagem de caso. Limpo e rápido, mas **completo**: cara de aplicativo hospitalar, não de jogo.
2. **Manejo inicial visível assim que o quadro abre.** Nada de questionário antes. Ações urgentes continuam à vista enquanto se investiga.
3. **Mostrar não é executar.** Cada ação tem estado: pendente, feita, não feita (com motivo). Cada medicamento: consultado, prescrito, administrado, em registros separados.
4. **"Ausente" é diferente de "não avaliado".** Campo vazio nunca vale "não". Exame sem resultado nunca é presumido normal ("Não sei interpretar" existe).
5. **Cada orientação abre "como fazer" e "fonte"** ao toque. A fonte não aparece no meio do texto, só ao tocar.
6. **O fluxo se adapta.** Achados, sinais vitais e resultados atualizam classificação e conduta. Corrigir um dado revisa o que depende dele e avisa o que mudou.
7. **Uma conduta só** por situação (não listar alternativas lado a lado). Ordem de escolha: decisão em `docs/02-decisoes.md` → diretriz mais recente → PS Zerado 2ª edição.
8. **Medicamento abre pop-up** com dose, via, intervalo, preparo, cuidados e calculadora. A calculadora não presume ampola, concentração nem dose: o médico toca na apresentação ou no preparo do documento. Mostra dose, volume a aspirar, concentração final, velocidade e a fórmula, separando diluente de volume final.
9. **Hipótese sugerida não é diagnóstico.** Troca de fluxo só com confirmação do médico, no mesmo paciente, preservando o histórico.
10. **Passagem de caso a qualquer momento**, curta e detalhada, editável, só com o que foi registrado.
11. **Vários pacientes** ("Paciente 01" enquanto não houver nome), sem misturar dados.
12. **Não parar para pedir aprovação de cada fonte ou conflito.** Decidir, registrar em `docs/`, listar no fim.
13. **Entrada por sinais e sintomas é o caminho principal** (pedido mais importante de 12/11): o médico marca o que vê, recebe a pré-conduta na hora, as hipóteses aparecem e se reordenam a cada achado, e ao escolher uma hipótese abre o protocolo levando os dados. Diagnóstico direto continua possível.
14. **Medicamento tem que responder de relance: quanto, a cada quanto tempo, quantas vezes, quantas já foram e quando é a próxima.** Conduta numerada na ordem (1º, 2º, 3º).
15. **Cada quadro traz o que perguntar ao paciente e o que perguntar a familiares**, com Sim / Não / Não sabe. Cada pergunta existe porque muda uma decisão documentada.
16. **Pouca letra na tela, cara de fluxograma** (12/11 à tarde: "muita informação, muita letra", "ar de blog dos anos 2000"). Cada cartão mostra só a decisão ou a ação; "como fazer", fonte, a favor/contra e cuidados ficam ao abrir o cartão. Visual dos modelos do usuário: fundo bege claro, cartões brancos arredondados, verde suave, setas entre cartões, interruptores.
17. **Sintomas por texto livre.** O médico escreve; o site reconhece sintomas, achados, negação ("sem", "nega"), história (remédios, asma) e sinais vitais (FC, sat, PA, FR), e dá a conduta na hora. O exame depois pode mudar a conduta.
18. **Sinais vitais só quando decidem a conduta**, como cartão no meio do fluxo (`pedeVitais`), e só os que serão usados. Nada de barra de sinais vitais no topo.
19. **Resumo, pendências e linha do tempo só ao tocar no botão "Resumo".** Trilho de pacientes estreito (58 px).

## Regras de segurança (invisíveis para o usuário, mas obrigatórias)

- Todo número clínico vem de `src/fluxo.js`. `src/ui.js` não contém dose, limiar nem texto clínico.
- Cada ação, achado, exame, pergunta, hipótese, conduta e medicamento de `fluxo.js` tem um campo `ref` com documento e página. Sem `ref`, não entra (o teste de cálculo confere).
- Calculadora nunca mostra resultado com entrada inválida, peso ausente ou valor fora da faixa documentada. Faixas de tabela não são interpoladas nem estendidas (ex.: bolus por PAS não cobre PAS = 200).
- Campo vazio nunca vale "não". Calcular não registra como dado.
- Dados de um atendimento nunca aparecem em outro. Paciente ativo sempre visível.
- Leitura dos PDFs: dois livros são digitalizados e o texto extraído troca caracteres ("Smg/ml" = 5 mg/mL). **Todo número deles tem que ser conferido olhando a imagem da página.** Detalhes em `docs/03-fontes.md`.
- Valor ilegível ou suspeito no PDF: não deduzir. Buscar em diretriz de sociedade, Ministério da Saúde ou bula da Anvisa, usar o valor confirmado e anotar em `docs/05-conflitos-e-valores-suspeitos.md`.
- Fontes externas aceitas: só diretrizes vigentes de sociedades de especialidade, Ministério da Saúde e bulas aprovadas pela Anvisa. Portais de ensino servem para localizar o documento, não como fonte.

## Comandos

```bash
python3 build.py                  # gera dist/guia-ps.html (arquivo único, offline) e dist/guia-ps-online.html (página publicada)
node testes/calc.test.js          # 91 contas das calculadoras conferidas à mão
python3 testes/e2e.py             # 94 casos simulados no navegador (precisa de playwright)
CHROME=/caminho/do/chrome python3 testes/e2e.py   # se não houver Chromium do Playwright
```

Rodar os três depois de qualquer mudança. Ao acrescentar medicamento ou tema, acrescentar as contas à mão em `calc.test.js` e um caminho completo em `e2e.py`.

## Estrutura

| Caminho | O que é |
| --- | --- |
| `src/fluxo.js` | Conteúdo clínico: quadros, entrada por sinais e sintomas, perguntas, medicamentos e seus planos. Único lugar com números. |
| `src/calc.js` | Funções puras de cálculo (bolus, infusão, inverso, faixa de PAS). |
| `src/ui.js` | Interface: trilho de pacientes, leitura do texto livre, cartões do fluxograma (`nos()`), pop-up do medicamento com calculadora, resumo, passagem de caso. |
| `src/estilo.css` | Visual: fundo bege, cartões brancos, verde suave, setas; no celular os cartões empilham com setas para baixo. |
| `dist/guia-ps.html` | Saída do build. É o que o usuário abre. |
| `testes/` | Testes de cálculo e de navegador. |
| `legado/` | Piloto v0.1 (rejeitado pelo excesso de texto corrido). `conteudo.js` continua útil: tem o mapeamento detalhado conteúdo → fonte → página da IC e o registro das divergências. |
| `pdfs/` | Os 11 PDFs-fonte. Não versionados (material licenciado). Ver `pdfs/LEIA-ME.md`. |
| `docs/` | Contexto do projeto. Ler `02`, `03`, `07`, `08` e `09` antes de começar um lote. |

## Como o conteúdo é descrito (`src/fluxo.js`)

Cada quadro (tema) tem:

- `agora`: ações do manejo inicial (`t`, `como[]`, `ref`).
- `gravidade`: sinais de instabilidade ou risco imediato (presente / ausente / não avaliado).
- `investigar`: achados. `tipo: "tri"` (com `sinais[]` opcionais para tocar) ou `tipo: "opc"` (uma opção, ex.: ritmo).
- `exames`: `res[]` (opções de resultado) ou `num` (valor com corte, quando a decisão depende do número).
- `classificar(P)`: devolve `itens` (classificação sugerida, com o porquê) e `falta` (o que ainda precisa ser avaliado).
- `passos`: condutas; cada uma aparece quando `se(P)` é verdadeiro. Itens: `acao` (com `rep` para ações repetidas, como choque), `med`, `info`. `dica(P)` escreve o "Agora:".
- `reav`: reavaliações com opções e "como seguir" (`prox`); `quando` gera horário a partir de um medicamento.
- `alertas`: sugestão de outro fluxo (`ir`) ou aviso de fluxo ainda inexistente (`ir: null`), sempre com `porque`.
- `destino`.
- `pedeVitais`: `[{ k, se(P), por, ref }]`, sinais vitais que viram cartão quando decidem a conduta.
- `decide: 1` num item de `investigar`: vira cartão próprio no fluxo; os demais vão para o cartão "Perguntar e examinar".
- `perguntar`: `{ paciente: [], familia: [] }`, definido em `PERG` no fim do arquivo. `P.p(id)` lê a resposta ("s", "n", "ns").
- Só no quadro `sind` (entrada por sinais e sintomas): `investigar` aceita `tipo: "lista"` (itens tocáveis, `P.tem(lista, k)`) e há `hipoteses`: cada uma com `favor(P)` e `contra(P)` (listas de motivos), `confirmar`, `enquanto`, `tema` (protocolo a abrir, ou `null`) e `levar(P)` (achados que seguem para o protocolo).

Texto livre: `FLUXO.sintomas` (termos sem acento → item `l.k`, sinal de instabilidade `g` ou pergunta `perg`), `FLUXO.negacao`, `FLUXO.semProtocolo`. O texto preenche uma camada separada (`d.tx`); o que o médico marca à mão vale por cima.

`P` é o leitor dos dados do paciente: `P.a(id)`, `P.o(id)`, `P.n(sinalVital)`, `P.ex(id)`, `P.adm(med)`, `P.cont(acao)`, `P.r(reav)`, `P.p(pergunta)`, `P.tem(lista, k)`.

Medicamentos: `ind`, `dose[]`, `prep[]`, `cuid[]`, `ref` e o cálculo por `modo`: `fixo` (`doses[]`, `aps[]`), `kg` (`faixas[]`), `furo`, `inf` (`preps[]`, `un`, `ini`, `max`, `porKg`; `mgMl` para mg/h; `fator` para mg/min), `txt` (sem cálculo). `conc` é a concentração do primeiro preparo e é conferida no teste. `plano` (em `PLANO`, no fim do arquivo): `q` quanto, `rep` quando repetir, `max` limite, `maxN` nº máximo de doses, `intMin` minutos até poder repetir.

## Onde paramos e o que falta

Ver `docs/07-roteiro.md`. Resumo:

- Feito: inventário dos PDFs, cobertura por tema, decisões, busca externa da IC, lote 1 (conferido contra CNP e DRG), fluxograma vivo (v0.4), entrada por sinais e sintomas, perguntas e plano de medicamentos (v0.5), fluxograma de cartões com texto livre (v0.6).
- Falta no tema IC: terapia oral do perfil A e prescrição de alta (CNP p. 72-74, ainda não conferidas por imagem); confirmar no bulário da Anvisa a bula de dobutamina.
- Falta no site: senha opcional para os atendimentos (foi retirada no v0.2), teste em iPhone e Android, hospedagem, modo offline da versão hospedada, pediatria e gestantes.
- Falta no lote 1: conferência completa contra o PSZ2 (recebido em 12/11; só as páginas de arritmia foram comparadas); cuidados pós-PCR. Ver `docs/05`.
- Falta: quadro de trauma e mais síndromes de entrada (dor torácica, rebaixamento, dor abdominal); dependem de fonte externa.
- Próximo: trauma (quando houver fonte) e lote 2.

## Ambiente

- Página publicada (privada, do usuário): https://claude.ai/artifact/QFiq2NBB8dKBBPB7hNc8Wk . Para atualizar no mesmo link: `python3 build.py` e publicar `dist/guia-ps-online.html` com a ferramenta Artifact passando esse link em `url`. Os atendimentos ficam só no navegador de cada aparelho (localStorage); não passam de um aparelho para outro.

- O projeto fica em `guia-ps/` dentro do repositório `jimbonio` (que também tem um site de agenda, sem relação). Branch de trabalho: `claude/new-session-vnm2c8`.
- Para os testes de navegador na nuvem: `pip install playwright` e `CHROME=/opt/pw-browsers/chromium python3 testes/e2e.py`.
- OCR dos PDFs de imagem: `apt-get update && apt-get install -y tesseract-ocr tesseract-ocr-por`.
- A rede da sessão pode bloquear sites externos (`www.gov.br`, `bvsms.saude.gov.br`); nesse caso pedir o PDF ao usuário.
