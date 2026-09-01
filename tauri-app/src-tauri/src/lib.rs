use std::process::{Child, Command};
use std::sync::Mutex;
use tauri::{Manager, WindowEvent};

struct ServerProcess(Mutex<Option<Child>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(ServerProcess(Mutex::new(None)))
        .setup(|app| {
            let root = std::env::current_dir().unwrap();
            let python = root.join(".venv/bin/python");
            let server = root.join("server.py");

            let child = Command::new(python)
                .arg(server)
                .spawn()
                .expect("Falha ao iniciar o academic server");

            *app.state::<ServerProcess>().0.lock().unwrap() = Some(child);

            // aguarda o servidor subir
            std::thread::sleep(std::time::Duration::from_millis(1500));

            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::Destroyed = event {
                if let Some(mut child) = window
                    .app_handle()
                    .state::<ServerProcess>()
                    .0
                    .lock()
                    .unwrap()
                    .take()
                {
                    let _ = child.kill();
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
