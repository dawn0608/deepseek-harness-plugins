# Example Plugin (@dawn0608/dsh-example)

A minimal DeepSeek Harness plugin skeleton maintained in this repository. Copy `templates/plugin/` to `plugins/<name>/` and replace:

- `package.json`: name, description, version, repository;
- `cordis.patch.yml`: row id and package name;
- `src/client/index.js`, `src/client/i18n.js`, `src/client/style.css`: loader id, locale namespace, CSS prefix;
- `locale/en.json`, `locale/zh.json`: plugin-page metadata;
- `README.md`, `README.zh.md`, and `icon.svg`.

## Layout

| Path | Purpose |
| --- | --- |
| `src/index.js` | Host entry (`apply`). |
| `src/client/index.js` | Web entry: a clean module that exports `apply`/`inject`; the build adds the loader shell. |
| `src/client/i18n.js` | Chinese/English UI dictionaries and the locale-service binding. |
| `src/client/style.css` | Client styles, imported as text by the build. |
| `cordis.patch.yml` | Inserts the bundle row. |
| `locale/{en,zh}.json` | Plugin Manager title and description. |
| `icon.svg` | Plugin row icon. |
| `test/` | Locale and client-contract tests. |
| `lib/` | Build output, created by `npm run build` (not committed). |

## Development

```sh
npm run build
npm test
```

`npm run build` writes `lib/index.js` and `lib/client.js`; `npm test` rebuilds first, then runs the tests.

## Install

Build the plugin, then install the package directory:

```sh
npm run build
dsh plugin --profile <profile> add ./plugins/<name>
```

The template is `private`. Remove `"private": true` before publishing to npm.
