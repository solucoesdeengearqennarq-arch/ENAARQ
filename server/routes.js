const r=require("express").Router(),db=require("./db"),bcrypt=require("bcryptjs"),{z}=require("zod"),rate=require("express-rate-limit"),
 path=require("path"),fs=require("fs"),crypto=require("crypto"),multer=require("multer");
const {emit,auth,need,log}=require("./auth");
const UPLOADS=path.join(process.env.DATA_DIR||path.join(__dirname,"..","data"),"uploads");
const now=()=>Date.now(),ADM=["adm","ti"],STAFF=["colaborador","ti","adm"];
const v=s=>(req,res,next)=>{const p=s.safeParse(req.body);if(!p.success)return res.status(400).json({erro:"Dados inválidos"});req.body=p.data;next()};
const senha=z.string().min(10).max(100),email=z.string().email().max(150).transform(s=>s.toLowerCase());
const pub=u=>({id:u.id,nome:u.nome,email:u.email,role:u.role,cargo:u.cargo,atende:!!u.atende});
const DUMMY=bcrypt.hashSync("x",12),lim=rate({windowMs:15*60e3,limit:20,standardHeaders:true,legacyHeaders:false});
const hash=s=>bcrypt.hashSync(s,12);
// ---------- autenticação ----------
r.post("/auth/register",lim,v(z.object({nome:z.string().trim().min(2).max(100),email,senha})),(req,res)=>{
 try{const i=db.prepare("INSERT INTO usuarios(nome,email,hash,role,criado) VALUES(?,?,?,?,?)").run(req.body.nome,req.body.email,hash(req.body.senha),"cliente",now());
  const u=db.prepare("SELECT * FROM usuarios WHERE id=?").get(i.lastInsertRowid);emit(res,u);res.json({user:pub(u)})}
 catch{res.status(400).json({erro:"Não foi possível criar a conta"})}});
r.post("/auth/login",lim,v(z.object({email,senha:z.string().max(100)})),(req,res)=>{
 const u=db.prepare("SELECT * FROM usuarios WHERE email=? AND ativo=1").get(req.body.email);
 const ok=bcrypt.compareSync(req.body.senha,u?u.hash:DUMMY);
 if(!u||!ok||u.bloqueado_ate>now()){
  if(u&&!ok){const f=u.falhas+1;db.prepare("UPDATE usuarios SET falhas=?,bloqueado_ate=? WHERE id=?").run(f>=5?0:f,f>=5?now()+15*60e3:u.bloqueado_ate,u.id)}
  return res.status(401).json({erro:"E-mail ou senha incorretos (ou conta temporariamente bloqueada)"})}
 db.prepare("UPDATE usuarios SET falhas=0 WHERE id=?").run(u.id);emit(res,u);req.user=u;log(req,"login");res.json({user:pub(u)})});
r.post("/auth/logout",(req,res)=>{res.clearCookie("sid");res.json({ok:true})});
r.get("/auth/me",auth,(req,res)=>res.json({user:pub(req.user)}));
r.use(auth);
// ---------- solicitações de serviço ----------
const atende=(req,res,next)=>(ADM.includes(req.user.role)||(req.user.role==="colaborador"&&req.user.atende))?next():res.status(403).json({erro:"Sem permissão"});
r.post("/solicitacoes",need("cliente"),v(z.object({servico:z.string().trim().max(60),local:z.string().trim().max(150).default(""),descricao:z.string().trim().min(5).max(2000)})),(req,res)=>{
 db.prepare("INSERT INTO solicitacoes(usuario_id,servico,local,descricao,criado) VALUES(?,?,?,?,?)").run(req.user.id,req.body.servico,req.body.local,req.body.descricao,now());res.json({ok:true})});
r.get("/solicitacoes",(req,res,next)=>{
 if(req.user.role==="cliente")return res.json(db.prepare("SELECT id,servico,local,descricao,status,resposta FROM solicitacoes WHERE usuario_id=? ORDER BY id DESC").all(req.user.id));next()},
 atende,(req,res)=>res.json(db.prepare("SELECT s.*,u.nome FROM solicitacoes s JOIN usuarios u ON u.id=s.usuario_id ORDER BY s.id DESC").all()));
r.patch("/solicitacoes/:id",atende,v(z.object({status:z.enum(["Recebido","Em análise","Respondido"]),resposta:z.string().max(2000).default("")})),(req,res)=>{
 db.prepare("UPDATE solicitacoes SET status=?,resposta=? WHERE id=?").run(req.body.status,req.body.resposta,+req.params.id);log(req,"solicitacao.atualizar",req.params.id);res.json({ok:true})});
