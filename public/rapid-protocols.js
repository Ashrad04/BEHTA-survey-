window.RAPID_PROTOCOLS = {
  CG8: {
    code:'CG8', name:'CG8 Magnesian limestone grassland', visit:'Mid May to end July',
    herb:[30,90], height:[2,15], litterMax:25, bareMax:10, scrubMax:5, negativeCoverMax:5, roseMax:10,
    positiveTarget:{type:'cg8', frequentOther:2, occasional:4, requiredFrequent:'Sesleria caerulea'},
    positive:['Sesleria caerulea','Anthyllis vulneraria','Galium verum','Gentianella spp.','Helianthemum nummularium','Hypericum pulchrum','Linum catharticum','Listera ovata','Lotus corniculatus','Pimpinella saxifraga','Plantago media','Polygala spp.','Primula veris','Sanguisorba minor','Scabiosa columbaria','Stachys officinalis','Succisa pratensis','Thymus polytrichus','Viola hirta'],
    negative:['Chamerion angustifolium','Cirsium arvense','Cirsium vulgare','Galium aparine','Senecio jacobaea','Sonchus spp.','Urtica dioica'],
    extras:[{key:'rose_cover',label:'Rosa spp. cover (%)',target:'≤10%',max:10,mandatory:true}],
    management:'Scrub and weed control; grazing intensity/stocking rate; FYM and other inputs; grazing period; supplementary feeding; rolling/chain harrowing; stock type; burning.'
  },
  MG5: {
    code:'MG5', name:'MG5 Centaurea nigra–Cynosurus cristatus grassland', visit:'Mid May to end July (pastures); mid May to hay cut (meadows)',
    herb:[40,90], height:[5,15], litterMax:25, bareMax:5, scrubMax:5, negativeCoverMax:5,
    positiveTarget:{type:'standard', frequent:2, occasional:4},
    positive:['Agrimonia eupatoria','Alchemilla spp.','Anemone nemorosa','Centaurea nigra','Euphrasia spp.','Filipendula ulmaria','Filipendula vulgaris','Galium verum','Genista tinctoria','Lathyrus linifolius','Lathyrus pratensis','Leontodon hispidus/L. saxatilis','Leucanthemum vulgare','Lotus corniculatus','Pimpinella saxifraga','Polygala spp.','Potentilla erecta','Primula veris','Rhinanthus minor','Sanguisorba minor','Sanguisorba officinalis','Serratula tinctoria','Silaum silaus','Stachys officinalis','Succisa pratensis','Tragopogon pratensis','Small blue-green Carex spp. (<5 mm leaves)'],
    negative:['Anthriscus sylvestris','Cirsium arvense','Cirsium vulgare','Galium aparine','Plantago major','Pteridium aquilinum','Rumex crispus','Rumex obtusifolius','Senecio jacobaea','Urtica dioica'],
    extras:[{key:'waterlogging_cover',label:'Waterlogging indicators cover (%)',target:'≤10%',max:10,mandatory:true,help:'Juncus spp., Deschampsia cespitosa, large Carex spp. and large wetland grasses considered together.'}],
    management:'Hay and aftermath grazing; grazing intensity/stocking rate; FYM and other inputs; grazing period; supplementary feeding; drainage/water levels; stock type; rolling/chain harrowing; scrub and weed control.'
  },
  CG3: {
    code:'CG3', name:'CG3 Bromopsis erecta calcareous grassland', visit:'May to July',
    herb:[40,90], height:[2,15], litterMax:25, bareMax:10, scrubMax:5, negativeCoverMax:5,
    positiveTarget:{type:'dominant', requiredFrequent:'Bromopsis erecta', frequentOther:2, occasional:4},
    positive:['Bromopsis erecta','Brachypodium pinnatum','Anthyllis vulneraria','Asperula cynanchica','Campanula glomerata','Cirsium acaule','Filipendula vulgaris','Galium verum','Gentianella spp.','Helianthemum nummularium','Hippocrepis comosa','Leontodon hispidus/L. saxatilis','Leucanthemum vulgare','Linum catharticum','Lotus corniculatus','Pilosella officinarum','Plantago media','Polygala spp.','Primula veris','Sanguisorba minor','Scabiosa columbaria','Succisa pratensis','Thymus spp.'],
    negative:['Cirsium arvense','Cirsium vulgare','Rumex crispus','Rumex obtusifolius','Senecio jacobaea','Urtica dioica'],
    extras:[{key:'brachypodium_cover',label:'Brachypodium pinnatum cover (%)',target:'≤10%',max:10,mandatory:true}],
    management:'Grazing intensity/stocking rate; FYM and other inputs; grazing period; supplementary feeding; stock type; burning; scrub and weed control.'
  },
  CG4: {
    code:'CG4', name:'CG4 Brachypodium pinnatum calcareous grassland', visit:'May to July',
    herb:[40,90], height:[2,15], litterMax:25, bareMax:10, scrubMax:5, negativeCoverMax:5,
    positiveTarget:{type:'dominant', requiredFrequent:'Brachypodium pinnatum', frequentOther:2, occasional:4},
    positive:['Brachypodium pinnatum','Bromopsis erecta','Anthyllis vulneraria','Asperula cynanchica','Campanula glomerata','Cirsium acaule','Filipendula vulgaris','Galium verum','Gentianella spp.','Helianthemum nummularium','Hippocrepis comosa','Leontodon hispidus/L. saxatilis','Leucanthemum vulgare','Linum catharticum','Lotus corniculatus','Pilosella officinarum','Plantago media','Polygala spp.','Primula veris','Sanguisorba minor','Scabiosa columbaria','Succisa pratensis','Thymus spp.'],
    negative:['Cirsium arvense','Cirsium vulgare','Rumex crispus','Rumex obtusifolius','Senecio jacobaea','Urtica dioica'], extras:[],
    management:'Grazing intensity/stocking rate; FYM and other inputs; grazing period; supplementary feeding; stock type; burning; scrub and weed control.'
  },
  CG5: {
    code:'CG5', name:'CG5 Bromopsis erecta–Brachypodium pinnatum grassland', visit:'May to July',
    herb:[40,90], height:[2,15], litterMax:25, bareMax:10, scrubMax:5, negativeCoverMax:5,
    positiveTarget:{type:'both', requiredFrequent:['Bromopsis erecta','Brachypodium pinnatum'], frequentOther:2, occasional:4},
    positive:['Brachypodium pinnatum','Bromopsis erecta','Anthyllis vulneraria','Asperula cynanchica','Campanula glomerata','Cirsium acaule','Filipendula vulgaris','Galium verum','Gentianella spp.','Helianthemum nummularium','Hippocrepis comosa','Leontodon hispidus/L. saxatilis','Leucanthemum vulgare','Linum catharticum','Lotus corniculatus','Pilosella officinarum','Plantago media','Polygala spp.','Primula veris','Sanguisorba minor','Scabiosa columbaria','Succisa pratensis','Thymus spp.'],
    negative:['Cirsium arvense','Cirsium vulgare','Rumex crispus','Rumex obtusifolius','Senecio jacobaea','Urtica dioica'], extras:[],
    management:'Grazing intensity/stocking rate; FYM and other inputs; grazing period; supplementary feeding; stock type; burning; scrub and weed control.'
  }
};
