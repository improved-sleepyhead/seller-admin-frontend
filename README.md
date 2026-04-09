# Seller Admin Frontend

SPA для управления объявлениями продавца: список с фильтрами и сортировкой, просмотр карточки, редактирование с локальными draft/chat flows и AI-подсказки через backend-owned contract.

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

Для AI-функций backend использует OpenRouter. API key для backend нужно взять на
`https://openrouter.ai/` и передать backend по его инструкции запуска.

Для локальной интеграции в этом проекте каноничный API base URL:

- `http://localhost`

Если backend запущен напрямую на другом порту например `:8080`, укажи этот URL в runtime config frontend.

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

Frontend читает API base URL из `public/config.js`. Для текущего локального backend-сценария используй:

```js
window.APP_CONFIG = {
  API_BASE_URL: "http://localhost"
};
```

То есть для дефолтного локального запуска обычно достаточно:

1. Поднять backend по его гайду.
2. Убедиться, что backend доступен на `http://localhost`.
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

- Runtime config живёт в `window.APP_CONFIG`: в dev он задаётся через `public/config.js`, а в Docker контейнере генерируется на старте из `API_BASE_URL`.
- Query cache в приложении intentional `memory-only`: после full refresh данные запрашиваются заново.
- AI description, price и chat flows идут только через backend endpoints. Frontend не хранит OpenRouter key и не работает с provider-specific payload напрямую.
