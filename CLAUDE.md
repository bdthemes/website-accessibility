# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**One Accessibility** (`website-accessibility`) — free WordPress plugin (WP ≥ 6.1, PHP ≥ 7.4) adding a WCAG accessibility toolbar to the front end, configured via a React admin SPA. A separate Pro plugin (`website-accessibility-pro`, namespace `bdthemes\websiteaccessibilitypro`, `window.websacPro`) plugs into this one **only through the extension API below**. **WordPress.org compliance rule:** this plugin ships no Pro-only or license-gated code. Custom profiles, export/import, white label, translation/checker settings, compliance screens, license manager and Pro tours all live in the Pro repo; free code only renders plain upsell placeholders (`src/admin/components/pro-upsell-page.js`, `ExtensionControl` PRO badges) and honours whatever add-ons register. Never call into `websiteaccessibilitypro\...` from this plugin, and never contact bdthemes.com / bdthemes.io (the only external service is the Free Dictionary API, documented in `readme.txt` → “External services”).

## Extension API (how Pro plugs in)

- **PHP filters/actions** (all `websac_*`): `websac_settings_defaults`, `websac_sanitize_settings($clean,$raw)`, `websac_public_frontend_settings($public,$all)`, `websac_brand_display_name`, `websac_hide_admin_menus`, `websac_admin_localized_data`, `websac_admin_script_dependencies`, `websac_frontend_localized_data`, `websac_frontend_profiles`, `websac_force_frontend_components_assets`, `websac_system_info`, action `websac_frontend_after_root`, action `websac_pro_admin_menu` (register submenu slugs — they all render `#website-accessibility-admin`), action `websac_plugins_loaded`.
- **PHP filters added in 1.5.2:** `websac_usage_statistics_features` (tracked feature keys), `websac_feature_category_definitions` (category placement used by migrations), `websac_default_preset_content` (activation seed).
- **JS registry** `window.websacAdminExtensions` (created by the components bundle, see `src/utils/admin-extensions.js`): `registerPage(slug, C)`, `registerSidebarItem({group,key,icon|()=>icon,label,position,isVisible})`, `registerSidebarGroup`, `registerControl(slot, C)` (slots: `headerShowTranslator`, `footerShowBranding`, `panelItemsLayout`, `panelItemsTooltipPosition`, `sidebarPromoCard`), `registerSettingsSection(C)` (props `settings, saving, updateSetting, setSettings, refreshSettings`), `registerProvider(P)`, `registerSidebarMenuInterceptor(fn)`, `registerTourAction({id,label,start,isVisible})`, `registerProfilesStore(storeName)` (store must expose `getProfiles()`).
- **Free internals for add-on screens** are published on `window.wapAdmin` right before the SPA mounts (`useHistory`, `useLocation`, `STORE_NAME`, `PostTable`, `ControlWrapper`, `SettingsItem`, `IconPicker`, `ColorPicker`, `icons`, brand hooks). Add-on bundles load *before* `websac-admin` (via `websac_admin_script_dependencies`), so they must read `wapAdmin` lazily at render time.
- **Toolbar/front-end extension points (1.5.2):** `wapHelpers.registerFeatureHandler(key, {apply(attribute,key), remove(key)})` — the accessibility manager (`src/accessibilty-manager.js`) delegates every feature key it has no built-in implementation for to the registered handler (else CSS-only via `attribute.css`); `wapHelpers.announce(text, ctx)` — add-on hook for spoken announcements (return `true` = handled); `wapHelpers.featureCategoryDefinitions` (read lazily by `getFeatureCategoryDefinitions()`), `wapHelpers.panelItems/features/defaultProfiles` (add-ons publish merged lists); `wapComponents.PanelHeaderActions` (extra header buttons; dropdown roots carry class `wap-panel-header-dropdown`) and `wapComponents.FrontendExtensions` (rendered next to the drawer with `{accessibilityContext, accessibilityDispatch, currentPreset, settings, isOpen}`).
- DOM events: free emits `websac-preset-profile-toggled` (detail `{profileId, enabled, presetId, save()}`) and `websac-accessibility-reset` (document; PanelHeader "Reset all"); it listens for `websac-white-label-changed` and `websac-extensions-changed` (add-ons fire it when their registrations/visibility change, e.g. after license activation).
- The free plugin never checks a license. The only add-on signal it reads is `websacAdmin.isProPluginActive` (localized by the add-on) to hide its own "Get Pro" upsell/card. See `MIGRATION-NOTES.md` (untracked in the zip) for the full list of symbols moved to Pro.

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
| `src/components/`    | `editorScript`   | `build/components/index.js`     | `websac-components` → `window.wapComponents`, `window.wapHelpers` |
| `src/admin/`         | `editorScript`   | `build/admin/index.js`          | `websac-admin` (admin SPA)                          |
| `src/frontend/`      | `viewScript`     | `build/frontend/frontend.js`    | `websac-frontend` (public toolbar)                  |

