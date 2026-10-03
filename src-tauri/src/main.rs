use std::{env,fs,process::Command,time::Duration};
use serde::Deserialize;
#[derive(Deserialize)]struct Release{tag_name:String}
#[tauri::command]
fn check_update()->Result<String,String>{
 let c=reqwest::blocking::Client::builder().user_agent("Xbox360-Blockly").timeout(Duration::from_secs(8)).build().map_err(|e|e.to_string())?;
 let r=c.get("https://api.github.com/repos/duck-dev781/Xbox360-blockly/releases/latest").send().map_err(|e|e.to_string())?;
 if !r.status().is_success(){return Ok("No published release is available yet.".into());}
 let rel:Release=r.json().map_err(|e|e.to_string())?;let cur=env!("CARGO_PKG_VERSION");
 if rel.tag_name.trim_start_matches('v')!=cur{Ok(format!("Update available: {}",rel.tag_name))}else{Ok(format!("You are up to date ({}).",cur))}
}
#[tauri::command]
fn build_xex(source:String,project_name:String)->Result<String,String>{
 let root=env::temp_dir().join("xbox360-blockly-build");if root.exists(){fs::remove_dir_all(&root).map_err(|e|e.to_string())?;}fs::create_dir_all(root.join("source")).map_err(|e|e.to_string())?;
 fs::write(root.join("source/main.c"),source).map_err(|e|e.to_string())?;fs::write(root.join("source/xboxblocks_runtime.h"),include_str!("../../runtime/xboxblocks_runtime.h")).map_err(|e|e.to_string())?;fs::write(root.join("Makefile"),include_str!("../../runtime/Makefile")).map_err(|e|e.to_string())?;
 let s=root.join("build_xex.sh");fs::write(&s,include_str!("../../runtime/build_xex.sh")).map_err(|e|e.to_string())?;
 let st=Command::new("bash").arg(s).current_dir(&root).env("PROJECT_NAME",&project_name).status().map_err(|e|e.to_string())?;if !st.success(){return Err("Xbox 360 build failed: DEVKITXENON and elf2xex are required.".into())}
 let x=root.join(format!("{}.xex",project_name));let out=env::current_dir().map_err(|e|e.to_string())?.join(format!("{}.xex",project_name));fs::copy(x,&out).map_err(|e|e.to_string())?;Ok(format!("Built {}",out.display()))
}
fn main(){tauri::Builder::default().invoke_handler(tauri::generate_handler![check_update,build_xex]).run(tauri::generate_context!()).expect("failed to run");}
