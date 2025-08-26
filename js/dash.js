// Módulo para o dashboard

// Estado local para o dashboard
const dashState = {
  chamados: [],
  duplicates: []
};

// Inicialização do dashboard
async function initDashboard() {
  const session = getSession();
  if (!session) {
    window.location.href = 'index.html';
    return;
  }

  // Configurar event listeners
  setupDashboardEventListeners();
  
  // Carregar dados iniciais
  await loadChamados();
}

// Configurar event listeners
function setupDashboardEventListeners() {
  document.getElementById('btnLogout').addEventListener('click', logout);
}

// Carregar chamados
async function loadChamados() {
  try {
    const snap = await db.ref('app/chamados').once('value');
    const val = snap.val() || {};
    dashState.chamados = Object.entries(val).map(([id, r]) => ({ id, ...r }));
    
    // Construir gráficos públicos
    buildPublicCharts();
    
    // Analisar duplicatas
    analyzeDuplicates();
  } catch (error) {
    toast('Erro ao carregar chamados: ' + error.message);
  }
}

// Construir gráficos públicos
function buildPublicCharts() {
  const rows = dashState.chamados.filter(r => !r.deleted);
  const by = (key) => rows.reduce((acc, r) => {
    const k = r[key] || '-';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  
  const equip = by('equipamento');
  const cenario = by('cenario');
  const analista = by('analista');

  // Atualizar KPIs
  document.getElementById('kpiTotalPublic').textContent = `Total: ${rows.length}`;
  document.getElementById('kpiTopEquipPublic').textContent = `Top Equipamentos: ${getTopThree(equip)}`;
  document.getElementById('kpiTopCenarioPublic').textContent = `Top Cenários: ${getTopThree(cenario)}`;
  document.getElementById('kpiTopAnalistaPublic').textContent = `Top Analista: ${getTopThree(analista)}`;

  // Atualizar gráficos
  updateChart('chartEquipPublic', equip, 'bar');
  updateChart('chartCenarioPublic', cenario, 'doughnut');
  updateChart('chartAnalistaPublic', analista, 'bar');
}

// Obter os três principais
function getTopThree(obj) {
  const entries = Object.entries(obj);
  if (entries.length === 0) return '-';
  
  return entries
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([n, v]) => `${n} (${v})`)
    .join(', ');
}

// Atualizar gráfico
function updateChart(canvasId, data, type) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  
  const labels = Object.keys(data);
  const values = Object.values(data);
  
  new Chart(ctx, {
    type: type,
    data: {
      labels: labels,
      datasets: [{
        label: 'Qtd',
        data: values,
        backgroundColor: type === 'bar' ? '#3b82f6' : [
          '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: type === 'doughnut' ? 'bottom' : false
        }
      }
    }
  });
}

// Analisar duplicatas
function analyzeDuplicates() {
  const linhaMap = {};
  dashState.chamados.filter(r => !r.deleted).forEach(r => {
    if (!linhaMap[r.linha]) {
      linhaMap[r.linha] = [];
    }
    linhaMap[r.linha].push(r);
  });
  
  dashState.duplicates = [];
  Object.entries(linhaMap).forEach(([linha, records]) => {
    if (records.length > 1) {
      const cenarios = [...new Set(records.map(r => r.cenario))];
      const analistas = [...new Set(records.map(r => r.analista))];
      dashState.duplicates.push({
        linha,
        count: records.length,
        cenarios: cenarios.join(', '),
        analistas: analistas.join(', ')
      });
    }
  });
  
  dashState.duplicates.sort((a, b) => b.count - a.count);
  renderDuplicateAnalysis();
}

// Renderizar análise de duplicatas
function renderDuplicateAnalysis() {
  const tbody = document.querySelector('#duplicateTable tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  const frag = document.createDocumentFragment();
  
  dashState.duplicates.forEach(dup => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${esc(dup.linha)}</td>
      <td>${dup.count}</td>
      <td>${esc(dup.cenarios)}</td>
      <td>${esc(dup.analistas)}</td>
    `;
    frag.appendChild(tr);
  });
  
  tbody.appendChild(frag);
}

// Logout
function logout() {
  clearSession();
  window.location.href = 'index.html';
}
