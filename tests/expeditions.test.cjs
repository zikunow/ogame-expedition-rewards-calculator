const {test}=require('node:test');
const assert=require('node:assert/strict');
const E=require('../expeditions-core.js');
const calc=overrides=>E.calculate({...E.defaults,...overrides});
test('discoverer + pathfinder at eco 8 reaches 120M metal and rounded expected yields',()=>{const r=calc();assert.equal(r.metalMax,120e6);assert.equal(r.resources,6720000);assert.equal(r.ships,2628000);assert.equal(r.daily,448704000);});
test('resource and ship upgrades remain independent',()=>{const a=calc(),b=calc({resourceBonus:100});assert.equal(b.resources,a.resources*2);assert.equal(b.ships,a.ships);});
test('manual maxima include bonuses once; fuel is converted into MSU',()=>{const r=calc({manual:1,metalMax:100e6,fleetMetalMax:200e6,resourceBonus:100,shipBonus:100,fuel:1000,loss:200,scrap:75});assert.equal(r.resources,5600000);assert.equal(r.ships,4380000);assert.equal(r.net,5600000+4380000*.75-3000-200);});
test('derived probabilities reproduce forum arithmetic with explicit assumptions',()=>{const r=calc({model:1});assert.ok(Math.abs(r.resourceRate-.0558971875)<1e-12);assert.ok(Math.abs(r.shipRate-.0218728125)<1e-12);});
test('bracket boundaries and invalid input',()=>{assert.equal(calc({topPoints:99999999}).base,4200000);assert.equal(calc({topPoints:100000000}).base,5000000);assert.throws(()=>calc({slots:1.2}));assert.throws(()=>calc({fuel:NaN}));assert.throws(()=>calc({model:1,resourceChance:90,shipChance:20}));});
test('summed T4 boosts only fleet, while T5 and T11 add to resource yield',()=>{
  const base=calc(),ship=calc({pro:1,t4:100}),res=calc({pro:1,t5:100,t11:50});
  assert.equal(ship.resources,base.resources);assert.equal(ship.ships,base.ships*1.2);
  assert.ok(Math.abs(res.resources-base.resources*1.3)<1e-7);assert.equal(res.ships,base.ships);
});
test('T18 multiplies technology yields and ignores manually entered bonus percentages in pro mode',()=>{
  const r=calc({pro:1,t4:100,t5:100,t11:100,t18:100,resourceBonus:900,shipBonus:900});
  assert.ok(Math.abs(r.resourceBonus-68)<1e-10);assert.ok(Math.abs(r.shipBonus-44)<1e-10);
  assert.ok(Math.abs(r.metalMax-120e6*1.4*1.2)<1e-6);
  assert.ok(Math.abs(r.fleetMetalMax-120e6*1.2*1.2)<1e-6);
});
test('experience and buildings enhance summed levels once; manual maxima stay authoritative',()=>{
  const r=calc({pro:1,t5:360,t18:100,experience:100,techBoost:10});
  assert.ok(Math.abs(r.technology.amplification-1.2)<1e-12);
  assert.ok(Math.abs(r.metalMax-120e6*1.864*1.24)<1e-6);
  assert.equal(calc({manual:1,pro:1,t5:360,t18:100,metalMax:123}).metalMax,123);
});
test('manual percentages remain available when pro mode is off; invalid tech inputs fail',()=>{
  assert.equal(calc({pro:0,t5:360,resourceBonus:50}).metalMax,180e6);
  assert.throws(()=>calc({pro:1,t18:-1}));assert.throws(()=>calc({pro:1,experience:101}));
});
test('game LF bonuses, separate Discoverer boost and item multiply without affecting fleet item yield',()=>{
  const a=calc({source:0,resourceBonus:100,shipBonus:50,discovererBonus:7.14});
  const b=calc({source:0,resourceBonus:100,shipBonus:50,discovererBonus:7.14,boosterActive:1,boosterPercent:25});
  assert.ok(Math.abs(b.metalMax-321420000)<1e-6);
  assert.equal(b.ships,a.ships);assert.equal(b.resources,a.resources*1.25);
});
test('item affects resources in technology mode, with exactly one T18 multiplier',()=>{
  const r=calc({source:2,t4:100,t5:100,t11:100,t18:100,boosterActive:1,boosterPercent:25,boosterIncluded:1});
  assert.ok(Math.abs(r.metalMax-252000000)<1e-6);assert.ok(Math.abs(r.fleetMetalMax-172800000)<1e-6);
  assert.equal(r.itemApplied,true);
});
test('plugin maxima add a missing item exactly once and ignore all LF/T18 inputs',()=>{
  const plain={source:1,metalMax:120e6,pluginFleet:60e6,fleetUnit:0,resourceBonus:999,discovererBonus:999,t18:999};
  const a=calc({...plain,boosterActive:1,boosterPercent:25,boosterIncluded:0});
  const b=calc({...plain,metalMax:150e6,boosterActive:1,boosterPercent:25,boosterIncluded:1});
  assert.equal(a.metalMax,150e6);assert.equal(b.metalMax,a.metalMax);assert.equal(a.ships,b.ships);
  assert.equal(a.itemApplied,true);assert.equal(b.itemApplied,false);
});
test('plugin fleet structure and MSU units give identical results',()=>{
  const a=calc({source:1,pluginFleet:60e6,fleetUnit:0});
  const b=calc({source:1,pluginFleet:90e6,fleetUnit:1});
  assert.equal(a.fleetMetalMax,120e6);assert.equal(a.ships,b.ships);
});
test('inactive source and item fields cannot invalidate another input mode',()=>{
  assert.doesNotThrow(()=>calc({source:1,economy:NaN,t5:NaN,resourceBonus:NaN,boosterPercent:NaN}));
  assert.throws(()=>calc({source:0,discovererBonus:NaN}));
  assert.throws(()=>calc({source:1,boosterActive:1,boosterPercent:NaN}));
  assert.throws(()=>calc({source:1,fleetUnit:3}));
});
