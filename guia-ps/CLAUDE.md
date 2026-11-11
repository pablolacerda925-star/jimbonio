# Guia de PS

Site em HTML, em português do Brasil, que acompanha o atendimento no pronto-socorro como um fluxograma vivo: quadro → manejo inicial → achados e exames → classificação e conduta → medicamento com cálculo → reavaliação → destino → passagem de caso. É apoio à decisão do médico, não substituto. O dono do projeto vai usar em plantão e, mais tarde, talvez compartilhar com colegas.

**Estado atual:** v0.4. O formato de "uma pergunta por tela" (v0.2 e v0.3) foi rejeitado em 11/11/2026: ficou cru, com pouca informação, "parecendo um jogo". O formato atual é o **fluxograma vivo por paciente**, descrito abaixo. Quatro quadros: parada cardiorrespiratória, taquiarritmia com pulso, bradiarritmia, IC e edema agudo de pulmão. O v0.4 ainda não recebeu "aprovado". Falta o PS Zerado 2ª edição para conferir o lote 1. Próximo: lote 2.

## Regras de produto (valem acima de tudo)

O pedido do usuário de 11/11/2026 (roteiro completo em `docs/08-pedido-v04.md`) substitui as regras antigas de "uma decisão por tela" e "referências só no rodapé".

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
node testes/calc.test.js          # 91 contas das calculadoras conferidas à mão
python3 testes/e2e.py             # 104 casos simulados no navegador (precisa de playwright)
CHROME=/caminho/do/chrome python3 testes/e2e.py   # se não houver Chromium do Playwright
```

Rodar os três depois de qualquer mudança. Ao acrescentar medicamento ou tema, acrescentar as contas à mão em `calc.test.js` e um caminho completo em `e2e.py`.

## Estrutura

| Caminho | O que é |
| --- | --- |
| `src/fluxo.js` | Conteúdo clínico: temas, nós do fluxo, medicamentos, notas. Único lugar com números. |
| `src/calc.js` | Funções puras de cálculo (bolus, infusão, inverso, faixa de PAS). |
| `src/ui.js` | Interface: pacientes, fluxo por blocos, pendências, pop-up do medicamento com calculadora, passagem de caso. |
| `src/estilo.css` | Visual (fundo claro quente, verde; barra de pacientes, blocos numerados, painel lateral). |
| `dist/guia-ps.html` | Saída do build. É o que o usuário abre. |
| `testes/` | Testes de cálculo e de navegador. |
| `legado/` | Piloto v0.1 (rejeitado pelo excesso de texto corrido). `conteudo.js` continua útil: tem o mapeamento detalhado conteúdo → fonte → página da IC e o registro das divergências. |
| `pdfs/` | Os 11 PDFs-fonte. Não versionados (material licenciado). Ver `pdfs/LEIA-ME.md`. |
| `docs/` | Contexto do projeto. Ler `02`, `03` e `07` antes de começar um lote. |

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

`P` é o leitor dos dados do paciente: `P.a(id)`, `P.o(id)`, `P.n(sinalVital)`, `P.ex(id)`, `P.adm(med)`, `P.cont(acao)`, `P.r(reav)`.

Medicamentos: `ind`, `dose[]`, `prep[]`, `cuid[]`, `ref` e o cálculo por `modo`: `fixo` (`doses[]`, `aps[]`), `kg` (`faixas[]`), `furo`, `inf` (`preps[]`, `un`, `ini`, `max`, `porKg`; `mgMl` para mg/h; `fator` para mg/min), `txt` (sem cálculo). `conc` é a concentração do primeiro preparo e é conferida no teste.

## Onde paramos e o que falta

Ver `docs/07-roteiro.md`. Resumo:

- Feito: inventário dos PDFs, cobertura por tema, decisões, busca externa da IC, piloto v0.2 testado, lote 1 testado.
- Falta no tema IC: terapia oral do perfil A e prescrição de alta (CNP p. 72-74, ainda não conferidas por imagem); confirmar no bulário da Anvisa a bula de dobutamina.
- Falta no site: senha opcional para os atendimentos (foi retirada no v0.2), teste em iPhone e Android, hospedagem, modo offline da versão hospedada, pediatria e gestantes.
- Falta no lote 1: conferir contra o PSZ2 (não enviado); cuidados pós-PCR. CNP e DRG já conferidos. Ver `docs/05`.
- Próximo: lote 2.
