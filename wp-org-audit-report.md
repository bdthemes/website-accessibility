# WordPress.org Re-Review Compliance Audit — One Accessibility (`website-accessibility` 1.5.2)

Audit date: 2026-08-17 · Reviewed tree: git `264f282` (main) + local `build/` (2026-08-16 17:00, verified current with `src/`) · Review ID `SVN website-accessibility/13Aug26`
Method: read every PHP file line-by-line; grep of `src/`, `build/*.js` (minified), `languages/*.pot`, `vendor/`, `default-posts/`, `readme.txt`; `php -l`; PHPCS 3.x + WPCS 3.1 (security/prefix/i18n sniffs) ; **Plugin Check 1.x via WP-CLI on the local site**; live HTTP checks of every URL cited in the readme. Changelog / commit messages / code comments were ignored as evidence.

---

## 1. Verdict table

| # | Reviewer issue | Verdict | One-line evidence |
|---|---|---|---|
| 1 | Trialware / locked features (GL 5) | ⚠️ **PARTIAL** | Profile gating itself is gone (0 hits for `isProActive`/`license`/`websac_profile` in `src/` **and** all three bundles; free profiles render unconditionally `src/frontend/view.js:10-13,42-45`). But the free UI still ships *locked-feature placeholders*: "Custom Profiles" + "Tools & Backup" menu entries → upsell pages (`includes/Admin/Menu.php:171-178,198-205`, `src/admin/pages/index.js:46,58`), and 4 preset-editor setting rows render a gold **PRO** badge in place of a control for attributes the free front end already honours (`src/admin/components/extension-control.js:18`; `layout`/`tooltipPosition`/`showBranding` read in `src/components/widget-features.js:157-158`, `panel-footer.js:35`). Plus stale `.pot` still contains `msgid "Activate License"` (`languages/website-accessibility.pot:1776`). |
| 2 | Phoning home without opt-in (GL 7 & 9) | ✅ **FIXED** | 0 `wp_remote_*`/`fetch_feed`/cURL in PHP; 0 hits for `remote_feed_link`, `bdthemes.io`, `product-feed`, `dashboard.bdthemes` in `src/`, `build/admin/index.js`, `build/components/index.js`, `build/frontend/frontend.js`, `.pot`. Only external request left = `fetch('https://api.dictionaryapi.dev/…')` (`src/classes/dictionary.js:177`), fired only on visitor double-click with the Dictionary tool on. No analytics/GA anywhere; usage stats POST only to own `websac/v1/usage-statistics`. |
| 3 | Undocumented external services (readme) | ⚠️ **PARTIAL** | `readme.txt:194-206` "External services" documents Free Dictionary API (what/when/data incl. IP+UA, service URL, GitHub source + LICENSE) and matches code 1:1. **But** the service publishes **no ToS/Privacy page** (verified live: `dictionaryapi.dev/{privacy,terms,privacy-policy}` → 403; homepage links only GitHub + PayPal) → **decision point** (see §3.4). Two wording inaccuracies ("English letters only" – no such filter; "nothing is sent while the tool is switched off" – broken by listener-leak bug `src/accessibilty-manager.js:178-180`). |
| 4 | Prefix consistency & uniqueness | ✅ **FIXED** (minor leftovers) | Single prefix `websac` on 100 % of PHP globals: namespace `Websac\`, class `Websac_Plugin`, fn `websac()`, var `$websac_autoload_file`, 7 × `WEBSAC_*` constants, options/meta/transients `websac_*`, hooks `websac_*`, handles `websac-*`, CPT `websac_preset`, REST `websac/v1`. `PLUGIN_FILE` gone (`website-accessibility.php:70-76`). WPCS `PrefixAllGlobals` (prefix `websac`) → 0 findings; Plugin Check `prefixing` → 0. Migration for the one renamed option exists (`Migrations.php:66-85`). Leftovers are non-global strings only (dead `remove_submenu_page(... 'accessibility_preset' / 'preset_profile')` `Menu.php:250-251`; shipped `README.md:143` says namespace `bdthemes\websiteaccessibility`). |

Tooling: `php -l` all 27 PHP files clean · Plugin Check: **0 code findings**; only dev-file warnings (`.editorconfig`, `.gitignore`, `.distignore`, `.github/`, `phpcs.xml.dist`, `CLAUDE.md`, `MIGRATION-NOTES.md`) — none of these ship in the plugin-zip output (`package.json "files"` list wins), but `README.md` + `package.json` *do* ship, see §4.6/§3 · WPCS security/prefix/i18n sniffs: 0 errors, 2 benign warnings (`Enqueue.php:102 file_get_contents` on a local upload, `Menu.php:62 base64_encode` for SVG data-URI).

---

## 2. Detailed findings

### Issue 1 — Trialware / locked features (Guideline 5)

**1.1 Grep sweep (PHP + JS + build):**

| term | `src/` | `build/admin` | `build/components` | `build/frontend` | `.pot` | notes |
|---|---|---|---|---|---|---|
| `license` / `licence` | 0 | 0 | 0 | 0 | **1** (`:1776 "Activate License"`) | stale pot only |
| `is_pro` / `isProActive` / `websacPro` / `LicenseContext` / `freemius` / `edd_` / `trial` / `quota` / `valid_key` / `websac_profile` | 0 | 0 | 0 | 0 | 0 | |
| `isProPluginActive` | 2 (`admin-layout.js:68`, `get-pro.js:126`) | 1 | 0 | 0 | 0 | only hides "Get Pro" menu item + promo card when Pro installed |
| `premium` | 1 (label "Premium support") | 1 | 0 | 0 | 1 | marketing text |
| `unlock` | 3 (marketing strings) | 3 | 0 | 0 | 1 | marketing text |
| `locked` | `lockedPanelScrollTopRef` (scroll lock) | 3 (antd vendor) | 3 (antd) | 0 | 0 | unrelated |
| `expire` | cookie strings | 4 | 4 (antd) | 0 | 0 | unrelated |
| `limit` | `statement-setting.js:43` (per_page) | vendor | vendor | 0 | 0 | unrelated |
| `profile` | built-in profiles (`src/utils/profiles.js`) | 55 | 32 | 3 | many | see 1.2 |
| `verify` | 0 | 0 | 0 | 0 | 0 | |
| `isDummy` / `screenReader` / `smartContrast` / `OpenDyslexic` / `virtualKeyboard` (former "dummy" gated widgets) | 0 | 0 | 0 | 0 | present | stale pot only |

**1.2 Custom-profile feature — removal completeness**
- PHP: `View\Frontend::get_profiles()` (`includes/View/Frontend.php:26-29`) is now `apply_filters('websac_frontend_profiles', [])` — no option/license read; `websac_profile` CPT no longer registered (`includes/Core/AccessibilityPreset.php:27` registers only `websac_preset`); no `websac_profile` in `vendor/composer/autoload_classmap.php`.
- JS: built-in profiles hard-coded `src/utils/profiles.js:11-80`; admin store `src/admin/store/index.js:263-278` `getProfiles()` = `[...defaultProfiles, ...(add-on store || [])]`, no flag; preset editor toggles enabled for all (`src/admin/settings/profiles-settings.js:81-109`); front end `src/frontend/view.js:42-45` + `src/components/accessibility-profiles.js:118-164` render/apply unconditionally.
- Bundles: `websac_profile`, `custom_profile`, `isProActive`, `websac/v1/license` → 0 hits in all three.
- ✅ The *gated data path the reviewer named* is fully removed and remaining profile code is unconditional.

**1.3 Locked-feature UI still present (why PARTIAL):**

| # | Location | What the user sees | Why a reviewer will read it as "locked" |
|---|---|---|---|
| a | `includes/Admin/Menu.php:171-178` submenu **"Custom Profiles"** (slug `website-accessibilityfiles`); `src/admin/components/admin-layout.js:177` sidebar item; `src/admin/pages/index.js:46` → `<ProfilesUpsell/>` (`src/admin/components/pro-upsell-page.js:43-53`) | Menu item named like a feature; page shows PRO badge + "This screen is part of the separate One Accessibility Pro plugin" + "Learn more about Pro" | Same feature the reviewer flagged, now presented as an in-product locked screen. GL 5 language: "features that are locked or 'greyed out'". Also `readme.txt:173` screenshot 4 = "Custom profile creation and management interface" describes the Pro screen. |
| b | `Menu.php:198-205` **"Tools & Backup"** (`website-accessibility-tools`); `admin-layout.js:193`; `pages/index.js:58` → `<ToolsUpsell/>` | Same pattern for export/import | idem |
| c | `src/admin/components/extension-control.js:10-19` renders `<WapBadge color="gold" count="PRO"/>` when no add-on control is registered. Slots: "Show Translator" (`src/admin/settings/header-settings.js:38-40`), "Show Branding" (`footer-settings.js:39-41`), "Layout" (`panel-items-settings.js:44-46`), "Tooltip Position" (`panel-items-settings.js:48-52`) | A labelled settings row whose control is a PRO badge | The free bundle **already implements** three of these attributes: `attributes.layout` (`src/components/widget-features.js:157`, `accessibility-profiles.js:110`), `tooltipPosition` (`widget-features.js:158,277`), `showBranding` (`src/components/panel-footer.js:35,255-257`). Working code + withheld control = the textbook "greyed-out" pattern. |
| d | `includes/View/Frontend.php:228-229` `echo '<div id="wap-google-translate-container"></div>'` on every page with the toolbar | Empty div for a Pro-only feature (translator) | Dead Pro-feature scaffolding in free; 0 JS references in any bundle. |
| e | `includes/Admin/Menu.php:250-251` `remove_submenu_page('website-accessibility','edit.php?post_type=preset_profile')` | dead code referencing the removed profile CPT under its pre-prefix name | Half-removed leftover (also prefix leftover). |
| f | `languages/website-accessibility.pot` (`Project-Id-Version … 1.5.1`, `POT-Creation-Date 2026-08-16T07:08`) still lists `"Activate License"` (:1776), `"Stay tuned — we will ship these in upcoming releases."` (:1772), `"Screen Reader"` (:757), `"…unlock premium widgets, translation…"` (:1592) | n/a (file) | A reviewer grepping "license" over the zip hits it. `Report-Msgid-Bugs-To` even points at `…/plugin/wporg-compliance` (generated inside a worktree named that way). |

**1.4 Other feature gating / caps / time limits:** none. No `Date`-based checks except tour timeout & preset dates; no "max N presets"; `websac_usage_statistics_max_keys` (5000) is an abuse cap on anonymous writes, not a feature cap. Upsell links (`https://oneaccessibility.com#pricing`, `bdthemes.com/*`) are plain `<a>`/`href` (`src/admin/pages/get-pro.js:128-130,168,230`, `pro-upsell-page.js:11,34`, `about-info.js:8-9,145,156`, `admin-layout.js:24,29`).

