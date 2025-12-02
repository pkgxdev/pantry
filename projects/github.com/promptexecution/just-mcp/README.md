# just-mcp pkgx package

This pantry entry installs the Just MCP server built by `just-mcp` releases. The package manifest downloads a tarball whose name matches the target triple (`just-mcp-${target}.tar.gz`) from the GitHub release corresponding to the current tag (see `.github/workflows/build-binaries.yml` for the artifact names).

## Packaging requirements

- Every release must publish the archives `just-mcp-x86_64-unknown-linux-gnu.tar.gz`, `just-mcp-aarch64-unknown-linux-gnu.tar.gz`, `just-mcp-x86_64-apple-darwin.tar.gz`, `just-mcp-aarch64-apple-darwin.tar.gz`, and `just-mcp-x86_64-pc-windows-msvc.tar.gz` so pkgx can download them per host/arch.
- The manifest pulls the version from GitHub tags (it strips the leading `v`) and places the extracted binary under `${PKGX_DIR:-$HOME/.pkgx}/bin` (with `.exe` for Windows) so subsequent `pkgx just-mcp` invocations run the installed CLI.
- Run `pkgx just-mcp --version` after merging the pantry PR to make sure the release assets are reachable.