// ---------- obras e documentos (somente equipe) ----------
r.use(["/obras","/documentos","/admin"],need(...STAFF));
const papel=(u,o)=>ADM.includes(u.role)?"lider":db.prepare("SELECT papel FROM membros WHERE obra_id=? AND usuario_id=?").get(o,u.id)?.papel;
r.get("/obras",(req,res)=>res.json(ADM.includes(req.user.role)?
 db.prepare("SELECT id,nome,local,'lider' papel FROM obras ORDER BY id DESC").all():
 db.prepare("SELECT o.id,o.nome,o.local,m.papel FROM obras o JOIN membros m ON m.obra_id=o.id WHERE m.usuario_id=? ORDER BY o.id DESC").all(req.user.id)));
r.get("/obras/:id/documentos",(req,res)=>{const p=papel(req.user,+req.params.id);if(!p)return res.status(403).json({erro:"Sem permissão"});
 res.json({papel:p,docs:db.prepare("SELECT d.id,d.nome,d.status,d.criado,u.nome autor FROM documentos d JOIN usuarios u ON u.id=d.enviado_por WHERE d.obra_id=? ORDER BY d.id DESC").all(+req.params.id)})});
const up=multer({storage:multer.memoryStorage(),limits:{fileSize:10*1024*1024,files:1}});
const MAGIC={".pdf":"25504446",".png":"89504e47",".jpg":"ffd8ff",".docx":"504b0304",".xlsx":"504b0304"};
r.post("/obras/:id/documentos",up.single("arquivo"),(req,res)=>{const o=+req.params.id,p=papel(req.user,o);
 if(!["lider","membro"].includes(p)||!req.file)return res.status(403).json({erro:"Sem permissão"});
 const ext=path.extname(req.file.originalname).toLowerCase();
 if(!MAGIC[ext]||!req.file.buffer.subarray(0,4).toString("hex").startsWith(MAGIC[ext]))return res.status(400).json({erro:"Tipo de arquivo não permitido (PDF, PNG, JPG, DOCX, XLSX)"});
 const nome=crypto.randomBytes(24).toString("hex")+ext;fs.writeFileSync(path.join(UPLOADS,nome),req.file.buffer);
 db.prepare("INSERT INTO documentos(obra_id,nome,arquivo,enviado_por,criado) VALUES(?,?,?,?,?)").run(o,String(req.file.originalname).slice(0,120),nome,req.user.id,now());
 log(req,"documento.enviar",`obra ${o}`);res.json({ok:true})});
r.get("/documentos/:id/arquivo",(req,res)=>{const d=db.prepare("SELECT * FROM documentos WHERE id=?").get(+req.params.id);
 if(!d||!papel(req.user,d.obra_id))return res.status(403).json({erro:"Sem permissão"});log(req,"documento.baixar",d.id);
 res.download(path.join(UPLOADS,path.basename(d.arquivo)),d.nome)});
r.patch("/documentos/:id/validacao",v(z.object({status:z.enum(["validado","rejeitado"])})),(req,res)=>{
 const d=db.prepare("SELECT * FROM documentos WHERE id=?").get(+req.params.id);
 if(!d||papel(req.user,d.obra_id)!=="lider")return res.status(403).json({erro:"Somente quem lidera a obra valida documentos"});
 db.prepare("UPDATE documentos SET status=?,validado_por=? WHERE id=?").run(req.body.status,req.user.id,d.id);log(req,"documento."+req.body.status,d.id);res.json({ok:true})});
// delegação: quem lidera a obra concede acessos abaixo do próprio nível (só ADM/TI nomeia líderes)
const NV={lider:3,membro:2,leitura:1};
r.get("/obras/:id/equipe",(req,res)=>{const o=+req.params.id;if(papel(req.user,o)!=="lider")return res.status(403).json({erro:"Sem permissão"});
 res.json({membros:db.prepare("SELECT u.id,u.nome,u.cargo,m.papel FROM membros m JOIN usuarios u ON u.id=m.usuario_id WHERE m.obra_id=?").all(o),
 candidatos:db.prepare("SELECT id,nome,cargo FROM usuarios WHERE role='colaborador' AND ativo=1 AND id!=? ORDER BY nome").all(req.user.id)})});
const podeGerir=(req,o,alvoPapel,novo)=>{const p=papel(req.user,o);if(p!=="lider")return false;if(ADM.includes(req.user.role))return true;
 return NV[novo||"leitura"]<NV[p]&&(!alvoPapel||NV[alvoPapel]<NV[p])};
r.put("/obras/:id/membros",v(z.object({usuario_id:z.number().int(),papel:z.enum(["lider","membro","leitura"])})),(req,res)=>{
 const o=+req.params.id,alvo=db.prepare("SELECT papel FROM membros WHERE obra_id=? AND usuario_id=?").get(o,req.body.usuario_id);
 const u=db.prepare("SELECT role FROM usuarios WHERE id=? AND ativo=1").get(req.body.usuario_id);
 if(!u||u.role!=="colaborador")return res.status(400).json({erro:"Usuário inválido"});
 if(!podeGerir(req,o,alvo?.papel,req.body.papel))return res.status(403).json({erro:"Você só pode conceder ou alterar acessos abaixo do seu nível"});
 db.prepare("INSERT INTO membros(obra_id,usuario_id,papel) VALUES(?,?,?) ON CONFLICT(obra_id,usuario_id) DO UPDATE SET papel=excluded.papel").run(o,req.body.usuario_id,req.body.papel);
 log(req,"obra.membro",`${o}:${req.body.usuario_id}:${req.body.papel}`);res.json({ok:true})});
