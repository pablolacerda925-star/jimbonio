# Guia de PS

Site em HTML, em português do Brasil, que conduz o atendimento no pronto-socorro passo a passo: queixa ou doença → perguntas → conduta → medicação já calculada → reavaliação → destino. É apoio à decisão do médico, não substituto. O dono do projeto vai usar em plantão e, mais tarde, talvez compartilhar com colegas.

**Estado atual:** v0.3 com quatro temas: insuficiência cardíaca e edema agudo de pulmão (piloto) e o lote 1 (parada cardiorrespiratória, taquiarritmia com pulso, bradiarritmia). O formato de uma decisão por tela ainda não recebeu um "aprovado" explícito. O lote 1 foi escrito só com AHA 2025, MED e PSZ1; falta conferir contra PSZ2, CNP e DRG. Próximo: essa conferência e o lote 2.

## Regras de produto (valem acima de tudo)

O usuário foi enfático; estas regras substituem o que o prompt original (`docs/01-prompt-original.txt`) dizia sobre mostrar fontes e alternativas na tela.

1. **É para usar com pressa, batendo o olho.** Não é material de estudo. Pouco texto: título e, no máximo, duas ou três linhas curtas por tela.
2. **Uma decisão por tela.** Pergunta grande, botões grandes, barra "Etapa n de 5". Nada de formulário longo. Referência visual: `docs/referencias-visuais/exemplo-2-uma-pergunta-por-tela.png`.
3. **Uma conduta só.** Nunca mostrar opções lado a lado nem dizer de que fonte veio. Escolher a melhor e manter. Ordem de escolha: resolução já registrada em `docs/02-decisoes.md` → na dúvida, **PS Zerado 2ª edição**.
4. **Referências escondidas.** Nenhuma citação no meio do fluxo. Ficam no "Referências" do rodapé, visíveis só ao tocar.
5. **Medicação = "Dei" / "Não vou dar" / "Não tem aqui"**, e o fluxo segue. A dose aparece calculada (mL ou mL/h); só pede o peso quando o cálculo precisa.
6. **Amigável.** Um médico de 60 anos tem que entender sem explicação. Nada com cara de sistema corporativo.
7. **Não parar para pedir aprovação de cada fonte ou conflito.** Decidir, registrar em `docs/`, e listar no fim do lote o que foi escolhido.

## Regras de segurança (invisíveis para o usuário, mas obrigatórias)

- Todo número clínico vem de `src/fluxo.js`. `src/ui.js` não contém dose, limiar nem texto clínico.
- Cada nó e cada medicamento de `fluxo.js` tem um campo `ref` com documento e página. Sem `ref`, não entra.
- Calculadora nunca mostra resultado com entrada inválida, peso ausente ou valor fora da faixa documentada. Faixas de tabela não são interpoladas nem estendidas (ex.: bolus por PAS não cobre PAS = 200).
- Campo vazio nunca vale "não". Calcular não registra como dado.
- Dados de um atendimento nunca aparecem em outro. Paciente ativo sempre visível.
- Leitura dos PDFs: dois livros são digitalizados e o texto extraído troca caracteres ("Smg/ml" = 5 mg/mL). **Todo número deles tem que ser conferido olhando a imagem da página.** Detalhes em `docs/03-fontes.md`.
- Valor ilegível ou suspeito no PDF: não deduzir. Buscar em diretriz de sociedade, Ministério da Saúde ou bula da Anvisa, usar o valor confirmado e anotar em `docs/05-conflitos-e-valores-suspeitos.md`.
- Fontes externas aceitas: só diretrizes vigentes de sociedades de especialidade, Ministério da Saúde e bulas aprovadas pela Anvisa. Portais de ensino servem para localizar o documento, não como fonte.

## Comandos

