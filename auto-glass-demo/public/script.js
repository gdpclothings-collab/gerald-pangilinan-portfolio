const $=(s,c=document)=>c.querySelector(s);const $$=(s,c=document)=>[...c.querySelectorAll(s)];

// Load final refinement layer after the base stylesheet.
if(!document.querySelector('link[href="refinements.css"]')){const l=document.createElement('link');l.rel='stylesheet';l.href='refinements.css';document.head.appendChild(l)}

// Mobile navigation
const menu=$('#menu'),nav=$('#nav'),backdrop=$('#navBackdrop');
function setMenu(open){if(!menu||!nav)return;nav.classList.toggle('open',open);menu.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu');if(backdrop){backdrop.hidden=!open;backdrop.classList.toggle('show',open)}document.body.classList.toggle('menu-open',open)}
menu?.addEventListener('click',()=>setMenu(!nav.classList.contains('open')));backdrop?.addEventListener('click',()=>setMenu(false));$$('#nav a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));window.addEventListener('resize',()=>{if(innerWidth>900)setMenu(false)});document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});

// Quote wizard
const form=$('#quoteForm');
if(form){let step=1;const steps=$$('.form-step'),labels=$$('.steps span'),bar=$('#progress'),stepCount=$('#stepCount'),success=$('#success');
  const show=n=>{step=n;steps.forEach((el,i)=>el.classList.toggle('active',i===n-1));labels.forEach((el,i)=>{el.classList.toggle('active',i===n-1);el.setAttribute('aria-current',i===n-1?'step':'false')});bar.style.width=`${n/3*100}%`;stepCount.textContent=`Step ${n} of 3`;if(matchMedia('(max-width:900px)').matches)form.scrollIntoView({behavior:'smooth',block:'start'});};
  const valid=()=>{for(const el of steps[step-1].querySelectorAll('[required]')){if(!el.checkValidity()){el.reportValidity();el.focus();return false}}return true};
  $$('.next').forEach(b=>b.addEventListener('click',()=>{if(valid())show(Math.min(3,step+1))}));$$('.back').forEach(b=>b.addEventListener('click',()=>show(Math.max(1,step-1))));

  const vin=$('input[name="vin"]');vin?.addEventListener('input',()=>{vin.value=vin.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g,'').slice(0,17)});vin?.addEventListener('blur',()=>{vin.setCustomValidity(vin.value&&vin.value.length!==17?'Enter all 17 VIN characters, or leave this field blank.':'')});

  const photo=$('#photo'),photoText=$('#photoText'),photoStatus=$('#photoStatus'),photoHelp=$('#photoHelp');photo?.addEventListener('change',()=>{const f=photo.files[0];if(f&&f.size>8*1024*1024){photo.value='';photoText.textContent='Add a damage photo';photoStatus.textContent='File too large';photoStatus.classList.remove('selected');photoHelp.textContent='Maximum 8 MB';return}photoText.textContent=f?f.name:'Add a damage photo';photoStatus.textContent=f?'Selected ✓':'Not selected';photoStatus.classList.toggle('selected',!!f);photoHelp.textContent=f?'Ready for demo preview':'Optional • JPG, PNG or HEIC'});

  const postal=$('#postalInput');postal?.addEventListener('input',()=>{let v=postal.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);if(v.length>3)v=v.slice(0,3)+' '+v.slice(3);postal.value=v});
  const phone=$('#phoneInput');phone?.addEventListener('input',()=>{const d=phone.value.replace(/\D/g,'').slice(0,10);phone.value=d.length>6?`${d.slice(0,3)}-${d.slice(3,6)}-${d.slice(6)}`:d.length>3?`${d.slice(0,3)}-${d.slice(3)}`:d;phone.setCustomValidity(d.length===10?'':'Enter a 10-digit phone number.')});phone?.addEventListener('blur',()=>{const d=phone.value.replace(/\D/g,'');phone.setCustomValidity(d.length===10?'':'Enter a 10-digit phone number.')});

  form.addEventListener('submit',e=>{e.preventDefault();if(!valid())return;steps.forEach(x=>x.classList.remove('active'));success.classList.add('show');bar.style.width='100%';stepCount.textContent='Complete';success.setAttribute('tabindex','-1');success.focus()});
  $('#reset')?.addEventListener('click',()=>{form.reset();success.classList.remove('show');photoText.textContent='Add a damage photo';photoStatus.textContent='Not selected';photoStatus.classList.remove('selected');if(photoHelp)photoHelp.textContent='Optional • JPG, PNG or HEIC';if(phone)phone.setCustomValidity('');if(vin)vin.setCustomValidity('');show(1)});
}

