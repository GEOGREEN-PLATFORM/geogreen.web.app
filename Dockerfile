# ARG NODE_VERSION=20.18.0

# FROM node:${NODE_VERSION}-slim as base

# ARG PORT=3000

# # Устанавливаем рабочую директорию как текущую директорию
# WORKDIR /src

# # Build stage
# FROM base as build

# # Копируем package.json и package-lock.json для установки зависимостей
# COPY package.json package-lock.json ./
# RUN npm install

# # Копируем весь проект в контейнер
# COPY . ./

# # Строим проект
# RUN npm run build

# # Final stage (production)
# FROM base

# ENV PORT=$PORT
# ENV NODE_ENV=production

# # Копируем из стадии сборки
# COPY --from=build /src/.output /src/.output

# # Optional, if you need unbundled dependencies
# # COPY --from=build /src/node_modules /src/node_modules

# CMD [ "node", ".output/server/index.mjs" ]
