# CLAUDE.md

Guidance for Claude Code (claude.ai/code) working in this repo.

## What this is

**One Accessibility** (`website-accessibility`) — free WordPress plugin (WP ≥ 6.1, PHP ≥ 7.4). Adds WCAG accessibility toolbar to front end, configured via React admin SPA. Separate Pro plugin (`website-accessibility-pro`, namespace `bdthemes\websiteaccessibilitypro`, `window.websacPro`) plugs in **only through extension API below**. **WordPress.org compliance rule:** this plugin ships no Pro-only or license-gated code. Custom profiles, export/import, white label, translation/checker settings, compliance screens, license manager, Pro tours all live in Pro repo; free code renders **no** placeholder screens/badges for Pro features — only the single "Get Pro" page/card (`src/admin/pages/get-pro.js`, promo card in `admin-layout.js`) + honours whatever add-ons register (`ExtensionControl` renders nothing when no add-on control is registered for a slot). Never call into `websiteaccessibilitypro\...` from this plugin. Never contact bdthemes.com / bdthemes.io (only external service = Free Dictionary API, documented in `readme.txt` → “External services”).

## Extension API (how Pro plugs in)

- **PHP filters/actions** (all `websac_*`): `websac_settings_defaults`, `websac_sanitize_settings($clean,$raw)`, `websac_public_frontend_settings($public,$all)`, `websac_brand_display_name`, `websac_hide_admin_menus`, `websac_admin_localized_data`, `websac_admin_script_dependencies`, `websac_frontend_localized_data`, `websac_frontend_profiles`, `websac_force_frontend_components_assets`, `websac_system_info`, action `websac_frontend_after_root`, action `websac_pro_admin_menu` (register submenu slugs — all render `#website-accessibility-admin`), action `websac_plugins_loaded`.
- **PHP filters added 1.5.0:** `websac_usage_statistics_features` (tracked feature keys), `websac_feature_category_definitions` (category placement used by migrations), `websac_default_preset_content` (activation seed).
- **JS registry** `window.websacAdminExtensions` (created by components bundle, see `src/utils/admin-extensions.js`): `registerPage(slug, C)`, `registerSidebarItem({group,key,icon|()=>icon,label,position,isVisible})`, `registerSidebarGroup`, `registerControl(slot, C)` (slots: `headerShowTranslator`, `footerShowBranding`, `panelItemsLayout`, `panelItemsTooltipPosition`, `sidebarPromoCard`), `registerSettingsSection(C)` (props `settings, saving, updateSetting, setSettings, refreshSettings`), `registerProvider(P)`, `registerSidebarMenuInterceptor(fn)`, `registerTourAction({id,label,start,isVisible})`, `registerProfilesStore(storeName)` (store must expose `getProfiles()`).
- **Free internals for add-on screens** published on `window.wapAdmin` right before SPA mounts (`useHistory`, `useLocation`, `STORE_NAME`, `PostTable`, `ControlWrapper`, `SettingsItem`, `IconPicker`, `ColorPicker`, `icons`, brand hooks). Add-on bundles load *before* `websac-admin` (via `websac_admin_script_dependencies`) → must read `wapAdmin` lazily at render time.
- **Toolbar/front-end extension points (1.5.0):** `wapHelpers.registerFeatureHandler(key, {apply(attribute,key), remove(key)})` — accessibility manager (`src/accessibilty-manager.js`) delegates every feature key without built-in implementation to registered handler (else CSS-only via `attribute.css`); `wapHelpers.announce(text, ctx)` — add-on hook for spoken announcements (return `true` = handled); `wapHelpers.featureCategoryDefinitions` (read lazily by `getFeatureCategoryDefinitions()`), `wapHelpers.panelItems/features/defaultProfiles` (add-ons publish merged lists); `wapComponents.PanelHeaderActions` (extra header buttons; dropdown roots carry class `wap-panel-header-dropdown`), `wapComponents.FrontendExtensions` (rendered next to drawer with `{accessibilityContext, accessibilityDispatch, currentPreset, settings, isOpen}`).
- DOM events: free emits `websac-preset-profile-toggled` (detail `{profileId, enabled, presetId, save()}`) + `websac-accessibility-reset` (document; PanelHeader "Reset all"); listens for `websac-white-label-changed` + `websac-extensions-changed` (add-ons fire when registrations/visibility change, e.g. after license activation).
- Free plugin never checks license. Only add-on signal read: `websacAdmin.isProPluginActive` (localized by add-on) → hides own "Get Pro" upsell/card. See `MIGRATION-NOTES.md` (untracked in zip) for full list of symbols moved to Pro.

## Commands

```bash
npm install && composer install   # composer only generates the PSR-4 autoloader (no PHP deps)
npm run start        # wp-scripts build --watch (default dev loop)
npm run start:hot    # wp-scripts start (hot reload)
npm run build        # production build → build/
npm run make-pot     # regenerate languages/website-accessibility.pot (needs wp-cli)
npm run plugin-zip   # zip using package.json "files" (src/ ships too — GL4 human-readable code); .distignore kept in sync for svn tooling
npm run publish      # build + make-pot + plugin-zip (what the release CI runs on tag push)
npx wp-scripts lint-js src   # ESLint via @wordpress/scripts (no npm alias defined)
phpcs --standard=phpcs.xml.dist   # WPCS security rules only (EscapeOutput, ValidatedSanitizedInput); scans includes/ + main file. Requires globally installed phpcs + WPCS.
```

No automated test suite; manual testing in local WP install (checkout lives inside Local-by-Flywheel site).

`build/` gitignored — PHP-side changes need no rebuild, but any `src/` change requires `npm run build`/`start` before showing in WordPress. PHP loads assets from `build/*/index.asset.php`; file missing → enqueue silently returns.

