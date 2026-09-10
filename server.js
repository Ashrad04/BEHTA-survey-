const express = require('express');
const { Pool } = require('pg');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'surveys.json');
const usePostgres = Boolean(process.env.DATABASE_URL);
const pool = usePostgres ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: /sslmode=require/i.test(process.env.DATABASE_URL || '') ? { rejectUnauthorized: false } : undefined }) : null;

app.use(express.json({ limit: '12mb' }));
app.use(express.static(path.join(__dirname, 'public')));

async function initStorage() {
  if (usePostgres) {
    await pool.query(`CREATE TABLE IF NOT EXISTS behta_surveys (
      id UUID PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      site TEXT,
      parcel TEXT,
      survey_date DATE,
      surveyor TEXT,
      habitat_code TEXT,
      habitat_name TEXT,
      status TEXT,
      data JSONB NOT NULL
    );`);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_behta_site_date ON behta_surveys(site, survey_date DESC);');
  } else {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try { await fs.access(DATA_FILE); } catch { await fs.writeFile(DATA_FILE, '[]\n', 'utf8'); }
  }
}

async function readAll() {
  if (usePostgres) {
    const r = await pool.query('SELECT data FROM behta_surveys ORDER BY survey_date DESC, updated_at DESC');
    return r.rows.map(x => x.data);
  }
  return JSON.parse(await fs.readFile(DATA_FILE, 'utf8') || '[]');
}

async function writeAll(rows) { await fs.writeFile(DATA_FILE, JSON.stringify(rows, null, 2) + '\n', 'utf8'); }

function normaliseSurvey(body) {
  const clean = v => v == null ? '' : String(v).trim();
  const id = clean(body.id) || crypto.randomUUID();
  const quadrats = Array.isArray(body.quadrats) ? body.quadrats.map((q, i) => ({
    id: clean(q.id) || crypto.randomUUID(),
    number: Number(q.number) || i + 1,
    latitude: q.latitude === '' || q.latitude == null ? null : Number(q.latitude),
    longitude: q.longitude === '' || q.longitude == null ? null : Number(q.longitude),
    accuracy_m: q.accuracy_m === '' || q.accuracy_m == null ? null : Number(q.accuracy_m),
    grid_ref: clean(q.grid_ref),
    size_m: clean(q.size_m),
    vegetation_height_cm: clean(q.vegetation_height_cm),
    bare_ground_pct: clean(q.bare_ground_pct),
    scrub_pct: clean(q.scrub_pct),
    litter_pct: clean(q.litter_pct),
    notes: clean(q.notes),
    photo_data: typeof q.photo_data === 'string' && q.photo_data.startsWith('data:image/') ? q.photo_data : '',
    species: Array.isArray(q.species) ? q.species.map(s => ({
      common_name: clean(s.common_name), scientific_name: clean(s.scientific_name), abundance: clean(s.abundance), indicator: clean(s.indicator), notes: clean(s.notes)
    })).filter(s => s.common_name || s.scientific_name) : []
  })) : [];
  return {
    id,
    created_at: clean(body.created_at) || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    site: clean(body.site), parcel: clean(body.parcel), agreement_ref: clean(body.agreement_ref), surveyor: clean(body.surveyor),
    survey_date: clean(body.survey_date), habitat_code: clean(body.habitat_code), habitat_name: clean(body.habitat_name),
    management: clean(body.management), pressures: clean(body.pressures), feature_extent: clean(body.feature_extent),
    overall_condition: clean(body.overall_condition), condition_notes: clean(body.condition_notes), weather: clean(body.weather), status: clean(body.status) || 'Draft',
    quadrats
  };
}

