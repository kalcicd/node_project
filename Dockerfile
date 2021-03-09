FROM node:10-slim

WORKDIR /opt/app/

COPY package.json package-lock.json ./

RUN npm install

COPY . .

CMD npm start
