# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**One Accessibility** (`website-accessibility`) — free WordPress plugin (WP ≥ 6.1, PHP ≥ 7.4) adding a WCAG accessibility toolbar to the front end, configured via a React admin SPA. A separate Pro plugin (`websiteaccessibilitypro` namespace, `window.websacPro`) hooks into this one; free code must degrade gracefully when Pro is absent (`class_exists(...)`, `window.websacPro?.isProActive`).

## Commands

```bash
npm install && composer install   # composer only generates the PSR-4 autoloader (no PHP deps)
npm run start        # wp-scripts build --watch (default dev loop)
npm run start:hot    # wp-scripts start (hot reload)
npm run build        # production build → build/
npm run make-pot     # regenerate languages/website-accessibility.pot (needs wp-cli)
npm run plugin-zip   # zip using package.json "files" + .distignore
npm run publish      # build + make-pot + plugin-zip (what the release CI runs on tag push)
npx wp-scripts lint-js src   # ESLint via @wordpress/scripts (no npm alias defined)
phpcs --standard=phpcs.xml.dist   # WPCS security rules only (EscapeOutput, ValidatedSanitizedInput); scans includes/ + main file. Requires globally installed phpcs + WPCS.
```

There is no automated test suite; testing is manual in a local WP install (this checkout lives inside a Local-by-Flywheel site).

`build/` is gitignored — after PHP-side changes nothing needs rebuilding, but any `src/` change requires `npm run build`/`start` before it shows in WordPress. PHP loads assets from `build/*/index.asset.php`; if the file is missing, the enqueue silently returns.

## Build layout (important, non-obvious)

`@wordpress/scripts` discovers entry points from `block.json` files — the three under `src/` are **not real blocks**, they only declare entries:

| `src/`               | `block.json` key | Output                          | Script handle / global                              |
|----------------------|------------------|---------------------------------|-----------------------------------------------------|
| `src/components/`    | `editorScript`   | `build/components/index.js`     | `wap-accessibility-components` → `window.wapComponents`, `window.wapHelpers` |
| `src/admin/`         | `editorScript`   | `build/admin/index.js`          | `website-accessibility-admin` (admin SPA)           |
| `src/frontend/`      | `viewScript`     | `build/frontend/frontend.js`    | `wap-accessibility-frontend` (public toolbar)       |

**Load order matters.** The components bundle is enqueued at priority 1 on both admin and front end and publishes shared React components (`Wap*` = thin antd wrappers, plus `PanelHeader`, `PreviewContent`, `WidgetFeatures`, …) and helpers to `window`. Admin and frontend bundles do **not** import these — they read them off `window.wapComponents` / `window.wapHelpers` (admin `index.js` polls with rAF until `wapComponents` exists). Adding a new shared component means exporting it from `src/components/index.js`.

`src/utils/features.js` is the canonical feature registry (key, label, CSS per step, announcements) used by both admin and frontend; `src/accessibilty-manager.js` (sic) applies/removes feature CSS on the live page.

## PHP architecture

- Namespace `bdthemes\websiteaccessibility\`, PSR-4 from `includes/`. `vendor/` is gitignored except the committed composer autoloader files.
- Everything is a singleton (`Traits\Singleton`, `::get_instance()`), wired in `website-accessibility.php::plugins_loaded()`. New PHP classes must be instantiated there.
- **Data model:** two CPTs — `websac_preset` (toolbar config: button, panel, conditions; JSON stored in `post_content`) and `websac_profile` (feature bundles). Both `show_in_rest`; the admin SPA saves them through `@wordpress/core-data` (`postType`/`websac_preset`), not custom routes. Plugin settings live in one option `websac_settings` (defaults in `Routes/SettingsRouteV1`; read via `Core\Utils::get_settings()`).
- **REST:** custom routes live in `includes/Routes/*RouteV1.php`. Two namespaces coexist for legacy reasons — `sigmally/v1` (settings, export/import, system-info) and `one-accessibility/v1` (tours, usage-statistics). Match the existing namespace of the area you're touching.
- **Preset resolution:** `Core\Utils::get_page_type()` + `get_current_preset()` choose which preset renders (`entire_site` / singular / archive conditions). `Utils::is_builder_editor()` suppresses assets in Elementor/etc. editors.
- **Front end:** `View\Frontend` enqueues assets, localizes `window.websiteAccessibility` (presets, profiles, settings w/ API keys stripped, nonce, restUrl…), and prints `#website-accessibility-app` in `wp_footer`. Anything added to localized settings must go through `get_public_settings()` (secrets filter).
- **Migrations:** `Core\Migrations` versions stored preset JSON (`websac_data_schema_version`, currently 4). Changing preset content shape → add a migration + bump `LATEST_DATA_SCHEMA_VERSION`.
- **White label:** enabled via option `websac_white_label_enabled`; defines constants `WEBSAC_WL`, `WEBSAC_LO`, `WEBSAC_HIDE` *before* the main class loads (`includes/websac-white-label-bootstrap.php`). Check these constants rather than re-reading options.
- Activation seeds a default preset and statement page from `default-posts/*.json`.
- Version string is duplicated: plugin header **and** `WebsiteAccessibility::VERSION` — bump both (plus `readme.txt` Stable tag).

## Admin SPA

- Mounts on `#website-accessibility-admin`; routing is a tiny custom `history`-based router keyed on the WP `?page=` query param (`src/admin/router`, `src/admin/pages/index.js` switch). New admin screens need a submenu in `Admin\Menu.php` **and** a case in `pages/index.js`.
- Global state: `@wordpress/data` store `wap/admin-store` (`src/admin/store`) holding preset/profile form data; contexts for license and onboarding tours.
- UI is antd 5 via the `Wap*` wrappers from the components bundle; SCSS in `src/admin/styles`.

## Conventions

- Text domain `website-accessibility`; option/meta/handle prefixes `websac_` / `wap-`.
- Frontend `body` gets classes `wap wap-frontend`; admin body gets `wap-admin`.
- Tabs for indentation (`.editorconfig`), PHP style otherwise loose — phpcs only enforces escaping/sanitization.
