/* Registro de case · cole em API_URL a URL do App Script (veja tools/registro-case/README.md) */
const API_URL='https://script.google.com/macros/s/AKfycbwQh49CJvqmwOpFCI5JFpZrTg_GYZlNrQi7gg1IiuEleDHsyfiP3wg0xsYiCpVeZCVT/exec';
const DEMO=!API_URL;
const $=(s,r=document)=>r.querySelector(s),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const T=(k,l,o={})=>({k,l,...o}),N=(k,l,o={})=>T(k,l,{num:1,...o}),TA=(k,l,h)=>T(k,l,{ta:1,w:1,h}),O=(k,l,ops,o={})=>T(k,l,{ops,w:1,...o}),CK=(k,l)=>T(k,l,{ck:1,w:1});
const TIPOS=['Feira','Convenção','Lançamento','Campanha de incentivo','Ativação externa','Outro'];
const MOD={
 'Feira':[N('reunioes','Reuniões realizadas')],
 'Convenção':[N('palestrantes','Palestrantes ou atrações'),N('satisfacao','Satisfação do público (%)')],
 'Lançamento':[N('imprensa','Matérias na imprensa'),N('demos','Demonstrações ou test-drives')],
 'Campanha de incentivo':[N('elegivel','Participantes elegíveis'),N('adesao','Adesão (%)'),N('meta','Meta atingida (%)'),N('premiados','Pessoas premiadas')],
 'Ativação externa':[N('experimentacoes','Pessoas que experimentaram')],'Outro':[]};
const HUB={'Agro':[N('maquinas','Máquinas expostas'),N('demos_campo','Demonstrações no campo')],'Auto':[N('modelos','Veículos expostos'),N('testdrives','Test-drives')]};
const montagem=()=>['Feira','Convenção','Lançamento','Ativação externa'].includes(D.tipo);
const FILES=()=>[
 montagem()&&['render','Render aprovado','Final, em alta.'],
 montagem()&&['angulo','Foto no ângulo do render','Mesmo ponto, altura e luz. Antes do público.'],
 ['evento','Fotos do projeto pronto','Com e sem público. Arquivo original, nunca print de WhatsApp.'],
 montagem()&&['montagem','Montagem e timelapse','Fotos e clipes de cada etapa.'],
 ['videos','Vídeos','Aftermovie, clipes do evento e depoimentos.']].filter(Boolean);
const STEPS=[
 {t:'O que o cliente precisava',n:'Precisava',f:()=>[T('cliente','Cliente',{req:1}),T('evento','Projeto ou evento',{req:1}),O('tipo','Tipo de projeto',TIPOS,{req:1}),O('hub','Hub',['Agro','Auto','Nenhum'],{req:1}),T('cidade','Cidade',{city:1}),T('local','Local'),T('data_ini','Início do evento',{date:1}),T('data_fim','Fim do evento',{date:1}),TA('precisava','O que o cliente precisava?','Em uma frase.')]},
 {t:'O que a Stap criou',n:'Criou',hint:'Uma frase para contextualizar.',f:()=>[TA('solucao','O que a Stap criou?')]},
 {t:'Como entregamos',n:'Entregamos',hint:'Deixe em branco o que não souber.',f:()=>montagem()?[N('m2_terreno','Terreno (m²)'),N('m2_construida','Área construída (m²)'),N('dias_montagem','Dias de montagem'),N('dias_desmontagem','Dias de desmontagem'),N('profissionais','Profissionais envolvidos'),N('ambientes','Ambientes criados'),O('entrega','Montagem entregue em',['D-3 ou antes','D-2','D-1','D-0']),CK('rrt','RRT fornecido pela montadora')]:[N('profissionais','Profissionais envolvidos'),N('cidades_n','Cidades envolvidas')]},
 {t:'O que alcançamos',n:'Alcançamos',hint:'Deixe em branco o que não souber.',f:()=>[N('pub_est','Público estimado'),N('pub_circ','Público circulante'),N('leads','Leads captados'),N('negocios','Negócios fechados'),N('ativacoes','Ativações'),N('brindes','Brindes ou gifts'),N('engajamento','Engajamento nas redes'),...(MOD[D.tipo]||[]),...(HUB[D.hub]||[]),TA('depoimento','Depoimento do cliente','Se houver, nas palavras dele.'),CK('num_ok','Cliente autorizou publicar esses números')]},
 {t:'Fotos e vídeos',n:'Arquivos',files:1,hint:'Envie o arquivo original.',f:()=>[CK('aut_redes','Cliente autorizou publicar o projeto'),CK('collab','Cliente aceita collab no Instagram')]}];
