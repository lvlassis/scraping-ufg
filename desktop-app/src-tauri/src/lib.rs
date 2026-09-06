use std::sync::Mutex;
use tauri::{Manager, WindowEvent};

struct ServerProcess(Mutex<Option<Box<dyn FnOnce() + Send>>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .manage(ServerProcess(Mutex::new(None)))
        .setup(|app| {
            #[cfg(debug_assertions)]
            let kill: Box<dyn FnOnce() + Send> = {
                let root = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                    .parent().unwrap()
                    .parent().unwrap()
                    .to_path_buf();
                let python = root.join(".venv/bin/python3.12");
                let server = root.join("sigaa-api/server.py");
                let mut child = std::process::Command::new(&python)
                    .arg(&server)
                    .env("PYTHONPATH", root.join("sigaa-api"))
                    .spawn()
                    .expect("Falha ao iniciar o servidor da API");
                Box::new(move || { let _ = child.kill(); })
            };

            #[cfg(not(debug_assertions))]
            let kill: Box<dyn FnOnce() + Send> = {
                use tauri_plugin_shell::ShellExt;
                let (_rx, mut child) = app.shell()
                    .sidecar("sigaa-api")?
                    .spawn()?;
                Box::new(move || { let _ = child.kill(); })
            };

            *app.state::<ServerProcess>().0.lock().unwrap() = Some(kill);
            std::thread::sleep(std::time::Duration::from_millis(1500));
            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::Destroyed = event {
                if let Some(kill) = window
                    .app_handle()
                    .state::<ServerProcess>()
                    .0.lock().unwrap()
                    .take()
                {
                    kill();
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
