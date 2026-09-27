{
  description = "SIGAA UFG Desktop";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};

    in
    {
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
