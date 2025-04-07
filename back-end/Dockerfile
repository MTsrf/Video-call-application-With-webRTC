FROM node:18.20.8-alpine

WORKDIR /app


COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile


COPY . .


RUN yarn run build

EXPOSE 5000

CMD ["node", "dist/server.js"]