### Issue 2 — Phoning home (Guidelines 7 & 9)

**2.1 Outbound inventory (complete):**

| Kind | Where | Trigger | Class |
|---|---|---|---|
| PHP `wp_remote_*`, `wp_safe_remote_*`, `fetch_feed`, `SimplePie`, `download_url`, `curl_*`, `file_get_contents(http…)` | — | — | **(a) none exist** (`Enqueue.php:102 file_get_contents($file)` reads a local upload) |
| `fetch('https://api.dictionaryapi.dev/api/v2/entries/en/${word}')` | `src/classes/dictionary.js:177` → `build/frontend/frontend.js` (`…entries/en/${e}`) | Dictionary tool enabled in toolbar → `document.addEventListener('dblclick')` (`dictionary.js:28-30`) → visitor double-clicks a single word → `showPopup()` → `getMeaning()` | **(c) user-initiated** ✅ — nothing on page load |
| `fetch(${restUrl}websac/v1/usage-statistics)` | `src/frontend/view.js:263-275` | 1 s after a visitor toggles a feature, only if `settings.show_usage_statistics` (`view.js:289`) | internal (own site) |
| `fetch(${apiUrl}websac/v1/dashboard-tour/complete)` | `src/admin/context/dashboard-tour-context.js:20-38` | admin finishes tour | internal |
| `apiFetch` → `websac/v1/{settings,preference,system-info,usage-statistics}`, `wp/v2/{search,pages}`, core-data `websac_preset` | `src/admin/pages/*.js`, `src/components/panel-footer.js:129,152,180`, `src/admin/store/index.js` | admin page load / save | internal |
| `XMLHttpRequest` ×2 in `build/components/index.js` | antd `rc-upload` vendor code (media upload to own site) | — | internal / vendor |
| External `<script>`/`<link>`/`<img>`/iframe/Google Fonts/CDN in JS, SCSS, `build/**/*.css`, `default-posts/*.json` | 0 (`url(http`, `@import`, `googleapis`, `gstatic`, `unpkg`, `jsdelivr`, `cdnjs` → 0 hits) | — | none |
| Analytics / telemetry (`gtag`, `ga(`, `google-analytics`, `mixpanel`, `hotjar`, `sentry`, `sendBeacon`, `new Image(`) | 0 hits src + bundles | — | none ✅ |

