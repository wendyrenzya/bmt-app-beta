// app.js (frontend) - API mode
const API_BASE = "https://api.bigmotor.biz.id"; // set to worker base if hosted elsewhere, e.g. "https://bigmotor-worker.example.workers.dev"

async function apiGET(path) {
  const r = await fetch(API_BASE + path);
  return await r.json();
}
async function apiPOST(path, body) {
  const r = await fetch(API_BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return await r.json();
}
async function apiPUT(path, body) {
  const r = await fetch(API_BASE + path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return await r.json();
}
async function apiDELETE(path) {
  const r = await fetch(API_BASE + path, { method: "DELETE" });
  return await r.json();
}

/* BARANG */
async function getBarang() { const r = await apiGET("/api/barang"); return r.items || []; }
async function getBarangById(id) { const r = await apiGET(`/api/barang/${id}`); return r.item || null; }
async function addBarang(item) { return await apiPOST("/api/barang", item); }
async function updateBarangAPI(id, updateObj) { return await apiPUT(`/api/barang/${id}`, updateObj); }
async function deleteBarangAPI(id) { return await apiDELETE(`/api/barang/${id}`); }

/* KATEGORI */
async function getKategori() { const r = await apiGET("/api/kategori"); return r.categories || []; }

/* Duck image */
async function fetchDuckImageAPI(keyword) {
  const r = await apiGET(`/api/duckimg?q=${encodeURIComponent(keyword)}`);
  return r.image || "";
}

/* Kode generate (reads DB list to determine next) */
async function generateKodeBarang() {
  const items = await getBarang();
  const maxId = items.length ? Math.max(...items.map(i => Number(i.kode_barang || 0))) : 0;
  const next = maxId + 1;
  return String(next).padStart(5, "0");
}

/* Toast */
function showToast(msg, ms = 2000) {
  let t = document.getElementById("__gm_toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "__gm_toast";
    Object.assign(t.style, { position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: "90px", padding: "10px 14px", borderRadius: "10px", background: "#111", color: "#fff", zIndex: 9999, opacity: 0.95, fontWeight: 700 });
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.display = "block";
  setTimeout(() => { t.style.display = "none"; }, ms);
}

/* navigation guard */
window.guardedNavigate = function (url) {
  if (window.unsavedChanges) {
    if (!confirm("Ada perubahan belum disimpan. Lanjutkan?")) return;
    window.unsavedChanges = false;
  }
  window.location.href = url;
};

window.unsavedChanges = false;
window.addEventListener("beforeunload", (e) => {
  if (window.unsavedChanges) {
    e.preventDefault();
    e.returnValue = '';
  }
});
