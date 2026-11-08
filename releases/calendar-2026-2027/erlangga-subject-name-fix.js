(()=>{"use strict";
const path=location.pathname;
const variants=[
  {needle:"E-Perangkat_bahasa-inggris-erlangga_Fase-B",canonical:"Bahasa Inggris",brand:"Bahasa Inggris Erlangga · Kelas III",heroFrom:"Perangkat B. Inggris",heroTo:"Perangkat Bahasa Inggris"},
  {needle:"E-Perangkat_pendidikan-agama-islam-erlangga_Fase-A",canonical:"Pendidikan Agama Islam dan Budi Pekerti",brand:"PAI BP Erlangga · Fase A",heroFrom:"Perangkat PAIBP",heroTo:"Perangkat Pendidikan Agama Islam dan Budi Pekerti"},
  {needle:"E-Perangkat_pendidikan-agama-islam-erlangga_Fase-B",canonical:"Pendidikan Agama Islam dan Budi Pekerti",brand:"PAI BP Erlangga · Fase B",heroFrom:"Perangkat PAIBP",heroTo:"Perangkat Pendidikan Agama Islam dan Budi Pekerti"},
  {needle:"E-Perangkat_pendidikan-agama-islam-erlangga_Fase-C",canonical:"Pendidikan Agama Islam dan Budi Pekerti",brand:"PAI BP Erlangga · Fase C",heroFrom:"Perangkat PAIBP",heroTo:"Perangkat Pendidikan Agama Islam dan Budi Pekerti"},
  {needle:"E-Perangkat_bahasa-indonesia-erlangga_Fase-B",canonical:"Bahasa Indonesia",brand:"Bahasa Indonesia Erlangga · Kelas III",heroFrom:"Perangkat B. Indonesia",heroTo:"Perangkat Bahasa Indonesia"},
  {needle:"E-Perangkat_ipas-erlangga_Fase-B",canonical:"Ilmu Pengetahuan Alam dan Sosial (IPAS)",brand:"IPAS Erlangga · Kelas III",heroFrom:"Perangkat IPAS",heroTo:"Perangkat Ilmu Pengetahuan Alam dan Sosial (IPAS)"},
  {needle:"E-Perangkat_matematika-erlangga_Fase-B",canonical:"Matematika",brand:"Matematika Erlangga · Kelas III",heroFrom:"Perangkat Matematika",heroTo:"Perangkat Matematika"},
  {needle:"E-Perangkat_pendidikan-pancasila-erlangga_Fase-B",canonical:"Pendidikan Pancasila",brand:"Pendidikan Pancasila Erlangga · Kelas III",heroFrom:"Perangkat Pancasila",heroTo:"Perangkat Pendidikan Pancasila"},
  {needle:"E-Perangkat_seni-budaya-erlangga_Fase-B",canonical:"Seni Budaya",brand:"Seni Budaya Erlangga · Kelas III",heroFrom:"Perangkat Seni Rupa",heroTo:"Perangkat Seni Budaya"}
];
const cfg=variants.find(v=>path.includes(v.needle));
if(!cfg)return;

function patch(){
  document.querySelectorAll(".doc-head dt").forEach(dt=>{
    if((dt.textContent||"").trim()==="Mata Pelajaran"){
      const value=dt.nextElementSibling?.nextElementSibling;
      if(value && value.textContent!==cfg.canonical) value.textContent=cfg.canonical;
    }
  });

  document.querySelectorAll(".cover-center h2").forEach(h=>{
    const t=(h.textContent||"").trim();
    const marker=" · Kelas";
    const i=t.indexOf(marker);
    if(i>=0){
      const next=cfg.canonical+t.slice(i);
      if(t!==next) h.textContent=next;
    }
  });

  const brand=document.querySelector(".brand span");
  if(brand && (brand.textContent||"").trim()!==cfg.brand) brand.textContent=cfg.brand;

  document.querySelectorAll(".hero h1").forEach(h=>{
    const t=h.textContent||"";
    if(cfg.heroFrom && t.includes(cfg.heroFrom)){
      h.textContent=t.replace(cfg.heroFrom,cfg.heroTo);
    }
    if(cfg.needle.includes("seni-budaya") && t.includes("Perangkat Seni Rupa")){
      h.textContent=t.replace("Perangkat Seni Rupa","Perangkat Seni Budaya");
    }
  });

  const expectedTitle="E-Perangkat "+cfg.canonical+" Versi Erlangga Kelas 3";
  if(document.title && !document.title.includes("Versi Erlangga Kelas 3")){
    document.title=expectedTitle;
  }
}
patch();
let queued=false;
new MutationObserver(()=>{
  if(queued)return;
  queued=true;
  setTimeout(()=>{queued=false;patch()},30);
}).observe(document.documentElement,{subtree:true,childList:true,characterData:true});
let n=0;
const timer=setInterval(()=>{patch();if(++n>200)clearInterval(timer)},50);
})();