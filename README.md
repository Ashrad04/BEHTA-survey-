# BEHTA Field Recorder

Mobile-first grassland field recorder for Baseline Evaluation of Higher Tier Agreements (BEHTA)-style habitat baseline surveys.

## Current functions

- Site, parcel, agreement, surveyor and grassland metadata
- Grassland-type field guidance with automatic rules only where verified
- Multiple numbered quadrats with high-accuracy GPS, photographs and vegetation structure fields
- Survey-wide species pool so later quadrats use one-tap presence/absence recording
- Copy-previous-quadrat and clear-ticks shortcuts
- G02 semi-improved grassland indicator, typical-grass and injurious-weed highlighting based on the verified BEHTA source already documented in the app
- Species identification confidence: Certain, Probable or Needs checking
- Field completion panel with quadrat, GPS, species and identification-review status
- Statistics for richness, mean richness, species frequency and indicators
- End-of-survey review highlighting uncertain identifications and evidence requiring surveyor judgement
- Numbered quadrat map
- Local working-draft recovery on the device
- CSV and GeoJSON export
- Installable Progressive Web App (PWA) for phone/tablet use

## Methodology note

This application is not an official Natural England product. It records field evidence and only applies habitat-specific automatic interpretation where the relevant rule set has been explicitly verified. Quadrat frequency is not automatically converted into DAFOR or an official BEHTA abundance class.

## Railway deployment

Node.js 20+ is required. The start command is:

```bash
npm start
```

The application uses PostgreSQL when `DATABASE_URL` is supplied, with a local JSON fallback. For durable shared use, attach a persistent database rather than relying on Railway's ephemeral application filesystem.

Health endpoint: `/api/health`
