const $=s=>document.querySelector(s),norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const I18N={
ca:{source:'Calendari de competició de la temporada 2026–27',season:'TEMPORADA 2026–27',headline:'Les categories de la UE Horta<br><em>i els seus clubs rivals</em>',lead:'Cerca per club, ciutat o localitat. Obre qualsevol fitxa i calcula la ruta des de la teva ubicació amb Google Maps.',searchPlaceholder:'Cerca per club, ciutat, localitat o adreça…',searchButton:'Cercar',categories:'categories',teamsListed:'equips llistats',seasonShort:'temporada',sourcesTitle:'Fonts i criteri',sourcesText:"Les categories s'han contrastat amb la informació de competició disponible per a la temporada 2026–27. Les adreces i telèfons s'han incorporat només quan s'han pogut contrastar amb una font publicada.",phone:'Telèfon no disponible',maps:'↗ Obre la ruta a Google Maps',none:"No s'ha trobat cap club o localitat.",masc:'Masculí',fem:'Femení',searchResults:'Resultats de la cerca',footer:'Hoquei Patins · 2026 - 2027',staticText:'Aplicació 100 % estàtica: no requereix servidor ni base de dades.'},
es:{source:'Calendario de competición de la temporada 2026–27',season:'TEMPORADA 2026–27',headline:'Las categorías de la UE Horta<br><em>y sus clubes rivales</em>',lead:'Busca por club, ciudad o localidad. Abre cualquier ficha y calcula la ruta desde tu ubicación con Google Maps.',searchPlaceholder:'Busca por club, ciudad, localidad o dirección…',searchButton:'Buscar',categories:'categorías',teamsListed:'equipos listados',seasonShort:'temporada',sourcesTitle:'Fuentes y criterio',sourcesText:'Las categorías se han contrastado con la información de competición disponible para la temporada 2026–27. Las direcciones y teléfonos solo se incorporan cuando se han podido contrastar con una fuente publicada.',phone:'Teléfono no disponible',maps:'↗ Abrir la ruta en Google Maps',none:'No se ha encontrado ningún club o localidad.',masc:'Masculino',fem:'Femenino',searchResults:'Resultados de la búsqueda',footer:'Hoquei Patins · 2026 - 2027',staticText:'Aplicación 100 % estática: no requiere servidor ni base de datos.'}
};
let lang=localStorage.getItem('hockeyHortaLang')||'ca',t=I18N[lang];
const teams=DATA.categories.flatMap(c=>c.teams);

function clubKeyFromTeam(x){
  const base=String(x.clubName||x.name||'').trim();
  return norm(base)
    .replace(/\s+[a-z]$/i,'')
    .replace(/\s+(a|b|c|d|e|f|g)$/i,'')
    .trim();
}
function pickBest(values){
  const a=values.map(v=>String(v||'').trim()).filter(Boolean);
  if(!a.length)return '';
  const count=new Map();
  a.forEach(v=>count.set(v,(count.get(v)||0)+1));
  return [...count.entries()].sort((x,y)=>y[1]-x[1]||y[0].length-x[0].length)[0][0];
}
function buildClubs(){
  const map=new Map();
  DATA.categories.forEach(cat=>cat.teams.forEach(x=>{
    const key=clubKeyFromTeam(x);
    if(!key)return;
    let c=map.get(key);
    if(!c){c={key,name:'',aliases:new Set(),cities:new Set(),addresses:new Set(),phones:new Set(),logos:new Set(),maps:new Set()};map.set(key,c)}
    [x.clubName,x.name].filter(Boolean).forEach(v=>c.aliases.add(String(v).trim()));
    if(x.city)c.cities.add(String(x.city).trim());
    if(x.address)c.addresses.add(String(x.address).trim());
    if(x.phone)c.phones.add(String(x.phone).trim());
    if(x.logo)c.logos.add(String(x.logo).trim());
    if(x.maps)c.maps.add(String(x.maps).trim());
  }));
  return [...map.values()].map(c=>({
    ...c,
    name:pickBest([...c.aliases].filter(v=>!/[ ]+[A-F]$/i.test(v)))||pickBest([...c.aliases]),
    city:pickBest([...c.cities]),
    address:pickBest([...c.addresses]),
    phone:pickBest([...c.phones]),
    logo:[...c.logos][0]||'',
    maps:[...c.maps][0]||''
  }));
}
const clubs=buildClubs();
$('#catCount').textContent=DATA.categories.length;
$('#clubCount').textContent=clubs.length;

