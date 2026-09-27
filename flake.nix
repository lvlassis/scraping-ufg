{
  description = "SIGAA UFG Desktop";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};

      version = "0.1.0"; # nix-release-version

      desktopItem = pkgs.makeDesktopItem {
        name = "sigaa-desktop";
        desktopName = "SIGAA Desktop";
        exec = "sigaa-desktop %U";
        categories = [ "Education" "Network" ];
        terminal = false;
      };

    in
    {
      packages.${system}.default = pkgs.stdenv.mkDerivation {
        pname = "sigaa-desktop";
        inherit version;

        src = pkgs.fetchurl {
          url = "https://github.com/lvlassis/scraping-ufg/releases/download/${version}/sigaa-desktop-${version}-linux-app.tar.gz";
          hash = "sha256-bU93UvFUPy0RI7Ou1SjiKIfzBALa6hENoSLV6hesAgk="; # nix-release-hash
        };

        nativeBuildInputs = with pkgs; [
          makeWrapper
          autoPatchelfHook
        ];

        buildInputs = with pkgs; [
          stdenv.cc.cc.lib
        ];

        installPhase = ''
          runHook preInstall

          mkdir -p $out/lib/sigaa-desktop
          cp -r . $out/lib/sigaa-desktop/

          # remove apenas o binário musl que autoPatchelf não consegue resolver
          # em NixOS glibc — linux-x64.node é o que será usado em runtime
          rm -f $out/lib/sigaa-desktop/node_modules/better-sqlite3/prebuilds/linuxmusl-x64.node

          mkdir -p $out/bin
          makeWrapper ${pkgs.electron}/bin/electron $out/bin/sigaa-desktop \
            --add-flags "$out/lib/sigaa-desktop/out/main/index.js" \
            --set SIGAA_MIGRATIONS_PATH "$out/lib/sigaa-desktop/migrations" \
            --set SIGAA_SCRAPER_PATH "$out/lib/sigaa-desktop/sigaa-scraper"

          mkdir -p $out/share/applications
          cp ${desktopItem}/share/applications/* $out/share/applications/

          runHook postInstall
        '';
      };

      devShells.${system}.default = pkgs.mkShell {
        nativeBuildInputs = with pkgs; [ nodejs_22 ];
        buildInputs = with pkgs; [ electron stdenv.cc.cc.lib ];
        shellHook = ''
          export ELECTRON_OVERRIDE_DIST_PATH="${pkgs.electron}/lib/electron"
          export ELECTRON_EXEC_PATH="${pkgs.electron}/bin/electron"
          export LD_LIBRARY_PATH="${pkgs.stdenv.cc.cc.lib}/lib:$LD_LIBRARY_PATH"
          if [ ! -d node_modules ]; then
            npm install
          fi
        '';
      };
    };
}
