(() => {
  const tips = {
    ligule:'Pull the leaf blade gently away from the stem and look on the inside of the collar. The ligule sits exactly where blade and sheath meet.',
    auricle:'Look at the outside edges of the collar. Auricles, when present, project sideways and may clasp around the stem.',
    sheath:'Follow a grass leaf downwards below the blade. The sheath is the lower leaf portion wrapped around the stem.',
    spikelet:'Use a hand lens on one complete unit from the flowering head. A spikelet contains one or more florets above a basal pair of glumes.',
    glume:'Look at the very base of a grass spikelet. The glumes are the outer basal bracts below the florets.',
    lemma:'Inside the glumes, the lemma is the larger outer bract around an individual floret. An awn often arises from it.',
    palea:'The palea sits opposite the lemma, on the inner side of the floret. It is usually narrower and partly hidden.',
    stipule:'Trace the leaf stalk back to where it joins the stem. Stipules occur as a pair at that true leaf base.',
    opposite:'Find one stem node. If two leaves arise directly opposite one another at the same level, the arrangement is opposite.',
    whorl:'Count the leaves or leaf-like structures arising from one stem node. Three or more at one level form a whorl.',
    calyx:'Look behind or beneath the petals. The sepals together make the calyx and often remain visible after flowering.',
    corolla:'The corolla is the petal region. Look at its shape, symmetry and whether petals are free or joined into a tube.',
    umbel:'Trace the individual flower stalks downwards. In an umbel they converge at approximately one point.',
    raceme:'Look for one main unbranched axis with separately stalked flowers attached along it.',
    panicle:'A panicle branches more than once. Follow the main axis and look for side branches that themselves carry smaller branches or spikelets.',
    pinnate:'Treat the whole structure as one leaf. Multiple leaflets are arranged along a single central leaf axis.',
    trifoliate:'A trifoliate leaf is one leaf divided into three leaflets. Follow all three back to their shared leaf stalk.',
    rayfloret:'In a daisy-family head, the petal-like structures around the edge are individual ray florets; the centre is made of many disc florets.',
    triangular:'Roll the stem gently between finger and thumb. A sedge stem with three clear angles feels triangular rather than round.'
  };

  const titleToId = {
    'Ligule':'ligule','Auricles':'auricle','Leaf sheath':'sheath','Spikelet':'spikelet','Glume':'glume','Lemma':'lemma','Palea':'palea','Stipule':'stipule',
    'Opposite leaves':'opposite','Whorled leaves':'whorl','Calyx / sepals':'calyx','Corolla / petals':'corolla','Umbel':'umbel','Raceme':'raceme','Panicle':'panicle',
    'Pinnate leaf':'pinnate','Trifoliate leaf':'trifoliate','Ray and disc florets':'rayfloret','Triangular sedge stem':'triangular'
  };

  function defs(){return '<defs><marker id="arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#9a5b00"/></marker></defs>'}
  const svg = body => `<svg class="clear-diagram" viewBox="0 0 760 460" role="img" aria-label="Clear botanical terminology diagram">${defs()}${body}</svg>`;
  const label = (x,y,text,target=false) => `<text x="${x}" y="${y}" class="${target?'target-label':'label'}">${text}</text>`;
  const arrow = (x1,y1,x2,y2) => `<path class="arrow" d="M${x1} ${y1} L${x2} ${y2}"/>`;

  function grassCollar(id){
    const target = n => n===id?'target':'ctx';
    return svg(`
      <rect class="panel" x="18" y="18" width="724" height="424" rx="20"/>
      <text class="small" x="38" y="50">Grass leaf collar — enlarged field view</text>
      <path class="line" d="M370 410 L370 105"/>
      <path class="${target('sheath')}" d="M323 405 Q315 305 329 205 L411 205 Q425 305 417 405 Z"/>
      <path class="ctx" d="M372 215 Q500 170 665 96 Q535 218 379 265 Z"/>
      <path class="${target('auricle')}" d="M336 210 Q300 174 265 206 Q300 237 339 226 Z"/>
      <path class="${target('auricle')}" d="M404 210 Q440 174 475 206 Q440 237 401 226 Z"/>
      <path class="${target('ligule')}" d="M349 207 Q370 152 391 207 Z"/>
      <circle cx="370" cy="212" r="86" fill="none" stroke="#d4e3d8" stroke-width="3" stroke-dasharray="8 8"/>
      ${label(542,85,'leaf blade')}${arrow(535,91,514,157)}
      ${label(54,174,'auricles',id==='auricle')}${arrow(150,178,281,207)}
      ${label(54,244,'ligule',id==='ligule')}${arrow(126,239,360,187)}
      ${label(54,337,'leaf sheath',id==='sheath')}${arrow(170,332,320,315)}
      <text class="small" x="500" y="405">stem continues inside sheath</text>`);
  }

  function spikelet(id){
    const c=n=>n===id?'target':'ctx';
    return svg(`
      <rect class="panel" x="18" y="18" width="724" height="424" rx="20"/>
      <text class="small" x="38" y="50">Grass spikelet — simplified exploded view</text>
      <path class="line" d="M380 405 L380 90"/>
      <path class="${c('glume')}" d="M380 345 Q285 300 270 225 Q345 246 380 305 Z"/>
      <path class="${c('glume')}" d="M380 345 Q475 300 490 225 Q415 246 380 305 Z"/>
      <g><path class="${c('lemma')}" d="M380 278 Q315 240 320 165 Q370 197 385 242 Z"/><path class="${c('palea')}" d="M388 270 Q430 238 432 183 Q398 212 385 247 Z"/><path class="line" d="M385 217 L430 118"/></g>
      <g transform="translate(0,-92)"><path class="${c('lemma')}" d="M380 278 Q315 240 320 165 Q370 197 385 242 Z"/><path class="${c('palea')}" d="M388 270 Q430 238 432 183 Q398 212 385 247 Z"/><path class="line" d="M385 217 L430 118"/></g>
      ${id==='spikelet'?'<rect x="247" y="76" width="278" height="300" rx="34" fill="none" stroke="#d97706" stroke-width="6"/>':''}
      ${label(70,264,'glume',id==='glume')}${arrow(150,260,285,254)}
      ${label(73,153,'lemma',id==='lemma')}${arrow(153,150,326,196)}
      ${label(550,184,'palea',id==='palea')}${arrow(545,190,425,215)}
      ${label(550,104,'awn')}${arrow(543,108,432,123)}
      ${label(276,423,'whole spikelet',id==='spikelet')}`);
  }

  function stipule(){return svg(`
    <rect class="panel" x="18" y="18" width="724" height="424" rx="20"/><text class="small" x="38" y="50">Leaf base — where stipules are found</text>
    <path class="line" d="M360 415 L360 80"/><path class="line" d="M360 220 Q445 178 545 133"/><path class="ctx" d="M540 133 Q610 80 695 120 Q630 188 545 160 Z"/>
    <path class="target" d="M365 218 Q326 177 285 205 Q315 239 365 236 Z"/><path class="target" d="M365 218 Q402 178 442 205 Q410 240 365 236 Z"/>
    ${label(64,213,'paired stipules',true)}${arrow(198,210,296,209)}${label(548,100,'leaf blade')}${arrow(548,106,574,130)}${label(390,321,'stem')}`)}

  function arrangements(id){
    const opposite=id==='opposite', whorl=id==='whorl';
    return svg(`<rect class="panel" x="18" y="18" width="724" height="424" rx="20"/><text class="small" x="38" y="50">Compare leaves at a single stem node</text>
      <rect x="55" y="80" width="295" height="315" rx="18" fill="${opposite?'#fff7e8':'#f7faf8'}" stroke="${opposite?'#d97706':'#dce7df'}" stroke-width="${opposite?4:2}"/>
      <path class="line" d="M200 360 L200 120"/><path class="${opposite?'target':'ctx'}" d="M200 220 Q135 170 80 198 Q130 244 200 240 Z"/><path class="${opposite?'target':'ctx'}" d="M200 220 Q265 170 320 198 Q270 244 200 240 Z"/>${label(125,385,'opposite pair',opposite)}
      <rect x="410" y="80" width="295" height="315" rx="18" fill="${whorl?'#fff7e8':'#f7faf8'}" stroke="${whorl?'#d97706':'#dce7df'}" stroke-width="${whorl?4:2}"/>
      <path class="line" d="M557 360 L557 120"/><path class="${whorl?'target':'ctx'}" d="M557 220 Q500 172 445 198 Q495 242 557 240 Z"/><path class="${whorl?'target':'ctx'}" d="M557 220 Q615 172 670 198 Q620 242 557 240 Z"/><path class="${whorl?'target':'ctx'}" d="M557 220 Q535 150 557 118 Q585 158 557 220 Z"/>${label(510,385,'whorl',whorl)}`);
  }

  function flower(id){
    const cal=id==='calyx', cor=id==='corolla';
    return svg(`<rect class="panel" x="18" y="18" width="724" height="424" rx="20"/><text class="small" x="38" y="50">Flower from the side — outer and inner floral parts</text>
      <path class="line" d="M380 420 L380 310"/>
      <path class="${cal?'target':'ctx'}" d="M380 310 Q315 320 286 270 Q340 264 380 286 Q420 264 474 270 Q445 320 380 310 Z"/>
      <path class="${cor?'target':'ctx'}" d="M380 290 Q275 265 270 175 Q340 168 380 235 Q420 168 490 175 Q485 265 380 290 Z"/>
      <path class="${cor?'target':'ctx'}" d="M380 272 Q315 210 338 130 Q380 157 380 222 Q380 157 422 130 Q445 210 380 272 Z"/>
      <path class="line" d="M380 265 L380 118"/><circle cx="380" cy="112" r="9" fill="#244d35"/>
      ${label(65,215,'petals = corolla',cor)}${arrow(215,210,296,210)}${label(65,304,'sepals = calyx',cal)}${arrow(205,299,303,289)}${label(458,118,'stigma')}`);
  }

  function inflorescence(id){
    const names=['raceme','umbel','panicle']; const xs=[125,380,625];
    const panels=names.map((n,i)=>`<rect x="${xs[i]-105}" y="78" width="210" height="320" rx="18" fill="${id===n?'#fff7e8':'#f7faf8'}" stroke="${id===n?'#d97706':'#dce7df'}" stroke-width="${id===n?4:2}"/>`).join('');
    return svg(`${panels}<text class="small" x="38" y="50">Compare flowering structures</text>
      <g><path class="line" d="M125 350 L125 120 M125 170 L75 135 M125 210 L180 175 M125 250 L78 220 M125 290 L180 260"/><circle cx="70" cy="130" r="11" class="ctx"/><circle cx="185" cy="170" r="11" class="ctx"/><circle cx="73" cy="215" r="11" class="ctx"/><circle cx="185" cy="255" r="11" class="ctx"/>${label(88,380,'raceme',id==='raceme')}</g>
      <g><path class="line" d="M380 350 L380 235 M380 235 L315 145 M380 235 L350 125 M380 235 L410 125 M380 235 L445 145"/><circle cx="310" cy="140" r="11" class="ctx"/><circle cx="347" cy="120" r="11" class="ctx"/><circle cx="413" cy="120" r="11" class="ctx"/><circle cx="450" cy="140" r="11" class="ctx"/>${label(350,380,'umbel',id==='umbel')}</g>
      <g><path class="line" d="M625 350 L625 155 M625 200 L565 150 M625 200 L685 145 M565 150 L535 118 M565 150 L590 112 M685 145 L655 112 M685 145 L710 112 M625 260 L575 230 M625 260 L675 225"/><circle cx="530" cy="112" r="10" class="ctx"/><circle cx="593" cy="106" r="10" class="ctx"/><circle cx="650" cy="106" r="10" class="ctx"/><circle cx="715" cy="106" r="10" class="ctx"/>${label(592,380,'panicle',id==='panicle')}</g>`);
  }

  function compound(id){
    const pin=id==='pinnate', tri=id==='trifoliate';
    return svg(`<text class="small" x="38" y="50">Compound leaves — count leaflets, not whole leaves</text>
      <rect x="45" y="78" width="310" height="330" rx="18" fill="${pin?'#fff7e8':'#f7faf8'}" stroke="${pin?'#d97706':'#dce7df'}" stroke-width="${pin?4:2}"/><path class="line" d="M200 350 L200 120"/>${[155,200,245,290].map((y,i)=>`<path class="${pin?'target':'ctx'}" d="M200 ${y} Q145 ${y-38} 105 ${y-10} Q148 ${y+20} 200 ${y+12} Z"/><path class="${pin?'target':'ctx'}" d="M200 ${y} Q255 ${y-38} 295 ${y-10} Q252 ${y+20} 200 ${y+12} Z"/>`).join('')}${label(155,388,'pinnate',pin)}
      <rect x="405" y="78" width="310" height="330" rx="18" fill="${tri?'#fff7e8':'#f7faf8'}" stroke="${tri?'#d97706':'#dce7df'}" stroke-width="${tri?4:2}"/><path class="line" d="M560 350 L560 245"/><path class="${tri?'target':'ctx'}" d="M560 245 Q485 190 448 220 Q500 270 560 260 Z"/><path class="${tri?'target':'ctx'}" d="M560 245 Q635 190 672 220 Q620 270 560 260 Z"/><path class="${tri?'target':'ctx'}" d="M560 245 Q525 150 560 105 Q602 155 560 245 Z"/>${label(520,388,'trifoliate',tri)}`);
  }

  function daisy(){return svg(`<rect class="panel" x="18" y="18" width="724" height="424" rx="20"/><text class="small" x="38" y="50">A daisy “flower” is actually a head of many small florets</text>
    <g transform="translate(380 235)">${[0,45,90,135,180,225,270,315].map(a=>`<path class="target" transform="rotate(${a})" d="M0 -78 Q-24 -145 0 -174 Q24 -145 0 -78 Z"/>`).join('')}<circle r="82" class="ctx"/><g fill="#5d8769">${[-45,-15,15,45].flatMap(x=>[-45,-15,15,45].map(y=>x*x+y*y<3000?`<circle cx="${x}" cy="${y}" r="9"/>`:'' )).join('')}</g></g>
    ${label(60,165,'ray florets',true)}${arrow(172,160,275,177)}${label(535,260,'disc florets')}${arrow(530,255,459,239)}`)}

  function triangular(){return svg(`<text class="small" x="38" y="50">Stem cross-section comparison</text>
    <rect x="55" y="90" width="210" height="290" rx="18" fill="#fff7e8" stroke="#d97706" stroke-width="4"/><polygon class="target" points="160,135 95,280 225,280"/>${label(96,345,'sedge: triangular',true)}
    <rect x="275" y="90" width="210" height="290" rx="18" fill="#f7faf8" stroke="#dce7df" stroke-width="2"/><circle class="ctx" cx="380" cy="220" r="70"/>${label(326,345,'rush: round')}
    <rect x="495" y="90" width="210" height="290" rx="18" fill="#f7faf8" stroke="#dce7df" stroke-width="2"/><circle class="ctx" cx="600" cy="220" r="70"/><path class="line" d="M530 220 L670 220"/>${label(542,345,'grass: round')}`)}

  function draw(id){
    if(['ligule','auricle','sheath'].includes(id)) return grassCollar(id);
    if(['spikelet','glume','lemma','palea'].includes(id)) return spikelet(id);
    if(id==='stipule') return stipule();
    if(['opposite','whorl'].includes(id)) return arrangements(id);
    if(['calyx','corolla'].includes(id)) return flower(id);
    if(['umbel','raceme','panicle'].includes(id)) return inflorescence(id);
    if(['pinnate','trifoliate'].includes(id)) return compound(id);
    if(id==='rayfloret') return daisy();
    if(id==='triangular') return triangular();
    return '';
  }

  function enhance(id){
    const host=document.getElementById('termDiagram'); if(!host) return;
    const art=draw(id); if(!art) return;
    host.innerHTML=`<div class="clear-diagram-wrap"><div class="clear-diagram-guide"><span><i class="clear-diagram-dot target"></i>Highlighted structure</span><span><i class="clear-diagram-dot context"></i>Surrounding plant parts</span></div>${art}<div class="clear-diagram-tip"><strong>Where to look:</strong> ${tips[id]||'Use several independent characters before accepting an identification.'}</div></div>`;
  }

  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-term]'); if(!button) return;
    const id=button.dataset.term; setTimeout(()=>enhance(id),0);
  });

  // Also enhance terms opened by any future code path that only changes the modal title.
  const observer=new MutationObserver(()=>{
    const modal=document.getElementById('termModal'); if(!modal||modal.hidden) return;
    const id=titleToId[document.getElementById('termTitle')?.textContent||''];
    if(id && !document.querySelector('#termDiagram .clear-diagram')) enhance(id);
  });
  observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
})();
