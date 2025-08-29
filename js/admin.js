document.addEventListener("DOMContentLoaded", () => {
  const user = checkAuth("admin");
  if (!user) return;

  document.getElementById("userName").textContent = user.nome;

  // Botões do menu lateral
  document.getElementById("btnUsers").addEventListener("click", () => {
    document.getElementById("adminContent").innerHTML = "<h2>Gerenciar Usuários</h2><p>Aqui entra o CRUD de usuários...</p>";
  });

  document.getElementById("btnChamados").addEventListener("click", () => {
    document.getElementById("adminContent").innerHTML = "<h2>Gerenciar Chamados</h2><p>Aqui entra o CRUD de chamados...</p>";
  });

  document.getElementById("btnDashboard").addEventListener("click", () => {
    window.location.href = "dashboard.html";
  });
});

// admin.js — gestão usuários, cenários e chamados
const s = getSession();
if(!s || !s.admin) window.location.href="login.html";
document.getElementById("userBadge").textContent = s.nome+" (admin)";

const admUsersTable = document.getElementById("admUsersTable");
const admCenariosTable = document.getElementById("admCenariosTable");
const admCallsTable = document.getElementById("admCallsTable");

document.getElementById("btnUserCreate").onclick = async ()=>{
  const nome = aUNome.value.trim(); const senha = aUSenha.value; const admin = aUAdmin.checked;
  if(!nome||!senha) return toast("Preencha todos os campos");
  await db.ref("app/users/"+nome.toLowerCase()).set({nome,password:senha,admin,ativo:true});
  toast("Usuário criado"); loadUsers();
};

async function loadUsers(){
  const snap = await db.ref("app/users").once("value");
  admUsersTable.innerHTML="";
  Object.entries(snap.val()||{}).forEach(([id,u])=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${u.nome}</td><td>${u.admin?"✔":""}</td><td><button onclick="deleteUser('${id}')">Del</button></td>`;
    admUsersTable.appendChild(tr);
  });
}
async function deleteUser(id){ await db.ref("app/users/"+id).remove(); toast("Usuário removido"); loadUsers(); }

async function loadCenarios(){
  const snap = await db.ref("app/listas/cenarios").once("value");
  admCenariosTable.innerHTML="";
  (snap.val()||[]).forEach((c,i)=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${c}</td><td><button onclick="deleteCenario(${i})">Del</button></td>`;
    admCenariosTable.appendChild(tr);
  });
}
btnCenarioCreate.onclick=async()=>{
  const nome=aCenarioNome.value.trim(); if(!nome) return;
  const snap=await db.ref("app/listas/cenarios").once("value");
  const cen=snap.val()||[]; cen.push(nome); await db.ref("app/listas/cenarios").set(cen);
  toast("Cenário criado"); loadCenarios();
};
async function deleteCenario(i){
  const snap=await db.ref("app/listas/cenarios").once("value");
  const cen=snap.val()||[]; cen.splice(i,1); await db.ref("app/listas/cenarios").set(cen);
  toast("Cenário removido"); loadCenarios();
}

async function loadChamados(){
  const snap = await db.ref("app/chamados").once("value");
  admCallsTable.innerHTML="";
  Object.entries(snap.val()||{}).forEach(([id,r])=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${r.dataEncaminhamento}</td><td>${r.analista}</td><td>${r.chamado}</td><td>${r.linha}</td><td><button onclick="delChamado('${id}')">Del</button></td>`;
    admCallsTable.appendChild(tr);
  });
}
async function delChamado(id){ await db.ref("app/chamados/"+id).remove(); toast("Chamado removido"); loadChamados(); }

loadUsers(); loadCenarios(); loadChamados();
