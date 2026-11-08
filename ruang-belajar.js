// Isi dengan URL Web App Apps Script yang berakhiran /exec.
const API_BASE_URL = "PASTE_WEB_APP_EXEC_URL_HERE";

const grid = document.getElementById("programGrid");
const count = document.getElementById("programCount");
const search = document.getElementById("programSearch");
const refresh = document.getElementById("refreshButton");
const notice = document.getElementById("apiNotice");
let products = [];

document.getElementById("currentYear").textContent = new Date().getFullYear();
const menu = document.getElementById("menuToggle");
const nav = document.getElementById("navLinks");
menu.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menu.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

// JSONP memerlukan Apps Script mengembalikan callback(...) untuk parameter callback.
function api(action) {
  return new Promise((resolve, reject) => {
    if (API_BASE_URL.includes("PASTE_WEB_APP")) return reject(new Error("URL API belum diisi di ruang-belajar.js."));
    const cb = "sdl_cb_" + Date.now() + "_" + Math.floor(Math.random() * 99999);
    const script = document.createElement("script");
    const timer = setTimeout(() => { clean(); reject(new Error("Koneksi API melewati batas waktu.")); }, 15000);
    function clean() { clearTimeout(timer); delete window[cb]; script.remove(); }
    window[cb] = data => { clean(); resolve(data); };
    script.onerror = () => { clean(); reject(new Error("API tidak dapat dihubungi. Periksa URL dan deployment Apps Script.")); };
    const sep = API_BASE_URL.includes("?") ? "&" : "?";
    script.src = API_BASE_URL + sep + "action=" + encodeURIComponent(action) + "&callback=" + encodeURIComponent(cb);
    document.head.appendChild(script);
  });
}

function render(list) {
  grid.innerHTML = "";
  count.textContent = list.length + " program tersedia";
  if (!list.length) {
    grid.innerHTML = `<div class="state"><div class="empty-icon">▤</div><h3>Program belum tersedia</h3><p>Belum ada program yang dipublikasikan saat ini. Silakan kembali lagi nanti.</p></div>`;
    return;
  }
  list.forEach(p => {
    const card = document.createElement("article");
    card.className = "program-card";
    const level = [p.target_level, p.target_grade ? "Kelas " + p.target_grade : ""].filter(Boolean).join(" · ");
    card.innerHTML = `<div class="tags"><span class="tag">${esc(p.category || "PROGRAM")}</span><span class="tag gold-tag">${esc(level || "Pembelajaran")}</span></div>
      <h3>${esc(p.product_name || "Program Pembelajaran")}</h3>
      <p>${esc(p.description || "Program pembelajaran terarah dari Suryantara Education.")}</p>
      <div class="meta"><span>▤ ${Number(p.total_lessons || 0)} pertemuan</span><span>✓ Terstruktur</span></div>
      <a class="card-link" href="#" aria-label="Detail ${esc(p.product_name)}">Pelajari program →</a>`;
    grid.appendChild(card);
  });
}
function filter() {
  const q = search.value.trim().toLocaleLowerCase("id");
  render(products.filter(p => [p.product_name,p.category,p.target_level,p.target_grade,p.description].join(" ").toLocaleLowerCase("id").includes(q)));
}
async function load() {
  notice.hidden = true; refresh.disabled = true; count.textContent = "Memuat program…";
  grid.innerHTML = `<div class="state"><span class="loader"></span><p>Menghubungkan ke katalog pembelajaran…</p></div>`;
  try {
    const result = await api("getProducts");
    if (!result || result.success !== true || !Array.isArray(result.data)) throw new Error(result?.message || "Respons API tidak sesuai.");
    products = result.data; filter();
  } catch (e) {
    count.textContent = "Koneksi belum tersedia";
    grid.innerHTML = `<div class="state"><div class="empty-icon">!</div><h3>Program belum dapat dimuat</h3><p>${esc(e.message)}</p></div>`;
    notice.textContent = "Periksa URL API dan dukungan JSONP pada Apps Script. Petunjuk ada di README-INTEGRASI.txt.";
    notice.hidden = false;
  } finally { refresh.disabled = false; }
}
search.addEventListener("input", filter);
refresh.addEventListener("click", load);
load();
