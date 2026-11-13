const IMG={"fach": ["img/fach0.jpg", "img/fach1.jpg", "img/fach2.jpg"], "escola": ["img/escola0.jpg", "img/escola1.jpg", "img/escola2.jpg", "img/escola3.jpg", "img/escola4.jpg"], "recup": ["img/recup0.jpg", "img/recup1.jpg", "img/recup2.jpg"], "manut": ["img/manut0.jpg", "img/manut1.jpg", "img/manut2.jpg"], "proj": ["img/proj0.jpg", "img/proj1.jpg", "img/proj2.jpg"], "alt": ["img/alt0.jpg", "img/alt1.jpg", "img/alt2.jpg"]};

const SERV=[["Construção","Execução de obras civis em diversos segmentos."],["Projeto","Projetos arquitetônicos e complementares."],["Gerenciamento","Gestão e acompanhamento eficiente de obras."],["Reforma","Reformas residenciais e prediais."],["Orçamento","Orçamentos detalhados e transparentes."],["Laudo técnico","Laudos e inspeções técnicas."],["Consultoria","Orientação técnica especializada."],["Planejamento","Planejamento de obras e cronogramas."]];
const PORT=[["Pintura e revitalização de fachadas","Salvador · 2023","Lavagem, tratamento de fissuras, emassamento, pintura e revitalização de pastilhas cerâmicas em edifício multifamiliar."],["Construção de unidade escolar","Salvador · 2022","Escola com dois pavimentos e 140 m² de área construída."],["Recuperação de estruturas","Salvador · 2022","Concreto armado: demolição, lixamento de armaduras, anticorrosivo à base de zinco e concretagem com graute."],["Manutenção de fachadas","Salvador · 2022","Novo reboco e nova pintura de acabamento em edifício multifamiliar."],["Execução de projeto","Simões Filho · 2020","Projeto arquitetônico e complementares para residência em condomínio fechado."],["Projeto de alteração de fachada","Camaçari · 2022","Elaboração de projeto de alteração de fachada residencial."]];
const $=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const cards=(a,f)=>a.map(f).join("");
const sc=([t,d])=>`<div class="card"><h3>${t}</h3><p>${d}</p></div>`;
$("#g-serv").innerHTML=$("#g-serv2").innerHTML=cards(SERV,sc);
$("#g-port").innerHTML=cards(PORT,([t,l,d])=>`<div class="card"><span class="tag">${l}</span><h3>${t}</h3><p>${d}</p></div>`);

