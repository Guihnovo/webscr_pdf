import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('./db.sqlite');

db.exec(/*sql*/ `
    PRAGMA foreign_keys = 1;
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;

    PRAGMA cache_size = 2000;
    PRAGMA busy_timeout = 5000;
    PRAGMA temp_store = MEMORY;

    CREATE TABLE IF NOT EXISTS "clientes" (
      "id" INTEGER PRIMARY KEY,
      "nome" TEXT NOT NULL COLLATE NOCASE,
      "email" TEXT NOT NULL UNIQUE,
      "data_cadastro" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) STRICT;

    CREATE TABLE IF NOT EXISTS "documentos" (
      "id" INTEGER PRIMARY KEY,
      "cliente_id" INTEGER NOT NULL,
      "titulo" TEXT NOT NULL,
      "conteudo" TEXT,
      "data_processamento" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "tipo" TEXT NOT NULL,
      "url_origem" TEXT,
      FOREIGN KEY("cliente_id") REFERENCES "clientes" ("id") ON DELETE CASCADE
    ) STRICT;
     `);

export function criarCliente({ nome, email, data_cadastro }) {
  try {
    return db
      .prepare(
        `INSERT OR IGNORE INTO "clientes" ("nome", "email", "data_cadastro") VALUES (?,?,?)`,
      )
      .run(nome, email, data_cadastro);
  } catch (error) {
    return null;
  }
}

export function consultarClientes() {
  try {
    return db.prepare(`SELECT * FROM "clientes"`).all();
  } catch (error) {
    return null;
  }
}

export function consultarCliente(nome) {
  try {
    return db.prepare(`SELECT * FROM "clientes" WHERE "nome" = ?`).get(nome);
  } catch (error) {
    return null;
  }
}

export function deletarCliente(id) {
  try {
    return db.prepare(`DELETE FROM "clientes" WHERE "id" = ?`).run(id);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export function atualizarCliente({ id, nome, email }) {
  try {
    return db
      .prepare(`UPDATE "clientes" SET "nome" = ?, "email" = ? WHERE "id" = ?`)
      .run(nome, email, id);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export function criarDocumento({
  cliente_id,
  titulo,
  conteudo,
  tipo,
  url_origem,
}) {
  try {
    const data_processamento = new Date().toISOString();
    return db
      .prepare(
        `INSERT INTO "documentos" ("cliente_id", "titulo", "conteudo", "data_processamento", "tipo", "url_origem") VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(cliente_id, titulo, conteudo, data_processamento, tipo, url_origem);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export function listarClientesComDocumentos() {
  try {
    return db
      .prepare(
        `
      SELECT 
        c.id,
        c.nome,
        c.email,
        c.data_cadastro,
        COUNT(d.id) AS total_documentos
      FROM "clientes" c
      LEFT JOIN "documentos" d ON c.id = d.cliente_id
      GROUP BY c.id
    `,
      )
      .all();
  } catch (error) {
    console.log(error);
    return null;
  }
}

export function listarDocumentosCliente(cliente_id) {
  try {
    return db
      .prepare(
        `
      SELECT * FROM "documentos" WHERE "cliente_id" = ?
    `,
      )
      .all(cliente_id);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export function buscarDocumentosPorCliente(cliente_id) {
  try {
    return db
      .prepare(
        `
      SELECT "titulo", "data_processamento", "tipo" 
      FROM "documentos" 
      WHERE "cliente_id" = ?
    `,
      )
      .all(cliente_id);
  } catch (error) {
    console.log(error);
    return null;
  }
}
