const fs=require('fs');
const path=require('path');
const root=__dirname;
const phases=['A','B','C'];
const expected={A:20,B:22,C:20};
const requiredRoot=[
  'calendar-level-runtime.js',
  'calendar-year.js',
  'calendar-source-runtime.js',
  'calendar-2024-extension.js',
  'kktp-order-runtime.js'
];
const wrapperTokens=[
  'phase-c-supervision.js?v=20260908-all-af-2',
  'promes-print-route-fix.js?v=20260909-calendar-slot-fix-4',
  'calendar-level-runtime.js?v=20260917-2024-1',
  'calendar-year.js?v=20260917-2024-1',
  'calendar-source-runtime.js?v=20260917-2024-1',
  'kktp-order-runtime.js?v=20260915-9',
  'print-filename.js?v=20260911-2',
  'differentiation-runtime.js?v=20260915-2',
  'print-safe-pages.js?v=20260915-5',
  'ep-erlangga-storage-isolation'
];
for(const file of requiredRoot){
  if(!fs.existsSync(path.join(root,file)))throw new Error('Runtime missing: '+file);
}
for(const phase of phases){
  const dir=path.join(root,'apps','fase-'+phase.toLowerCase(),'E-Perangkat_pendidikan-agama-islam-erlangga_Fase-'+phase);
  const raw=fs.readFileSync(path.join(dir,'data.js'),'utf8').replace(/^window\.EPERANGKAT_DATA=/,'').replace(/;\s*$/,'');
  const d=JSON.parse(raw);
  if(d.modules.length!==expected[phase])throw new Error('Module count mismatch Fase '+phase);
  const requiredModuleKeys=['title','subchapters','objectives','contexts','framework','deep','meetings','assessment','questions','profile','crossDiscipline'];
  for(const m of d.modules){
    for(const k of requiredModuleKeys){
      const v=m[k];
      if(v==null || (Array.isArray(v)&&!v.length))throw new Error('Missing '+k+' on '+phase+' '+m.id);
    }
    if(!m.meetings.every(x=>Array.isArray(x.pendahuluan)&&x.pendahuluan.length&&Array.isArray(x.inti)&&x.inti.length&&Array.isArray(x.penutup)&&x.penutup.length)){
      throw new Error('Incomplete meeting structure '+phase+' '+m.id);
    }
  }
  for(const page of ['index.html','print.html']){
    const html=fs.readFileSync(path.join(dir,page),'utf8');
    for(const token of wrapperTokens){
      if(!html.includes(token))throw new Error('Feature token missing '+token+' in '+phase+'/'+page);
    }
    if(html.includes('e-perangkat-online-a-efzg7qnbn'))throw new Error('Dead source remains in '+phase+'/'+page);
  }
}
console.log('PAIBP Erlangga feature parity validation PASS');
