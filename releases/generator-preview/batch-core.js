(function(root){
'use strict';
const key=r=>r.appId+'::'+r.orderId;
function jobs(records,semester){
 const unique=[...new Map(records.map(r=>[key(r),r])).values()];
 const semesters=semester==='both'?['1','2']:[semester];
 if(semesters.some(s=>!['1','2'].includes(s)))throw Error('Semester tidak valid.');
 return unique.flatMap(order=>semesters.map(semester=>({order:{...order},semester,status:'pending',error:'',result:null})));
}
async function run(queue,{generate,cancelled,onChange}){
 for(const job of queue){
  if(cancelled())break;
  if(job.status==='done')continue;
  job.status='running';job.error='';onChange(job);
  try{job.result=await generate(job);job.status='done';}
  catch(error){job.status=cancelled()?'pending':'failed';job.error=error.message||String(error);}
  onChange(job);
 }
}
const api={key,jobs,run};if(typeof module!=='undefined')module.exports=api;else root.GeneratorBatch=api;
})(typeof self!=='undefined'?self:globalThis);