let D={},ID='',S=0,CODE='',DIRTY=false;
const store={get(k){try{return sessionStorage.getItem(k)}catch(e){return null}},set(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}};
const msg=t=>$('#msg').textContent=t||'';
async function api(action,body={}){
 if(DEMO){await new Promise(r=>setTimeout(r,150));if(action==='get')return{ok:false,error:'Sem conexão no modo de teste.'};if(action==='files')return{ok:true,files:{}};return{ok:true,id:ID||slug(),folderUrl:'#'}}
 const r=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,code:CODE,...body})});
 const j=await r.json();if(!j.ok)throw new Error(j.error||'Erro ao falar com o Drive.');return j}
const slug=()=>[D.cliente,D.evento,new Date().getFullYear()].join('-').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').toLowerCase().replace(/^-|-$/g,'')+'-'+Math.random().toString(36).slice(2,6);
function gate(){const p=new URLSearchParams(location.search).get('job')||'';msg('');
 $('#app').innerHTML=`<div class="open"><h1>Registro de cases</h1><p class="st1">Comece por aqui.</p><p>Leva de 5 a 10 minutos.</p>
 <label class="big"><span class="lbl">Código de acesso</span><input id="code" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="job-000000"></label>
 <label class="f" id="jw" ${p?'':'hidden'}><span>Código do job</span><input id="jid" value="${esc(p)}"></label>
 <div class="acts"><button class="btn" id="new">Novo job</button><button class="btn ghost" id="open">Abrir job</button></div></div>`;
 const c=()=>{CODE=$('#code').value.trim();if(!DEMO&&!CODE){msg('Informe o código de acesso.');return false}return true};
 $('#new').onclick=async()=>{if(!c())return;msg('Verificando...');try{await api('ping',{novo:true});D={};ID='';S=0;msg('');render()}catch(e){msg(e.message)}};
 $('#open').onclick=async()=>{const w=$('#jw');if(w.hidden){w.hidden=false;return $('#jid').focus()}if(!c())return;const id=$('#jid').value.trim();if(!id)return msg('Cole o código do job.');msg('Abrindo...');try{const j=await api('get',{id});D=j.data;ID=id;S=0;msg('');render()}catch(e){msg(e.message)}}}
const field=x=>{const v=esc(D[x.k]);const c='f'+(x.w?' w':'');
 if(x.ck)return`<label class="tick w"><input type="checkbox" name="${x.k}" ${D[x.k]==='Sim'?'checked':''}><span>${esc(x.l)}</span></label>`;
 if(x.ops)return`<fieldset class="${c}" style="margin:0;border-width:0 0 1px;padding-inline:0"><legend style="font-size:13px;padding:0">${esc(x.l)}</legend><div class="ops">${x.ops.map(o=>`<label><input type="radio" name="${x.k}" value="${esc(o)}" ${D[x.k]===o?'checked':''}><span>${esc(o)}</span></label>`).join('')}</div></fieldset>`;
 if(x.city)return`<label class="${c} city"><span>${esc(x.l)}</span><input name="${x.k}" value="${v}" placeholder="Digite para buscar"><ul class="sug" hidden></ul></label>`;
 const ty=x.date?'date':x.num?'number':'text';
 return`<label class="${c}"><span>${esc(x.l)}</span>${x.h?`<small>${esc(x.h)}</small>`:''}${x.ta?`<textarea name="${x.k}" rows="2">${v}</textarea>`:`<input type="${ty}" ${x.num?'min="0" step="any" inputmode="decimal"':''} name="${x.k}" value="${v}">`}</label>`};
