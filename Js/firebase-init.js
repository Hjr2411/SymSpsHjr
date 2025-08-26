// firebase-init.js
/* global firebase */

// ======================= CONFIG FIREBASE =======================
const firebaseConfig = {
  apiKey: "AIzaSyAeCrURSs0TBXlYF3TKLi4q98VwrGaKe_Q",
  authDomain: "spsch-849e5.firebaseapp.com",
  databaseURL: "https://spsch-849e5-default-rtdb.firebaseio.com",
  projectId: "spsch-849e5",
  storageBucket: "spsch-849e5.firebasestorage.app",
  messagingSenderId: "698967090558",
  appId: "1:698967090558:web:978781fd27b86c36203f2f",
  measurementId: "G-C5D3774P2G"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ======================= TOAST =======================
const toastEl = document.getElementById('toast');
function toast(msg, ms = 2200){
  if(!toastEl) return alert(msg);
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(()=>toastEl.classList.remove('show'), ms);
}

// ======================= SESSION =======================
const SESSION_KEY = 'sps_session_v12';
function setSession(u){
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    id: u.id, nome: u.nome, admin: !!u.admin, ts: Date.now() + 1000*60*60*24
  }));
}
function getSession(){
  const raw = localStorage.getItem(SESSION_KEY);
  if(!raw) return null;
  try{ const s = JSON.parse(raw); if(Date.now() > s.ts) return null; return s; }catch{ return null; }
}
function clearSession(){ localStorage.removeItem(SESSION_KEY); }
