# MIGRATION-NOTES — One Accessibility 1.5.2 (WordPress.org compliance release)

Companion notes for **One Accessibility Pro 1.5.1**. Everything listed here was
removed from the free plugin (`website-accessibility`) and re-implemented in the
Pro plugin (`website-accessibility-pro`) on top of the extension hooks below.
This file is not shipped (not in `package.json` → `files`).

Earlier rounds (1.5.0 / 1.5.1) already moved: custom profiles, export/import,
white label, translation/checker settings, compliance screens, license manager,
tours, dashboard news feed, `bdthemes.*` requests, and unified the `websac`
prefix. This round removes the *residue* that was still gated on `isProActive`.

## 1. Extracted from the free plugin → where it lives now

| Free symbol / file (removed in 1.5.2) | Original location | Free call sites (all removed) | Now in Pro |
|---|---|---|---|
| 10 `isDummy: true` feature entries (`screenReader`, `smartContrast`, `dyslexiaFriendly`, `grayscale`, `brightness`, `muteSounds`, `keyboardNavigation`, `virtualKeyboard`, `skipLinks`, `focusIndicators`) | `src/utils/features.js` | `widget-features.js`, `features-customization.js`, `usage-statistics.js`, `accessibility-profiles.js` (`isDummy` branches) | `src/helpers/features.js` (already had the full definitions; still filters `isDummy` defensively) |
| `language` panel item, `isPro: true` flags, Pro widget entries, `blind`/`dyslexia` profile ids | `src/utils/panel-items.js`, `default-posts/preset.json` | `preview-content.js`, `preset-panel-left-sidebar.js`, `preset-panel-customization.js` (`item.isPro && !isProActive`) | `src/helpers/panel-extensions.js` → `wapHelpers.panelItems` (merged), PHP `Core\Integration::default_preset_content` |
| Pro feature settings inside built-in profiles (motor/color-blind/low-vision/cognitive/seizure) | `src/utils/profiles.js` | — | `src/helpers/profiles.js` (`PRO_PROFILE_FEATURES` merged into free profiles) |
| Pro keys inside category defaults | `src/utils/feature-categories.js`, `includes/Core/Migrations.php::build_widget_categories()` | — | `src/helpers/panel-extensions.js::extendFeatureCategoryDefinitions`, PHP filter `websac_feature_category_definitions` |
| Pro keys inside tracked stats list | `includes/Routes/UsageStatisticsRouteV1.php::$features` | — | PHP filter `websac_usage_statistics_features` (`Core\Integration::FEATURE_KEYS`) |
| Pro dispatch table (`applyScreenReader/removeScreenReader`, `applySmartContrast/…`, `applyMuteSounds/…`, `filterFeatures().applyGrayScale/Brightness`, `keyboardNavigation/virtualKeyboard/skipLinks/focusIndicators .apply()/.remove()`) | `src/accessibilty-manager.js` | `init()` switch, `removeFeature()` | `src/helpers/feature-handlers.js::PRO_FEATURE_HANDLERS` registered via `wapHelpers.registerFeatureHandler` |
| `isScreenReaderActive()` + `screenReader().speak()` / `screenReaderConfig` writes | `src/utils/is-screenreader-active.js`, `widget-features.js`, `accessibility-profiles.js`, `frontend/view.js` | `handleFeatureClick`, `handleProfileClick`, drawer open/close | `src/helpers/feature-handlers.js::announce` published as `wapHelpers.announce` |
| Translation picker (`TranslationLanguageDropdown` trigger, `clearTranslationCacheState`, consent-cookie gating, `SET_SELECTED_LANGUAGE` on mount, reset handling) | `src/components/panel-header.js` | PanelHeader JSX | `src/components/panel-header-translator.js` → `wapComponents.PanelHeaderActions` |
| `<GoogleTranslateConsent>` mount, `isTranslatorEnabled`, `translateConsentCookie`, translation body classes (`one-accessibility-feature-enable-translations`, `-language-xx`) | `src/frontend/view.js` | View render + body-class effect | `src/components/frontend-extensions.js` → `wapComponents.FrontendExtensions` |
| `LicenseContext.js` (`LicenseProvider`, `useLicense`, `websac-license-changed` listener) | `src/admin/context/LicenseContext.js` | `admin/index.js`, `admin-layout.js`, `get-pro.js`, `features-customization.js`, `usage-statistics.js`, `preset-panel-*.js` | Pro already had its own `src/admin/context/LicenseContext.js` |
| Sidebar "Pro features / Coming soon" card + "Activate License" link | `src/admin/components/admin-layout.js` | `renderSidebarNav` | `src/admin/components/pro-sidebar-card.js` registered on `registerControl('sidebarPromoCard', …)` |
| `IconLicense`, `IconWhiteLabel`, `IconFixedIssues`, `IconCompliance` | `src/admin/components/admin-menu-icons.js` (also exposed via `wapAdmin.icons`) | Pro `admin/index.js` (`getAdminIcons()`) | `src/admin/components/menu-icons.js` |
| Fix-highlight ("Locate") script + PHP enqueue/param decoding | `assets/js/websac-fix-highlight.js`, `includes/View/Frontend.php::maybe_enqueue_fix_highlight()/decode_xpath_highlight_param()` (hook `wp_enqueue_scripts`, prio 3) | Pro `fixed-accessibility-issues.js` builds `?websac_highlight=1&websac_xpath=` | `includes/Core/FixHighlight.php` + `assets/js/websac-pro-fix-highlight.js` (handle `websac-pro-fix-highlight`, licensed only) |
| White-label option rename + legacy recovery-token invalidation | `includes/Core/Migrations.php::migrate_legacy_option_keys()` | — | `includes/Core/Migrations.php` (option `websac_pro_data_schema_version`) |
| OpenDyslexic font files + `@font-face` | `src/assets/OpenDyslexic-*.woff2`, `src/frontend/styles/main.scss` | Pro `dyslexiaFriendly` CSS | `src/assets/OpenDyslexic-*.woff2`, `src/helpers/main.scss` (→ `build/helpers/index.css`, enqueued as `websac-helpers-pro`) |
| CSS: `.wap-translation-dropdown*`, `.wap-language-selector*`, `.skiptranslate`, consent button, `.wap-focus-*` | `src/components/styles/_panel-header.scss`, `src/frontend/styles/main.scss` | — | `src/components/main.scss` (→ `build/components/index.css`, enqueued as `websac-components-pro`) |
| CSS: compliance overview, `.wap-license-input`, `.wap-export-import-card`, `.wap-fixed-issues` table, usage-stats colours for Pro keys | `src/admin/styles/pages/_dashboard.scss`, `pages/_pages.scss`, `components/_settings-page.scss`, `components/_post-table.scss`, `components/_usage-statistics.scss` | — | `src/admin/styles/pages/_moved-from-free.scss` |
| Sample statement content linking to bdthemes.com and listing Pro widgets | `default-posts/statement.json` | `statement-setting.js`, activation seed | Rewritten neutrally with `{{site_name}} {{site_url}} {{admin_email}} {{date}}` placeholders (filled by `Utils::fill_statement_placeholders()` / JS) |

