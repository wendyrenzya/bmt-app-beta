/* app.js - universal dev adapter (LOCAL mode) */

/* MODE: "LOCAL" or "API" */
const APP_MODE = "LOCAL";

/* localStorage helpers */
function loadLocal(key) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}
function saveLocal(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

/* API/LOCAL bridge functions (examples used by UI) */
async function getBarang() {
  if (APP_MODE === "LOCAL") return loadLocal("barang");
  const res = await fetch("/api/barang"); return await res.json();
}
function saveBarangList(list) { if (APP_MODE === "LOCAL") saveLocal("barang", list); }

async function addBarang(item) {
  if (APP_MODE === "LOCAL") {
    const list = loadLocal("barang"); list.push(item); saveLocal("barang", list);
    return { success: true };
  }
  const res = await fetch("/api/barang/add", {
    method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(item)
  });
  return await res.json();
}
async function updateBarang(id, updateObj) {
  if (APP_MODE === "LOCAL") {
    const list = loadLocal("barang"); const idx = list.findIndex(x => x.id === id);
    if (idx !== -1) { list[idx] = {...list[idx], ...updateObj}; saveLocal("barang", list); }
    return { success: true };
  }
  const res = await fetch(`/api/barang/update/${id}`, {
    method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(updateObj)
  });
  return await res.json();
}

/* stok masuk/keluar (local implementation) */
async function addStokMasuk(entry) {
  if (APP_MODE === "LOCAL") {
    const list = loadLocal("stok_masuk"); list.push(entry); saveLocal("stok_masuk", list);
    const barangList = loadLocal("barang"); const idx = barangList.findIndex(x => x.id === entry.barang_id);
    if (idx !== -1) { barangList[idx].stock = (barangList[idx].stock||0) + (entry.jumlah||0); saveLocal("barang", barangList); }
    return { success: true };
  }
  const res = await fetch("/api/stok/masuk", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(entry)});
  return await res.json();
}
async function addStokKeluar(entry) {
  if (APP_MODE === "LOCAL") {
    const list = loadLocal("stok_keluar"); list.push(entry); saveLocal("stok_keluar", list);
    const barangList = loadLocal("barang"); const idx = barangList.findIndex(x => x.id === entry.barang_id);
    if (idx !== -1) { barangList[idx].stock = Math.max(0, (barangList[idx].stock||0) - (entry.jumlah||0)); saveLocal("barang", barangList); }
    return { success: true };
  }
  const res = await fetch("/api/stok/keluar", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(entry)});
  return await res.json();
}

/* getSettings -> used by home.html to show sticky/custom message */
async function getSettings() {
  if (APP_MODE === "LOCAL") {
    const s = loadLocal("settings");
    return (s && s.length>0) ? s[0] : {};
  }
  const res = await fetch("/api/more");
  return await res.json();
}

/* Dummy DB init (only if not present) */
(function initDummyDB(){
  if (!localStorage.getItem("settings")) {
    saveLocal("settings", [{
      sticky_message: "Selamat datang di Big Motor!",
      custom_message: "Aplikasi ini masih dalam tahap pengembangan. Periksa fitur baru secara berkala."
    }]);
  }
  // optional: seed barang minimal for testing (only if empty)
  if (!localStorage.getItem("barang")) {
    saveLocal("barang", [
      { id:1, kode_barang:"BM001", nama:"Oli Motor 1L", harga_modal:25000, harga:40000, stock:12, kategori:"Oli", foto:"", deskripsi:"", created_at: new Date().toISOString() }
    ]);
  }
})();