**2.2 Both ends of the removed feed:** PHP end — no `remote_feed_link` / `product-feed` / `bdthemes.io` in `website-accessibility.php` or `includes/` (localized array is now `Enqueue.php:264-277`, keys: version, apiUrl, homeUrl, siteName, adminEmail, nonce, proUpgradeUrl, shouldAutoStartDashboardTour, brand*). JS end — 0 hits in `src/` and all three bundles; the "News & Updates" widget component does not exist in `build/admin/index.js` (`rss` / `feed` → 0). Migration deletes the old cache: `Migrations.php:84 delete_transient('websac_product_feeds')`.

**2.3 Residual concerns (not GL 7/9 violations, but adjacent):**
- **Listener leak** — `src/accessibilty-manager.js:173-180`: `applyDictionary()` calls `dictionary().apply()` and `removeDictionary()` calls `dictionary().remove()`; `dictionary` is a factory (`dictionary.js:212 const dictionary = () => new Dictionary()`), so `remove()` runs on a *new* instance and never detaches the original `dblclick` handler (bound per instance, `dictionary.js:6`). After a visitor switches the tool off, a double-click still fires the external request until reload. Contradicts `readme.txt:201`.
- Word is interpolated raw into the URL (no `encodeURIComponent`, no `/^[a-z]+$/i` filter) — readme claims "English letters only".
- `websac_browser_key` cookie (`src/utils/use-browser-key.js:13-19`) — a 1-year persistent visitor identifier set on **every** page with the toolbar, unconditionally (`src/frontend/view.js:18`), even when `show_usage_statistics` is off. First-party, never leaves the site, but reviewers/GDPR-minded users may ask; readme does not mention it.

### Issue 3 — External services documentation

**3.1 Definitive list after cleanup:** exactly one — **Free Dictionary API** (`https://api.dictionaryapi.dev/api/v2/entries/en/{word}`).

**3.2 readme section** `readme.txt:194-206` covers: what it is/why (:200), what data + when incl. IP & UA (:201), service site (:202), source + license (:203), ToS/Privacy statement (:204 — explains none exist), opt-out (:204), Pro disclaimer (:206). ✅ structure complete.

**3.3 Cross-check:** code→readme: dictionaryapi.dev ✓ documented; readme→code: nothing documented that no longer exists (bdthemes feed correctly absent). ✅

**3.4 Live URL check (the reviewer will click these):**

| URL cited | HTTP | Content |
|---|---|---|
| `https://dictionaryapi.dev/` | 200 | one-page site: usage example, links only to GitHub + PayPal donate; **no Terms, no Privacy** |
| `https://github.com/meetDeveloper/freeDictionaryAPI` | 200 | source repo |
| `…/blob/master/LICENSE` | 200 | GPL-3.0 |
| `https://dictionaryapi.dev/privacy`, `/terms`, `/privacy-policy` | 403 | do not exist |
| `https://api.dictionaryapi.dev/api/v2/entries/en/hello` | 200 | API alive |

**⛔ DECISION POINT (Issue 3.4):** dictionaryapi.dev has no ToS or Privacy Policy. WP.org's external-services rule asks for links to both; the current readme discloses their absence honestly (`:204`). Options (pick one before Phase 2):
1. **Keep as-is (document absence)** — cheapest; some reviewers accept "open-source, no policy published, source linked". Risk: the same reviewer already flagged this service and may insist on a policy link.
2. **Make Dictionary strictly opt-in for the *site owner*** — ship the `dictionary` feature *disabled by default* in `default-posts/preset.json` and add an admin note "uses third-party API, see readme". Reduces exposure; readme unchanged otherwise.
3. **Self-host / bundle a wordlist** — no external service at all; drop the External-services section. Most work, zero review risk. (A ~10k-entry English JSON is ~1 MB; could be lazy-loaded from `build/`.)
4. **Drop the Dictionary feature** from free (move to Pro) — zero risk, loses a feature.
Recommendation: **1 + fix the two accuracy bugs (§2.3)**, and if the reviewer pushes back, fall to 3. Whatever is chosen, fix the wording so every sentence in `:201` is literally true.

### Issue 4 — Prefix consistency & uniqueness

**4.1 Global-namespace inventory (PHP + related):**

