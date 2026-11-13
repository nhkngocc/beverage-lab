const $=s=>document.querySelector(s);
function el(t,txt,cls){const e=document.createElement(t);if(txt!=null)e.textContent=txt;if(cls)e.className=cls;return e}
const MOCK=new URLSearchParams(location.search).get("mock")==="1"||location.protocol==="file:";
const LEVELS={classic:"Classic",twist:"Plot Twist"};

/* ---------- the shelf, grouped into categories (edit freely) ---------- */
const CATS=[
 {name:"Base",note:"every drink needs a liquid",open:true,items:[["💧","Water"],["🫧","Sparkling water"],["🥥","Coconut water"],["🥛","Milk"],["🌾","Oat milk"],["🥜","Almond milk"],["🌱","Soy milk"]]},
 {name:"Tea & coffee",open:true,items:[["🍵","Black tea"],["🍃","Green tea"],["🍵","Matcha"],["☕","Coffee"]]},
 {name:"Juice & soda",open:true,items:[["🍊","Orange juice"],["🍎","Apple juice"],["🍋","Lemonade"],["🥤","Cola"],["🫧","Ginger ale"],["🫧","Tonic water"]]},
 {name:"Fruit",open:true,items:[["🍋","Lemon"],["🟢","Lime"],["🍌","Banana"],["🍓","Strawberries"],["🥭","Mango"],["🍍","Pineapple"],["🍑","Peach"],["🍉","Watermelon"]]},
 {name:"Sweet & creamy",open:true,items:[["🍯","Honey"],["🍫","Chocolate"],["🥣","Yogurt"],["🍁","Maple syrup"],["🍨","Ice cream"]]},
 {name:"Herbs & spices",note:"for flavour",open:true,items:[["🌿","Mint"],["🌰","Ginger"],["🟤","Cinnamon"],["🌼","Vanilla"],["🌿","Basil"]]},
 {name:"Beer, wine & spirits",note:"adults of legal drinking age only",open:false,items:[["🍷","Red wine"],["🥂","White wine"],["🍺","Beer"],["🥃","Rum"],["🍸","Vodka"]]}
];
const EXTRA_SUGGEST=["Apple cider","Cranberry juice","Grape juice","Pomegranate juice","Tomato juice","Coconut milk","Condensed milk","Cocoa powder","Iced tea","Chai","Cucumber","Kiwi","Blueberries","Raspberries","Grapefruit","Orange","Pear","Rose water","Lavender","Hibiscus tea","Chamomile tea","Cardamom","Turmeric","Agave syrup","Brown sugar","Whipped cream","Kombucha","Espresso","Cold brew","Gin","Whiskey","Tequila","Champagne"];

