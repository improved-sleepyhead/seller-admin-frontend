# Architecture Policy

Эта заметка фиксирует текущую рабочую policy проекта после рефактор-аудита. Это не PRD и не task list, а короткий набор правил, по которым дальше принимаются локальные архитектурные решения.

## 1. Базовая модель

- Проект использует pragmatic FSD для SPA.
- Направление зависимостей строгое: `app -> pages -> widgets -> features -> entities -> shared`.
- `pages` и `widgets` собирают экран, но не должны становиться местом для тяжёлой бизнес-логики.
- `features` владеют user flows, orchestration и локальными side effects.
- `entities` владеют domain types, entity-specific API, derived logic и presentation fragments сущности.
- `shared` хранит только infra и reusable primitives без feature-specific business context.

## 2. Public API Policy

В проекте используются два допустимых режима public API.

### Segment public API

Для `pages`, `widgets`, `features`, `entities` и части `app` каноничный вход идёт через `index.ts` сегмента или слайса.

Примеры:
- `@/entities/ad/api`
- `@/entities/ad/model`
- `@/entities/ad/ui`
- `@/app/config`
- `@/app/providers`
- `@/app/routes`

### Shared multi-entry public API

Для `shared` не используется единый root barrel. Вместо этого разрешены только заранее объявленные public submodules.

Текущий allowlist:
- `@/shared/api/client`
- `@/shared/api/error`
- `@/shared/api/zod-parser`
- `@/shared/config/runtime-config`
- `@/shared/lib/cn`
- `@/shared/lib/draft-autosave-guard`
- `@/shared/ui/loader`
- `@/shared/ui/page-state`
- `@/shared/ui/placeholders`
- `@/shared/ui/shadcn`
- `@/shared/ui/theme`

Если path отсутствует в этом списке, он не считается public API даже если файл физически существует.

## 3. Что считается deep import

- Импорт внутрь `shared` за пределы allowlist считается forbidden deep import.
- Импорт внутрь slice в `entities/features/widgets/pages` мимо его `index.ts` считается forbidden deep import.
- Внутри собственного slice/segment используются относительные импорты.
- Если внутри `shared` один shared-модуль использует другой shared-модуль, это не делает путь публичным автоматически.

Следствие:
- доступность файла в дереве каталогов не равна публичности;
- публичность задаётся policy и линтом, а не только файловой структурой.

## 4. Pages и Screen State

- Route entry component должен оставаться тонким.
- Loading, error, empty, not-found и ready state лучше собирать через page-level model/helper, а не прямо в большом JSX-файле.
- Если страница начинает одновременно парсить route, собирать query wiring, derived screen state и крупный JSX, orchestration нужно выносить в `model`.

## 5. Hooks и UI Contracts

- Большой hook не должен одновременно владеть transport, lifecycle, dialog state, derived result state и JSX-facing prop dump.
- Предпочтительно группировать contract как `status`, `result`, `actions`, `panel`, а не возвращать длинный flat list значений.
- Если hook уже тяжело читать по return shape, это сигнал к декомпозиции по responsibility.

## 6. Stores Ownership

- Zustand store должен жить там, где находится его owner.
- Feature-scoped session state живёт в `features`.
- Entity-scoped persistent metadata может жить в `entities`, если это реально знание об entity lifecycle.
- `shared` не используется как временный склад для feature-specific store.

## 7. API и Data Boundaries

- HTTP transport остаётся в `shared/api`.
- Entity API layer описывает контракт, схемы, query/mutation factories и entity-specific request helpers.
- На data boundary предпочитаются runtime validation и нормализация.
- Политика cache/cancellation должна читаться из query layer, а не быть размазанной по page-компонентам.

## 8. Query Cache Policy

- TanStack Query cache сейчас считается in-memory runtime cache.
- Reset cache after full refresh является ожидаемым поведением, а не багом.
- Если когда-либо понадобится persistence, это должно быть отдельным осознанным решением, а не случайным побочным эффектом.

## 9. Что считается нормальным упрощением

- Не каждый `if` нужно превращать в map.
- Но finite-state UI mapping лучше выносить в config/view model, если одно и то же ветвление разрастается.
- Не каждый `index.ts` вреден.
- Но barrel допустим только если он действительно является выбранной публичной точкой входа, а не дублирует структуру без пользы.

## 10. Anti-Patterns

- Считать любой файл под `shared/**` публичным только потому, что до него можно дотянуться импортом.
- Держать одновременно `@/shared/api` и `@/shared/api/client` как одинаково каноничные пути без явного правила.
- Протаскивать feature-specific state или business helpers в `shared`.
- Делать page-компонент owner'ом orchestration, route parsing, screen state mapping и крупного JSX одновременно.
- Разрешать wildcard-style public API там, где команда не готова поддерживать весь сегмент как стабильный контракт.
- Легализовывать deep imports “по факту существования файла”, а не через объявленный public API.

## 11. Правило изменения policy

Если нужен новый публичный путь:

1. Сначала объявить его как public entry point.
2. Затем обновить lint allowlist.
3. Только после этого использовать путь в коде.

Если этого шага нет, новый импорт считается архитектурным исключением, а не новой нормой.
