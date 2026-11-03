/* Registro de case · Stap. Propriedades do script: ACCESS_CODE, ROOT_FOLDER_ID, SHEET_ID. */
const ORIGIN = 'https://kcooyakawa.github.io';
const P = PropertiesService.getScriptProperties();
const CATS = {render:'01_Render',angulo:'02_Angulo_do_render',evento:'03_Evento',montagem:'04_Montagem',timelapse:'05_Timelapse',videos:'06_Videos',docs:'07_Documentos'};
const out = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);

function doPost(e) {
  try {
    const b = JSON.parse(e.postData.contents);
    const master = b.code && b.code === P.getProperty('ACCESS_CODE');
    if (!master) {
      const lock = LockService.getScriptLock(); lock.waitLock(20000);
      try { const err = checkCode(b); if (err) return out({ok:false, error:err}); } finally { lock.releaseLock(); }
    }
    const fn = {ping:()=>({}), save, get, files, upload, done}[b.action];
    if (!fn) return out({ok:false, error:'Ação desconhecida.'});
    const res = fn(b);
    if (!master && b.action==='save' && !b.id) bindCode(b.code, res.id);
    return out(Object.assign({ok:true}, res));
  } catch (err) { return out({ok:false, error:String(err.message || err)}); }
}
function sheet() {
  const s = SpreadsheetApp.openById(P.getProperty('SHEET_ID')).getSheets()[0];
  if (!s.getLastRow()) s.appendRow(['id','atualizado','pasta','json']);
  return s;
}
function findRow(s, id) {
  const ids = s.getRange(1,1,s.getLastRow(),1).getValues();
  for (let i=1;i<ids.length;i++) if (ids[i][0]===id) return i+1;
  return 0;
}
/* Fórmulas não são aceitas vindas do formulário. */
const safe = v => /^[=+\-@]/.test(String(v)) ? "'"+v : v;
function save(b) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const s = sheet(); let id = String(b.id||''), row = id ? findRow(s,id) : 0, data = b.data||{}, folder;
    if (id && !row) throw new Error('Job não encontrado.');
    if (row) {
      data = Object.assign(JSON.parse(s.getRange(row,4).getValue()||'{}'), data);
      folder = DriveApp.getFolderById(s.getRange(row,3).getValue());
    } else {
      id = String(data.cliente+'-'+data.evento+'-'+new Date().getFullYear()).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').toLowerCase()+'-'+Utilities.getUuid().slice(0,4);
      folder = DriveApp.getFolderById(P.getProperty('ROOT_FOLDER_ID')).createFolder(id);
      s.appendRow([id,new Date(),folder.getId(),'{}']); row = s.getLastRow();
    }
    const keys = Object.keys(data); let head = s.getRange(1,1,1,s.getLastColumn()).getValues()[0];
    keys.forEach(k => { if (!head.includes(k)) { head.push(k); s.getRange(1,head.length).setValue(k); } });
    s.getRange(row,2).setValue(new Date()); s.getRange(row,4).setValue(JSON.stringify(data));
    keys.forEach(k => s.getRange(row,head.indexOf(k)+1).setValue(safe(data[k])));
    return {id, folderUrl:folder.getUrl()};
  } finally { lock.releaseLock(); }
}
function jobRow(id) { const s=sheet(), r=findRow(s,String(id)); if(!r) throw new Error('Job não encontrado.'); return {s,r}; }
function get(b) { const {s,r}=jobRow(b.id); return {data:JSON.parse(s.getRange(r,4).getValue()||'{}')}; }
function sub(parent, name) { const it=parent.getFoldersByName(name); return it.hasNext()?it.next():parent.createFolder(name); }
function files(b) {
  const {s,r}=jobRow(b.id), root=DriveApp.getFolderById(s.getRange(r,3).getValue()), o={};
  Object.keys(CATS).forEach(k=>{ const it=root.getFoldersByName(CATS[k]); if(!it.hasNext())return; const l=[],f=it.next().getFiles(); while(f.hasNext())l.push(f.next().getName()); o[k]=l; });
  return {files:o};
}
/* Abre uma sessão de envio: o navegador manda o arquivo direto ao Drive. */
function upload(b) {
  if (!CATS[b.cat]) throw new Error('Categoria inválida.');
  const {s,r}=jobRow(b.id), folder=sub(DriveApp.getFolderById(s.getRange(r,3).getValue()), CATS[b.cat]);
  const res = UrlFetchApp.fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true', {
    method:'post', contentType:'application/json', muteHttpExceptions:true,
    headers:{Authorization:'Bearer '+ScriptApp.getOAuthToken(),'X-Upload-Content-Type':b.mime,'X-Upload-Content-Length':String(b.size),Origin:ORIGIN},
    payload:JSON.stringify({name:b.name,parents:[folder.getId()]})
  });
  const url = res.getHeaders().Location || res.getHeaders().location;
  if (!url) throw new Error('O Drive recusou o envio ('+res.getResponseCode()+').');
  return {url};
}

/* Rode uma vez: cria pasta e planilha e define o código de acesso (veja no registro de execução). */
function setup() {
  const code = 'stap-' + Utilities.getUuid().slice(0,6);
  P.setProperties({
    ACCESS_CODE: code,
    ROOT_FOLDER_ID: DriveApp.createFolder('Registro de cases').getId(),
    SHEET_ID: SpreadsheetApp.create('Registro de cases').getId()
  });
  Logger.log('Código de acesso: ' + code);
}

/* Cada código libera um único job: cria um e depois só abre esse. */
function codes() { return JSON.parse(P.getProperty('CODES')||'{}'); }
function checkCode(b) {
  const c = codes(), inv = 'Código de acesso inválido.', used = 'Este código já foi usado em outro job.';
  if (!b.code || !(b.code in c)) return inv;
  const job = c[b.code], isNew = b.action==='ping' ? b.novo : (b.action==='save' && !b.id);
  if (isNew) return job ? used : '';
  return job && job===b.id ? '' : used;
}
function bindCode(code, id) { const c=codes(); c[code]=id; P.setProperty('CODES',JSON.stringify(c)); }
/* Rode para gerar 10 códigos de uso único (veja no registro de execução). */
function gerarCodigos() {
  const c=codes();
  for (let i=0;i<10;i++) { const k='job-'+Utilities.getUuid().slice(0,6); c[k]=''; Logger.log(k); }
  P.setProperty('CODES',JSON.stringify(c));
}

/* Avisa o dono da conta quando alguém conclui um job. */
function done(b) {
  const {s,r}=jobRow(b.id), url=DriveApp.getFolderById(s.getRange(r,3).getValue()).getUrl();
  const t=String(b.titulo||b.id).replace(/[\r\n]+/g,' ').slice(0,120);
  MailApp.sendEmail(Session.getEffectiveUser().getEmail(),'Registro de cases: '+t,String(b.resumo||'').slice(0,20000)+'\n\nJob: '+b.id+'\nArquivos: '+url+'\nPlanilha: '+SpreadsheetApp.openById(P.getProperty('SHEET_ID')).getUrl());
  return {};
}
function autorizarEmail() { Logger.log(MailApp.getRemainingDailyQuota()); }
