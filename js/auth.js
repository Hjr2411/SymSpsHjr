// Gerenciamento de autenticação e sessão
const SESSION_KEY = 'sps_session_v11';

// Funções de sessão
function setSession(u) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    id: u.id, nome: u.nome, admin: !!u.admin, ts: Date.now() + 1000*60*60*24
  }));
}

function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if(!raw) return null;
  try { 
    const s = JSON.parse(raw); 
    if(Date.now() > s.ts) return null; 
    return s; 
  } catch { 
    return null; 
  }
}

function clearSession() { 
  localStorage.removeItem(SESSION_KEY); 
}

// Verificar se usuário está logado e redirecionar
function checkAuth() {
  const session = getSession();
  if (session) {
    // Redirecionar para a página apropriada
    if (session.admin && !window.location.pathname.endsWith('admin.html')) {
      window.location.href = 'admin.html';
    } else if (!session.admin && !window.location.pathname.endsWith('user.html')) {
      window.location.href = 'user.html';
    }
  } else if (!window.location.pathname.endsWith('index.html')) {
    window.location.href = 'index.html';
  }
}

// Função de login
async function handleLogin(e) {
  e.preventDefault();
  const usernameEl = document.getElementById('username');
  const passwordEl = document.getElementById('password');
  const loginError = document.getElementById('loginError');
  
  const nomeInput = (usernameEl.value||'').trim();
  const senhaInput = passwordEl.value||'';
  
  if(!nomeInput || !senhaInput){
    loginError.textContent = 'Informe nome e senha.'; 
    return;
  }
  
  const key = nomeInput.toLowerCase();
  const snap = await db.ref('app/users/'+key).once('value');
  
  if(!snap.exists()){
    loginError.textContent = 'Usuário não encontrado.';
    return;
  }
  
  const u = snap.val();
  if(u.ativo===false){ 
    loginError.textContent = 'Usuário inativo.'; 
    return; 
  }
  
  const ok = (u.password === senhaInput);
  if(!ok){ 
    loginError.textContent = 'Senha inválida.'; 
    return; 
  }

  setSession({ id:key, nome: (u.nome||nomeInput), admin: !!u.admin });
  usernameEl.value=''; 
  passwordEl.value='';
  
  // Redirecionar após login bem-sucedido
  if (u.admin) {
    window.location.href = 'admin.html';
  } else {
    window.location.href = 'user.html';
  }
  
  toast('Bem-vindo!');
}

// Verificação de permissão admin
function requireAdmin(){
  const s = getSession();
  if(!s || !s.admin){
    toast('Acesso negado: apenas administradores podem realizar esta ação');
    return false;
  }
  return true;
}
