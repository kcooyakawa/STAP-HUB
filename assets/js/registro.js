/* Registro de case · cole em API_URL a URL do App Script (veja tools/registro-case/README.md) */
const API_URL='';
const DEMO=!API_URL;
const $=(s,r=document)=>r.querySelector(s),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const T=(k,l,o={})=>({k,l,...o}),TA=(k,l,h)=>T(k,l,{ta:1,w:1,h}),O=(k,l,ops,o={})=>T(k,l,{ops,w:1,...o});
const SN=['Sim','Não','Ainda não sei'];
const TIPOS=['Feira','Convenção','Lançamento','Campanha de incentivo','Ativação externa','Outro'];
const MOD={
 'Feira':[T('m2','Área (m²)'),T('visitantes','Visitantes no estande'),T('leads','Leads gerados'),T('reunioes','Reuniões realizadas'),T('negocios','Negócios fechados ou intenção de compra')],
 'Convenção':[T('participantes','Participantes'),T('dias','Dias de evento'),T('plenarias','Plenárias ou sessões'),T('palestrantes','Palestrantes ou atrações'),T('trocas','Trocas de cenário ou palco'),T('satisfacao','Satisfação do público (%)')],
 'Lançamento':[T('produto','Produto lançado'),T('convidados','Convidados presentes'),T('imprensa','Veículos e matérias na imprensa'),T('alcance','Alcance nas redes'),T('testdrive','Test-drives ou demonstrações'),TA('revelacao','Como foi a revelação?')],
 'Campanha de incentivo':[T('elegivel','Público elegível'),T('adesao','Adesão (%)'),T('meta','Meta da campanha'),T('resultado','Resultado contra a meta'),T('ganhadores','Ganhadores'),T('premiacao','Premiação')],
 'Ativação externa':[T('m2','Área (m²)'),T('publico','Público impactado'),T('interacoes','Interações ou experimentações'),T('leads','Leads gerados'),T('alcance','Alcance nas redes')],
 'Outro':[T('publico','Público'),TA('outros','Outros números importantes')]};
const HUB={'Agro':[T('pracas','Praças ou cidades'),T('edicoes','Edições no circuito'),T('simultaneas','Montagens simultâneas'),T('culturas','Culturas ou produtos em destaque')],
 'Auto':[T('modelos','Modelos expostos'),T('testdrives','Test-drives'),T('concessionarias','Concessionárias envolvidas')]};
const montagem=()=>['Feira','Convenção','Lançamento','Ativação externa'].includes(D.tipo);
const FILES=()=>[
 montagem()&&['render','Render aprovado','Final, em alta, 3000 px ou mais no lado maior.'],
 montagem()&&['angulo','Foto no ângulo do render','Mesmo ponto, altura e luz. Antes do público.'],
 ['evento','Fotos do projeto pronto','Com e sem público. Arquivo original, nunca print de WhatsApp.'],
 montagem()&&['montagem','Montagem e bastidores','Fotos e clipes verticais de cada etapa.'],
 montagem()&&['timelapse','Timelapse','Câmera fixa, do primeiro ao último dia.'],
 ['videos','Vídeos','Aftermovie, clipes do evento e depoimentos.'],
 ['docs','Peças e documentos','Key visual, planta, apresentação, autorização em PDF.']].filter(Boolean);
