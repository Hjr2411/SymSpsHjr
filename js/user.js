// Módulo para funcionalidades do usuário

// Estado local para a página do usuário
const userState = {
  rows: [],
  page: 1,
  lists: { equipamentos: [], cenarios: [] }
};

// Inicialização da página do usuário
async function initUserPage() {
  const session = getSession();
  if (!session) return;
  
  // Preencher o nome do analista
  document.getElementById('uAnalista').value = session.nome;
  
  // Carregar listas de equipamentos e cenários
  await ensureLists();
  
  // Configurar event listeners
  setupUserEventListeners();
  
  // Carregar tabela de chamados do usuário
  await refreshUserTable();
}

// Carregar listas do Firebase
async function ensureLists() {
  const snap = await db.ref('app/listas').once('value');
  const lists = snap.val() || { equipamentos: [], cenarios: [] };
  userState.lists = lists;
  
  fillSelect('uEquipamento', lists.equipamentos);
  fillSelect('uCenario', lists.cenarios);
}

// Preencher select com opções
function fillSelect(id, arr) {
  const sel = document.getElementById(id);
  if (!sel) return;
  sel.innerHTML = '';
  (arr || []).forEach(v => {
    const o = document.createElement('option');
    o.value = v;
    o.textContent = v;
    sel.appendChild(o);
  });
}

// Configurar event listeners
function setupUserEventListeners() {
  document.getElementById('btnUserSalvar').addEventListener('click', saveChamadoFromUser);
  document.getElementById('btnUserNovo').addEventListener('click', () => clearUserForm(true));
  document.getElementById('btnUserLimpar').addEventListener('click', () => clearUserForm());
  document.getElementById('btnLogout').addEventListener('click', logout);
  document.getElementById('btnUserCSV').addEventListener('click', exportUserCSV);
  
  // Paginação e busca
  document.getElementById('userSearch').addEventListener('input', debounce(() => renderUserTable(), 300));
  document.getElementById('userPageSize').addEventListener('change', () => {
    userState.page = 1;
    renderUserTable();
  });
  document.getElementById('userPrev').addEventListener('click', () => {
    if (userState.page > 1) {
      userState.page--;
      renderUserTable();
    }
  });
  document.getElementById('userNext').addEventListener('click', () => {
    const ps = +document.getElementById('userPageSize').value;
    if (userState.page * ps < filteredUserRows().length) {
      userState.page++;
      renderUserTable();
    }
  });
}

// Limpar formulário do usuário
function clearUserForm(resetFocus) {
  document.getElementById('uChamado').value = '';
  document.getElementById('uLinha').value = '';
  
  const equipSelect = document.getElementById('uEquipamento');
  if (equipSelect.options.length > 0) equipSelect.selectedIndex = 0;
  
  const cenarioSelect = document.getElementById('uCenario');
  if (cenarioSelect.options.length > 0) cenarioSelect.selectedIndex = 0;
  
  document.getElementById('uData').value = '';
  document.getElementById('uDetalhes').value = '';
  
  if (resetFocus) document.getElementById('uChamado').focus();
}

// Salvar chamado
async function saveChamadoFromUser() {
  const s = getSession();
  if (!s) return toast('Sessão expirada');
  
  const analista = s.nome;
  const chamado = (document.getElementById('uChamado').value || '').trim();
  const linha = (document.getElementById('uLinha').value || '').trim();
  const equipamento = document.getElementById('uEquipamento').value;
  const cenario = document.getElementById('uCenario').value;
  const dataEncaminhamento = document.getElementById('uData').value;
  const detalhes = (document.getElementById('uDetalhes').value || '').trim();
  
  if (!chamado || !linha || !equipamento || !cenario || !dataEncaminhamento) {
    return toast('Preencha todos os campos obrigatórios');
  }

  // Verificar duplicatas (implementar checkDuplicates se necessário)
  // const duplicates = checkDuplicates(linha);
  // let isDuplicate = duplicates.length > 0;

  const now = Date.now();
  const data = {
    analista,
    chamado,
    linha,
    equipamento: (equipamento || '').toUpperCase(),
    cenario,
    dataEncaminhamento,
    detalhes,
    createdAt: now,
    updatedAt: now,
    createdBy: s.id,
    deleted: false,
    isDuplicate: false // Temporariamente false, implementar verificação
  };
  
  try {
    await db.ref('app/chamados').push(data);
    toast('Chamado salvo');
    clearUserForm(true);
    await refreshUserTable();
  } catch (error) {
    toast('Erro ao salvar chamado: ' + error.message);
  }
}

// Atualizar tabela de chamados do usuário
async function refreshUserTable() {
  const s = getSession();
  if (!s) return;
  
  try {
    const snap = await db.ref('app/chamados').orderByChild('analista').equalTo(s.nome).once('value');
    const val = snap.val() || {};
    userState.rows = Object.entries(val)
      .filter(([, r]) => !r.deleted)
      .map(([id, r]) => ({ id, ...r }))
      .sort((a, b) => (a.dataEncaminhamento || '').localeCompare(b.dataEncaminhamento || ''));
    
    userState.page = 1;
    renderUserTable();
  } catch (error) {
    toast('Erro ao carregar chamados: ' + error.message);
  }
}

// Filtrar linhas para tabela
function filteredUserRows() {
  const q = (document.getElementById('userSearch').value || '').toLowerCase();
  if (!q) return userState.rows;
  
  return userState.rows.filter(r => 
    Object.values({
      data: r.dataEncaminhamento, 
      chamado: r.chamado, 
      linha: r.linha, 
      equip: r.equipamento, 
      cenario: r.cenario,
      detalhes: r.detalhes || ''
    }).join(' ').toLowerCase().includes(q)
  );
}

// Renderizar tabela de usuário
function renderUserTable() {
  const rows = filteredUserRows();
  const ps = +document.getElementById('userPageSize').value;
  const start = (userState.page - 1) * ps;
  const pageRows = rows.slice(start, start + ps);
  
  const tbody = document.querySelector('#userTable tbody');
  tbody.innerHTML = '';
  
  const frag = document.createDocumentFragment();
  pageRows.forEach(r => {
    const tr = document.createElement('tr');
    // Destacar duplicatas (implementar lógica de duplicatas)
    // if (r.isDuplicate) {
    //   tr.style.backgroundColor = '#ef444422';
    //   tr.style.borderLeft = '3px solid #ef4444';
    // }
    
    tr.innerHTML = `
      <td>${r.dataEncaminhamento || ''}</td>
      <td>${esc(r.chamado)}</td>
      <td>${esc(r.linha)}</td>
      <td>${esc(r.equipamento)}</td>
      <td>${esc(r.cenario)}</td>
      <td>${esc(r.detalhes || '')}</td>
    `;
    frag.appendChild(tr);
  });
  
  tbody.appendChild(frag);
  
  // Atualizar informações de paginação
  document.getElementById('userPageInfo').textContent = 
    `${Math.min(start + 1, rows.length)}–${Math.min(start + pageRows.length, rows.length)} de ${rows.length}`;
}

// Exportar CSV dos chamados do usuário
function exportUserCSV() {
  const rows = filteredUserRows();
  exportCSV(rows, `meus_chamados_${new Date().toISOString().split('T')[0]}.csv`);
}

// Logout
function logout() {
  clearSession();
  window.location.href = 'index.html';
}
