FROM node:24.11.1

WORKDIR /teste

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]