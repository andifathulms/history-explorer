# Fonts

Vendored, not fetched. The build used to pull these from Google Fonts through
`next/font/google`, which meant every deploy depended on `fonts.googleapis.com`
being reachable from a GitHub runner at that moment. One was not, the build
failed with `ETIMEDOUT`, and a finished commit sat unpublished until it was
re-run by hand. A static site whose whole point is that it can be rebuilt from
its own repository should not have a third party in that path.

## What is here, and why only this

Only the weights the site uses. `font-semibold` (600) and the default (400) are
the only weights any component asks for; there is no 500 and no 700 in the
markup, so there are none here.

| Family | Weights | Styles | Subsets |
|---|---|---|---|
| Spectral | 400, 600 | normal, italic (400 only) | latin, latin-ext |
| Fraunces | 400–700 variable, one file | normal | latin, latin-ext |
| IBM Plex Mono | 400 | normal | latin, latin-ext |
| Amiri | 400 | normal | arabic |

`latin-ext` is carried for the Latin faces because the corpus sets names like
Ardashīr and Šāpūr, and a macron falling back to Georgia mid-word is visible.
Amiri carries `arabic` only: it exists to set the script names and is never
used for Latin text.

Scripts beyond these — Greek, Devanagari, Tibetan, Mongolian, Balinese,
Javanese, Ethiopic, CJK, Old Persian and Egyptian hieroglyphs all appear in the
corpus — have never had a webfont here and still do not. They render in the
reader's system fonts, which is the honest trade: shipping a face for each
would cost several megabytes to set a few dozen glyphs.

## Licence

All four families are under the **SIL Open Font License 1.1**, which permits
redistribution with the software. Copyright notices, verbatim from each
project:

- **Spectral** — Copyright 2017 The Spectral Project Authors
  (https://github.com/productiontype/Spectral)
- **Fraunces** — Copyright 2020 The Fraunces Project Authors
  (https://github.com/undercasetype/Fraunces)
- **IBM Plex Mono** — Copyright 2017 IBM Corp.
  (https://github.com/IBM/plex)
- **Amiri** — Copyright 2010-2023 Khaled Hosny
  (https://github.com/alif-type/amiri)

Full licence text: https://openfontlicense.org — the OFL requires that these
fonts not be sold on their own and that any modified version be renamed.
Neither applies here: the files are unmodified subsets as served by Google
Fonts.

## Refreshing them

```
npm run fonts
```

Re-downloads the same subsets, rewrites the `@font-face` block at the top of
`app/globals.css`, and leaves everything else alone. Run it when a family needs
a new weight — and add the weight to the table above when you do.