## 2. Extension hooks added in 1.5.2 (free side)

### JS (`window.wapHelpers` — published by the free `websac-components` bundle)
| Hook | Contract |
|---|---|
| `registerFeatureHandler(key, { apply(attribute, key), remove(key) })` | Accessibility manager delegates unknown feature keys to the handler; keys without a handler but with `attribute.css` are applied as CSS features. Registry: `window.websacFeatureHandlers`. |
| `getFeatureHandler(key)` | Lookup. |
| `announce(text, { key, attribute, settings, event, profile })` | Set by an add-on. Return `true` when handled (spoken); free still shows its visual toast. |
| `featureCategoryDefinitions` | Read **lazily** by `getFeatureCategoryDefinitions()`; add-ons overwrite with a merged list. |
| `panelItems`, `defaultProfiles`, `features` | Unchanged contract; add-ons publish merged lists (free admin store reads them at module eval → add-on helpers must load before `websac-admin`, which they do). |

### JS (`window.wapComponents`)
| Slot | Props |
|---|---|
| `PanelHeaderActions` | `{ attributes (header item attrs), isFrontend, isEditorPreview, accessibilityContext, accessibilityDispatch, panelWidth, portalTarget, dropdownOpen, onDropdownOpenChange, tooltipProps }` — rendered between "Reset all" and close. Dropdown roots must carry class `wap-panel-header-dropdown` (scroll-lock/overlay: `wap-panel-customization__panel--header-dropdown-open`, `.wap-panel-header-dropdown-overlay`). |
| `FrontendExtensions` | `{ accessibilityContext, accessibilityDispatch, currentPreset, settings, isOpen }` — rendered next to the drawer. |