// Multi-step repair-or-replace educational screening
const diagQuestion=$('#diagQuestion'),diagResult=$('#diagResult'),diagProgress=$('#diagProgress'),diagBar=$('#diagBar');
const diagQuestions=[
  {q:'What type of damage do you see?',opts:[['Small chip / bullseye',0,'chip'],['Short crack',1,'crack'],['Long crack',2,'long crack'],['Shattered or heavily damaged',3,'major damage']]},
  {q:'About how large is the damaged area?',opts:[['Smaller than a loonie',0,'small size'],['About palm-width',1,'medium size'],['Longer than a palm',2,'large size']]},
  {q:'Where is the damage located?',opts:[['Away from the edge / centre area',0,'centre location'],['Near an outer edge',2,'edge location'],['Directly in the driver’s main sight line',2,'sight-line location']]},
  {q:'Anything else that may affect the repair?',opts:[['Single fresh impact',0,'single impact'],['Multiple chips / impacts',1,'multiple impacts'],['Dirty, old or previously repaired damage',1,'contamination/history'],['Not sure',1,'needs inspection']]}
];
let diagStep=0,diagScore=0,diagFlags=[];
function renderDiag(){if(!diagQuestion)return;const d=diagQuestions[diagStep];diagProgress.textContent=`Question ${diagStep+1} of ${diagQuestions.length}`;diagBar.style.width=`${((diagStep+1)/diagQuestions.length)*100}%`;diagQuestion.innerHTML=`<h3>${d.q}</h3><div class="diag-options">${d.opts.map((o,i)=>`<button type="button" data-diag="${i}">${o[0]}<span>→</span></button>`).join('')}</div><small>Educational screening only — not a repair guarantee.</small>`;$$('[data-diag]',diagQuestion).forEach(btn=>btn.addEventListener('click',()=>{const opt=d.opts[Number(btn.dataset.diag)];diagScore+=opt[1];diagFlags.push(opt[2]);diagStep++;if(diagStep<diagQuestions.length)renderDiag();else showDiagResult()}));}
function showDiagResult(){diagQuestion.hidden=true;diagResult.hidden=false;diagBar.style.width='100%';diagProgress.textContent='Screening complete';let title,text;if(diagScore<=1){title='This may be a repair candidate.';text='The answers are relatively favourable for a repair assessment. Size, depth, exact location and contamination still need a technician’s review.'}else if(diagScore<=4){title='A technician should inspect it.';text='One or more factors can affect repair suitability. Send a photo and vehicle details so the shop can advise the right next step.'}else{title='Replacement may be more likely.';text='The answers include factors often associated with replacement, but the website should never make the final technical decision without inspection.'}$('#resultTitle').textContent=title;$('#resultText').textContent=text;$('#resultFlags').innerHTML=diagFlags.slice(-3).map(f=>`<span>${f}</span>`).join('');diagResult.setAttribute('tabindex','-1');diagResult.focus()}
$('#restart')?.addEventListener('click',()=>{diagStep=0;diagScore=0;diagFlags=[];diagQuestion.hidden=false;diagResult.hidden=true;renderDiag()});renderDiag();
