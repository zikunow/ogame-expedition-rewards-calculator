'use strict';
const E=Expeditions, $=id=>document.getElementById(id), query=new URLSearchParams(location.search);
let state={...E.defaults};
for(const key of Object.keys(state))if(query.has(key))state[key]=query.get(key).trim()===''?NaN:Number(query.get(key));
// Reports use fixed day, week and 30-day horizons.
state.days=30;
let computerEnabled=state.computer!==1;
let computerMultiplier=computerEnabled?state.computer:1.1;
// Existing share links used total percentages or a metal-equivalent fleet cap.
if(!query.has('source')){
  state.source=query.size===0?1:state.manual?1:state.pro?2:0;
  if(state.manual)state.pluginFleet=state.fleetMetalMax/2;
}
// The main plugin input is always structure, including older MSU share links.
if(state.fleetUnit===1){state.pluginFleet/=state.fleetK;state.fleetUnit=0;}
// Older links could mark the item as already included in plugin maxima.
if(state.source===1&&state.boosterIncluded===1)state.boosterActive=0;
state.boosterIncluded=0;
const defs={discovererBonus:['Усиление Исследователя · «Общее», %','0'],pluginFleet:['Максимальная структура кораблей','60000000'],boosterPercent:['Бонус предмета, %','25'],t4:['Σ T4 · корабли','0'],t5:['Σ T5 · ресурсы','0'],t11:['Σ T11 · ресурсы','0'],t18:['Σ T18 · Исследователь','0'],experience:['Опыт ФЖ, уровень','0'],techBoost:['Усиление тех. зданиями, %','0'],economy:['Скорость экономики','8'],topPoints:['Очки игрока №1','100000000'],resourceBonus:['Бонус ресурсов ФЖ, %','0'],shipBonus:['Бонус кораблей ФЖ, %','0'],metalMax:['Максимальная находка металла','120000000'],fleetMetalMax:['Максимальная структура флота × 2','120000000'],flightsPerDay:['Экспедиций в день','48'],slots:['Экспедиций в одной волне','8'],waves:['Волн в день','6'],days:['Дней в периоде','30'],computer:['Множитель экспедиционного компьютера','1'],fuel:['Топливо на одну экспедицию, дейтерий','0'],loss:['Средние потери на экспедицию, МСУ','0'],scrap:['Реализация стоимости флота, %','100'],resourceChance:['Шанс ресурсов, %','34.5'],shipChance:['Шанс кораблей, %','16.5'],fleetK:['МСУ / структура найденного флота','1.5']};
const num=E.displayNumber;
const compact=v=>num(v/(Math.abs(v)>=1e9?1e9:Math.abs(v)>=1e6?1e6:1))+(Math.abs(v)>=1e9?' млрд':Math.abs(v)>=1e6?' млн':'');
function field(key){return `<label for="${key}"><span>${defs[key][0]}</span><input id="${key}" data-key="${key}" data-number="true" type="text" inputmode="${['economy','topPoints','slots','waves','days','flightsPerDay'].includes(key)?'numeric':'decimal'}" autocomplete="off" spellcheck="false" value="${E.formatInput(state[key])}"></label>`;}
for(const [id,keys] of Object.entries({proFields:['t4','t5','t11','t18','experience','techBoost'],automaticFields:['economy','topPoints'],gameFields:['resourceBonus','shipBonus','discovererBonus'],manualFields:['metalMax','pluginFleet'],boosterPercentField:['boosterPercent'],waveFields:['slots','waves'],dailyFlightFields:['flightsPerDay'],activityFields:['computer'],costFields:['fuel','loss','scrap'],probabilityFields:['resourceChance','shipChance','fleetK']}))$(id).innerHTML=keys.map(field).join('');
$('model').value=state.model;document.querySelectorAll('[name="source"]').forEach(el=>{el.checked=Number(el.value)===state.source;});$('boosterActive').checked=!!state.boosterActive;$('proSettings').open=state.source===2;
let theme='minimal';try{theme=localStorage.getItem('ias-theme')||theme;}catch{}
document.documentElement.dataset.theme=theme;$('theme').value=theme;
$('theme').onchange=()=>{document.documentElement.dataset.theme=$('theme').value;try{localStorage.setItem('ias-theme',$('theme').value);}catch{}};
$('calculatorSelect').onchange=()=>{location.href=$('calculatorSelect').value;};
function render(){
  $('computerEnabled').checked=computerEnabled;$('computerSettings').hidden=!computerEnabled;
  $('waveFields').hidden=state.flightMode===1;$('dailyFlightFields').hidden=state.flightMode!==1;
  document.querySelectorAll('[name="flightMode"]').forEach(el=>{el.checked=Number(el.value)===state.flightMode;});
  state.manual=Number(state.source===1);state.pro=Number(state.source===2);
  $('automaticFields').hidden=!!state.manual;$('manualFields').hidden=!state.manual;$('probabilityFields').hidden=!state.model;
  $('gameFields').hidden=!!state.manual;$('gameHelp').hidden=!!state.manual||!!state.pro;
  $('pluginHelp').hidden=!state.manual;
  $('boosterFields').hidden=!state.boosterActive;
  $('boosterHelp').textContent=state.manual?'Отметьте, если плагин не учёл бонус предмета. Введите его процент, например 25.':'Отметьте, если предмет активен, и введите его процент, например 25.';
  document.querySelectorAll('[name="source"]').forEach(el=>{el.checked=Number(el.value)===state.source;});

  for(const el of document.querySelectorAll('[data-key]')){el.removeAttribute('aria-invalid');if(el.dataset.number&&!Number.isFinite(state[el.dataset.key]))el.setAttribute('aria-invalid','true');}
  let r;try{r=E.calculate(state);}catch{ $('validation').hidden=false;$('results').innerHTML='';return;}
  $('validation').hidden=true;
  $('dailyFlightSummary').textContent=state.flightMode===1?'Укажите общее число отправленных экспедиций за день.':`${num(state.slots)} × ${num(state.waves)} = ${num(r.dailyFlights)} экспедиций в день.`;
  $('proSettings').hidden=!!state.manual;
  for(const key of ['resourceBonus','shipBonus','discovererBonus']){
    const techValue=key==='resourceBonus'?r.technology.resources*100:key==='shipBonus'?r.technology.ships*100:r.technology.discoverer*100;
    if(state.pro||document.activeElement!==$(key))$(key).value=E.formatInput(state.pro?Number(techValue.toFixed(6)):state[key]);
    $(key).closest('label').classList.toggle('auto-field',!!state.pro);
  }
  const itemText=!state.boosterActive?'Предмет не активирован.':r.itemApplied?`Предмет +${num(state.boosterPercent)}% добавлен к ресурсам. Флот без изменений.`:'Предмет уже учтён во введённом максимуме металла. Повторно не начисляется.';
  $('boosterStatus').textContent=itemText;
  const appliedText=state.manual?'Используются максимумы из плагина: ФЖ и T18 повторно не начисляются.':`ФЖ: ресурсы +${num((state.pro?r.technology.resources*100:state.resourceBonus))}%, корабли +${num((state.pro?r.technology.ships*100:state.shipBonus))}% · Исследователь +${num(state.pro?r.technology.discoverer*100:state.discovererBonus)}%.`;
  const b=r.technology;
  $('proSummary').innerHTML=`<div><span>T4 · корабли</span><b>+${num(b.ships*100)}%</b></div><div><span>T5 + T11 · ресурсы</span><b>+${num(b.resources*100)}%</b></div><div><span>T18 · множитель находок</span><b>×${num(1+b.discoverer)}</b></div><div class="pro-total"><span>Итого · ресурсы / флот</span><b>+${num(b.resourceBonus)}% / +${num(b.shipBonus)}%</b></div><p>${state.pro?'Бонусы подставлены в поля выше.':'Измените уровни, чтобы подставить рассчитанные бонусы.'}</p>`;

  const metric=(title,value,help)=>`<div class="metric"><span>${title}</span><b>${compact(value)}</b><small>${help}</small></div>`;
  const row=(label,mult)=>`<tr${label==='Один день'?' class="daily-row"':''}><td>${label}</td><td>${num(r.resources*mult)}</td><td>${num(r.ships*mult)}</td><td>${num(r.realised*mult)}</td><td>${num((r.fuel+state.loss)*mult)}</td><td><strong>${num(r.net*mult)}</strong></td></tr>`;
  $('results').innerHTML=`<section class="panel daily-panel"><div class="section-top"><h2>Ожидаемый доход</h2><span>${num(r.dailyFlights)} экспедиций в день</span></div><div class="metrics">${metric('Ресурсы за экспедицию',r.resources,'МСУ · до расходов')}${metric('Флот за экспедицию',r.ships,'МСУ · полная стоимость кораблей')}${metric('Итого за день',r.daily,'МСУ · с заданными расходами и возвратом флота')}</div><p class="applied-bonuses">${appliedText}<br>${itemText}</p><div class="table-wrap"><table><thead><tr><th>Период</th><th>Ресурсы, МСУ</th><th>Флот, МСУ</th><th>Флот к доходу, МСУ</th><th>Расходы, МСУ</th><th>Итого, МСУ</th></tr></thead><tbody>${row('Одна экспедиция',1)}${state.flightMode===1?'':row('Одна волна',state.slots)}${row('Один день',r.dailyFlights)}${row('Одна неделя',r.dailyFlights*7)}${row('30 дней',r.dailyFlights*30)}</tbody></table></div><p class="note">Итого = ресурсы + флот × ${num(state.scrap)}% − топливо × 3 − заданные средние потери. Флот к доходу уже входит в итог.</p></section><section class="panel account-panel"><h2>Максимальные находки</h2><div class="metrics">${metric('Металл',r.metalMax,'единиц ресурса')}${metric('Кристалл',r.metalMax/2,'единиц ресурса')}${metric('Дейтерий',r.metalMax/3,'единиц ресурса')}</div><p class="note">Максимальная структура кораблей: ${num(r.fleetMetalMax/2)}. Оценка её полной стоимости: ${num(r.fleetMetalMax/2*state.fleetK)} МСУ. Корабельный и ресурсный максимумы используют разные бонусы.</p><p class="exp-formula">${state.manual?'Максимумы взяты из плагина.':`Базовый максимум: ${num(r.base)} × ${num(state.economy)} (экономика) × 1,5 (Исследователь) × 2 (первопроходец).`}<br>${!state.manual&&state.pro?`Бонусы из технологий: ресурсы +${num(r.resourceBonus)}%, флот +${num(r.shipBonus)}%.<br>`:''}Коэффициенты среднего: ресурсы ${num(r.resourceRate*100)}%; флот ${num(r.shipRate*100)}%; компьютер ×${num(state.computer)}.</p></section>`;
  const url=new URL(location.href);url.search='';for(const[k,v]of Object.entries(state))if(k!=='days')url.searchParams.set(k,v);history.replaceState({},'',url);
}
$('settings').addEventListener('input',event=>{
  const el=event.target,key=el.dataset.key;if(!key)return;
  const previousSource=state.source;
  let value;
  if(el.dataset.number){
    const grouping=!['resourceBonus','shipBonus','discovererBonus','techBoost','computer','scrap','resourceChance','shipChance','fleetK','boosterPercent'].includes(key);
    value=E.parseInput(el.value,grouping);
    const raw=el.value,position=el.selectionStart??raw.length;
    const digitsBefore=(raw.slice(0,position).match(/\d/g)||[]).length;
    const commaBefore=raw.slice(0,position).includes(',')||(!grouping&&!raw.includes(',')&&(raw.match(/\./g)||[]).length===1&&!/^[+-]?\d{1,3}(?:\.\d{3})+$/.test(raw)&&raw.slice(0,position).includes('.'));
    const formatted=E.formatEditing(raw,grouping);
    if(formatted!==raw){
      el.value=formatted;let cursor=0,count=0;
      while(cursor<formatted.length&&count<digitsBefore){if(/\d/.test(formatted[cursor]))count++;cursor++;}
      if(commaBefore&&formatted[cursor]===',')cursor++;
      el.setSelectionRange(cursor,cursor);
    }
  }else value=el.type==='checkbox'?Number(el.checked):Number(el.value);
  if(['resourceBonus','shipBonus','discovererBonus'].includes(key)&&previousSource===2){
    const b=E.technologyBonuses(state);state.resourceBonus=b.resources*100;state.shipBonus=b.ships*100;state.discovererBonus=b.discoverer*100;
  }
  if(key==='flightMode'&&value===1&&state.flightMode===0){
    const total=state.slots*state.waves;
    if(Number.isInteger(total)&&total>=1&&total<=10000){state.flightsPerDay=total;$('flightsPerDay').value=E.formatInput(total);}
  }
  state[key]=value;
  if(key==='computer')computerMultiplier=value;
  if(['t4','t5','t11','t18','experience','techBoost'].includes(key))state.source=2;
  if(['resourceBonus','shipBonus','discovererBonus'].includes(key))state.source=0;
  if(key==='source'){$('methodPicker').open=false;if(state.source===2)$('proSettings').open=true;}
  render();
});
$('computerEnabled').addEventListener('input',()=>{
  computerEnabled=$('computerEnabled').checked;
  state.computer=computerEnabled?computerMultiplier:1;
  $('computer').value=E.formatInput(state.computer);
  render();
});
$('settings').addEventListener('submit',event=>event.preventDefault());
$('reset').onclick=()=>{history.replaceState({},'',location.pathname);location.reload();};
$('share').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);$('copyStatus').textContent='Ссылка скопирована.';}catch{$('copyStatus').textContent='Скопируйте адрес из адресной строки.';}};
render();
