# Jimbonio

Agenda pessoal no navegador: calendário mensal, compromissos com data, hora e notas, e uma lista dos próximos eventos.

É um site estático (HTML, CSS e JavaScript puros), sem etapa de build.

## Publicar no GitHub Pages

1. No repositório, vá em **Settings → Pages**.
2. Em **Build and deployment**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`, e clique em **Save**.
3. Depois de 1–2 minutos o site fica em `https://pablolacerda925-star.github.io/jimbonio/`.

## Sincronizar entre aparelhos (opcional)

Sem configuração, os compromissos ficam só no `localStorage` do navegador. Para entrar com seu email e ver a mesma agenda no celular e no computador, use um projeto gratuito do [Supabase](https://supabase.com):

1. Crie uma conta e um projeto novo.
2. Em **SQL Editor → New query**, cole o conteúdo de [`supabase.sql`](supabase.sql) e clique em **Run**.
3. Em **Authentication → URL Configuration**, coloque `https://pablolacerda925-star.github.io/jimbonio/` em **Site URL** e também em **Redirect URLs**.
4. Em **Project Settings → API**, copie a **Project URL** e a chave **anon public** para o arquivo [`config.js`](config.js).

Depois disso aparece no site o cartão "Sincronizar entre aparelhos": digite seu email, abra o link que chegar e pronto. Na primeira vez, a agenda oferece enviar para a conta os compromissos que já estavam no aparelho.

A chave "anon" pode ficar pública; quem protege os dados são as regras do `supabase.sql`, que deixam cada pessoa ver só os próprios compromissos.

## Backup

**Exportar backup** baixa um arquivo `.json`; **Importar backup** restaura esse arquivo (no navegador ou na conta, conforme estiver conectado).
