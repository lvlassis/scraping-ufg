{
  description = "SIGAA API";

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

    in
    {
      packages.${system} = {
        sigaa-api = sigaaApi;
        default = sigaaApi;
      };

      devShells.${system}.default = pkgs.mkShell {
        packages = with pkgs; [ python312 uv ];
        shellHook = ''
          if [ ! -d .venv ]; then
            uv sync
          fi
          source .venv/bin/activate
        '';
      };
    };
}
