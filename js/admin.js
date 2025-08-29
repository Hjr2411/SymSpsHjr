// admin.js
document.addEventListener("DOMContentLoaded", () => {
  const user = checkAuth("admin");
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Mostra nome do admin
  const userNameEl = document.getElementById("userName");
  if (userNameEl) userNameEl.textContent = user.nome;

  const content = document.getElementById("adminContent");

  // ---- MENU: Usuários ----
  document.getElementById("btnUsers")?.addEventListener("click", async () => {
    content.innerHTML = `
      <h2>Gerenciar Usuários</h2>
      <div class="card">
        <form id="formUser">
          <label class="field">
            <span>Usuário</span>
            <input id="newUser" class="input" type="text" required>
          </label>
          <label class="field">
            <span>Senha</span>
            <input id="newPass" class="input" type="password" required>
          </label>
          <label class="field">
            <span>Admin?</span>
            <select id="newAdmin" class="select">
              <option value="false">Não</option>
              <option value="true">Sim</option>
            </select>
          </label>
          <button type="submit" class="btn primary">Adicionar</button>
        </form>
      </div>
      <div class="table-wrap" style="margin-top:16px">
        <table class="table" id="usersTable">
          <thead><tr><th>Usuário</th><th>Admin</th><th>Ações</th></tr></thead>
          <tbody></tbody>
        </table>
      </div>
    `;

    // Evento de adicionar usuário
    document.getElementById("formUser").addEventListener("submit", async (e) => {
      e.preventDefault();
      const u = document.getElementById("newUser").value.trim().toLowerCase();
      const p = document.getElementById("newPass").value.trim();
      const a = document.getElementById("newAdmin").value === "true";
      if (!u || !p) return toast("Preencha os campos");

      await db.ref("app/users/" + u).set({ nome: u, password: p, admin: a });
      toast("Usuário adicionado!");
      document.getElementById("formUser").reset();
      loadUsers();
    });

    // Carregar tabela de usuários
    async function loadUsers() {
      const snap = await db.ref("app/users").once("value");
      const tbody = document.querySelector("#usersTable tbody");
      tbody.innerHTML = "";
      snap.forEach(child => {
        const u = child.val();
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${esc(u.nome)}</td>
          <td>${u.admin ? "Sim" : "Não"}</td>
          <td>
            <button class="btn" data-del="${child.key}">Excluir</button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      // Botões de excluir
      document.querySelectorAll("[data-del]").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-del");
          await db.ref("app/users/" + id).remove();
          toast("Usuário removido!");
          loadUsers();
        });
      });
    }
    loadUsers();
  });

  // ---- MENU: Chamados ----
  document.getElementById("btnChamados")?.addEventListener("click", async () => {
    content.innerHTML = `
      <h2>Gerenciar Chamados</h2>
      <div class="table-wrap">
        <table class="table" id="callsTable">
          <thead><tr><th>ID</th><th>Título</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody></tbody>
        </table>
      </div>
    `;

    async function loadCalls() {
      const snap = await db.ref("app/chamados").once("value");
      const tbody = document.querySelector("#callsTable tbody");
      tbody.innerHTML = "";
      snap.forEach(child => {
        const c = child.val();
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${child.key}</td>
          <td>${esc(c.titulo || "-")}</td>
          <td>${esc(c.status || "aberto")}</td>
          <td>
            <button class="btn" data-del-call="${child.key}">Excluir</button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      document.querySelectorAll("[data-del-call]").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-del-call");
          await db.ref("app/chamados/" + id).remove();
          toast("Chamado removido!");
          loadCalls();
        });
      });
    }
    loadCalls();
  });

  // ---- MENU: Dashboard ----
  document.getElementById("btnDashboard")?.addEventListener("click", () => {
    window.location.href = "dashboard.html";
  });
});
