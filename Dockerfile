FROM node:alpine

RUN mkdir -p /src/app

WORKDIR /app

COPY package-lock.json package-lock.json

COPY package.json package.json 

RUN npm install

COPY ./.env.sample ./.env.sample 

COPY ./src ./src

COPY public/ .

COPY LICENSE LICENSE

COPY README.md README.md

ENTRYPOINT [ "npm","run","dev" ]