const PK=["fach","escola","recup","manut","proj","alt"],SI=[["escola",0],["proj",2],["escola",1],["fach",1],["proj",0],["recup",0],["manut",0],["alt",2]];
const ph=(src,t,d,x,i)=>`<div class="card ph reveal" style="--d:${(i%4)*.08}s" ${x}><img loading="lazy" src="${src}" alt="${t} – ENAARQ"><div class="ov"><h3>${t}</h3><p>${d}</p></div></div>`;
const sv=()=>SERV.map((s,i)=>ph(IMG[SI[i][0]][SI[i][1]],s[0],s[1],"",i)).join("");
const pf=a=>a.map(i=>ph(IMG[PK[i]][0],PORT[i][0],PORT[i][1],`data-p="${i}"`,i)).join("");
$("#g-serv").innerHTML=$("#g-serv2").innerHTML=sv();$("#g-port").innerHTML=pf([0,1,2,3,4,5]);$("#g-feat").innerHTML=pf([0,1,4]);
$("#mq").innerHTML="<span>"+(SERV.map(s=>s[0]).join(" &nbsp;•&nbsp; ")+" &nbsp;•&nbsp; ").repeat(4)+"</span>";
$("#sl").innerHTML=["fach","escola","proj","recup"].map((k,i)=>`<img src="${IMG[k][k==="proj"?2:0]}" class="${i?"":"on"}" alt="Obras e projetos da ENAARQ">`).join("");
let si=0;setInterval(()=>{const s=document.querySelectorAll("#sl img");s[si].classList.remove("on");si=(si+1)%s.length;s[si].classList.add("on")},5500);
document.addEventListener("click",e=>{const c=e.target.closest("[data-p]");const lb=$("#lb");
if(c){const i=+c.dataset.p;lb.innerHTML=`<button class="btn s" style="align-self:flex-end" id="lx">Fechar ✕</button><h2>${PORT[i][0]}</h2><span class="tag">${PORT[i][1]}</span><p style="color:var(--mut);max-width:700px">${PORT[i][2]}</p><div class="rw">${IMG[PK[i]].map(s=>`<img src="${s}" alt="${PORT[i][0]} – ENAARQ">`).join("")}</div>`;lb.classList.add("on")}
else if(e.target.id==="lx"||e.target===lb)lb.classList.remove("on")});
addEventListener("keydown",e=>{if(e.key==="Escape")$("#lb").classList.remove("on")});
let io;function obs(){io=io||new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add("in");io.unobserve(x.target)}}),{threshold:.12});
document.querySelectorAll(".reveal:not(.in)").forEach(el=>io.observe(el))}
function initFX(){obs();addEventListener("hashchange",()=>{scrollTo(0,0);setTimeout(obs,50)});
const pg=$("#prog"),sl=$("#sl");addEventListener("scroll",()=>{const m=document.documentElement.scrollHeight-innerHeight;pg.style.transform=`scaleX(${m>0?scrollY/m:0})`;sl.style.transform=`translateY(${scrollY*.18}px)`},{passive:true});
const cr=$("#cr"),cb=$("#cb"),hk=$("#hk");if(!matchMedia("(pointer:fine)").matches)return;
let mx=-200,my=-200,px=0,a=0,w=0,sc=1,tg=1,on=false,lt=null,hs=1,hz=1;
addEventListener("mousemove",e=>{mx=e.clientX;my=e.clientY;if(!on){on=true;document.body.classList.add("cu")}
if(e.target!==lt){lt=e.target;const hv=!!(e.target.closest&&e.target.closest("a,button,input,select,textarea,[data-p],label"));hk.setAttribute("fill",hv?"#ffdd5c":"none");hs=hv?1.25:1}},{passive:true});
addEventListener("pointerdown",()=>tg=1.4,{passive:true});addEventListener("pointerup",()=>tg=1,{passive:true});
(function f(){const vx=mx-px;px=mx;w+=-.1*a-.12*w-vx*.12;a=Math.max(-40,Math.min(40,a+w));sc+=(tg-sc)*.3;
hz+=(hs-hz)*.25;cr.style.transform=`translate3d(${mx}px,${my}px,0) scale(${hz}) translate(-60px,-52px)`;
cb.setAttribute("transform",`rotate(${a} 60 16) translate(60 16) scale(1 ${sc}) translate(-60 -16)`);requestAnimationFrame(f)})()}

