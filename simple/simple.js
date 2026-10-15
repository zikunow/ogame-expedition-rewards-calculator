'use strict';
const E=Expeditions,$=id=>document.getElementById(id),query=new URLSearchParams(location.search);
const keys=['source','discoverer','orion','metalMax','pluginFleet','resourceBonus','shipBonus','discovererBonus','economy','topPoints','flightsPerDay','computerEnabled','computerMultiplier','boosterActive','boosterPercent'];
const quantities=['metalMax','pluginFleet','economy','topPoints','flightsPerDay'];
const state={...E.defaults,source:1,orion:1,flightMode:1,computerEnabled:0,computerMultiplier:1.1,boosterPercent:35};
for(const key of keys)if(query.has(key))state[key]=query.get(key).trim()===''?NaN:Number(query.get(key));
for(const el of document.querySelectorAll('[data-key]')){
  const key=el.dataset.key;
  if(key==='topPoints'){state[key]=[0,10000,100000,1000000,5000000,25000000,50000000,75000000,100000000].filter(v=>v<=state[key]).pop()??100000000;}
  if(el.type==='checkbox'){el.checked=!!state[key];continue;}
  el.value=key==='discoverer'?String(state.discoverer?1:state.orion?0:2):el.tagName==='SELECT'?String(state[key]):E.formatInput(state[key]);
}
const num=E.displayNumber;
const compact=v=>num(v/(Math.abs(v)>=1e9?1e9:Math.abs(v)>=1e6?1e6:1))+(Math.abs(v)>=1e9?' млрд':Math.abs(v)>=1e6?' млн':'');
function render(){
  state.computer=state.computerEnabled?state.computerMultiplier:1;
  $('computerFields').hidden=!state.computerEnabled;$('boosterFields').hidden=!state.boosterActive;
  $('boosterHelp').textContent=state.source===1?'Включите, если бонус не учтён в максимуме металла.':'Предмет увеличивает только ресурсы.';
  $('pluginFields').hidden=state.source!==1;$('gameSection').hidden=state.source!==0;
  document.querySelectorAll('[name="source"]').forEach(el=>{el.checked=Number(el.value)===state.source;});
  for(const el of document.querySelectorAll('[data-key]'))el.removeAttribute('aria-invalid');
  $('discovererBonus').disabled=!state.discoverer;
  $('classHelp').textContent=state.discoverer?'Экономика и усиление Исследователя учитываются в находках.':state.orion?'Orion/PTS 13.1: экономика учитывается, усиление Исследователя — нет.':'До Orion: экономика и усиление Исследователя не применяются.';
  let r;try{r=E.calculate(state);}catch(err){$('error').hidden=false;$('output').hidden=true;const el=$(err.message==='computer'?'computerMultiplier':err.message);if(el)el.setAttribute('aria-invalid','true');return;}
  $('error').hidden=true;$('output').hidden=false;
  $('perFlight').textContent=compact(r.net);$('perDay').textContent=compact(r.daily);$('perMonth').textContent=compact(r.period);
  $('resources').textContent=num(r.resources)+' МСУ';$('ships').textContent=num(r.ships)+' МСУ';
  const url=new URL(location.href);url.search='';for(const key of keys)url.searchParams.set(key,state[key]);history.replaceState({},'',url);
  const full=new URL('../',location.href);for(const key of keys)full.searchParams.set(key,state[key]);full.searchParams.set('flightMode',1);full.searchParams.set('computer',state.computer);if(state.source===0&&!state.discoverer){full.searchParams.set('source',1);full.searchParams.set('metalMax',r.metalBeforeItem);full.searchParams.set('pluginFleet',r.fleetMetalMax/2);}$('fullLink').href=full;
}
$('simpleForm').addEventListener('input',event=>{
  const el=event.target;
  if(el.name==='source'){state.source=Number(el.value);render();return;}
  const key=el.dataset.key;if(!key)return;
  if(el.type==='checkbox'){state[key]=Number(el.checked);render();return;}
  if(el.tagName==='SELECT'){if(key==='discoverer'){state.discoverer=Number(el.value==="1");state.orion=Number(el.value!=="2");}else state[key]=Number(el.value);render();return;}
  const grouping=quantities.includes(key),raw=el.value,position=el.selectionStart??raw.length;
  state[key]=E.parseInput(raw,grouping);
  const formatted=E.formatEditing(raw,grouping);
  if(formatted!==raw){const significant=raw.slice(0,position).replace(/[^\d,]/g,'').length;el.value=formatted;let cursor=0,count=0;while(cursor<formatted.length&&count<significant){if(/[\d,]/.test(formatted[cursor]))count++;cursor++;}el.setSelectionRange(cursor,cursor);}
  render();
});
$('simpleForm').addEventListener('submit',event=>event.preventDefault());
render();
