FROM node:20.16.0-apline AS builder

WORKDIR /.

COPY package*.json .
COPY pnpm-lock.yaml .

RUN npm i -g pnpm
RUN pnpm install

COPY . .

RUN pnpm run build
RUN pnpm prune --prod

FROM node:20.16.0-apline AS deployer

WORKDIR /.

COPY --from=builder /build build
COPY --from=builder /package.json

EXPOSE 3000

ENV NODE_ENV=PRODUCTION

CMD [ "node", "build" ]