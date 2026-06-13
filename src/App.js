import { useState, useEffect, useRef, useCallback } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

// ─── CATALAN STRINGS ─────────────────────────────────────────────────────────
const T = {
  app:"CuinaReel", tabs:["Receptes","Nevera","Nutrició","Meal Prep","Pla","Compra"],
  tabIcons:["📖","🧊","📊","🥗","📅","🛒"],
  cats:["Totes","Esmorzar","Dinar","Sopar","Berenar","Postres","Snack"],
  days:["Dilluns","Dimarts","Dimecres","Dijous","Divendres","Dissabte","Diumenge"],
  mealTypes:["Esmorzar","Dinar","Sopar","Berenar"],
  fonts:["Instagram","TikTok","Twitter","YouTube","Altre"],
};

// ─── NUTRITION DATABASE (per 100g) ───────────────────────────────────────────
const NUTR_DB = {
  "ou":         {kcal:143,p:13,c:1,f:10},  "arròs":      {kcal:130,p:2.7,c:28,f:0.3},
  "pasta":      {kcal:131,p:5,c:25,f:1.1}, "patata":     {kcal:77,p:2,c:17,f:0.1},
  "pollastre":  {kcal:165,p:31,c:0,f:3.6}, "vedella":    {kcal:250,p:26,c:0,f:15},
  "salmó":      {kcal:208,p:20,c:0,f:13},  "tonyina":    {kcal:144,p:23,c:0,f:5},
  "llet":       {kcal:61,p:3.2,c:4.8,f:3.3},"iogurt":    {kcal:59,p:10,c:3.6,f:0.4},
  "formatge":   {kcal:402,p:25,c:1.3,f:33},"mantequilla":{kcal:717,p:0.9,c:0.1,f:81},
  "oli":        {kcal:884,p:0,c:0,f:100},  "farina":     {kcal:364,p:10,c:76,f:1},
  "pa":         {kcal:265,p:9,c:49,f:3.2}, "tomàquet":   {kcal:18,p:0.9,c:3.9,f:0.2},
  "ceba":       {kcal:40,p:1.1,c:9.3,f:0.1},"all":       {kcal:149,p:6.4,c:33,f:0.5},
  "espinacs":   {kcal:23,p:2.9,c:3.6,f:0.4},"bròcoli":   {kcal:34,p:2.8,c:7,f:0.4},
  "pastanaga":  {kcal:41,p:0.9,c:10,f:0.2},"pebrot":     {kcal:31,p:1,c:6,f:0.3},
  "albergínia": {kcal:25,p:1,c:5.9,f:0.2}, "carbassó":   {kcal:17,p:1.2,c:3.1,f:0.3},
  "lletuga":    {kcal:15,p:1.4,c:2.9,f:0.2},"cogombre":  {kcal:15,p:0.6,c:3.6,f:0.1},
  "maduixa":    {kcal:32,p:0.7,c:7.7,f:0.3},"poma":      {kcal:52,p:0.3,c:14,f:0.2},
  "plàtan":     {kcal:89,p:1.1,c:23,f:0.3},"taronja":    {kcal:47,p:0.9,c:12,f:0.1},
  "avocado":    {kcal:160,p:2,c:9,f:15},    "llimona":    {kcal:29,p:1.1,c:9.3,f:0.3},
  "ametlla":    {kcal:579,p:21,c:22,f:50},  "nous":       {kcal:654,p:15,c:14,f:65},
  "cigró":      {kcal:164,p:8.9,c:27,f:2.6},"llenties":  {kcal:116,p:9,c:20,f:0.4},
  "sucre":      {kcal:387,p:0,c:100,f:0},   "mel":        {kcal:304,p:0.3,c:82,f:0},
  "xocolata":   {kcal:546,p:5,c:60,f:31},   "crema":      {kcal:195,p:2.1,c:2.9,f:20},
  "gambes":     {kcal:85,p:20,c:0,f:0.5},   "musclos":    {kcal:86,p:12,c:4,f:2.2},
  "bacallà":    {kcal:82,p:18,c:0,f:0.7},   "pernil":     {kcal:145,p:21,c:0,f:6},
  "fideus":     {kcal:138,p:5,c:27,f:1.1},  "maizena":    {kcal:381,p:0.3,c:91,f:0.1},
};

const getNutr = (name) => {
  const k = Object.keys(NUTR_DB).find(k => name.toLowerCase().includes(k));
  return k ? NUTR_DB[k] : {kcal:50,p:2,c:8,f:1};
};

const unitToG = (qty, unit) => {
  const q = parseFloat(qty) || 1;
  const map = {g:1,kg:1000,ml:1,l:1000,cs:15,cc:5,grans:5,llesques:30,pessic:2,unitats:100,unitat:100};
  return q * (map[unit] || 1);
};

const calcNutr = (ingredients) => {
  let kcal=0,p=0,c=0,f=0;
  ingredients.forEach(i => {
    const g = unitToG(i.qty, i.unit);
    const n = getNutr(i.name);
    kcal += (n.kcal * g) / 100;
    p    += (n.p    * g) / 100;
    c    += (n.c    * g) / 100;
    f    += (n.f    * g) / 100;
  });
  return {kcal:Math.round(kcal),p:Math.round(p*10)/10,c:Math.round(c*10)/10,f:Math.round(f*10)/10};
};

// ─── SEED RECIPES ────────────────────────────────────────────────────────────
const SEED_RECIPES = [
  {id:"s1",title:"Fideuà de Marisc",source:"Instagram",emoji:"🦐",servings:4,prepTime:20,cookTime:35,cuisine:"Catalana",category:"Dinar",
   ingredients:[{name:"fideus",qty:"400",unit:"g"},{name:"gambes",qty:"300",unit:"g"},{name:"musclos",qty:"500",unit:"g"},{name:"tomàquet",qty:"200",unit:"g"},{name:"all",qty:"3",unit:"grans"},{name:"oli",qty:"4",unit:"cs"},{name:"brou de peix",qty:"1",unit:"l"},{name:"safrà",qty:"1",unit:"pessic"}],
   steps:["Sofregiu l'all i el tomàquet.","Afegiu els calamars.","Incorporeu els fideus i torreu-los.","Afegiu el brou amb safrà.","Afegiu les gambes i musclos.","Gratineu al forn 5 min."],
   tags:["Marisc","Fideuà"],savedAt:Date.now()-86400000},
  {id:"s2",title:"Pa amb Tomàquet",source:"TikTok",emoji:"🍅",servings:2,prepTime:5,cookTime:0,cuisine:"Catalana",category:"Esmorzar",
   ingredients:[{name:"pa",qty:"4",unit:"llesques"},{name:"tomàquet",qty:"2",unit:"unitats"},{name:"all",qty:"1",unit:"gra"},{name:"oli",qty:"3",unit:"cs"},{name:"sal",qty:"1",unit:"pessic"}],
   steps:["Tosta el pa.","Frega l'all.","Frega el tomàquet.","Oli i sal."],
   tags:["Ràpid","Vegà"],savedAt:Date.now()-3600000},
  {id:"s3",title:"Pit de Pollastre amb Verdures",source:"YouTube",emoji:"🍗",servings:2,prepTime:10,cookTime:25,cuisine:"Mediterrània",category:"Sopar",
   ingredients:[{name:"pollastre",qty:"300",unit:"g"},{name:"pebrot",qty:"2",unit:"unitats"},{name:"carbassó",qty:"1",unit:"unitat"},{name:"all",qty:"2",unit:"grans"},{name:"oli",qty:"2",unit:"cs"},{name:"llimona",qty:"1",unit:"unitat"}],
   steps:["Marina el pollastre amb all i llimona.","Talla les verdures.","Salteja el pollastre 8 min.","Afegeix les verdures i cuina 15 min."],
   tags:["Proteïna","Lleuger"],savedAt:Date.now()-7200000},
  {id:"s4",title:"Amanida de Cigrons i Espinacs",source:"Instagram",emoji:"🥗",servings:2,prepTime:10,cookTime:0,cuisine:"Mediterrània",category:"Dinar",
   ingredients:[{name:"cigró",qty:"200",unit:"g"},{name:"espinacs",qty:"100",unit:"g"},{name:"tomàquet",qty:"150",unit:"g"},{name:"ceba",qty:"0.5",unit:"unitat"},{name:"oli",qty:"2",unit:"cs"},{name:"llimona",qty:"0.5",unit:"unitat"}],
   steps:["Escorreu els cigrons.","Barregeu tots els ingredients.","Aliñeu amb oli i llimona."],
   tags:["Vegà","Proteïna","Ràpid"],savedAt:Date.now()-3600000*3},
];

