/* PDF do job na identidade Stap: páginas A4 em HTML viram imagem e depois PDF. */
const PX=s=>String(s??'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const fmt=v=>/^\d+(\.\d+)?$/.test(String(v))?Number(v).toLocaleString('pt-BR'):v;
const dbr=d=>d?d.split('-').reverse().join('/'):'';
async function gerarPDF(D,id,steps,capa){
 await document.fonts.ready;
 const big=[['m2_construida','m² construídos'],['pub_est','público estimado'],['pub_circ','público circulante'],['leads','leads captados'],['negocios','negócios fechados'],['dias_montagem','dias de montagem'],['profissionais','profissionais'],['elegivel','elegíveis'],['adesao','% de adesão']].filter(x=>D[x[0]]).slice(0,4);
 const skip=new Set(['cliente','evento','tipo','hub','cidade','local','data_ini','data_fim','precisava','solucao','depoimento']);
 const tab=(s)=>{const l=s.f().filter(x=>x.k&&D[x.k]&&!skip.has(x.k));return l.length?`<div class="fi">${l.map(x=>`<div><span>${PX(x.l)}</span><b>${PX(x.ck?'Sim':fmt(D[x.k]))}</b></div>`).join('')}</div>`:''};
 const when=[dbr(D.data_ini),dbr(D.data_fim)].filter(Boolean).join(' a ');
 const blocks=[
  `<header class="${capa?'hf':''}">${capa?`<div class="foto" style="background-image:url(${capa})"></div>`:''}<div class="k"><span>Registro de cases</span><span>${new Date().toLocaleDateString('pt-BR')}</span></div><h1>${PX(D.cliente)}</h1><h2>${PX(D.evento)}</h2><p class="m">${[D.tipo,D.hub!=='Nenhum'&&D.hub,D.cidade,D.local,when].filter(Boolean).map(PX).join('  ·  ')}</p></header>`,
  big.length?`<section class="big" style="grid-template-columns:repeat(${big.length},1fr)">${big.map(b=>`<div><b>${PX(fmt(D[b[0]]))}</b><span>${b[1]}</span></div>`).join('')}</section>`:'',
  D.precisava?`<section class="t"><h3>O que o cliente <em>precisava</em></h3><p>${PX(D.precisava)}</p></section>`:'',
  D.solucao?`<section class="t"><h3>O que a Stap <em>criou</em></h3><p>${PX(D.solucao)}</p></section>`:'',
  tab(steps[2])?`<section class="gr"><h3>Como <em>entregamos</em></h3>${tab(steps[2])}</section>`:'',
  tab(steps[3])?`<section class="gr"><h3>O que <em>alcançamos</em></h3>${tab(steps[3])}</section>`:'',
  D.depoimento?`<section class="q"><p>“${PX(D.depoimento)}”</p></section>`:'',
  tab(steps[4])?`<section class="gr"><h3>Autorizações</h3>${tab(steps[4])}</section>`:''].filter(Boolean);
 const host=document.createElement('div');host.className='pdfhost';document.body.append(host);
 const page=()=>{const p=document.createElement('div');p.className='pg';p.innerHTML='<main></main><footer><img src="assets/logos/stap-navy.png" alt=""><span></span></footer>';host.append(p);return p};
 let p=page();for(const h of blocks){const m=p.firstChild;const t=document.createElement('template');t.innerHTML=h;const n=t.content.firstChild;m.append(n);if(m.scrollHeight>m.clientHeight+1&&m.children.length>1){n.remove();p=page();p.firstChild.append(n)}}
 const ps=[...host.children];ps.forEach((x,i)=>x.querySelector('footer span').textContent=`${id}  ·  ${i+1}/${ps.length}`);
 window.__pgs=[];const pdf=new jspdf.jsPDF({unit:'pt',format:'a4',compress:true});
 for(let i=0;i<ps.length;i++){const c=await html2canvas(ps[i],{scale:2,backgroundColor:'#fff',logging:false,useCORS:true});window.__pgs.push(c);if(i)pdf.addPage();pdf.addImage(c.toDataURL('image/jpeg',.92),'JPEG',0,0,595.28,841.89)}
 host.remove();return pdf.output('datauristring').split(',')[1]}
