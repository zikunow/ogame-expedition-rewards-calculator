'use strict';
const E=Expeditions,$=id=>document.getElementById(id),query=new URLSearchParams(location.search);
const keys=['source','metalMax','pluginFleet','resourceBonus','shipBonus','discovererBonus','economy','topPoints','flightsPerDay'];
const quantities=['metalMax','pluginFleet','economy','topPoints','flightsPerDay'];
const state={...E.defaults,source:1,flightMode:1};
for(const key of keys)if(query.has(key))state[key]=query.get(key).trim()===''?NaN:Number(query.get(key));
for(const el of document.querySelectorAll('[data-key]'))el.value=E.formatInput(state[el.dataset.key]);
const num=E.displayNumber;
const compact=v=>num(v/(Math.abs(v)>=1e9?1e9:Math.abs(v)>=1e6?1e6:1))+(Math.abs(v)>=1e9?' млрд':Math.abs(v)>=1e6?' млн':'');
function render(){
  $('pluginFields').hidden=state.source!==1;$('gameSection').hidden=state.source!==0;
  document.querySelectorAll('[name="source"]').forEach(el=>{el.checked=Number(el.value)===state.source;});
  for(const el of document.querySelectorAll('[data-key]'))el.removeAttribute('aria-invalid');
  $('universeSummary').textContent=`Экономика ×${num(state.economy)} · топ-1 ${compact(state.topPoints)} очков · изменить`;
  let r;try{r=E.calculate(state);}catch(err){$('error').hidden=false;$('output').hidden=true;const el=$(err.message);if(el)el.setAttribute('aria-invalid','true');return;}
  $('error').hidden=true;$('output').hidden=false;
  $('perFlight').textContent=compact(r.net);$('perDay').textContent=compact(r.daily);$('perMonth').textContent=compact(r.period);
  $('resources').textContent=num(r.resources)+' МСУ';$('ships').textContent=num(r.ships)+' МСУ';
  const url=new URL(location.href);url.search='';for(const key of keys)url.searchParams.set(key,state[key]);history.replaceState({},'',url);
  const full=new URL('../',location.href);for(const key of keys)full.searchParams.set(key,state[key]);full.searchParams.set('flightMode',1);$('fullLink').href=full;
}
$('simpleForm').addEventListener('input',event=>{
  const el=event.target;
  if(el.name==='source'){state.source=Number(el.value);render();return;}
  const key=el.dataset.key;if(!key)return;
  const grouping=quantities.includes(key),raw=el.value,position=el.selectionStart??raw.length;
  state[key]=E.parseInput(raw,grouping);
  const formatted=E.formatEditing(raw,grouping);
  if(formatted!==raw){const significant=raw.slice(0,position).replace(/[^\d,]/g,'').length;el.value=formatted;let cursor=0,count=0;while(cursor<formatted.length&&count<significant){if(/[\d,]/.test(formatted[cursor]))count++;cursor++;}el.setSelectionRange(cursor,cursor);}
  render();
});
$('simpleForm').addEventListener('submit',event=>event.preventDefault());
render();