const STEPS=[
 {t:'Job',w:'Atendimento',when:'Na abertura',f:()=>[T('cliente','Cliente',{req:1}),T('evento','Projeto ou evento',{req:1}),O('tipo','Tipo de evento',TIPOS,{req:1}),O('hub','Hub',['Agro','Auto','Nenhum'],{req:1}),T('cidade','Cidade e local'),T('datas','Datas do evento'),T('responsavel','Responsável pelo job'),T('email','E-mail do responsável')]},
 {t:'Briefing',w:'Atendimento',when:'Na abertura',f:()=>[TA('pedido','O que o cliente pediu?','Nas palavras do cliente, se possível.'),TA('desafio','Qual era o desafio real?','Uma frase. É o que abre o case.'),TA('objetivo','Qual era o objetivo do cliente?'),TA('restricoes','Quais eram as restrições?','Prazo, verba, espaço, regras do evento.')]},
 {t:'Solução',w:'Criação e arquitetura',when:'Com o projeto aprovado',f:()=>[TA('ideia','Qual foi a ideia central?','Em uma frase.'),TA('solucao','O que criamos?','Do conceito às principais entregas.'),TA('porque','Por que esse caminho?'),TA('sentimento','O que o público deveria sentir?','E o que foi feito para isso acontecer.'),T('equipe','Equipe Stap',{w:1}),T('parceiros','Parceiros',{w:1})]},
 {t:'Números',w:'Produção e atendimento',when:'Até 5 dias úteis após o evento',hint:'Só números reais. Deixe em branco o que não souber.',f:()=>[
   ...(montagem()?[{g:'Ficha de entrega',s:'Números da Stap, confirmados pela produção.'},T('f_projeto','Dias do render aprovado à abertura'),T('f_montagem','Dias de montagem'),T('f_pronto','Pronto quantos dias antes da abertura?'),T('f_equipe','Pessoas em campo'),T('f_rrt','Arquiteto responsável e RRT'),T('f_area','Área (m²)'),T('f_desde','Cliente desde'),T('f_edicoes','Edições juntos')]:[]),
   {g:'Big numbers · '+(D.tipo||'tipo de evento'),s:'Podem vir do cliente: indique a fonte abaixo.'},...(MOD[D.tipo]||[]),
   ...(HUB[D.hub]?[{g:'Hub '+D.hub},...HUB[D.hub]]:[]),
   {g:'Comprovação'},T('fonte','Fonte dos números do cliente',{w:1}),O('num_ok','O cliente autorizou publicar esses números?',SN)]},
 {t:'Arquivos',w:'Produção',when:'Durante e após o evento',files:1,hint:'Envie o arquivo original. Pode fechar a página entre uma etapa e outra: a pasta continua no job.',f:()=>[]},
 {t:'Publicação',w:'Atendimento',when:'Até 5 dias úteis após o evento',f:()=>[O('aut_redes','O cliente autorizou publicar nas redes?',SN),T('aut_data','Pode publicar a partir de quando?'),O('collab','Aceita collab no Instagram?',SN),T('arroba','@ do cliente no Instagram'),T('aprovador','Quem do cliente aprovou?',{w:1}),TA('depoimento','Depoimento do cliente','Palavras do cliente, sem edição.'),T('dep_nome','Nome de quem falou'),T('dep_cargo','Cargo'),TA('obs','O que não pode ser dito ou mostrado?')]}];
let D={},ID='',S=0,CODE='',DIRTY=false;
const store={get(k){try{return sessionStorage.getItem(k)}catch(e){return null}},set(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}};
const msg=t=>$('#msg').textContent=t||'';
async function api(action,body={}){
 if(DEMO){await new Promise(r=>setTimeout(r,150));if(action==='get')return{ok:false,error:'Sem conexão no modo de teste.'};if(action==='files')return{ok:true,files:{}};return{ok:true,id:ID||slug(),folderUrl:'#'}}
 const r=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,code:CODE,...body})});
 const j=await r.json();if(!j.ok)throw new Error(j.error||'Erro ao falar com o Drive.');return j}
const slug=()=>[D.cliente,D.evento,new Date().getFullYear()].join('-').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').toLowerCase().replace(/^-|-$/g,'')+'-'+Math.random().toString(36).slice(2,6);
function gate(){const p=new URLSearchParams(location.search).get('job')||'';
 $('#app').innerHTML=`<div class="gate pane"><h2>Comece por aqui.</h2><p class="hint">Use o código de acesso interno da Stap.</p>
 ${DEMO?'':`<label class="f"><span>Código de acesso</span><input id="code" type="password" autocomplete="off" value="${esc(store.get('stap-code')||'')}"></label>`}
 <div class="acts"><button class="btn" id="new">Novo job</button></div>
 <div class="or"><label class="f"><span>Continuar um job</span><small>Cole o código recebido.</small><input id="jid" value="${esc(p)}"></label><div class="acts"><button class="btn ghost" id="open">Abrir job</button></div></div></div>`;
 const c=()=>{CODE=$('#code')?.value.trim()||'';store.set('stap-code',CODE)};
 $('#new').onclick=async()=>{c();if(!DEMO&&!CODE)return msg('Informe o código de acesso.');try{await api('ping');D={};ID='';S=0;render()}catch(e){msg(e.message)}};
 $('#open').onclick=async()=>{c();const id=$('#jid').value.trim();if(!id)return msg('Cole o código do job.');msg('Abrindo...');try{const j=await api('get',{id});D=j.data;ID=id;S=0;msg('');render()}catch(e){msg(e.message)}};
 if(p&&(DEMO||CODE))$('#open').click()}
