// user.js — CRUD chamados usuário
let userRows = [];
let userPage = 1;

const uAnalista = document.getElementById("uAnalista");
const uChamado = document.getElementById("uChamado");
const uLinha = document.getElementById("uLinha");
const uEquipamento = document.getElementById("uEquipamento");
const uCenario = document.getElementById("uCenario");
const uData = document.getElementById("uData");
const btnUserSalvar = document.getElementById("btnUserSalvar");
const btnUserNovo = document.getElementById("btnUserNovo");
const btnUserLimpar = document.getElementById("btnUserLimpar");
const userTableBody = document.querySelector("#userTable tbody");

const session = getSession();
if (!session) window.location.href = "login.html";
document.getElementById("userBadge").textContent = session.nome;
uAnalista.value = session.nome;

btnUserSalvar.onclick = saveChamado;
btnUserNovo.onclick = ()=> clearUserForm(true);
btnUserLimpar.onclick = ()=> clearUserForm();

async function saveChamado(){
  const data = {
    analista: session.nome,
    chamado: uChamado.value,
    linha: uLinha.value,
    equipamento: uEquipamento.value,
    cenario: uCenario.value,
    dataEncaminhamento: uData.value,
    detalhes: uDetalhes.value,
    createdAt: Date.now(),
    deleted: false
  };
  await db.ref("app/chamados").push(data);
  toast("Chamado salvo!");
  clearUserForm(true);
  await loadUserChamados();
}

function clearUserForm(reset){
  uChamado.value=""; uLinha.value=""; uData.value=""; uDetalhes.value="";
  if(reset) uChamado.focus();
}

async function loadUserChamados(){
  const snap = await db.ref("app/chamados").orderByChild("analista").equalTo(session.nome).once("value");
  const val = snap.val() || {};
  userRows = Object.entries(val).map(([id,r])=>({id,...r})).filter(r=>!r.deleted);
  renderUserTable();
}
function renderUserTable(){
  userTableBody.innerHTML="";
  userRows.forEach(r=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${r.dataEncaminhamento}</td><td>${esc(r.chamado)}</td><td>${esc(r.linha)}</td><td>${esc(r.equipamento)}</td><td>${esc(r.cenario)}</td>`;
    userTableBody.appendChild(tr);
  });
}
loadUserChamados();
