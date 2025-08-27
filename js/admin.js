// Módulo para funcionalidades de administração

// Estado local para a página de admin
const adminState = {
  usersCache: [],
  cenariosCache: [],
  callsCache: [],
  currentUserEditId: null,
  currentCenarioEditId: null,
  charts: {
    equip: null,
    cenario: null,
    analista: null
  }
};

// Inicialização da página de administração
async function initAdminPage(session) {
  // Atualizar badge do usuário
  document.getElementById('userBadge').textContent = `${session.nome}${session.admin ? ' (admin)' : ''}`;
  
  // Carregar listas
  await loadLists();
  
  // Configurar event listeners
  setupAdminEventListeners();
  
  // Carregar dados iniciais
  await loadUsers();
  await loadCenarios();
  await loadCalls();
}

// Carregar listas do Firebase
async function loadLists() {
  const lists = await ensureLists();
  fillSelect('fEquip', ['(Todos)', ...lists.equipamentos]);
  fillSelect('fCenario', ['(Todos)', ...lists.cenarios]);
}

// Configurar event listeners
function setupAdminEventListeners() {
  // Logout
  document.getElementById('btnLogout').addEventListener('click', logout);
  
  // Tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      // Remover classe active de todas as tabs
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      // Adicionar classe active à tab clicada
      tab.classList.add('active');
      
      // Esconder todos os painéis
      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.hidden = true;
      });
      
      // Mostrar o painel correspondente
      const panelId = tab.dataset.tab;
      document.getElementById(panelId).hidden = false;
    });
  });
  
  // Usuários
  document.getElementById('btnUserCreate').addEventListener('click', createUser);
  document.getElementById('btnUserUpdate').addEventListener('click', updateUser);
  document.getElementById('btnUserClear').addEventListener('click', clearUserForm);
  document.getElementById('admUserSearch').addEventListener('input', debounce(renderUsersTable, 300));
  
  // Cenários
  document.getElementById('btnCenarioCreate').addEventListener('click', createCenario);
  document.getElementById('btnCenarioUpdate').addEventListener('click', updateCenario);
  document.getElementById('btnCenarioClear').addEventListener('click', clearCenarioForm);
  document.getElementById('admCenarioSearch').addEventListener('input', debounce(renderCenariosTable, 300));
  
  // Chamados
  document.getElementById('btnAplicarFiltros').addEventListener('click', applyFilters);
  document.getElementById('btnCSV').addEventListener('click', exportCallsCSV);
}

// ======================= ADMIN: USUÁRIOS =======================
async function loadUsers() {
  if (!requireAdmin()) return;
  
  try {
    const snap = await db.ref('app/users').once('value');
    const val = snap.val() || {};
    adminState.usersCache = Object.entries(val).map(([id, u]) => ({ id, ...u }));
    renderUsersTable();
  } catch (error) {
    toast('Erro ao carregar usuários: ' + error.message);
  }
}

async function createUser() {
  if (!requireAdmin()) return;
  
  const nome = (document.getElementById('aUNome').value || '').trim();
  const senha = document.getElementById('aUSenha').value || '';
  
  if (!nome || !senha) return toast('Nome e senha obrigatórios');
  
  const key = nome.toLowerCase();
  if (adminState.usersCache.some(u => u.id === key)) return toast('Nome já existe');
  
  const u = { 
    nome, 
    password: senha, 
    admin: !!document.getElementById('aUAdmin').checked, 
    ativo: !!document.getElementById('aUAtivo').checked 
  };
  
  try {
    await db.ref('app/users/' + key).set(u);
    toast('Usuário criado');
    clearUserForm();
    await loadUsers();
  } catch (error) {
    toast('Erro ao criar usuário: ' + error.message);
  }
}