const field=x=>{if(x.g)return`<div class="gt">${esc(x.g)}${x.s?`<small>${esc(x.s)}</small>`:''}</div>`;const v=esc(D[x.k]);const c='f'+(x.w?' w':'');
 if(x.ops)return`<fieldset class="${c}" style="margin:0;border-width:0 0 1px;padding-inline:0"><legend style="font-size:13px;padding:0">${esc(x.l)}</legend><div class="ops">${x.ops.map(o=>`<label><input type="radio" name="${x.k}" value="${esc(o)}" ${D[x.k]===o?'checked':''}><span>${esc(o)}</span></label>`).join('')}</div></fieldset>`;
 return`<label class="${c}"><span>${esc(x.l)}</span>${x.h?`<small>${esc(x.h)}</small>`:''}${x.ta?`<textarea name="${x.k}">${v}</textarea>`:`<input name="${x.k}" value="${v}">`}</label>`};
function render(){const s=STEPS[S];
 $('#app').innerHTML=`<div class="job"><span>${ID?`Job <b>${esc(ID)}</b>`:'Novo job'}</span>${ID?'<button id="cp">Copiar link para o próximo responsável</button>':''}</div><div class="lay"><ol class="steps">${STEPS.map((x,i)=>`<li><button data-i="${i}" class="${i===S?'on':''}" ${i===S?'aria-current="step"':''}><i>${i+1}</i>${x.t}<small>${x.w}</small></button></li>`).join('')}</ol>
 <div class="pane"><div class="who lbl">${s.w} · ${s.when}</div><h2>${s.t}</h2><p class="hint">${s.hint||''}</p><form id="fm" class="g" autocomplete="off">${s.f().map(field).join('')}</form>${s.files?`<div id="fs"></div>`:''}
 <div class="nav"><button class="btn ghost" id="bk" ${S?'':'hidden'}>Voltar</button><button class="btn" id="nx">${S<STEPS.length-1?'Salvar e continuar':'Salvar e concluir'}</button></div></div></div>`;
 $('#fm').oninput=e=>{DIRTY=true;if(e.target.name)D[e.target.name]=e.target.value};
 document.querySelectorAll('.steps button').forEach(b=>b.onclick=()=>go(+b.dataset.i));
 $('#bk').onclick=()=>go(S-1);$('#nx').onclick=()=>S<STEPS.length-1?go(S+1):go(S,true);
 const cp=$('#cp');if(cp)cp.onclick=async()=>{const u=location.origin+location.pathname+'?job='+ID;try{await navigator.clipboard.writeText(u);msg('Link copiado.')}catch(e){msg(u)}};
 if(s.files)files();scrollTo({top:$('#app').offsetTop-90})}
function valid(){const miss=STEPS[0].f().filter(x=>x.req&&!D[x.k]);if(miss.length){msg('Preencha: '+miss.map(x=>x.l).join(', ')+'.');return false}return true}
async function save(){if(!valid())return false;if(!DIRTY&&ID)return true;msg('Salvando...');try{const j=await api('save',{id:ID,data:D});ID=j.id;DIRTY=false;msg('Salvo.');return true}catch(e){msg('Não salvou: '+e.message+' Tente de novo.');return false}}
async function go(i,done){if(S===0&&i===0&&!done)return;if(!await save()){S=0;render();valid();return}S=i;render();if(done)msg('Tudo salvo. Obrigado.')}
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
if(DEMO)$('#demo').hidden=false;CODE=store.get('stap-code')||'';gate();
window.addEventListener('beforeunload',e=>{if(DIRTY)e.preventDefault()});
