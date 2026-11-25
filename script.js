(() => {
  "use strict";
  const STORE = "plantdoc-plants-v2";
  const legacyKey = "plantdoc-plants";
  let plants = loadPlants();
  let toastTimer;
  const $ = id => document.getElementById(id);
  const safeText = value => String(value ?? "").trim();
  function loadPlants() {
    try {
      const current = JSON.parse(localStorage.getItem(STORE) || "null");
      if (Array.isArray(current)) return current;
      const legacy = JSON.parse(localStorage.getItem(legacyKey) || "[]");
      return Array.isArray(legacy) ? legacy.map((p,i) => typeof p === "string" ? ({id:cryptoId(),name:p,type:"",interval:5,nextCheck:today(),createdAt:new Date().toISOString()}) : p) : [];
    } catch { return []; }
  }
  function cryptoId(){ return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : "p-"+Date.now()+"-"+Math.random().toString(36).slice(2,8); }
  function today(){ const d=new Date(); d.setHours(0,0,0,0); return d.toISOString().slice(0,10); }
  function datePlus(days){ const d=new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10); }
  function save(){ localStorage.setItem(STORE,JSON.stringify(plants)); localStorage.setItem(legacyKey,JSON.stringify(plants.map(p=>p.name))); }
  function due(p){ return !p.nextCheck || p.nextCheck <= today(); }
  function showToast(msg){ const el=$("toast");el.textContent=msg;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2600); }
  function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function render(){
    $("plant-count").textContent=plants.length;
    $("due-count").textContent=plants.filter(due).length;
    const q=$("plant-search").value.toLowerCase();
    const filter=$("plant-filter").value;
    const list=plants.filter(p=>(p.name+" "+(p.type||"")).toLowerCase().includes(q)).filter(p=>filter!=="due"||due(p));
    const host=$("plant-list");
    if(!list.length){host.innerHTML=plants.length?'<div class="empty-state"><span>🔎</span><h3>No plants found</h3><p>Try a different search or filter.</p></div>':'<div class="empty-state"><span>🪴</span><h3>Your garden starts here</h3><p>Add a plant to start tracking its care.</p><button class="btn btn-primary" id="empty-add">Add your first plant</button></div>';const b=$("empty-add");if(b)b.onclick=openModal;return;}
    host.innerHTML=list.map(p=>`<article class="plant-card"><div class="plant-card-top"><span class="plant-emoji">🪴</span><span class="care-due">${due(p)?"● Check due":"✓ On track"}</span></div><h3>${escapeHTML(p.name)}</h3><p class="plant-type">${escapeHTML(p.type||"Plant in your collection")}</p><div class="care-meta"><span>Soil check</span><strong>${due(p)?"Due now":`Next: ${new Date(p.nextCheck+"T00:00:00").toLocaleDateString()}`}</strong></div><div class="card-actions"><button class="small-action" data-action="checked" data-id="${p.id}">✓ I checked soil</button><button class="small-action danger" data-action="remove" data-id="${p.id}">Remove</button></div></article>`).join("");
  }
  function openModal(){ $("plant-modal").classList.remove("hidden");$("new-plant-name").focus(); }
  function closeModal(){ $("plant-modal").classList.add("hidden"); }
  $("open-add").addEventListener("click",openModal);$("empty-add")?.addEventListener("click",openModal);
  $("close-modal").addEventListener("click",closeModal);
  $("plant-modal").addEventListener("click",e=>{if(e.target===$("plant-modal"))closeModal();});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});
  $("plant-form").addEventListener("submit",e=>{
    e.preventDefault();const name=safeText($("new-plant-name").value);if(!name)return;
    const interval=Number($("water-interval").value)||5;
    plants.unshift({id:cryptoId(),name,type:safeText($("new-plant-type").value),interval,nextCheck:today(),createdAt:new Date().toISOString()});
    save();render();e.target.reset();closeModal();showToast(name+" added to your garden.");
  });
  $("plant-list").addEventListener("click",e=>{
    const b=e.target.closest("button[data-action]");if(!b)return;
    const i=plants.findIndex(p=>p.id===b.dataset.id);if(i<0)return;
    if(b.dataset.action==="remove"){const name=plants[i].name;if(!confirm(`Remove ${name} from your collection?`))return;plants.splice(i,1);showToast(name+" removed.");}
    else {plants[i].nextCheck=datePlus(Number(plants[i].interval)||5);showToast("Soil check logged. Check again in "+plants[i].interval+" days.");}
    save();render();
  });
  $("plant-search").addEventListener("input",render);$("plant-filter").addEventListener("change",render);
  $("export-data").addEventListener("click",()=>{const blob=new Blob([JSON.stringify({app:"PlantDOC",version:2,exportedAt:new Date().toISOString(),plants},null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="plantdoc-backup.json";a.click();URL.revokeObjectURL(a.href);showToast("Your backup has been downloaded.");});
  $("import-data").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;try{const obj=JSON.parse(await f.text());const arr=Array.isArray(obj)?obj:obj.plants;if(!Array.isArray(arr)||!arr.every(p=>p&&typeof p.name==="string"))throw Error();if(!confirm(`Import ${arr.length} plants? This replaces the current collection.`))return;plants=arr.map(p=>({...p,id:p.id||cryptoId(),interval:Number(p.interval)||5,nextCheck:p.nextCheck||today()}));save();render();showToast("Backup imported.");}catch{showToast("That backup file could not be read.");}e.target.value="";});
  const advice={
    yellow:{title:"Yellow leaves",causes:"Possible causes include overwatering, underwatering, low light, nutrient imbalance or natural ageing of older leaves.",steps:["Feel the soil a few centimetres below the surface before watering.","Check that the pot has drainage holes and is not sitting in water.","Look for whether yellowing affects older leaves or new growth.","Review recent changes in light, temperature and feeding."]},
    brown:{title:"Brown or crispy edges",causes:"Dry air, inconsistent watering, strong direct sun, salt buildup or fertiliser burn can produce brown edges.",steps:["Check soil moisture and water thoroughly only when appropriate for the plant.","Move the plant away from harsh afternoon sun if leaves are scorched.","Check for white mineral crust on the soil or pot rim.","Avoid adding extra fertiliser until the cause is clearer."]},
    spots:{title:"Spots or patches",causes:"Spots can be linked to fungal or bacterial disease, pests, sun scorch or physical damage. A photo alone may not distinguish them reliably.",steps:["Inspect both sides of leaves and check whether spots are spreading.","Keep affected foliage dry and avoid splashing water between plants.","Remove badly damaged leaves with clean tools if appropriate.","Isolate the plant if a contagious disease or pest is suspected."]},
    drooping:{title:"Drooping or wilting",causes:"Both dry soil and waterlogged roots can cause wilting. Heat, root damage and recent repotting can also contribute.",steps:["Check soil moisture before watering; do not assume a wilted plant is thirsty.","If soil is saturated, allow excess water to drain and check root health.","Move the plant out of intense heat while it recovers.","Consider recent repotting or temperature changes."]},
    white:{title:"White powder or residue",causes:"White marks may be powdery mildew, mineral deposits from water, mealybugs or other pests.",steps:["Gently inspect whether the material is powdery, crusty or cotton-like.","Check leaf joints and undersides for insects or sticky residue.","Improve airflow and avoid wetting foliage late in the day.","Confirm the cause before choosing any treatment."]},
    pests:{title:"Visible insects or webbing",causes:"Sap-feeding insects, mites, caterpillars and beneficial insects require different responses.",steps:["Inspect leaf undersides, stems, new growth and soil surface.","Look for webbing, sticky honeydew, shed skins or clusters of eggs.","Separate the affected plant from others while identifying the pest.","Use a treatment only after confirming the pest and checking label directions."]},
    curling:{title:"Curling or distorted leaves",causes:"Leaf curl can result from water stress, heat, pests, herbicide exposure or environmental changes.",steps:["Check soil moisture and recent temperature or light changes.","Inspect new growth closely for aphids, mites or other pests.","Consider whether the plant was recently moved or exposed to chemicals.","Compare several leaves; isolated older-leaf changes may have a different cause."]}
  };
  $("diagnose").addEventListener("click",()=>{
    const key=$("symptom").value;const out=$("diagnosis-result");if(!key){out.innerHTML='<div class="result-box">Select a symptom to get guidance.</div>';return;}
    const a=advice[key],plant=safeText($("plant-type").value);
    out.innerHTML=`<div class="result-box"><h4>${a.title}${plant?" · "+escapeHTML(plant):""}</h4><p><strong>What it may mean:</strong> ${a.causes}</p><p><strong>What to check next:</strong></p><ul>${a.steps.map(s=>`<li>${s}</li>`).join("")}</ul><p><strong>Next step:</strong> Observe changes over the next few days. If the plant is rapidly declining or the issue spreads, consult a local horticulture expert or extension service.</p></div>`;
  });
  document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===t));$("symptom-panel").classList.toggle("hidden",t.dataset.tab!=="symptom");$("photo-panel").classList.toggle("hidden",t.dataset.tab!=="photo");}));
  let photoUrl=null;
  $("plant-photo").addEventListener("change",e=>{
    const f=e.target.files[0];if(!f)return;
    if(!f.type.startsWith("image/")){showToast("Please choose an image file.");return;}
    if(f.size>10*1024*1024){showToast("Choose an image smaller than 10 MB.");e.target.value="";return;}
    if(photoUrl)URL.revokeObjectURL(photoUrl);photoUrl=URL.createObjectURL(f);
    $("photo-preview").src=photoUrl;$("photo-preview").classList.remove("hidden");$("photo-guide").classList.remove("hidden");$("photo-status").textContent=`${f.name} · ${(f.size/1024/1024).toFixed(1)} MB selected`;
  });
  $("use-photo-symptom").addEventListener("click",()=>{document.querySelector('[data-tab="symptom"]').click();$("symptom").focus();});
  $("premium-interest").addEventListener("click",()=>{$("premium-message").textContent="Thanks for your interest. Premium is not accepting payments or sign-ups yet.";showToast("Interest recorded for this session.");});
  $("menu-toggle").addEventListener("click",()=>{const n=$("main-nav"),open=n.classList.toggle("open");$("menu-toggle").setAttribute("aria-expanded",String(open));});
  $("main-nav").querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{$("main-nav").classList.remove("open");$("menu-toggle").setAttribute("aria-expanded","false");}));
  $("year").textContent=new Date().getFullYear();
  render();
})();