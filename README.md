# BEHTA Field Recorder

Mobile-first field recorder for Baseline Evaluation of Higher Tier Agreements (BEHTA)-style habitat baseline surveys.

## Current functions

- Site, parcel, agreement, surveyor and habitat metadata
- Multiple numbered quadrats per survey
- High-accuracy device GPS and accuracy value per quadrat
- Quadrat photographs
- Vegetation height, bare ground, scrub and litter fields
- Species lists with abundance and indicator status
- Survey and quadrat notes
- Quadrat map
- Persistent server storage using PostgreSQL when `DATABASE_URL` is supplied, with local JSON fallback
- CSV export of survey/quadrat/species data
- GeoJSON export of quadrat locations for GIS
- Installable PWA shell

## Important methodology note

This application is not an official Natural England product. It currently records field evidence without automatically applying habitat-specific BEHTA condition thresholds. Official scoring/condition logic should only be added against verified Natural England BEHTA guidance for the relevant feature code.

Natural England/RPA guidance describes BEHTA as recording the condition and extent of environmental features to provide a baseline against which future progress can be assessed.

## Railway deployment

Node.js 20+ is required. The start command is:

```bash
npm start
```

For shared multi-user use, attach a PostgreSQL database and expose its `DATABASE_URL` to this service. Without PostgreSQL the application uses a local JSON file, which is not appropriate for durable multi-user production storage on an ephemeral deployment.

Health endpoint: `/api/health`
