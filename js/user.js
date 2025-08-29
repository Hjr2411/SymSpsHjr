<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Usuário - SPS_CH</title>
  <link rel="stylesheet" href="style.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.6.11/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.6.11/firebase-database-compat.js"></script>
  <script src="firebase-config.js"></script>
</head>
<body>
  <header class="topbar">
    <div class="title">Painel do Usuário</div>
    <div class="session">
      <span id="userBadge" class="badge"></span>
      <button onclick="logout()" class="btn ghost">Sair</button>
    </div>
  </header>

  <main class="content">
    <div class="grid-2 gap-16">
      <div class="card">
        <h2>Novo Chamado</h2>
        <div class="grid-2 compact-form">
          <label class="field"><span>Analista</span><input id="uAnalista" class="input" readonly></label>
          <label class="field"><span>Chamado</span><input id="uChamado" class="input"></label>
          <label class="field"><span>Linha</span><input id="uLinha" class="input"></label>
          <label class="field"><span>Equipamento</span><select id="uEquipamento" class="select"></select></label>
          <label class="field"><span>Cenário</span><select id="uCenario" class="select"></select></label>
          <label class="field"><span>Data Encaminhamento</span><input id="uData" class="input" type="date"></label>
          <label class="field"><span>Detalhes</span><textarea id="uDetalhes" class="input"></textarea></label>
        </div>
        <div class="actions">
          <button id="btnUserSalvar" class="btn primary">Salvar</button>
          <button id="btnUserNovo" class="btn">Novo</button>
          <button id="btnUserLimpar" class="btn ghost">Limpar</button>
        </div>
      </div>

      <div class="card">
        <h2>Meus Chamados</h2>
        <div class="toolbar">
          <input id="userSearch" class="input" placeholder="Buscar...">
          <select id="userPageSize" class="select w-120"><option>10</option><option>25</option><option>50</option></select>
        </div>
        <div class="table-wrap">
          <table class="table" id="userTable">
            <thead><tr><th>Data</th><th>Chamado</th><th>Linha</th><th>Equip</th><th>Cenário</th></tr></thead>
            <tbody></tbody>
          </table>
          <div class="pager">
            <button id="userPrev" class="btn">◀</button>
            <span id="userPageInfo" class="muted"></span>
            <button id="userNext" class="btn">▶</button>
          </div>
        </div>
      </div>
    </div>
  </main>

  <div id="toast" class="toast"></div>
  <script src="js/utils.js"></script>
  <script src="js/auth.js"></script>
  <script src="js/user.js"></script>
</body>
</html>
