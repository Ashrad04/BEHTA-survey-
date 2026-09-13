(() => {
  const tips={
    ligule:'Pull the leaf blade gently away from the stem and look on the inside of the collar. The ligule sits exactly where blade and sheath meet.',
    auricle:'Look at the outside edges of the collar. Auricles, when present, project sideways and may clasp around the stem.',
    sheath:'Follow a grass leaf downwards below the blade. The sheath is the lower leaf portion wrapped around the stem.',
    spikelet:'Use a hand lens on one complete unit from the flowering head. A spikelet contains one or more florets above the basal glumes.',
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
    panicle:'A panicle branches more than once. Follow the main axis and look for side branches carrying smaller branches or spikelets.',
    pinnate:'Treat the whole structure as one leaf. Multiple leaflets are arranged along a single central leaf axis.',
    trifoliate:'A trifoliate leaf is one leaf divided into three leaflets. Follow all three back to their shared leaf stalk.',
    rayfloret:'In a daisy-family head, the petal-like structures around the edge are individual ray florets; the centre is made of many disc florets.',
    triangular:'Roll the stem gently between finger and thumb. A sedge stem with three clear angles feels triangular rather than round.'
  };

  const svg=body=>`<svg class="clear-diagram" viewBox="0 0 760 460" role="img" aria-label="Botanical terminology diagram"><defs><marker id="termArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8Z" fill="#9a5b00"/></marker></defs>${body}</svg>`;
  const label=(x,y,t,target=false)=>`<text x="${x}" y="${y}" class="${target?'target-label':'label'}">${t}</text>`;
  const arrow=(x1,y1,x2,y2)=>`<path class="arrow" marker-end="url(#termArrow)" d="M${x1} ${y1} L${x2} ${y2}"/>`;

  function grass(id){
    const c=n=>n===id?'target':'ctx';
    return svg(`<rect class="panel" x="18" y="18" width="724" height="424" rx="20"/><text class="small" x="38" y="50">Grass leaf collar — enlarged field view</text><path class="line" d="M370 410 L370 105"/><path class="${c('sheath')}" d="M323 405 Q315 305 329 205 L411 205 Q425 305 417 405Z"/><path class="ctx" d="M372 215 Q500 170 665 96 Q535 218 379 265Z"/><path class="${c('auricle')}" d="M336 210 Q300 174 265 206 Q300 237 339 226Z"/><path class="${c('auricle')}" d="M404 210 Q440 174 475 206 Q440 237 401 226Z"/><path class="${c('ligule')}" d="M349 207 Q370 152 391 207Z"/>${label(542,85,'leaf blade')}${arrow(535,91,514,157)}${label(54,174,'auricles',id==='auricle')}${arrow(150,178,281,207)}${label(54,244,'ligule',id==='ligule')}${arrow(126,239,360,187)}${label(54,337,'leaf sheath',id==='sheath')}${arrow(170,332,320,315)}`);
  }

  function spike(id){
    const c=n=>n===id?'target':'ctx';
    return svg(`<rect class="panel" x="18" y="18" width="724" height="424" rx="20"/><text class="small" x="38" y="50">Grass spikelet — simplified exploded view</text><path class="line" d="M380 405 L380 90"/><path class="${c('glume')}" d="M380 345 Q285 300 270 225 Q345 246 380 305Z"/><path class="${c('glume')}" d="M380 345 Q475 300 490 225 Q415 246 380 305Z"/><path class="${c('lemma')}" d="M380 278 Q315 240 320 165 Q370 197 385 242Z"/><path class="${c('palea')}" d="M388 270 Q430 238 432 183 Q398 212 385 247Z"/><path class="line" d="M385 217 L430 118"/>${id==='spikelet'?'<rect x="247" y="76" width="278" height="300" rx="34" fill="none" stroke="#d97706" stroke-width="6"/>':''}${label(70,264,'glume',id==='glume')}${arrow(150,260,285,254)}${label(73,153,'lemma',id==='lemma')}${arrow(153,150,326,196)}${label(550,184,'palea',id==='palea')}${arrow(545,190,425,215)}${label(550,104,'awn')}${arrow(543,108,432,123)}${label(276,423,'whole spikelet',id==='spikelet')}`);
  }

  function leafBase(){return svg(`<rect class="panel" x="18" y="18" width="724" height="424" rx="20"/><text class="small" x="38" y="50">Leaf base — where stipules are found</text><path class="line" d="M360 415 L360 80"/><path class="line" d="M360 220 Q445 178 545 133"/><path class="ctx" d="M540 133 Q610 80 695 120 Q630 188 545 160Z"/><path class="target" d="M365 218 Q326 177 285 205 Q315 239 365 236Z"/><path class="target" d="M365 218 Q402 178 442 205 Q410 240 365 236Z"/>${label(64,213,'paired stipules',true)}${arrow(198,210,296,209)}${label(548,100,'leaf blade')}${arrow(548,106,574,130)}`)}

  function arrangements(id){
    const opp=id==='opposite', wh=id==='whorl';
    return svg(`<rect class="panel" x="18" y="18" width="724" height="424" rx="20"/><text class="small" x="38" y="50">Compare leaves at a single stem node</text><path class="line" d="M200 360 L200 120 M557 360 L557 120"/><path class="${opp?'target':'ctx'}" d="M200 220 Q135 170 80 198 Q130 244 200 240Z"/><path class="${opp?'target':'ctx'}" d="M200 220 Q265 170 320 198 Q270 244 200 240Z"/><path class="${wh?'target':'ctx'}" d="M557 220 Q500 172 445 198 Q495 242 557 240Z"/><path class="${wh?'target':'ctx'}" d="M557 220 Q615 172 670 198 Q620 242 557 240Z"/><path class="${wh?'target':'ctx'}" d="M557 220 Q535 150 557 118 Q585 158 557 220Z"/>${label(125,385,'opposite pair',opp)}${label(510,385,'whorl',wh)}`);
  }

  function flower(id){
    const cal=id==='calyx', cor=id==='corolla';
    return svg(`<rect class="panel" x="18" y="18" width="724" height="424" rx="20"/><text class="small" x="38" y="50">Flower from the side</text><path class="line" d="M380 420 L380 310"/><path class="${cal?'target':'ctx'}" d="M380 310 Q315 320 286 270 Q340 264 380 286 Q420 264 474 270 Q445 320 380 310Z"/><path class="${cor?'target':'ctx'}" d="M380 290 Q275 265 270 175 Q340 168 380 235 Q420 168 490 175 Q485 265 380 290Z"/><path class="${cor?'target':'ctx'}" d="M380 272 Q315 210 338 130 Q380 157 380 222 Q380 157 422 130 Q445 210 380 272Z"/>${label(65,215,'petals = corolla',cor)}${arrow(215,210,296,210)}${label(65,304,'sepals = calyx',cal)}${arrow(205,299,303,289)}`);
  }

  function inflorescence(id){
    return svg(`<text class="small" x="38" y="50">Compare flowering structures</text><path class="line" d="M125 350 L125 120 M125 170 L75 135 M125 210 L180 175 M125 250 L78 220 M380 350 L380 235 M380 235 L315 145 M380 235 L350 125 M380 235 L410 125 M380 235 L445 145 M625 350 L625 155 M625 200 L565 150 M625 200 L685 145 M565 150 L535 118 M565 150 L590 112 M685 145 L655 112 M685 145 L710 112"/>${label(88,390,'raceme',id==='raceme')}${label(350,390,'umbel',id==='umbel')}${label(592,390,'panicle',id==='panicle')}`);
  }

  function compound(id){
    const pin=id==='pinnate', tri=id==='trifoliate';
    return svg(`<text class="small" x="38" y="50">Compound leaves</text><path class="line" d="M200 350 L200 120 M560 350 L560 245"/><path class="${pin?'target':'ctx'}" d="M200 155 Q145 117 105 145 Q148 175 200 167Z"/><path class="${pin?'target':'ctx'}" d="M200 155 Q255 117 295 145 Q252 175 200 167Z"/><path class="${pin?'target':'ctx'}" d="M200 225 Q145 187 105 215 Q148 245 200 237Z"/><path class="${pin?'target':'ctx'}" d="M200 225 Q255 187 295 215 Q252 245 200 237Z"/><path class="${tri?'target':'ctx'}" d="M560 245 Q485 190 448 220 Q500 270 560 260Z"/><path class="${tri?'target':'ctx'}" d="M560 245 Q635 190 672 220 Q620 270 560 260Z"/><path class="${tri?'target':'ctx'}" d="M560 245 Q525 150 560 105 Q602 155 560 245Z"/>${label(155,388,'pinnate',pin)}${label(520,388,'trifoliate',tri)}`);
  }

  function daisy(){return svg(`<text class="small" x="38" y="50">Daisy-family flower head</text><circle cx="380" cy="235" r="82" class="ctx"/>${[0,45,90,135,180,225,270,315].map(a=>`<path class="target" transform="translate(380 235) rotate(${a})" d="M0 -78 Q-24 -145 0 -174 Q24 -145 0 -78Z"/>`).join('')}${label(60,165,'ray florets',true)}${arrow(172,160,275,177)}${label(535,260,'disc florets')}${arrow(530,255,459,239)}`)}

  function triangular(){return svg(`<text class="small" x="38" y="50">Stem cross-section comparison</text><polygon class="target" points="160,135 95,280 225,280"/><circle class="ctx" cx="380" cy="220" r="70"/><circle class="ctx" cx="600" cy="220" r="70"/>${label(96,345,'sedge: triangular',true)}${label(326,345,'rush: round')}${label(542,345,'grass: round')}`)}

  function draw(id){
    if(['ligule','auricle','sheath'].includes(id))return grass(id);
    if(['spikelet','glume','lemma','palea'].includes(id))return spike(id);
    if(id==='stipule')return leafBase();
    if(['opposite','whorl'].includes(id))return arrangements(id);
    if(['calyx','corolla'].includes(id))return flower(id);
    if(['umbel','raceme','panicle'].includes(id))return inflorescence(id);
    if(['pinnate','trifoliate'].includes(id))return compound(id);
    if(id==='rayfloret')return daisy();
    if(id==='triangular')return triangular();
    return '';
  }

  function enhance(id){
    const host=document.getElementById('termDiagram');
    if(!host)return;
    const art=draw(id);
    if(!art)return;
    host.innerHTML=`<div class="clear-diagram-wrap"><div class="clear-diagram-guide"><span><i class="clear-diagram-dot target"></i>Highlighted structure</span><span><i class="clear-diagram-dot context"></i>Surrounding plant parts</span></div>${art}<div class="clear-diagram-tip"><strong>Where to look:</strong> ${tips[id]||'Use several independent characters before accepting an identification.'}</div></div>`;
  }

  // Deliberately no MutationObserver here. The previous observer could repeatedly react to
  // its own diagram DOM changes on some mobile browsers. Enhancement now runs once per tap.
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-term]');
    if(!button)return;
    const id=button.dataset.term;
    setTimeout(()=>enhance(id),0);
  });
})();