r.delete("/obras/:id/membros/:uid",(req,res)=>{const o=+req.params.id,alvo=db.prepare("SELECT papel FROM membros WHERE obra_id=? AND usuario_id=?").get(o,+req.params.uid);
 if(!alvo||!podeGerir(req,o,alvo.papel))return res.status(403).json({erro:"Sem permissão"});
 db.prepare("DELETE FROM membros WHERE obra_id=? AND usuario_id=?").run(o,+req.params.uid);log(req,"obra.membro.remover",`${o}:${req.params.uid}`);res.json({ok:true})});
// ---------- administração (ADM e TI) ----------
const A=need(...ADM);
r.get("/admin/usuarios",A,(req,res)=>res.json(db.prepare("SELECT id,nome,email,role,cargo,atende,ativo FROM usuarios ORDER BY role,nome").all()));
r.post("/admin/usuarios",A,v(z.object({nome:z.string().trim().min(2).max(100),email,senha,role:z.enum(["colaborador","ti","adm","cliente"]),cargo:z.string().max(60).default(""),atende:z.boolean().default(false)})),(req,res)=>{
 try{const b=req.body;db.prepare("INSERT INTO usuarios(nome,email,hash,role,cargo,atende,criado) VALUES(?,?,?,?,?,?,?)").run(b.nome,b.email,hash(b.senha),b.role,b.cargo,+b.atende,now());log(req,"usuario.criar",b.email);res.json({ok:true})}
 catch{res.status(400).json({erro:"E-mail já cadastrado"})}});
r.patch("/admin/usuarios/:id",A,v(z.object({role:z.enum(["colaborador","ti","adm","cliente"]).optional(),cargo:z.string().max(60).optional(),atende:z.boolean().optional(),ativo:z.boolean().optional(),senha:senha.optional()})),(req,res)=>{
 const id=+req.params.id;if(id===req.user.id&&(req.body.ativo===false||req.body.role))return res.status(400).json({erro:"Você não pode alterar o próprio acesso"});
 const b=req.body,f={role:b.role,cargo:b.cargo,atende:b.atende===undefined?undefined:+b.atende,ativo:b.ativo===undefined?undefined:+b.ativo,hash:b.senha?hash(b.senha):undefined};
 for(const [k,val] of Object.entries(f))if(val!==undefined)db.prepare(`UPDATE usuarios SET ${k}=? WHERE id=?`).run(val,id);  // k vem de lista fixa
 log(req,"usuario.alterar",`${id}:${Object.keys(b).join(",")}`);res.json({ok:true})});
r.get("/admin/obras",A,(req,res)=>res.json(db.prepare("SELECT id,nome,local FROM obras ORDER BY id DESC").all().map(o=>({...o,membros:db.prepare("SELECT u.id,u.nome,m.papel FROM membros m JOIN usuarios u ON u.id=m.usuario_id WHERE m.obra_id=?").all(o.id)}))));
r.post("/admin/obras",A,v(z.object({nome:z.string().trim().min(2).max(120),local:z.string().max(150).default("")})),(req,res)=>{
 db.prepare("INSERT INTO obras(nome,local,criado) VALUES(?,?,?)").run(req.body.nome,req.body.local,now());log(req,"obra.criar",req.body.nome);res.json({ok:true})});
r.put("/admin/obras/:id/membros",A,v(z.object({usuario_id:z.number().int(),papel:z.enum(["lider","membro","leitura"])})),(req,res)=>{
 try{db.prepare("INSERT INTO membros(obra_id,usuario_id,papel) VALUES(?,?,?) ON CONFLICT(obra_id,usuario_id) DO UPDATE SET papel=excluded.papel").run(+req.params.id,req.body.usuario_id,req.body.papel);
 log(req,"obra.membro",`${req.params.id}:${req.body.usuario_id}:${req.body.papel}`);res.json({ok:true})}catch{res.status(400).json({erro:"Dados inválidos"})}});
r.delete("/admin/obras/:id/membros/:uid",A,(req,res)=>{db.prepare("DELETE FROM membros WHERE obra_id=? AND usuario_id=?").run(+req.params.id,+req.params.uid);log(req,"obra.membro.remover",req.params.uid);res.json({ok:true})});
r.get("/admin/auditoria",A,(req,res)=>res.json(db.prepare("SELECT a.*,u.nome FROM auditoria a LEFT JOIN usuarios u ON u.id=a.usuario_id ORDER BY a.id DESC LIMIT 200").all()));
module.exports=r;
