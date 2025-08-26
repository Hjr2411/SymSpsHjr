// Funções utilitárias

// Toast notifications
const toastEl = document.getElementById('toast');
function toast(msg, ms = 2200){
  if(!toastEl) return alert(msg);
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(()=>toastEl.classList.remove('show'), ms);
}

// Debounce
function debounce(fn,ms){ 
  let t; 
  return (...a)=>{ 
    clearTimeout(t); 
    t=setTimeout(()=>fn(...a),ms); 
  }; 
}

// Escape HTML
function esc(s){ 
  return (s??'').toString().replace(/[&<>\"]/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[m])); 
}

// Export para CSV
function exportCSV(rows, filename){
  const cols=['dataEncaminhamento','analista','chamado','linha','equipamento','cenario'];
  const csv = [cols.join(';')].concat(rows.map(r=>cols.map(c=>`"${(r[c]??'').toString().replaceAll('"','""')}"`).join(';'))).join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); 
  a.href=url; 
  a.download=filename; 
  a.click(); 
  URL.revokeObjectURL(url);
}
