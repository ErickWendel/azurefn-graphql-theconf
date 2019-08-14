FROM node:10-alpine

RUN mkdir -p /src

COPY package.json src/package.json

WORKDIR /src

RUN npm install --silent

COPY . /src

CMD npm run dev 