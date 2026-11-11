# Decisões do projeto

Em ordem cronológica. Quando uma decisão posterior contradiz uma anterior, vale a posterior (marcada com **substitui**).

## 10/11/2026 — respostas às dúvidas das fases 1 a 3

| Tema | Decisão do usuário |
| --- | --- |
| Lacunas de condução (perguntas, exame, exames, reavaliação, destino) | Os PDFs quase não trazem isso. Preencher com busca externa tema a tema, só em fontes extremamente confiáveis (sociedades de especialidade, Ministério da Saúde, bulas da Anvisa), sempre a edição mais recente. |
| PS Zerado | A 2ª edição substitui a anterior. A versão anterior só entra nos temas que saíram da 2ª (crise convulsiva, delirium, síndrome serotoninérgica, síndrome neuroléptica maligna). |
| Conflitos de dose entre guias | Resolver por referência externa de alta confiança. |
| ACLS 2025 (em inglês) | Traduzir os algoritmos. A tradução automática do arquivo de fluxogramas não é fonte. |
| Valores suspeitos nos PDFs | Pesquisar em fonte confiável e já colocar o valor correto, sem perguntar um a um. |
| Antibióticos | Usar o modelo do ILAS como padrão; doses dos PDFs e, onde faltarem, de diretrizes e bulas. Não há protocolo do serviço. |
| Apresentação da ampola | Mostrar sempre a mais comum. |
| Pediatria e gestantes | Entram no site, com fontes externas recentes quando os PDFs não bastarem. |
| Receitas de alta (Drive de Prescrições) | Aparecem ao final do caso ou quando marcar "alta hospitalar". |
| Onde roda | Arquivo HTML salvo no celular e no computador, e página hospedada. Colocar online só no final. |
| Uso | Só do usuário por enquanto; depois pretende compartilhar com colegas. |
| Classificação da IC por perfil | O site conclui o perfil como sugestão, que o médico aceita ou nega. |
| Limiar de PAS para vasodilatador (90 × 110 na SBC 2026) | Ver decisão de 11/11 abaixo. |
| Bolus de nitroglicerina por faixa de PAS (só no PS Zerado) | Manter. |
| Dose de início da dobutamina | Seguir a SBC 2026 (0,5 a 1 mcg/kg/min). |

## 10/11/2026 (noite) — crítica ao piloto v0.1 — **substitui** as regras de exibição do prompt original

O usuário rejeitou o v0.1. Em resumo, nas palavras dele: muito texto; citações no meio do texto; parecia questionário de escritório; não quer várias opções, quer uma, a melhor; faltava "dar ou não dar" nas medicações; visual corporativo e cansativo; "é pra usar no pronto-socorro, não é pra estudar"; "na dúvida use a conduta do PS Zerado".

Consequências (já aplicadas no v0.2):

- Uma decisão por tela, botões grandes, pouquíssimo texto.
- Sem selos de "fonte externa", "pendente" ou similares na tela.
- Sem divergências ou alternativas na tela. O registro delas fica só em `docs/`.
- Referências só no rodapé, atrás de um toque.
- Medicação com "Dei", "Não vou dar", "Não tem aqui".
- Hierarquia de escolha: resolução já registrada aqui → PS Zerado 2ª edição.
- Não interromper o trabalho para pedir aprovação de fonte.

## 11/11/2026 — escolhas feitas para ficar com uma conduta só (tema IC)

Feitas pelo assistente ao montar o v0.2 e comunicadas ao usuário; ele não contestou.

