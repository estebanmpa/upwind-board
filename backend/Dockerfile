FROM node:24-alpine
WORKDIR /app
RUN chown node:node /app
# Run as the image's `node` user (uid 1000) so files written to the
# bind-mounted source (dist/, *.tsbuildinfo) belong to the host user.
USER node
COPY --chown=node:node package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY --chown=node:node . .
ENV NODE_ENV=local
CMD [ "yarn", "start:dev" ]
