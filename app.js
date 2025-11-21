/* app.js - universal dev adapter (LOCAL mode + dummy DB for testing) */

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

/* ================================
   BARANG
   ================================ */
async function getBarang() {
  if (APP_MODE === "LOCAL") return loadLocal("barang");
  const res = await fetch("/api/barang");
  return await res.json();
}

function saveBarangList(list) { 
  if (APP_MODE === "LOCAL") saveLocal("barang", list); 
}

async function addBarang(item) {
  if (APP_MODE === "LOCAL") {
    const list = loadLocal("barang");
    list.push(item);
    saveLocal("barang", list);
    return { success: true };
  }
  const res = await fetch("/api/barang/add", {
    method:"POST", 
    headers:{"Content-Type":"application/json"}, 
    body:JSON.stringify(item)
  });
  return await res.json();
}

async function updateBarang(id, updateObj) {
  if (APP_MODE === "LOCAL") {
    const list = loadLocal("barang");
    const idx = list.findIndex(x => x.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updateObj };
      saveLocal("barang", list);
    }
    return { success: true };
  }
  const res = await fetch(`/api/barang/update/${id}`, {
    method:"PUT",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(updateObj)
  });
  return await res.json();
}

/* ================================
   STOK MASUK / KELUAR
   ================================ */
async function addStokMasuk(entry) {
  if (APP_MODE === "LOCAL") {
    const list = loadLocal("stok_masuk");
    list.push(entry);
    saveLocal("stok_masuk", list);

    const barangList = loadLocal("barang");
    const idx = barangList.findIndex(x => x.id === entry.barang_id);
    if (idx !== -1) {
      barangList[idx].stock = (barangList[idx].stock || 0) + (entry.jumlah || 0);
      saveLocal("barang", barangList);
    }

    return { success: true };
  }
  const res = await fetch("/api/stok/masuk", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(entry)
  });
  return await res.json();
}

async function addStokKeluar(entry) {
  if (APP_MODE === "LOCAL") {
    const list = loadLocal("stok_keluar");
    list.push(entry);
    saveLocal("stok_keluar", list);

    const barangList = loadLocal("barang");
    const idx = barangList.findIndex(x => x.id === entry.barang_id);
    if (idx !== -1) {
      barangList[idx].stock = Math.max(0,(barangList[idx].stock||0)-(entry.jumlah||0));
      saveLocal("barang", barangList);
    }

    return { success: true };
  }
  const res = await fetch("/api/stok/keluar", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(entry)
  });
  return await res.json();
}

/* ================================
   SETTINGS (untuk home)
   ================================ */
async function getSettings() {
  if (APP_MODE === "LOCAL") {
    const s = loadLocal("settings");
    return (s && s.length>0) ? s[0] : {};
  }
  const res = await fetch("/api/more");
  return await res.json();
}

/* ================================
   INIT DUMMY DATABASE
   ================================ */
(function initDummyDB(){

  /* Dummy settings */
  if (!localStorage.getItem("settings")) {
    saveLocal("settings", [{
      sticky_message: "Selamat datang di Big Motor!",
      custom_message: "Aplikasi ini masih dalam tahap pengembangan. Periksa fitur baru secara berkala."
    }]);
  }

  /* Dummy Barang (10 item) - only seed if no 'barang' key present */
  if (!localStorage.getItem("barang")) {
    saveLocal("barang", [
      { id:1, kode_barang:"BM001", nama:"Oli Pertamina Enduro 1L", harga_modal:28000, harga:45000, stock:12, kategori:"Oli", foto:"https://i.imgur.com/9rV0oKl.jpeg", deskripsi:"", created_at:new Date().toISOString() },
      { id:2, kode_barang:"BM002", nama:"Kampas Rem Depan", harga_modal:15000, harga:25000, stock:8, kategori:"Sparepart", foto:"https://i.imgur.com/7iH5Pf7.jpeg", deskripsi:"", created_at:new Date().toISOString() },
      { id:3, kode_barang:"BM003", nama:"Busi NGK", harga_modal:13000, harga:18000, stock:15, kategori:"Sparepart", foto:"https://i.imgur.com/NmJ32nP.jpeg", deskripsi:"", created_at:new Date().toISOString() },
      { id:4, kode_barang:"BM004", nama:"Aki Yuasa", harga_modal:160000, harga:210000, stock:3, kategori:"Aki", foto:"https://i.imgur.com/YLtV2sQ.jpeg", deskripsi:"", created_at:new Date().toISOString() },
      { id:5, kode_barang:"BM005", nama:"Ban Luar FDR 80/90", harga_modal:135000, harga:175000, stock:5, kategori:"Ban", foto:"https://i.imgur.com/jxNn1Dl.jpeg", deskripsi:"", created_at:new Date().toISOString() },
      { id:6, kode_barang:"BM006", nama:"Ban Dalam FDR", harga_modal:25000, harga:35000, stock:9, kategori:"Ban", foto:"https://i.imgur.com/te0VVoE.jpeg", deskripsi:"", created_at:new Date().toISOString() },
      { id:7, kode_barang:"BM007", nama:"Saringan Udara", harga_modal:18000, harga:30000, stock:6, kategori:"Sparepart", foto:"https://i.imgur.com/YCIzX7P.jpeg", deskripsi:"", created_at:new Date().toISOString() },
      { id:8, kode_barang:"BM008", nama:"Lampu LED Motor", harga_modal:22000, harga:40000, stock:10, kategori:"Lampu", foto:"https://i.imgur.com/HU1A3Tw.jpeg", deskripsi:"", created_at:new Date().toISOString() },
      { id:9, kode_barang:"BM009", nama:"Shockbreaker Belakang", harga_modal:120000, harga:160000, stock:4, kategori:"Suspensi", foto:"https://i.imgur.com/vd3pVuM.jpeg", deskripsi:"", created_at:new Date().toISOString() },
      { id:10, kode_barang:"BM010", nama:"Rantai Set", harga_modal:70000, harga:110000, stock:7, kategori:"Sparepart", foto:"https://i.imgur.com/2jAkI7J.jpeg", deskripsi:"", created_at:new Date().toISOString() }
    ]);
  }

})();
