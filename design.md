# Дизайн-система Birdwatching Moscow

> Нормативный визуальный стандарт. Единственный источник правил оформления, токенов, типографики, сеток, sizing и responsive-архитектуры. Текущее состояние Figma, node ID и реестр компонентов — в [`figma.md`](figma.md).

## Токены

Коллекция переменных: `Default`, режим `Light`; 35 токенов. Единственная локальная коллекция. Новые токены — только по явной инструкции владельца.

### Цвет (9)

- `color/primary`, `color/primary-foreground`, `color/primary-hover` — основной акцент
- `color/foreground`, `color/background` — базовые текст и фон
- `color/border`, `color/input-border` — границы и подчёркивания
- `color/muted-foreground` — второстепенный текст
- `color/error` — ошибки
- `color/background` привязывается только page-фреймы, не компоненты
- Белый цвет карточек и тёмный цвет бейджей в файле лежат сырым цветом (`#ffffff`, `#26241f`), отдельных токенов под них нет
- Осознанно остаются сырыми и токеном не становятся: `#d9d9d9` (техническая заглушка под изображение), `#000000` (техническая обводка), `#8c737b` (служебные узлы UI KIT) и `#e9f3fd` (три служебные плитки Foundations)

### Space (11)

Все отступы, зазоры и фиксированные высоты кратны 4. Ряд полный: `space/0`=0, `space/1`=4, `space/2`=8, `space/3`=12, `space/4`=16, `space/4a`=20, `space/5`=24, `space/6`=32, `space/7`=48, `space/8`=64, `space/10`=96. Ступени 80 в ряду нет: шаг между 64 и 96.

Секционный отступ берётся из общего ряда: `space/10`=96 на настольных ширинах, `space/8`=64 в мобильном вертикальном ритме. Отдельных секционных токенов нет.

Все отступы и зазоры привязаны к токену, исключений нет.

### Radius

| Токен | Значение |
| --- | --- |
| `radius/none` | 0 |
| `radius/lg` | 12 |

Единственное скругление компонентов — `radius/lg`=12. `radius/none` — только осознанный прямой край.

### Size (13)

- Контролы: `size/control/icon`=24 (мелкие иконки, бургер, строки сводки), `size/control/sm`=36, `size/control/input`=48, `size/control/header-mobile`=64, `size/control/header-desktop`=80
- Раскладка: `size/layout/input`=320, `content-mobile`=328, `screen-mobile`=360, `col-3`=406, `col-2`=612, `text-max`=720, `col-1`=1248, `screen-desktop`=1440
- Ряд колонок настольной сетки: `col-1`=1248 (вся ширина контента), `col-2`=612 (две колонки), `col-3`=406 (треть: узкая колонка, карточка, контент сценариев с `PurchaseSummary`; поля ввода и кнопки внутри наследуют 406)
- `size/layout/text-max` = 720 (макс. ширина строки текста до 18 pt)

### Stroke

- `stroke/default` = 2 px (подчёркивания, границы, обводка фокуса)

## Типографика

8 текстовых стилей (Montserrat display / Manrope body):

| Стиль | Файл | Шрифт | Mobile (−1 ступень) |
| --- | --- | --- | --- |
| 01 Display | 56/58 | Montserrat SemiBold | 40/44 |
| 02 H1 | 40/44 | Montserrat SemiBold | 28/32 |
| 03 H2 | 28/32 | Montserrat SemiBold | 24/28 |
| 04 H3 | 24/28 | Montserrat SemiBold | 18/24 |
| 05 Body L | 20/24 | Manrope SemiBold | 18/24 |
| 06 Body | 18/24 | Manrope Medium | 16/20 |
| 07 Label | 16/20 | Manrope Medium | 14/16 |
| 08 Caption | 14/16 | Manrope Medium | — |

Столбец Mobile — правило одной ступени вниз; отдельных мобильных стилей в файле нет.

Правила:

- `textStyleId` — контракт типографики. Слой с утверждённым text style не считать «нетокенизированным».
- Свободную типографику в затронутом scope приводить к существующему стилю.
- Текст до 18 pt — не шире 720 px: контейнер `FILL` + `maxWidth = 720`, вертикаль `HUG`.
- Mobile — ровно одна ступень ниже. Второй набор стилей не создавать.

## Сетки

| Параметр | Desktop | Mobile |
| --- | --- | --- |
| Колонки | 12 | 4 |
| Боковые поля | 96 px (`space/10`) | 16 px (`space/4`) |
| Гаттер | 24 px | 16 px |

Боковые поля владеет обёртка страницы (auto-layout frame). Секции и компоненты — без горизонтального padding.

## Вертикальный ритм

Только `paddingTop` (`paddingBottom = 0`):

| Контекст | Desktop | Mobile |
| --- | --- | --- |
| Контентные секции первого уровня | 96 (`space/10`) | 64 (`space/8`) |
| Компактные (баннеры, ревью, футер) | 48 (`space/7`) | 24 (`space/5`) |
| Прижатые (Header, расписания, под-блоки) | 0 (`space/0`) | 0 (`space/0`) |

Mobile: контентные секции первого уровня — `paddingTop = 64` (`space/8`), `paddingBottom = 0`; горизонталь остаётся 16 (`space/4`). Привязку делать на уровне variant-источника, иначе baked-in padding даёт двойной отступ. Header, Footer, hero-media и компактные внутренние блоки следуют собственному контракту компонента.

## Responsive-архитектура

| Ситуация | Решение |
| --- | --- |
| Отличается только размер или перенос | Один master, auto layout |
| Отличается контент между ширинами | Исправить наследование |
| Отличаются порядок, видимость, навигация, семантика | Breakpoint variant |
| Отличается интерактивное состояние или публичная опция | Обычный variant |

## Компонентный стандарт

### Именование

| Элемент | Правило | Пример |
| --- | --- | --- |
| Компонент (master) | PascalCase, предметное имя, без префиксов | `ExpeditionCard`, `TicketTable` |
| Component set | Имя = имя компонента; variants `property=value` | `Button` → `variant=default, size=sm` |
| Проперти | PascalCase или sentence case (как Figma отображает), короткие имена | `Label`, `Value`, `Show body` |
| Breakpoint property | `Breakpoint: Desktop \| Mobile` (заглавная B) | Footer |
| Прочие variant properties | строчные: `state`, `flow`, `context`, `media` | `AuthFlow: flow=sign-up` |
| Page component | Название страницы кириллицей | «Главная», «Прогулка» |
| Page instance (mobile) | То же имя + ` Mobile` | «Главная Mobile» |

### Контейнерная организация UI Kit

```
UI Kit (1103:0)
├── Foundations (1697:59)               # токены, типографика, системные значения
├── Components / Primitives (1697:194)  # атомарные: Button, Input, Icon, ImagePlaceholder, Dropdown
├── Components / Cards (1697:318)       # предметные карточки
├── Components / Blocks (1697:355)      # составные: Header, Footer, формы, CTA, секции
└── Components / Purchase & Auth (1697:787) # purchase/auth-мастеры
```

Отдельного контейнера Page Sections в файле нет: структурные wrappers с breakpoint лежат в `Components / Blocks`.
