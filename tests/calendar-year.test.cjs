const {test}=require('node:test');const assert=require('node:assert/strict');
const C=require('../releases/calendar-2026-2027/calendar-year.js');
test('both calendars cover the correct twelve months in every phase',()=>{
 for(const phase of 'abcdef')for(const year of ['2025/2026','2026/2027']){
  const c=C.preset(year,phase),base=Number(year.slice(0,4));
  assert.deepEqual(C.months(year,1),[6,7,8,9,10,11].map(m=>[base,m]));
  assert.deepEqual(C.months(year,2),[0,1,2,3,4,5].map(m=>[base+1,m]));
  for(const e of c.events){assert.ok(e.start<=e.end);assert.ok(e.start>=base+'-07-01');assert.ok(e.end<=(base+1)+'-06-30');}
  assert.match(C.tableBody(c,1,true),new RegExp('JULI '+base));assert.match(C.tableBody(c,2,false),new RegExp('JUNI '+(base+1)));
 }
});
test('switching back restores edited calendar, profile and signatures stay intact',()=>{
 const old=C.preset('2026/2027','a');old.events.push({id:'custom',start:'2026-08-01',end:'2026-08-01',title:'Kegiatan sekolah',type:'unit'});
 const o={id:'one',calendar:old,profile:{year:'2026/2027',teacher:'Guru',teacherSignature:'signature'},students:[{name:'A'}]};
 C.switchYear(o,'2025/2026','a');assert.equal(o.profile.year,'2025/2026');o.calendar.events[0].title='Edited 2025';
 C.switchYear(o,'2026/2027','a');assert.deepEqual(o.calendar,old);assert.equal(o.profile.teacherSignature,'signature');
 C.switchYear(o,'2025/2026','a');assert.equal(o.calendar.events[0].title,'Edited 2025');assert.equal(o.students[0].name,'A');
});
test('switching does not change another order or an existing calendar of the same year',()=>{
 const a={calendar:C.preset('2026/2027','d'),profile:{year:'2026/2027'}};const b=structuredClone(a),before=JSON.stringify(b);
 C.switchYear(a,'2025/2026','d');assert.equal(JSON.stringify(b),before);
 a.calendar.events[0].title='Edited';C.switchYear(a,'2025/2026','d');assert.equal(a.calendar.events[0].title,'Edited');
});
test('2026 religious dates are not shifted mechanically from 2027',()=>{
 const c=C.preset('2025/2026','c');assert.equal(c.events.find(e=>e.title==='Idulfitri 1447 H').start,'2026-03-21');assert.equal(c.events.find(e=>e.title==='Tahun Baru Islam').start,'2026-06-16');
});
test('overlapping events do not hide holidays and HTML is escaped',()=>{
 const c={year:'2025/2026',schoolDays:6,events:[{start:'2026-01-01',end:'2026-01-31',type:'unit',title:'<img onerror=bad>'},{start:'2026-01-01',end:'2026-01-31',type:'national',title:'holiday'}]};
 assert.deepEqual(C.stats(c,2026,0),[0,0,0,0]);assert.ok(!C.tableBody(c,2,true).includes('<img onerror'));assert.ok(C.tableBody(c,2,true).includes('&lt;img'));
});
test('storage bridge saves calendar and profile together and survives nested document loading',()=>{
 const vm=require('node:vm'),fs=require('node:fs'),timers=[];
 class Storage{constructor(){this.data={};}getItem(k){return this.data[k]??null;}setItem(k,v){this.data[k]=String(v);}}
 const storage=new Storage(),key='eperangkat.pjok.fasea.v1.orders';
 const o={id:'a',calendar:C.preset('2026/2027','a'),profile:{year:'2026/2027',teacher:'A'}};
 storage.setItem(key,JSON.stringify({activeId:'a',orders:[o,{...structuredClone(o),id:'b'}]}));
 let field={value:'2025/2026'},select={value:'2025/2026'},listeners=[];
 const document={readyState:'loading',documentElement:{},addEventListener:(t,f)=>{if(t==='click')listeners.push(f)},removeEventListener:(t,f)=>{listeners=listeners.filter(x=>x!==f)},getElementById:id=>id==='epCalendarYear'?select:field,querySelector:()=>({dataset:{selectOrder:'a'}})};
 const ctx={Storage,localStorage:storage,document,location:{pathname:'/apps/fase-a/E-Perangkat_pjok_Fase-A/index.html',search:''},URLSearchParams,setTimeout:f=>{timers.push(f);return 1},clearTimeout:()=>{},MutationObserver:class{observe(){}disconnect(){}},addEventListener:()=>{},removeEventListener:()=>{}};ctx.window=ctx;
 const script=fs.readFileSync(require.resolve('../releases/calendar-2026-2027/calendar-year.js'),'utf8');
 vm.runInNewContext(script,ctx);const bridge=Storage.prototype.setItem;vm.runInNewContext(script,ctx);
 assert.equal(Storage.prototype.setItem,bridge);assert.equal(listeners.length,2);
 listeners[0]({target:{closest:()=>true}});o.profile.year='2025/2026';
 storage.setItem(key,JSON.stringify({activeId:'a',orders:[o,{...structuredClone(o),id:'b',profile:{year:'2026/2027'}}]}));
 const saved=JSON.parse(storage.getItem(key));assert.equal(saved.orders[0].calendar.year,'2025/2026');assert.equal(saved.orders[0].profile.year,'2025/2026');assert.equal(saved.orders[1].calendar.year,'2026/2027');
 timers.forEach(f=>f());
});
