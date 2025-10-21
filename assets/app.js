// Shared App JS (414x896 mobile webapp)
const KEY = {
  guests:'evt.guests',
  missions:'evt.missions',
  likes:'evt.likes',
  stamps:'evt.stamps',
  alerts:'evt.alerts',
  me:'evt.me'
};

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const toast = (t) => {
  let el = document.getElementById('toast');
  if(!el){ el = document.createElement('div'); el.id='toast'; el.className='toast'; document.body.appendChild(el); }
  el.textContent=t; el.classList.remove('hidden'); setTimeout(()=>el.classList.add('hidden'), 2200);
};

function lsGet(k, fb){ try{ const v = JSON.parse(localStorage.getItem(k)); return v ?? fb; }catch(e){ return fb; } }
function lsSet(k, v){ localStorage.setItem(k, JSON.stringify(v)); }

// Demo seeds
const demoMissions = [
  {id:'m1', title:'포토존 사진 찍기'},
  {id:'m2', title:'바에서 논알콜 음료 받기'},
  {id:'m3', title:'신규 친구 3명과 악수'},
  {id:'m4', title:'커플 미션 질문 1개'}
];

const LAST = ['김','이','박','최','정','강','조','윤','장','임','한','오','서','신','권','황','안','송','류','홍'];
const FIRST_A = ['민','서','지','유','도','하','윤','진','예','준','지','수','주','연','태','현','가','나','다','라'];
const FIRST_B = ['수','연','호','윤','우','민','아','현','빈','영','훈','경','혁','진','해','린','율','훈','택','솔'];
function makeName(i){
  const l = LAST[i % LAST.length];
  const a = FIRST_A[(i*3) % FIRST_A.length];
  const b = FIRST_B[(i*7) % FIRST_B.length];
  return l + a + b;
}
function phoneFromIndex(i){
  const base = (10000000 + i).toString().padStart(8,'0');
  return '010' + base;
}
function genDemoGuests(n=300){
  const arr = [];
  for(let i=1;i<=n;i++){
    const gender = (i%2===0?'F':'M');
    arr.push({ number:i, name:makeName(i), phone: phoneFromIndex(i), gender });
  }
  return arr;
}

// Initializers
function ensureDefaults(){
  if(!lsGet(KEY.guests)) lsSet(KEY.guests, [
    {number:1, name:'김민수', phone:'01012345678', gender:'M'},
    {number:2, name:'이서연', phone:'01023456789', gender:'F'}
  ]);
  if(!lsGet(KEY.missions)) lsSet(KEY.missions, demoMissions);
  if(!lsGet(KEY.likes)) lsSet(KEY.likes, []);
  if(!lsGet(KEY.stamps)) lsSet(KEY.stamps, []);
  if(!lsGet(KEY.alerts)) lsSet(KEY.alerts, []);
}
function getMe(){ return lsGet(KEY.me); }

function mobileGuard(){
  const guard = document.getElementById('mobileGuard');
  if(!guard){
    const div = document.createElement('div');
    div.id='mobileGuard';
    div.innerHTML = `<div class="inner"><h2 style="margin-top:0">모바일 전용 화면</h2><p class="muted">이 페이지는 휴대폰(폭 414px 권장)에 최적화되어 있어요.<br>휴대폰으로 접속하거나 브라우저 폭을 줄여주세요.</p></div>`;
    document.body.appendChild(div);
  }
  function toggle(){ document.getElementById('mobileGuard').style.display = (window.innerWidth > 600 ? 'block' : 'none'); }
  toggle(); window.addEventListener('resize', toggle);
}


function renderNav(active){
  const tabs = [
    {
      href:'home.html', key:'home', label:'홈',
      iconActive:'assets/img/home-active.png',
      iconInactive:'assets/img/home-inactive.png'
    },
    {
      href:'likes.html', key:'likes', label:'호감',
      iconActive:'assets/img/heart-active.png',
      iconInactive:'assets/img/heart-inactive.png'
    },
    {
      href:'stamps.html', key:'stamps', label:'스탬프',
      iconActive:'assets/img/stamp-active.png',
      iconInactive:'assets/img/stamp-inactive.png'
    },
    {
      href:'alerts.html', key:'alerts', label:'알림',
      iconActive:'assets/img/bell-active.png',
      iconInactive:'assets/img/bell-inactive.png'
    }
  ];
  const adminParam = (new URL(location.href)).searchParams.get('admin')==='1';
  const nav = document.createElement('div');
  nav.className='nav';
  nav.innerHTML = `<div class="container"><div class="tabs">`+
    tabs.map(t=>{
      const isActive = active===t.key;
      const icon = isActive ? t.iconActive : t.iconInactive;
      const aria = isActive ? ' aria-current="page"' : '';
      return `<a class="tab ${isActive?'active':''}" href="${t.href}${adminParam?'?admin=1':''}"${aria}>
        <span class="ico"><img src="${icon}" alt="${t.label}" loading="lazy"></span>
        <span class="lbl">${t.label}</span>
      </a>`;
    }).join('')+
    `<a class="tab ${active==='admin'?'active':''}" href="admin.html${adminParam?'?admin=1':''}" style="${adminParam?'':'display:none'}"${active==='admin'?' aria-current="page"':''}>
       <span class="ico"><img src="assets/img/admin${active==='admin'?'-active':''}.png" alt="관리" loading="lazy"></span>
       <span class="lbl">관리</span>
     </a>`+
    `</div></div>`;
  document.body.appendChild(nav); // 하단 고정 바: body 끝에 추가
}

function requireLoginOrRedirect(){
  if(!getMe()){ location.href = 'login.html'; }
}

// Expose for pages
window.App = { KEY, lsGet, lsSet, genDemoGuests, getMe, ensureDefaults, mobileGuard, renderNav, toast };
