# Jimbonio

Agenda pessoal no navegador: calendário mensal, compromissos com data, hora e notas, e uma lista dos próximos eventos.

É um site estático (HTML, CSS e JavaScript puros), sem dependências nem etapa de build.

## Usar

Abra o `index.html` no navegador, ou publique no GitHub Pages:

1. No repositório, vá em **Settings → Pages**.
2. Em **Build and deployment**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`.
3. O site fica em `https://pablolacerda925-star.github.io/jimbonio/`.

## Onde ficam os dados

Os compromissos são salvos no `localStorage` do navegador. Isso significa que:

- ficam só no aparelho e no navegador onde foram criados (não sincronizam entre celular e computador);
- somem se você limpar os dados do site ou usar uma janela anônima.

Use **Exportar backup** para baixar um arquivo `.json` e **Importar backup** para restaurá-lo ou levá-lo a outro aparelho.
