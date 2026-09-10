(()=>{
'use strict';
const D=window.EPERANGKAT_DATA;if(!D)return;
function apply(grade,rombel=''){D.specialSchedule.activeGrade=String(grade||'X').toUpperCase();D.specialSchedule.activeRombel=String(rombel||'').toUpperCase()}
window.applyEPerangkatSchedule=apply;
const q=new URLSearchParams(location.search);
let p={};try{p=JSON.parse(localStorage.getItem('eperangkat.bahasa-inggris.fasee.v1.profile')||'{}')}catch(_){p={}}
apply(q.get('grade')||localStorage.getItem('eperangkat.bahasa-inggris.fasee.v1.grade')||'X',p.rombel||'');
})();