### JS admin registry (`window.websacAdminExtensions`)
| Slot | Notes |
|---|---|
| `registerControl('sidebarPromoCard', C)` | Replaces the free "Get Pro" sidebar card. Free shows its own card only when `websacAdmin.isProPluginActive` is falsy. |

### DOM events
| Event | Emitter → listener |
|---|---|
| `websac-accessibility-reset` (document, `detail: { accessibilityContext, accessibilityDispatch }`) | free PanelHeader "Reset all" → add-ons |
| `websac-extensions-changed` (window) | add-ons → free AdminLayout (re-reads sidebar items / promo card / branding). Pro fires it after license status changes. |
| `websac-white-label-changed` (window) | unchanged |

### PHP filters
| Filter | Args | Purpose |
|---|---|---|
| `websac_usage_statistics_features` | `string[] $keys` | Feature keys accepted/aggregated by `websac/v1/usage-statistics`. |
| `websac_feature_category_definitions` | `array $definitions` (`slug`,`title`,`keys[]`) | Category placement used by the schema-2 migration. |
| `websac_default_preset_content` | `array $content` | Preset seeded on activation (only fires when the add-on is loaded during activation). |

Existing hooks are unchanged: `websac_settings_defaults`, `websac_sanitize_settings`, `websac_public_frontend_settings`, `websac_brand_display_name`, `websac_hide_admin_menus`, `websac_admin_localized_data`, `websac_admin_script_dependencies`, `websac_frontend_localized_data`, `websac_frontend_profiles`, `websac_force_frontend_components_assets`, `websac_system_info`, `websac_frontend_after_root`, `websac_pro_admin_menu`, `websac_plugins_loaded`, `websac_usage_statistics_max_keys`.

## 3. Prefix / naming (final)
* PHP namespace `Websac\`, constants `WEBSAC_*`, options/transients/meta/CPT/hooks `websac_*`, script+style handles `websac-*`, REST `websac/v1`. Text domain stays `website-accessibility`. Admin `?page=` slugs stay `website-accessibility*` (Pro screens must keep that prefix — free enqueue matches on it).
* Pro: namespace `bdthemes\websiteaccessibilitypro\`, `WEBSAC_PRO_*`, options `websac_pro_*` / `websac_white_label_*`, handles `websac-*-pro`, REST `websac-pro/v1` + `one-accessibility/v1`.
* Legacy → new key migrations: free schema v5 (`one_accessibility_usage_statistics` → `websac_usage_statistics`, `websac_product_feeds` transient deleted); Pro schema v1 (`websac_white_label_license_title_status` → `websac_white_label_status`, legacy `websac_white_label_access_token` invalidated). Cookies: `one_accessibility_browser_key` read once as fallback for `websac_browser_key`; `one_accessibility_daily_timestamp` only ever deleted.

## 4. Data compatibility
* Presets saved with the old `language` item / `isPro` flags / Pro widget keys keep working: unknown panel items are ignored by the free editor & renderer; feature keys are only rendered when present in `wapHelpers.features` (i.e. when Pro is loaded).
* Visitor preferences still store `selectedLanguage` (generic language preference); Pro reads/writes it via `SET_SELECTED_LANGUAGE`.
* Free `frontend/context/reducer.js` no longer pre-seeds Pro keys in `currentSettings`; all readers use `currentSettings[key] || {}`.

## 5. Pro plugin integration checklist (done in Pro 1.5.1)
1. `src/helpers/index.js`: import `feature-handlers.js` (`registerProFeatureHandlers()`, `announce`), `panel-extensions.js`, `main.scss` (fonts).
2. `src/components/index.js`: publish `PanelHeaderActions`, `FrontendExtensions`; import `main.scss`; add `wap-panel-header-dropdown` class on the dropdown root.
3. `src/admin/index.js`: local `menu-icons.js`; `registerControl('sidebarPromoCard', ProSidebarCard)`; LicenseManager dispatches `websac-extensions-changed`.
4. `Core\Enqueue`: enqueue `build/components/index.css` + `build/helpers/index.css`.
5. `Core\Integration`: hook the three new PHP filters.
6. New `Core\FixHighlight`, `Core\Migrations`; `assets/` added to `package.json` files; `composer dump-autoload -o`.
7. Requires free ≥ 1.5.2 (older free ignores the new slots → no translator button / no Pro widgets applied).
