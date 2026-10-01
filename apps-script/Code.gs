const HEADERS = ['Received','Report ID','Name','Cook / batch','Meat','Bark','Smoke','Salt','Pepper','Tenderness','Fat render','Moisture','Favorite section','Rib texture','Eat again','One change','Notes'];
function sheet() { return SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID')).getSheetByName('Responses'); }
function doGet() { return HtmlService.createHtmlOutputFromFile('Form').setTitle('Brisket Command').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); }
function setup() {
 const props=PropertiesService.getScriptProperties();
 const existing=props.getProperty('SHEET_ID');
 const ss=existing?SpreadsheetApp.openById(existing):SpreadsheetApp.getActiveSpreadsheet();
 const email=props.getProperty('NOTIFY_EMAIL')||Session.getEffectiveUser().getEmail();
 if(!ss || !email)throw new Error('Set SHEET_ID and NOTIFY_EMAIL in Project Settings > Script Properties.');
 props.setProperties({SHEET_ID:ss.getId(),NOTIFY_EMAIL:email});
 const sh=ss.getSheetByName('Responses') || ss.insertSheet('Responses');
 if(!sh.getLastRow())sh.appendRow(HEADERS);
 sh.setFrozenRows(1);
 if(!ScriptApp.getProjectTriggers().some(t=>t.getHandlerFunction()==='sendNotifications'))ScriptApp.newTrigger('sendNotifications').timeBased().everyMinutes(5).create();
}
function clean(v,n){const s=String(v||'').trim().slice(0,n);return /^[=+@-]/.test(s)?"'"+s:s;}
function submitReport(p){
 if(!p || p.website || !/^[a-zA-Z0-9-]{16,80}$/.test(p.id||''))throw new Error('Invalid report.');
 const items=Array.isArray(p.items)?p.items:[p];
 if(!items.length || items.length>10)throw new Error('Review between one and ten foods.');
 const meats=['Brisket','Pork shoulder','Pork Ribs','Dino Ribs','Picanha','Meatloaf','Texas Twinkies','Armadillo Eggs','Mac N Cheese','Other'];
 const keys=['bark','smoke','salt','pepper','tenderness','fat','moisture'];
 items.forEach(item=>{
  if(!item || !meats.includes(item.meat) || !['Yes','Maybe','No'].includes(item.again))throw new Error('Choose a food and verdict for every review.');
  keys.forEach(k=>{if(item[k]!==undefined && item[k]!=='' && !/^[1-5]$/.test(String(item[k])))throw new Error('Invalid rating.');});
 });
 if(p.favorite && p.favorite!=='No favorite' && !items.some(i=>i.meat===p.favorite))throw new Error('Choose a favorite from the foods you reviewed.');
 const note=[p.favorite?'Favorite on the plate: '+p.favorite:'',p.notes||''].filter(Boolean).join('\n');
 const lock=LockService.getScriptLock();lock.waitLock(10000);
 try{
  const sh=sheet();if(!sh)throw new Error('Setup is incomplete.');
  if(sh.getLastRow()>1 && sh.getRange(2,2,sh.getLastRow()-1,1).createTextFinder(p.id).matchEntireCell(true).findNext())return {ok:true,count:items.length};
  const received=new Date();
  const rows=items.map(item=>[
   received,p.id,clean(p.name,80),clean(p.batch,100),item.meat,
   ...keys.map(k=>item[k]?Number(item[k]):''),
   item.meat==='Brisket'?clean(item.section,40):'',
   ['Pork Ribs','Dino Ribs'].includes(item.meat)?clean(item.ribs,40):'',
   item.again,clean(item.change,1000),clean(note,2000)
  ]);
  const last=sh.getLastRow(),needed=last+rows.length-sh.getMaxRows();
  if(needed>0)sh.insertRowsAfter(sh.getMaxRows(),needed);
  sh.getRange(last+1,1,rows.length,HEADERS.length).setValues(rows);
  return {ok:true,count:rows.length};
 }finally{lock.releaseLock();}
}
function sendNotifications(){
 const lock=LockService.getScriptLock();if(!lock.tryLock(1000))return;
 try{
  const sh=sheet(),props=PropertiesService.getScriptProperties(),last=Number(props.getProperty('notifiedThrough')||1),end=sh.getLastRow();
  if(end<=last || MailApp.getRemainingDailyQuota()<1)return;
  const rows=sh.getRange(last+1,1,end-last,HEADERS.length).getDisplayValues();
  const body=rows.map(row=>HEADERS.map((h,i)=>h+': '+row[i]).join('\n')).join('\n\n');
  MailApp.sendEmail(props.getProperty('NOTIFY_EMAIL'),'Brisket Command: '+new Set(rows.map(r=>r[1])).size+' new report(s), '+rows.length+' food review(s)',body);
  props.setProperty('notifiedThrough',String(end));
 }finally{lock.releaseLock();}
}