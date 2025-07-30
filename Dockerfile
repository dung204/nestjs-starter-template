FROM oven/bun:1.2.19 AS base
COPY package.json bun.lock /usr/src/app/
COPY .husky /usr/src/app/.husky
WORKDIR /usr/src/app

FROM base AS deps
RUN bun install --frozen-lockfile

FROM base AS build
COPY --from=deps /usr/src/app/node_modules /usr/src/app/node_modules
COPY . /usr/src/app/
RUN bun run build

FROM base AS release
ENV NODE_ENV=production
COPY --from=build /usr/src/app/dist /usr/src/app/dist
COPY .env /usr/src/app/.env

CMD [ "bun", "start:prod" ]