## Build layout (important, non-obvious)

`@wordpress/scripts` discovers entry points from `block.json` files — three under `src/` are **not real blocks**, only declare entries:

| `src/`               | `block.json` key | Output                          | Script handle / global                              |
|----------------------|------------------|---------------------------------|-----------------------------------------------------|
| `src/components/`    | `editorScript`   | `build/components/index.js`     | `websac-components` → `window.wapComponents`, `window.wapHelpers` |
| `src/admin/`         | `editorScript`   | `build/admin/index.js`          | `websac-admin` (admin SPA)                          |
| `src/frontend/`      | `viewScript`     | `build/frontend/frontend.js`    | `websac-frontend` (public toolbar)                  |

**Load order matters.** Components bundle enqueued at priority 1 on admin + front end; publishes shared React components (`Wap*` = thin antd wrappers, plus `PanelHeader`, `PreviewContent`, `WidgetFeatures`, …) + helpers to `window`. Admin/frontend bundles do **not** import these — read off `window.wapComponents` / `window.wapHelpers` (admin `index.js` polls with rAF until `wapComponents` exists). New shared component → export from `src/components/index.js`.

`src/utils/features.js` = canonical feature registry (key, label, CSS per step, announcements) used by admin + frontend; `src/accessibilty-manager.js` (sic) applies/removes feature CSS on live page.

## PHP architecture

- Namespace `Websac\`, PSR-4 from `includes/` (regenerate committed autoloader with `composer dump-autoload -o` after adding classes). Main-file class `Websac_Plugin`, bootstrap function `websac()`. `vendor/` gitignored except committed composer autoloader files.
- Everything singleton (`Traits\Singleton`, `::get_instance()`), wired in `website-accessibility.php::plugins_loaded()`. New PHP classes must instantiate there.
- **Data model:** CPT `websac_preset` (toolbar config: button, panel, conditions; JSON in `post_content`), `show_in_rest`; admin SPA saves via `@wordpress/core-data` (`postType`/`websac_preset`), not custom routes. (`websac_profile` custom profiles registered by Pro.) Plugin settings = one option `websac_settings` — this plugin owns `show_usage_statistics` + `frontend_custom_css` only; add-on keys arrive via settings filters, preserved on save (`Routes/SettingsRouteV1`; read via `Core\Utils::get_settings()`).
- **REST:** custom routes in `includes/Routes/*RouteV1.php`, all under `websac/v1` namespace (settings, preference, usage-statistics, system-info, dashboard-tour). Pro registers `websac-pro/v1` + `one-accessibility/v1`.
- **Preset resolution:** `Core\Utils::get_page_type()` + `get_current_preset()` choose preset to render (`entire_site` / singular / archive conditions). `Utils::is_builder_editor()` suppresses assets in Elementor/etc. editors.
- **Front end:** `View\Frontend` enqueues assets, localizes `window.websiteAccessibility` (presets, add-on profiles via filter, whitelisted public settings, nonce, restUrl, brand…), prints `#website-accessibility-app` in `wp_footer`. `get_public_settings()` exposes free-owned keys only; add-ons opt in via `websac_public_frontend_settings`.
- **Migrations:** `Core\Migrations` versions stored preset JSON + option keys (`websac_data_schema_version`, currently 6; category defaults filterable via `websac_feature_category_definitions`). Change preset content shape or rename stored key → add migration + bump `LATEST_DATA_SCHEMA_VERSION`.
- **Branding:** menu title / header name from `Utils::get_brand_display_name()` (filter `websac_brand_display_name`); JS reads `websacAdmin.brandDisplayName|brandLogoUrl|whiteLabelBoot` (`src/utils/brand.js`). White-label itself = Pro feature.
- Activation seeds default preset + statement page from `default-posts/*.json`.
- Version string duplicated: plugin header **and** `Websac_Plugin::VERSION` — bump both (plus `readme.txt` Stable tag + `package.json` version).
- `uninstall.php` deletes all `websac_*` options/transients, `websac_preferences` user meta, `websac_preset` posts (statement page kept — user content). Add new keys there.
- Admin bundle enqueued only on plugin screens (`Admin\Enqueue::is_plugin_screen`); Pro's admin bundle uses the same slug heuristic. Pro registers its own "Custom Profiles"/"Tools & Backup" submenus + sidebar items and prints `#wap-google-translate-container` via `websac_frontend_after_root`.

## Admin SPA

- Mounts on `#website-accessibility-admin`; routing = tiny custom `history`-based router keyed on WP `?page=` query param (`src/admin/router`, `src/admin/pages/index.js` switch — registry pages win over switch). New free screens need submenu in `Admin\Menu.php` **and** case in `pages/index.js`; add-on screens use `websac_pro_admin_menu` + `registerPage`.
- Global state: `@wordpress/data` store `wap/admin-store` (`src/admin/store`) holds preset form data (`getProfiles(withDefault)` merges built-in profiles with add-on store); `LicenseContext` only mirrors `window.websacPro.isProActive` for PRO teasers; dashboard tour context.
- UI = antd 5 via `Wap*` wrappers from components bundle; SCSS in `src/admin/styles`.

## Conventions

- Text domain `website-accessibility` (must stay = plugin slug). **Single prefix `websac`** for every PHP-defined symbol: `Websac\` namespace, `WEBSAC_*` constants, `websac_*` options/meta/transients/hooks/CPTs, `websac-*` script & style handles, `websac/v1` REST. Admin `?page=` slugs stay `website-accessibility*`; CSS classes / JS globals keep historical `wap`/`websac` names.
- Frontend `body` gets classes `wap wap-frontend`; admin body gets `wap-admin`.
- Tabs for indentation (`.editorconfig`), PHP style otherwise loose — phpcs only enforces escaping/sanitization.