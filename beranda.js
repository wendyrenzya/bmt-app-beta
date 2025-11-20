// beranda.js
// Simple UI logic for Beranda page
const API_BASE = 'https://api.bigmotor.biz.id'; // LOCKED baseline (do not change without instruction)

const el = id => document.getElementById(id);
const inspector = el('inspector');
const barangList = el('barangList');
const deviceTime = el('deviceTime');

let lastResponse = null;

function pretty(obj){
  try { return JSON.stringify(obj, null, 2); } catch(e){ return String(obj); }
}
function logToInspector(label, data){
  lastResponse = { label, time: new Date().toISOString(), data };
  inspector.textContent = `${label} @ ${lastResponse.time}\n\n${pretty(data)}`;
}

async function fetchBarang(){
  barangList.textContent = 'Loading...';
  try {
    const res = await fetch(`${API_BASE}/barang`);
    const j = await res.json();
    logToInspector('/barang response', j);

    if (j && j.ok && Array.isArray(j.results)) {
      renderBarang(j.results);
    } else {
      barangList.textContent = 'Tidak ada data / error';
    }
  } catch (e) {
    logToInspector('ERROR fetching /barang', { error: e.message || String(e) });
    barangList.textContent = 'Fetch error';
  }
}

function renderBarang(items){
  if (!items || !items.length) {
    barangList.textContent = 'Kosong';
    return;
  }
  barangList.innerHTML = '';
  items.forEach(it => {
    const node = document.createElement('div');
    node.className = 'barang-item';
    node.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-weight:700">${escapeHtml(it.nama || '—')}</div>
          <div style="color: #6b7280; font-size:13px">${escapeHtml(it.kategori || '')} · stok ${it.stock ?? '-'}</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:700">Rp ${formatNumber(it.harga)}</div>
          <div style="font-size:12px;color:#94a3b8">${it.kode_barang || ''}</div>
        </div>
      </div>
    `;
    barangList.appendChild(node);
  });
}

function formatNumber(n){
  if (n === undefined || n === null) return '-';
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function escapeHtml(s){
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}

// device time tick
setInterval(()=> {
  const d = new Date();
  deviceTime.textContent = d.toLocaleTimeString();
}, 1000);

// UI events
document.addEventListener('DOMContentLoaded', ()=>{
  el('fetchBarang').addEventListener('click', fetchBarang);
  el('openInspector').addEventListener('click', ()=> {
    if (lastResponse) {
      inspector.scrollIntoView({behavior:'smooth'});
    } else {
      inspector.textContent = 'Belum ada response. Tekan Refresh /barang.';
    }
  });

  // action buttons (navigasi placeholder)
  document.querySelectorAll('[data-page]').forEach(btn=>{
    btn.addEventListener('click', (ev)=>{
      const page = ev.currentTarget.getAttribute('data-page');
      logToInspector('navigation', { to: page, note: 'UI navigasi placeholder — belum implement page' });
      alert('Navigasi ke: ' + page);
    });
  });

  // initial fetch (non-blocking)
  fetchBarang();
});