async function saveSurvey(survey) {
  if (usePostgres) {
    await pool.query(`INSERT INTO behta_surveys(id, created_at, updated_at, site, parcel, survey_date, surveyor, habitat_code, habitat_name, status, data)
      VALUES($1,$2,$3,$4,$5,NULLIF($6,'')::date,$7,$8,$9,$10,$11::jsonb)
      ON CONFLICT(id) DO UPDATE SET updated_at=EXCLUDED.updated_at, site=EXCLUDED.site, parcel=EXCLUDED.parcel, survey_date=EXCLUDED.survey_date,
      surveyor=EXCLUDED.surveyor, habitat_code=EXCLUDED.habitat_code, habitat_name=EXCLUDED.habitat_name, status=EXCLUDED.status, data=EXCLUDED.data`,
      [survey.id,survey.created_at,survey.updated_at,survey.site,survey.parcel,survey.survey_date,survey.surveyor,survey.habitat_code,survey.habitat_name,survey.status,JSON.stringify(survey)]);
  } else {
    const all = await readAll();
    const idx = all.findIndex(x => x.id === survey.id);
    if (idx >= 0) all[idx] = survey; else all.push(survey);
    await writeAll(all);
  }
  return survey;
}

function csv(v) { const s = v == null ? '' : String(v).replace(/\r?\n/g,' '); return /[",]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s; }

app.get('/api/health', async (_req,res) => { try { if (usePostgres) await pool.query('SELECT 1'); res.json({ok:true, storage:usePostgres?'postgresql':'local-json'}); } catch(e){res.status(503).json({ok:false,error:e.message});} });
app.get('/api/surveys', async (_req,res) => { try { res.json({surveys: await readAll()}); } catch(e){res.status(500).json({error:e.message});} });
app.post('/api/surveys', async (req,res) => { try { const s = normaliseSurvey(req.body || {}); res.status(201).json({survey:await saveSurvey(s)}); } catch(e){res.status(400).json({error:e.message});} });
app.delete('/api/surveys/:id', async (req,res) => { try { if(usePostgres){await pool.query('DELETE FROM behta_surveys WHERE id=$1',[req.params.id]);} else {await writeAll((await readAll()).filter(x=>x.id!==req.params.id));} res.json({ok:true}); } catch(e){res.status(500).json({error:e.message});} });
app.get('/api/export.csv', async (_req,res) => {
  const surveys = await readAll();
  const cols = ['survey_id','site','parcel','agreement_ref','survey_date','surveyor','habitat_code','habitat_name','status','overall_condition','quadrat_number','latitude','longitude','accuracy_m','grid_ref','size_m','vegetation_height_cm','bare_ground_pct','scrub_pct','litter_pct','common_name','scientific_name','abundance','indicator','species_notes','quadrat_notes'];
  const rows=[cols.join(',')];
  for(const s of surveys){
    if(!s.quadrats?.length) rows.push(cols.map(c=>csv(({survey_id:s.id,...s})[c])).join(','));
    for(const q of s.quadrats||[]){
      const species=q.species?.length?q.species:[{}];
      for(const sp of species){ const o={survey_id:s.id,...s,quadrat_number:q.number,...q,...sp,species_notes:sp.notes,quadrat_notes:q.notes}; rows.push(cols.map(c=>csv(o[c])).join(',')); }
    }
  }
  res.setHeader('Content-Type','text/csv; charset=utf-8'); res.setHeader('Content-Disposition','attachment; filename="behta-surveys.csv"'); res.send(rows.join('\n'));
});
app.get('/api/export.geojson', async (_req,res) => {
  const surveys=await readAll(); const features=[];
  for(const s of surveys) for(const q of s.quadrats||[]) if(Number.isFinite(Number(q.latitude))&&Number.isFinite(Number(q.longitude))) features.push({type:'Feature',geometry:{type:'Point',coordinates:[Number(q.longitude),Number(q.latitude)]},properties:{survey_id:s.id,site:s.site,parcel:s.parcel,survey_date:s.survey_date,habitat_code:s.habitat_code,habitat_name:s.habitat_name,quadrat_number:q.number,grid_ref:q.grid_ref,species_count:q.species?.length||0}});
  res.setHeader('Content-Type','application/geo+json; charset=utf-8'); res.setHeader('Content-Disposition','attachment; filename="behta-quadrats.geojson"'); res.json({type:'FeatureCollection',features});
});
app.use((req,res)=> req.path.startsWith('/api/') ? res.status(404).json({error:'Not found'}) : res.sendFile(path.join(__dirname,'public','index.html')));

initStorage().then(()=>app.listen(PORT,'0.0.0.0',()=>console.log(`BEHTA Field Recorder listening on ${PORT}`))).catch(e=>{console.error(e);process.exit(1);});
