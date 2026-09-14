// Run with: node tests/print-preview-parity.test.cjs
const fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../releases/calendar-2026-2027/print-safe-pages.js'),'utf8');
const events={},docEvents={},frames=[];let observerCall,reads=0;
const window={addEventListener:(type,fn)=>{events[type]=fn;}};
const document={readyState:'loading',documentElement:{},getElementById:()=>({}),addEventListener:(type,fn)=>{docEvents[type]=fn;},querySelector:()=>{reads++;return null;},querySelectorAll:()=>{reads++;return [];}};
const Observer=function(fn){observerCall=fn;this.observe=()=>{};};
new Function('window','document','MutationObserver','requestAnimationFrame',source)(window,document,Observer,fn=>frames.push(fn));
events.beforeprint();observerCall();docEvents.DOMContentLoaded();while(frames.length)frames.shift()();
assert.equal(reads,0,'beforeprint and queued work must not repartition the preview');
events.afterprint();while(frames.length)frames.shift()();
assert.ok(reads>0,'screen pagination resumes after the print dialog');
assert.ok(source.includes('#printRoot > .page.landscape'));
assert.ok(source.includes('#printRoot > .page.portrait'));
assert.ok(!source.includes('restoreAndPaginateNow'));
console.log('PASS: print lifecycle preserves preview page structure; portrait/landscape rules exist');
