# Guia de PS

Site em HTML, em português do Brasil: o médico escolhe a doença e vê a **prescrição** e os **exames**. É apoio à decisão, não substituto. O dono do projeto usa no plantão, no tablet e no celular; talvez compartilhe com colegas depois.

**Estado atual:** v1.0 (12/11/2026). O usuário pediu: "Muda tudo, só quero escolher a doença e que você me fale a prescrição e exames dela, todas as doenças que mandei" (`docs/11-pedido-v1.md`). Os formatos anteriores (perguntas por tela, fluxograma de cartões com pacientes e texto livre) foram abandonados e estão em `legado/v06/`. Hoje são 126 entradas: 110 do PS Zerado 2ª edição, 8 capítulos só do Cardiologia na Prática (choque cardiogênico, IAM de VD, MINOCA, miocardite, AVC isquêmico completo, AVC hemorrágico, hemorragia subaracnóidea, crise epiléptica), 3 do PS Zerado anterior (crise convulsiva, delirium, síndrome serotoninérgica), anticoagulantes, antiagregantes e fibrinolíticos (Medway), parada cardiorrespiratória (AHA 2025), TEP e TVP (Cardiologia na Prática) e DAOP (sem fonte ainda). A seção "Trombose e doença vascular" junta DAOP, TEP, TVP, anticoagulantes, isquemia mesentérica, dissecção de aorta e trombólise no AVC (pedido de 12/11: "Coloca DAOP também, é trombose e derivados"). Ainda sem "aprovado".

## Regras de produto

1. **Escolher a doença e ver o que fazer.** Lista por sistema, com busca por nome, sigla (TEP, ITU, IC) e medicamento. Sem pacientes, sem formulário, sem fluxograma.
2. **Duas abas: Prescrição e Exames.** A prescrição é a do guia, na ordem e com as doses do guia. As dicas ("Bizus") ficam recolhidas.
3. **Fidelidade ao documento.** A prescrição é transcrita do texto nativo do PDF por programa (`ferramentas/`), com a página de origem. Não reescrever doses à mão em `doencas.js`.
4. **Diretriz mais recente aparece como nota azul** abaixo do medicamento, quando difere do guia (`EXTRAS.notas`). Valor suspeito no guia: nota vermelha pedindo conferência.
5. **Exames só com fonte.** Lista com fonte em `EXTRAS.exames` (ILAS, SBC, AHA, CNP) mais o que o próprio guia cita. Sem fonte, a aba diz que os documentos não trazem exames. Nunca inventar.
6. **Pouca letra, cara de aplicativo.** Fundo bege claro, cartões brancos, verde suave (pedido de 12/11).
7. **Não parar para pedir aprovação de cada fonte ou conflito.** Decidir, registrar em `docs/`, listar no fim.

## Regras de segurança

- Texto clínico só em `src/doencas.js` (gerado) e `src/extras.js` (à mão, cada item com `ref`). `src/ui.js` não tem texto clínico.
- Nunca levar para o site o nome ou CPF de quem licenciou o PDF, nem a propaganda do curso (o teste confere).
- PDFs digitalizados (CNP, DRG): todo número tem que ser conferido pela imagem da página. O PS Zerado tem texto nativo; o valor transcrito é o do livro, mas valor suspeito se confere pela imagem e vai para `docs/05`.
- Valor suspeito: não corrigir por dedução. Buscar em diretriz de sociedade, Ministério da Saúde ou bula da Anvisa; enquanto não houver, nota de alerta.

## Comandos

```bash
python3 build.py                  # gera dist/guia-ps.html (arquivo único, offline) e dist/guia-ps-online.html (página publicada)
node testes/conteudo.test.js      # 26 checagens do conteúdo (ids, fontes, licenciado, amostras conferidas no PDF)
python3 testes/e2e.py             # 31 casos no navegador (precisa de playwright)
CHROME=/opt/pw-browsers/chromium python3 testes/e2e.py   # na nuvem
```