/* ---------- drinks-only filter for typed ingredients ---------- */
const W=s=>new Set(s.split(/\s+/).filter(Boolean));
/* words that mean "this is something you can put in a drink" */
const ALLOW=W(`water sparkling soda seltzer tonic ice tea matcha chai oolong rooibos puerh earl sencha hojicha genmaicha mate coffee espresso latte cappuccino mocha cocoa cacao chocolate kombucha
milk oat almond soy coconut hazelnut cashew pistachio macadamia cream creamer yogurt yoghurt kefir buttermilk lassi condensed evaporated eggnog
juice lemonade limeade cola coke pepsi sprite fanta squash cordial nectar smoothie shake brew syrup
beer lager ale stout wine champagne prosecco sake cider vodka rum gin whiskey whisky bourbon tequila brandy cognac vermouth liqueur amaretto baileys aperol campari soju mezcal bitters grenadine
apple pear peach plum apricot cherry grape grapefruit orange lemon lime tangerine mandarin clementine yuzu kumquat pomelo mango papaya pineapple guava passionfruit lychee longan rambutan dragonfruit watermelon melon cantaloupe honeydew kiwi banana pomegranate fig date raspberry strawberry blueberry blackberry cranberry berry currant tamarind persimmon jackfruit durian avocado fruit citrus
cucumber carrot celery beet beetroot kale spinach tomato wheatgrass aloe
mint peppermint spearmint basil rosemary thyme lavender rose hibiscus chamomile jasmine lemongrass pandan sage elderflower osmanthus chrysanthemum lait cafe
cinnamon nutmeg cardamom clove anise turmeric saffron allspice ginger vanilla
sugar honey agave maple molasses stevia caramel marshmallow jelly boba tapioca pearl sweetener jaggery
cookie cookies biscuit biscuits cake cupcake brownie brownies cheesecake donut doughnut muffin waffle pancake wafer graham cracker pudding custard flan tiramisu pie crumble crumb crumbs sprinkles frosting icing fudge toffee praline nougat marzipan truffle candy gummy gummies lollipop mochi
icecream gelato sorbet sherbet popsicle froyo whipped topping spread jam marmalade preserves compote puree paste granola oats oatmeal cereal pretzel popcorn
oreo biscoff lotus speculoos nutella kitkat snickers twix bounty mars milo ovaltine horlicks nesquik hershey hersheys reeses ferrero rocher toblerone cadbury lindt godiva pocky pepero timtam tim tam digestive ritz maltesers milkybar kinder
sua tra nuoc chanh mia xoai dua phe`);
/* sweet foods that are fine in a drink (soft block words are overridden by these) */
/* words that mean "this is food or seasoning, not a drink ingredient" */
/* HARD block: savoury food or seasoning. Nothing can override these. */
const BLOCK=W(`salt pepper garlic onion scallion shallot chili chilli paprika cumin oregano curry mustard ketchup mayo mayonnaise vinegar lard flour bread toast pasta spaghetti noodle ramen potato fry
meat chicken beef pork lamb fish salmon tuna shrimp prawn crab bacon sausage ham steak egg pizza burger sandwich soup salad stew tofu mushroom cabbage cauliflower broccoli lettuce seasoning broth stock gravy`);
const BLOCK_PHRASES=["sour cream","soy sauce","fish sauce","hot sauce","chili sauce","chilli sauce","oyster sauce","tomato sauce","pasta sauce","bbq sauce","barbecue sauce","worcestershire","olive oil","sesame oil","vegetable oil","cooking oil","garlic bread"];
/* exact phrases that are always fine even though a word inside looks savoury */
const OK_PHRASES=["kit kat","tim tam","peanut butter","almond butter","cashew butter","nut butter","cookie butter","cookie dough","cookies and cream","cookies & cream","cookie crumb","chocolate chip","cacao butter","cocoa butter","coconut oil","sweet potato","purple yam","ube","taro","pumpkin","corn","sweet corn","red bean","mung bean","black sesame","sesame paste","salted caramel","sea salt caramel","egg nog","egg cream","fried ice cream"];
function forms(w){
  const f=[w];
  if(w.length>3){
    if(/ies$/.test(w)){f.push(w.slice(0,-3)+"y",w.slice(0,-1))}
    else if(/es$/.test(w)){f.push(w.slice(0,-2),w.slice(0,-1))}
    else if(/s$/.test(w)&&!/(ss|us|is)$/.test(w)){f.push(w.slice(0,-1))}
  }
  return f;
}
function classify(v){
  const norm=v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[’']/g,"'").replace(/đ/g,"d");
  const toks=norm.split(/[^a-z0-9]+/).filter(Boolean);
  const inSet=(set,t)=>forms(t).some(x=>set.has(x));
  const squashed=toks.join(" ");
  /* 1. known drink-friendly phrases always pass */
  if(OK_PHRASES.some(p=>squashed.includes(p)))return{ok:true,known:true};
  /* 2. only the obviously savoury stuff is blocked here */
  if(BLOCK_PHRASES.some(p=>squashed.includes(p))||toks.some(t=>inSet(BLOCK,t)))
    return{ok:false,msg:"“"+v+"” is savoury food or seasoning. Try something sweet or something you’d put in a glass."};
  /* 3. everything else passes; the AI makes the final call when you shake */
  return{ok:true,known:toks.some(t=>inSet(ALLOW,t))};
}

/* ---------- state ---------- */
const STAMPS={works:{classic:"APPROVED",twist:"APPROVED WITH A TWIST"},works_with_fix:{classic:"APPROVED WITH A TWEAK",twist:"TWISTED AND TWEAKED"}};
let ings=[],level="classic",lastAdded=-1,busy=false,last=null,timer=null;
if(MOCK)$("#demo").hidden=false;

const has=n=>ings.some(x=>x.toLowerCase()===n.toLowerCase());
function say(t,kind){const m=$("#msg");m.textContent=t;m.className=kind||""}

function check(raw){
  const v=raw.trim().replace(/\s+/g," ");
  if(!v)return["","Type an ingredient first."];
  if(v.length>30)return["","Keep it to 30 characters or fewer."];
  if(!/^[\p{L}\p{N} '’&.-]+$/u.test(v))return["","Use letters, numbers and spaces only (no emoji or symbols)."];
  if(has(v))return["",v+" is already in the shaker."];
  const c=classify(v);
  if(!c.ok)return["",c.msg];
  if(ings.length>=5)return["","The shaker is full. Tap an ingredient in it to remove one."];
  return[v,""];
}
function add(raw){
  const[v,err]=check(raw);
  if(err){say(err,"bad");return false}
  ings.push(v);lastAdded=ings.length-1;say("");render();return true;
}
function removeAt(i){say(ings[i]+" removed.");ings.splice(i,1);lastAdded=-1;render()}

/* live feedback while typing: only drink ingredients can be added */
function live(){
  const v=$("#own").value.trim().replace(/\s+/g," ");
  const b=$("#addBtn");
  if(!v){say("");b.disabled=false;return}
  if(v.length>30||!/^[\p{L}\p{N} '’&.-]+$/u.test(v)){b.disabled=true;say(v.length>30?"Keep it to 30 characters or fewer.":"Use letters, numbers and spaces only.","bad");return}
  const c=classify(v);
  b.disabled=!c.ok;
  say(c.ok?(c.known?"✓ Good, that works in a drink.":"✓ Added. The shaker will check this one when you shake."):c.msg,c.ok?"ok":"bad");
}

function render(){
  document.querySelectorAll(".tile").forEach(b=>b.setAttribute("aria-pressed",has(b.dataset.n)));
  const slots=$("#slots");slots.replaceChildren();
  for(let i=0;i<5;i++){
    if(ings[i]){
      const b=el("button",null,"slot filled"+(i===lastAdded?" drop":""));b.type="button";
      b.append(el("span",ings[i]));const x=el("span","✕");x.setAttribute("aria-hidden","true");b.append(x);
      b.setAttribute("aria-label","Remove "+ings[i]);b.onclick=()=>removeAt(i);slots.append(b);
    }else{const d=el("div","Empty slot","slot");d.setAttribute("aria-hidden","true");slots.append(d)}
  }
  const n=ings.length;
  $("#count").textContent=n<2?"Add "+(2-n)+" more":n<5?"Ready to shake ("+n+"/5)":"Shaker full (5/5)";
  $("#go").disabled=n<2||busy;
  paintStepper();
}

/* build the categories and the autocomplete list */
const sugg=new Set();
CATS.forEach(c=>{
  const d=el("details",null,"cat");if(c.open)d.open=true;
  const sm=el("summary",c.name);if(c.note)sm.append(el("small","· "+c.note));d.append(sm);
  const g=el("div",null,"shelf");
  c.items.forEach(([e,n])=>{
    sugg.add(n);
    const b=el("button",null,"tile");b.type="button";b.dataset.n=n;b.setAttribute("aria-pressed","false");
    const s=el("span",e);s.setAttribute("aria-hidden","true");b.append(s,el("span",n));
    b.onclick=()=>{if(has(n)){removeAt(ings.findIndex(x=>x.toLowerCase()===n.toLowerCase()))}else{const[v,err]=check(n);if(err)say(err,"bad");else add(n)}};
    g.append(b);
  });
  d.append(g);$("#cats").append(d);
});
EXTRA_SUGGEST.forEach(n=>sugg.add(n));
[...sugg].sort().forEach(n=>{const o=document.createElement("option");o.value=n;$("#sugg").append(o)});

$("#own").addEventListener("input",live);
$("#addForm").addEventListener("submit",e=>{e.preventDefault();if(add($("#own").value)){$("#own").value="";$("#addBtn").disabled=false}});
document.querySelectorAll("input[name=level]").forEach(r=>r.addEventListener("change",()=>{level=r.value;document.body.dataset.level=level;styleTouched=true;paintStepper()}));

/* ---------- demo samples (only with ?mock=1) ---------- */
function mock(){
  const n={fix:1,wont:2,rejected:3}[new URLSearchParams(location.search).get("verdict")]||0,list=ings.slice();
  const base={verdict:"works",verdict_reason:"",level,drink_name:null,tagline:null,temperature:null,contains_alcohol:false,ingredients:[],steps:[],flavour_profile:null,why_it_works:null,origin_note:null,mutation_log:[],unused_ingredients:[],fix_suggestion:null,zero_proof_swap:null,safety_note:null};
  const mk=()=>list.map((x,i)=>({item:x,amount:[150,100,50,30,20][i]+" ml",from_user:true,optional:false}));
  if(n===0){
    const names={classic:["Milk Tea","A familiar drink you can order anywhere."],twist:["Smoky Honey Milk Tea","A familiar friend with a clever twist."]}[level];
    return Object.assign(base,{verdict_reason:"Sample result: these ingredients get along well.",drink_name:names[0],tagline:names[1],temperature:"hot",ingredients:mk().concat([{item:"Sugar",amount:"1 tsp",from_user:false,optional:true},{item:"Ice",amount:"4 cubes",from_user:false,optional:true}]),
      steps:["Warm or chill your ingredients as needed.","Combine everything in the shaker.","Shake or stir for 20 seconds.","Taste, then add sugar if you like.","Pour and serve."],
      flavour_profile:{sweet:3,sour:1,bitter:2,creamy:level==="classic"?4:2,intensity:3},why_it_works:"Sample text: the creamy bits calm down the bitter bits, so every sip stays smooth.",
      mutation_log:level==="twist"?[{change:"Steeped the tea in warm milk",why:"Smoother, creamier taste."},{change:"Added a pinch of cinnamon",why:"Warm spice that suits the sweetness."}]:[]});
  }
  if(n===1)return Object.assign(base,{verdict:"works_with_fix",verdict_reason:"Sample result: good idea, but it needs a small tweak.",drink_name:"Tweaked Evening Sipper",tagline:"Almost perfect.",temperature:"cold",contains_alcohol:true,ingredients:mk(),steps:["Chill all ingredients.","Stir gently, do not shake hard.","Pour over ice."],
    flavour_profile:{sweet:3,sour:2,bitter:1,creamy:3,intensity:2},why_it_works:"Sample text: a little sweetness softens the sharp edges.",fix_suggestion:"Add a pinch of sugar and stir slowly so nothing curdles.",zero_proof_swap:"Swap the alcohol for the same amount of grape juice.",safety_note:"For adults of legal drinking age only. Drink responsibly."});
  if(n===2)return Object.assign(base,{verdict:"wont_work",verdict_reason:"Sample result: this combination would separate and taste unpleasant.",fix_suggestion:"Try swapping one ingredient for something less acidic, like honey."});
  return Object.assign(base,{verdict:"rejected",verdict_reason:"Sample result: this lab only makes drinks from drink ingredients.",unused_ingredients:list.map(x=>({item:x,reason:"Sample reason: not a drink ingredient."}))});
}

/* ---------- the real call ---------- */
async function call(){
  const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),30000);
  let res,data;
  try{
    res=await fetch("/.netlify/functions/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ingredients:ings,level}),signal:ctl.signal});
  }catch(e){
    throw new Error(e.name==="AbortError"?"That took too long. Please try again.":"Couldn’t reach the lab. Check your internet connection and try again.");
  }finally{clearTimeout(t)}
  try{data=await res.json()}catch(e){data=null}
  if(!res.ok||!data||!data.ok){
    const err=new Error((data&&data.error)||"Something went wrong. Please try again.");
    err.detail=data&&data.detail;throw err;
  }
  return data.result;
}

/* ---------- go ---------- */
const LOAD=["Consulting the bartender...","Tasting in my head...","Checking nothing explodes...","Polishing the glass..."];
async function go(){
  if(busy||ings.length<2)return;
  const lv=level;busy=true;render();$("#result").replaceChildren();
  $("#shaker").classList.add("shake");
  let k=0;$("#status").textContent=LOAD[0];
  timer=setInterval(()=>{k=(k+1)%LOAD.length;$("#status").textContent=LOAD[k]},2000);
  try{
    const r=MOCK?await new Promise(ok=>setTimeout(()=>ok(mock()),1400)):await call();
    last=r;showResult(r,lv);
  }catch(e){showError(e.message,e.detail)}
  finally{clearInterval(timer);$("#status").textContent="";$("#shaker").classList.remove("shake");busy=false;render()}
}
$("#go").onclick=go;

function showError(m,detail){
  const c=el("div",null,"ticket");const h=el("h3","Something went wrong");h.tabIndex=-1;
  const retry=el("button","Try again","btn");retry.type="button";retry.onclick=go;
  c.append(h,el("p",m),retry);
  if(detail)c.append(el("p","Technical detail: "+detail,"tech"));
  $("#result").replaceChildren(c);h.focus();
}

/* ---------- icons: use the AI's emoji if it is a real emoji, else guess one ---------- */
const ICONS=new Map();CATS.forEach(c=>c.items.forEach(([e,n])=>ICONS.set(n.toLowerCase(),e)));
const KEYWORDS=[["ice","🧊"],["sugar","🍬"],["syrup","🍯"],["honey","🍯"],["milk","🥛"],["cream","🍦"],["coffee","☕"],["espresso","☕"],["tea","🍵"],["matcha","🍵"],["cookie","🍪"],["oreo","🍪"],["biscoff","🍪"],["biscuit","🍪"],["chocolate","🍫"],["nutella","🍫"],["cocoa","🍫"],["kit kat","🍫"],["juice","🧃"],["lemon","🍋"],["lime","🍋"],["orange","🍊"],["apple","🍎"],["berry","🍓"],["strawberr","🍓"],["mango","🥭"],["banana","🍌"],["pineapple","🍍"],["peach","🍑"],["coconut","🥥"],["mint","🌿"],["basil","🌿"],["ginger","🫚"],["cinnamon","🟤"],["vanilla","🌼"],["water","💧"],["soda","🫧"],["tonic","🫧"],["cola","🥤"],["wine","🍷"],["beer","🍺"],["rum","🥃"],["whisk","🥃"],["vodka","🍸"],["gin","🍸"],["salt","🧂"],["cheese","🧀"]];
function iconFor(i){
  const ok=s=>typeof s==="string"&&s.length<=12&&/\p{Extended_Pictographic}/u.test(s)&&!/[\p{L}\p{N}]/u.test(s);
  if(ok(i.icon))return i.icon;
  const n=i.item.toLowerCase();
  if(ICONS.has(n))return ICONS.get(n);
  const k=KEYWORDS.find(([w])=>n.includes(w));
  return k?k[1]:"🥤";
}

/* bold + highlight ingredient names inside a step */
function hlText(text,names){
  const frag=document.createDocumentFragment();
  const list=names.filter(n=>n&&n.length>1).sort((a,b)=>b.length-a.length).map(n=>n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"));
  if(!list.length){frag.append(text);return frag}
  text.split(new RegExp("("+list.join("|")+")","gi")).forEach((p,k)=>{
    if(!p)return;
    if(k%2)frag.append(el("strong",p,"hl"));else frag.append(p);
  });
  return frag;
}
function secTitle(t,small){const h=el("h4",t,"sec");if(small)h.append(el("small",small));return h}
function ingList(list){
  const ul=el("ul",null,"ings");
  list.forEach((i,k)=>{
    const li=el("li",null,"ing"+(i.from_user?"":" extra"));li.style.setProperty("--i",k);
    const ic=el("span",iconFor(i),"ico");ic.setAttribute("aria-hidden","true");
    const nm=el("span",i.item,"nm");if(!i.from_user&&i.optional)nm.append(el("small","optional"));
    li.append(ic,nm,el("span",i.amount,"amt"));ul.append(li);
  });
  return ul;
}
const TEMPS_UI={hot:"🔥 Serve hot",cold:"🧊 Serve cold",room:"🥤 Serve as is"};

function showResult(r,lv){
  const c=el("div",null,"ticket");
  const ok=r.verdict==="works"||r.verdict==="works_with_fix";
  const h=el("h3",ok?r.drink_name:"Not on the menu");h.tabIndex=-1;
  c.append(el("p",ok?STAMPS[r.verdict][lv]:"NOT ON THE MENU","stamp s-"+(ok?r.verdict:"wont_work")));
  c.append(h);
  if(!ok)c.append(el("p","Sorry, this combination is unavailable.","unavail"));
  if(r.tagline)c.append(el("p",r.tagline,"tag"));
  if(r.verdict_reason)c.append(el("p",r.verdict_reason,"lead"));
  if(ok){
    const chips=el("div",null,"chips");
    if(TEMPS_UI[r.temperature])chips.append(el("span",TEMPS_UI[r.temperature],"chip"));
    chips.append(el("span","🥄 "+r.steps.length+" easy steps","chip"));
    if(r.contains_alcohol)chips.append(el("span","🔞 Contains alcohol","chip"));
    c.append(chips);
    if(r.fix_suggestion)c.append(el("div","Quick fix: "+r.fix_suggestion,"note"));

    const mine=r.ingredients.filter(i=>i.from_user),extra=r.ingredients.filter(i=>!i.from_user);
    c.append(secTitle("What you’ll need"));
    if(mine.length){if(extra.length)c.append(el("p","From your fridge","hint"));c.append(ingList(mine))}
    if(extra.length){c.append(el("p","Grab from the kitchen","hint"),ingList(extra))}

    c.append(secTitle("How to make it"));
    const names=r.ingredients.map(i=>i.item);
    const ol=el("ol",null,"steps");
    r.steps.forEach((s,k)=>{const li=el("li"),sp=el("span");li.style.setProperty("--i",k);sp.append(hlText(s,names));li.append(sp);ol.append(li)});
    c.append(ol);

    if(r.flavour_profile){
      c.append(secTitle("How it tastes"));const bars=el("div",null,"bars");
      Object.entries(r.flavour_profile).forEach(([k,v],idx)=>{
        const row=el("div",null,"bar");row.append(el("span",k));
        const t=el("i");const f=el("b");f.style.setProperty("--i",idx);f.style.width=(v*20)+"%";t.append(f);row.append(t,el("span",v+"/5"));bars.append(row);
      });c.append(bars);
    }
    if(r.why_it_works)c.append(secTitle("Why it tastes so good"),el("p",r.why_it_works,"fun"));
    if(r.origin_note)c.append(secTitle("Where it comes from"),el("p",r.origin_note,"fun"));
    if(r.mutation_log.length){c.append(secTitle("Our plot twists"));const m=el("ul",null,"plain");r.mutation_log.forEach(x=>m.append(el("li",x.change+(x.why?": "+x.why:""))));c.append(m)}
  }else if(r.fix_suggestion){
    c.append(el("div","Try this instead: "+r.fix_suggestion,"note"));
  }
  if(r.unused_ingredients.length){c.append(secTitle("Didn’t make the cut"));const u=el("ul",null,"plain");r.unused_ingredients.forEach(x=>u.append(el("li",x.item+": "+x.reason)));c.append(u)}
  if(r.safety_note)c.append(el("div",r.safety_note,"note"));
  if(r.zero_proof_swap)c.append(el("div","No-alcohol version: "+r.zero_proof_swap,"note"));
  const acts=el("div",null,"acts");
  if(ok){const cp=el("button","Copy recipe","btn");cp.type="button";cp.onclick=copyRecipe;acts.append(cp)}
  else{const ch=el("button","Change ingredients","btn");ch.type="button";ch.onclick=()=>{$("#s1").scrollIntoView({behavior:"smooth",block:"start"});$("#own").focus({preventScroll:true})};acts.append(ch)}
  const again=el("button","Try the other style","btn alt");again.type="button";
  again.onclick=()=>{const other=document.querySelector("input[name=level]:not(:checked)");other.checked=true;other.dispatchEvent(new Event("change"));go()};
  acts.append(again);c.append(acts);
  $("#result").replaceChildren(c);h.focus({preventScroll:true});
  requestAnimationFrame(()=>$("#resWrap").scrollIntoView({behavior:"smooth",block:"start"}));
}

async function copyRecipe(){
  const r=last;if(!r)return;
  const t=[r.drink_name+" ("+LEVELS[r.level||level]+")",r.tagline||"","","What you'll need:"]
    .concat(r.ingredients.map(i=>"- "+iconFor(i)+" "+i.amount+" "+i.item));
  t.push("","How to make it:",...r.steps.map((s,i)=>(i+1)+". "+s));
  if(r.why_it_works)t.push("","Why it tastes so good: "+r.why_it_works);
  if(r.safety_note)t.push("",r.safety_note);
  try{await navigator.clipboard.writeText(t.join("\n"));$("#status").textContent="Recipe copied."}
  catch(e){$("#status").textContent="Couldn’t copy. Select the recipe text and copy it by hand."}
}

/* ---------- stepper, scroll reveal ---------- */
const stepEls=[1,2,3].map(n=>document.querySelector('.stepper a[data-s="'+n+'"]'));
let styleTouched=false,activeStep=1;
function paintStepper(){
  const done=[ings.length>=2,styleTouched||!!last,!!last];
  stepEls.forEach((a,i)=>{a.classList.toggle("active",activeStep===i+1);a.classList.toggle("done",done[i]);a.querySelector(".n").textContent=done[i]?"✓":String(i+1)});
  document.querySelectorAll(".step").forEach((s,i)=>s.classList.toggle("current",activeStep===i+1));
}
if("IntersectionObserver" in window){
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){activeStep=+e.target.id.slice(2);paintStepper()}}),{rootMargin:"-35% 0px -55% 0px"});
  document.querySelectorAll(".step").forEach(s=>io.observe(s));
  const rv=new IntersectionObserver((es,o)=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");o.unobserve(e.target)}}),{threshold:.06});
  document.querySelectorAll(".reveal").forEach(e=>rv.observe(e));
}else document.querySelectorAll(".reveal").forEach(e=>e.classList.add("in"));

render();