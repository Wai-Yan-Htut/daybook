# base stage

FROM node:22-alpine AS base

WORKDIR /src/app

COPY package.json package-lock.json .

RUN npm ci

# build stage

FROM base AS build

WORKDIR /src/app

COPY . .

RUN npm run build

# final stage

FROM node:22-alpine AS final

WORKDIR /src/app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=build /src/app/.next/standalone ./
COPY --from=build /src/app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]


