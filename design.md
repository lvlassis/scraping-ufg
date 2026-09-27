# Design System — SIGAA Desktop

App desktop para estudantes da UFG visualizarem sua vida acadêmica.

---

## Cores

### Paleta principal

| Token           | Hex       | Uso                                      |
|-----------------|-----------|------------------------------------------|
| `color-bg`      | `#FFFFFF` | Fundo principal                          |
| `color-surface` | `#F5F6F8` | Cards, painéis, áreas elevadas           |
| `color-border`  | `#E2E5EA` | Bordas e divisores                       |
| `color-muted`   | `#9AA3B0` | Texto secundário, placeholders, ícones   |
| `color-text`    | `#1A1D23` | Texto principal                          |

### Azul UFG (cor de contraste)

| Token              | Hex       | Uso                                        |
|--------------------|-----------|--------------------------------------------|
| `color-primary`    | `#003D7C` | Ações primárias, links, destaques          |
| `color-primary-md` | `#005BAA` | Hover de botões e elementos interativos    |
| `color-primary-lt` | `#E8F0FB` | Fundos de badges, seleções, highlights     |

### Estados

| Token            | Hex       | Uso             |
|------------------|-----------|-----------------|
| `color-success`  | `#1A7A4A` | Aprovado, ok    |
| `color-warning`  | `#B45309` | Atenção, médio  |
| `color-danger`   | `#B91C1C` | Reprovado, erro |

---

## Tipografia

**Família:** Inter (fallback: system-ui, sans-serif)

| Papel           | Tamanho | Peso | Uso                             |
|-----------------|---------|------|---------------------------------|
| `heading-lg`    | 22px    | 700  | Títulos de página               |
| `heading-md`    | 17px    | 600  | Títulos de seção / card         |
| `heading-sm`    | 14px    | 600  | Rótulos de grupo, subtítulos    |
| `body`          | 14px    | 400  | Texto corrido                   |
| `body-sm`       | 12px    | 400  | Texto secundário, datas, notas  |
| `label`         | 11px    | 500  | Tags, badges, labels de input   |

Line-height padrão: `1.5`. Letter-spacing: `0` (exceto `label`: `0.04em`).

---

## Formas e Bordas

| Token            | Valor  | Onde usar                               |
|------------------|--------|-----------------------------------------|
| `radius-sm`      | `10px` | Inputs, badges, tooltips                |
| `radius-md`      | `16px` | Cards, dropdowns                        |
| `radius-lg`      | `24px` | Modais, painéis laterais                |
| `radius-full`    | `999px`| Botões pill, avatares, chips            |

Botões usam `radius-full` por padrão para reforçar o estilo arredondado.

---

## Sombras

Sombras discretas, sem drama. Nunca usar sombras coloridas.

| Token          | Valor CSS                                      | Onde usar               |
|----------------|------------------------------------------------|-------------------------|
| `shadow-sm`    | `0 1px 3px rgba(0,0,0,0.07)`                   | Cards em repouso        |
| `shadow-md`    | `0 4px 12px rgba(0,0,0,0.08)`                  | Cards hover, dropdowns  |
| `shadow-lg`    | `0 8px 24px rgba(0,0,0,0.10)`                  | Modais                  |

---

## Componentes

### Botão primário
- Fundo: `color-primary` → hover: `color-primary-md`
- Texto: branco, peso 500
- Border-radius: `radius-full`
- Padding: `8px 20px`

### Botão secundário
- Fundo: transparente, borda 1.5px `color-border`
- Texto: `color-text`
- Border-radius: `radius-full`
- Hover: fundo `color-surface`

### Card
- Fundo: `color-bg` ou `color-surface`
- Border: 1px `color-border`
- Border-radius: `radius-md`
- Sombra: `shadow-sm` → hover: `shadow-md`

### Badge / tag de status
- Border-radius: `radius-full`
- Padding: `2px 10px`
- Tamanho: `label`
- Aprovado: fundo `#DCFCE7`, texto `color-success`
- Reprovado: fundo `#FEE2E2`, texto `color-danger`
- Em andamento: fundo `color-primary-lt`, texto `color-primary`

---

## Espaçamento

Escala de 4px:

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64`

Gap padrão entre cards: `16px`. Padding interno de cards: `20px`.

---

## Princípios gerais

- **Fundo claro predomina** — evitar fundos escuros nas telas principais.
- **Hierarquia via peso tipográfico**, não via cores diferentes.
- **Azul somente para ação ou destaque** — não decorativo.
- **Ícones sempre acompanham label** nas ações primárias.
