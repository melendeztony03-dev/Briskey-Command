const HEADERS = ['Received','Report ID','Name','Cook / batch','Meat','Bark','Smoke','Salt','Pepper','Tenderness','Fat render','Moisture','Favorite section','Rib texture','Eat again','One change','Notes'];
function sheet() { return SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID')).getSheetByName('Responses'); }
function doGet() { return HtmlService.createHtmlOutputFromFile('Form').setTitle('Brisket Command').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); }
function setup() {
 const ss=SpreadsheetApp.getActiveSpreadsheet(), email=Session.getEffectiveUser().getEmail();
 if(!ss || !email) throw new Error('Run from Extensions > Apps Script in your response Sheet.');
 PropertiesService.getScriptProperties().setProperties({SHEET_ID:ss.getId(),NOTIFY_EMAIL:email});
 const sh=ss.getSheetByName('Responses') || ss.insertSheet('Responses');
 if(!sh.getLastRow())sh.appendRow(HEADERS);
 sh.setFrozenRows(1);
 if(!ScriptApp.getProjectTriggers().some(t=>t.getHandlerFunction()==='sendNotifications'))ScriptApp.newTrigger('sendNotifications').timeBased().everyMinutes(5).create();
}
function clean(v,n){const s=String(v||'').trim().slice(0,n);return /^[=+@-]/.test(s)?"'"+s:s;}
function submitReport(p){
 if(!p || p.website || !/^[a-zA-Z0-9-]{16,80}$/.test(p.id||''))throw new Error('Invalid report.');
 if(!['Brisket','Pork shoulder','Ribs','Picanha','Meatloaf','Other'].includes(p.meat)||!['Yes','Maybe','No'].includes(p.again))throw new Error('Choose your meat and verdict.');
 const keys=['bark','smoke','salt','pepper','tenderness','fat','moisture'];
 keys.forEach(k=>{if(p[k]&&!/^[1-5]$/.test(String(p[k])))throw new Error('Invalid rating.');});
 const lock=LockService.getScriptLock();lock.waitLock(10000);
 try{
  const sh=sheet();if(!sh)throw new Error('Setup is incomplete.');
  if(sh.getLastRow()>1 && sh.getRange(2,2,sh.getLastRow()-1,1).createTextFinder(p.id).matchEntireCell(true).findNext())return {ok:true};
  sh.appendRow([new Date(),p.id,clean(p.name,80),clean(p.batch,100),p.meat,...keys.map(k=>p[k]?Number(p[k]):''),clean(p.section,40),clean(p.ribs,40),p.again,clean(p.change,1000),clean(p.notes,2000)]);
  return {ok:true};
 }finally{lock.releaseLock();}
}
function sendNotifications(){
 const lock=LockService.getScriptLock();if(!lock.tryLock(1000))return;
 try{
  const sh=sheet(),props=PropertiesService.getScriptProperties(),last=Number(props.getProperty('notifiedThrough')||1),end=sh.getLastRow();
  if(end<=last || MailApp.getRemainingDailyQuota()<1)return;
  const rows=sh.getRange(last+1,1,end-last,HEADERS.length).getDisplayValues();
  const body=rows.map(row=>HEADERS.map((h,i)=>h+': '+row[i]).join('\n')).join('\n\n');
  MailApp.sendEmail(props.getProperty('NOTIFY_EMAIL'),'Brisket Command: '+rows.length+' new report(s)',body);
  props.setProperty('notifiedThrough',String(end));
 }finally{lock.releaseLock();}
}