async function updateUser() {
  if (!requireAdmin()) return;
  if (!adminState.currentUserEditId) return;
  
  const nome = (document.getElementById('aUNome').value || '').trim();
  const s = getSession();
  
  if (s && s.id === adminState.currentUserEditId && !document.getElementById('aUAtivo').checked) {
    return toast('Não é possível desativar a si mesmo');
  }
  
  const patch = { 
    nome, 
    admin: !!document.getElementById('aUAdmin').checked, 
    ativo: !!document.getElementById('aUAtivo').checked 
  };
  
  if (document.getElementById('aUSenha').value) {
    patch.password = document.getElementById('aUSenha').value;
  }
  
  try {
    await db.ref('app/users/' + adminState.currentUserEditId).update(patch);
    toast('Usuário atualizado');
    await loadUsers();
  } catch (error) {
    toast('Erro ao atualizar usuário: ' + error.message);
  }
}

function clearUserForm() {
  adminState.currentUserEditId = null;
  document.getElementById('aUNome').value = '';
  document.getElementById('aUSenha').value = '';
  document.getElementById('aUAdmin').checked = false;
  document.getElementById('aUAtivo').checked = true;
  document.getElementById('btnUserUpdate').disabled = true;
}

function renderUsersTable() {
  const q = (document.getElementById('admUserSearch').value || '').toLowerCase();
  const rows = adminState.usersCache.filter(u => !q || u.nome.toLowerCase().includes(q));
  
  const tbody = document.querySelector('#admUsersTable tbody');
  tbody.innerHTML = '';
  
  const frag = document.createDocumentFragment();
  rows.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${esc(u.nome)}</td>
      <td>${u.admin ? '✔' : ''}</td>
      <td>${u.ativo ? '✔' : '✖'}</td>
      <td class="muted">${u.id}</td>
    `;
    
    const td = document.createElement('td');
    const b1 = document.createElement('button');
    b1.className = 'btn';
    b1.textContent = 'Editar';
    
    const b2 = document.createElement('button');
    b2.className = 'btn ghost';
    b2.textContent = 'Excluir';
    
    b1.onclick = () => {
      adminState.currentUserEditId = u.id;
      document.getElementById('aUNome').value = u.nome;
      document.getElementById('aUSenha').value = '';
      document.getElementById('aUAdmin').checked = !!u.admin;
      document.getElementById('aUAtivo').checked = !!u.ativo;
      document.getElementById('btnUserUpdate').disabled = false;
    };
    
    b2.onclick = async () => {
      const s = getSession();
      if (s && s.id === u.id) return toast('Não é possível excluir a si mesmo');
      
      try {
        await db.ref('app/users/' + u.id).remove();
        toast('Usuário excluído');
        await loadUsers();
      } catch (error) {
        toast('Erro ao excluir usuário: ' + error.message);
      }
    };
    
    td.appendChild(b1);
    td.appendChild(b2);
    tr.appendChild(td);
    frag.appendChild(tr);
  });
  
  tbody.appendChild(frag);
}

// ======================= ADMIN: CENÁRIOS =======================
async function loadCenarios() {
  if (!requireAdmin()) return;
  
  try {
    const snap = await db.ref('app/listas/cenarios').once('value');
    const val = snap.val() || [];
    adminState.cenariosCache = val.map((nome, index) => ({ id: index, nome }));
    renderCenariosTable();
  } catch (error) {
    toast('Erro ao carregar cenários: ' + error.message);
  }
}

async function createCenario() {
  if (!requireAdmin()) return;
  
  const nome = (document.getElementById('aCenarioNome').value || '').trim();
  if (!nome) return toast('Nome do cenário obrigatório');
  
  try {
    const snap = await db.ref('app/listas/cenarios').once('value');
    const cenarios = snap.val() || [];
    
    if (cenarios.includes(nome)) return toast('Cenário já existe');
    
    cenarios.push(nome);
    await db.ref('app/listas/cenarios').set(cenarios);
    toast('Cenário criado');
    document.getElementById('aCenarioNome').value = '';
    await loadCenarios();
    await loadLists();
  } catch (error) {
    toast('Erro ao criar cenário: ' + error.message);
  }
}

async function updateCenario() {
  if (!requireAdmin()) return;
  if (adminState.currentCenarioEditId === null) return;
  
  const nome = (document.getElementById('aCenarioNome').value || '').trim();
  if (!nome) return toast('Nome do cenário obrigatório');
  
  try {
    const snap = await db.ref('app/listas/cenarios').once('value');
    const cenarios = snap.val() || [];
    
    if (cenarios.includes(nome) && cenarios[adminState.currentCenarioEditId] !== nome) {
      return toast('Cenário já existe');
    }
    
    cenarios[adminState.currentCenarioEditId] = nome;
    await db.ref('app/listas/cenarios').set(cenarios);
    toast('Cenário atualizado');
    adminState.currentCenarioEditId = null;
    document.getElementById('aCenarioNome').value = '';
    document.getElementById('btnCenarioUpdate').disabled = true;
    await loadCenarios();
    await loadLists();
  } catch (error) {
    toast('Erro ao atualizar cenário: ' + error.message);
  }
}

async function deleteCenario(index) {
  if (!requireAdmin()) return;
  
  try {
    const snap = await db.ref('app/listas/cenarios').once('value');
    const cenarios = snap.val() || [];
    
    cenarios.splice(index, 1);
    await db.ref('app/listas/cenarios').set(cenarios);
    toast('Cenário excluído');
    await loadCenarios();
    await loadLists();
  } catch (error) {
    toast('Erro ao excluir cenário: ' + error.message);
  }
}

function clearCenarioForm() {
  adminState.currentCenarioEditId = null;
  document.getElementById('aCenarioNome').value = '';
  document.getElementById('btnCenarioUpdate').disabled = true;
}

function renderCenariosTable() {
  const q = (document.getElementById('admCenarioSearch').value || '').toLowerCase();
  const rows = adminState.cenariosCache.filter(c => !q || c.nome.toLowerCase().includes(q));
  
  const tbody = document.querySelector('#admCenariosTable tbody');
  tbody.innerHTML = '';
  
  const frag = document.createDocumentFragment();
  rows.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${esc(c.nome)}</td>`;
    
    const td = document.createElement('td');
    const b1 = document.createElement('button');
    b1.className = 'btn';
    b1.textContent = 'Editar';
    
    const b2 = document.createElement('button');
    b2.className = 'btn ghost';
    b2.textContent = 'Excluir';
    
    b1.onclick = () => {
      adminState.currentCenarioEditId = c.id;
      document.getElementById('aCenarioNome').value = c.nome;
      document.getElementById('btnCenarioUpdate').disabled = false;
    };
    
    b2.onclick = () => deleteCenario(c.id);
    
    td.appendChild(b1);
    td.appendChild(b2);
    tr.appendChild(td);
    frag.appendChild(tr);
  });
  
  tbody.appendChild(frag);
}

