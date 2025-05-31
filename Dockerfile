# Используем официальный Node.js образ (LTS версия)
FROM node:22-alpine

# Задаём рабочую директорию внутри контейнера
WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь код приложения
COPY . .

# Собираем приложение для production
RUN npm run build

# Открываем порт, на котором работает Nuxt
EXPOSE 3000

# Запускаем приложение в production-режиме
CMD ["npm", "run", "start"]