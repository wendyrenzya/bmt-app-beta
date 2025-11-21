/* navigationGuard.js
   UNIVERSAL navigation guard + modal + auto-detect UNSAVED
   Includes bounce animation hooks for interactive elements.
*/
let UNSAVED = false;

/* Auto-detect changes (input/select/textarea) */
window.addEventListener("input", () => { UNSAVED = true; });
window.addEventListener("change", () => { UNSAVED = true; });

document.addEventListener("DOMContentLoaded", () => {
  const fields = document.querySelectorAll("input, textarea, select");
  fields.forEach(f => f.addEventListener("input", () => { UNSAVED = true; }));

  // Hook interactive elements that may not be added elsewhere
  hookNavbar();
  hookFAB();
  hookMenuItems();
});

/* -------------------------
   BOUNCE ANIMATION HELPERS
   ------------------------- */
function injectBounceCSS(){
  if (document.getElementById("bounce-style")) return;
  const css = `
    .bounce { animation: bounceTap 0.25s ease-out; }
    @keyframes bounceTap {
      0% { transform: scale(1); }
      40% { transform: scale(0.92); }
      100% { transform: scale(1); }
    }
  `;
  const s = document.createElement("style");
  s.id = "bounce-style";
  s.appendChild(document.createTextNode(css));
  document.head.appendChild(s);
}
injectBounceCSS();

function bounceElement(el){
  if (!el) return;
  el.classList.add("bounce");
  setTimeout(()=> el.classList.remove("bounce"), 260);
}

/* -------------------------
   MODAL CONFIRMATION
   ------------------------- */
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
  // hook modal buttons bounce
  const btnCancel = document.getElementById("btnCancelNav");
  const btnConfirm = document.getElementById("btnConfirmNav");
  btnCancel.addEventListener("click", () => { bounceElement(btnCancel); /* hide handled in showConfirm */ });
  btnConfirm.addEventListener("click", () => { bounceElement(btnConfirm); /* hide handled in showConfirm */ });
}
createConfirmModal();

function showConfirm(callback) {
  const overlay = document.getElementById("confirmOverlay");
  const btnCancel = document.getElementById("btnCancelNav");
  const btnConfirm = document.getElementById("btnConfirmNav");

  overlay.style.visibility = "visible";
  overlay.style.opacity = "1";

  btnCancel.onclick = () => {
    bounceElement(btnCancel);
    overlay.style.opacity = "0";
    setTimeout(()=> overlay.style.visibility = "hidden", 180);
  };

  btnConfirm.onclick = () => {
    bounceElement(btnConfirm);
    overlay.style.opacity = "0";
    setTimeout(()=> {
      overlay.style.visibility = "hidden";
      UNSAVED = false;
      callback && callback();
    }, 180);
  };
}

/* -------------------------
   GUARDED NAVIGATION HELPERS
   ------------------------- */
function guardedNavigate(url) {
  if (!UNSAVED) {
    location.href = url;
    return;
  }
  showConfirm(() => { location.href = url; });
}

/* Hook FAB: bounce then guardedNavigate (small delay to show bounce) */
function hookFAB() {
  const fab = document.querySelector(".fab-home");
  if (!fab) return;
  fab.addEventListener("click", (e) => {
    e.preventDefault();
    bounceElement(fab);
    setTimeout(()=> guardedNavigate("home.html"), 90);
  });
}

/* Hook navbar items: bounce + guarded navigate */
function hookNavbar() {
  const items = document.querySelectorAll(".nav-item");
  items.forEach(item => {
    // prevent double-attach
    if (item.__navHooked) return;
    item.__navHooked = true;
    item.addEventListener("click", (e) => {
      e.preventDefault();
      // determine target
      const onclick = item.getAttribute("onclick") || "";
      const target = (onclick.match(/go\('(.+?)'\)/) || [])[1] || item.dataset.target;
      bounceElement(item);
      setTimeout(()=> { if (target) guardedNavigate(target); }, 90);
    });
  });
}

/* Hook menu grid items that have data-target or onclick patterns.
   For home.html specific items it is recommended to use bounceThenNavigate helper,
   but this function also attaches if menu-item elements exist. */
function hookMenuItems() {
  const menus = document.querySelectorAll(".menu-item");
  menus.forEach(m => {
    if (m.__menuHooked) return;
    m.__menuHooked = true;
    m.addEventListener("click", (e) => {
      // if element uses inline onclick guardedNavigate already, let it run but add bounce
      bounceElement(m);
      // If data-target present, navigate guarded after short delay
      const dt = m.dataset.target;
      if (dt) {
        setTimeout(()=> guardedNavigate(dt), 90);
      } else {
        // if inline onclick used, allow it to call guardedNavigate immediately (it will run)
      }
    });
  });
}

/* Provide helper for pages: bounceThenNavigate(elem, url) */
function bounceThenNavigate(el, url) {
  if (el) bounceElement(el);
  setTimeout(()=> guardedNavigate(url), 90);
}

/* Back button handling: confirm only when UNSAVED = true */
window.addEventListener("popstate", (e) => {
  if (UNSAVED) {
    e.preventDefault();
    showConfirm(() => history.back());
    history.pushState(null, "", location.href);
  }
});

/* Prevent accidental system back by pushing state */
history.pushState(null, "", location.href);