// ======================= ADMIN: CHAMADOS =======================
async function loadCalls() {
  try {
    const snap = await db.ref('app/chamados').once('value');
    const val = snap.val() || {};
    adminState.callsCache = Object.entries(val).map(([id, r]) => ({ id, ...r }));
    applyFilters();
  } catch (error) {
    toast('Erro ao carregar chamados: ' + error.message);
  }
}

function applyFilters() {
  renderCallsTable();
  buildCharts(callsFiltered());
}

function callsFiltered() {
  let rows = [...adminState.callsCache];
  
  if (!document.getElementById('fIncluirExcluidos').checked) {
    rows = rows.filter(r => !r.deleted);
  }
  
  const equipValue = document.getElementById('fEquip').value;
  if (equipValue && equipValue !== '(Todos)') {
    rows = rows.filter(r => r.equipamento === equipValue);
  }
  
  const cenarioValue = document.getElementById('fCenario').value;
  if (cenarioValue && cenarioValue !== '(Todos)') {
    rows = rows.filter(r => r.cenario === cenarioValue);
  }
  
  const analistaValue = (document.getElementById('fAnalista').value || '').trim().toLowerCase();
  if (analistaValue) {
    rows = rows.filter(r => (r.analista || '').toLowerCase().includes(analistaValue));
  }
  
  const inicioValue = document.getElementById('fInicio').value;
  if (inicioValue) {
    rows = rows.filter(r => (r.dataEncaminhamento || '') >= inicioValue);
  }
  
  const fimValue = document.getElementById('fFim').value;
  if (fimValue) {
    rows = rows.filter(r => (r.dataEncaminhamento || '') <= fimValue);
  }
  
  return rows.sort((a, b) => (a.dataEncaminhamento || '').localeCompare(b.dataEncaminhamento || ''));
}

