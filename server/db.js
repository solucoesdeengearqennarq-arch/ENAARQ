const Database=require("better-sqlite3"),path=require("path"),fs=require("fs");
const dir=process.env.DATA_DIR||path.join(__dirname,"..","data");fs.mkdirSync(path.join(dir,"uploads"),{recursive:true});
const db=new Database(path.join(dir,"enaarq.db"));db.pragma("journal_mode=WAL");db.pragma("foreign_keys=ON");
db.exec(`
CREATE TABLE IF NOT EXISTS usuarios(id INTEGER PRIMARY KEY,nome TEXT NOT NULL,email TEXT UNIQUE NOT NULL,hash TEXT NOT NULL,
 role TEXT NOT NULL CHECK(role IN('cliente','colaborador','ti','adm')),cargo TEXT DEFAULT '',atende INTEGER DEFAULT 0,ativo INTEGER DEFAULT 1,
 falhas INTEGER DEFAULT 0,bloqueado_ate INTEGER DEFAULT 0,criado INTEGER);
CREATE TABLE IF NOT EXISTS solicitacoes(id INTEGER PRIMARY KEY,usuario_id INTEGER NOT NULL REFERENCES usuarios(id),servico TEXT,local TEXT,
 descricao TEXT,status TEXT DEFAULT 'Recebido',resposta TEXT DEFAULT '',criado INTEGER);
CREATE TABLE IF NOT EXISTS obras(id INTEGER PRIMARY KEY,nome TEXT NOT NULL,local TEXT DEFAULT '',criado INTEGER);
CREATE TABLE IF NOT EXISTS membros(obra_id INTEGER REFERENCES obras(id) ON DELETE CASCADE,usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
 papel TEXT CHECK(papel IN('lider','membro','leitura')),PRIMARY KEY(obra_id,usuario_id));
CREATE TABLE IF NOT EXISTS documentos(id INTEGER PRIMARY KEY,obra_id INTEGER REFERENCES obras(id) ON DELETE CASCADE,nome TEXT,arquivo TEXT,
 status TEXT DEFAULT 'pendente',enviado_por INTEGER REFERENCES usuarios(id),validado_por INTEGER,criado INTEGER);
CREATE TABLE IF NOT EXISTS auditoria(id INTEGER PRIMARY KEY,usuario_id INTEGER,acao TEXT,detalhe TEXT,ip TEXT,criado INTEGER);`);
module.exports=db;
