FROM node:24-alpine
WORKDIR /app
RUN chown node:node /app
# Run as the image's `node` user (uid 1000) so files written to the
# bind-mounted source (src/routeTree.gen.ts) belong to the host user.
USER node
COPY --chown=node:node package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY --chown=node:node . .
CMD [ "yarn", "dev" ]