/* Cidades: lista oficial do IBGE. Se a API falhar, o campo aceita texto livre. */
let CID=null;const norm=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const IBGE='https://servicodados.ibge.gov.br/api/v1/localidades/municipios?view=nivelado';
function city(){const i=$('input[name=cidade]');if(!i)return;const u=$('.sug');let ok=false;
 const load=()=>CID||(CID=fetch(IBGE).then(r=>r.json()).then(l=>[...l.map(c=>c['municipio-nome']+', '+c['UF-sigla']),'Fora do Brasil'].map(c=>[c,norm(c)])).catch(()=>{CID=null;return[]}));
 const pick=c=>{i.value=c;D.cidade=c;DIRTY=true;u.hidden=true};
 i.oninput=async()=>{const q=norm(i.value.trim());D.cidade=i.value;DIRTY=true;if(q.length<2){u.hidden=true;return}const l=await load();ok=l.length>0;const r=[...l.filter(c=>c[1].startsWith(q)),...l.filter(c=>!c[1].startsWith(q)&&c[1].includes(q))].slice(0,8);u.innerHTML=r.map(c=>`<li><button type="button">${esc(c[0])}</button></li>`).join('');u.hidden=!r.length;u.querySelectorAll('button').forEach(b=>b.onmousedown=e=>{e.preventDefault();pick(b.textContent)})};
 i.onblur=()=>setTimeout(async()=>{u.hidden=true;if(ok&&!(await load()).some(c=>c[0]===i.value)){i.value='';D.cidade=''}},120)}
function dias(){if(D.data_ini&&D.data_fim&&D.data_fim>=D.data_ini)D.dias_evento=String(Math.round((new Date(D.data_fim)-new Date(D.data_ini))/864e5)+1);const f=$('input[name=data_fim]');if(f&&D.data_ini)f.min=D.data_ini}
function render(){const s=STEPS[S];
 $('#app').innerHTML=`<div class="job"><span>${ID?`Job <b>${esc(ID)}</b>`:'Novo job'}</span>${ID?'<button id="cp">Copiar link deste job</button>':''}</div><div class="lay"><ol class="steps">${STEPS.map((x,i)=>`<li><button data-i="${i}" class="${i===S?'on':''}" ${i===S?'aria-current="step"':''}><i>${i+1}</i>${x.n}</button></li>`).join('')}</ol>
 <div class="pane"><div class="who lbl">Etapa ${S+1} de ${STEPS.length}</div><h2>${s.t}</h2><p class="hint">${s.hint||''}</p><form id="fm" class="g" autocomplete="off">${s.f().map(field).join('')}</form>${s.files?`<div id="fs"></div>`:''}
 <div class="nav"><button class="btn ghost" id="bk" ${S?'':'hidden'}>Voltar</button><button class="btn" id="nx">${S<STEPS.length-1?'Salvar e continuar':'Salvar e concluir'}</button></div></div></div>`;
 $('#fm').oninput=e=>{DIRTY=true;if(e.target.name&&e.target.name!=='cidade')D[e.target.name]=e.target.type==='checkbox'?(e.target.checked?'Sim':''):e.target.value;dias()};
 document.querySelectorAll('.steps button').forEach(b=>b.onclick=()=>go(+b.dataset.i));
 $('#bk').onclick=()=>go(S-1);$('#nx').onclick=()=>S<STEPS.length-1?go(S+1):go(S,true);
 const cp=$('#cp');if(cp)cp.onclick=async()=>{const u=location.origin+location.pathname+'?job='+ID;try{await navigator.clipboard.writeText(u);msg('Link copiado.')}catch(e){msg(u)}};
 city();dias();if(s.files)files();scrollTo({top:$('#app').offsetTop-24})}