| Category | Identifiers | File:line |
|---|---|---|
| Namespace | `Websac\` (`Admin`, `Core`, `Routes`, `Traits`, `View`) | `includes/**` |
| Global class | `Websac_Plugin` | `website-accessibility.php:33` |
| Global function | `websac()` | `website-accessibility.php:260` |
| Global variable | `$websac_autoload_file` | `website-accessibility.php:24` |
| Constants | `WEBSAC_VERSION`, `WEBSAC_NAME`, `WEBSAC_PLUGIN_FILE`, `WEBSAC_URL`, `WEBSAC_DIR`, `WEBSAC_INCLUDES_DIR`, `WEBSAC_BUILD_DIR` | `website-accessibility.php:70-76` |
| Options | `websac_version`, `websac_data_schema_version`, `websac_installed_time`, `websac_do_activation_redirect`, `websac_settings`, `websac_usage_statistics`, `websac_dashboard_tour_completed` | `website-accessibility.php:88-149`; `Migrations.php:15-16`; `SettingsRouteV1.php:15`; `UsageStatisticsRouteV1.php:15`; `DashboardTourRouteV1.php:20` |
| Transients | `websac_preference_stats` (+ legacy delete `websac_product_feeds`) | `PreferenceRouteV1.php:14`; `Migrations.php:84` |
| User meta | `websac_preferences` | `PreferenceRouteV1.php:13` |
| CPT | `websac_preset` | `AccessibilityPreset.php:27` |
| REST | `websac/v1/{settings,preference,usage-statistics,system-info,dashboard-tour/complete}` | `includes/Routes/*.php` |
| Hooks fired | `websac_plugins_loaded`, `websac_default_preset_content`, `websac_settings_defaults`, `websac_sanitize_settings`, `websac_public_frontend_settings`, `websac_brand_display_name`, `websac_hide_admin_menus`, `websac_admin_localized_data`, `websac_admin_script_dependencies`, `websac_frontend_localized_data`, `websac_frontend_profiles`, `websac_force_frontend_components_assets`, `websac_frontend_after_root`, `websac_pro_admin_menu`, `websac_system_info`, `websac_usage_statistics_features`, `websac_usage_statistics_max_keys`, `websac_feature_category_definitions` | all `websac_*` |
| Script/style handles | `websac-admin`, `websac-components`, `websac-frontend`, `websac-frontend-custom-css` | `Enqueue.php:243,290`; `Frontend.php:96,104,129,148,156` |
| Localized JS objects | `websacAdmin`, `websiteAccessibility`, `websacCssOverridesCodeEditor` | `Enqueue.php:257,287`; `Frontend.php:188` |
| Cookies | `websac_browser_key`, `websac_daily_timestamp` (+ legacy cleanup `one_accessibility_*`) | `src/utils/use-browser-key.js`; `src/admin/pages/settings.js:22-29` |
| AJAX / shortcodes / cron / DB tables / `register_setting` | **none** | — |
| Admin menu slugs (`?page=`) | `website-accessibility`, `-presets`, `-settings`, `-css-overrides`, `-tools`, `-about`, `-presets-create/-edit/-preview`, `-get-pro`, **`website-accessibilityfiles`** | `Menu.php:141-241` — plugin-slug based, acceptable; last one is a botched `-profiles` |
| DOM ids / body classes | `#website-accessibility-app`, `#website-accessibility-admin`, `#wap-google-translate-container`, `#wap-admin-menu-icon`, `.wap`, `.wap-frontend`, `.wap-admin`, `.wap-admin-root-menu` | `Frontend.php:227-229`, `Menu.php:38,81,257`, `website-accessibility.php:165,205` — CSS/DOM, not global PHP identifiers |
| Composer autoloader | `ComposerAutoloaderInit<hash>`, `ComposerStaticInit<hash>`, `Composer\Autoload\ClassLoader` | `vendor/composer/*` — standard, generally accepted |

**4.2 Standardised prefix:** `websac` (6 chars, distinctive, not `wp_`). WPCS `WordPress.NamingConventions.PrefixAllGlobals` with `prefixes=websac` → **0 findings**; Plugin Check `prefixing` → 0. ✅ 100 % of true globals.

**4.3 `PLUGIN_FILE`:** removed. `website-accessibility.php:70-76` defines only `WEBSAC_*`. `grep -r PLUGIN_FILE` → only `WEBSAC_PLUGIN_FILE` and readme changelog. ✅

**4.4 Renamed keys & migration:** diff `31ef45d` (1.4.1) → HEAD: option `one_accessibility_usage_statistics` → `websac_usage_statistics` — migrated + old key deleted (`Migrations.php:66-81`, schema v5). REST `one-accessibility/v1`, `sigmally/v1` → `websac/v1` (no data; all JS callers updated — `grep` shows only `websac/v1/*` in bundles). Cookie `one_accessibility_browser_key` → `websac_browser_key` (carried over, `use-browser-key.js:13`). `websac_settings`, `websac_preset`, `websac_preferences`, `websac_version` etc. were already prefixed → no migration needed. White-label / license options moved to Pro (Pro's own migration). ✅ No user data loss.

**4.5 Uninstall / cleanup:** no `uninstall.php`, no `register_uninstall_hook` — nothing references old names, but nothing is cleaned either (options `websac_*`, user meta `websac_preferences`, CPT posts, statement page). Not a rejection cause; see New risks.

**4.6 Stray leftovers (non-global, cosmetic):**
- `includes/Admin/Menu.php:250-251` `remove_submenu_page(... 'edit.php?post_type=accessibility_preset')` / `'preset_profile'` — dead references to pre-prefix CPT names.
- `includes/Admin/Enqueue.php:303-327` `is_plugin_page()` / `get_current_page()` — unused, hook-name strings `accessibility_page_website-accessibilityfiles`.
- `README.md:143` "**Namespace**: `bdthemes\websiteaccessibility`" — stale, and **`README.md` ships in the zip** (npm-packlist always includes README*).
- `package.json` (also shipped): `"description": "Example block scaffolded with Create Block tool"`, `"author": "The WordPress Contributors"`, `"version": "1.0.0"`.
- JS `localStorage` keys `accessibilityDisclaimerDismissed` (`src/admin/components/disclaimer.js:31,37`), `websiteAccessibilityLocalPreferences-*` (`src/frontend/context/reducer.js:65`); front-end body classes `one-accessibility-feature-<key>-<val>` / `one-accessibility-feature-profile-<id>` (`src/frontend/view.js:200,204`); localized JS object `websiteAccessibility` (`Frontend.php:188`) — browser-side names, not PHP globals; low. (JS globals `wapAdmin`/`wapComponents`/`wapHelpers`/`websacAdminExtensions`/`websacFeatureHandlers` are documented convention.)
- Migration gap (cosmetic): 1.4.1 also set transient `websac_product_feeds_rss` (old `Admin_Feeds.php:123`); `Migrations.php:84` deletes only `websac_product_feeds`. Expires on its own (≤ 6 h) — add one `delete_transient` line for completeness.
- Legacy cookie `one_accessibility_browser_key` is read as fallback (`src/utils/use-browser-key.js:13`) but never removed after carry-over.

### Issue 5 — Same-nature sweep & readiness

**5.1 Sweep** — repeated over `build/*.js` (minified), `.pot`, `vendor/`, `default-posts/`, `readme.txt` — results folded into tables above; no additional gating/phone-home/prefix instances.

**5.2 Security pass** (full details from line-by-line read):

| Sev | Finding | Evidence |
|---|---|---|
| MED | Missing `ABSPATH` guard | `includes/View/Frontend.php:1-8` (direct hit → fatal "Trait not found" → error output when `display_errors` on); `includes/Core/Utils.php:1-8`. All other plugin PHP files guarded (`website-accessibility.php:21`, `Enqueue.php:15`, `Menu.php:12`, `AccessibilityPreset.php:11`, `Migrations.php:7`, `Singleton.php:4`, all 5 routes). Vendor/composer + `build/*.asset.php` unguarded (standard, tolerated). |
| MED | Public REST write with `permission_callback => '__return_true'` | `UsageStatisticsRouteV1.php:83-86` POST `/usage-statistics`. Nonce is verified *inside* the callback (`:213-214`) rather than in `permission_callback`; every request rewrites `websac_usage_statistics` (`:273`) → 5000 keys × days re-serialised per anonymous hit; no per-IP throttle. Reviewers grep for `__return_true`. |
| MED | SVG upload enabled without sanitizer | `Enqueue.php:30-34,41-83` (`upload_mimes` + `wp_check_filetype_and_ext`), gated `is_admin() && manage_options`; comment `:42-45` admits no sanitisation. Common reviewer note (stored XSS via `image/svg+xml`, multisite admin ≠ super-admin). |
| LOW | Unvalidated REST arg stored | `PreferenceRouteV1.php:55-57` `'data' => ['required'=>true]` no `type`/`sanitize_callback` → `:189-191 update_user_meta(...,'websac_preferences',$preferences)` (own meta only, any logged-in user, unbounded size). |
| LOW | Inline `<script>`/`<style>` echoed | `website-accessibility.php:226` `echo '<script>…' . wp_json_encode(...)` (should be `wp_print_inline_script_tag`); `Menu.php:80-123` `<style>` on `admin_head` for **all** admin pages with `<?php echo wp_json_encode($icon) ?>` inside `url()` (should be `wp_add_inline_style`). Data is safely encoded; style/likely-flag only. |
| LOW | Admin bundle on every admin page | `Enqueue.php:242-294` enqueues `websac-admin` JS+CSS and localizes `admin_email` + `wp_rest` nonce on all `admin_enqueue_scripts` (no `$hook_suffix` check); `is_plugin_page()` unused. Performance/hygiene + minor info exposure (`adminEmail` to any wp-admin user). |
| LOW | Activation `$wp_filesystem` null-unsafe | `website-accessibility.php:114-121,138-139` — fatal on activation if `WP_Filesystem()` needs credentials. |
| LOW | Non-i18n strings | `PreferenceRouteV1.php:181,198,213,224`; `Migrations.php:411-478` category titles stored untranslated. |
| OK | Input | only `$_GET` isset/`sanitize_text_field(wp_unslash())` in `Utils.php:83-124` (builder detection, read-only) + `website-accessibility.php:247` (`isset` after `manage_options`); no `$_POST/$_REQUEST/$_SERVER/$_FILES`. |
| OK | Output | all dynamic output via `wp_json_encode`, `wp_localize_script`, `rest_ensure_response`, `wp_add_inline_style`; custom CSS `wp_strip_all_tags` + 512 KB cap (`SettingsRouteV1.php:158-164`). |
| OK | Caps/nonces | menu, settings, tour, system-info, stats GET/DELETE = `manage_options`; `/preference` = `is_user_logged_in()` with `?stats=true` re-gated to `manage_options` (`PreferenceRouteV1.php:100-107`); CPT write caps → `manage_options` (`AccessibilityPreset.php:45-58`); `wp_create_nonce('wp_rest')` ↔ `wp_verify_nonce(...,'wp_rest')`. No AJAX/admin-post handlers. |
| OK | Dangerous fns | no `eval`, `base64_decode`, `create_function`, `unserialize`, `$wpdb` raw SQL, remote include, `exec`. |

**5.3 Human-readable code:** `build/{admin,components}/index.js`, `build/frontend/frontend.js` are minified. `src/` is **not shipped** (`package.json "files"` list omits it; `.distignore` also lists `src`), and `readme.txt` has **no link to a public source repository** (only third-party lib links + Patchstack VDP). GitHub `bdthemes/website-accessibility` returns 404 anonymously (private). ❌ Must add a public repo URL (or ship `src/`).

**5.4 Headers & readme:** `Version: 1.5.2` (`website-accessibility.php:8`) = `Websac_Plugin::VERSION` (`:42`) = `Stable tag: 1.5.2` (`readme.txt:7`) ✅ · `Tested up to: 7.0` (local WP 7.0.4) ✅ · `Requires at least: 6.1`, `Requires PHP: 7.4` ✅ · `License: GPL-2.0-or-later` + URI in both ✅ · changelog `= 1.5.2 – August 16, 2026 =` present ✅ · `Contributors:` list ✅ · readme screenshot 4 (`:173`) describes a Pro-only screen ⚠️.

**5.5 Tool output:**
```
php -l  → 27 files, "No syntax errors" for all
Plugin Check (wp plugin check website-accessibility, all checks incl. plugin_review_phpcs, plugin_readme,
  prefixing, late_escaping, direct_file_access, enqueued_resources, i18n_usage, plugin_uninstall,
  minified_files, offloading_files, trademarks, external_admin_menu_links …):
  ERROR   .editorconfig  hidden_files
  ERROR   phpcs.xml.dist application_detected
  WARNING .gitignore / .distignore hidden_files ; .github github_directory ;
          MIGRATION-NOTES.md / CLAUDE.md unexpected_markdown_file
  → 0 findings in PHP/readme/JS. (All flagged files are dev files not in the plugin-zip output.)
PHPCS WordPress-Extra, sniffs EscapeOutput/ValidatedSanitizedInput/NonceVerification/PreparedSQL/
  DirectDatabaseQuery/AlternativeFunctions/EnqueuedResources/GlobalVariablesOverride/DevelopmentFunctions/
  DiscouragedPHPFunctions/PrefixAllGlobals(websac)/I18n/SafeRedirect/DeprecatedFunctions/Capabilities:
  0 errors, 2 warnings (Enqueue.php:102 file_get_contents; Menu.php:62 base64_encode)
PHPCS phpcs.xml.dist (project security ruleset): clean
PHPCompatibilityWP testVersion 7.4-: clean
PHPCS WordPress-Extra full: 4331 errors / 96 warnings — all formatting (space-indent, brace style,
  Yoda, short arrays, snake_case vars, file naming); zero security/prefix. Not review-blocking.
```

---

## 3. New risks (not in the review email, plausible next round)

| Pri | Risk | Where | Guideline |
|---|---|---|---|
| **P1** | Locked-feature UI: "Custom Profiles"/"Tools & Backup" upsell screens + PRO-badge setting rows for attributes the free code already honours | §1.3 a–c | GL 5 (crippleware) — *same nature* as the original finding → highest risk of permanent closure |
| **P1** | No public source for minified bundles | §5.3 | GL 4 (human-readable code) |
| **P1** | Dictionary listener leak makes readme statement false; word not encoded | §2.3 | GL 7/9 accuracy + readme accuracy |
| **P2** | Missing ABSPATH guards (`Frontend.php`, `Utils.php`) | §5.2 | security checklist |
| **P2** | `__return_true` on public write route; nonce not in `permission_callback`; no throttle | §5.2 | security |
| **P2** | SVG upload enablement without sanitiser | §5.2 | security |
| **P2** | Stale `.pot` with "Activate License" etc.; wrong `Report-Msgid-Bugs-To` | §1.3 f | GL 5 grep hit |
| **P2** | Shipped `README.md:143` "namespace bdthemes\websiteaccessibility"; shipped `package.json` scaffold metadata | §4.6 | prefix / professionalism |
| **P3** | `#wap-google-translate-container` dead div; dead `remove_submenu_page` for `preset_profile`; unused `is_plugin_page()` | §1.3 d–e, §4.6 | dead code |
| **P3** | Admin bundle + `adminEmail` localized on every wp-admin screen | §5.2 | performance / minor disclosure |
| **P3** | Inline `<script>`/`<style>` via `echo` | §5.2 | best practice |
| **P3** | 1-year `websac_browser_key` cookie set for all visitors regardless of stats setting; not mentioned in readme | §2.3 | privacy transparency |
| **P3** | No `uninstall.php` | §4.5 | commonly requested |
| **P3** | `readme.txt:173` screenshot 4 describes Pro-only screen; `:201` "phonetic spelling / pronunciation audio" not what code does (uses local SpeechSynthesis) | readme | accuracy |
| **P3** | `PreferenceRouteV1` `data` arg untyped/unbounded | §5.2 | sanitisation |

---

## 4. Prioritised remediation plan (Phase 2 — after approval)

| # | Change | File(s) | Satisfies |
|---|---|---|---|
| R1 | **Remove locked-feature placeholders.** Delete "Custom Profiles" (`website-accessibilityfiles`) and "Tools & Backup" submenus + sidebar items + `ProfilesUpsell`/`ToolsUpsell` routes; let Pro register those slugs via existing `websac_pro_admin_menu` + `registerPage`. Keep only the single "Get Pro" page/card. Delete `pro-upsell-page.js` + `_pro-upsell.scss`. | `includes/Admin/Menu.php:170-178,198-205`, `src/admin/components/admin-layout.js:177,193`, `src/admin/pages/index.js:46,58`, `src/admin/components/pro-upsell-page.js`, `src/admin/styles/pages/_pro-upsell.scss`, `Enqueue.php:303-327` (delete dead helpers) | GL 5 |
| R2 | **PRO-badge rows:** change `ExtensionControl` to render **nothing** when no add-on control is registered, and drop the four `<ControlWrapper>` rows (or, better for users: implement real free controls for `layout` / `tooltipPosition` since the free front end already supports them). | `src/admin/components/extension-control.js`, `src/admin/settings/header-settings.js:38-40`, `footer-settings.js:39-41`, `src/admin/components/panel-items-settings.js:44-52` | GL 5 |
| R3 | Remove dead Pro scaffolding: `#wap-google-translate-container` echo; `remove_submenu_page(... accessibility_preset / preset_profile)`; add `delete_transient('websac_product_feeds_rss')` to `migrate_legacy_option_keys()` (bump nothing — run it in a tiny v6 step or inline in the existing v5 block for fresh upgraders); remove legacy cookie after carry-over. | `includes/View/Frontend.php:228-229`, `includes/Admin/Menu.php:249-251`, `includes/Core/Migrations.php:83-84`, `src/utils/use-browser-key.js:13-19` | GL 5 / prefix |
| R4 | **Dictionary fixes:** make `Dictionary` a singleton (module-level instance) so `remove()` detaches the real listener; guard `apply()` against double-binding; `encodeURIComponent(word)` + `/^[A-Za-z'-]{1,64}$/` check before fetch (matches readme). | `src/classes/dictionary.js:211-212,177,28-30`, `src/accessibilty-manager.js:173-180` | GL 7/9, readme accuracy |
| R5 | **readme External services:** per decision in §3.4. At minimum: fix ":201" wording to match code, drop "pronunciation audio/phonetic" claim, mention `websac_browser_key` first-party cookie under a short "Cookies / local storage" note. | `readme.txt:194-206` | readme |
| R6 | **Public source:** add "Source code: https://github.com/bdthemes/website-accessibility (make repo public) — unminified JS in `src/`" to readme (Description or a `== Source ==` section); alternatively add `"src"` to `package.json "files"` and drop it from `.distignore`. | `readme.txt`, `package.json` | GL 4 |
| R7 | Add `if ( ! defined( 'ABSPATH' ) ) { exit; }` | `includes/View/Frontend.php:3`, `includes/Core/Utils.php:3` | security |
| R8 | Usage-stats POST: move nonce check into a `permission_callback` (`wp_verify_nonce($request->get_header('X-WP-Nonce'),'wp_rest')`), add a per-`browserKey` transient throttle (e.g. 1 write / 30 s), keep cap. | `includes/Routes/UsageStatisticsRouteV1.php:83-86,208-219` | security |
| R9 | SVG upload: either remove the `upload_mimes` enablement (rely on site's own SVG plugin) or add a sanitiser (e.g. `enshrined/svg-sanitize` vendored) on `wp_handle_upload_prefilter`. Recommend removal (Icon picker still accepts already-uploaded SVGs). | `includes/Admin/Enqueue.php:30-34,41-133` | security |
| R10 | Regenerate `.pot` from a checkout named `website-accessibility` (fixes `Report-Msgid-Bugs-To`), commit; ensure CI `make-pot` runs before zip (already does). | `languages/website-accessibility.pot` | GL 5 grep hygiene |
| R11 | Fix shipped metadata: `README.md:143` namespace → `Websac\`; `package.json` name/description/author/version → real values (`1.5.2`); add `CLAUDE.md`, `wp-org-audit-report.md` to `.distignore` (npm-packlist already excludes them, but keep both mechanisms consistent). | `README.md`, `package.json`, `.distignore` | prefix / hygiene |
| R12 | Enqueue admin bundle only on plugin screens (`preg_match('/website-accessibility/', $hook_suffix)` gate around `wp_enqueue_script/style` + `wp_localize_script`); drop `adminEmail` from localized data if unused (grep: used by statement generator → keep, but only on plugin pages). | `includes/Admin/Enqueue.php:188-294` | performance |
| R13 | Replace `echo '<script>…'` with `wp_print_inline_script_tag()` and admin `<style>` with `wp_add_inline_style('websac-admin', …)` (or a tiny registered handle). | `website-accessibility.php:219-227`, `includes/Admin/Menu.php:76-125` | best practice |
| R14 | `PreferenceRouteV1`: add `'type' => 'object'`, `sanitize_callback` (recursive `sanitize_text_field` / bool / int), size cap. | `includes/Routes/PreferenceRouteV1.php:55-57,174-191` | sanitisation |
| R15 | Add `uninstall.php` deleting `websac_*` options, `websac_preferences` user meta, `websac_preset` posts, transient; guard `WP_UNINSTALL_PLUGIN`. | new `uninstall.php` (+ add to `package.json "files"`) | hygiene |
| R16 | readme: fix screenshot 4 caption (`:173`); i18n the 4 REST error strings; guard `$wp_filesystem` null in activation (fallback `file_get_contents` on bundled JSON is acceptable for plugin's own files). | `readme.txt`, `PreferenceRouteV1.php`, `website-accessibility.php:114-146` | polish |
| R17 | Bump to **1.5.3** (header, `VERSION`, Stable tag, changelog entry describing R1–R16). | `website-accessibility.php:8,42`, `readme.txt:7,210` | headers |

---

## 5. Pre-submission checklist

**A. Clean-install test (`WP_DEBUG=true`, `WP_DEBUG_LOG=true`, `SCRIPT_DEBUG=true`)**
1. Fresh WP 7.0.x, default theme, **only** this plugin (Pro NOT installed). Install from the CI-built zip (`npm run publish`), not from git.
2. Activate → expect redirect to `admin.php?page=website-accessibility`; `debug.log` empty; options `websac_version=1.5.3`, `websac_data_schema_version=5`, one `websac_preset` post, statement page created.
3. Visit every admin screen (Dashboard, Presets, Create/Edit/Preview, Settings, CSS Overrides, About, Get Pro): no PHP notices, no JS console errors, no "PRO" badges next to empty controls, no menu item that opens an upsell-only screen (after R1/R2).
4. Network tab on Dashboard load: only same-origin requests (`/wp-json/websac/v1/*`, `/wp-json/wp/v2/*`). Zero third-party hosts.
5. Front end: toolbar renders; toggle features; enable Dictionary → double-click word → one request to `api.dictionaryapi.dev`; disable Dictionary → double-click → **no** request (R4). Check `websac_browser_key` cookie behaviour matches readme.
6. Upgrade path: install 1.4.1 with data, upgrade to 1.5.3 → presets intact, `one_accessibility_usage_statistics` gone, `websac_usage_statistics` present.
7. Non-admin user (Subscriber/Editor): no plugin menu, `POST /wp-json/wp/v2/websac_preset` → 403, `GET /wp-json/websac/v1/settings` → 403.
8. Deactivate + delete (after R15): options/meta/posts removed.
9. Direct-access smoke: `curl https://site/wp-content/plugins/website-accessibility/includes/View/Frontend.php` → blank/`exit` (R7).

**B. Static checks before tagging**
- `php -l` all files · `phpcs --standard=phpcs.xml.dist` clean · `wp plugin check website-accessibility` on the **built zip** → 0 errors (dev-file warnings vanish when checking the zip) · grep the zip contents for `license|licence|bdthemes\.io|remote_feed|product-feed|isProActive|PLUGIN_FILE|bdthemes\\websiteaccessibility|preset_profile|wap-google-translate` → 0 hits (except readme changelog history).
- Confirm every URL in `readme.txt` "External services" returns 200 (`curl -I`).
- Confirm public GitHub repo (or `src/` in zip) is reachable anonymously.

**C. SVN steps**
1. `svn co https://plugins.svn.wordpress.org/website-accessibility svn-wa && cd svn-wa`
2. Unzip the CI artifact over `trunk/` (`rsync -a --delete --exclude=.svn website-accessibility/ trunk/`); `svn add --force trunk`; `svn st | grep '^!' | awk '{print $2}' | xargs -r svn rm`.
3. Verify `trunk/readme.txt` `Stable tag: 1.5.3` and `trunk/website-accessibility.php` `Version: 1.5.3` match; `svn diff --summarize` — ensure no `src/`, `node_modules/`, `.github/`, `CLAUDE.md`, `MIGRATION-NOTES.md`, `phpcs.xml.dist`, dot-files, `wp-org-audit-report.md`.
4. `svn cp trunk tags/1.5.3` ; `svn ci -m "1.5.3 – WordPress.org re-review fixes (guidelines 4,5,7,9; prefix; security hardening)"`.
5. Update `assets/` (wp.org banners/screenshots) only if screenshot 4 changed.
6. Reply to the review e-mail (Review ID `SVN website-accessibility/13Aug26`) quoting: commit rev, per-issue summary (removed profile gating + placeholders; zero outbound calls except documented, user-triggered Dictionary API; readme External-services + source link; single `websac` prefix, `PLUGIN_FILE` removed with migration), and Plugin Check output.

---

## 6. Phase 2 — remediation applied (2026-08-17)

Free plugin bumped to **1.5.3** (`website-accessibility.php`, `Websac_Plugin::VERSION`, `readme.txt` Stable tag + changelog, `package.json`). Pro bumped to 1.5.2 (`changelog.txt`).

| Plan item | Status | What changed |
|---|---|---|
| R1 locked-feature placeholders | ✅ | `Menu.php`: "Custom Profiles" + "Tools & Backup" submenus removed; `admin-layout.js` sidebar items removed; `pages/index.js` cases removed; `pro-upsell-page.js` + `_pro-upsell.scss` deleted; dashboard "Custom Profiles" card only when an add-on registers a profiles store. **Pro** now registers both submenus (`includes/Admin/Menu.php`) and sidebar items (`src/admin/index.js`, with `data-tour="wap-tour-profiles-item"`). |
| R2 PRO-badge rows | ✅ | `extension-control.js` renders **nothing** without a registered add-on control (label passed in, wraps `ControlWrapper` only when a control exists); header card hidden via `hasExtensionControl()`. |
| R3 dead scaffolding | ✅ | `#wap-google-translate-container` echo removed from free (`Frontend.php`); **Pro** prints it in `Integration::print_checker_root()`; dead `remove_submenu_page(... accessibility_preset/preset_profile)` removed; migration v6 purges `websac_product_feeds(_rss)`; legacy `one_accessibility_browser_key` cookie removed after carry-over. |
| R4 dictionary | ✅ | `dictionary.js`: module singleton, `apply()` idempotent, `remove()` detaches the real listener; word must match `/^[A-Za-z][A-Za-z'’-]{0,63}$/`; `encodeURIComponent()`; verified in `build/frontend/frontend.js`. |
| R5 readme | ✅ | External-services section rewritten to match code exactly; new "Source code" section; FAQ (dictionary, usage statistics + cookie) fixed; Pro-only bullets marked; screenshot 4 caption fixed; changelog 1.5.3. |
| R6 source | ✅ | `src/` added to `package.json "files"` (ships in zip); repo URL in readme + package.json `repository`. **Action for you:** make `github.com/bdthemes/website-accessibility` public (currently 404 anonymously) or drop that sentence. |
| R7 ABSPATH | ✅ | `Frontend.php`, `Utils.php`. |
| R8 stats endpoint | ✅ | `permission_callback` = `can_save_statistics()` (feature enabled + `wp_verify_nonce`), `browserKey` arg validated `^[A-Za-z0-9_-]{1,64}$`, 5 s per-key transient throttle. Verified: valid → 200, no nonce → 403, bad key → 400, repeat → throttled. |
| R9 SVG upload | ✅ | All `upload_mimes` / `wp_check_filetype_and_ext` / SVG metadata filters removed from `Enqueue.php`. |
| R10 pot | ✅ | Regenerated (`Project-Id-Version 1.5.3`, correct `Report-Msgid-Bugs-To`, 0 hits for license/screen-reader strings). Note: `wp i18n make-pot` needs `memory_limit ≥ 512M` locally (`php -d memory_limit=1G …`). |
| R11 metadata | ✅ | `README.md` namespace fixed; `package.json` name/description/author/version/repository; `.distignore` excludes `CLAUDE.md`, audit report, `.claude`; `src` no longer excluded. |
| R12 admin assets | ✅ | `Enqueue::is_plugin_screen()` gate; dead `is_plugin_page()/get_current_page()` removed. |
| R13 inline output | ✅ | `wp_print_inline_script_tag()` in main file; menu-icon CSS via registered handle `websac-admin-menu-icon` + `wp_add_inline_style()`. |
| R14 preference arg | ✅ | `validate_callback` (object, ≤ 64 KB) + recursive `sanitize_callback` (case-preserving keys, tag/control-char-stripped leaves, depth ≤ 8). Front end now persists only profile `{id,name}` and restores the canonical profile definition (`view.js`, `panel-footer.js`). |
| R15 uninstall | ✅ | `uninstall.php` (options, transients incl. throttle keys, `websac_preferences` user meta, `websac_preset` posts; multisite-aware). Statement page intentionally kept (user content). |
| R16 polish | ✅ | REST strings i18n'd; `Utils::read_bundled_json()` with `WP_Filesystem` → local-read fallback (no null deref on activation). |
| R17 version | ✅ | 1.5.3 everywhere. |
| Decision (Issue 3) | chosen: **option 1** | Honest disclosure kept + code made to match the wording; Dictionary remains available (site owner can remove it from the preset). Flip `default-posts/preset.json` if you also want it off by default. |

**Verification after changes:** `php -l` all files clean · phpcs project ruleset clean · WPCS security/prefix/i18n sniffs 0 errors (1 benign `base64_encode` warning) · Plugin Check: 0 code findings (only dev-file warnings for files not in the zip) · both bundles rebuilt · WP-CLI runtime smoke: migration → schema 6 / version 1.5.3; REST usage-statistics & preference behave as above; admin bundle + menu style enqueued on plugin screen; SVG filters absent; front page 200 with toolbar root, no translate div, inline script via core helper · Pro 1.5.2 activated alongside: all submenus (incl. Pro-registered profiles/tools) present, no PHP notices; Pro deactivated again afterwards.

Not done here (needs a browser / your call): visual click-through of the admin SPA and toolbar (Chrome extension was not connected), git commits/tags, SVN.
