# Spec: HomeBook section

## User story
Добавить на главную страницу секцию «Книга», которая анонсирует книгу Вероники Самоцкой с переходом на страницу `/book`.

## What to build

### Component: `HomeBook`
Новый Server Component `components/HomeBook/HomeBook.tsx`.

Контент (захардкожен):
- Заголовок: `Книга «В том дереве слева»`
- Описание: `Книга орнитолога Вероники Самоцкой, основательницы Birdwatching Moscow`
- Фото: `/images/book-cover.jpg` (alt: `Книга «В том дереве слева»`)
- Кнопка: `Подробнее` → `ROUTES.book`

### Layout

**Mobile** (< 1248px) — вертикальный стек, `padding-top: 64px`, `gap: 24px`:
1. Заголовок (`text-h1`)
2. Фото (`border-radius: var(--radius-lg)`, `aspect-ratio: 328/246`)
3. Описание (`text-body-l`, цвет `--color-muted-foreground`)
4. Кнопка «Подробнее» (`variant="primary"`, `size="lg"`, `fullWidth`)

**Desktop** (≥ 1248px) — 2 колонки CSS Grid, `padding-top: 96px`, `column-gap: 32px`:
- Левая (1fr): заголовок → описание → кнопка (`max-width: 406px`)
- Правая (1fr): фото (заполняет всю высоту левой колонки)

Порядок элементов в DOM: заголовок → фото → описание → кнопка.
На десктопе CSS Grid перекладывает фото в правую колонку через `grid-column`/`grid-row`.

### Placement
`HomeBook` добавляется в `app/page.tsx` после `HomePartners`.

### `/book` page
Страница-стаб уже существует — не трогаем.

## Success criteria
- [ ] `pnpm test:run` проходит
- [ ] `pnpm typecheck` без ошибок
- [ ] `<section data-testid="home-book">` присутствует в DOM
- [ ] Заголовок, описание и кнопка «Подробнее» рендерятся
- [ ] Кнопка ведёт на `/book`
- [ ] На мобильном порядок: заголовок → фото → описание → кнопка
- [ ] На десктопе: левая колонка с текстом и кнопкой, правая — фото

## Edge cases
- Если `book-cover.jpg` не найден, `next/image` показывает alt
- Кнопка `fullWidth` на мобильном, `max-width: 406px` на десктопе

## Files
```
components/HomeBook/HomeBook.tsx          (новый)
components/HomeBook/HomeBook.module.css   (новый)
app/page.tsx                              (добавить импорт + <HomeBook />)
dev/specs/home-book/spec.md              (этот файл)
__tests__/components/HomeBook.test.tsx    (новый, TDD)
```
