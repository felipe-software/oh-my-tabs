# Pacote local

Esta pasta contém o tarball local usado por `example-simple`. Ele inclui somente os caminhos publicados pela biblioteca (`dist/` e `src/`) e evita apontar o gerenciador de pacotes para a raiz inteira do repositório.

Para regenerar o pacote depois de alterar a biblioteca, execute na raiz:

```sh
bun run build
bun run example-simple:pack
bun install
```
