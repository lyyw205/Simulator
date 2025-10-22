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









// === Demo Seeder: Guests + Likes ===
(() => {
  const hasApp = typeof window.App !== 'undefined';
  const KEY = hasApp ? App.KEY : {
    guests:'evt.guests', likes:'evt.likes', stamps:'evt.stamps', missions:'evt.missions', alerts:'evt.alerts', me:'evt.me'
  };
  const lsGet = hasApp ? App.lsGet : (k, fb)=>{ try{const v=localStorage.getItem(k); return v?JSON.parse(v):fb;}catch(e){return fb;} };
  const lsSet = hasApp ? App.lsSet : (k, v)=>localStorage.setItem(k, JSON.stringify(v));
  const toast = (t)=> (hasApp && App.toast) ? App.toast(t) : console.log('[seed]', t);

  // 1) 게스트 시드 (App.genDemoGuests 있으면 사용)
  function seedGuests(n=300, {overwrite=false}={}){
    const cur = lsGet(KEY.guests, []);
    if (cur.length && !overwrite) { toast(`guests 유지: ${cur.length}명`); return cur; }
    const arr = (hasApp && App.genDemoGuests) 
      ? App.genDemoGuests(n) 
      : Array.from({length:n}, (_,i)=>({ number:i+1, name:`게스트${String(i+1).padStart(3,'0')}`, phone:`010${String(10000000+i+1).padStart(8,'0')}`, gender: ((i+1)%2?'M':'F') }));
    lsSet(KEY.guests, arr);
    toast(`guests 시드 완료: ${arr.length}명`);
    return arr;
  }

  // 2) 호감 시드
  // - nLikes: 생성 목표 (실제는 상호 생성 시 1~2개씩 늘어남)
  // - mutualRatio: 상호(양방향)로 만들 비율(0~1)
  // - days: 최근 n일 내 무작위 시간으로 at 설정
  // - clear: 기존 likes를 지울지 여부
  function seedLikes({nLikes=6000, mutualRatio=0.4, days=3, clear=true}={}){
    const guests = lsGet(KEY.guests, []);
    if (!guests.length) { throw new Error('guests가 비어 있음. 먼저 seedGuests 호출'); }
    const gnums = guests.map(g=>g.number);

    let likes = clear ? [] : (lsGet(KEY.likes, [])||[]);
    const now = Date.now();
    const span = days*24*60*60*1000;

    const pairSet = new Set(likes.map(l => `${l.from}>${l.to}`));

    const rnd = (arr)=>arr[Math.floor(Math.random()*arr.length)];
    const randomPair = ()=>{
      let from, to;
      do { from = rnd(gnums); to = rnd(gnums); } while(from===to);
      return [from,to];
    };

    let i=0;
    while (i < nLikes) {
      let [from, to] = randomPair();
      // 중복 단방향은 건너뛰기
      if (pairSet.has(`${from}>${to}`)) continue;

      const baseAt = now - Math.floor(Math.random()*span);

      if (Math.random() < mutualRatio && !pairSet.has(`${to}>${from}`)) {
        // 상호 생성 (2건)
        likes.push({ from, to, at: baseAt });
        likes.push({ from: to, to: from, at: baseAt + Math.floor(Math.random()*600000) }); // +최대 10분
        pairSet.add(`${from}>${to}`); pairSet.add(`${to}>${from}`);
        i += 2;
      } else {
        // 단방향 1건
        likes.push({ from, to, at: baseAt });
        pairSet.add(`${from}>${to}`);
        i += 1;
      }
    }

    // 시간순 정렬(오래된 → 최신)
    likes.sort((a,b)=>a.at-b.at);
    lsSet(KEY.likes, likes);
    toast(`likes 시드 완료: ${likes.length}건 (요청 ${nLikes}, 상호비율 ~${mutualRatio*100|0}%)`);
    return likes;
  }

  // 3) 한 번에 시드
  function seedAll({guests=300, likes=6000, mutualRatio=0.4, days=3, overwriteGuests=false, clearLikes=true}={}){
    const g = seedGuests(guests, {overwrite: overwriteGuests});
    const l = seedLikes({nLikes: likes, mutualRatio, days, clear: clearLikes});
    toast(`완료: guests=${g.length}, likes=${l.length}`);
    return {g, l};
  }

  // 4) 초기화 헬퍼
  function resetAll(){
    ['guests','likes','stamps','missions','alerts','me'].forEach(k => localStorage.removeItem(KEY[k]));
    toast('localStorage 초기화 완료');
  }

  // 전역에 잠깐 노출해두면 편함
  window.__seed = { seedGuests, seedLikes, seedAll, resetAll };
  toast('시더 준비됨: __seed.seedAll({ guests: 300, likes: 6000 }) 호출');

})();






//
function renderNavAlt(active, hrefs = {}) {
  // 1) 라우트 설정
  const defaults = {
    home:   'a-home.html',
    likes:  'a-likes.html',
    stamps: 'a-stamp.html',
    alerts: 'a-alerts.html',
  };
  const H = { ...defaults, ...hrefs };

  // 2) 현재 페이지로 active 자동 결정 (매칭 규칙: 끝나는 파일명)
  function autoActive() {
    const path = location.pathname.split('/').pop(); // ex) a-alerts.html
    // path가 없으면 해시 라우팅 등 고려
    for (const k of Object.keys(H)) {
      // 완전 일치 또는 파일명 끝이 일치하면 매칭
      if (H[k] === path || path.endsWith(H[k])) return k;
    }
    return null;
  }
  const cur = active || autoActive();

  const tabs = [
    { key:'home',   label:'홈',    iconActive:'assets/img/home-active.png',   iconInactive:'assets/img/home-inactive.png' },
    { key:'likes',  label:'호감',  iconActive:'assets/img/heart-active.png',  iconInactive:'assets/img/heart-inactive.png' },
    { key:'stamps', label:'스탬프',iconActive:'assets/img/stamp-active.png',  iconInactive:'assets/img/stamp-inactive.png' },
    { key:'alerts', label:'알림',  iconActive:'assets/img/bell-active.png',   iconInactive:'assets/img/bell-inactive.png' },
  ];

  // 기존 nav 제거(중복 방지)
  document.querySelectorAll('.nav').forEach(el => el.remove());

  // 3) 렌더
  const nav = document.createElement('div');
  nav.className = 'nav';
  nav.innerHTML =
    `<div class="container"><div class="tabs">` +
    tabs.map(t => {
      const isActive = cur === t.key; // 자동/수동 판별 결과
      const icon = isActive ? t.iconActive : t.iconInactive;
      const aria = isActive ? ' aria-current="page"' : '';
      const href = H[t.key] || '#';
      return `<a class="tab ${isActive ? 'active' : ''}" href="${href}"${aria}>
        <span class="ico"><img src="${icon}" alt="${t.label}" loading="lazy"></span>
        <span class="lbl">${t.label}</span>
      </a>`;
    }).join('') +
    `</div></div>`;
  document.body.appendChild(nav);
}

function requireLoginOrRedirect(){
  if(!getMe()){ location.href = 'login.html'; }
}

window.App = Object.assign(window.App || {}, {
  KEY, lsGet, lsSet, genDemoGuests, getMe,
  ensureDefaults, mobileGuard, renderNav, renderNavAlt, toast
});
