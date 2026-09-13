// Exercise the actual worker from request through validated PDF download.
// The Chrome transport is simulated; this is not a native browser parity test.
const test=require('node:test');const assert=require('node:assert/strict');
const vm=require('node:vm');const fs=require('node:fs');const path=require('node:path');
const ext=path.join(__dirname,'../extension');
async function worker({failPrint=false}={}){
  const calls=[],downloaded=[],timeouts=[];let listener,printed=false,disabled=false,closed=false,restored=false;
  const catalog=JSON.parse(fs.readFileSync(path.join(ext,'catalog.json')));const app=catalog.find(a=>a.id.includes('informatika')&&a.phase==='D');
  const order={id:'flow-test',grade:'VII',profile:{teacher:'TEST GURU',school:'TEST SEKOLAH'}};
  const raw={[app.storageKey]:JSON.stringify({activeId:order.id,orders:[order]})};
  const state={pages:140,hash:123,sizes:'stable',pending:0,broken:[],ready:true,title:'TEST GURU Informatika VII',firstText:'TEST GURU',fonts:['Times New Roman']};
  const context=vm.createContext({console,TextEncoder,TextDecoder,atob,btoa,URL,
    setTimeout:(f,ms)=>setTimeout(f,Math.min(ms,1)),clearTimeout,fetch:async()=>({json:async()=>catalog}),
    chrome:{action:{onClicked:{addListener(){}}},runtime:{getURL:f=>f,getManifest:()=>({version:'1.0.3'}),onMessage:{addListener:f=>listener=f}},
    tabs:{query:async()=>[{id:1,url:'https://e-perangkat-online-a-f.vercel.app/'}],get:async()=>({id:1,status:'complete'}),create:async()=>({id:2}),sendMessage:async()=>{},remove:async()=>{closed=true;calls.push('close')},update:async()=>{restored=true}},
    scripting:{executeScript:async opts=>opts.target.tabId===1?[{result:raw}]:[]},
    debugger:{attach:async()=>{},detach:async()=>{assert.ok(closed,'close isolated tab before lifting network block');calls.push('detach')},onDetach:{addListener(){}},sendCommand:async(_,method,params)=>{
      calls.push(method);
      if(method==='Emulation.setScriptExecutionDisabled'){disabled=params.value;return {}}
      if(method==='Runtime.evaluate')return {result:{value:params.expression.includes('const pages=')?state:true}};
      if(method==='Page.printToPDF'){
        if(params.transferMode==='ReturnAsBase64')return {data:Buffer.from('%PDF-1.7 probe').toString('base64')};
        assert.ok(disabled,'source scripts must be paused throughout native printing');
        assert.equal(params.preferCSSPageSize,true);assert.equal(params.pageRanges,undefined);assert.equal(params.scale,1);
        if(failPrint)throw Error('Native print failed');printed=true;return {stream:'pdf'};
      }
      if(method==='IO.read')return {data:Buffer.from(context.pdfBytes).toString('base64'),base64Encoded:true,eof:true};
      return {};
    }},downloads:{download:async opts=>{assert.ok(printed);downloaded.push(opts);return 7},search:async()=>[{state:'complete'}]}}
  });
  context.importScripts=(...files)=>files.forEach(file=>vm.runInContext(fs.readFileSync(path.join(ext,file),'utf8'),context));
  vm.runInContext(fs.readFileSync(path.join(ext,'background.js'),'utf8'),context);
  // Record real requested time limits, keeping tests independent of wall time.
  context.GeneratorJobs.bounded; // The worker captures bounded at startup; timers below capture its requests.
  context.setTimeout=(f,ms)=>{timeouts.push(ms);return setTimeout(f,ms>=3000?1000:1)};
  context.pdfBytes=await vm.runInContext('(async()=>{const doc=await PDFLib.PDFDocument.create();doc.addPage([595,842]);return doc.save()})()',context);
  const result=await new Promise(resolve=>listener({channel:'genarator-e-perangkat-v1',action:'generate',id:'test',payload:{appId:app.id,orderId:order.id,grade:'VII',semester:'1'}},{tab:{id:3},url:'https://genarator-e-perangkat.vercel.app/'},resolve));
  return {result,calls,downloaded,timeouts,closed,restored,disabled};
}
test('valid native PDF is downloaded even when preview and PDF page counts differ',async()=>{
  const w=await worker();assert.equal(w.result.error,undefined);assert.equal(w.downloaded.length,1);
  assert.ok(w.downloaded[0].url.startsWith('data:application/pdf;base64,JVBERi0'));
  assert.equal(w.result.result.pages,1);assert.match(w.result.result.warning,/pratinjau 140 halaman/);
  assert.ok(w.timeouts.includes(600000),'real native print gets ten minutes');
  assert.equal(w.disabled,false);assert.ok(w.closed&&w.restored);
});
test('native failure restores script execution, closes isolated tab and returns a visible stage error',async()=>{
  const w=await worker({failPrint:true});assert.match(w.result.error,/Tahap: Membuat PDF 140 halaman/);
  assert.match(w.result.error,/Native print failed/);assert.equal(w.downloaded.length,0);
  assert.equal(w.disabled,false);assert.ok(w.closed&&w.restored);
});
