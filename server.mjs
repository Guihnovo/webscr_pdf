import { createServer } from 'node:http';
import { Router } from './router.mjs';
import { customRequest } from './custom-request.mjs';
import { customResponse } from './custom-response.mjs';
import {
  atualizarCliente,
  consultarCliente,
  consultarClientes,
  criarCliente,
  deletarCliente,
  criarDocumento,
  listarDocumentosCliente,
  listarClientesComDocumentos,
  buscarDocumentosPorCliente,
} from './database.mjs';
import formidable from 'formidable';
import fs from 'fs';
import { extrairTextoPdf } from './utils/extrairTextoPdf.mjs';
import * as cheerio from 'cheerio';

const router = new Router();

router.post('/clientes', (req, res) => {
  const { nome, email, data_cadastro } = req.body;
  const criado = criarCliente({ nome, email, data_cadastro });
  if (criado) {
    res.status(201).json('Cliente cadastrado.');
  } else {
    res.status(400).json('Erro ao cadastrar cliente');
  }
});

router.get('/clientes', (req, res) => {
  const nome = req.query.get('nome');

  if (nome) {
    const cliente = consultarCliente(nome);
    if (cliente) {
      res.status(200).json(cliente);
    } else {
      res.status(404).json('Cliente não encontrado.');
    }
    return;
  }

  const clientes = consultarClientes();
  if (clientes && clientes.length) {
    res.status(200).json(clientes);
  } else {
    res.status(404).json('Clientes não encontrados.');
  }
});

router.put('/clientes', (req, res) => {
  const id = req.query.get('id');
  const resultado = atualizarCliente({ id, ...req.body });
  if (resultado?.changes > 0) {
    res.status(200).json({ message: 'Cliente atualizado com sucesso' });
  } else {
    res.status(404).json({ error: 'Cliente não encontrado' });
  }
});

router.delete('/clientes', (req, res) => {
  const id = req.query.get('id');
  const resultado = deletarCliente(id);
  // console.table(resultado);

  if (resultado) {
    res.status(200).json({ message: 'Cliente deletado com sucesso' });
  } else {
    res.status(404).json({ error: 'Cliente não encontrado' });
  }
});

router.post('/documentos/upload', async (req, res) => {
  const uploadDir = './uploads';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    filter: ({ mimetype }) => mimetype === 'application/pdf',
  });

  try {
    const [fields, files] = await form.parse(req.raw);
    const arquivo = files.arquivo?.[0];
    const clientId = fields.client_id?.[0];

    if (!arquivo) {
      return res.status(400).json({ error: 'PDF não enviado' });
    }

    if (!clientId) {
      return res.status(400).json({ error: 'client_id não informado' });
    }

    const texto = await extrairTextoPdf(arquivo.filepath);
    const resultado = criarDocumento({
      cliente_id: clientId,
      titulo: arquivo.originalFilename,
      conteudo: texto,
      tipo: 'pdf',
      url_origem: null,
    });

    res.status(201).json({
      message: 'PDF processado com sucesso',
      id: resultado.lastInsertRowid,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Erro ao processar PDF' });
  }
});

router.post('/documentos/url', async (req, res) => {
  const { url, cliente_id } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL não fornecida' });
  }

  if (!cliente_id) {
    return res.status(400).json({ error: 'cliente_id não informado' });
  }

  try {
    // Busca o conteúdo da página
    const response = await fetch(url);
    const html = await response.text();

    // Extrai dados com Cheerio
    const $ = cheerio.load(html);
    const titulo = $('title').text() || $('h1').first().text() || url;
    const conteudo = $('body').text().replace(/\s+/g, ' ').trim();

    const resultado = criarDocumento({
      cliente_id,
      titulo,
      conteudo,
      tipo: 'url',
      url_origem: url,
    });

    res.status(201).json({
      message: 'URL processada com sucesso',
      id: resultado.lastInsertRowid,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Erro ao processar URL' });
  }
});

// Listar clientes com contagem de documentos
router.get('/clientes/documentos', (req, res) => {
  const clientes = listarClientesComDocumentos();

  if (clientes) {
    res.status(200).json(clientes);
  } else {
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

// Listar documentos de um cliente específico
router.get('/documentos', (req, res) => {
  const cliente_id = req.query.get('cliente_id');

  if (!cliente_id) {
    return res.status(400).json({ error: 'cliente_id não informado' });
  }

  const documentos = listarDocumentosCliente(cliente_id);

  if (documentos) {
    res.status(200).json(documentos);
  } else {
    res.status(500).json({ error: 'Erro ao buscar documentos' });
  }
});

//Buscar documentos por usuário
router.get('/documentos/buscar', (req, res) => {
  const cliente_id = req.query.get('cliente_id');

  if (!cliente_id) {
    return res.status(400).json({ error: 'cliente_id não informado' });
  }

  const documentos = buscarDocumentosPorCliente(cliente_id);

  if (documentos && documentos.length > 0) {
    res.status(200).json(documentos);
  } else {
    res.status(404).json({ error: 'Nenhum documento encontrado' });
  }
});

const server = createServer(async (request, response) => {
  const req = await customRequest(request);
  req.raw = request;
  const res = customResponse(response);

  const handler = router.find(req.method, req.pathname);
  if (handler) {
    handler(req, res);
  } else {
    res.status(404).end('Não encontrada.');
  }
});

server.listen(3000, () => {
  console.log('Server: http://localhost:3000');
});
