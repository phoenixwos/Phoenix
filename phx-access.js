/* phx-access.js — shared premium-tool access gate for Phoenix.
   PXR (admin, or R4/R5 whose alliance tag starts with PXR) always has full access.
   Any other alliance gets a 7-day free trial with full access, starting the first
   time anyone from that alliance opens ANY gated tool (not per-tool — one shared
   clock per alliance). After the trial ends, full access requires an active Ko-fi
   subscription (alliance_subscriptions.paid_through in the future).

   Usage in a tool page:
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     <script src="phx-access.js"></script>
     <script>
       PhxAccess.check(function(granted, reason, ctx){
         if(granted){
           // unlock the premium bit; ctx.sb / ctx.uid available if needed
           // if(reason==='trial' && ctx.daysLeft<=3) showTrialNotice(ctx.daysLeft);
         }else{
           document.getElementById('phxDemoBanner').innerHTML = 'Your specific locked-feature sentence. ' + PhxAccess.message(reason);
           document.getElementById('phxDemoBanner').style.display='block';
         }
       });
     </script>
*/
(function(){
  var SUPA_URL='https://vghutrfcrqgelvgdeesl.supabase.co';
  var SUPA_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnaHV0cmZjcnFnZWx2Z2RlZXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMDQ4ODksImV4cCI6MjA5Nzc4MDg4OX0.uarvB0sTDPqS1AysfvDRJahRYRLiJaBO2kVIiyGaDAE';
  var TRIAL_DAYS=7;
  var PRICE_TEXT='$5/mo';
  var KOFI_URL='https://ko-fi.com/phoenixwos';
  var FREE_TAGS=['PXR','SNO']; // alliances with full access for every R4/R5, no payment ever

  function isFreeTag(tag){
    tag=(tag||'').toUpperCase();
    return FREE_TAGS.some(function(t){ return tag.indexOf(t)===0; });
  }

  function getState(){
    var q=new URLSearchParams(location.search).get('s');
    if(q) return q;
    try{var ls=localStorage.getItem('phx_state'); if(ls) return ls;}catch(e){}
    return '3139';
  }

  window.PhxAccess={
    TRIAL_DAYS:TRIAL_DAYS,
    PRICE_TEXT:PRICE_TEXT,
    KOFI_URL:KOFI_URL,

    message:function(reason){
      var guide=' <a href="phoenix-leader-guide.html" target="_blank" rel="noopener" style="color:#7fd9ee;">See the leader guide</a>.';
      if(reason==='trialexpired') return 'Your '+TRIAL_DAYS+'-day free trial has ended — <a href="'+KOFI_URL+'" target="_blank" rel="noopener" style="color:#7fd9ee;font-weight:700;">subscribe on Ko-fi</a> ('+PRICE_TEXT+') to keep full access.'+guide;
      if(reason==='notleader') return 'Ask your alliance R4/R5 to start the free trial or subscribe on Ko-fi.'+guide;
      return '<a href="'+KOFI_URL+'" target="_blank" rel="noopener" style="color:#7fd9ee;font-weight:700;">Subscribe on Ko-fi</a> ('+PRICE_TEXT+') to unlock it — or ask your R4/R5 to start the free '+TRIAL_DAYS+'-day trial.'+guide;
    },

    check:function(cb){
      try{
        if(!(window.supabase&&window.supabase.createClient)){cb(false,'error');return;}
        var sb=window.supabase.createClient(SUPA_URL,SUPA_KEY);
        sb.auth.getSession().then(function(r){
          var s=r&&r.data&&r.data.session;
          if(!s){cb(false,'nosession');return;}
          sb.from('players').select('role,alliance_id').eq('owner',s.user.id).eq('state_id',getState()).then(function(res){
            var rows=res.data||[];
            var ctx={sb:sb,uid:s.user.id};
            if(rows.some(function(p){return p.role==='admin';})){cb(true,'admin',ctx);return;}
            var leaderRow=rows.find(function(p){return (p.role==='r4'||p.role==='r5')&&p.alliance_id;});
            if(!leaderRow){cb(false,'notleader',ctx);return;}
            sb.from('alliances').select('id,tag').eq('id',leaderRow.alliance_id).maybeSingle().then(function(ar){
              if(!ar.data){cb(false,'error',ctx);return;}
              var tag=(ar.data.tag||'').toUpperCase();
              if(isFreeTag(tag)){cb(true,'free_alliance',ctx);return;}
              var allianceId=ar.data.id;
              sb.from('alliance_subscriptions').select('paid_through,trial_started_at').eq('alliance_id',allianceId).maybeSingle().then(function(sr){
                var row=sr.data;
                var now=new Date();
                if(row&&row.paid_through&&new Date(row.paid_through)>now){cb(true,'paid',ctx);return;}
                if(row&&row.trial_started_at){
                  var days=(now-new Date(row.trial_started_at))/86400000;
                  if(days<TRIAL_DAYS){ctx.daysLeft=Math.max(1,Math.ceil(TRIAL_DAYS-days));cb(true,'trial',ctx);return;}
                  cb(false,'trialexpired',ctx);return;
                }
                // first time this alliance has ever hit a gated tool — start its trial clock
                sb.from('alliance_subscriptions').upsert(
                  {alliance_id:allianceId, trial_started_at:now.toISOString()},
                  {onConflict:'alliance_id', ignoreDuplicates:true}
                ).then(function(){
                  ctx.daysLeft=TRIAL_DAYS;
                  cb(true,'trial',ctx);
                }).catch(function(){cb(false,'error',ctx);});
              }).catch(function(){cb(false,'error',ctx);});
            }).catch(function(){cb(false,'error',ctx);});
          }).catch(function(){cb(false,'error',{});});
        }).catch(function(){cb(false,'error',{});});
      }catch(e){cb(false,'error',{});}
    }
  };
})();
