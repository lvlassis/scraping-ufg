{
  description = "Academic dev environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    crane.url = "github:ipetkov/crane";
  };

  outputs = { self, nixpkgs, crane }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
      craneLib = crane.mkLib pkgs;

      tauriSystemDeps = with pkgs; [
        webkitgtk_4_1
        libsoup_3
        gtk3
        openssl
        librsvg
        glib-networking
      ];

      # sigaa-scraper (dependência git, pinada pelo rev do HEAD)
      sigaaScraper = pkgs.python312Packages.buildPythonPackage {
        pname = "sigaa-scraper";
        version = "0.1.0";
        pyproject = true;
        src = pkgs.fetchFromGitHub {
          owner = "lvlassis";
          repo = "sigaa-scraper";
          rev = "a4983a0fb3071b8282ed7b4da75fb593fb25cf2d";
          hash = "sha256-O8outK7nEdLpD3ldfY60yIZb6yhZmZQJ/41JEunvRGg=";
        };
        build-system = [ pkgs.python312Packages.hatchling ];
        dependencies = with pkgs.python312Packages; [ requests parsel xxhash ];
      };

      # sigaa-api como pacote Python puro
      sigaaApiPkg = pkgs.python312Packages.buildPythonPackage {
        pname = "sigaa-api";
        version = "0.1.0";
        pyproject = true;
        src = ./sigaa-api;
        build-system = [ pkgs.python312Packages.hatchling ];
        dependencies = with pkgs.python312Packages; [ fastapi uvicorn sigaaScraper ];
      };

      # Ambiente Python isolado com sigaa-api e todas suas deps
      sigaaApiEnv = pkgs.python312.withPackages (_: [ sigaaApiPkg ]);

      # Binário sidecar: script shell que invoca uvicorn via Python do Nix store
      sigaaApi = pkgs.writeShellApplication {
        name = "sigaa-api";
        runtimeInputs = [ sigaaApiEnv ];
        text = ''exec python -m uvicorn sigaa_api.main:app --host 127.0.0.1 --port 8765 "$@"'';
      };

      # Build Rust do app Tauri com crane (cache de deps separado do build final)
      targetTriple = pkgs.stdenv.hostPlatform.config;

      desktopSrc = pkgs.lib.cleanSourceWith {
        src = craneLib.path ./desktop-app/src-tauri;
        filter = path: type:
          (craneLib.filterCargoSources path type)
          || pkgs.lib.hasSuffix "tauri.conf.json" path
          || pkgs.lib.hasInfix "/capabilities/" path
          || pkgs.lib.hasInfix "/icons/" path;
      };

      commonArgs = {
        src = desktopSrc;
        strictDeps = true;
        nativeBuildInputs = [ pkgs.pkg-config ];
        buildInputs = tauriSystemDeps;
      };

      # Passo 1: compila só as dependências externas (resultado cacheado)
      cargoArtifacts = craneLib.buildDepsOnly commonArgs;

      # Passo 2: compila o binário final usando as deps já compiladas
      tauriBin = craneLib.buildPackage (commonArgs // {
        inherit cargoArtifacts;
        pname = "academic";
        cargoExtraArgs = "--bin tauri-app";
      });

      # Pacote final: binário Tauri + sidecar sigaa-api com o nome que o Tauri espera
      desktopApp = pkgs.runCommand "academic-desktop" { } ''
        mkdir -p $out/bin
        cp ${tauriBin}/bin/tauri-app $out/bin/academic
        cp ${sigaaApi}/bin/sigaa-api $out/bin/sigaa-api-${targetTriple}
      '';

    in
    {
      packages.${system} = {
        sigaa-api = sigaaApi;
        desktop = desktopApp;
        default = desktopApp;

        # FHS env para `make desktop` (build via npx tauri + bundlers AppImage/deb)
        # Necessário no NixOS porque linuxdeploy hardcoda /usr/bin/xdg-open.
        # APPIMAGE_EXTRACT_AND_RUN=1 evita FUSE dentro do sandbox bwrap.
        desktop-build = pkgs.buildFHSEnv {
          name = "tauri-fhs-build";
          targetPkgs = pkgs: with pkgs; [
            xdg-utils
            desktop-file-utils
            nodejs
            rustc
            cargo
            file
            gst_all_1.gstreamer
            gst_all_1.gst-plugins-base
            pkg-config
          ] ++ tauriSystemDeps;
          profile = ''
            export APPIMAGE_EXTRACT_AND_RUN=1
          '';
          runScript = "npx tauri build";
        };
      };

      devShells.${system}.default = pkgs.mkShell {
        buildInputs = with pkgs; [
          rustc
          cargo
          rust-analyzer
          cargo-tauri
          nodejs
          python312
          python312Packages.pip
          python312Packages.virtualenv
          python312Packages.pyinstaller
          pkg-config
        ] ++ tauriSystemDeps;

        shellHook = ''
          export PKG_CONFIG_PATH="${pkgs.openssl.dev}/lib/pkgconfig:${pkgs.webkitgtk_4_1.dev}/lib/pkgconfig"
          export LD_LIBRARY_PATH="${pkgs.lib.makeLibraryPath tauriSystemDeps}"
          echo "Academic dev shell — use 'nix develop' para entrar"
        '';
      };
    };
}