const SEED_FRIDGE = [
  {id:"f1",name:"ous",qty:"6",unit:"unitats",category:"Làctics"},
  {id:"f2",name:"pollastre",qty:"400",unit:"g",category:"Proteïna"},
  {id:"f3",name:"espinacs",qty:"200",unit:"g",category:"Verdures"},
  {id:"f4",name:"tomàquet",qty:"3",unit:"unitats",category:"Verdures"},
  {id:"f5",name:"all",qty:"1",unit:"cap",category:"Condiments"},
  {id:"f6",name:"oli",qty:"500",unit:"ml",category:"Condiments"},
  {id:"f7",name:"pa",qty:"1",unit:"barra",category:"Cereals"},
  {id:"f8",name:"iogurt",qty:"4",unit:"unitats",category:"Làctics"},
];

const load = (k,d) => { try { return JSON.parse(localStorage.getItem(k))??d; } catch { return d; }};
const save = (k,v) => { try { localStorage.setItem(k,JSON.stringify(v)); } catch {} };

// ─── AI HELPERS ───────────────────────────────────────────────────────────────
async function callClaude(prompt, maxTokens=1200) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:maxTokens,messages:[{role:"user",content:prompt}]})
  });
  const data = await res.json();
  return data.content?.map(b=>b.text||"").join("")||"";
}

async function parseRecipe(text, source) {
  const raw = await callClaude(`Ets un analitzador de receptes en català. Extreu una recepta estructurada del text.
Retorna NOMÉS JSON vàlid (sense markdown) amb exactament:
{"title":"string","servings":number,"prepTime":number,"cookTime":number,"cuisine":"string",
"category":"Esmorzar|Dinar|Sopar|Berenar|Postres|Snack",
"ingredients":[{"name":"string","qty":"string","unit":"g|ml|unitats|cs|cc|grans|llesques|pessic|l|kg"}],
"steps":["string"],"tags":["string"],"emoji":"un emoji"}
Tradueix al català. Text: ${text}`, 1500);
  return JSON.parse(raw.replace(/```json|```/g,"").trim());
}

async function suggestFromFridge(fridgeItems, recipes) {
  const names = fridgeItems.map(f=>f.name).join(", ");
  const recipeList = recipes.map(r=>`- ${r.title} (necessita: ${r.ingredients.map(i=>i.name).join(", ")})`).join("\n");
  const raw = await callClaude(`Tens a la nevera: ${names}
Receptes disponibles:
${recipeList}
Analitza quines receptes es poden fer amb els ingredients de la nevera i quins ingredients falten.
Retorna NOMÉS JSON: {"suggestions":[{"recipeTitle":"string","canMake":boolean,"matchScore":number,"missingIngredients":["string"]}]}
Ordena per matchScore descendent.`, 800);
  return JSON.parse(raw.replace(/```json|```/g,"").trim()).suggestions || [];
}

async function getNutritionSuggestions(dayMeals, recipes) {
  const mealsInfo = dayMeals.map(m => {
    const r = recipes.find(x=>x.id===m.recipeId);
    if (!r) return null;
    const n = calcNutr(r.ingredients);
    return `${m.mealType}: ${r.title} (${n.kcal}kcal, P:${n.p}g, C:${n.c}g, G:${n.f}g)`;
  }).filter(Boolean).join("\n");
  
  const raw = await callClaude(`Sóc nutricionista. Avui he menjat:\n${mealsInfo}\nDóna'm 3 suggerències concretes en català per millorar el balanç nutricional avui. 
Retorna NOMÉS JSON: {"suggestions":["string","string","string"],"balance":{"status":"ok|low_protein|high_carb|low_fat|unbalanced","message":"string"}}`, 600);
  return JSON.parse(raw.replace(/```json|```/g,"").trim());
}

async function getMealPrepPlan(recipes, day) {
  const recipeList = recipes.slice(0,8).map(r=>`${r.title} (${r.category}, ${r.prepTime+r.cookTime}min)`).join("\n");
  const raw = await callClaude(`Crea un pla de meal prep per ${day} en català. Tenim aquestes receptes: \n${recipeList}
Retorna NOMÉS JSON: {"plan":[{"title":"string","tasks":["string"],"duration":number,"tip":"string"}],"totalTime":number,"tip":"string"}
Cada element del pla és una tasca de preparació (cuinar en batch, tallar verdures, marinar, etc.)`, 900);
  return JSON.parse(raw.replace(/```json|```/g,"").trim());
}

