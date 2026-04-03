# Seller Admin Frontend

SPA для управления объявлениями продавца.

Стек:

- React 19
- TypeScript
- Vite
- TanStack Query
- React Hook Form
- Zod
- Zustand
- Tailwind CSS + shadcn/ui

Frontend работает с backend contract для:

- списка объявлений с фильтрацией, сортировкой и пагинацией;
- просмотра и редактирования карточки объявления;
- AI-подсказок для описания и цены;
- локальных draft/chat persistence flows.

## Backend

Backend-репозиторий находится здесь:

- `https://github.com/improved-sleepyhead/seller-admin-backend`

В backend-репозитории есть отдельный гайд по запуску.

Для локальной интеграции в этом проекте дефолтный API base URL:

- `http://localhost:8080`

## Быстрый старт

Требования:

- Node.js 20+
- npm 11+

Установка зависимостей:

```bash
npm install
```

Запуск dev-сервера:

```bash
npm run dev
```

По умолчанию приложение будет доступно на:

- `http://localhost:5173`

Frontend по умолчанию читает API base URL из `public/config.js`. В репозитории уже задан дефолт:

```js
window.APP_CONFIG = {
  API_BASE_URL: "http://localhost:8080"
};
```

То есть для дефолтного локального запуска обычно достаточно:

1. Поднять backend по его гайду.
2. Убедиться, что backend доступен на `http://localhost:8080`.
3. Выполнить `npm install`.
4. Выполнить `npm run dev`.
5. Открыть `http://localhost:5173`.

## Полезные команды

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run typecheck
npm run test
npm run format:check
```

## Production build

Локальная production-сборка:

```bash
npm run build
```

Результат попадает в `dist/`.

## Запуск в Docker с runtime config

В проекте есть multistage `Dockerfile`:

- build stage собирает frontend через `npm ci` + `npm run build`;
- runtime stage использует `nginx`;
- `API_BASE_URL` подставляется в `config.js` на старте контейнера через `docker/entrypoint.sh`.

### Сборка образа

```bash
docker build -t seller-admin-frontend .
```

### Запуск контейнера

Если backend доступен на хосте на `http://localhost:8080`, можно запустить так:

```bash
docker run --rm -p 80:80 \
  -e API_BASE_URL=http://host.docker.internal:8080 \
  seller-admin-frontend
```

Если frontend и backend находятся в одной docker network, передавай внутренний URL backend-сервиса:

```bash
docker run --rm -p 80:80 \
  -e API_BASE_URL=http://backend:8080 \
  seller-admin-frontend
```

После запуска приложение будет доступно на:

- `http://localhost`

Health endpoint контейнера:

- `GET /health`

### Как работает runtime config

В runtime-контейнере создаётся файл:

- `/usr/share/nginx/html/config.js`

из шаблона:

- `public/config.js.template`

Переменная, которую нужно передавать в контейнер:

- `API_BASE_URL`

Это позволяет не пересобирать образ при смене backend URL, если меняется только адрес API.

## Структура проекта

Проект организован в FSD-стиле:

- `src/app` — app-level config, providers, router
- `src/pages` — route entrypoints и page orchestration
- `src/widgets` — крупные композиционные блоки экрана
- `src/features` — пользовательские сценарии
- `src/entities` — доменные сущности, API contracts, derived logic
- `src/shared` — primitives и infra

## Примечания

- Query cache в приложении intentional `memory-only`: после full refresh данные запрашиваются заново.
- Для AI и save flows frontend опирается на backend-owned contract и не работает с provider-specific payload напрямую.
- Для редактирования объявлений используются локальные draft/chat persistence flows поверх app runtime.