| Ponto | Escolha | Motivo |
| --- | --- | --- |
| Perfil C, limiar de PAS | PAS ≤ 90 mmHg → dobutamina + noradrenalina. PAS > 90 → furosemida + nitroprussiato. | As fontes dizem "< 90" e "> 90"; PAS = 90 foi para o lado sem vasodilatador. |
| Perfil B, nitroglicerina | Só com PAS > 110 mmHg. | Limiar da seção de vasodilatadores da SBC 2026 (7.8), o mais conservador. |
| Furosemida sem uso prévio | 20 ou 40 mg em bolus. | SBC 2026. |
| Furosemida, usuário crônico | 1× ou 2× a dose oral diária; teto 600 mg/dia. | SBC 2026; teto também no DRG p. 60. |
| Nitroglicerina | 1 ampola 50 mg/10 mL + 240 mL SF 0,9% (200 mcg/mL); começar 10 a 20 mcg/min (3 a 6 mL/h); máximo 200 mcg/min. | Preparo do PSZ2 p. 20; dose da SBC 2018. |
| Bolus SCAPE | PAS 160-179: 3 mL; 180-199: 4 mL; > 200: 5 mL; depois 30 mL/h. Só aparece com PAS ≥ 160 e se o médico marcar SCAPE. | PSZ2 p. 20-21. |
| Nitroprussiato | 1 ampola 50 mg/2 mL + 248 mL SG 5%; 0,3 a 5 mcg/kg/min. | Preparo PSZ2 p. 21; diluente confirmado em bula; dose SBC 2018. |
| Dobutamina | 4 ampolas + 170 mL SF 0,9% (4 mg/mL); começar 0,5 a 1; manter 2 a 20 mcg/kg/min. | Preparo PSZ2 p. 22; dose SBC 2026. |
| Noradrenalina | 4 ampolas (4 mg/4 mL) + 234 mL SG 5% (64 mcg/mL); 0,1 a 0,2 de início; máximo 1 mcg/kg/min. | Preparo DRG p. 43 e PSZ2 p. 194; SG 5% pela bula; dose SBC 2018/2026. |
| Regra de sugestão do perfil | Um ou mais sinais marcados destacam "sim". | As diretrizes não dão número mínimo. É regra do site. |
| Senha dos atendimentos | Retirada para o "Novo atendimento" abrir na hora. Dados ficam no navegador sem cifra. | Pendente: voltar como opção, não como obrigação. O usuário ainda não respondeu. |

## 11/11/2026 — lote 1 (PCR, taquiarritmias, bradiarritmias): escolhas para ficar com uma conduta só

Feitas pelo assistente. **Nesta sessão só havia 8 dos 11 PDFs: faltaram PSZ2, CNP e DRG.** Por isso a hierarquia usada foi: AHA 2025 (diretriz mais recente) para conduta, dose e energia; MED e PSZ1 só para apresentação da ampola e preparo. Tudo o que veio de MED ou PSZ1 precisa ser conferido contra o PSZ2 (p. 8-15 e 194) quando ele estiver disponível.

