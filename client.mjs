const base = 'http://localhost:3000';

//Criar
// await fetch(base + '/clientes', {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   body: JSON.stringify({
//     nome: 'Guilherme teste',
//     email: 'guiiIII@email.com',
//     data_cadastro: '15/01/2026',
//   }),
// });
// const cliente = await fetch(base + '/clientes?nome=Guilherme').then((r) =>
//   r.json(),
// );

//DELETE
// await fetch(`${base}/clientes?id=1`, {
//   method: 'DELETE',
// });

//UPDATE
// await fetch(`${base}/clientes?id=2`, {
//   method: 'PUT',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({ nome: 'Novo Nome', email: 'novo@email.com' }),
// });

// await fetch(base + '/documentos', {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   body: JSON.stringify({
//     cliente_id: 1,
//     titulo: 'CNH',
//     conteudo: 'texto',
//     data_processamento: '14/01/2026',
//     tipo: 'fiscal',
//   }),
// });

//POST COM ARQUIVO PDF
// import fs from 'fs';

// const buffer = fs.readFileSync('./pdf_exemplo2.pdf');
// const blob = new Blob([buffer], { type: 'application/pdf' });

// const formData = new FormData();
// formData.append('arquivo', blob, 'pdf_exemplo2.pdf');
// formData.append('client_id', '3');

// const response = await fetch(`${base}/documentos/upload`, {
//   method: 'POST',
//   body: formData,
// });

//POST COM ARQUIVO URL
// await fetch(`${base}/documentos/url`, {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({
//     url: 'https://www.wikipedia.org/',
//     cliente_id: 1,
//   }),
// });

// Listar clientes com contagem
// const clientes = await fetch(`${base}/clientes/documentos`);
// console.log(await clientes.json());

// Listar documentos do cliente 1
// const documentos = await fetch(`${base}/documentos?cliente_id=1`);
// console.log(await documentos.json());

//Buscar documentos por usuário
const response = await fetch(`${base}/documentos/buscar?cliente_id=2`);
console.log(await response.json());
