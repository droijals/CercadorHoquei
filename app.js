
const $ = s => document.querySelector(s);
const norm = s => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();

const I18N = {
  ca: {
    sourceHeader: "Calendaris contrastats amb JOK.cat",
    season: "TEMPORADA 2026–27",
    headline: "Les categories de la UE Horta<br><em>i els seus clubs rivals</em>",
    lead: "Cerca per club, ciutat o localitat. Obre qualsevol fitxa i calcula la ruta des de la teva ubicació amb Google Maps.",
    searchPlaceholder: "Cerca per club, ciutat, localitat o adreça…",
    categories: "categories",
    teamsListed: "equips llistats",
    seasonShort: "temporada",
    sourcesTitle: "Fonts i criteri",
    sourcesText: "Les categories s'han contrastat amb el llistat de competicions 2026–27 de JOK.cat i els partits programats de la Pista UE Horta. Les adreces només es mostren com a exactes quan s'han pogut contrastar amb dades publicades; en els altres casos s'ofereix una cerca de Google Maps sense inventar una adreça.",
    staticText: "Aplicació 100 % estàtica: no requereix servidor ni base de dades.",
    footer: "Hoquei Patins · 2026–2027",
    masculine: "Masculí",
    feminine: "Femení",
    teams: "equips",
    matching: "coincidents",
    verified: "Adreça contrastada",
    pending: "Adreça pendent de contrastar",
    exactPending: "Adreça exacta pendent de verificació.",
    maps: "↗ Obre la ruta a Google Maps",
    noResults: "No s'ha trobat cap club o localitat."
  },
  es: {
    sourceHeader: "Calendarios contrastados con JOK.cat",
    season: "TEMPORADA 2026–27",
    headline: "Las categorías de la UE Horta<br><em>y sus clubes rivales</em>",
    lead: "Busca por club, ciudad o localidad. Abre cualquier ficha y calcula la ruta desde tu ubicación con Google Maps.",
    searchPlaceholder: "Busca por club, ciudad, localidad o dirección…",
    categories: "categorías",
    teamsListed: "equipos listados",
    seasonShort: "temporada",
    sourcesTitle: "Fuentes y criterio",
    sourcesText: "Las categorías se han contrastado con el listado de competiciones 2026–27 de JOK.cat y los partidos programados de la Pista UE Horta. Las direcciones solo se muestran como exactas cuando han podido contrastarse con datos publicados; en los demás casos se ofrece una búsqueda de Google Maps sin inventar una dirección.",
    staticText: "Aplicación 100 % estática: no requiere servidor ni base de datos.",
    footer: "Hoquei Patins · 2026–2027",
    masculine: "Masculino",
    feminine: "Femenino",
    teams: "equipos",
    matching: "coincidentes",
    verified: "Dirección contrastada",
    pending: "Dirección pendiente de contrastar",
    exactPending: "Dirección exacta pendiente de verificación.",
    maps: "↗ Abrir la ruta en Google Maps",
    noResults: "No se ha encontrado ningún club o localidad."
  }
};

let lang = localStorage.getItem("hockeyHortaLang") || "ca";
let t = I18N[lang];

function applyLanguage() {
  t = I18N[lang];
  document.documentElement.lang = lang;
  document.title = lang === "ca" ? "Hoquei Patins · Daniel Roijals · 2026–27" : "Hoquei Patins · Daniel Roijals · 2026–27";
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (t[key]) el.innerHTML = t[key];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (t[key]) el.placeholder = t[key];
  });
  document.querySelectorAll(".lang-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.lang === lang));
  localStorage.setItem("hockeyHortaLang", lang);
  render($("#search")?.value || "");
}

function initials(n) {
  return n.replace(/[^A-Za-zÀ-ÿ0-9 ]/g,"").split(/\s+/).filter(Boolean).slice(0,3).map(x=>x[0]).join("").toUpperCase();
}

const teams = DATA.categories.flatMap(c=>c.teams);
$("#catCount").textContent = DATA.categories.length;
$("#clubCount").textContent = new Set(teams.map(x=>x.name)).size;

function render(q="") {
  const query = norm(q.trim());
  const root = $("#results");
  root.innerHTML = "";
  let shown = 0;

  DATA.categories.forEach((cat,i) => {
    const ts = cat.teams.filter(x =>
      !query || norm([x.name,x.city,x.address,cat.name,cat.gender].join(" ")).includes(query)
    );
    if (!ts.length) return;

    shown++;
    const gender = cat.gender === "Masculí" ? t.masculine :
                   cat.gender === "Femení" ? t.feminine : cat.gender;
    const article = document.createElement("article");
    article.className = "category" + (query ? " open" : "");
    article.innerHTML = `
      <button class="cat-head">
        <span class="num">${String(i+1).padStart(2,"0")}</span>
        <span class="cat-title">
          <strong>${cat.name}</strong>
          <small>${gender} · ${ts.length} ${t.teams}${query ? " " + t.matching : ""}</small>
        </span>
        <span class="chev">⌄</span>
      </button>
      <div class="teams">
        ${ts.map(x => `
          <div class="team">
            <div class="shield">${x.logo ? `<img src="${x.logo}" alt="${lang==="ca"?"Escut":"Escudo"} de ${x.name}" loading="lazy">` : initials(x.name)}</div>
            <div class="teaminfo">
              <strong>${x.name}</strong>
              <small>${x.address || t.exactPending}</small>
              <span class="status ${x.verified ? "ok" : "pending"}">${x.verified ? t.verified : t.pending}</span>
              <a class="maps" href="${x.maps}" target="_blank" rel="noopener">${t.maps}</a>
            </div>
          </div>
        `).join("")}
      </div>`;
    article.querySelector(".cat-head").onclick = () => article.classList.toggle("open");
    root.appendChild(article);
  });

  if (!shown) root.innerHTML = `<div class="empty">${t.noResults}</div>`;
}

document.querySelectorAll(".lang-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    lang = btn.dataset.lang;
    applyLanguage();
  });
});

$("#search").addEventListener("input", e => render(e.target.value));
document.addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    $("#search").focus();
  }
});

applyLanguage();
