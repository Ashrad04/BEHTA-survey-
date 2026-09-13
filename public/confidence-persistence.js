(() => {
  const priorNormalise = normaliseSpecies;
  function readConfidence(notes){
    const text=String(notes||'');
    const start=text.indexOf('[ID confidence: ');
    if(start<0) return '';
    const end=text.indexOf(']',start);
    if(end<0) return '';
    return text.slice(start+16,end).trim();
  }
  function stripMarker(notes){
    return String(notes||'').split('\n').filter(line=>!line.startsWith('[ID confidence: ')).join('\n').trim();
  }
  normaliseSpecies=function(source){
    const raw=source||{};
    const stored=raw.confidence||readConfidence(raw.notes);
    const item=priorNormalise(stored?{...raw,confidence:stored}:raw);
    const confidence=item.confidence||stored||'Not assessed';
    item.confidence=confidence;
    const plain=stripMarker(item.notes);
    item.notes=`${plain}${plain?'\n':''}[ID confidence: ${confidence}]`;
    return item;
  };
})();
