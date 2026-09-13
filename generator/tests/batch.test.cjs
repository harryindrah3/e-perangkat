const test=require('node:test'),assert=require('node:assert/strict');const {jobs,run}=require('../batch-core.js');
const order=(appId,grade)=>({appId,grade,orderId:appId+'-'+grade,teacher:'Guru A'});
test('PJOK six grades makes 12 unique jobs, retaining each order and grade',()=>{
 const orders=['I','II','III','IV','V','VI'].map(g=>order('pjok',g));const q=jobs([...orders,orders[0]],'both');assert.equal(q.length,12);
 assert.deepEqual(q.map(j=>j.order.grade),orders.flatMap(o=>[o.grade,o.grade]));assert.deepEqual(q.map(j=>j.semester),orders.flatMap(()=>['1','2']));
});
test('five selected subjects in grade III make ten jobs',()=>{
 const q=jobs(['bindo','mtk','pancasila','ipas','seni'].map(a=>order(a,'III')),'both');assert.equal(q.length,10);assert.ok(q.every(j=>j.order.grade==='III'));
});
test('queue is sequential, continues after failure, retry never prints completed PDFs again',async()=>{
 const q=jobs([order('pjok','I'),order('pjok','II')],'both');let active=0,max=0;const seen=[];
 await run(q,{cancelled:()=>false,onChange(){},generate:async j=>{active++;max=Math.max(max,active);seen.push(j);await Promise.resolve();active--;if(seen.length===2)throw Error('failure');return {filename:'ok.pdf'};}});
 assert.equal(max,1);assert.deepEqual(q.map(j=>j.status),['done','failed','done','done']);const retried=[];
 await run(q,{cancelled:()=>false,onChange(){},generate:async j=>{retried.push(j);return {};}});assert.deepEqual(retried,[q[1]]);assert.ok(q.every(j=>j.status==='done'));
});
test('cancel retains waiting jobs and a resume completes only remaining PDFs',async()=>{
 const q=jobs([order('bindo','III'),order('mtk','III')],'both');let cancelled=false;
 await run(q,{cancelled:()=>cancelled,onChange(){},generate:async()=>{cancelled=true;return {};}});
 assert.deepEqual(q.map(j=>j.status),['done','pending','pending','pending']);let count=0;
 await run(q,{cancelled:()=>false,onChange(){},generate:async()=>{count++;return {};}});assert.equal(count,3);
});
