// dash.js — dashboard público
let callsCache = [];

async function loadCalls(){
  const snap = await db.ref("app/chamados").once("value");
  callsCache = Object.values(snap.val()||{}).filter(r=>!r.deleted);
  buildCharts(); analyzeDuplicates();
}
function buildCharts(){
  const by = k => callsCache.reduce((a,r)=>{a[r[k]]= (a[r[k]]||0)+1; return a;}, {});
  upsertBar("chartEquipPublic", by("equipamento"));
  upsertPie("chartCenarioPublic", by("cenario"));
  upsertBar("chartAnalistaPublic", by("analista"));
}
function upsertBar(id,obj){
  new Chart(document.getElementById(id),{type:"bar",data:{labels:Object.keys(obj),datasets:[{data:Object.values(obj)}]}});
}
function upsertPie(id,obj){
  new Chart(document.getElementById(id),{type:"doughnut",data:{labels:Object.keys(obj),datasets:[{data:Object.values(obj)}]}});
}

function analyzeDuplicates(){
  const map={};
  callsCache.forEach(r=>{ map[r.linha]=map[r.linha]||[]; map[r.linha].push(r); });
  const dups=Object.entries(map).filter(([l,v])=>v.length>1);
  const tbody=document.getElementById("duplicateTable"); tbody.innerHTML="";
  dups.forEach(([linha,rows])=>{
    const tr=document.createElement("tr");
    const cen=[...new Set(rows.map(r=>r.cenario))].join(", ");
    const an=[...new Set(rows.map(r=>r.analista))].join(", ");
    tr.innerHTML=`<td>${linha}</td><td>${rows.length}</td><td>${cen}</td><td>${an}</td>`;
    tbody.appendChild(tr);
  });
}
loadCalls();