```bash
python3 build.py                  # gera dist/guia-ps.html (arquivo único, abre offline)
node testes/calc.test.js          # 78 contas das calculadoras conferidas à mão
python3 testes/e2e.py             # 96 casos simulados no navegador (precisa de playwright)
CHROME=/caminho/do/chrome python3 testes/e2e.py   # se não houver Chromium do Playwright
```

Rodar os três depois de qualquer mudança. Ao acrescentar medicamento ou tema, acrescentar as contas à mão em `calc.test.js` e um caminho completo em `e2e.py`.

## Estrutura

| Caminho | O que é |
| --- | --- |
| `src/fluxo.js` | Conteúdo clínico: temas, nós do fluxo, medicamentos, notas. Único lugar com números. |
| `src/calc.js` | Funções puras de cálculo (bolus, infusão, inverso, faixa de PAS). |
| `src/ui.js` | Interface: motor do fluxo, telas, registro, busca. |
| `src/estilo.css` | Visual (fundo claro quente, verde, botões de 66 px). |
| `dist/guia-ps.html` | Saída do build. É o que o usuário abre. |
| `testes/` | Testes de cálculo e de navegador. |
| `legado/` | Piloto v0.1 (rejeitado pelo excesso de texto). `conteudo.js` continua útil: tem o mapeamento detalhado conteúdo → fonte → página da IC e o registro das divergências. |
| `pdfs/` | Os 11 PDFs-fonte. Não versionados (material licenciado). Ver `pdfs/LEIA-ME.md`. |
| `docs/` | Contexto do projeto. Ler `02`, `03` e `07` antes de começar um lote. |

## Como o fluxo é descrito (`src/fluxo.js`)

Cada tema tem `nome`, `curto`, `etapas` (5 rótulos), `inicio` e `nos` (`perfil: 1` só na IC). Tipos de nó:

- `pergunta`: `t`, `ops[{t, set, log, ir, sec, sug}]`
- `acao`: `t`, `linhas[]`, `chips[]` (estáticos), `ops[]`
- `sinais`: lista de sinais tocáveis; um ou mais marcados destacam o botão "sim" como sugerido; `irSim` e `irNao` separam os caminhos
- `numero`: grava um valor (hoje só PAS)
- `med`: abre o cartão do medicamento e segue para `ir`; com `sem`, "Não tem aqui" vai para outro nó (ex.: amiodarona → lidocaína)
- `reav`: só aparece se o medicamento `gatilho` foi dado; mostra o horário (+`horas`)
- `rota`: desvio sem tela, por `perfil`, `pasMin`, `pasMax`
- `fim`: resumo copiável

Medicamentos: `modo: "furo"` (bolus com escolha de dose), `modo: "fixo"` (dose fixa em mg; `ap` é a ampola e o site calcula mL e ampolas), `modo: "kg"` (bolus em mg/kg; pede o peso) ou `modo: "inf"` (infusão; `conc` em mcg/mL ou `mgMl` para dose em mg/h; `ini`, `manter`, `max`, `porKg`). `lembra` mostra no topo o horário da próxima dose.

O algoritmo de PCR é um laço: os nós repetidos são montados pelas funções `pcrRitmo` e `pcrChoque` no começo de `fluxo.js`.

## Onde paramos e o que falta

Ver `docs/07-roteiro.md`. Resumo:

- Feito: inventário dos PDFs, cobertura por tema, decisões, busca externa da IC, piloto v0.2 testado, lote 1 testado.
- Falta no tema IC: terapia oral do perfil A e prescrição de alta (CNP p. 72-74, ainda não conferidas por imagem); confirmar no bulário da Anvisa a bula de dobutamina.
- Falta no site: senha opcional para os atendimentos (foi retirada no v0.2), teste em iPhone e Android, hospedagem, modo offline da versão hospedada, pediatria e gestantes.
- Falta no lote 1: conferir contra PSZ2, CNP e DRG; dose de magnésio na torsades; cuidados pós-PCR; sedação da cardioversão; ampola de atropina do serviço. Ver `docs/05`.
- Próximo: lote 2.