function apply(){t=I18N[lang];document.documentElement.lang=lang;document.querySelectorAll('[data-i18n]').forEach(e=>e.innerHTML=t[e.dataset.i18n]??'');document.querySelectorAll('[data-i18n-placeholder]').forEach(e=>e.placeholder=t[e.dataset.i18nPlaceholder]??'');document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));localStorage.setItem('hockeyHortaLang',lang);render($('#search').value)}
function initials(n){return String(n).replace(/[^A-Za-zÀ-ÿ0-9 ]/g,'').split(/\s+/).filter(Boolean).slice(0,3).map(x=>x[0]).join('').toUpperCase()}
function searchableClub(c){return norm([c.name,...c.aliases,...c.cities,...c.addresses,...c.phones].filter(Boolean).join(' '))}
function card(c){return `<article class="club-card"><div class="shield">${c.logo?`<img src="${esc(c.logo)}" alt="${lang==='ca'?'Escut':'Escudo'} de ${esc(c.name)}" loading="lazy">`:esc(initials(c.name))}</div><div class="club-info"><h3>${esc(c.name)}</h3><div class="club-address">${esc(c.address||'—')}</div>${c.phone?`<a class="phone" href="tel:${esc(c.phone.replace(/[^0-9+]/g,''))}">☎ ${esc(c.phone)}</a>`:`<span class="phone unavailable">☎ ${t.phone}</span>`}${c.maps?`<a class="maps" href="${esc(c.maps)}" target="_blank" rel="noopener noreferrer">${t.maps}</a>`:''}</div></article>`}
function render(q=''){
  const query=norm(q),root=$('#results');root.innerHTML='';
  if(query){
    const matches=clubs.filter(c=>searchableClub(c).includes(query));
    if(!matches.length){root.innerHTML=`<div class="empty">${t.none}</div>`;return}
    root.innerHTML=`<div class="search-heading">${t.searchResults} · ${matches.length}</div><div class="search-results">${matches.map(card).join('')}</div>`;
    return;
  }
  DATA.categories.forEach((cat,i)=>{
    const ts=cat.teams,gender=cat.gender==='Masculí'?t.masc:cat.gender==='Femení'?t.fem:cat.gender;
    const a=document.createElement('article');a.className='category';
    a.innerHTML=`<button class="cat-head" type="button"><span class="num">${String(i+1).padStart(2,'0')}</span><span class="cat-title"><strong>${esc(cat.name)}</strong><small>${esc(gender)} · ${ts.length} ${t.teamsListed}</small></span><span class="chev">⌄</span></button><div class="teams">${ts.map(x=>`<div class="team"><div class="shield">${x.logo?`<img src="${esc(x.logo)}" alt="${lang==='ca'?'Escut':'Escudo'} de ${esc(x.clubName||x.name)}" loading="lazy">`:esc(initials(x.clubName||x.name))}</div><div class="teaminfo"><strong>${esc(x.clubName||x.name)}</strong><small class="address">${esc(x.address||'—')}</small>${x.phone?`<a class="phone" href="tel:${esc(x.phone.replace(/[^0-9+]/g,''))}">☎ ${esc(x.phone)}</a>`:`<small class="phone unavailable">☎ ${t.phone}</small>`}<a class="maps" href="${esc(x.maps)}" target="_blank" rel="noopener noreferrer">${t.maps}</a></div></div>`).join('')}</div>`;
    a.querySelector('.cat-head').onclick=()=>a.classList.toggle('open');root.appendChild(a)
  });
}
function doSearch(){render($('#search').value);$('#results').scrollIntoView({behavior:'smooth',block:'start'})}
document.querySelectorAll('.lang-btn').forEach(b=>b.addEventListener('click',()=>{lang=b.dataset.lang;apply()}));
$('#search').addEventListener('input',e=>render(e.target.value));
$('#search').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();doSearch()}});
$('#searchForm')?.addEventListener('submit',e=>{e.preventDefault();doSearch()});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#search').focus();$('#search').select()}});
apply();
