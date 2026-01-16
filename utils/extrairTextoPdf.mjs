import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

export async function extrairTextoPdf(caminho) {
  const data = new Uint8Array(fs.readFileSync(caminho));
  const pdf = await getDocument({ data }).promise;

  let texto = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const pagina = await pdf.getPage(i);
    const conteudo = await pagina.getTextContent();
    texto += conteudo.items.map((item) => item.str).join(' ') + '\n';
  }

  return texto;
}
