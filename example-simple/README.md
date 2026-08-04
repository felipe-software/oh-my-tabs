# Exemplo simples

Aplicativo Expo mínimo com três páginas (`Início`, `Buscar` e `Perfil`) controladas pelo `onTabChange` da `JellyTabs`.

## Executar

Instale e execute sempre a partir da raiz do repositório:

```sh
bun install
bun run example-simple
```

Para abrir diretamente em uma plataforma:

```sh
bun run example-simple:android
bun run example-simple:ios
bun run example-simple:web
```

## Regra para não duplicar a biblioteca

`example-simple` faz parte do workspace da raiz e consome o tarball em `vendor/`. O tarball contém somente os arquivos publicáveis da biblioteca (`dist/` e `src/`), nunca a raiz inteira com seus exemplos e `node_modules`.

Não crie um lockfile aqui e não execute outro gerenciador de pacotes dentro desta pasta. O único `bun install` deve ser feito na raiz.

Depois de alterar a biblioteca, regenere o pacote local:

```sh
bun run build
bun run example-simple:pack
bun install
```

O exemplo também não importa nada de `src/` diretamente: ele consome apenas o nome público do pacote.

As lacunas encontradas durante a implementação estão em [DOCS-NOTES.md](./DOCS-NOTES.md).
