require("dotenv").config();
const express=require("express"),helmet=require("helmet"),rate=require("express-rate-limit"),cp=require("cookie-parser"),path=require("path");
const {csrf}=require("./auth"),app=express();
app.disable("x-powered-by");app.set("trust proxy",1);
app.use(helmet({contentSecurityPolicy:{directives:{defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'","'unsafe-inline'"],imgSrc:["'self'","data:"],objectSrc:["'none'"],frameAncestors:["'none'"],formAction:["'self'"]}}}));
app.use(express.json({limit:"100kb"}));app.use(cp());
app.get("/health",(q,s)=>s.type("text").send("ok"));
app.use("/api",rate({windowMs:60e3,limit:120,standardHeaders:true,legacyHeaders:false}),csrf,require("./routes"));
app.use("/api",(req,res)=>res.status(404).json({erro:"Não encontrado"}));
const root=path.join(__dirname,"..");  // serve SOMENTE estes arquivos da raiz (nunca server/, data/ ou .env)
app.get(["/","/index.html"],(q,s)=>s.sendFile(path.join(root,"index.html")));
app.get(["/style.css","/site.js"],(q,s)=>s.sendFile(path.join(root,q.path.slice(1))));
app.use("/img",express.static(path.join(root,"img"),{dotfiles:"ignore",index:false}));
app.use((e,req,res,next)=>{console.error(e.message);res.status(e.code==="LIMIT_FILE_SIZE"?413:500).json({erro:"Erro ao processar a requisição"})});
app.listen(process.env.PORT||3000,()=>console.log("ENAARQ no ar"));