| Ponto | Escolha | Motivo |
| --- | --- | --- |
| PCR, antiarrítmico | Amiodarona 300 mg, depois 150 mg. Lidocaína (1 a 1,5 mg/kg; depois 0,5 a 0,75 mg/kg) só aparece em "Não tem aqui". | AHA 2025 dá as duas como equivalentes; ficou a de dose fixa. |
| PCR, adrenalina | 1 mg a cada 3 a 5 min: no ramo chocável, depois do 2º choque e daí em ciclos alternados; no não chocável, logo e em ciclos alternados. | AHA 2025, Figura 2. |
| PCR, energia | Bifásico 120 a 200 J (ou o máximo se não souber); monofásico 360 J; choques seguintes iguais ou maiores. | AHA 2025, Figura 2. |
| PCR, pós-retorno | Só "Cuidados pós-PCR" e "Acionar UTI". | Nenhum PDF traz o cuidado pós-PCR; fica para busca externa (AHA 2025, parte 11). |
| Cardioversão sincronizada | FA 200 J; flutter 200 J; QRS estreito regular 100 J; TV monomórfica 100 J; TV polimórfica: desfibrilar com energia máxima. | AHA 2025, Figura 7. Resolve o conflito 8 (CNP dizia 50-100 J). |
| Sedação para cardioversão | Só "Sedar se der", sem droga nem dose. | AHA 2025 não dá dose; a sedoanalgesia entra no lote 2. |
| QRS estreito regular estável | Manobra vagal → adenosina 6 mg → 12 mg → metoprolol 5 mg → cardioversão 100 J. | AHA 2025. Entre diltiazem, verapamil e betabloqueador ficou o metoprolol (opção do PS Zerado; diltiazem EV é raro no Brasil). Sem 3ª dose de 18 mg de adenosina (só no MED). |
| FA/flutter estável, controle de frequência | Sem pré-excitação e sem IC descompensada: metoprolol 5 mg EV em 2 min, até 3 doses, a cada 5 min. Com IC descompensada: amiodarona 300 mg em 1 h e 10 a 50 mg/h. Com pré-excitação: cardioversão. | AHA 2025, Tabela 2 e recomendações. Intervalo de 5 min do PSZ1 p. 10. Teto de 3 doses (AHA) no lugar de 20 mg (PSZ1). |
| FA, controle de ritmo | Não entra. Aviso único: mais de 48 h ou tempo incerto, não reverter sem anticoagular. | AHA 2025 remete a decisão ao especialista. |
| QRS largo regular monomórfico estável | Amiodarona 150 mg em 10 min → se reverter, 1 mg/min por 6 h; se não, cardioversão 100 J. | AHA 2025, Figura 6. Adenosina (2b), procainamida e sotalol ficaram fora. |
| QRS largo irregular | Tratar como possível FA pré-excitada: sem bloqueador do nó AV, cardioversão 200 J. | AHA 2025. |
| Torsades | "Sulfato de magnésio EV" sem dose na tela. | AHA 2025 (texto disponível) não traz a dose; buscar em diretriz antes de pôr número. |
| Amiodarona, preparo | Ataque: ampolas + 100 mL SG 5%. Manutenção: 6 ampolas + 482 mL SG 5% (1,8 mg/mL). | MED p. 38 e PSZ1 p. 10. |
| Bradicardia instável | Atropina 1 mg a cada 3 a 5 min (até 3 doses) → marca-passo transcutâneo → adrenalina 2 a 10 mcg/min → chamar cardiologia para transvenoso. Dopamina (5 a 20 mcg/kg/min) só em "Não tem aqui". | AHA 2025, Figura 8. Entre adrenalina e dopamina ficou a que não depende de peso. |
| Atropina, ampola | 0,5 mg/mL (2 ampolas = 1 mg). | MED p. 39 e PSZ1. No Brasil também existe 0,25 mg/mL; a dose em mg aparece em destaque na tela. Confirmar a do serviço. |
| Adrenalina em bomba | 6 ampolas + 94 mL SF 0,9% (60 mcg/mL; 1 mL/h = 1 mcg/min). | MED p. 11 e 16. |
| Dopamina | 5 ampolas (50 mg/10 mL) + 200 mL SF 0,9% (1.000 mcg/mL). | PSZ1 p. 87 (que imprime "50 mcg/10 ml", erro de unidade) e MED p. 12 e 16. |
| Destino em taquiarritmia e bradiarritmia | Pergunta simples; UTI sugerida se instável. | As fontes do lote não trazem critério de internação ou alta. Sugestão é regra do site. |

## Arquitetura (aprovada em 10/11/2026)

- Conteúdo clínico separado do código da interface, com identificação e fonte por item.
- Atendimentos só no aparelho do usuário; nada de paciente em servidor; sem sincronização automática. Para levar a outro aparelho: exportar e importar arquivo.
- Página estática (sem servidor próprio nem contas). Destino final: hospedagem com HTTPS; o arquivo único também deve funcionar aberto do disco.
- Um PDF novo nunca substitui conteúdo direto: gera lista do que acrescenta, altera e contradiz; versões anteriores do conteúdo ficam guardadas.
- Se o site for compartilhado: cada colega guarda os próprios pacientes; não distribuir imagens das páginas dos PDFs (material de cursos, três deles licenciados em nome de terceiros).
