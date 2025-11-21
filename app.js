<!-- app.js -->
<script>
/**
 * MODE aplikasi:
 * - "LOCAL": memakai localStorage (development)
 * - "API": memakai Cloudflare Worker (production)
 */
const APP_MODE = "LOCAL";

/**
 * Helper untuk load JSON dari localStorage
 */
function loadLocal(key) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

/**
 * Helper untuk simpan JSON ke localStorage
 */
function saveLocal(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * UNIVERSAL FUNCTION:
 * Ambil list barang
 */
async function getBarang() {
  if (APP_MODE === "LOCAL") {
    return loadLocal("barang");
  }
  const res = await fetch("/api/barang");
  return await res.json();
}

/**
 * UNIVERSAL FUNCTION:
 * Simpan list barang (LOCAL ONLY)
 */
function saveBarangList(list) {
  if (APP_MODE === "LOCAL") {
    saveLocal("barang", list);
  }
}

/**
 * Tambah barang baru
 */
async function addBarang(item) {
  if (APP_MODE === "LOCAL") {
    const list = loadLocal("barang");
    list.push(item);
    saveLocal("barang", list);
    return { success: true };
  }
  const res = await fetch("/api/barang/add", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(item)
  });
  return await res.json();
}

/**
 * Update barang
 */
async function updateBarang(id, updateObj) {
  if (APP_MODE === "LOCAL") {
    const list = loadLocal("barang");
    const idx = list.findIndex(x => x.id === id);
    if (idx !== -1) {
      list[idx] = {...list[idx], ...updateObj};
      saveLocal("barang", list);
    }
    return { success: true };
  }
  const res = await fetch(`/api/barang/update/${id}`, {
    method: "PUT",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(updateObj)
  });
  return await res.json();
}

/**
 * Tambah stok masuk
 */
async function addStokMasuk(entry) {
  if (APP_MODE === "LOCAL") {
    const list = loadLocal("stok_masuk");
    list.push(entry);
    saveLocal("stok_masuk", list);

    // Update stok barang
    const barangList = loadLocal("barang");
    const idx = barangList.findIndex(x => x.id === entry.barang_id);
    if (idx !== -1) {
      barangList[idx].stock += entry.jumlah;
      saveLocal("barang", barangList);
    }
    return { success:true };
  }

  const res = await fetch("/api/stok/masuk", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(entry)
  });
  return await res.json();
}

/**
 * Tambah stok keluar (penjualan, servis, lain-lain)
 */
async function addStokKeluar(entry) {
  if (APP_MODE === "LOCAL") {
    const list = loadLocal("stok_keluar");
    list.push(entry);
    saveLocal("stok_keluar", list);

    // Kurangi stok barang
    const barangList = loadLocal("barang");
    const idx = barangList.findIndex(x => x.id === entry.barang_id);
    if (idx !== -1) {
      barangList[idx].stock -= entry.jumlah;
      if (barangList[idx].stock < 0) barangList[idx].stock = 0;
      saveLocal("barang", barangList);
    }
    return { success:true };
  }

  const res = await fetch("/api/stok/keluar", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(entry)
  });
  return await res.json();
}

/**
 * Ambil settings (custom_message, sticky_message)
 */
async function getSettings() {
  if (APP_MODE === "LOCAL") {
    const local = loadLocal("settings");
    return local.length > 0 ? local[0] : {};
  }
  const res = await fetch("/api/more");
  return await res.json();
}
</script>