**Load order matters.** The components bundle is enqueued at priority 1 on both admin and front end and publishes shared React components (`Wap*` = thin antd wrappers, plus `PanelHeader`, `PreviewContent`, `WidgetFeatures`, …) and helpers to `window`. Admin and frontend bundles do **not** import these — they read them off `window.wapComponents` / `window.wapHelpers` (admin `index.js` polls with rAF until `wapComponents` exists). Adding a new shared component means exporting it from `src/components/index.js`.

`src/utils/features.js` is the canonical feature registry (key, label, CSS per step, announcements) used by both admin and frontend; `src/accessibilty-manager.js` (sic) applies/removes feature CSS on the live page.

## PHP architecture

- Namespace `Websac\`, PSR-4 from `includes/` (regenerate the committed autoloader with `composer dump-autoload -o` after adding classes). Main-file class is `Websac_Plugin`, bootstrap function `websac()`. `vendor/` is gitignored except the committed composer autoloader files.
- Everything is a singleton (`Traits\Singleton`, `::get_instance()`), wired in `website-accessibility.php::plugins_loaded()`. New PHP classes must be instantiated there.
- **Data model:** CPT `websac_preset` (toolbar config: button, panel, conditions; JSON stored in `post_content`), `show_in_rest`; the admin SPA saves it through `@wordpress/core-data` (`postType`/`websac_preset`), not custom routes. (`websac_profile` custom profiles are registered by the Pro plugin.) Plugin settings live in one option `websac_settings` — this plugin owns `show_usage_statistics` + `frontend_custom_css` only; add-on keys arrive via the settings filters and are preserved on save (`Routes/SettingsRouteV1`; read via `Core\Utils::get_settings()`).
- **REST:** custom routes live in `includes/Routes/*RouteV1.php`, all under the `websac/v1` namespace (settings, preference, usage-statistics, system-info, dashboard-tour). Pro registers `websac-pro/v1` + `one-accessibility/v1`.
- **Preset resolution:** `Core\Utils::get_page_type()` + `get_current_preset()` choose which preset renders (`entire_site` / singular / archive conditions). `Utils::is_builder_editor()` suppresses assets in Elementor/etc. editors.
- **Front end:** `View\Frontend` enqueues assets, localizes `window.websiteAccessibility` (presets, add-on profiles via filter, whitelisted public settings, nonce, restUrl, brand…), and prints `#website-accessibility-app` in `wp_footer`. `get_public_settings()` only exposes free-owned keys; add-ons opt theirs in via `websac_public_frontend_settings`.
- **Migrations:** `Core\Migrations` versions stored preset JSON and option keys (`websac_data_schema_version`, currently 5; category defaults filterable via `websac_feature_category_definitions`). Changing preset content shape or renaming a stored key → add a migration + bump `LATEST_DATA_SCHEMA_VERSION`.
- **Branding:** menu title / header name come from `Utils::get_brand_display_name()` (filter `websac_brand_display_name`); JS reads `websacAdmin.brandDisplayName|brandLogoUrl|whiteLabelBoot` (`src/utils/brand.js`). White-label itself is a Pro feature.
- Activation seeds a default preset and statement page from `default-posts/*.json`.
- Version string is duplicated: plugin header **and** `Websac_Plugin::VERSION` — bump both (plus `readme.txt` Stable tag).

## Admin SPA

- Mounts on `#website-accessibility-admin`; routing is a tiny custom `history`-based router keyed on the WP `?page=` query param (`src/admin/router`, `src/admin/pages/index.js` switch — registry pages win over the switch). New free screens need a submenu in `Admin\Menu.php` **and** a case in `pages/index.js`; add-on screens use `websac_pro_admin_menu` + `registerPage`.
- Global state: `@wordpress/data` store `wap/admin-store` (`src/admin/store`) holding preset form data (`getProfiles(withDefault)` merges built-in profiles with an add-on store); `LicenseContext` only mirrors `window.websacPro.isProActive` for PRO teasers; dashboard tour context.
- UI is antd 5 via the `Wap*` wrappers from the components bundle; SCSS in `src/admin/styles`.

## Conventions

- Text domain `website-accessibility` (must stay = plugin slug). **Single prefix `websac`** for every PHP-defined symbol: `Websac\` namespace, `WEBSAC_*` constants, `websac_*` options/meta/transients/hooks/CPTs, `websac-*` script & style handles, `websac/v1` REST. Admin `?page=` slugs stay `website-accessibility*`; CSS classes / JS globals keep the historical `wap`/`websac` names.
- Frontend `body` gets classes `wap wap-frontend`; admin body gets `wap-admin`.
- Tabs for indentation (`.editorconfig`), PHP style otherwise loose — phpcs only enforces escaping/sanitization.
