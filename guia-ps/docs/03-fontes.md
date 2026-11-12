# Fontes: os 11 PDFs e como lê-los

As páginas citadas no projeto são sempre as do arquivo PDF (não a numeração impressa).

| Cód. | Documento | Edição e ano | Tipo | Pág. | Como ler |
| --- | --- | --- | --- | --- | --- |
| PSZ2 | Guia de Prescrições da Emergência (PS Zerado) | 2ª edição; arquivo de 29/03/2026 | Guia de prescrição | 207 | Texto nativo, confiável. Fonte preferida na dúvida |
| PSZ1 | Guia de Prescrições da Emergência PS Zerado | Sem edição; arquivo de 01/08/2025 | Guia de prescrição | 90 | Texto nativo. Só para temas que saíram da 2ª edição |
| MED | Guia de Prescrições (Medway) | Sem edição; 02/11/2021 | Guia de prescrição | 49 | Texto nativo |
| DRV | Drive de Prescrições (Dra. Camilla Rocha) | Sem edição nem data | Receituário de alta, com itens "na unidade" | 56 | Texto nativo. Índice alfabético nas p. 3-9 |
| CNP | Cardiologia na Prática 3.0: Emergências Cardiovasculares, Guia de Prescrições | 3.0; 13/05/2023 | Guia de prescrição, 22 capítulos | 178 | **Só imagem.** Página impressa = PDF − 3 |
| DRG | Manual Prático: Drogas na Emergência 3.0 (Cardiologia na Prática) | 3.0; 2023 | Medicamentos e ventilação, 16 capítulos | 118 | **Imagem com OCR embutido não confiável.** Página impressa = PDF − 6 |
| ACLS-T | AHA 2025, Advanced Life Support, taquiarritmias com pulso (Circulation 2025;152 supl 2, S562-S573) | 21/10/2025 | Diretriz | 12 | Texto, em inglês |
| ACLS-B | Mesmo artigo, bradicardia (S573-S576) | 21/10/2025 | Diretriz | 4 | Texto, em inglês. P. 4 é só editorial |
| ACLS-F | Fluxogramas ACLS 2025 (impressão de página web; figuras 1, 2, 3, 4, 6, 7 e 8) | 11/11/2025 | Algoritmos | 7 | Figuras em imagem, em inglês. **O texto ao redor é tradução automática com erros: não usar** |
| ILAS-F | Fluxograma de triagem de sepse (ILAS) | Arquivo de 2018 | Fluxograma | 1 | Texto |
| ILAS-A | Guia de terapia antimicrobiana empírica para sepse (ILAS) | Novembro de 2016 | Modelo que exige adaptação institucional; sem doses | 3 | Tabela só se lê bem pela imagem |

Em 11/11/2026 o CNP e o DRG foram reenviados comprimidos, com duas páginas do original por página (89 e 59 páginas). A página original N está na folha (N+1)/2 arredondada para baixo. As citações do projeto continuam usando a página do arquivo original.

Em 12/11/2026 o PSZ2 foi reenviado comprimido (52 páginas, quatro do original por folha). O texto é extraível, mas sai com as colunas intercaladas: conferir a página pela imagem antes de usar qualquer dose.

## Cuidados de leitura

- **CNP e DRG:** qualquer OCR troca caracteres. Exemplos reais: "Img/kg" (1 mg/kg), "50Omg" (50 mg), "Smg/ml" (5 mg/mL), "SOmg/ml" (50 mg/mL). Rasterizar a página (`pdftoppm -r 80 -jpeg -f N -l N`) e ler a imagem antes de usar qualquer número.
- OCR do CNP: `tesseract -l por --psm 3` falha em páginas com caixa cinza; usar `--psm 6` nessas.
- Tabelas e fluxogramas de qualquer PDF: conferir pela imagem, com atenção a ≥ e <, mg e mcg, e às ligações entre as caixas.
- PSZ2, PSZ1 e DRV trazem impresso o nome de outra pessoa com CPF ou e-mail (titular da licença). Se algum dia uma imagem de página for mostrada no site, cortar essa faixa.

## Mapa dos capítulos (página do PDF)

**CNP:** SCA sem supra 5 · SCA com supra 13 · IAM de VD 22 · MINOCA 30 · miocardite 41 · urgência hipertensiva 52 · dissecção de aorta 55 · edema agudo de pulmão 60 · choque cardiogênico 66 · IC descompensada 71 · taquiarritmias instáveis 77 · TSV estável 86 · TV 98 · FA e flutter 108 · bradiarritmias 114 · TEP 118 · TVP 129 · sepse 139 · AVC isquêmico 152 · AVC hemorrágico 159 · HSA 164 · crise epiléptica 170.

**DRG:** intubação 7 · sedoanalgesia 12 · bloqueadores neuromusculares 25 · VNI 29 · ventilação mecânica 34 · desmame 40 · vasopressores 43 · inotrópicos 46 · vasodilatadores 51 · diurético 60 · antiarrítmicos 62 · trombólise e anticoagulação (AVC, IAM, TEP) 69 · PCR 88 · antibioticoterapia empírica 90 · posologia de antibióticos 105 · checklist 116.

**PSZ2, PSZ1, MED, DRV:** usar o sumário do próprio PDF; a numeração confere com as páginas reais.

## Fontes externas já usadas (tema IC)

- Diretriz Brasileira de Insuficiência Cardíaca – 2026 (SBC). Arq Bras Cardiol 2026;123(10):e20260830. DOI 10.36660/abc.20260830. PDF: https://abccardiol.org/wp-content/uploads/articles_xml/0066-782x-abc-123-10-e20260830/0066-782x-abc-123-10-e20260830.pdf — seção 7 (IC descompensada), p. 63-87.
- Diretriz Brasileira de IC Crônica e Aguda (SBC). Arq Bras Cardiol 2018;111(3):436-539. PDF: https://abccardiol.org/wp-content/uploads/articles_xml/0066-782X-abc-111-03-0436/0066-782X-abc-111-03-0436.x66747.pdf — parte de IC aguda, p. 485-498.
- Bula do profissional Nitroprus (Cristália): https://cristalia.com.br/produto/138/bula-profissional
- Bula Epikabi, norepinefrina (Fresenius Kabi): https://www.Fresenius-Kabi.com/br/documents/1.Epikabi_Bula_PA.pdf
- Dobutamina: vista só em reproduções de bula; **falta confirmar no bulário da Anvisa**.
- Existe também uma diretriz de IC da Sociedade Europeia de Cardiologia de 2026; o texto original não foi localizado.

As diretrizes foram lidas por extração automática do texto do PDF, não pela imagem da página. As tabelas de dose de 2018 e os quadros 7.1 e 7.5 e figuras 7.3 e 7.5 de 2026 foram extraídos duas vezes com o mesmo resultado.
