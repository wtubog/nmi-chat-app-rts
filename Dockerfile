FROM node:10.15.0-alpine AS build
COPY package.json .
# Install all dependencies including devDepencies while building the app
RUN npm install
ADD . .
RUN npm run build

FROM node:10.15.0-alpine
WORKDIR /app
COPY --from=build package.json .
# install only dependencies to reduce the image size
RUN npm install --production
COPY --from=build dist ./dist

EXPOSE 8080
CMD ["node", "dist/index.js"];