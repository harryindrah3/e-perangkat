const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {choose,snapshotForOrder,printUrl,safeFilename}=require('../extension/core.js');
const apps=JSON.parse(fs.readFileSync(new URL('../catalog.json',`file://${__filename}`)));
const app=apps.find(a=>a.id==='fase-c-bahasa-indonesia');
test('only the fixed production print route and valid grades can be requested',()=>{
  const payload={appId:app.id,orderId:'order-&x=1',grade:'V',semester:'1'};
  assert.equal(choose(apps,payload),app);
  const url=new URL(printUrl(app,payload));
  assert.equal(url.origin,'https://e-perangkat-online-a-f.vercel.app');
  assert.equal(url.searchParams.get('order'),'order-&x=1');
  assert.equal(url.searchParams.get('wm'),'auto');
  assert.throws(()=>choose(apps,{...payload,grade:'XII'}));
  assert.throws(()=>choose(apps,{...payload,appId:'https://attacker.invalid'}));
});
test('selected order retains logos, signatures, calendar, students; old cached identity cannot leak',()=>{
  const prefix=app.storageKey.replace(/\.orders$/,'');
  const target={id:'B',grade:'V',profile:{teacher:'Guru B',teacherSignature:'data:image/png;base64,BBBB',customLogoLeft:'data:image/png;base64,CCCC',date:'13 Juli 2026',teachingSchedule:[{day:'Rabu'}]},students:[{name:'Siswa B'}],history:[{action:'Asli'}]};
  const raw={[app.storageKey]:JSON.stringify({activeId:'A',orders:[{id:'A',profile:{teacher:'Guru A'}},target]}),[prefix+'.profile']:JSON.stringify({teacher:'Guru A'}),[prefix+'.calendar']:JSON.stringify({start:'2026-07-13'}),['eperangkat.other.v1.orders']:'other'};
  const original=JSON.stringify(raw);
  const result=snapshotForOrder(raw,app,'B');
  const store=JSON.parse(result.storage[app.storageKey]);
  assert.deepEqual(store.orders,[target]);assert.equal(store.activeId,'B');
  assert.equal(JSON.parse(result.storage[prefix+'.profile']).teacher,'Guru B');
  assert.equal(JSON.parse(result.storage[prefix+'.profile']).customLogoLeft,target.profile.customLogoLeft);
  assert.deepEqual(JSON.parse(result.storage[prefix+'.students']),target.students);
  assert.equal(result.storage[prefix+'.calendar'],raw[prefix+'.calendar']);
  assert.equal(result.storage['eperangkat.other.v1.orders'],undefined);
  assert.equal(JSON.stringify(raw),original);
  assert.throws(()=>snapshotForOrder(raw,app,'missing'));
});
test('catalog has unique identities and all six phases',()=>{
  assert.equal(apps.length,78);assert.equal(new Set(apps.map(a=>a.id)).size,78);
  assert.deepEqual([...new Set(apps.map(a=>a.phase))].sort(),['A','B','C','D','E','F']);
  for(const a of apps)assert.match(a.appPath,/^\/apps\/fase-[a-f]\/E-Perangkat_[a-z0-9-]+_Fase-[A-F]$/);
});
test('filenames cannot create directories or inject control characters',()=>{
  assert.equal(safeFilename('../Guru: B/kelas\\V\nSemester 1'),'.. Guru B kelas V Semester 1');
  assert.ok(safeFilename('x'.repeat(400)).length<=190);
});
