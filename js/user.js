// user.js — CRUD chamados do usuário
/* global db, getSession, toast */

const uAnalista = document.getElementById('uAnalista');
const uChamado = document.getElementById('uChamado');
const uLinha = document.getElementById('uLinha');
const uEquipamento = document.getElementById('uEquipamento');
const uCenario = document.getElementById('uCenario');
const uData = document.getElementById('uData');
const btnUserSalvar = document.getElementById('btnUserSalvar');
const userTableBody = document.querySelector('#userTable tbody');

btnUserSalvar.addEventListener('click', saveChamadoFromUser);

const s = getSession();
if(s){ uAnalista.value = s.nome; }

async function saveChamadoFromUser(){
  const s = getSession(); if(!s) return toast('Sessão expirada');
  const analista = s.nome;
  const chamado = (uChamado.value||'').trim();
  const linha = (uLinha.value||'').trim();
  const equipamento = uEquipamento.value;
  const cenario = uCenario.value;
  const dataEncaminhamento = uData.value;
  if(!chamado||!linha||!equipamento||!cenario||!dataEncaminhamento) return toast('Preencha todos os campos');

  const now = Date.now();
  const data = {
    analista, chamado, linha, equipamento, cenario,
    dataEncaminhamento,
    createdAt: now, updatedAt: now,
    createdBy: s.id, deleted:false
  };
  await db.ref('app/chamados').push(data);
  toast('Chamado salvo');
  await loadChamadosUser();
}

async function loadChamadosUser(){
  const s = getSession(); if(!s) return;
  const snap = await db.ref('app/chamados').orderByChild('analista').equalTo(s.nome).once('value');
  const val = snap.val()||{};
  userTableBody.innerHTML = '';
  Object.values(val).forEach(r=>{
    if(r.deleted) return;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.dataEncaminhamento||''}</td><td>${r.chamado}</td><td>${r.linha}</td><td>${r.equipamento}</td><td>${r.cenario}</td>`;
    userTableBody.appendChild(tr);
  });
}
loadChamadosUser();