function valid(){const miss=STEPS[0].f().filter(x=>x.req&&!D[x.k]);if(miss.length){msg('Preencha: '+miss.map(x=>x.l).join(', ')+'.');return false}return true}
async function save(){if(!valid())return false;if(!DIRTY&&ID)return true;msg('Salvando...');try{const j=await api('save',{id:ID,data:D});ID=j.id;DIRTY=false;msg('Salvo.');return true}catch(e){msg('Não salvou: '+e.message+' Tente de novo.');return false}}
async function go(i,done){if(S===0&&i===0&&!done)return;if(!await save()){S=0;render();valid();return}S=i;if(done){const t=STEPS.map(s=>s.t+'\n'+(s.f().filter(x=>x.k&&D[x.k]).map(x=>'- '+x.l+': '+D[x.k]).join('\n')||'- Sem respostas')).join('\n\n');try{await api('done',{id:ID,titulo:D.cliente+' · '+D.evento,resumo:t})}catch(e){}return resumo()}render()}
const br=d=>d.split('-').reverse().join('/');
async function resumo(){let fl={};try{fl=(await api('files',{id:ID})).files||{}}catch(e){}
 const val=x=>x.date&&D[x.k]?br(D[x.k]):D[x.k];
 const sec=STEPS.map((s,i)=>{const r=s.f().filter(x=>x.k&&D[x.k]).map(x=>`<div class="rr"><span>${esc(x.l)}</span><b>${x.ck?'Sim':esc(val(x))}</b></div>`).join('');
  const a=s.files?FILES().map(([k,t])=>`<div class="rr"><span>${esc(t)}</span><b>${(fl[k]||[]).length} arquivo(s)</b></div>`).join(''):'';
  return`<section class="rs"><div class="rh"><h3>${esc(s.t)}</h3><button data-i="${i}">Editar</button></div>${r+a||'<p class="hint">Sem respostas.</p>'}</section>`}).join('');
 $('#app').innerHTML=`<div class="pane"><div class="who lbl">${DEMO?'Teste concluído':'Registro concluído'}</div><h2>Tudo certo, <em style="color:var(--blue)">obrigado.</em></h2><p class="hint">${DEMO?'Modo de teste: nada foi salvo.':'Suas respostas foram salvas.'} Confira o resumo. Job: ${esc(ID)}</p>${sec}<div class="acts"><button class="btn" id="pr">Imprimir ou salvar em PDF</button><button class="btn ghost" id="nw">Novo job</button></div></div>`;
 document.querySelectorAll('.rs button').forEach(b=>b.onclick=()=>{S=+b.dataset.i;render()});$('#pr').onclick=()=>print();$('#nw').onclick=()=>{D={};ID='';S=0;CODE='';gate()};msg('');scrollTo({top:$('#app').offsetTop-24})}
const size=b=>b>1e9?(b/1e9).toFixed(1)+' GB':(b/1e6).toFixed(1)+' MB';
async function files(){const box=$('#fs');box.innerHTML=FILES().map(([k,t,h])=>`<div class="drop" data-k="${k}"><h3>${t}</h3><p>${h}</p><label class="zone"><input type="file" multiple>Arraste aqui ou clique para escolher</label><ul class="fl"></ul></div>`).join('');
 box.querySelectorAll('.drop').forEach(d=>{const z=$('.zone',d),inp=$('input',d),k=d.dataset.k;inp.onchange=()=>{[...inp.files].forEach(f=>up(f,k,d));inp.value=''};
  z.ondragover=e=>{e.preventDefault();z.classList.add('over')};z.ondragleave=()=>z.classList.remove('over');z.ondrop=e=>{e.preventDefault();z.classList.remove('over');[...e.dataTransfer.files].forEach(f=>up(f,k,d))}});
 try{const j=await api('files',{id:ID});for(const[k,l]of Object.entries(j.files||{})){const u=box.querySelector(`[data-k="${k}"] .fl`);if(u)l.forEach(n=>u.insertAdjacentHTML('beforeend',`<li><span class="nm">${esc(n)}</span><span class="st ok">Enviado</span></li>`))}}catch(e){}}
async function up(f,k,d){const li=document.createElement('li');li.innerHTML=`<span class="nm">${esc(f.name)} · ${size(f.size)}</span><span class="st">Preparando</span><span class="pg"><b></b></span>`;$('.fl',d).append(li);
 const st=$('.st',li),bar=$('.pg b',li);const end=t=>{st.textContent=t;st.classList.add('ok');bar.parentNode.remove()};
 const fail=()=>{st.innerHTML='Falhou <button>Tentar de novo</button>';$('button',st).onclick=()=>{li.remove();up(f,k,d)}};
 try{if(DEMO){bar.style.width='100%';return end('Simulado')}
  const j=await api('upload',{id:ID,cat:k,name:f.name,mime:f.type||'application/octet-stream',size:f.size});
  await new Promise((ok,no)=>{const x=new XMLHttpRequest();x.open('PUT',j.url);x.upload.onprogress=e=>{const p=e.loaded/e.total*100;bar.style.width=p+'%';st.textContent=Math.round(p)+'%'};x.onload=()=>x.status<300?ok():no();x.onerror=no;x.send(f)});end('Enviado')}
 catch(e){try{const j=await api('files',{id:ID});if((j.files[k]||[]).includes(f.name))return end('Enviado')}catch(_){}
  fail()}}
if(DEMO)$('#demo').hidden=false;gate();
window.addEventListener('beforeunload',e=>{if(DIRTY)e.preventDefault()});
