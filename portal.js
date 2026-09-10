(function(){
  "use strict";
  const catalog=window.EPERANGKAT_CATALOG?.apps||[];
  const sync=window.PortalSync;
  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
  const esc=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||"null")??fallback}catch(_){return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const FAVORITES="portal.eperangkat.favorites.v1",RECENTS="portal.eperangkat.recents.v1";
  const phases=["A","B","C","D","E","F"];
  const phaseNames={A:"I–II",B:"III–IV",C:"V–VI",D:"VII–IX",E:"X",F:"XI–XII"};
  const subjectSymbols={"Matematika":"∑","Matematika Tingkat Lanjut":"∫","Bahasa Indonesia":"BI","Bahasa Inggris":"EN","Bahasa Inggris Tingkat Lanjut":"EN+","Pendidikan Agama Islam":"PAI","Pendidikan Pancasila":"PP","Informatika":"</>","IPA":"IPA","IPAS":"IPAS","IPS":"IPS","PJOK":"PJ","Seni Budaya":"SB","Seni Rupa":"SR","Seni Musik":"♫","Prakarya":"PK","Ekonomi":"EKO","Sejarah":"SJ","Sosiologi":"SOS","Geografi":"GEO","Fisika":"F","Kimia":"K","Biologi":"BIO"};
  let catalogState={phase:"",query:"",favorites:false,sort:"subject"};
  let toastTimer=0;

  function rupiah(value){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(value)||0)}
  function date(value){if(!value)return "—";try{return new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(value))}catch(_){return "—"}}
  function toast(message){const element=$("#toast");element.textContent=message;element.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>element.classList.remove("show"),2800)}
  function symbol(subject){return subjectSymbols[subject]||subject.split(/\s+/).map(part=>part[0]).join("").slice(0,3).toUpperCase()}
  function appUrl(app){return app.href}

  function setView(name){
    $$("[data-view-panel]").forEach(panel=>panel.classList.toggle("active",panel.dataset.viewPanel===name));
    $$(".nav-button").forEach(button=>button.classList.toggle("active",button.dataset.view===name));
    $(".topnav").classList.remove("open");
    history.replaceState(null,"",`#${name}`);
    if(name==="orders")renderOrders();
    window.scrollTo({top:0,behavior:"smooth"});
  }

  function initializeRoutes(){
    $$('[data-view]').forEach(button=>button.addEventListener("click",()=>setView(button.dataset.view)));
    $$('[data-route]').forEach(button=>button.addEventListener("click",event=>{event.preventDefault();setView(button.dataset.route)}));
    $("#mobileMenu").addEventListener("click",()=>$(".topnav").classList.toggle("open"));
    const route=location.hash.replace("#","");if(["catalog","orders","help"].includes(route))setView(route);
  }

  function renderPhaseTabs(){
    const tabs=[`<button class="phase-tab ${catalogState.phase===""?"active":""}" data-phase="">Semua <span>69</span></button>`];
    for(const phase of phases){const count=catalog.filter(app=>app.phase===phase).length;tabs.push(`<button class="phase-tab ${catalogState.phase===phase?"active":""}" data-phase="${phase}">Fase ${phase} <span>${count}</span></button>`)}
    $("#phaseTabs").innerHTML=tabs.join("");
    $$('[data-phase]').forEach(button=>button.addEventListener("click",()=>{catalogState.phase=button.dataset.phase;renderCatalog()}));
  }

  function filteredApps(){
    const favorites=new Set(read(FAVORITES,[])),recents=read(RECENTS,{}),query=catalogState.query.trim().toLocaleLowerCase("id-ID");
    let result=catalog.filter(app=>(!catalogState.phase||app.phase===catalogState.phase)&&(!catalogState.favorites||favorites.has(app.id))&&(!query||`${app.subject} ${app.phaseLabel} ${app.phaseDescription} ${app.description}`.toLocaleLowerCase("id-ID").includes(query)));
    if(catalogState.sort==="phase")result.sort((a,b)=>a.phase.localeCompare(b.phase)||a.subject.localeCompare(b.subject,"id"));
    else if(catalogState.sort==="recent")result.sort((a,b)=>(recents[b.id]||0)-(recents[a.id]||0)||a.subject.localeCompare(b.subject,"id"));
    else result.sort((a,b)=>a.subject.localeCompare(b.subject,"id")||a.phase.localeCompare(b.phase));
    return result;
  }

  function appCard(app){
    const favorite=new Set(read(FAVORITES,[])).has(app.id),recent=read(RECENTS,{})[app.id];
    return `<article class="app-card" style="--theme:${esc(app.themeColor)}"><div class="app-card-accent"></div><div class="app-card-body"><div class="subject-icon">${esc(symbol(app.subject))}</div><div class="app-meta"><div class="app-kicker"><span class="phase-dot"></span>${esc(app.phaseLabel)} · KELAS ${esc(app.classes.join("–"))}${recent?" · TERAKHIR DIBUKA":""}</div><h3>${esc(app.subject)}</h3><p>${esc(app.description)}</p></div></div><div class="app-card-foot"><div class="class-tags">${app.classes.map(value=>`<span>${esc(value)}</span>`).join("")}</div><div class="card-actions"><button class="favorite-button ${favorite?"active":""}" data-favorite="${esc(app.id)}" aria-label="${favorite?"Hapus dari":"Tambahkan ke"} favorit">★</button><a class="open-app" href="${esc(appUrl(app))}" target="_blank" data-open-app="${esc(app.id)}">Buka E-Perangkat</a></div></div></article>`;
  }

  function renderCatalog(){
    renderPhaseTabs();const apps=filteredApps(),phase=catalogState.phase;
    $("#catalogEyebrow").textContent=phase?`FASE ${phase} · KELAS ${phaseNames[phase]}`:"SEMUA FASE";
    $("#catalogTitle").textContent=catalogState.favorites?"E-Perangkat Favorit":phase?`E-Perangkat Fase ${phase}`:"Pilih E-Perangkat";
    $("#catalogResult").textContent=`${apps.length} aplikasi tersedia`;
    $("#appGrid").innerHTML=apps.map(appCard).join("");$("#catalogEmpty").hidden=apps.length>0;
    $("#allAppsFilter").classList.toggle("active",!catalogState.favorites);$("#favoriteFilter").classList.toggle("active",catalogState.favorites);
    $$('[data-favorite]').forEach(button=>button.addEventListener("click",()=>toggleFavorite(button.dataset.favorite)));
    $$('[data-open-app]').forEach(link=>link.addEventListener("click",()=>recordOpen(link.dataset.openApp)));
  }

  function toggleFavorite(id){const favorites=new Set(read(FAVORITES,[]));favorites.has(id)?favorites.delete(id):favorites.add(id);write(FAVORITES,[...favorites]);renderCatalog()}
  function recordOpen(id){const recents=read(RECENTS,{});recents[id]=Date.now();write(RECENTS,recents)}

  function initializeCatalog(){
    renderCatalog();
    $("#catalogSearch").addEventListener("input",event=>{catalogState.query=event.target.value;renderCatalog()});
    $("#catalogSort").addEventListener("change",event=>{catalogState.sort=event.target.value;renderCatalog()});
    $("#allAppsFilter").addEventListener("click",()=>{catalogState.favorites=false;renderCatalog()});
    $("#favoriteFilter").addEventListener("click",()=>{catalogState.favorites=true;renderCatalog()});
    document.addEventListener("keydown",event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="k"){event.preventDefault();setView("catalog");$("#catalogSearch").focus()}});
  }

  function localOrders(){return sync.collect().map(record=>({...record,app:catalog.find(app=>app.id===record.appId)}));}
  function orderMatches(record){const query=$("#orderSearch").value.trim().toLocaleLowerCase("id-ID"),phase=$("#orderPhase").value,status=$("#orderStatus").value;return(!query||`${record.orderNumber} ${record.customer} ${record.school} ${record.subject} ${record.whatsapp}`.toLocaleLowerCase("id-ID").includes(query))&&(!phase||record.phase===phase)&&(!status||record.paymentStatus===status)}
  function paymentLabel(value){return value==="lunas"?"Lunas":value==="dp"?"DP / sebagian":"Belum lunas"}
  function paymentClass(value){return value==="lunas"?"paid":value==="dp"?"partial":"unpaid"}

  function renderOrders(){
    const all=localOrders(),records=all.filter(orderMatches).sort((a,b)=>Date.parse(b.updatedAt||0)-Date.parse(a.updatedAt||0));
    $("#statOrders").textContent=all.length;$("#orderNavCount").textContent=all.length;
    $("#statUnpaid").textContent=all.filter(order=>order.paymentStatus==="belum_lunas").length;
    $("#statPartial").textContent=all.filter(order=>order.paymentStatus==="dp").length;
    $("#statPaid").textContent=all.filter(order=>order.paymentStatus==="lunas").length;
    $("#statRevenue").textContent=rupiah(all.reduce((sum,order)=>sum+Number(order.total||0),0));
    $("#orderBody").innerHTML=records.map(record=>`<tr><td><div class="order-primary"><b>${esc(record.orderNumber||"Tanpa nomor")}</b><span>${esc(record.customer||record.whatsapp||"Pemesan belum diisi")}</span></div></td><td><div class="order-app"><b>${esc(record.subject)} · Fase ${esc(record.phase)}</b><span>Kelas ${esc(record.grade||record.app?.classes.join("–")||"")}</span></div></td><td><div class="order-primary"><b>${esc(record.school||"Sekolah belum diisi")}</b><span>${esc(record.whatsapp||"Nomor WA belum diisi")}</span></div></td><td><span class="status-badge ${paymentClass(record.paymentStatus)}">${paymentLabel(record.paymentStatus)}</span><div class="order-primary"><span>${rupiah(record.paid)} / ${rupiah(record.total)}</span></div></td><td>${esc(date(record.updatedAt))}</td><td><button class="row-action" data-open-order="${esc(record.appId)}::${esc(record.orderId)}">Buka Pesanan →</button></td></tr>`).join("");
    $("#orderEmpty").hidden=records.length>0;
    $$('[data-open-order]').forEach(button=>button.addEventListener("click",()=>openOrder(button.dataset.openOrder)));
    updateSyncUi(sync.getStatus());
  }

  function openOrder(value){
    const split=value.indexOf("::"),appId=value.slice(0,split),orderId=value.slice(split+2),app=catalog.find(item=>item.id===appId);if(!app)return;
    const store=sync.getStore(app);if(store.orders?.some(order=>order.id===orderId)){store.activeId=orderId;sync.setStore(app,store)}
    localStorage.setItem(app.storageKey.replace(/\.orders$/,".view"),"orders");recordOpen(app.id);window.open(appUrl(app),"_blank","noopener");
  }

  function renderNewOrderList(query=""){
    const text=query.trim().toLocaleLowerCase("id-ID"),apps=catalog.filter(app=>!text||`${app.subject} ${app.phaseLabel}`.toLocaleLowerCase("id-ID").includes(text));
    $("#newOrderAppList").innerHTML=apps.map(app=>`<button class="modal-app" type="button" data-new-order-app="${esc(app.id)}" style="--theme:${esc(app.themeColor)}"><i>${esc(symbol(app.subject))}</i><span><b>${esc(app.subject)}</b><small>Fase ${esc(app.phase)} · Kelas ${esc(app.classes.join("–"))}</small></span></button>`).join("");
    $$('[data-new-order-app]').forEach(button=>button.addEventListener("click",()=>{const app=catalog.find(item=>item.id===button.dataset.newOrderApp);localStorage.setItem(app.storageKey.replace(/\.orders$/,".view"),"orders");recordOpen(app.id);$("#newOrderDialog").close();window.open(appUrl(app),"_blank","noopener")}));
  }

  function initializeOrders(){
    for(const phase of phases)$("#orderPhase").insertAdjacentHTML("beforeend",`<option value="${phase}">Fase ${phase}</option>`);
    for(const id of ["orderSearch","orderPhase","orderStatus"])$("#"+id).addEventListener(id==="orderSearch"?"input":"change",renderOrders);
    $("#newOrder").addEventListener("click",()=>{renderNewOrderList();$("#newOrderSearch").value="";$("#newOrderDialog").showModal()});
    $("#newOrderSearch").addEventListener("input",event=>renderNewOrderList(event.target.value));
    $("#syncNow").addEventListener("click",runSync);
    $("#refreshData").addEventListener("click",runSync);
    $("#exportBackup").addEventListener("click",downloadBackup);
    $("#importBackup").addEventListener("change",importBackup);
  }

  async function runSync(){
    const button=$("#syncNow");button.disabled=true;button.textContent="Menyinkronkan…";updateSyncUi({...sync.getStatus(),syncing:true});
    try{const result=await sync.sync();toast(`${result.records?.length||0} pesanan tersinkron.`);renderOrders()}catch(error){toast(error.message||"Sinkronisasi gagal.")}finally{button.disabled=false;button.textContent="Sinkronkan Sekarang";updateSyncUi(sync.getStatus())}
  }

  function downloadBackup(){const data=sync.exportBackup(),blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download=`Backup_Portal_E-Perangkat_${new Date().toISOString().slice(0,10)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast("Backup berhasil dibuat.")}
  function importBackup(event){const file=event.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const count=sync.importBackup(JSON.parse(String(reader.result||"{}")));toast(`${count} pesanan berhasil dipulihkan.`);renderOrders()}catch(error){alert(error.message)}event.target.value=""};reader.readAsText(file,"UTF-8")}

  function updateSyncUi(status){
    const pill=$("#connectionPill");pill.classList.toggle("online",status.online);pill.classList.toggle("offline",!status.online);pill.querySelector("b").textContent=status.online?"Internet tersedia":"Mode offline";
    const banner=$("#syncBanner"),title=$("#syncTitle"),detail=$("#syncDetail");banner.className="sync-banner";
    if(status.syncing){banner.classList.add("pending");title.textContent="Sedang menyinkronkan";detail.textContent="Mengirim perubahan lokal dan membaca pembaruan database."}
    else if(status.lastError){banner.classList.add("error");title.textContent="Sinkronisasi tertunda";detail.textContent=status.lastError}
    else if(status.configured&&status.lastSync){banner.classList.add("success");title.textContent=status.dirty?"Ada perubahan yang belum dikirim":"Data sudah tersinkron";detail.textContent=`Sinkronisasi terakhir ${date(status.lastSync)}${status.dirty?" · tekan Sinkronkan Sekarang":""}.`}
    else{banner.classList.add("pending");title.textContent="Database otomatis siap";detail.textContent="Data akan disinkronkan saat internet tersedia."}
    $("#heroSyncState").textContent=status.dirty?"Menunggu":"Terhubung";
    $("#heroSyncCaption").textContent=status.lastSync?`Terakhir ${date(status.lastSync)}`:"Google Sheets terhubung aman";
  }

  initializeRoutes();initializeCatalog();initializeOrders();renderOrders();updateSyncUi(sync.getStatus());sync.onChange(status=>{updateSyncUi(status);renderOrders()});
  if(navigator.onLine)setTimeout(()=>runSync(),1800);
})();