// Simulated barcode lookup (in production: use Open Food Facts API)
async function lookupBarcode(barcode) {
  const raw = await callClaude(`Simula una resposta de la API Open Food Facts per al codi de barres ${barcode}.
Retorna NOMÉS JSON: {"name":"nom producte en català","brand":"marca","kcal":number,"p":number,"c":number,"f":number,"fiber":number,"sugar":number,"salt":number,"serving":"100g","image":"emoji"}
Inventa un producte real plausible (iogurt, cereals, galetes, llet, etc.)`, 400);
  return JSON.parse(raw.replace(/```json|```/g,"").trim());
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;1,300&family=Nunito:wght@300;400;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#08090A; --s1:#0F1318; --s2:#161C22; --s3:#1D252E;
  --border:#252D38; --border2:#2E3A48;
  --cyan:#00E5C8; --lime:#A8E63C; --amber:#F5A623; --rose:#FF5C7A; --violet:#9B6BFF;
  --text:#ECF0F4; --muted:#5A6A7A; --muted2:#8A9AAA;
  --gradient: linear-gradient(135deg,#00E5C8,#A8E63C);
}
body{background:var(--bg);font-family:'Nunito',sans-serif;color:var(--text);overscroll-behavior:none;}
.app{max-width:430px;min-height:100vh;margin:0 auto;background:var(--bg);position:relative;}

/* ── NAV ── */
.top-bar{background:var(--s1);padding:14px 16px 0;border-bottom:1px solid var(--border);position:sticky;top:0;z-index:80;}
.top-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
.logo{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;background:var(--gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.top-badge{background:var(--s3);border:1px solid var(--border2);color:var(--cyan);font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;font-family:'DM Mono',monospace;}
.search-wrap{position:relative;margin-bottom:10px;}
.search-in{width:100%;padding:10px 14px 10px 36px;background:var(--s2);border:1px solid var(--border);border-radius:10px;font-family:'Nunito',sans-serif;font-size:14px;color:var(--text);outline:none;transition:border-color .2s;}
.search-in::placeholder{color:var(--muted);}
.search-in:focus{border-color:var(--cyan);}
.s-icon{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:14px;}

/* ── CHIP ROW ── */
.chip-row{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:0 0 10px;}
.chip-row::-webkit-scrollbar{display:none;}
.chip{flex-shrink:0;padding:5px 13px;border-radius:20px;font-size:11px;font-weight:700;border:1px solid var(--border);background:var(--s2);cursor:pointer;color:var(--muted2);transition:all .15s;font-family:'Syne',sans-serif;letter-spacing:.3px;}
.chip.on{background:var(--cyan);border-color:var(--cyan);color:#08090A;}

/* ── BOTTOM NAV ── */
.bnav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:var(--s1);border-top:1px solid var(--border);display:flex;z-index:80;padding-bottom:env(safe-area-inset-bottom,0);}
.ni{flex:1;padding:8px 0 6px;text-align:center;cursor:pointer;transition:all .18s;position:relative;}
.ni-icon{font-size:20px;display:block;transition:transform .2s;}
.ni.on .ni-icon{transform:scale(1.2);}
.ni-label{font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--muted);font-family:'Syne',sans-serif;margin-top:2px;}
.ni.on .ni-label{color:var(--cyan);}
.ni-dot{position:absolute;top:6px;right:calc(50% - 14px);width:6px;height:6px;border-radius:50%;background:var(--rose);}

/* ── FEED ── */
.feed{padding:12px 12px 90px;display:flex;flex-direction:column;gap:10px;}

/* ── RECIPE CARD ── */
.rcard{background:var(--s1);border-radius:14px;overflow:hidden;border:1px solid var(--border);cursor:pointer;transition:border-color .2s,transform .15s;animation:up .3s both;}
@keyframes up{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
.rcard:hover{border-color:var(--cyan);}
.rcard:active{transform:scale(0.97);}
.card-hero{width:100%;height:130px;background:var(--s3);display:flex;align-items:center;justify-content:center;font-size:56px;position:relative;}
.cat-pill{position:absolute;top:8px;left:8px;background:rgba(8,9,10,.8);color:var(--lime);font-size:10px;font-weight:700;padding:3px 8px;border-radius:8px;border:1px solid var(--border2);font-family:'DM Mono',monospace;}
.nutr-pill{position:absolute;top:8px;right:8px;background:rgba(8,9,10,.8);color:var(--amber);font-size:10px;font-weight:700;padding:3px 8px;border-radius:8px;border:1px solid var(--border2);font-family:'DM Mono',monospace;}
.cb{padding:11px 13px 13px;}
.csrc{font-size:9px;font-weight:700;color:var(--muted2);letter-spacing:1px;text-transform:uppercase;margin-bottom:3px;font-family:'DM Mono',monospace;}
.ctitle{font-family:'Syne',sans-serif;font-size:17px;color:var(--text);margin-bottom:7px;font-weight:700;line-height:1.25;}
.cmeta{display:flex;gap:10px;margin-bottom:8px;font-size:11px;color:var(--muted2);}
.tags{display:flex;flex-wrap:wrap;gap:4px;}
.tag{background:var(--s3);color:var(--muted2);font-size:10px;padding:2px 8px;border-radius:6px;font-weight:600;border:1px solid var(--border);}
.tag.hl{background:rgba(0,229,200,.12);color:var(--cyan);border-color:rgba(0,229,200,.3);}

/* ── MACROS BAR ── */
.macro-bar{display:flex;height:4px;border-radius:4px;overflow:hidden;margin:8px 0 4px;gap:1px;}
.mb-p{background:var(--cyan);}
.mb-c{background:var(--amber);}
.mb-f{background:var(--rose);}
.macro-labels{display:flex;gap:10px;font-size:10px;font-family:'DM Mono',monospace;}
.ml-p{color:var(--cyan);}
.ml-c{color:var(--amber);}
.ml-f{color:var(--rose);}

/* ── EMPTY ── */
.empty{text-align:center;padding:50px 20px;}
.empty-emoji{font-size:56px;margin-bottom:12px;}
.empty-t{font-family:'Syne',sans-serif;font-size:20px;margin-bottom:6px;font-weight:700;}
.empty-s{font-size:13px;color:var(--muted2);line-height:1.6;}

/* ── OVERLAY & SHEET ── */
.overlay{position:fixed;inset:0;background:rgba(8,9,10,.85);z-index:200;display:flex;align-items:flex-end;animation:fi .18s;}
@keyframes fi{from{opacity:0;}to{opacity:1;}}
.sheet{width:100%;max-width:430px;margin:0 auto;background:var(--s1);border-radius:20px 20px 0 0;padding:0 0 36px;max-height:93vh;overflow-y:auto;animation:su .26s cubic-bezier(.34,1.26,.64,1);}
@keyframes su{from{transform:translateY(100%);}to{transform:translateY(0);}}
.handle{width:36px;height:4px;background:var(--border2);border-radius:4px;margin:10px auto 0;}
.sh{padding:12px 16px 0;display:flex;align-items:center;justify-content:space-between;}
.st{font-family:'Syne',sans-serif;font-size:19px;font-weight:800;color:var(--text);}
.x{width:28px;height:28px;border-radius:50%;background:var(--s3);border:none;font-size:13px;cursor:pointer;color:var(--muted2);display:flex;align-items:center;justify-content:center;}
.sb{padding:16px;}

/* ── FORM ── */
.lbl{font-size:10px;font-weight:700;color:var(--muted2);letter-spacing:.8px;text-transform:uppercase;margin-bottom:5px;display:block;font-family:'DM Mono',monospace;}
.inp,.sel,.ta{width:100%;padding:10px 12px;background:var(--s2);border:1px solid var(--border);border-radius:10px;font-family:'Nunito',sans-serif;font-size:13px;color:var(--text);outline:none;transition:border-color .2s;resize:none;}
.inp::placeholder,.ta::placeholder{color:var(--muted);}
.inp:focus,.sel:focus,.ta:focus{border-color:var(--cyan);}
.sel option{background:var(--s2);}
.ta{min-height:100px;line-height:1.6;}
.fg{margin-bottom:14px;}
.pills{display:flex;gap:6px;flex-wrap:wrap;}
.pill{padding:6px 12px;border-radius:20px;border:1px solid var(--border);font-size:12px;font-weight:700;cursor:pointer;background:var(--s2);color:var(--muted2);transition:all .15s;}
.pill.on{background:var(--cyan);color:#08090A;border-color:var(--cyan);}
.btn{width:100%;padding:13px;border:none;border-radius:12px;font-family:'Syne',sans-serif;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:opacity .2s,transform .15s;letter-spacing:.3px;}
.btn-c{background:var(--cyan);color:#08090A;}
.btn-c:disabled{opacity:.4;cursor:default;}
.btn-c:not(:disabled):active{transform:scale(.97);}
.btn-g{background:var(--gradient);color:#08090A;margin-top:8px;}
.btn-out{background:transparent;color:var(--rose);border:1px solid var(--rose);margin-top:8px;}
.btn-ghost{background:transparent;color:var(--muted2);border:1px solid var(--border);margin-top:8px;}
.status{border-radius:10px;padding:10px 12px;font-size:12px;line-height:1.5;margin-bottom:12px;font-family:'DM Mono',monospace;}
.ok{background:rgba(168,230,60,.1);border:1px solid rgba(168,230,60,.3);color:var(--lime);}
.err{background:rgba(255,92,122,.1);border:1px solid rgba(255,92,122,.3);color:var(--rose);}
.info{background:rgba(0,229,200,.08);border:1px solid rgba(0,229,200,.25);color:var(--cyan);}

/* ── DETAIL ── */
.dh{width:100%;height:180px;background:var(--s3);display:flex;align-items:center;justify-content:center;font-size:80px;}
.db{padding:16px;}
.dsrc{font-size:10px;font-weight:700;color:var(--muted2);letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;font-family:'DM Mono',monospace;}
.dtitle{font-family:'Syne',sans-serif;font-size:24px;font-weight:800;color:var(--text);margin-bottom:12px;line-height:1.2;}
.meta-grid{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:16px;}
.mc{padding:12px 0;text-align:center;background:var(--s2);}
.mc+.mc{border-left:1px solid var(--border);}
.mv{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:var(--cyan);}
.ml{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-top:2px;font-family:'DM Mono',monospace;}
.sect{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:var(--text);margin:16px 0 10px;}
.ing-list{list-style:none;}
.ii{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px;}
.idot{width:7px;height:7px;border-radius:50%;background:var(--amber);flex-shrink:0;}
.iqty{color:var(--amber);font-weight:700;min-width:70px;font-family:'DM Mono',monospace;font-size:12px;}
.iname{color:var(--text);}
.ii.m .idot{background:var(--cyan);}
.ii.m .iname{color:var(--cyan);}
.step-list{list-style:none;}
.si{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid var(--border);font-size:13px;line-height:1.6;color:var(--muted2);}
.sn{width:22px;height:22px;border-radius:50%;background:var(--cyan);color:#08090A;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;}

/* ── FRIDGE ── */
.fridge-grid{padding:12px 12px 90px;display:flex;flex-direction:column;gap:10px;}
.fridge-header{display:flex;align-items:center;justify-content:space-between;padding:4px 0 8px;}
.fh-title{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;}
.fi-card{background:var(--s1);border-radius:12px;border:1px solid var(--border);overflow:hidden;}
.fi-header{padding:10px 14px;background:var(--s2);display:flex;align-items:center;justify-content:space-between;}
.fi-cat{font-family:'Syne',sans-serif;font-size:12px;font-weight:700;color:var(--muted2);}
.fi-item{display:flex;align-items:center;gap:10px;padding:10px 14px;border-top:1px solid var(--border);}
.fi-name{flex:1;font-size:13px;font-weight:600;}
.fi-qty{font-family:'DM Mono',monospace;font-size:12px;color:var(--amber);}
.fi-del{background:none;border:none;color:var(--muted);cursor:pointer;font-size:16px;padding:2px 6px;}
.fi-del:hover{color:var(--rose);}
.match-card{background:var(--s1);border-radius:12px;border:1px solid var(--border);padding:14px;}
.match-score{display:flex;align-items:center;gap:8px;margin-bottom:8px;}
.score-bar{flex:1;height:6px;background:var(--s3);border-radius:4px;overflow:hidden;}
.score-fill{height:100%;background:var(--gradient);border-radius:4px;transition:width .4s;}
.score-pct{font-family:'DM Mono',monospace;font-size:12px;color:var(--cyan);}
.match-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;margin-bottom:6px;}
.missing-list{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px;}
.missing-tag{background:rgba(255,92,122,.1);color:var(--rose);font-size:10px;padding:2px 8px;border-radius:6px;border:1px solid rgba(255,92,122,.3);}

/* ── NUTRITION TAB ── */
.nutr-wrap{padding:12px 12px 90px;}
.nutr-day-selector{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin-bottom:14px;}
.nutr-day-selector::-webkit-scrollbar{display:none;}
.dchip{flex-shrink:0;padding:6px 12px;border-radius:8px;font-size:11px;font-weight:700;border:1px solid var(--border);background:var(--s2);cursor:pointer;color:var(--muted2);transition:all .15s;font-family:'Syne',sans-serif;}
.dchip.on{background:var(--lime);border-color:var(--lime);color:#08090A;}
.nutr-summary{background:var(--s1);border-radius:14px;border:1px solid var(--border);padding:16px;margin-bottom:14px;}
.nutr-kcal{font-family:'Syne',sans-serif;font-size:44px;font-weight:800;background:var(--gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-align:center;line-height:1;}
.nutr-kcal-label{font-size:11px;color:var(--muted2);text-align:center;font-family:'DM Mono',monospace;margin-bottom:14px;}
.macro-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;}
.macro-cell{background:var(--s2);border-radius:10px;padding:10px;text-align:center;border:1px solid var(--border);}
.macro-val{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;}
.macro-lbl{font-size:10px;color:var(--muted2);font-family:'DM Mono',monospace;margin-top:2px;}
.chart-wrap{height:180px;margin-bottom:10px;}
.suggestion-card{background:var(--s2);border-radius:10px;padding:12px;border-left:3px solid var(--violet);margin-bottom:8px;}
.sug-text{font-size:13px;color:var(--muted2);line-height:1.5;}
.scan-area{background:var(--s2);border-radius:14px;border:1px solid var(--border);padding:20px;text-align:center;margin-bottom:14px;}
.scan-icon{font-size:48px;margin-bottom:10px;}
.scan-title{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;margin-bottom:6px;}
.scan-sub{font-size:12px;color:var(--muted2);margin-bottom:14px;}
.barcode-in{width:100%;padding:10px 12px;background:var(--s1);border:1px solid var(--border);border-radius:10px;font-family:'DM Mono',monospace;font-size:16px;color:var(--text);outline:none;text-align:center;letter-spacing:2px;}
.barcode-in:focus{border-color:var(--cyan);}
.product-card{background:var(--s1);border-radius:12px;border:1px solid var(--border);padding:14px;margin-bottom:12px;}
.product-row{display:flex;align-items:center;gap:12px;margin-bottom:12px;}
.product-emoji{font-size:42px;}
.product-name{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;}
.product-brand{font-size:12px;color:var(--muted2);font-family:'DM Mono',monospace;}
.product-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;}
.pg{background:var(--s2);border-radius:8px;padding:8px;text-align:center;border:1px solid var(--border);}
.pg-v{font-family:'Syne',sans-serif;font-size:15px;font-weight:800;}
.pg-l{font-size:9px;color:var(--muted2);font-family:'DM Mono',monospace;margin-top:1px;}

/* ── MEAL PREP ── */
.prep-wrap{padding:12px 12px 90px;}
.prep-card{background:var(--s1);border-radius:14px;border:1px solid var(--border);padding:16px;margin-bottom:10px;}
.prep-title{font-family:'Syne',sans-serif;font-size:16px;font-weight:800;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;}
.prep-dur{font-family:'DM Mono',monospace;font-size:12px;color:var(--cyan);}
.prep-tasks{margin-top:10px;}
.pt{display:flex;align-items:flex-start;gap:8px;padding:6px 0;border-top:1px solid var(--border);font-size:12px;color:var(--muted2);}
.pt-dot{width:6px;height:6px;border-radius:50%;background:var(--lime);flex-shrink:0;margin-top:4px;}
.prep-tip{font-size:11px;color:var(--amber);font-style:italic;margin-top:8px;padding-top:8px;border-top:1px solid var(--border);}
.day-pill-row{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;margin-bottom:14px;}
.day-pill-row::-webkit-scrollbar{display:none;}
.dp{flex-shrink:0;padding:8px 14px;border-radius:10px;border:1px solid var(--border);background:var(--s2);font-size:12px;font-weight:700;cursor:pointer;color:var(--muted2);font-family:'Syne',sans-serif;}
.dp.on{background:var(--lime);border-color:var(--lime);color:#08090A;}

/* ── PLANNER ── */
.plan-wrap{padding:12px 12px 90px;display:flex;flex-direction:column;gap:8px;}
.day-card{background:var(--s1);border-radius:12px;border:1px solid var(--border);}
.day-hd{padding:10px 14px;background:var(--s2);border-radius:12px 12px 0 0;display:flex;align-items:center;justify-content:space-between;}
.day-nm{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;}
.day-kcal{font-family:'DM Mono',monospace;font-size:11px;color:var(--amber);}
.meal-row{display:flex;align-items:center;gap:10px;padding:9px 14px;border-top:1px solid var(--border);cursor:pointer;}
.meal-row:active{background:var(--s2);}
.meal-emoji{font-size:24px;flex-shrink:0;}
.meal-info{flex:1;min-width:0;}
.meal-t{font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.meal-s{font-size:10px;color:var(--muted2);font-family:'DM Mono',monospace;margin-top:1px;}
.meal-x{background:none;border:none;color:var(--muted);cursor:pointer;font-size:14px;padding:4px;}
.day-empty{padding:10px 14px;font-size:12px;color:var(--muted);}

/* ── SHOPPING ── */
.shop-wrap{padding:12px 12px 90px;}
.shop-section-title{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:var(--muted2);letter-spacing:.5px;text-transform:uppercase;margin:10px 0 6px;}
.shop-item{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--s1);border-radius:10px;border:1px solid var(--border);cursor:pointer;margin-bottom:4px;transition:opacity .18s;}
.shop-item.done{opacity:.35;}
.check{width:20px;height:20px;border-radius:6px;border:2px solid var(--border2);background:transparent;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .18s;font-size:11px;font-weight:700;}
.shop-item.done .check{background:var(--cyan);border-color:var(--cyan);color:#08090A;}
.sname{flex:1;font-size:13px;}
.shop-item.done .sname{text-decoration:line-through;color:var(--muted);}
.sqty{font-family:'DM Mono',monospace;font-size:11px;color:var(--amber);}
.add-to-shop{display:flex;gap:6px;margin-bottom:14px;}
.add-shop-in{flex:1;padding:9px 12px;background:var(--s2);border:1px solid var(--border);border-radius:10px;font-family:'Nunito',sans-serif;font-size:13px;color:var(--text);outline:none;}
.add-shop-in:focus{border-color:var(--cyan);}
.add-shop-btn{padding:9px 14px;background:var(--cyan);border:none;border-radius:10px;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#08090A;cursor:pointer;}

/* ── SPINNER ── */
.spin{width:16px;height:16px;border:2px solid rgba(8,9,10,.3);border-top-color:#08090A;border-radius:50%;animation:ro .7s linear infinite;display:inline-block;}
@keyframes ro{to{transform:rotate(360deg);}}

/* ── FAB ── */
.fab{position:fixed;bottom:66px;right:50%;transform:translateX(50%);background:var(--gradient);color:#08090A;border:none;border-radius:28px;padding:13px 22px;font-family:'Syne',sans-serif;font-size:14px;font-weight:800;display:flex;align-items:center;gap:7px;box-shadow:0 4px 20px rgba(0,229,200,.3);cursor:pointer;z-index:70;white-space:nowrap;letter-spacing:.3px;}
.fab:active{transform:translateX(50%) scale(.96);}

/* ── ADD TO PLAN ── */
.day-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;margin-bottom:12px;}
.dbtn{padding:7px 0;border-radius:8px;border:1px solid var(--border);background:var(--s2);color:var(--muted2);font-size:10px;font-weight:700;cursor:pointer;text-align:center;font-family:'Syne',sans-serif;}
.dbtn.on{background:var(--cyan);border-color:var(--cyan);color:#08090A;}

/* ── RECHARTS overrides ── */
.recharts-tooltip-wrapper{font-size:12px!important;}
`;

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [recipes,   setRecipes]   = useState(() => load("rv3_recipes",   SEED_RECIPES));
  const [fridge,    setFridge]    = useState(() => load("rv3_fridge",    SEED_FRIDGE));
  const [plan,      setPlan]      = useState(() => load("rv3_plan",      {}));
  const [bought,    setBought]    = useState(() => load("rv3_bought",    {}));
  const [extraShop, setExtraShop] = useState(() => load("rv3_extrashop", []));
  const [tab,       setTab]       = useState(0);
  const [query,     setQuery]     = useState("");
  const [category,  setCategory]  = useState("Totes");
  const [showImport,setShowImport]= useState(false);
  const [detailId,  setDetailId]  = useState(null);
  const [addPlanId, setAddPlanId] = useState(null);

  useEffect(()=>{ save("rv3_recipes",recipes); },[recipes]);
  useEffect(()=>{ save("rv3_fridge",fridge); },[fridge]);
  useEffect(()=>{ save("rv3_plan",plan); },[plan]);
  useEffect(()=>{ save("rv3_bought",bought); },[bought]);
  useEffect(()=>{ save("rv3_extrashop",extraShop); },[extraShop]);

  const detail = recipes.find(r=>r.id===detailId)||null;
  const hl = query.toLowerCase().trim();

  const filtered = recipes.filter(r => {
    const mQ = !hl || r.title.toLowerCase().includes(hl) ||
      r.ingredients.some(i=>i.name.toLowerCase().includes(hl)) ||
      r.tags.some(t=>t.toLowerCase().includes(hl));
    const mC = category==="Totes" || r.category===category;
    return mQ && mC;
  });

  const addRecipe = r => setRecipes(prev=>[{...r,id:Date.now().toString(),savedAt:Date.now()},...prev]);
  const delRecipe = id => { setRecipes(prev=>prev.filter(r=>r.id!==id)); setDetailId(null); };
  const addToPlan = (rid,day,mealType) => {
    setPlan(prev=>({...prev,[day]:[...(prev[day]||[]),{recipeId:rid,mealType}]}));
    setAddPlanId(null);
  };
  const removeFromPlan = (day,idx) => setPlan(prev=>{const a=[...(prev[day]||[])];a.splice(idx,1);return{...prev,[day]:a};});

  // Shopping: planned ingredients + extra
  const plannedItems = (() => {
    const agg={};
    Object.values(plan).flat().forEach(({recipeId})=>{
      const r=recipes.find(x=>x.id===recipeId); if(!r) return;
      r.ingredients.forEach(i=>{
        const k=i.name.toLowerCase();
        const inFridge = fridge.some(f=>f.name.toLowerCase().includes(k)||k.includes(f.name.toLowerCase()));
        if(!agg[k]) agg[k]={name:i.name,qty:parseFloat(i.qty)||0,unit:i.unit,fromFridge:inFridge};
        else agg[k].qty += parseFloat(i.qty)||0;
      });
    });
    return Object.values(agg);
  })();

  const tabBadge = [0,0,0,0,0,plannedItems.filter(i=>!i.fromFridge&&!bought[i.name.toLowerCase()]).length].map(n=>n>0?n:0);

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {tab===0 && (
          <div className="top-bar">
            <div className="top-row">
              <div className="logo">{T.app}</div>
              <span className="top-badge">{recipes.length} receptes</span>
            </div>
            <div className="search-wrap">
              <span className="s-icon">🔍</span>
              <input className="search-in" placeholder="Cerca ingredient, plat…" value={query} onChange={e=>setQuery(e.target.value)}/>
            </div>
            <div className="chip-row">
              {T.cats.map(c=><div key={c} className={`chip ${category===c?"on":""}`} onClick={()=>setCategory(c)}>{c}</div>)}
            </div>
          </div>
        )}

        {tab===0 && <RecipesTab filtered={filtered} hl={hl} onDetail={setDetailId} onPlan={setAddPlanId}/>}
        {tab===1 && <FridgeTab fridge={fridge} setFridge={setFridge} recipes={recipes} onDetail={setDetailId}/>}
        {tab===2 && <NutritionTab plan={plan} recipes={recipes} fridge={fridge}/>}
        {tab===3 && <MealPrepTab recipes={recipes} plan={plan}/>}
        {tab===4 && <PlannerTab plan={plan} recipes={recipes} onRemove={removeFromPlan} onDetail={setDetailId}/>}
        {tab===5 && <ShoppingTab plannedItems={plannedItems} extraShop={extraShop} setExtraShop={setExtraShop} bought={bought} setBought={setBought}/>}

        {tab===0 && <button className="fab" onClick={()=>setShowImport(true)}>＋ Importar recepta</button>}

        <div className="bnav">
          {T.tabs.map((name,i)=>(
            <div key={i} className={`ni ${tab===i?"on":""}`} onClick={()=>setTab(i)}>
              <span className="ni-icon">{T.tabIcons[i]}</span>
              <span className="ni-label">{name}</span>
              {tabBadge[i]>0 && <span className="ni-dot"/>}
            </div>
          ))}
        </div>

        {showImport && <ImportSheet onClose={()=>setShowImport(false)} onSave={r=>{addRecipe(r);setShowImport(false);}}/>}
        {detail && <DetailSheet recipe={detail} hl={hl} onClose={()=>setDetailId(null)} onDelete={()=>delRecipe(detail.id)} onPlan={()=>{setAddPlanId(detail.id);setDetailId(null);}}/>}
        {addPlanId && <AddToPlanSheet recipe={recipes.find(r=>r.id===addPlanId)} onClose={()=>setAddPlanId(null)} onAdd={addToPlan}/>}
      </div>
    </>
  );
}

// ─── RECIPES TAB ─────────────────────────────────────────────────────────────
function RecipesTab({filtered,hl,onDetail,onPlan}) {
  if(filtered.length===0) return(
    <div className="feed"><div className="empty"><div className="empty-emoji">{hl?"🔎":"🍽️"}</div>
    <div className="empty-t">{hl?"Cap resultat":"Receptari buit"}</div>
    <div className="empty-s">{hl?"Prova un altre ingredient.":"Importa la teva primera recepta!"}</div></div></div>
  );
  return (
    <div className="feed">
      {filtered.map((r,i)=>{
        const n=calcNutr(r.ingredients);
        const tot=n.p+n.c+n.f||1;
        return (
          <div key={r.id} className="rcard" style={{animationDelay:`${i*40}ms`}} onClick={()=>onDetail(r.id)}>
            <div className="card-hero">{r.emoji}
              <div className="cat-pill">{r.category}</div>
              <div className="nutr-pill">{n.kcal} kcal</div>
            </div>
            <div className="cb">
              <div className="csrc">{srcIcon(r.source)} {r.source} · {r.cuisine}</div>
              <div className="ctitle">{r.title}</div>
              <div className="cmeta">
                {(r.prepTime+r.cookTime)>0&&<span>⏱ {r.prepTime+r.cookTime}min</span>}
                <span>👤 {r.servings}p</span>
              </div>
              <div className="macro-bar">
                <div className="mb-p" style={{width:`${(n.p/tot*100).toFixed(0)}%`}}/>
                <div className="mb-c" style={{width:`${(n.c/tot*100).toFixed(0)}%`}}/>
                <div className="mb-f" style={{width:`${(n.f/tot*100).toFixed(0)}%`}}/>
              </div>
              <div className="macro-labels">
                <span className="ml-p">P {n.p}g</span>
                <span className="ml-c">C {n.c}g</span>
                <span className="ml-f">G {n.f}g</span>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:8}}>
                <div className="tags">
                  {r.tags.slice(0,3).map(t=><span key={t} className={`tag ${hl&&t.toLowerCase().includes(hl)?"hl":""}`}>{t}</span>)}
                  {hl&&r.ingredients.some(i=>i.name.toLowerCase().includes(hl))&&<span className="tag hl">🎯{hl}</span>}
                </div>
                <button style={{background:"var(--s3)",border:"1px solid var(--border)",borderRadius:"7px",padding:"4px 8px",fontSize:"14px",cursor:"pointer",color:"var(--cyan)"}} onClick={e=>{e.stopPropagation();onPlan(r.id);}}>📅</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── FRIDGE TAB ───────────────────────────────────────────────────────────────
function FridgeTab({fridge,setFridge,recipes,onDetail}) {
  const [showAdd,setShowAdd]=useState(false);
  const [newName,setNewName]=useState(""); const [newQty,setNewQty]=useState(""); const [newUnit,setNewUnit]=useState("g"); const [newCat,setNewCat]=useState("Verdures");
  const [suggestions,setSuggestions]=useState(null);
  const [loading,setLoading]=useState(false);
  const fridgeCats=[...new Set(fridge.map(f=>f.category))];

  const addItem=()=>{
    if(!newName.trim()) return;
    setFridge(p=>[...p,{id:Date.now().toString(),name:newName.trim(),qty:newQty,unit:newUnit,category:newCat}]);
    setNewName("");setNewQty("");setShowAdd(false);
  };
  const delItem=id=>setFridge(p=>p.filter(x=>x.id!==id));

  const getSuggestions=async()=>{
    setLoading(true); setSuggestions(null);
    try{const s=await suggestFromFridge(fridge,recipes);setSuggestions(s);}catch{}
    setLoading(false);
  };

  return(
    <div className="fridge-grid">
      <div className="fridge-header">
        <div>
          <div className="fh-title">🧊 La meva Nevera</div>
          <div style={{fontSize:12,color:"var(--muted2)"}}>Gestiona els teus ingredients</div>
        </div>
        <button className="btn btn-c" style={{width:"auto",padding:"8px 14px",fontSize:13}} onClick={()=>setShowAdd(!showAdd)}>＋ Afegir</button>
      </div>

      {showAdd&&(
        <div style={{background:"var(--s1)",borderRadius:12,border:"1px solid var(--border)",padding:14,marginBottom:4}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 80px 80px",gap:6,marginBottom:8}}>
            <input className="inp" placeholder="Ingredient" value={newName} onChange={e=>setNewName(e.target.value)}/>
            <input className="inp" placeholder="Qttat" value={newQty} onChange={e=>setNewQty(e.target.value)}/>
            <select className="sel" value={newUnit} onChange={e=>setNewUnit(e.target.value)}>
              {["g","kg","ml","l","unitats","llesques","cs"].map(u=><option key={u}>{u}</option>)}
            </select>
          </div>
          <div style={{display:"flex",gap:6,marginBottom:8}}>
            {["Verdures","Proteïna","Làctics","Cereals","Condiments","Fruita","Altre"].map(c=>(
              <div key={c} className={`chip ${newCat===c?"on":""}`} style={{fontSize:10,padding:"4px 8px"}} onClick={()=>setNewCat(c)}>{c}</div>
            ))}
          </div>
          <button className="btn btn-c" onClick={addItem}>Afegir a la nevera</button>
        </div>
      )}

      {fridgeCats.map(cat=>(
        <div key={cat} className="fi-card">
          <div className="fi-header"><span className="fi-cat">{cat}</span><span style={{fontSize:11,color:"var(--muted)",fontFamily:"'DM Mono',monospace"}}>{fridge.filter(f=>f.category===cat).length} ítems</span></div>
          {fridge.filter(f=>f.category===cat).map(fi=>(
            <div key={fi.id} className="fi-item">
              <span style={{fontSize:18}}>{fridgeEmoji(fi.category)}</span>
              <span className="fi-name">{fi.name}</span>
              <span className="fi-qty">{fi.qty} {fi.unit}</span>
              <button className="fi-del" onClick={()=>delItem(fi.id)}>✕</button>
            </div>
          ))}
        </div>
      ))}

      <button className="btn btn-g" onClick={getSuggestions} disabled={loading}>
        {loading?<><span className="spin"/>Analitzant…</>:"🤖 Quines receptes puc fer?"}
      </button>

      {suggestions&&(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:"var(--muted2)",textTransform:"uppercase",letterSpacing:".5px"}}>Receptes suggerides</div>
          {suggestions.slice(0,6).map((s,i)=>{
            const r=recipes.find(x=>x.title===s.recipeTitle);
            return(
              <div key={i} className="match-card" onClick={()=>r&&onDetail(r.id)} style={{cursor:r?"pointer":"default"}}>
                <div className="match-score">
                  <div style={{fontSize:22}}>{r?.emoji||"🍽️"}</div>
                  <div style={{flex:1}}>
                    <div className="match-title">{s.recipeTitle}</div>
                    <div className="score-bar"><div className="score-fill" style={{width:`${s.matchScore}%`}}/></div>
                  </div>
                  <div className="score-pct">{s.matchScore}%</div>
                </div>
                {s.missingIngredients?.length>0&&(
                  <><div style={{fontSize:10,color:"var(--muted2)",marginBottom:4,fontFamily:"'DM Mono',monospace"}}>FALTA:</div>
                  <div className="missing-list">{s.missingIngredients.map(m=><span key={m} className="missing-tag">{m}</span>)}</div></>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── NUTRITION TAB ────────────────────────────────────────────────────────────
function NutritionTab({plan,recipes,fridge}) {
  const [selDay,setSelDay]=useState("Dilluns");
  const [barcode,setBarcode]=useState("");
  const [product,setProduct]=useState(null);
  const [scanning,setScanning]=useState(false);
  const [suggestions,setSuggestions]=useState(null);
  const [loadSug,setLoadSug]=useState(false);

  const dayMeals=(plan[selDay]||[]).map(m=>{
    const r=recipes.find(x=>x.id===m.recipeId); return r?{...m,recipe:r}:null;
  }).filter(Boolean);

  const totals=dayMeals.reduce((acc,m)=>{
    const n=calcNutr(m.recipe.ingredients);
    return{kcal:acc.kcal+n.kcal,p:acc.p+n.p,c:acc.c+n.c,f:acc.f+n.f};
  },{kcal:0,p:0,c:0,f:0});

  const pieData=[
    {name:"Proteïnes",value:totals.p,color:"#00E5C8"},
    {name:"Carbohidrats",value:totals.c,color:"#F5A623"},
    {name:"Greixos",value:totals.f,color:"#FF5C7A"},
  ];
  const barData=dayMeals.map(m=>{
    const n=calcNutr(m.recipe.ingredients);
    return{name:m.recipe.title.substring(0,10)+"…",kcal:n.kcal,p:n.p,c:n.c,f:n.f};
  });
  const radarData=[
    {subject:"Proteïnes",value:Math.min((totals.p/50)*100,100)},
    {subject:"Carbs",value:Math.min((totals.c/250)*100,100)},
    {subject:"Greixos",value:Math.min((totals.f/70)*100,100)},
    {subject:"Kcal",value:Math.min((totals.kcal/2000)*100,100)},
    {subject:"Àpats",value:Math.min((dayMeals.length/4)*100,100)},
  ];

  const getSuggestions=async()=>{
    setLoadSug(true);
    try{const s=await getNutritionSuggestions(plan[selDay]||[],recipes);setSuggestions(s);}catch{}
    setLoadSug(false);
  };

  const doScan=async()=>{
    if(!barcode.trim()) return;
    setScanning(true); setProduct(null);
    try{const p=await lookupBarcode(barcode);setProduct(p);}catch{}
    setScanning(false);
  };

  return(
    <div className="nutr-wrap">
      <div style={{padding:"4px 0 12px"}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800}}>📊 Nutrició</div>
        <div style={{fontSize:12,color:"var(--muted2)"}}>Resum diari i calculadora</div>
      </div>

      <div className="nutr-day-selector">
        {T.days.map(d=><div key={d} className={`dchip ${selDay===d?"on":""}`} onClick={()=>setSelDay(d)}>{d.slice(0,2)}</div>)}
      </div>

      <div className="nutr-summary">
        <div className="nutr-kcal">{Math.round(totals.kcal)}</div>
        <div className="nutr-kcal-label">kcal — {selDay}</div>
        <div className="macro-grid">
          <div className="macro-cell"><div className="macro-val" style={{color:"var(--cyan)"}}>{totals.p.toFixed(1)}g</div><div className="macro-lbl">Proteïnes</div></div>
          <div className="macro-cell"><div className="macro-val" style={{color:"var(--amber)"}}>{totals.c.toFixed(1)}g</div><div className="macro-lbl">Carbohidrats</div></div>
          <div className="macro-cell"><div className="macro-val" style={{color:"var(--rose)"}}>{totals.f.toFixed(1)}g</div><div className="macro-lbl">Greixos</div></div>
        </div>

        {dayMeals.length>0?(
          <>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,marginBottom:8,color:"var(--muted2)"}}>DISTRIBUCIÓ PER ÀPAT</div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{top:0,right:0,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                  <XAxis dataKey="name" tick={{fill:"var(--muted2)",fontSize:10}}/>
                  <YAxis tick={{fill:"var(--muted2)",fontSize:10}}/>
                  <Tooltip contentStyle={{background:"var(--s2)",border:"1px solid var(--border)",borderRadius:8,fontSize:12}}/>
                  <Bar dataKey="kcal" fill="var(--cyan)" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,marginBottom:8,color:"var(--muted2)"}}>MACROS</div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{flex:1,height:160}}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData.filter(d=>d.value>0)} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={3}>
                      {pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                    </Pie>
                    <Tooltip contentStyle={{background:"var(--s2)",border:"1px solid var(--border)",borderRadius:8,fontSize:12}}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{flex:1,height:160}}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--border)"/>
                    <PolarAngleAxis dataKey="subject" tick={{fill:"var(--muted2)",fontSize:9}}/>
                    <Radar dataKey="value" fill="var(--cyan)" fillOpacity={0.25} stroke="var(--cyan)" strokeWidth={2}/>
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ):(
          <div style={{textAlign:"center",padding:"20px 0",color:"var(--muted2)",fontSize:13}}>Cap àpat planificat per a {selDay}</div>
        )}

        <button className="btn btn-g" style={{marginTop:12}} onClick={getSuggestions} disabled={loadSug}>
          {loadSug?<><span className="spin"/>Analitzant…</>:"🤖 Suggerències de balanç"}
        </button>
        {suggestions&&(
          <div style={{marginTop:10}}>
            <div style={{background:suggestions.balance?.status==="ok"?"rgba(168,230,60,.12)":"rgba(245,166,35,.1)",border:`1px solid ${suggestions.balance?.status==="ok"?"rgba(168,230,60,.3)":"rgba(245,166,35,.3)"}`,borderRadius:10,padding:"10px 12px",marginBottom:8,fontSize:13,color:suggestions.balance?.status==="ok"?"var(--lime)":"var(--amber)"}}>
              {suggestions.balance?.message}
            </div>
            {suggestions.suggestions?.map((s,i)=>(
              <div key={i} className="suggestion-card"><div className="sug-text">💡 {s}</div></div>
            ))}
          </div>
        )}
      </div>

      <div className="scan-area">
        <div className="scan-icon">📷</div>
        <div className="scan-title">Escanejar codi de barres</div>
        <div className="scan-sub">Introdueix el codi EAN/UPC del producte per obtenir la info nutricional</div>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <input className="barcode-in" placeholder="8410179152293" value={barcode} onChange={e=>setBarcode(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doScan()}/>
          <button className="add-shop-btn" onClick={doScan} disabled={scanning}>{scanning?<span className="spin" style={{borderTopColor:"var(--cyan)",border:"2px solid rgba(0,229,200,.3)"}}/>:"🔍"}</button>
        </div>
        {product&&(
          <div className="product-card">
            <div className="product-row">
              <div className="product-emoji">{product.image||"📦"}</div>
              <div><div className="product-name">{product.name}</div><div className="product-brand">{product.brand}</div></div>
            </div>
            <div className="product-grid">
              <div className="pg"><div className="pg-v" style={{color:"var(--cyan)"}}>{product.kcal}</div><div className="pg-l">kcal</div></div>
              <div className="pg"><div className="pg-v" style={{color:"var(--cyan)"}}>{product.p}g</div><div className="pg-l">prot.</div></div>
              <div className="pg"><div className="pg-v" style={{color:"var(--amber)"}}>{product.c}g</div><div className="pg-l">carbs</div></div>
              <div className="pg"><div className="pg-v" style={{color:"var(--rose)"}}>{product.f}g</div><div className="pg-l">greixos</div></div>
            </div>
            {(product.fiber||product.sugar||product.salt)&&(
              <div style={{display:"flex",gap:8,marginTop:8}}>
                {product.fiber&&<div className="pg" style={{flex:1}}><div className="pg-v" style={{color:"var(--lime)"}}>{product.fiber}g</div><div className="pg-l">fibra</div></div>}
                {product.sugar&&<div className="pg" style={{flex:1}}><div className="pg-v" style={{color:"var(--violet)"}}>{product.sugar}g</div><div className="pg-l">sucre</div></div>}
                {product.salt&&<div className="pg" style={{flex:1}}><div className="pg-v" style={{color:"var(--rose)"}}>{product.salt}g</div><div className="pg-l">sal</div></div>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MEAL PREP TAB ────────────────────────────────────────────────────────────
function MealPrepTab({recipes,plan}) {
  const [prepDay,setPrepDay]=useState("Dissabte");
  const [prepPlan,setPrepPlan]=useState(null);
  const [loading,setLoading]=useState(false);

  const generate=async()=>{
    setLoading(true); setPrepPlan(null);
    try{const p=await getMealPrepPlan(recipes,prepDay);setPrepPlan(p);}catch{}
    setLoading(false);
  };

  const totalMins=Object.values(plan).flat().reduce((acc,m)=>{
    const r=recipes.find(x=>x.id===m.recipeId); return r?acc+r.prepTime+r.cookTime:acc;
  },0);

  return(
    <div className="prep-wrap">
      <div style={{padding:"4px 0 12px"}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800}}>🥗 Meal Prep</div>
        <div style={{fontSize:12,color:"var(--muted2)",marginBottom:4}}>Planifica la preparació setmanal</div>
      </div>

      <div style={{background:"var(--s1)",borderRadius:12,border:"1px solid var(--border)",padding:14,marginBottom:12}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <div style={{background:"var(--s2)",borderRadius:10,padding:12,textAlign:"center"}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,color:"var(--lime)"}}>{Object.values(plan).flat().length}</div>
            <div style={{fontSize:10,color:"var(--muted2)",fontFamily:"'DM Mono',monospace"}}>ÀPATS PLANIFICATS</div>
          </div>
          <div style={{background:"var(--s2)",borderRadius:10,padding:12,textAlign:"center"}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,color:"var(--amber)"}}>{totalMins}m</div>
            <div style={{fontSize:10,color:"var(--muted2)",fontFamily:"'DM Mono',monospace"}}>TEMPS TOTAL CUINA</div>
          </div>
        </div>
      </div>

      <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:"var(--muted2)",textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>Dia de meal prep</div>
      <div className="day-pill-row">
        {T.days.map(d=><div key={d} className={`dp ${prepDay===d?"on":""}`} onClick={()=>setPrepDay(d)}>{d}</div>)}
      </div>

      <button className="btn btn-g" onClick={generate} disabled={loading}>
        {loading?<><span className="spin"/>Generant pla…</>:"🤖 Generar pla de Meal Prep per a "+prepDay}
      </button>

      {prepPlan&&(
        <div style={{marginTop:14}}>
          <div style={{background:"rgba(168,230,60,.08)",border:"1px solid rgba(168,230,60,.2)",borderRadius:10,padding:"10px 12px",marginBottom:10,fontSize:13,color:"var(--lime)"}}>
            ⏱ Temps total: <strong>{prepPlan.totalTime} min</strong> · {prepPlan.tip}
          </div>
          {prepPlan.plan?.map((item,i)=>(
            <div key={i} className="prep-card" style={{animationDelay:`${i*60}ms`}}>
              <div className="prep-title">
                <span>{i+1}. {item.title}</span>
                <span className="prep-dur">⏱ {item.duration}min</span>
              </div>
              <div className="prep-tasks">
                {item.tasks?.map((t,j)=><div key={j} className="pt"><div className="pt-dot"/><span>{t}</span></div>)}
              </div>
              {item.tip&&<div className="prep-tip">💡 {item.tip}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PLANNER TAB ─────────────────────────────────────────────────────────────
function PlannerTab({plan,recipes,onRemove,onDetail}) {
  return(
    <div className="plan-wrap">
      <div style={{padding:"4px 0 8px"}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800}}>📅 Pla Setmanal</div>
        <div style={{fontSize:12,color:"var(--muted2)"}}>Organitza els teus àpats</div>
      </div>
      {T.days.map(day=>{
        const meals=plan[day]||[];
        const dayKcal=meals.reduce((acc,m)=>{
          const r=recipes.find(x=>x.id===m.recipeId); return r?acc+calcNutr(r.ingredients).kcal:acc;
        },0);
        return(
          <div key={day} className="day-card">
            <div className="day-hd">
              <span className="day-nm">{day}</span>
              <span className="day-kcal">{meals.length} àpats{dayKcal>0&&` · ${Math.round(dayKcal)} kcal`}</span>
            </div>
            {meals.length===0?<div className="day-empty">Cap àpat planificat</div>:
              meals.map((m,i)=>{
                const r=recipes.find(x=>x.id===m.recipeId); if(!r) return null;
                const n=calcNutr(r.ingredients);
                return(
                  <div key={i} className="meal-row" onClick={()=>onDetail(r.id)}>
                    <span className="meal-emoji">{r.emoji}</span>
                    <div className="meal-info">
                      <div className="meal-t">{r.title}</div>
                      <div className="meal-s">{m.mealType} · {n.kcal}kcal · P{n.p}g C{n.c}g G{n.f}g</div>
                    </div>
                    <button className="meal-x" onClick={e=>{e.stopPropagation();onRemove(day,i);}}>✕</button>
                  </div>
                );
              })
            }
          </div>
        );
      })}
    </div>
  );
}

// ─── SHOPPING TAB ─────────────────────────────────────────────────────────────
function ShoppingTab({plannedItems,extraShop,setExtraShop,bought,setBought}) {
  const [newItem,setNewItem]=useState("");
  const toggle=name=>setBought(p=>({...p,[name.toLowerCase()]:!p[name.toLowerCase()]}));
  const addExtra=()=>{
    if(!newItem.trim()) return;
    setExtraShop(p=>[...p,{name:newItem.trim(),qty:"",unit:"",extra:true}]);
    setNewItem("");
  };
  const fridgeItems=plannedItems.filter(i=>i.fromFridge);
  const needItems=plannedItems.filter(i=>!i.fromFridge);
  const allItems=[...needItems,...extraShop];
  const unchecked=allItems.filter(i=>!bought[i.name.toLowerCase()]);
  const checked=allItems.filter(i=>bought[i.name.toLowerCase()]);

  return(
    <div className="shop-wrap">
      <div style={{padding:"4px 0 12px"}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800}}>🛒 Llista de la Compra</div>
        <div style={{fontSize:12,color:"var(--muted2)"}}>Generada del pla setmanal</div>
      </div>

      <div className="add-to-shop">
        <input className="add-shop-in" placeholder="Afegir article manualment…" value={newItem} onChange={e=>setNewItem(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addExtra()}/>
        <button className="add-shop-btn" onClick={addExtra}>＋</button>
      </div>

      {fridgeItems.length>0&&(
        <>
          <div className="shop-section-title">✅ Ja tens a la nevera ({fridgeItems.length})</div>
          {fridgeItems.map((item,i)=>(
            <div key={i} className="shop-item done">
              <div className="check">✓</div>
              <span className="sname">{item.name}</span>
              <span className="sqty">{item.qty>0?`${Number.isInteger(item.qty)?item.qty:item.qty.toFixed(1)} ${item.unit}`:item.unit}</span>
            </div>
          ))}
        </>
      )}

      {unchecked.length>0&&(
        <>
          <div className="shop-section-title">📝 Per comprar ({unchecked.length})</div>
          {unchecked.map((item,i)=>(
            <div key={i} className="shop-item" onClick={()=>toggle(item.name)}>
              <div className="check"/>
              <span className="sname">{item.name}</span>
              <span className="sqty">{item.qty>0?`${Number.isInteger(item.qty)?item.qty:item.qty.toFixed(1)} ${item.unit}`:item.extra?"➕":item.unit}</span>
            </div>
          ))}
        </>
      )}

      {checked.length>0&&(
        <>
          <div className="shop-section-title">✓ Comprat ({checked.length})</div>
          {checked.map((item,i)=>(
            <div key={i} className="shop-item done" onClick={()=>toggle(item.name)}>
              <div className="check">✓</div>
              <span className="sname">{item.name}</span>
              <span className="sqty">{item.qty>0?`${Number.isInteger(item.qty)?item.qty:item.qty.toFixed(1)} ${item.unit}`:""}</span>
            </div>
          ))}
        </>
      )}

      {allItems.length===0&&(
        <div className="empty"><div className="empty-emoji">🛒</div><div className="empty-t">Llista buida</div><div className="empty-s">Afegeix receptes al pla setmanal per generar la llista automàticament.</div></div>
      )}
    </div>
  );
}

// ─── IMPORT SHEET ─────────────────────────────────────────────────────────────
function ImportSheet({onClose,onSave}) {
  const [source,setSource]=useState("Instagram");
  const [text,setText]=useState("");
  const [status,setStatus]=useState(null);
  const [msg,setMsg]=useState("");
  const [parsed,setParsed]=useState(null);

  const doParse=async()=>{
    if(!text.trim()) return;
    setStatus("loading"); setMsg("Claude està llegint la recepta…");
    try{const r=await parseRecipe(text,source);setParsed({...r,source});setStatus("ok");setMsg(`✓ "${r.title}" — ${r.ingredients.length} ingredients`);}
    catch{setStatus("err");setMsg("No s'ha pogut analitzar. Prova amb un text més complet.");}
  };

  return(
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="sheet">
        <div className="handle"/>
        <div className="sh"><div className="st">Importar recepta</div><button className="x" onClick={onClose}>✕</button></div>
        <div className="sb">
          <div className="fg">
            <label className="lbl">Plataforma</label>
            <div className="pills">{T.fonts.map(s=><div key={s} className={`pill ${source===s?"on":""}`} onClick={()=>setSource(s)}>{srcIcon(s)} {s}</div>)}</div>
          </div>
          <div className="fg">
            <label className="lbl">Text de la recepta</label>
            <textarea className="ta" placeholder="Enganxa el text de la xarxa social aquí…" value={text} onChange={e=>setText(e.target.value)}/>
          </div>
          {status&&<div className={`status ${status==="ok"?"ok":status==="err"?"err":"info"}`}>
            {status==="loading"?<><span className="spin" style={{borderTopColor:"var(--cyan)",border:"2px solid var(--border)"}}/>&nbsp;&nbsp;{msg}</>:msg}
          </div>}
          {!parsed
            ?<button className="btn btn-c" onClick={doParse} disabled={!text.trim()||status==="loading"}>
               {status==="loading"?<><span className="spin"/>Analitzant…</>:"✨ Analitzar amb IA"}
             </button>
            :<>
               <button className="btn btn-c" onClick={()=>onSave(parsed)}>💾 Desar recepta</button>
               <button className="btn btn-ghost" onClick={()=>{setParsed(null);setStatus(null);}}>↩ Tornar a intentar</button>
             </>
          }
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL SHEET ─────────────────────────────────────────────────────────────
function DetailSheet({recipe,hl,onClose,onDelete,onPlan}) {
  const n=calcNutr(recipe.ingredients);
  const tot=n.p+n.c+n.f||1;
  return(
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="sheet">
        <div className="handle"/>
        <div className="sh"><span/><button className="x" onClick={onClose}>✕</button></div>
        <div className="dh">{recipe.emoji}</div>
        <div className="db">
          <div className="dsrc">{srcIcon(recipe.source)} {recipe.source} · {recipe.cuisine} · {recipe.category}</div>
          <div className="dtitle">{recipe.title}</div>
          <div className="meta-grid">
            <div className="mc"><div className="mv">{recipe.prepTime}m</div><div className="ml">Prep</div></div>
            <div className="mc"><div className="mv">{recipe.cookTime}m</div><div className="ml">Cocció</div></div>
            <div className="mc"><div className="mv">{recipe.servings}</div><div className="ml">Porcions</div></div>
          </div>
          <div style={{background:"var(--s2)",borderRadius:12,padding:"12px 14px",marginBottom:14}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,marginBottom:8,color:"var(--muted2)"}}>VALORS NUTRICIONALS (total recepta)</div>
            <div style={{display:"flex",justifyContent:"space-around",marginBottom:10}}>
              <div style={{textAlign:"center"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,background:"var(--gradient)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{n.kcal}</div><div style={{fontSize:10,color:"var(--muted2)",fontFamily:"'DM Mono',monospace"}}>kcal</div></div>
              <div style={{textAlign:"center"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:"var(--cyan)"}}>{n.p}g</div><div style={{fontSize:10,color:"var(--muted2)",fontFamily:"'DM Mono',monospace"}}>prot.</div></div>
              <div style={{textAlign:"center"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:"var(--amber)"}}>{n.c}g</div><div style={{fontSize:10,color:"var(--muted2)",fontFamily:"'DM Mono',monospace"}}>carbs</div></div>
              <div style={{textAlign:"center"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:"var(--rose)"}}>{n.f}g</div><div style={{fontSize:10,color:"var(--muted2)",fontFamily:"'DM Mono',monospace"}}>greixos</div></div>
            </div>
            <div className="macro-bar" style={{height:6}}>
              <div className="mb-p" style={{width:`${(n.p/tot*100).toFixed(0)}%`}}/>
              <div className="mb-c" style={{width:`${(n.c/tot*100).toFixed(0)}%`}}/>
              <div className="mb-f" style={{width:`${(n.f/tot*100).toFixed(0)}%`}}/>
            </div>
          </div>
          <div className="sect">Ingredients</div>
          <ul className="ing-list">
            {recipe.ingredients.map((ing,i)=>{
              const m=hl&&ing.name.toLowerCase().includes(hl);
              const g=unitToG(ing.qty,ing.unit); const nd=getNutr(ing.name);
              const ingKcal=Math.round((nd.kcal*g)/100);
              return(
                <li key={i} className={`ii ${m?"m":""}`}>
                  <span className="idot"/>
                  <span className="iqty">{ing.qty} {ing.unit}</span>
                  <span className="iname">{ing.name}{m&&<span style={{marginLeft:4,fontSize:10}}> ✓</span>}</span>
                  <span style={{marginLeft:"auto",fontFamily:"'DM Mono',monospace",fontSize:10,color:"var(--muted2)"}}>{ingKcal>0?ingKcal+"kcal":""}</span>
                </li>
              );
            })}
          </ul>
          <div className="sect">Passos</div>
          <ol className="step-list">
            {recipe.steps.map((s,i)=><li key={i} className="si"><span className="sn">{i+1}</span><span>{s}</span></li>)}
          </ol>
          <div className="tags" style={{marginTop:14}}>{recipe.tags.map(t=><span key={t} className="tag">{t}</span>)}</div>
          <button className="btn btn-c" style={{marginTop:16}} onClick={onPlan}>📅 Afegir al pla</button>
          <button className="btn btn-out" onClick={onDelete}>🗑 Eliminar del receptari</button>
        </div>
      </div>
    </div>
  );
}

// ─── ADD TO PLAN SHEET ────────────────────────────────────────────────────────
function AddToPlanSheet({recipe,onClose,onAdd}) {
  const [day,setDay]=useState(null);
  const [meal,setMeal]=useState(null);
  return(
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="sheet">
        <div className="handle"/>
        <div className="sh"><div className="st">{recipe?.emoji} Afegir al pla</div><button className="x" onClick={onClose}>✕</button></div>
        <div className="sb">
          <div className="fg">
            <label className="lbl">Dia</label>
            <div className="day-grid">
              {T.days.map(d=><div key={d} className={`dbtn ${day===d?"on":""}`} onClick={()=>setDay(d)}>{d.slice(0,2)}</div>)}
            </div>
          </div>
          <div className="fg">
            <label className="lbl">Tipus d'àpat</label>
            <div className="pills">{T.mealTypes.map(m=><div key={m} className={`pill ${meal===m?"on":""}`} onClick={()=>setMeal(m)}>{m}</div>)}</div>
          </div>
          <button className="btn btn-c" disabled={!day||!meal} onClick={()=>onAdd(recipe.id,day,meal)}>📅 Afegir</button>
        </div>
      </div>
    </div>
  );
}

const srcIcon=s=>({Instagram:"📸",TikTok:"🎵",Twitter:"🐦",YouTube:"▶️",Altre:"🔗"}[s]||"🔗");
const fridgeEmoji=c=>({Verdures:"🥦",Proteïna:"🥩",Làctics:"🥛",Cereals:"🌾",Condiments:"🧄",Fruita:"🍎",Altre:"📦"}[c]||"📦");
