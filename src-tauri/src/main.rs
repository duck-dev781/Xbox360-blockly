use std::{env, fs, process::Command, time::Duration};
use serde::Deserialize;

#[derive(Deserialize)]
struct Release { tag_name: String }

fn tool_exists(name: &str) -> bool {
    Command::new("bash").args(["-lc", &format!("command -v {}", name)])
        .output().map(|o| o.status.success()).unwrap_or(false)
}

#[tauri::command]
fn check_toolchain() -> Result<String, String> {
    let devkit = env::var("DEVKITXENON").unwrap_or_default();
    if devkit.is_empty() {
        return Ok("LibXenon toolchain: NOT CONFIGURED — DEVKITXENON is not set.".into());
    }
    Ok(format!("DEVKITXENON={} | make={} | xenon-gcc={} | elf2xex={}",
        devkit, tool_exists("make"), tool_exists("xenon-gcc"), tool_exists("elf2xex")))
}

#[tauri::command]
fn check_update() -> Result<String, String> {
    let c = reqwest::blocking::Client::builder().user_agent("Xbox360-Blockly")
        .timeout(Duration::from_secs(8)).build().map_err(|e| e.to_string())?;
    let r = c.get("https://api.github.com/repos/duck-dev781/Xbox360-blockly/releases/latest")
        .send().map_err(|e| e.to_string())?;
    if !r.status().is_success() { return Ok("No published release is available yet.".into()); }
    let rel: Release = r.json().map_err(|e| e.to_string())?;
    let cur = env!("CARGO_PKG_VERSION");
    if rel.tag_name.trim_start_matches('v') != cur {
        Ok(format!("Update available: {}", rel.tag_name))
    } else { Ok(format!("You are up to date ({}).", cur)) }
}

fn clean_project_name(name: &str) -> String {
    let mut out: String = name.chars()
        .map(|c| if c.is_ascii_alphanumeric() || c == '_' || c == '-' { c } else { '_' }).collect();
    if out.is_empty() { out = "xboxblocks_game".into(); }
    out
}

#[tauri::command]
fn build_xex(source: String, project_name: String) -> Result<String, String> {
    if source.trim().is_empty() { return Err("Generated C source is empty.".into()); }
    let project_name = clean_project_name(&project_name);
    let root = env::temp_dir().join(format!("xbox360-blockly-{}", std::process::id()));
    if root.exists() { fs::remove_dir_all(&root).map_err(|e| e.to_string())?; }
    fs::create_dir_all(root.join("source")).map_err(|e| e.to_string())?;
    fs::write(root.join("source/main.c"), source).map_err(|e| e.to_string())?;
    fs::write(root.join("source/xboxblocks_runtime.h"), include_str!("../../runtime/xboxblocks_runtime.h")).map_err(|e| e.to_string())?;
    fs::write(root.join("Makefile"), include_str!("../../runtime/Makefile")).map_err(|e| e.to_string())?;
    let script = root.join("build_xex.sh");
    fs::write(&script, include_str!("../../runtime/build_xex.sh")).map_err(|e| e.to_string())?;

    let output = Command::new("bash").arg(&script).current_dir(&root).env("PROJECT_NAME", &project_name)
        .output().map_err(|e| format!("Could not start build: {}", e))?;
    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    if !output.status.success() {
        let mut log = String::new();
        if !stdout.trim().is_empty() { log.push_str(&stdout); }
        if !stderr.trim().is_empty() { if !log.is_empty() { log.push('\n'); } log.push_str(&stderr); }
        return Err(format!("Xbox 360 build failed:\n{}", log.trim()));
    }
    let xex = root.join(format!("{}.xex", project_name));
    if !xex.exists() { return Err("Build reported success, but no XEX was produced.".into()); }
    let out = env::current_dir().map_err(|e| e.to_string())?.join(format!("{}.xex", project_name));
    fs::copy(&xex, &out).map_err(|e| e.to_string())?;
    Ok(format!("Built XEX: {}", out.display()))
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![check_toolchain, check_update, build_xex])
        .run(tauri::generate_context!()).expect("failed to run");
}
