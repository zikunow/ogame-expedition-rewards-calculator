'use strict';
(function(root){
  const brackets=[[10000,40000],[100000,500000],[1000000,1200000],[5000000,1800000],[25000000,2400000],[50000000,3000000],[75000000,3600000],[100000000,4200000],[Infinity,5000000]];
  const defaults={economy:8,topPoints:100000000,resourceBonus:0,shipBonus:0,manual:0,metalMax:120000000,fleetMetalMax:120000000,slots:8,waves:6,days:30,computer:1,fuel:0,loss:0,scrap:100,resourceChance:34.5,shipChance:16.5,fleetK:1.5,model:0,pro:0,t4:0,t5:0,t11:0,t18:0,experience:0,techBoost:0,source:-1,discovererBonus:0,pluginFleet:60000000,fleetUnit:0,boosterActive:0,boosterPercent:25,boosterIncluded:0};
  function technologyBonuses(s){
    const amplification=1+s.experience*.001+s.techBoost/100;
    const ships=.002*s.t4*amplification;
    const resources=.002*(s.t5+s.t11)*amplification;
    const discoverer=.002*s.t18*amplification;
    // Empirically reported live-game stacking: class multiplier 1.5*(1+B18).
    // T18 multiplies each yield bonus; it is not added to it.
    return {amplification,ships,resources,discoverer,
      resourceBonus:((1+resources)*(1+discoverer)-1)*100,
      shipBonus:((1+ships)*(1+discoverer)-1)*100};
  }
  function calculate(s){
    const source=s.source===-1?(s.manual?1:s.pro?2:3):s.source;
    const active=['slots','waves','days','computer','fuel','loss','scrap','fleetK','model','source','boosterActive'];
    if(source!==1)active.push('economy','topPoints');
    if(source===0||source===3)active.push('resourceBonus','shipBonus');
    if(source===0)active.push('discovererBonus');
    if(source===1){active.push('metalMax');if(s.source===-1)active.push('fleetMetalMax');else active.push('pluginFleet','fleetUnit');}
    if(source===2)active.push('t4','t5','t11','t18','experience','techBoost');
    if(s.model)active.push('resourceChance','shipChance');
    if(s.boosterActive){active.push('boosterPercent');if(source===1)active.push('boosterIncluded');}
    for(const k of active)if(!Number.isFinite(s[k])||(s[k]<0&&k!=='source'))throw new RangeError(k);
    for(const k of ['slots','waves','days',...(source===1?[]:['economy'])])if(!Number.isInteger(s[k])||s[k]<1||s[k]>10000)throw new RangeError(k);
    for(const k of ['resourceChance','shipChance','scrap'])if(s[k]>100)throw new RangeError(k);
    if((s.model&&s.resourceChance+s.shipChance>100)||s.fleetK<1||s.computer<1||s.computer>10||(source===2&&s.experience>100)||![-1,0,1,2].includes(s.source)||![0,1].includes(s.model)||![0,1].includes(s.boosterActive)||(source===1&&s.source!==-1&&![0,1].includes(s.fleetUnit))||(s.boosterActive&&source===1&&![0,1].includes(s.boosterIncluded)))throw new RangeError('model');
    const base=brackets.find(([limit])=>(Number.isFinite(s.topPoints)?s.topPoints:0)<limit)[1];
    const technology=technologyBonuses(s);
    const classFactor=1+s.discovererBonus/100;
    const resourceBonus=source===2?technology.resourceBonus:source===0?((1+s.resourceBonus/100)*classFactor-1)*100:s.resourceBonus;
    const shipBonus=source===2?technology.shipBonus:source===0?((1+s.shipBonus/100)*classFactor-1)*100:s.shipBonus;
    // Plugin maxima include lifeforms/T18. Only the explicitly missing item is added.
    const reference=base*s.economy*1.5*2;
    const itemApplied=!!s.boosterActive&&!(source===1&&s.boosterIncluded===1);
    const itemFactor=itemApplied?1+s.boosterPercent/100:1;
    const metalBeforeItem=source===1?s.metalMax:reference*(1+resourceBonus/100);
    const metalMax=metalBeforeItem*itemFactor;
    const fleetMetalMax=source===1?(s.source===-1?s.fleetMetalMax:s.pluginFleet*2/(s.fleetUnit===1?s.fleetK:1)):reference*(1+shipBonus/100);
    const f=.9*.15+.09*.38+.01*.755;
    const resourceRate=s.model?s.resourceChance/100*f*(.5+1/3*.5*1.5+1/6/3*3):.056;
    const shipRate=s.model?s.shipChance/100*f*.5*s.fleetK:.0219;
    const resources=metalMax*resourceRate*s.computer, ships=fleetMetalMax*shipRate*s.computer;
    const realised=ships*s.scrap/100, fuel=s.fuel*3, net=resources+realised-fuel-s.loss;
    const dailyFlights=s.slots*s.waves;
    return {base,reference,metalMax,fleetMetalMax,f,resourceRate,shipRate,resources,ships,realised,fuel,net,dailyFlights,resourceBonus,shipBonus,technology,source,itemApplied,itemFactor,metalBeforeItem,daily:net*dailyFlights,period:net*dailyFlights*s.days};
  }
  const api={brackets,defaults,calculate,technologyBonuses};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Expeditions=api;
})(globalThis);
