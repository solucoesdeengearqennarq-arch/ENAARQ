const jwt=require("jsonwebtoken"),db=require("./db");
const S=process.env.JWT_SECRET;if(!S||S.length<32){console.error("Defina JWT_SECRET (mín. 32 caracteres) no .env");process.exit(1)}
const prod=process.env.NODE_ENV==="production";
exports.emit=(res,u)=>res.cookie("sid",jwt.sign({id:u.id},S,{expiresIn:"8h",algorithm:"HS256"}),{httpOnly:true,secure:prod,sameSite:"strict",maxAge:8*3600e3,path:"/"});
exports.auth=(req,res,next)=>{try{const{id}=jwt.verify(req.cookies.sid,S,{algorithms:["HS256"]});
 const u=db.prepare("SELECT id,nome,email,role,cargo,atende FROM usuarios WHERE id=? AND ativo=1").get(id);if(!u)throw 0;req.user=u;next()}
 catch{res.status(401).json({erro:"Não autenticado"})}};
// proteção CSRF: cookie SameSite=Strict + cabeçalho próprio + checagem de origem
exports.csrf=(req,res,next)=>{if(["GET","HEAD"].includes(req.method))return next();
 let ok=req.get("x-requested-with")==="enaarq";const o=req.get("origin");if(o){try{ok=ok&&new URL(o).host===req.get("host")}catch{ok=false}}
 ok?next():res.status(403).json({erro:"Requisição bloqueada"})};
exports.need=(...roles)=>(req,res,next)=>roles.includes(req.user.role)?next():res.status(403).json({erro:"Sem permissão"});
exports.log=(req,acao,detalhe="")=>db.prepare("INSERT INTO auditoria(usuario_id,acao,detalhe,ip,criado) VALUES(?,?,?,?,?)").run(req.user?.id??null,acao,String(detalhe).slice(0,300),req.ip,Date.now());
