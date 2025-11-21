/* navigationGuard.js
   UNIVERSAL navigation guard + modal + auto-detect UNSAVED
*/
let UNSAVED = false;

/* Auto-detect changes (input/select/textarea) */
window.addEventListener("input", () => { UNSAVED = true; });
window.addEventListener("change", () => { UNSAVED = true; });

document.addEventListener("DOMContentLoaded", () => {
  const fields = document.querySelectorAll("input, textarea, select");
  fields.forEach(f => f.addEventListener("input", () => { UNSAVED = true; }));
});

/* Create modern confirm modal (once) */
function createConfirmModal() {
  if (document.getElementById("confirmOverlay")) return;
  const modalHTML = `
    <div id="confirmOverlay" style="
      position:fixed;top:0;left:0;right:0;bottom:0;
      background:rgba(0,0,0,0.45);
      display:flex;align-items:center;justify-content:center;
      z-index:9999;visibility:hidden;opacity:0;transition:opacity .18s ease;">
      <div id="confirmBox" style="
        background:#fff;width:88%;max-width:380px;padding:18px;border-radius:14px;
        box-shadow:0 8px 30px rgba(0,0,0,0.22);text-align:center;">
        <div style="font-size:16px;font-weight:700;color:#222;margin-bottom:8px">
          Perubahan belum disimpan
        </div>
        <div style="font-size:14px;color:#666;margin-bottom:18px">
          Yakin ingin keluar dari halaman ini?
        </div>
        <div style="display:flex;gap:10px;">
          <button id="btnCancelNav" style="
            flex:1;padding:10px;border-radius:10px;border:none;background:#e6e6e6;color:#222;font-weight:700;">
            Batalkan
          </button>
          <button id="btnConfirmNav" style="
            flex:1;padding:10px;border-radius:10px;border:none;background:#ff8a00;color:#fff;font-weight:700;">
            Keluar
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
}
createConfirmModal();

function showConfirm(callback) {
  const overlay = document.getElementById("confirmOverlay");
  const btnCancel = document.getElementById("btnCancelNav");
  const btnConfirm = document.getElementById("btnConfirmNav");
  overlay.style.visibility = "visible";
  overlay.style.opacity = "1";
  btnCancel.onclick = () => {
    overlay.style.opacity = "0";
    setTimeout(()=> overlay.style.visibility = "hidden", 180);
  };
  btnConfirm.onclick = () => {
    overlay.style.opacity = "0";
    setTimeout(()=> overlay.style.visibility = "hidden", 180);
    UNSAVED = false;
    callback && callback();
  };
}

/* Guarded navigation helper */
function guardedNavigate(url) {
  if (!UNSAVED) {
    location.href = url;
    return;
  }
  showConfirm(() => { location.href = url; });
}

/* Hook FAB (if exists) */
function hookFAB() {
  const fab = document.querySelector(".fab-home");
  if (!fab) return;
  fab.addEventListener("click", (e) => {
    e.preventDefault();
    guardedNavigate("home.html");
  });
}

/* Hook navbar items */
function hookNavbar() {
  const items = document.querySelectorAll(".nav-item");
  items.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      // try to read onclick go('...') pattern or data-target
      const onclick = item.getAttribute("onclick") || "";
      const target = (onclick.match(/go\('(.+?)'\)/) || [])[1] || item.dataset.target;
      if (target) guardedNavigate(target);
    });
  });
}

/* Back button handling: confirm only when UNSAVED = true */
window.addEventListener("popstate", (e) => {
  if (UNSAVED) {
    e.preventDefault();
    showConfirm(() => history.back());
    history.pushState(null, "", location.href);
  }
});

/* Initialize hooks after DOM */
document.addEventListener("DOMContentLoaded", () => {
  history.pushState(null, "", location.href);
  hookFAB();
  hookNavbar();
});