const api=async(m,u,b,f)=>{const H={"X-Requested-With":"enaarq"};if(b&&!f)H["Content-Type"]="application/json";
const r=await fetch("/api"+u,{method:m,credentials:"same-origin",headers:H,body:f?b:(b?JSON.stringify(b):undefined)});
const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.erro||"Serviço de contas indisponível no momento. Fale conosco pelo WhatsApp.");return j};
let me=null;const isStaff=()=>me&&me.role!=="cliente",isAdm=()=>me&&["adm","ti"].includes(me.role);
const op=a=>a.map(([v,l])=>`<option value="${esc(v)}">${esc(l)}</option>`).join("");
function route(){const h=(location.hash||"#inicio").slice(1);const id=["inicio","portfolio","servicos","cliente","equipe"].includes(h)?h:"inicio";
document.querySelectorAll(".view").forEach(v=>v.classList.toggle("on",v.id==="v-"+id));
document.querySelectorAll("#nav a").forEach(a=>a.classList.toggle("on",a.getAttribute("href")==="#"+id));
if(id==="cliente")renderCli();if(id==="equipe")renderEq()}
addEventListener("hashchange",route);
function authUI(el,reg,canReg,msg){el.innerHTML=`<p>${esc(msg||(reg?"Crie sua conta para solicitar serviços.":"Entre para continuar."))}</p>
<label>E-mail</label><input id="le" type="email" autocomplete="username">${reg?`<label>Nome</label><input id="ln" autocomplete="name">`:""}
<label>Senha${reg?" (mín. 10 caracteres)":""}</label><input id="lp" type="password" autocomplete="${reg?"new-password":"current-password"}">
<button class="btn" id="lb2">${reg?"Criar conta":"Entrar"}</button> ${canReg?`<button class="btn o" id="lt">${reg?"Já tenho conta":"Criar conta"}</button>`:""}<p id="lm" style="color:var(--gold)"></p>`;
$("#lb2").onclick=async()=>{try{const b={email:$("#le").value,senha:$("#lp").value};if(reg)b.nome=$("#ln").value;me=(await api("POST",reg?"/auth/register":"/auth/login",b)).user;route()}catch(e){$("#lm").textContent=e.message}};
if(canReg)$("#lt").onclick=()=>authUI(el,!reg,true,msg)}
const sair=()=>api("POST","/auth/logout").then(()=>{me=null;route()});
async function renderCli(){const el=$("#cli");if(!me)return authUI(el,false,true);el.innerHTML="<p>Carregando…</p>";
if(isStaff()){el.innerHTML=`<div class="note">Conta da equipe. Use a aba Equipe.</div><button class="btn s o" id="lo">Sair</button>`;$("#lo").onclick=sair;return}
const mine=await api("GET","/solicitacoes").catch(()=>[]);
el.innerHTML=`<p>Olá, ${esc(me.nome)}. Somente a equipe ENAARQ recebe o seu pedido e responde por aqui. <button class="btn s o" id="lo">Sair</button></p>
<label>Serviço</label><select id="rs">${op(SERV.map(s=>[s[0],s[0]]))}</select><label>Local</label><input id="rl" maxlength="150" placeholder="Bairro e cidade">
<label>Descrição</label><textarea id="rd" rows="4" maxlength="2000"></textarea><button class="btn" id="rb">Enviar solicitação</button><p id="lm" style="color:var(--gold)"></p>
<h2 style="margin-top:32px">Minhas solicitações</h2>${mine.length?mine.map(r=>`<div class="card" style="margin-bottom:10px"><span class="st">${esc(r.status)}</span> <b>${esc(r.servico)}</b> · ${esc(r.local)}<p>${esc(r.descricao)}</p>${r.resposta?`<p style="color:var(--gold)">Devolutiva: ${esc(r.resposta)}</p>`:""}</div>`).join(""):"<p>Nenhuma solicitação ainda.</p>"}`;
$("#lo").onclick=sair;$("#rb").onclick=()=>api("POST","/solicitacoes",{servico:$("#rs").value,local:$("#rl").value,descricao:$("#rd").value}).then(renderCli).catch(e=>$("#lm").textContent=e.message)}
async function equipe(id){const box=$("#e"+id),d=await api("GET",`/obras/${id}/equipe`).catch(e=>{alert(e.message);return null});if(!d)return;
const P=isAdm()?[["lider","Líder"],["membro","Membro (envia documentos)"],["leitura","Somente leitura"]]:[["membro","Membro (envia documentos)"],["leitura","Somente leitura"]];
box.innerHTML=`<p><b>Equipe da obra</b></p>`+d.membros.map(m=>`<div>${esc(m.nome)} ${esc(m.cargo?"· "+m.cargo:"")} · ${esc(m.papel)}${m.papel!=="lider"||isAdm()?` <a href="#equipe" data-x="${m.id}" style="color:var(--gold)">remover</a>`:""}</div>`).join("")+`<label>Colaborador</label><select id="eu${id}">${op(d.candidatos.map(u=>[u.id,u.nome+(u.cargo?" – "+u.cargo:"")]))}</select><label>Acesso</label><select id="ep${id}">${op(P)}</select><button class="btn s" id="eb${id}">Conceder / alterar</button>`;
box.querySelectorAll("[data-x]").forEach(a=>a.onclick=e=>{e.preventDefault();api("DELETE",`/obras/${id}/membros/${a.dataset.x}`).then(()=>equipe(id)).catch(x=>alert(x.message))});
$("#eb"+id).onclick=()=>api("PUT",`/obras/${id}/membros`,{usuario_id:+$("#eu"+id).value,papel:$("#ep"+id).value}).then(()=>equipe(id)).catch(x=>alert(x.message))}
async function docs(id){const box=$("#d"+id),d=await api("GET",`/obras/${id}/documentos`);
box.innerHTML=d.docs.map(x=>`<div>${esc(x.nome)} <span class="st">${esc(x.status)}</span> <a href="/api/documentos/${x.id}/arquivo" rel="noopener" style="color:var(--gold)">baixar</a>${d.papel==="lider"&&x.status==="pendente"?` <button class="btn s" data-v="${x.id}:validado">Validar</button> <button class="btn s o" data-v="${x.id}:rejeitado">Rejeitar</button>`:""}</div>`).join("")+(d.papel!=="leitura"?`<input type="file" id="f${id}"><button class="btn s" id="u${id}">Enviar documento</button>`:"");
box.querySelectorAll("[data-v]").forEach(b=>b.onclick=()=>{const[i,s]=b.dataset.v.split(":");api("PATCH",`/documentos/${i}/validacao`,{status:s}).then(()=>docs(id)).catch(e=>alert(e.message))});
const u=$("#u"+id);if(u)u.onclick=()=>{const f=$("#f"+id).files[0];if(!f)return;const fd=new FormData();fd.append("arquivo",f);api("POST",`/obras/${id}/documentos`,fd,true).then(()=>docs(id)).catch(e=>alert(e.message))}}
async function renderEq(){const el=$("#eq");if(!isStaff())return authUI(el,false,false,me?"Esta área é exclusiva da equipe ENAARQ.":"Acesso restrito à equipe ENAARQ.");
el.innerHTML="<p>Carregando…</p>";const ok=me.atende||isAdm();const[sol,ob]=await Promise.all([ok?api("GET","/solicitacoes").catch(()=>[]):[],api("GET","/obras").catch(()=>[])]);
let us=[],ao=[];if(isAdm())[us,ao]=await Promise.all([api("GET","/admin/usuarios"),api("GET","/admin/obras")]);
let h=`<p>${esc(me.nome)} ${esc(me.cargo?"· "+me.cargo:"")} <button class="btn s o" id="lo">Sair</button></p>`;
if(ok)h+=`<h3>Solicitações de clientes</h3>`+(sol.length?sol.map(r=>`<div class="card" style="margin-bottom:10px"><span class="st">${esc(r.status)}</span> <b>${esc(r.servico)}</b> · ${esc(r.nome)} · ${esc(r.local)}<p>${esc(r.descricao)}</p><input id="a${r.id}" value="${esc(r.resposta)}" placeholder="Devolutiva ao cliente"><button class="btn s" data-s="${r.id}:Em análise">Em análise</button> <button class="btn s" data-s="${r.id}:Respondido">Responder</button></div>`).join(""):"<p>Nenhuma solicitação.</p>");
h+=`<h3 style="margin-top:28px">Obras e documentos</h3>`+(ob.length?ob.map(o=>`<div class="card" style="margin-bottom:10px"><b>${esc(o.nome)}</b> · ${esc(o.local)} <button class="btn s o" data-d="${o.id}">Documentos</button>${o.papel==="lider"?` <button class="btn s o" data-e="${o.id}">Equipe</button>`:""}<div id="d${o.id}"></div><div id="e${o.id}"></div></div>`).join(""):"<p>Você ainda não foi vinculado a nenhuma obra.</p>");
if(isAdm()){const R=[["colaborador","Colaborador"],["ti","TI"],["adm","ADM"],["cliente","Cliente"]];
h+=`<h3 style="margin-top:28px">Administração</h3><div class="tw"><table><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Cargo</th><th>Atende</th><th>Ativo</th></tr>${us.map(u=>`<tr><td>${esc(u.nome)}</td><td>${esc(u.email)}</td><td><select data-r="${u.id}">${op(R).replace(`value="${u.role}"`,`value="${u.role}" selected`)}</select></td><td>${esc(u.cargo)}</td><td><input type="checkbox" data-a="${u.id}" ${u.atende?"checked":""}></td><td><input type="checkbox" data-t="${u.id}" ${u.ativo?"checked":""}></td></tr>`).join("")}</table></div>
<div class="card" style="margin:12px 0"><b>Novo usuário</b><br><label>Nome</label><input id="nn"><label>E-mail</label><input id="ne" type="email"><label>Senha provisória (mín. 10)</label><input id="np" type="password"><label>Perfil</label><select id="nr">${op(R)}</select><label>Cargo/profissão</label><input id="nc"><button class="btn s" id="nb">Criar</button></div>
<div class="card" style="margin:12px 0"><b>Nova obra/serviço</b><br><label>Nome</label><input id="on"><label>Local</label><input id="ol"><button class="btn s" id="ob">Criar</button></div>
<div class="card" style="margin:12px 0"><b>Equipe da obra</b>${ao.map(o=>`<p>${esc(o.nome)}: ${o.membros.map(m=>`${esc(m.nome)} (${esc(m.papel)}) <a href="#equipe" data-x="${o.id}:${m.id}" style="color:var(--gold)">✕</a>`).join(", ")||"—"}</p>`).join("")}
<label>Obra</label><select id="mo">${op(ao.map(o=>[o.id,o.nome]))}</select><label>Colaborador</label><select id="mu">${op(us.filter(u=>u.role==="colaborador").map(u=>[u.id,u.nome]))}</select><label>Papel na obra</label><select id="mp">${op([["lider","Líder (controla e valida)"],["membro","Membro (envia documentos)"],["leitura","Somente leitura"]])}</select><button class="btn s" id="mb">Vincular</button></div>`}
el.innerHTML=h;const go=p=>p.then(renderEq).catch(e=>alert(e.message));$("#lo").onclick=sair;
el.querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>{const[i,s]=b.dataset.s.split(":");go(api("PATCH","/solicitacoes/"+i,{status:s,resposta:$("#a"+i).value}))});
el.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>docs(b.dataset.d));el.querySelectorAll("[data-e]").forEach(b=>b.onclick=()=>equipe(b.dataset.e));
if(!isAdm())return;
el.querySelectorAll("[data-r]").forEach(s=>s.onchange=()=>go(api("PATCH","/admin/usuarios/"+s.dataset.r,{role:s.value})));
el.querySelectorAll("[data-a]").forEach(c=>c.onchange=()=>go(api("PATCH","/admin/usuarios/"+c.dataset.a,{atende:c.checked})));
el.querySelectorAll("[data-t]").forEach(c=>c.onchange=()=>go(api("PATCH","/admin/usuarios/"+c.dataset.t,{ativo:c.checked})));
el.querySelectorAll("[data-x]").forEach(a=>a.onclick=e=>{e.preventDefault();const[o,u]=a.dataset.x.split(":");go(api("DELETE",`/obras/${o}/membros/${u}`))});
$("#nb").onclick=()=>go(api("POST","/admin/usuarios",{nome:$("#nn").value,email:$("#ne").value,senha:$("#np").value,role:$("#nr").value,cargo:$("#nc").value}));
$("#ob").onclick=()=>go(api("POST","/admin/obras",{nome:$("#on").value,local:$("#ol").value}));
$("#mb").onclick=()=>go(api("PUT",`/admin/obras/${$("#mo").value}/membros`,{usuario_id:+$("#mu").value,papel:$("#mp").value}))}
api("GET","/auth/me").then(r=>{me=r.user}).catch(()=>{}).finally(()=>{route();initFX()});
