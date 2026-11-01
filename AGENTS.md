# Project Instructions

- `HISTORY.md` entries are hard-wrapped prose; follow the existing style and ignore PI-WRAP findings for that file.
- `prettier/prettier` is enabled only for `*.ts` files; this checkout lints clean as-is, so run `npm run format` only if prettier findings appear (they showed up as CRLF errors in earlier sessions).
- `npm run compile` is broken (the gulp task does not exist); `test:node` needs a fresh full build via `npx gulp` first.
- `npm run lint`, `npm run test:src`, and `npm run test:types` run directly from a fresh checkout; only `test:node` needs a build first.
- Fork releases use build metadata, `<version>+rezalabs.N` (currently `15.2.2+rezalabs.1`), so semver ranges still match; prerelease suffixes like `-rezalabs.N` break `^15.2.0` range checks. Build metadata does not affect semver precedence, so raise the patch level when a release must sort above the previous tag and increment `N` only for rebuilds of the same version. Keep `package.json`, both `package-lock.json` version fields, `src/version.js`, the top `HISTORY.md` heading, and the git tag in sync.
- Releases are cut on the `release` branch (the repository default) with a `v<version>` tag; `develop` holds work in progress. `#semver:` git installs resolve against tags, never against the `version` field.
