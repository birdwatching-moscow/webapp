# Spec: HomePodcast section

## User story
Добавить на главную страницу секцию «Подкаст», которая анонсирует подкаст «Витю видел?» и встраивает виджет Яндекс.Музыки.

## What to build

### Component: `HomePodcast`
Новый Server Component `components/HomePodcast/HomePodcast.tsx`.

Контент (захардкожен):
- Заголовок: `Подкаст`
- Описание: `Вместе с проектом Arzamas мы делали подкаст. Мы смеемся, шутим и рассказываем о птицах так, что понятно даже малышам. Если вам страшно, что вы ничего не знаете, послушайте первый выпуск про голубей.`
- Ссылка «Яндекс.Музыка» → `https://music.yandex.ru/album/17448287`
- Ссылка «Apple Podcast» → `https://podcasts.apple.com/ru/podcast/id1580414020`
- Виджет Яндекс.Музыки (iframe): `https://music.yandex.ru/iframe/#album/17448287`

### Layout

**Mobile** (< 1248px) — вертикальный стек, `padding-top: 64px`:
1. Заголовок «Подкаст» (`text-h1`)
2. Описание (`text-body-l`, цвет `--color-muted-foreground`), `gap: 12px` между заголовком и описанием
3. Строка ссылок «Яндекс.Музыка» | «Apple Podcast» (ghost-кнопки, `gap: 24px`)
4. Виджет Яндекс.Музыки (`width: 100%`, `height: 237px`)

**Desktop** (≥ 1248px) — 2 колонки, `padding-top: 96px`, `gap: 32px`:
- Левая (1fr): заголовок → описание → строка ссылок, вертикально по центру относительно виджета
- Правая (1fr): виджет Яндекс.Музыки (`width: 100%`, `height: 450px`)

### Виджет
```html
<iframe
  src="https://music.yandex.ru/iframe/#album/17448287"
  width="100%"
  height="450"
  frameBorder="0"
  title="Подкаст «Витю видел?» на Яндекс.Музыке"
/>
```
На мобильном `height` через CSS — `237px`; на десктопе — `450px`.

Компонент использует `'use client'` **НЕ нужен** — iframe статичен, Server Component.

### Placement
`HomePodcast` добавляется в `app/page.tsx` после `HomeBook`.

## Success criteria
- [ ] `pnpm test:run` проходит
- [ ] `pnpm typecheck` без ошибок
- [ ] `<section data-testid="home-podcast">` присутствует в DOM
- [ ] Заголовок «Подкаст» рендерится как `h2`
- [ ] Описание содержит текст «Arzamas»
- [ ] Ссылка «Яндекс.Музыка» ведёт на `https://music.yandex.ru/album/17448287`
- [ ] Ссылка «Apple Podcast» ведёт на `https://podcasts.apple.com/ru/podcast/id1580414020`
- [ ] iframe с `src` содержащим `17448287` присутствует в DOM
- [ ] На мобильном: текстовый блок над виджетом
- [ ] На десктопе: левая колонка с текстом, правая — виджет

## Edge cases
- iframe может быть заблокирован браузером (uBlock и т. п.) — ничего делать не нужно, это стандартное поведение
- Ссылки открываются в новой вкладке (`target="_blank" rel="noopener noreferrer"`)

## Files
```
components/HomePodcast/HomePodcast.tsx          (новый)
components/HomePodcast/HomePodcast.module.css   (новый)
app/page.tsx                                     (добавить импорт + <HomePodcast />)
dev/specs/home-podcast/spec.md                   (этот файл)
__tests__/components/HomePodcast.test.tsx         (новый, TDD)
```
