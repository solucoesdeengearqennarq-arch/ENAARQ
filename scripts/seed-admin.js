// Cria o PRIMEIRO administrador. Se já existir um ADM, não faz nada (seguro para rodar a cada deploy).
require("dotenv").config();const bcrypt=require("bcryptjs"),db=require("../server/db");
if(db.prepare("SELECT 1 FROM usuarios WHERE role='adm' AND ativo=1").get()){console.log("Administrador já existe.");process.exit(0)}
const e=(process.env.ADMIN_EMAIL||"").toLowerCase(),p=process.env.ADMIN_PASSWORD||"";
if(!e||p.length<12){console.error("Defina ADMIN_EMAIL e ADMIN_PASSWORD (mín. 12 caracteres)");process.exit(1)}
db.prepare("INSERT INTO usuarios(nome,email,hash,role,cargo,atende,criado) VALUES('Administrador',?,?,'adm','ADM',1,?) ON CONFLICT(email) DO UPDATE SET hash=excluded.hash,role='adm',ativo=1").run(e,bcrypt.hashSync(p,12),Date.now());
console.log("Administrador criado:",e);
