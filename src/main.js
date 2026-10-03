import * as Blockly from 'blockly';
import {save as saveDialog,open} from '@tauri-apps/api/dialog';
import {writeTextFile} from '@tauri-apps/api/fs';
import {invoke} from '@tauri-apps/api/tauri';
import {open as openUrl} from '@tauri-apps/api/shell';
import './style.css';
const VERSION='0.1.0';
const toolbox={kind:'categoryToolbox',contents:[
{kind:'category',name:'Events',colour:'#5b80a5',contents:[{kind:'block',type:'xb_start'},{kind:'block',type:'xb_forever'}]},
{kind:'category',name:'Control',colour:'#ffab19',contents:[{kind:'block',type:'controls_if'},{kind:'block',type:'controls_repeat_ext'}]},
{kind:'category',name:'Logic',colour:'#5b80a5',contents:[{kind:'block',type:'logic_compare'},{kind:'block',type:'logic_operation'},{kind:'block',type:'logic_boolean'}]},
{kind:'category',name:'Math',colour:'#59c059',contents:[{kind:'block',type:'math_number'},{kind:'block',type:'math_arithmetic'}]},
{kind:'category',name:'Xbox 360',colour:'#107c10',contents:[{kind:'block',type:'xb_clear'},{kind:'block',type:'xb_rect'},{kind:'block',type:'xb_bg'},{kind:'block',type:'xb_button'},{kind:'block',type:'xb_vibrate'},{kind:'block',type:'xb_wait'}]},
{kind:'category',name:'Console Info',colour:'#6f42c1',contents:[{kind:'block',type:'xb_info'}]},
{kind:'category',name:'Variables',custom:'VARIABLE'}]};
Blockly.Blocks.xb_start={init(){this.appendDummyInput().appendField('when game starts');this.setNextStatement(true);this.setColour('#5b80a5')}};
Blockly.Blocks.xb_forever={init(){this.appendStatementInput('DO').appendField('forever');this.setPreviousStatement(true);this.setNextStatement(true);this.setColour('#ffab19')}};
function stmt(t,l,c='#107c10'){Blockly.Blocks[t]={init(){this.appendDummyInput().appendField(l);this.setPreviousStatement(true);this.setNextStatement(true);this.setColour(c)}}}
stmt('xb_clear','clear screen');
Blockly.Blocks.xb_rect={init(){['X','Y','W','H'].forEach((n,i)=>this.appendValueInput(n).setCheck('Number').appendField(i===0?'draw rectangle x':i===1?'y':i===2?'width':'height'));this.setPreviousStatement(true);this.setNextStatement(true);this.setColour('#107c10')}};
Blockly.Blocks.xb_bg={init(){['R','G','B'].forEach(n=>this.appendValueInput(n).setCheck('Number').appendField(n));this.setPreviousStatement(true);this.setNextStatement(true);this.setColour('#107c10')}};
Blockly.Blocks.xb_button={init(){this.appendDummyInput().appendField('button').appendField(new Blockly.FieldDropdown([['A','A'],['B','B'],['X','X'],['Y','Y'],['START','START'],['BACK','BACK'],['UP','UP'],['DOWN','DOWN'],['LEFT','LEFT'],['RIGHT','RIGHT']]),'B').appendField('pressed?');this.setOutput(true,'Boolean');this.setColour('#107c10')}};
Blockly.Blocks.xb_vibrate={init(){this.appendValueInput('V').setCheck('Number').appendField('vibrate %');this.setPreviousStatement(true);this.setNextStatement(true);this.setColour('#107c10')}};
Blockly.Blocks.xb_wait={init(){this.appendValueInput('MS').setCheck('Number').appendField('wait ms');this.setPreviousStatement(true);this.setNextStatement(true);this.setColour('#ffab19')}};
Blockly.Blocks.xb_info={init(){this.appendDummyInput().appendField('console').appendField(new Blockly.FieldDropdown([['CPU','CPU'],['GPU','GPU'],['motherboard','MOTHERBOARD'],['console model','MODEL'],['serial number','SERIAL'],['DVD drive','DVD'],['CPU temperature','CPU_TEMP'],['GPU temperature','GPU_TEMP'],['EDRAM','EDRAM'],['system RAM','RAM'],['free RAM','FREE_RAM'],['storage capacity','STORAGE'],['free storage','FREE_STORAGE'],['resolution','RESOLUTION'],['FPS','FPS']]),'I');this.setOutput(true);this.setColour('#6f42c1')}};
const ws=Blockly.inject('blockly',{toolbox,renderer:'zelos',grid:{spacing:20,length:3,colour:'#3a4048',snap:true},zoom:{controls:true,wheel:true,startScale:.9,maxScale:1.5,minScale:.55}});
const val=(b,n)=>{const x=b.getInputTargetBlock(n);return x?expr(x):'0'};
function expr(b){if(!b)return'0';if(b.type==='math_number')return String(b.getFieldValue('NUM'));if(b.type==='logic_boolean')return b.getFieldValue('BOOL')==='TRUE'?'1':'0';if(b.type==='logic_compare')return '('+expr(b.getInputTargetBlock('A'))+' '+b.getFieldValue('OP')+' '+expr(b.getInputTargetBlock('B'))+')';if(b.type==='logic_operation')return '('+expr(b.getInputTargetBlock('A'))+' '+(b.getFieldValue('OP')==='AND'?'&&':'||')+' '+expr(b.getInputTargetBlock('B'))+')';if(b.type==='xb_button')return 'xb_button_pressed("'+b.getFieldValue('B')+'")';if(b.type==='xb_info')return 'xb_console_info("'+b.getFieldValue('I')+'")';return'0'}
function stack(b,ind){let o='',x=b;while(x){let s='';if(x.type==='xb_clear')s='xb_clear();';else if(x.type==='xb_rect')s='xb_draw_rect('+val(x,'X')+','+val(x,'Y')+','+val(x,'W')+','+val(x,'H')+');';else if(x.type==='xb_bg')s='xb_set_bg('+val(x,'R')+','+val(x,'G')+','+val(x,'B')+');';else if(x.type==='xb_vibrate')s='xb_vibrate('+val(x,'V')+');';else if(x.type==='xb_wait')s='xb_wait_ms('+val(x,'MS')+');';else if(x.type==='xb_forever')s='while(1){\n'+stack(x.getInputTargetBlock('DO'),ind+'  ')+'\n'+ind+'}';else if(x.type==='controls_if')s='if('+expr(x.getInputTargetBlock('IF0'))+') {\n'+stack(x.getInputTargetBlock('DO0'),ind+'  ')+'\n'+ind+'}';if(s)o+=ind+s+'\n';x=x.getNextBlock()}return o.trimEnd()}
function generateC(){let body='';for(const b of ws.getTopBlocks(true))if(b.type==='xb_start')body+=stack(b.getNextBlock(),'  ')+'\n';return '#include "xboxblocks_runtime.h"\n\nint main(void){\n  xb_init();\n'+(body||'  /* add blocks below when game starts */\n')+'  return 0;\n}\n'}
const status=x=>document.getElementById('status').textContent=x;
document.getElementById('new').onclick=()=>{ws.clear();status('New project.')};
document.getElementById('save').onclick=async()=>{const p=await saveDialog({defaultPath:'game.xml',filters:[{name:'Xbox Blockly',extensions:['xml']}]});if(p){await writeTextFile(p,Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(ws)));status('Saved.')}};
document.getElementById('load').onclick=()=>document.getElementById('file').click();
document.getElementById('file').onchange=async e=>{const f=e.target.files[0];if(f){ws.clear();Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(await f.text()),ws);status('Loaded '+f.name)}e.target.value=''};
document.getElementById('code').onclick=()=>{document.getElementById('preview').textContent=generateC();status('C generated.')};
document.getElementById('build').onclick=async()=>{try{status('Building XEX…');status(await invoke('build_xex',{source:generateC(),projectName:'xboxblocks_game'}))}catch(e){status('Build failed: '+e)}};
document.getElementById('update').onclick=async()=>{try{const r=await invoke('check_update');status(r);if(r.startsWith('Update available'))await openUrl('https://github.com/duck-dev781/Xbox360-blockly/releases/latest')}catch(e){status('Update check failed: '+e)}};
document.getElementById('preview').textContent='Blocks → C → Xbox 360 XEX';status('Xbox 360 Blockly '+VERSION+' ready.');