function renderCallsTable() {
  const rows = callsFiltered();
  const tbody = document.querySelector('#admCallsTable tbody');
  tbody.innerHTML = '';
  
  const frag = document.createDocumentFragment();
  rows.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.dataEncaminhamento || ''}</td>
      <td>${esc(r.analista)}</td>
      <td>${esc(r.chamado)}</td>
      <td>${esc(r.linha)}</td>
      <td>${esc(r.equipamento)}</td>
      <td>${esc(r.cenario)}</td>
    `;
    
    const td = document.createElement('td');
    const b1 = document.createElement('button');
    b1.className = 'btn';
    b1.textContent = r.deleted ? 'Restaurar' : 'Excluir';
    
    b1.onclick = () => softDeleteChamado(r.id, !r.deleted);
    
    td.appendChild(b1);
    tr.appendChild(td);
    frag.appendChild(tr);
  });
  
  tbody.appendChild(frag);
}

async function softDeleteChamado(id, del) {
  if (!requireAdmin()) return;
  
  try {
    await db.ref('app/chamados/' + id).update({ deleted: !!del });
    toast(del ? 'Chamado excluído' : 'Chamado restaurado');
    await loadCalls();
  } catch (error) {
    toast('Erro ao modificar chamado: ' + error.message);
  }
}

function exportCallsCSV() {
  const rows = callsFiltered();
  exportCSV(rows, 'chamados.csv');
}

// ======================= DASHBOARD ADMIN =======================
function buildCharts(rows) {
  const by = (key) => rows.reduce((acc, r) => {
    const k = r[key] || '-';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  
  const equip = by('equipamento');
  const cenario = by('cenario');
  const analista = by('analista');

  const k = Object.entries;
  const top = (obj) => k(obj).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n, v]) => `${n} (${v})`).join(', ') || '-';
  
  document.getElementById('kpiTotal').textContent = `Total: ${rows.length}`;
  document.getElementById('kpiTopEquip').textContent = `Top Equipamentos: ${top(equip)}`;
  document.getElementById('kpiTopCenario').textContent = `Top Cenários: ${top(cenario)}`;
  document.getElementById('kpiTopAnalista').textContent = `Top Analista: ${top(analista)}`;

  adminState.charts.equip = upsertBarChart(adminState.charts.equip, 'chartEquip', equip);
  adminState.charts.cenario = upsertPieChart(adminState.charts.cenario, 'chartCenario', cenario);
  adminState.charts.analista = upsertBarChart(adminState.charts.analista, 'chartAnalista', analista);
}

function upsertBarChart(inst, canvasId, obj) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  
  const labels = Object.keys(obj);
  const data = Object.values(obj);
  
  if (inst) {
    inst.data.labels = labels;
    inst.data.datasets[0].data = data;
    inst.update();
    return inst;
  }
  
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Qtd',
        data,
        backgroundColor: '#3b82f6'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function upsertPieChart(inst, canvasId, obj) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  
  const labels = Object.keys(obj);
  const data = Object.values(obj);
  
  if (inst) {
    inst.data.labels = labels;
    inst.data.datasets[0].data = data;
    inst.update();
    return inst;
  }
  
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}
