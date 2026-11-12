# Pedido do v0.5 (12/11/2026)

O usuário enviou o PS Zerado 2ª edição (arquivo comprimido de 52 páginas, quatro páginas do original por folha, com texto extraível mas intercalado entre colunas) e reenviou a edição anterior (idêntica à que já estava). Pediu, nas palavras dele:

1. "Quero a opção de dar só os sintomas e sinais ou história e você me diz como conduzir; conforme for evoluindo com mais informações você me dá hipóteses, e vamos seguindo o tratamento de forma sindrômica até ter o diagnóstico; feito o diagnóstico você me diz o que fazer como protocolo."
2. "Quero uma forma mais simples de ver quais medicamentos fazer [...] não sei ao certo quantas vezes tenho que repetir cada medicamento e a cada quanto tempo."
3. "Faltou a parte sobre o que perguntar para o paciente, o que perguntar para os familiares."
4. "O mais importante é que está faltando a opção de dar o conjunto de sintomas e partir disso para conduta e só depois dar o diagnóstico e seguir o fluxograma."
5. "Precisa ser algo direto: marcou 'trauma' mesmo sem saber a história, já precisa ter uma pré-conduta; investigou e achou contusão pulmonar no exame físico, muda para outra conduta. Precisa ser algo dinâmico."

## O que foi feito

| Pedido | No site |
| --- | --- |
| 1 e 4 | Quadro "Avaliação por sinais e sintomas" (`sind`), primeira opção da tela inicial. Pré-conduta comum (monitor, oxigênio se saturação < 90%, acesso, ECG; CNP p. 78), sinais de instabilidade, queixas e exame físico por toque, ECG e exames. As hipóteses aparecem com "a favor", "contra", "para confirmar" e "enquanto isso", reordenadas a cada dado. "Seguir o protocolo" abre o quadro no mesmo paciente e leva os achados. |
| 2 | Cada medicamento virou um cartão com Quanto, Repetir e Máximo, bolinhas de doses dadas, hora da última e da próxima. A conduta é numerada (1º, 2º, 3º). O pop-up abre com o mesmo resumo no topo. |
| 3 | "Perguntar ao paciente" e "Perguntar a familiares ou acompanhante" em todos os quadros, com Sim / Não / Não sabe. Respostas entram na passagem de caso e algumas mudam a conduta (asma tira a adenosina; sildenafila ou tadalafila tira a nitroglicerina). |
| 5 | A mecânica dinâmica está pronta (marcar um achado muda conduta e hipóteses na hora). **O conteúdo de trauma não foi feito**: ver abaixo. |

## Limites honestos

- **Trauma não existe em nenhum dos 11 PDFs.** O PS Zerado 2ª edição só tem prescrição de pneumotórax/hemotórax e de fratura exposta; não tem avaliação primária, contusão pulmonar nem choque no trauma. A fonte prevista é o protocolo de Suporte Avançado de Vida do SAMU 192 (Ministério da Saúde), que cobre avaliação primária e secundária clínica e de trauma. A rede desta sessão bloqueou `www.gov.br` e `bvsms.saude.gov.br`. Para fazer: liberar esses dois endereços ou enviar o PDF.
- **As hipóteses hoje só cobrem o que tem protocolo ou fonte**: parada, taquiarritmia, bradiarritmia, IC e edema agudo de pulmão (com protocolo); síndrome coronariana, taquicardia sinusal por outra causa, embolia pulmonar e pneumonia (citadas como hipótese, sem protocolo ainda). Queixas como dor abdominal, febre, rebaixamento de consciência e trauma ainda não geram hipótese.
- **As perguntas vêm das decisões documentadas**, não de um roteiro de anamnese: os PDFs são guias de prescrição e quase não trazem anamnese. Um roteiro completo (por exemplo, o SAMPLA do protocolo do Ministério da Saúde) depende da mesma fonte bloqueada.
- A regra de ordenação das hipóteses (mais motivos a favor menos motivos contra; parada sempre no topo) é regra do site, não de diretriz.
