const test=require('node:test');
const assert=require('node:assert/strict');
const {bounded,readPdfStream,toBase64}=require('../extension/job-utils.js');
test('hung Chrome command ends with its command name instead of leaving a job pending',async()=>{
  await assert.rejects(bounded(new Promise(()=>{}),15,'Page.printToPDF'),/Page.printToPDF tidak merespons/);
});
test('successful command and native rejection are preserved',async()=>{
  assert.deepEqual(await bounded(Promise.resolve({stream:'pdf'}),100,'print'),{stream:'pdf'});
  await assert.rejects(bounded(Promise.reject(Error('Printing is not available')),100,'print'),/Printing is not available/);
});
test('large streamed PDF preserves every byte, including chunk boundaries, and closes handle',async()=>{
  const data=new Uint8Array(900003);data.set(new TextEncoder().encode('%PDF-1.7\n'));
  for(let i=9;i<data.length;i++)data[i]=i%256;
  let offset=0,closed=false;
  const result=await readPdfStream({stream:'test'},async(method,p)=>{
    assert.equal(p.handle,'test');
    if(method==='IO.close'){closed=true;return {}};
    assert.equal(method,'IO.read');const next=data.subarray(offset,offset+131071);offset+=next.length;
    return {data:Buffer.from(next).toString('base64'),base64Encoded:true,eof:offset===data.length};
  });
  assert.ok(closed);assert.deepEqual(result,data);
  assert.deepEqual(Buffer.from(toBase64(result),'base64'),Buffer.from(data));
});
test('failed stream still closes and does not return a partial PDF',async()=>{
  let closed=false;
  await assert.rejects(readPdfStream({stream:'test'},async(method)=>{
    if(method==='IO.close'){closed=true;return {}}throw Error('read failed');
  }),/read failed/);assert.ok(closed);
});
test('empty incomplete stream aborts and closes instead of looping forever',async()=>{
  let closed=false;
  await assert.rejects(readPdfStream({stream:'test'},async(method)=>{
    if(method==='IO.close'){closed=true;return {}}return {data:'',eof:false};
  }),/sebelum selesai/);assert.ok(closed);
});
