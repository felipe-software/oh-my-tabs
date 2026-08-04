# Exemplo simples

Aplicativo Expo mínimo com três páginas (`Início`, `Buscar` e `Perfil`) controladas pelo `onTabChange` da `JellyTabs`.

## Executar

Este exemplo consome a biblioteca pelo **build (`dist/`)** através de um symlink do Bun (`bun link`) — sem cópia da raiz e sem tarball. Na primeira vez, a partir da **raiz do repositório**:

```sh
bun install
bun run build      # gera dist/
bun link           # registra react-native-jelly-tabs para o link global do Bun
```

Depois, dentro de `example-simple/`:

```sh
bun install        # resolve o "link:react-native-jelly-tabs" (symlink → dist buildado)
bun run start      # ou: bun run android / ios / web
```

## Por que não duplica a biblioteca

O `package.json` referencia a lib como `"react-native-jelly-tabs": "link:react-native-jelly-tabs"`. O Bun cria um **symlink** para a raiz do repositório em vez de copiar, então o alvo pesa só os arquivos do pacote (o `file:..` copiaria a raiz inteira — `example/`, `references/` — e inflava o store em GBs).

Como o `package.json` da raiz não expõe mais o campo `react-native: ./src`, a resolução cai no `dist/` (o artefato publicado), igual a um consumidor real do npm. Ao alterar a lib, rebuilde:

```sh
bun run build      # na raiz — ou `bun run dev` para watch; o symlink reflete na hora
```

O exemplo não importa nada de `src/` diretamente: consome apenas o nome público do pacote.

As lacunas encontradas durante a implementação estão em [DOCS-NOTES.md](./DOCS-NOTES.md).
