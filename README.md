# API de Clientes e Documentos

API REST para gerenciamento de clientes e processamento de documentos (PDF e páginas web).

## Tecnologias

- Node.js 24+
- SQLite (node:sqlite)
- Formidable (upload de arquivos)
- pdfjs-dist (extração de texto de PDFs)
- Cheerio (extração de conteúdo de páginas web)

## Instalação

```bash
# Clone o repositório
git clone 
cd 

# Instale as dependências
npm install
```

## Execução

```bash
# Iniciar o servidor
node server.mjs

# O servidor estará disponível em http://localhost:3000
```

## Endpoints

### Clientes

#### Criar cliente
```bash
curl -X POST http://localhost:3000/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@email.com",
    "data_cadastro": "2025-01-15T10:00:00.000Z"
  }'
```

#### Listar todos os clientes
```bash
curl http://localhost:3000/clientes
```

#### Buscar cliente por nome
```bash
curl "http://localhost:3000/clientes?nome=João"
```

#### Listar clientes com contagem de documentos
```bash
curl http://localhost:3000/clientes/documentos
```

Retorno:
```json
[
  {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@email.com",
    "data_cadastro": "2025-01-15T10:00:00.000Z",
    "total_documentos": 3
  }
]
```

#### Atualizar cliente
```bash
curl -X PUT "http://localhost:3000/clientes?id=1" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Santos",
    "email": "joao.santos@email.com"
  }'
```

#### Deletar cliente
```bash
curl -X DELETE "http://localhost:3000/clientes?id=1"
```

### Documentos

#### Upload de PDF
```bash
curl -X POST http://localhost:3000/documentos/upload \
  -F "arquivo=@documento.pdf" \
  -F "client_id=1"
```

#### Processar URL
```bash
curl -X POST http://localhost:3000/documentos/url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "cliente_id": 1
  }'
```

#### Listar documentos de um cliente
```bash
curl "http://localhost:3000/documentos?cliente_id=1"
```

#### Buscar documentos por cliente (campos resumidos)
```bash
curl "http://localhost:3000/documentos/buscar?cliente_id=1"
```

Retorno:
```json
[
  {
    "titulo": "documento.pdf",
    "data_processamento": "2025-01-15T10:30:00.000Z",
    "tipo": "pdf"
  },
  {
    "titulo": "Example",
    "data_processamento": "2025-01-15T11:00:00.000Z",
    "tipo": "url"
  }
]
```

## Testes

```bash
# Testes unitários (não precisa do servidor)
node --test tests/database.test.mjs

# Testes de integração (servidor precisa estar rodando)
node server.mjs &
node --test tests/server.test.mjs

# Rodar todos os testes
node --test tests/
```

## Docker

```bash
# Construir a imagem
docker build -t api-clientes .

# Rodar o container
docker run -p 3000:3000 api-clientes

# Com persistência de dados
docker run -p 3000:3000 \
  -v $(pwd)/db.sqlite:/app/db.sqlite \
  -v $(pwd)/uploads:/app/uploads \
  api-clientes
```

## Estrutura do Projeto

```
.
├── server.mjs              # Servidor HTTP e rotas
├── database.mjs            # Funções de acesso ao banco
├── router.mjs              # Classe Router
├── custom-request.mjs      # Parser de requisições
├── custom-response.mjs     # Helper de respostas
├── utils/
│   └── extrairTextoPdf.mjs # Extração de texto de PDF
├── tests/
│   ├── database.test.mjs   # Testes unitários
│   └── server.test.mjs     # Testes de integração
├── uploads/                # PDFs enviados
├── Dockerfile
├── .dockerignore
└── README.md
```

## Estrutura do Banco de Dados

### Tabela: clientes
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | Chave primária |
| nome | TEXT | Nome do cliente |
| email | TEXT | Email (único) |
| data_cadastro | TEXT | Data de cadastro |

### Tabela: documentos
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | Chave primária |
| cliente_id | INTEGER | FK para clientes |
| titulo | TEXT | Título do documento |
| conteudo | TEXT | Conteúdo extraído |
| data_processamento | TEXT | Data de processamento |
| tipo | TEXT | "pdf" ou "url" |
| url_origem | TEXT | URL original (se tipo = url) |


