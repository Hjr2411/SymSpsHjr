// ===================================================================
//                        FUNÇÕES UTILITÁRIAS
// ===================================================================

/**
 * Exibe uma notificação toast na tela.
 * @param {string} msg - A mensagem a ser exibida.
 * @param {number} [ms=2200] - O tempo em milissegundos que o toast ficará visível.
 */
function toast(msg, ms = 2200) {
  const toastEl = document.getElementById('toast');
  if (!toastEl) {
    // Fallback caso o elemento toast não exista no HTML
    return alert(msg);
  }
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), ms);
}

/**
 * Cria uma versão "debounced" de uma função, que atrasa sua execução.
 * Útil para eventos que disparam rapidamente, como 'resize' ou 'keyup'.
 * @param {Function} fn - A função a ser executada após o atraso.
 * @param {number} ms - O tempo de atraso em milissegundos.
 * @returns {Function} A nova função com debounce.
 */
function debounce(fn, ms) {
  let timerId;
  return function(...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Escapa caracteres HTML para prevenir ataques XSS ao inserir texto no DOM.
 * @param {*} s - A string ou valor a ser escapado.
 * @returns {string} A string segura para HTML.
 */
function esc(s) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;"
  };
  return (s ?? '').toString().replace(/[&<>"]/g, (m) => map[m]);
}

/**
 * Exporta um array de objetos para um arquivo CSV.
 * @param {Array<Object>} rows - Os dados a serem exportados.
 * @param {string} filename - O nome do arquivo a ser baixado.
 */
function exportCSV(rows, filename) {
  const cols = ['dataEncaminhamento', 'analista', 'chamado', 'linha', 'equipamento', 'cenario'];
  const header = cols.join(';');
  const csvRows = rows.map(r =>
    cols.map(c => `"${(r[c] ?? '').toString().replaceAll('"', '""')}"`).join(';')
  );
  const csv = [header, ...csvRows].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}


// ===================================================================
//              GERENCIAMENTO DE SESSÃO E AUTENTICAÇÃO
// ===================================================================

/**
 * Obtém os dados da sessão do usuário do localStorage.
 * @returns {Object|null} O objeto da sessão ou null se não houver.
 */
function getSession() {
  try {
    const session = localStorage.getItem('userSession');
    return session ? JSON.parse(session) : null;
  } catch (e) {
    console.error('Erro ao ler a sessão do localStorage:', e);
    return null;
  }
}

/**
 * Salva os dados da sessão do usuário no localStorage.
 * @param {Object} userData - Os dados do usuário para salvar.
 */
function setSession(userData) {
  try {
    localStorage.setItem('userSession', JSON.stringify(userData));
  } catch (e) {
    console.error('Erro ao salvar a sessão no localStorage:', e);
  }
}

/**
 * Remove os dados da sessão do usuário do localStorage (logout).
 */
function clearSession() {
  try {
    localStorage.removeItem('userSession');
  } catch (e) {
    console.error('Erro ao limpar a sessão do localStorage:', e);
  }
}

/**
 * Verifica se o usuário na sessão atual é um administrador.
 * @returns {boolean} True se for admin, false caso contrário.
 */
function isAdmin() {
  const session = getSession();
  return session ? session.admin === true : false;
}

/**
 * Manipula o evento de submissão do formulário de login.
 * @param {Event} event - O objeto do evento do formulário.
 */
function handleLogin(event) {
  // Previne o comportamento padrão do formulário (recarregar a página)
  event.preventDefault();
  
  console.log('Tentativa de login iniciada...');
  
  // Aqui você adicionaria sua lógica de autenticação:
  // 1. Obter os dados do formulário (ex: email e senha).
  // 2. Enviar para uma API para validar as credenciais.
  // 3. Se a validação for bem-sucedida, usar setSession(dadosDoUsuario).
  // 4. Redirecionar o usuário ou atualizar a interface.
}


// ===================================================================
//                        INICIALIZAÇÃO DO SCRIPT
// ===================================================================

// Obtém a sessão do usuário assim que o script é carregado
const session = getSession();

// Exemplo de como você poderia usar a variável 'session'
if (session) {
  console.log(`Usuário logado: ${session.name}, Admin: ${isAdmin()}`);
} else {
  console.log('Nenhum usuário logado.');
}
