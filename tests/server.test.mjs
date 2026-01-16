import { describe, it } from 'node:test';
import assert from 'node:assert';

const base = 'http://localhost:3000';

describe('API Clientes', () => {
  let clienteId;

  it('POST /clientes - deve criar um cliente', async () => {
    const response = await fetch(`${base}/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'Teste Integração',
        email: `integracao${Date.now()}@email.com`,
        data_cadastro: new Date().toISOString(),
      }),
    });

    assert.strictEqual(response.status, 201);
  });

  it('GET /clientes - deve listar clientes', async () => {
    const response = await fetch(`${base}/clientes`);
    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.ok(Array.isArray(data));
  });

  it('GET /clientes/documentos - deve listar clientes com contagem de documentos', async () => {
    const response = await fetch(`${base}/clientes/documentos`);
    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.ok(Array.isArray(data));
    if (data.length > 0) {
      assert.ok('total_documentos' in data[0]);
    }
  });

  it('PUT /clientes - deve atualizar cliente', async () => {
    const clientes = await fetch(`${base}/clientes`).then((r) => r.json());
    clienteId = clientes[0].id;

    const response = await fetch(`${base}/clientes?id=${clienteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'Atualizado Integração',
        email: `atualizado${Date.now()}@email.com`,
      }),
    });

    assert.strictEqual(response.status, 200);
    const data = await response.json();
    assert.strictEqual(data.message, 'Cliente atualizado com sucesso');
  });

  it('PUT /clientes - deve retornar 404 para cliente inexistente', async () => {
    const response = await fetch(`${base}/clientes?id=999999`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'Inexistente',
        email: 'inexistente@email.com',
      }),
    });

    assert.strictEqual(response.status, 404);
  });

  it('DELETE /clientes - deve deletar cliente', async () => {
    // Cria um cliente para deletar
    await fetch(`${base}/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'Para Deletar',
        email: `deletar${Date.now()}@email.com`,
        data_cadastro: new Date().toISOString(),
      }),
    });

    const clientes = await fetch(`${base}/clientes`).then((r) => r.json());
    const id = clientes[clientes.length - 1].id;

    const response = await fetch(`${base}/clientes?id=${id}`, {
      method: 'DELETE',
    });

    assert.strictEqual(response.status, 200);
    const data = await response.json();
    assert.strictEqual(data.message, 'Cliente deletado com sucesso');
  });
});

describe('API Documentos - URL', () => {
  let clienteId;

  it('POST /documentos/url - deve processar URL', async () => {
    const clientes = await fetch(`${base}/clientes`).then((r) => r.json());
    clienteId = clientes[0].id;

    const response = await fetch(`${base}/documentos/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://example.com',
        cliente_id: clienteId,
      }),
    });

    assert.strictEqual(response.status, 201);
    const data = await response.json();
    assert.strictEqual(data.message, 'URL processada com sucesso');
    assert.ok(data.id);
  });

  it('POST /documentos/url - deve retornar erro sem URL', async () => {
    const response = await fetch(`${base}/documentos/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cliente_id: 1,
      }),
    });

    assert.strictEqual(response.status, 400);
    const data = await response.json();
    assert.strictEqual(data.error, 'URL não fornecida');
  });

  it('POST /documentos/url - deve retornar erro sem cliente_id', async () => {
    const response = await fetch(`${base}/documentos/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://example.com',
      }),
    });

    assert.strictEqual(response.status, 400);
    const data = await response.json();
    assert.strictEqual(data.error, 'cliente_id não informado');
  });
});

describe('API Documentos - Consultas', () => {
  it('GET /documentos - deve listar documentos de um cliente', async () => {
    const clientes = await fetch(`${base}/clientes`).then((r) => r.json());
    const clienteId = clientes[0].id;

    const response = await fetch(`${base}/documentos?cliente_id=${clienteId}`);

    assert.strictEqual(response.status, 200);
    const data = await response.json();
    assert.ok(Array.isArray(data));
  });

  it('GET /documentos - deve retornar erro sem cliente_id', async () => {
    const response = await fetch(`${base}/documentos`);

    assert.strictEqual(response.status, 400);
    const data = await response.json();
    assert.strictEqual(data.error, 'cliente_id não informado');
  });

  it('GET /documentos/buscar - deve buscar documentos por cliente', async () => {
    const clientes = await fetch(`${base}/clientes`).then((r) => r.json());
    const clienteId = clientes[0].id;

    const response = await fetch(
      `${base}/documentos/buscar?cliente_id=${clienteId}`,
    );
    const data = await response.json();

    if (response.status === 200) {
      assert.ok(Array.isArray(data));
      if (data.length > 0) {
        assert.ok('titulo' in data[0]);
        assert.ok('data_processamento' in data[0]);
        assert.ok('tipo' in data[0]);
      }
    } else {
      assert.strictEqual(response.status, 404);
    }
  });

  it('GET /documentos/buscar - deve retornar erro sem cliente_id', async () => {
    const response = await fetch(`${base}/documentos/buscar`);

    assert.strictEqual(response.status, 400);
    const data = await response.json();
    assert.strictEqual(data.error, 'cliente_id não informado');
  });
});
