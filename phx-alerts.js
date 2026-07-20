/* ══════════════════════════════════════════════════════════════════
   Phoenix shared periodic-events + alerts engine.
   One file, reused by the Event Alerts tool and by the small banner
   snippet dropped into state/alliance/profile pages.
   ══════════════════════════════════════════════════════════════════ */
(function(){

// Each event: cadenceDays (null = irregular, leader must update manually every time),
// legions (true = Foundry/Canyon-style, separate date+time per legion),
// stages: offsetDays relative to the main occurs_at (negative = before, 0 = the day itself).
var EVENTS = [
  {key:'bear',        name:'Bear Hunt',              icon:'🐻', cadenceDays:2,  legions:false,
    stages:[{offset:0, label:'Trap window'}]},
  {key:'foundry',      name:'Foundry Battle',         icon:'🏭', cadenceDays:14, legions:true,
    stages:[{offset:-6,label:'Voting opens'},{offset:-4,label:'Registration opens'},{offset:-2,label:'Matchmaking'},{offset:0,label:'Battle'}]},
  {key:'canyon',       name:'Canyon Clash',           icon:'🏞️', cadenceDays:30, legions:true,
    stages:[{offset:-5,label:'Voting (Mon–Tue)'},{offset:-3,label:'Registration (Wed–Thu)'},{offset:-1,label:'Matchmaking (Fri)'},{offset:0,label:'Battle (Sat)'}]},
  {key:'svs',          name:'SvS – State of Power',   icon:'⚔️', cadenceDays:30, legions:false,
    stages:[{offset:'saving',label:'Start saving!'},{offset:-8,label:'Matchmaking begins'},{offset:-6,label:'Prep phase begins'},{offset:0,label:'Battle day'}]},
  {key:'koi',          name:'King of Icefield',       icon:'🧊', cadenceDays:28, legions:false,
    stages:[{offset:0,label:'Event starts'}]},
  {key:'championship', name:'Alliance Championship',  icon:'🏆', cadenceDays:7,  legions:false,
    stages:[{offset:0,label:'Event day'}]},
  {key:'mercenary',    name:'Mercenary Prestige',     icon:'💰', cadenceDays:30, legions:false,
    stages:[{offset:0,label:'Event window'}]},
  {key:'flameandfang', name:'Flame and Fang',         icon:'🔥', cadenceDays:14, legions:false,
    stages:[{offset:-1,label:"Don't claim your 8:00 UTC intel today!"},{offset:0,label:'Event starts (Mon–Tue)'}]},
  {key:'snowbusters',  name:'Snowbusters',            icon:'❄️', cadenceDays:30, legions:false,
    stages:[{offset:0,label:'Event starts'}]},
  {key:'tundratrade',  name:'Tundra Trade Route',     icon:'🚚', cadenceDays:30, legions:false,
    stages:[{offset:0,label:'Event starts (with Alliance Showdown)'}]},
  {key:'tundratrading',name:'Tundra Trading Station', icon:'🏪', cadenceDays:null, legions:false,
    stages:[{offset:0,label:'Event window'}]},
  {key:'tundraarms',   name:'Tundra Arms League',     icon:'🗡️', cadenceDays:null, legions:false,
    stages:[{offset:0,label:'Replaces Foundry this season'}]},
  {key:'crazyjoe',     name:'Crazy Joe',              icon:'🏹', cadenceDays:14, legions:false,
    stages:[{offset:0,label:'R4/R5-scheduled window'}]},
  {key:'frostfire',    name:'Frostfire Mine',         icon:'⛏️', cadenceDays:14, legions:false,
    stages:[{offset:0,label:'Event window (30 min)'}]},
  {key:'hallofchiefs', name:'Hall of Chiefs',         icon:'👑', cadenceDays:null, legions:false,
    stages:[{offset:0,label:'Event window'}]},
  {key:'arena',        name:'Arena',                  icon:'🎯', cadenceDays:1,  legions:false,
    stages:[{offset:0,label:'Daily reset'}]}
];

// In-game localized event names — VERIFIED against the official Whiteout Survival wiki's
// language editions (en/es/fr/de/pt/ko). For the other 8 languages in Phoenix, no reliable
// source was found, so the English name is used as a safe fallback rather than guessing —
// have someone confirm in-client before treating those as exact.
var EVENT_NAMES={
en:{bear:'Bear Hunt',foundry:'Foundry Battle',canyon:'Canyon Clash',svs:'SvS – State of Power',koi:'King of Icefield',championship:'Alliance Championship',mercenary:'Mercenary Prestige',flameandfang:'Flame and Fang',snowbusters:'Snowbusters',tundratrade:'Tundra Trade Route',tundratrading:'Tundra Trading Station',tundraarms:'Tundra Arms League',crazyjoe:'Crazy Joe',frostfire:'Frostfire Mine',hallofchiefs:'Hall of Chiefs',arena:'Arena'},
es:{bear:'Cacería del Oso',foundry:'Batalla de la Fundición',canyon:'Choque en el Cañón',svs:'Estado de Poder (SvS)',koi:'Rey del Campo de Hielo',championship:'Enfrentamiento de Alianzas',mercenary:'Mercenary Prestige',flameandfang:'Flame and Fang',snowbusters:'Snowbusters',tundratrade:'Ruta Comercial de la Tundra',tundratrading:'Tundra Trading Station',tundraarms:'Liga de Armas de la Tundra',crazyjoe:'Loco Pepe',frostfire:'Frostfire Mine',hallofchiefs:'Salón de los Gobernadores',arena:'Arena'},
fr:{bear:'La Chasse à l\'ours',foundry:'Bataille de la Fonderie',canyon:'Conflit du Canyon',svs:'SvS – Région aux Pouvoirs',koi:'Roi de la Banquise',championship:'Championnat d\'Alliance',mercenary:'Prestige du Mercenaire',flameandfang:'Flamme et Crocs',snowbusters:'SOS Chasse-Neige',tundratrade:'Axe Marchand Polaire',tundratrading:'Station d\'Échange de la Toundra',tundraarms:'Ligue Armée de la Toundra',crazyjoe:'Joe le Fou',frostfire:'Mine Givrefeu',hallofchiefs:'Panthéon des Chefs',arena:'Arena'},
de:{bear:'Bärenjagd',foundry:'Schlacht in der Gießerei',canyon:'Canyon-Wettkampf',svs:'SVS – Region der Macht',koi:'König des Eisfelds',championship:'Allianzmeisterschaft',mercenary:'Söldner-Prestige',flameandfang:'Flamme und Reißzähne',snowbusters:'Schneeräumer',tundratrade:'Tundra Handelsroute',tundratrading:'Tundra-Handelsstation',tundraarms:'Tundra Waffen Liga',crazyjoe:'Crazy Joe',frostfire:'Frostfeuer Bergwerk',hallofchiefs:'Halle der Gouverneure',arena:'Arena'},
pt:{bear:'Caça ao Urso',foundry:'Batalha da Forja',canyon:'Duelo no Desfiladeiro',svs:'SVS – Estado de Poder',koi:'Rei do Campo de Gelo',championship:'Campeonato da Aliança',mercenary:'Prestígio Mercenário',flameandfang:'Chamas e Presas',snowbusters:'Destruidora de Neve',tundratrade:'Rota Comercial da Tundra',tundratrading:'Posto de Troca da Tundra',tundraarms:'Liga dos Braços da Tundra',crazyjoe:'Joe Louco',frostfire:'Mina Fogo Frio',hallofchiefs:'Hall of Chiefs',arena:'Arena'},
ko:{bear:'곰 사냥 작전',foundry:'무기공장 쟁탈전',canyon:'협곡 전투',svs:'서버전 – 최강 왕국',koi:'빙원의 왕',championship:'연맹 챔피언십',mercenary:'용병 명예',flameandfang:'불꽃과 송곳니',snowbusters:'제설 특공대',tundratrade:'설원 장삿길',tundratrading:'설원 거래소',tundraarms:'서리 영역 병기 리그',crazyjoe:'미치광이 조이',frostfire:'프로스트 파이어 광산',hallofchiefs:'최강 영주',arena:'Arena'}
};
function eventName(key, lang){
  var pack = EVENT_NAMES[lang] || EVENT_NAMES.en;
  return pack[key] || EVENT_NAMES.en[key] || key;
}

var DEFAULT_SVS_SAVING_DAYS=18; // "2-3 weeks before" -> default mid-point, editable

function addDays(dt,d){ return new Date(dt.getTime()+d*86400000); }

// The leader enters a date ONCE (the "anchor"). From then on, for events with a known
// cadence, this rolls that anchor forward automatically — no need to re-enter it every cycle.
// Irregular events (cadenceDays === null) are never auto-advanced; they always show exactly
// what the leader last typed, since there's no reliable rule to project forward.
function nextOccurrence(anchorIso, cadenceDays){
  var anchor=new Date(anchorIso);
  if(cadenceDays==null) return anchor;
  var now=new Date();
  var d=new Date(anchor.getTime());
  if(d>=now) return d; // anchor is already in the future — nothing to roll forward
  var ms=cadenceDays*86400000;
  var cycles=Math.ceil((now-d)/ms);
  return new Date(d.getTime()+cycles*ms);
}

function stageDate(occursAt, stage, savingDays){
  var d=new Date(occursAt);
  if(stage.offset==='saving') return addDays(d, -(savingDays||DEFAULT_SVS_SAVING_DAYS));
  return addDays(d, stage.offset);
}

// Returns [{event, legion, stage, when}] within the lookahead window (default 48h),
// excluding events the given owner has disabled.
async function getUpcoming(sb, stateId, ownerId, lookaheadHours){
  lookaheadHours = lookaheadHours || 48;
  var now=new Date();
  var horizon=new Date(now.getTime()+lookaheadHours*3600000);
  var occRes = await sb.from('event_occurrences').select('*').eq('state_id',stateId);
  var occs = occRes.data||[];
  var disabled = {};
  if(ownerId){
    var prefRes = await sb.from('event_alert_prefs').select('event_key,enabled').eq('owner',ownerId).eq('state_id',stateId);
    (prefRes.data||[]).forEach(function(p){ if(p.enabled===false) disabled[p.event_key]=true; });
  }
  var out=[];
  occs.forEach(function(occ){
    if(disabled[occ.event_key]) return;
    var def=EVENTS.find(function(e){return e.key===occ.event_key;});
    if(!def) return;
    var rolled=nextOccurrence(occ.occurs_at, def.cadenceDays);
    def.stages.forEach(function(st){
      var when=stageDate(rolled, st, occ.saving_days);
      if(when>=now && when<=horizon){
        out.push({event:def, legion:occ.legion, stage:st, when:when});
      }
    });
  });
  out.sort(function(a,b){return a.when-b.when;});
  return out;
}

function fmtWhen(dt){
  var now=new Date();
  var diffH=Math.round((dt-now)/3600000);
  var timeStr=dt.toLocaleString(undefined,{weekday:'short',hour:'2-digit',minute:'2-digit'});
  if(diffH<1) return 'in <1h · '+timeStr;
  if(diffH<24) return 'in '+diffH+'h · '+timeStr;
  return 'in '+Math.round(diffH/24)+'d · '+timeStr;
}

// Renders a dismissible banner into #containerId if there's anything upcoming.
// Call PhxAlerts.mountBanner('bannerBox') from any page after including this script + Supabase.
async function mountBanner(containerId){
  var box=document.getElementById(containerId);
  if(!box) return;
  try{
    var SUPA_URL='https://vghutrfcrqgelvgdeesl.supabase.co';
    var SUPA_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnaHV0cmZjcnFnZWx2Z2RlZXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMDQ4ODksImV4cCI6MjA5Nzc4MDg4OX0.uarvB0sTDPqS1AysfvDRJahRYRLiJaBO2kVIiyGaDAE';
    if(!window.supabase) return;
    var sb=window.supabase.createClient(SUPA_URL,SUPA_KEY);
    var sess=await sb.auth.getSession();
    var session=sess&&sess.data&&sess.data.session;
    if(!session) return;
    var q=new URLSearchParams(location.search).get('s');
    var stateId=q; if(!stateId){ try{stateId=localStorage.getItem('phx_state');}catch(e){} }
    if(!stateId) return;
    var upcoming=await getUpcoming(sb, stateId, session.user.id, 48);
    if(!upcoming.length) return;
    var dismissedKey='phx_alerts_dismissed_'+stateId;
    var dismissed=[]; try{dismissed=JSON.parse(localStorage.getItem(dismissedKey)||'[]');}catch(e){}
    var todayTag=new Date().toISOString().slice(0,10);
    upcoming=upcoming.filter(function(u){
      var id=u.event.key+'|'+(u.legion||'')+'|'+u.stage.label+'|'+todayTag;
      return dismissed.indexOf(id)===-1;
    });
    if(!upcoming.length) return;
    var top=upcoming[0];
    var lang=(window.PhxI18N&&window.PhxI18N.getLang)?window.PhxI18N.getLang():'en';
    var legionTxt=top.legion?(' ['+(top.legion==='legion1'?'Legion 1':'Legion 2')+']'):'';
    var moreTxt=upcoming.length>1?(' +'+(upcoming.length-1)+' more'):'';
    box.style.cssText='display:flex;align-items:center;gap:10px;background:linear-gradient(90deg,#3a2410,#241708);border:1px solid #ff9a3d;border-radius:12px;padding:10px 12px;margin-bottom:10px;font-family:inherit;';
    box.innerHTML='<div style="font-size:1.3rem;">'+top.event.icon+'</div>'+
      '<div style="flex:1;min-width:0;font-size:.82rem;color:#fff;"><b>'+eventName(top.event.key,lang)+legionTxt+'</b> — '+top.stage.label+' <span style="opacity:.75;">('+fmtWhen(top.when)+')</span>'+(moreTxt?'<div style="font-size:.7rem;opacity:.7;">'+moreTxt+'</div>':'')+'</div>'+
      '<button id="phxAlertDismiss" style="background:none;border:none;color:#ffb938;font-size:1rem;cursor:pointer;padding:2px 6px;">✕</button>';
    document.getElementById('phxAlertDismiss').onclick=function(){
      var id=top.event.key+'|'+(top.legion||'')+'|'+top.stage.label+'|'+todayTag;
      dismissed.push(id);
      try{localStorage.setItem(dismissedKey, JSON.stringify(dismissed));}catch(e){}
      box.style.display='none';
    };
  }catch(e){ /* fail silently — alerts must never break the host page */ }
}

window.PhxAlerts={ EVENTS:EVENTS, EVENT_NAMES:EVENT_NAMES, eventName:eventName, DEFAULT_SVS_SAVING_DAYS:DEFAULT_SVS_SAVING_DAYS, nextOccurrence:nextOccurrence, getUpcoming:getUpcoming, fmtWhen:fmtWhen, mountBanner:mountBanner };
})();
