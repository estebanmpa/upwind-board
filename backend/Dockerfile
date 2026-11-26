FROM node:24-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
ENV NODE_ENV=local
CMD [ "yarn", "start:dev" ]
