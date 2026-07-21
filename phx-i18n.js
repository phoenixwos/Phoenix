/* ══════════════════════════════════════════════════════════════════
   Phoenix shared i18n core — one file, reused by every tool.
   Each page supplies its own small dictionary; this file provides
   the selector widget, persistence, and the apply-to-DOM logic.
   Usage in a page:
     add a lang-box / langBtn / langMenu block in the header, then:
     <script src="phx-i18n.js"></script>
     <script>
       const DICT = { en:{ key:"value", ... }, es:{...}, ... };
       PhxI18N.init(DICT, function(){ renderEverythingAgain(); });
     </script>
   Mark static text with data-i18n="key" and it's swapped automatically.
   For JS-built strings, call PhxI18N.t('key') and re-run on language change
   via the callback passed to init().
   ══════════════════════════════════════════════════════════════════ */
(function(){
  const LANGS=[
    {code:'en',name:'English'},{code:'es',name:'Español'},{code:'ko',name:'한국어'},
    {code:'ja',name:'日本語'},{code:'de',name:'Deutsch'},{code:'fr',name:'Français'},
    {code:'ar',name:'العربية'},{code:'ru',name:'Русский'},{code:'tr',name:'Türkçe'},
    {code:'it',name:'Italiano'},{code:'pl',name:'Polski'},{code:'pt',name:'Português'},
    {code:'th',name:'ไทย'},{code:'id',name:'Indonesia'}
  ];
  const RTL=['ar'];
  let DICT={}, LANG='en', onChangeCb=null;

  function getSavedLang(){
    try{ const v=localStorage.getItem('phx_lang'); if(v && LANGS.some(l=>l.code===v)) return v; }catch(e){}
    return 'en';
  }
  function saveLang(code){ try{ localStorage.setItem('phx_lang',code); }catch(e){} }

  function t(key){
    const pack=DICT[LANG]||DICT.en||{};
    const fallback=(DICT.en||{})[key];
    return (pack[key]!==undefined? pack[key] : (fallback!==undefined? fallback : key));
  }

  function applyToDOM(){
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const k=el.getAttribute('data-i18n');
      const v=t(k);
      if(v!==undefined) el.textContent=v;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el=>{
      const k=el.getAttribute('data-i18n-html');
      const v=t(k);
      if(v!==undefined) el.innerHTML=v;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el=>{
      const k=el.getAttribute('data-i18n-ph');
      const v=t(k);
      if(v!==undefined) el.setAttribute('placeholder',v);
    });
    document.documentElement.lang=LANG;
    document.documentElement.dir=RTL.indexOf(LANG)>-1?'rtl':'ltr';
    const lbl=document.getElementById('langLabel');
    if(lbl) lbl.textContent=LANG.toUpperCase();
    document.querySelectorAll('.lang-menu button').forEach(b=>b.classList.toggle('active',b.dataset.code===LANG));
  }

  function setLang(code){
    LANG=code; saveLang(code); applyToDOM();
    if(typeof onChangeCb==='function') onChangeCb(LANG);
  }

  function buildMenu(){
    const menu=document.getElementById('langMenu');
    if(!menu) return;
    menu.innerHTML='';
    LANGS.forEach(l=>{
      const b=document.createElement('button');
      b.textContent=l.name; b.dataset.code=l.code;
      b.onclick=()=>{ setLang(l.code); menu.classList.remove('open'); };
      menu.appendChild(b);
    });
    const btn=document.getElementById('langBtn');
    if(btn) btn.onclick=()=>menu.classList.toggle('open');
    document.addEventListener('click',e=>{
      if(!e.target.closest('.lang-box')) menu.classList.remove('open');
    });
  }

  function init(dict, onChange){
    DICT=dict||{}; onChangeCb=onChange||null;
    LANG=getSavedLang();
    buildMenu();
    applyToDOM();
    if(typeof onChangeCb==='function') onChangeCb(LANG);
  }

  window.PhxI18N={ init, t, setLang, getLang:()=>LANG, LANGS };
})();