Para regenerar `src/doencas.js` a partir dos PDFs, ver o cabeçalho de `ferramentas/gera_doencas.py` (precisa de `pip install pymupdf`).

## Estrutura

| Caminho | O que é |
| --- | --- |
| `src/doencas.js` | Gerado. Uma entrada por doença: `id`, `nome`, `sistema`, `fonte`, `paginas`, `itens[]` (`tipo`: med, rot, sub, forte, li, seta, p, tab; `ind` = recuo; `pg` = página do livro). |
| `src/cnp.js` | À mão: os 8 capítulos do Cardiologia na Prática, com cada número conferido pela imagem da página (sem dieta, glicemia e antiemético, que se repetem). |
| `src/extras.js` | À mão: `exames` com fonte, `notas` (diretriz mais recente ou alerta), doenças fora do PS Zerado (parada, TEP e TVP do CNP com números conferidos pela imagem, DAOP com `semFonte`), `grupos` (seções que juntam doenças de sistemas diferentes), `busca` (siglas). |
| `src/ui.js`, `src/estilo.css` | Lista com busca, página da doença com abas, copiar prescrição. Navegação pelo endereço (`#id-da-doenca`). |
| `ferramentas/` | Extratores: `extrai_psz2.py` (o PDF comprimido tem 4 páginas por folha; lê fonte, cor, marcadores e tabelas), `monta_psz2.py` (corta pelo sumário), `extrai_psz1.py`, `extrai_med.py` (anticoagulantes, p. 30-37), `gera_doencas.py`. |
| `legado/` | v0.1 e v0.6 (fluxograma com pacientes, calculadoras e testes de dose). Conteúdo e contas continuam úteis como referência. |
| `docs/` | Decisões (`02`), fontes (`03`), conflitos e valores suspeitos (`05`), roteiro (`07`), pedidos do usuário (`08` a `11`). |
| `pdfs/` | PDFs-fonte, não versionados (material licenciado). |

## O que falta

- Exames: só 7 doenças têm lista com fonte; as demais mostram só o que o guia cita. Falta fonte de exames (diretrizes; a rede da sessão bloqueia os sites).
- Receitas de alta do Drive de Prescrições: ainda não entraram.
- Precisa de diretriz externa (não está nos PDFs): DAOP e isquemia arterial aguda, trauma (ATLS 11ª ed.), meningite bacteriana, síndrome neuroléptica maligna, insuficiência adrenal, crise tireotóxica, hipotermia, queimaduras, pré-eclâmpsia e eclâmpsia, lesão renal aguda, rabdomiólise. Em 12/11 a liberação de rede para os sites de diretrizes foi negada pela regra de segurança da sessão; pedir os PDFs ao usuário ou que ele libere os sites nas configurações do ambiente.
- DAOP e isquemia arterial aguda de membro: não estão em nenhum PDF (procurado em todos, inclusive por OCR nos digitalizados). A entrada existe e pede a fonte (diretriz da SBACV).
- Síndrome neuroléptica maligna: não está em nenhum PDF.
- Trauma: não está em nenhum PDF.
- Conferir pela imagem valores suspeitos do PS Zerado à medida que aparecerem.

## Ambiente

- Página publicada (privada, do usuário): https://claude.ai/artifact/QFiq2NBB8dKBBPB7hNc8Wk . Para atualizar no mesmo link: `python3 build.py` e publicar `dist/guia-ps-online.html` com a ferramenta Artifact passando esse link em `url`.
- O projeto fica em `guia-ps/` dentro do repositório `jimbonio` (que também tem um site de agenda, sem relação). Branch de trabalho: `claude/new-session-vnm2c8`.
- Testes de navegador na nuvem: `pip install playwright`. Extração: `pip install pymupdf`. OCR (só para CNP e DRG): `apt-get update && apt-get install -y tesseract-ocr tesseract-ocr-por`.
- A rede da sessão bloqueia sites externos (gov.br, sociedades médicas, scielo, periodikos). A sessão foi movida para o ambiente "kkkk" (salvo para este repositório), também sem hosts liberados. Pedir o PDF ao usuário.
