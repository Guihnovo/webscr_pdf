import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import {
  criarCliente,
  consultarClientes,
  consultarCliente,
  atualizarCliente,
  deletarCliente,
  criarDocumento,
  buscarDocumentosPorCliente,
} from '../database.mjs';

describe('Clientes', () => {
  let clienteId;

  it('deve criar um cliente', () => {
    const resultado = criarCliente({
      nome: 'Teste',
      email: `teste${Date.now()}@email.com`,
      data_cadastro: new Date().toISOString(),
    });

    assert.ok(resultado);
    assert.ok(resultado.lastInsertRowid);
    clienteId = resultado.lastInsertRowid;
  });

  it('deve listar clientes', () => {
    const clientes = consultarClientes();

    assert.ok(Array.isArray(clientes));
    assert.ok(clientes.length > 0);
  });

  it('deve consultar cliente por nome', () => {
    const cliente = consultarCliente('Teste');

    assert.ok(cliente);
    assert.strictEqual(cliente.nome, 'Teste');
  });

  it('deve atualizar um cliente', () => {
    const resultado = atualizarCliente({
      id: clienteId,
      nome: 'Teste Atualizado',
      email: `atualizado${Date.now()}@email.com`,
    });

    assert.ok(resultado);
    assert.strictEqual(resultado.changes, 1);
  });

  it('deve deletar um cliente', () => {
    const resultado = deletarCliente(clienteId);

    assert.ok(resultado);
    assert.strictEqual(resultado.changes, 1);
  });
});

describe('Documentos', () => {
  let clienteId;

  before(() => {
    const cliente = criarCliente({
      nome: 'Cliente Docs',
      email: `docs${Date.now()}@email.com`,
      data_cadastro: new Date().toISOString(),
    });
    clienteId = cliente.lastInsertRowid;
  });

  after(() => {
    deletarCliente(clienteId);
  });

  it('deve criar um documento', () => {
    const resultado = criarDocumento({
      cliente_id: clienteId,
      titulo: 'Documento Teste',
      conteudo: 'Conteúdo do documento',
      tipo: 'pdf',
      url_origem: null,
    });

    assert.ok(resultado);
    assert.ok(resultado.lastInsertRowid);
  });

  it('deve buscar documentos por cliente', () => {
    const documentos = buscarDocumentosPorCliente(clienteId);

    assert.ok(Array.isArray(documentos));
    assert.ok(documentos.length > 0);
    assert.ok(documentos[0].titulo);
    assert.ok(documentos[0].tipo);
  });
});
