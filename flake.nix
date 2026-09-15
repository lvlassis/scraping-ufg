{
  description = "SIGAA UFG Desktop";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
      py = pkgs.python312Packages.overrideScope (_: prev: {
        inline-snapshot = prev.inline-snapshot.overridePythonAttrs (_: {
          doCheck = false;
        });
      });

      sigaaScraper = py.buildPythonPackage {
        pname = "sigaa-scraper";
        version = "0.1.0";
        pyproject = true;
        src = pkgs.fetchFromGitHub {
          owner = "lvlassis";
          repo = "sigaa-scraper";
          rev = "a4983a0fb3071b8282ed7b4da75fb593fb25cf2d";
          hash = "sha256-O8outK7nEdLpD3ldfY60yIZb6yhZmZQJ/41JEunvRGg=";
        };
        build-system = [ py.hatchling ];
        dependencies = with py; [ requests parsel xxhash ];
      };

      sigaaApiPkg = py.buildPythonPackage {
        pname = "sigaa-api";
        version = "0.1.0";
        pyproject = true;
        src = ./sigaa-api;
        build-system = [ py.hatchling ];
        dependencies = with py; [ fastapi uvicorn sigaaScraper ];
      };

      sigaaApiEnv = pkgs.python312.withPackages (_: [ sigaaApiPkg ]);

      sigaaApi = pkgs.writeShellApplication {
        name = "sigaa-api";
        runtimeInputs = [ sigaaApiEnv ];
        text = ''exec python -m uvicorn sigaa_api.main:app --host 127.0.0.1 --port 8765 "$@"'';
      };

      # Frontend Vue/Vite
      #
      # Para obter o npmDepsHash correto, rode:
      #   nix build .#desktop 2>&1 | grep "got:"
      # e substitua o valor abaixo pelo hash que aparecer no erro.
      frontendDist = pkgs.buildNpmPackage {
        pname = "sigaa-desktop-frontend";
        version = "0.1.0";
        src = ./frontend;
        npmDepsHash = pkgs.lib.fakeHash;
        installPhase = "cp -r dist $out";
      };

      # Árvore de fonte combinada para o build Tauri.
      # Recria o layout do repositório para que frontendDist = "../../frontend/dist"
      # (relativo a desktop-app/src-tauri/) resolva corretamente.
      desktopSrc = pkgs.runCommand "sigaa-desktop-src" { } ''
        mkdir -p $out/desktop-app/src-tauri/binaries
        mkdir -p $out/frontend

        cp -r ${./desktop-app/src-tauri}/. $out/desktop-app/src-tauri/
        chmod -R +w $out/desktop-app

        cp -r ${frontendDist} $out/frontend/dist

        cp ${sigaaApi}/bin/sigaa-api \
          "$out/desktop-app/src-tauri/binaries/sigaa-api-${pkgs.stdenv.hostPlatform.config}"
        chmod +x \
          "$out/desktop-app/src-tauri/binaries/sigaa-api-${pkgs.stdenv.hostPlatform.config}"
      '';

      desktop = pkgs.rustPlatform.buildRustPackage {
        pname = "academic";
        version = "0.1.0";
        src = desktopSrc;
        sourceRoot = "sigaa-desktop-src/desktop-app/src-tauri";

        cargoLock.lockFile = ./desktop-app/src-tauri/Cargo.lock;

        nativeBuildInputs = with pkgs; [ pkg-config ];
        buildInputs = with pkgs; [
          webkitgtk_4_1
          gtk3
          glib
          cairo
          pango
          gdk-pixbuf
          at-spi2-atk
          librsvg
          libsoup_3
          openssl
        ];

        installPhase = ''
          install -Dm755 target/release/tauri-app "$out/bin/academic"
        '';
      };

    in
    {
      packages.${system} = {
        sigaa-api = sigaaApi;
        frontend = frontendDist;
        desktop = desktop;
        default = sigaaApi;
      };

      devShells.${system} = {
        sigaa-api = pkgs.mkShell {
          packages = with pkgs; [ python312 uv ];
          shellHook = ''
            if [ ! -d sigaa-api/.venv ]; then
              (cd sigaa-api && uv sync)
            fi
            source sigaa-api/.venv/bin/activate
          '';
        };

        desktop-app = pkgs.mkShell {
          nativeBuildInputs = with pkgs; [
            rustc
            cargo
            rust-analyzer
            pkg-config
            nodejs_22
          ];
          buildInputs = with pkgs; [
            webkitgtk_4_1
            gtk3
            glib
            cairo
            pango
            gdk-pixbuf
            at-spi2-atk
            librsvg
            libsoup_3
            openssl
          ];
        };
      };
    };
}
