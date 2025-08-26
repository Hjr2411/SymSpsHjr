// Módulo para funcionalidades de administração

// Estado local para a página de admin
const adminState = {
  users: [],
  cenarios: [],
  chamados: [],
  currentUserEditId: null,
  currentCenarioEditId: null,
  lists: { equipamentos: [], cenarios: [] }
};

// Inicialização da página de admin
async function initAdminPage() {
  const session = getSession();
  if (!session || !session.admin) {
    window.location.href = 'index.html';
    return;
  }

  // Carregar listas de equipamentos e cenários
  await ensureLists();
  
  // Configurar event listeners
  setupAdminEventListeners();
  
  // Carregar dados iniciais
  await loadUsers();
  await loadCenarios();
  await loadChamados();
}

// Carregar listas do Firebase
async function ensureLists() {
  const snap = await db.ref('app/listas').once('value');
  const lists = snap.val() || { equipamentos: [], cenarios: [] };
  adminState.lists = lists;
  
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
      const tabName = tab.dataset.tab;
      switchTab(tabName);
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
  document.getElementById('btnCSV').addEventListener('click', exportChamadosCSV);
}

// Alternar abas
function switchTab(tabName) {
  // Desativar todas as abas
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(panel => panel.hidden = true);
  
  // Ativar a aba selecionada
  document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(tabName).hidden = false;
  
  // Se for a aba de dashboard, construir gráficos
  if (tabName === 'tabDash') {
    buildCharts(adminState.chamados.filter(r => !r.deleted));
  }
}

// ... (restante das funções de admin - users, cenários, chamados, etc.)

// Logout
function logout() {
  clearSession();
  window.location.href = 'index.html';
}
