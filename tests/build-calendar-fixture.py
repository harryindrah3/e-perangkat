"""Build an isolated browser fixture from the restored source bundle (no cloud sync)."""
from pathlib import Path
import sys,json
src=Path(sys.argv[1])/ 'apps/fase-c/E-Perangkat_bahasa-indonesia_Fase-C/assets'
out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True)
setup="""<script>
const KEY='eperangkat.bahasa-indonesia.fasec.v1.orders';
window.EPERANGKAT_DATA={meta:{},defaults:{year:'2026/2027',school:'Sekolah Uji',teacher:'Guru Uji',government:'PEMERINTAH',department:'DINAS PENDIDIKAN',program:'SD',place:'Buol',region:'Buol',date:'14 Juli 2026',logoMode:'custom'}};
if(!localStorage.getItem(KEY))localStorage.setItem(KEY,JSON.stringify({activeId:'test-a',orders:['a','b'].map(id=>({id:'test-'+id,number:'UJI-'+id,customer:'Pesanan '+id,grade:'V',profile:{...EPERANGKAT_DATA.defaults},paymentStatus:'lunas',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),students:[],history:[],calendar:{year:'2026/2027',events:[{id:'custom26',start:'2026-09-10',end:'2026-09-10',type:'unit',title:'Kegiatan khusus 2026'}]}}))}));
</script>"""
head='<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Uji kalender terisolasi</title><style>body{font:14px Arial;padding:20px}label{display:flex;flex-direction:column;gap:5px;margin:8px}input,select,button{padding:8px}.order-form-grid{display:grid;grid-template-columns:repeat(3,1fr)}.orders-layout{display:grid;grid-template-columns:180px 1fr}.order-list-item{display:block}.calendar-main,.print-calendar{width:100%;border-collapse:collapse}td,th{border:1px solid #ccc;padding:4px}.mini-cal,.print-mini-cal{font-size:10px}.calendar-event-edit{display:flex}small{display:block}.print-cal-title{display:flex;justify-content:space-between}.page{margin-bottom:20px}.order-block{border:1px solid #ddd;margin:10px}</style>'+setup+'<script src="/calendar-year.js"></script><script src="/calendar-level-runtime.js"></script></head><body>'
nav='<nav><button data-view="orders">Pesanan dan Riwayat</button><button data-view="calendar">Kalender Pendidikan</button></nav><div class="topbar"><span class="school">Uji</span></div><main id="app"></main><script>localStorage.setItem(KEY.replace(".orders",".view"),"orders");document.querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>localStorage.setItem(KEY.replace(".orders",".view"),b.dataset.view));</script>'
(out/'test-calendar.html').write_text(head+nav+'<script>'+ (src/'v3.js').read_text()+'</script><a href="test-print.html?section=calendar&semester=both&order=test-a">Uji cetak dua semester</a></body></html>')
(out/'test-print.html').write_text(head+'<main id="printRoot"></main><script>'+ (src/'print-v3.js').read_text()+'</script></body></html>')
