{
  description = "Academic dev environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        buildInputs = with pkgs; [
          # Rust
          rustc
          cargo
          rust-analyzer

          # Tauri system dependencies (Linux)
          pkg-config
          webkitgtk_4_1
          libsoup_3
          gtk3
          openssl
          librsvg
          glib-networking

          # Node.js (Tauri CLI)
          nodejs

          # Python
          python312
          python312Packages.pip
          python312Packages.virtualenv
        ];

        shellHook = ''
          export PKG_CONFIG_PATH="${pkgs.openssl.dev}/lib/pkgconfig:${pkgs.webkitgtk_4_1.dev}/lib/pkgconfig"
          export LD_LIBRARY_PATH="${pkgs.lib.makeLibraryPath [
            pkgs.webkitgtk_4_1
            pkgs.gtk3
            pkgs.libsoup_3
            pkgs.openssl
            pkgs.librsvg
            pkgs.glib-networking
          ]}"
          echo "Academic dev shell — use 'nix develop' para entrar"
        '';
      };
    };
}
