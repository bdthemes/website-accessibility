<?php

namespace Websac\View;

use Websac\Core\Utils;

if (! defined('ABSPATH')) {
    exit;
}

class Frontend {
    use \Websac\Traits\Singleton;

    /**
     * Preset the toolbar runs with on this request (0 when none), set while enqueuing.
     *
     * @var int
     */
    private $current_preset_id = 0;

    /**
     * Preset the toolbar runs with on this request, set while enqueuing.
     *
     * @var array
     */
    private $current_preset = [];

    /**
     * Whether visitors get the light launcher on this request: the toolbar's
     * button straight away, the toolbar itself only when they reach for it.
     *
     * @var bool
     */
    private $lazy = false;

    /**
     * Script handles printed inert, for the launcher to run on demand.
     *
     * @var array<string, true>
     */
    private $lazy_handles = [];

    private function __construct() {
        add_action('wp_enqueue_scripts', [$this, 'enqueue_frontend_scripts']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_components_scripts'], 1);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_components_scripts'], 1);
        // After wp_enqueue_scripts (priority 1), which decides whether the toolbar loads.
        add_action('wp_head', [$this, 'print_pause_animations_boot'], 2);
        add_action('wp_footer', [$this, 'render_preset_root']);

        // The light launcher (see should_lazy_load()).
        add_action('wp_enqueue_scripts', [$this, 'plan_lazy_scripts'], PHP_INT_MAX);
        add_action('wp_print_footer_scripts', [$this, 'settle_lazy_scripts'], 1);
        add_filter('script_loader_tag', [$this, 'lazy_script_tag'], 10, 2);
    }

    /**
     * Additional accessibility profiles exposed to the toolbar.
     *
     * The built-in profiles ship in the JS bundle; add-ons can append their own
     * profile posts through this filter.
     *
     * @return array
     */
    private function get_profiles() {
        $profiles = apply_filters('websac_frontend_profiles', []);
        return is_array($profiles) ? array_values($profiles) : [];
    }

    /**
     * Get the Accessibility Statement page link if it exists.
     *
     * @return string|null URL of the page or null if not found.
     */
    private function get_statement_page_link() {
        // Visitors must only ever be handed a published page. A draft permalink takes
        // the ?page_id=<ID> form, so putting it in the public payload discloses the ID
        // of an unpublished page and hands every visitor a link that 404s. Editors keep
        // the draft link so the toolbar can be previewed while the page is written.
        $statuses = current_user_can('edit_pages') ? ['publish', 'draft'] : ['publish'];

        $pages = get_posts([
            'post_type'      => 'page',
            'name'           => 'one-accessibility-statement-page', // slug of the page
            'post_status'    => $statuses,
            'numberposts'    => 1,
            'fields'         => 'ids',                                   // only need ID
        ]);

        if (! empty($pages)) {
            return get_permalink($pages[0]);
        }

        return null;
    }

    public function get_preset_data() {
        $presets = get_posts([
            'post_type' => 'websac_preset',
            'posts_per_page' => -1,
        ]);

        return array_map(function ($preset) {
            $data = Utils::get_preset_data($preset);
            if (!empty($data['preset']['active'])) {
                return $data;
            }
            return null;
        }, $presets);
    }

    public function should_render_preset_assets() {
        return is_admin() || !empty(Utils::get_current_preset($this->get_preset_data(), Utils::get_page_type()));
    }

    /**
     * Add-ons that render their own UI on the front end can request the shared
     * components bundle even when no preset matches (e.g. Customizer preview).
     *
     * @return bool
     */
    private function should_force_components_assets() {
        if (is_admin() || Utils::is_builder_editor()) {
            return false;
        }
        return (bool) apply_filters('websac_force_frontend_components_assets', false);
    }

    public function enqueue_components_scripts($hook) {
        if (!str_contains($hook, 'accessibility') && is_admin()) return;

        $force_shared = $this->should_force_components_assets();
        if ((! $this->should_render_preset_assets() && ! $force_shared) || Utils::is_builder_editor()) {
            return;
        }

        $bundle = $this->components_bundle();
        $components_assets = WEBSAC_BUILD_DIR . $bundle . '/index.asset.php';
        if (file_exists($components_assets)) {
            $components_assets = require $components_assets;
            wp_enqueue_script(
                'websac-components',
                WEBSAC_URL . 'build/' . $bundle . '/index.js',
                $components_assets['dependencies'],
                $components_assets['version'],
                true
            );
            wp_set_script_translations('websac-components', 'website-accessibility', WEBSAC_DIR . 'languages/');
            wp_enqueue_style(
                'websac-components',
                WEBSAC_URL . 'build/' . $bundle . '/index.css',
                [],
                $components_assets['version']
            );
        }
    }

    /**
     * Which build of the shared components to load. Visitors get only what the
     * toolbar uses (about half the size); the admin screens and site staff get
     * every control, since staff may run add-on tools on the front end (such as
     * a checker from an add-on that predates this split). Any other request can
     * ask for the full set through `websac_frontend_full_components`.
     *
     * @return string Build folder name.
     */
    private function components_bundle() {
        $full = is_admin() || current_user_can('edit_posts') || (bool) apply_filters('websac_frontend_full_components', false);
        if (! $full && file_exists(WEBSAC_BUILD_DIR . 'frontend-components/index.asset.php')) {
            return 'frontend-components';
        }
        return 'components';
    }

    public function enqueue_frontend_scripts() {
        if (! $this->should_render_preset_assets() || Utils::is_builder_editor()) {
            return;
        }

        $frontend_assets = WEBSAC_BUILD_DIR . 'frontend/frontend.asset.php';
        $profiles = $this->get_profiles();
        $presets_data = $this->get_preset_data();
        $page_type = Utils::get_page_type();

        if (file_exists($frontend_assets)) {
            $frontend_assets = require $frontend_assets;
            wp_enqueue_script(
                'websac-frontend',
                WEBSAC_URL . 'build/frontend/frontend.js',
                $frontend_assets['dependencies'],
                $frontend_assets['version'],
                true
            );
            wp_set_script_translations('websac-frontend', 'website-accessibility', WEBSAC_DIR . 'languages/');
            wp_enqueue_style(
                'websac-frontend',
                WEBSAC_URL . 'build/frontend/frontend.css',
                [],
                $frontend_assets['version']
            );
            $current_preset = Utils::get_current_preset($presets_data, $page_type);
            $this->current_preset_id = !empty($current_preset['ID']) ? (int) $current_preset['ID'] : 0;
            $this->current_preset = is_array($current_preset) ? $current_preset : [];
            $localized = [
                'presets'            => $presets_data,
                'profiles'           => $profiles,
                'pageType'           => $page_type,
                'currentPreset'      => $current_preset,
                'currentPresetId'    => !empty($current_preset['ID']) ? $current_preset['ID'] : null,
                'siteLanguage'       => get_bloginfo('language'),
                'isUserLoggedIn'     => is_user_logged_in(),
                'statementLink'      => $this->get_statement_page_link(),
                'settings'           => $this->get_public_settings(),
                'nonce'              => wp_create_nonce('wp_rest'),
                'restUrl'            => rest_url(),
                'postId'             => get_the_ID(),
                'brandDisplayName'   => Utils::get_brand_display_name(),
                'whiteLabelEnabled'  => false,
                'whiteLabelBoot'     => [],
            ];

            /**
             * Filter the data localized for the public toolbar (add-ons may append keys
             * such as white-label branding).
             *
             * @param array $localized
             */
            $localized = apply_filters('websac_frontend_localized_data', $localized);

            wp_localize_script('websac-frontend', 'websiteAccessibility', $localized);

            $launcher_assets = WEBSAC_BUILD_DIR . 'launcher/index.asset.php';
            if ($this->should_lazy_load($this->current_preset) && file_exists($launcher_assets)) {
                $launcher_assets = require $launcher_assets;
                wp_enqueue_script(
                    'websac-launcher',
                    WEBSAC_URL . 'build/launcher/index.js',
                    $launcher_assets['dependencies'],
                    $launcher_assets['version'],
                    true
                );
                $this->lazy = true;
            }
        }
    }

    /**
     * Whether visitors get the toolbar's button straight away and the toolbar
     * itself (React, its components, add-ons) only when they reach for it.
     *
     * Logged-in users load it with the page: their choices can be kept on the
     * server, and site staff use tools (such as an add-on's checker) built on it.
     *
     * @param array $preset Preset the toolbar runs with.
     * @return bool
     */
    private function should_lazy_load($preset) {
        if (is_user_logged_in() || null === $this->launcher_parts($preset)) {
            return false;
        }

        /**
         * Whether the toolbar loads only when a visitor reaches for its button
         * (the default) rather than with every page.
         *
         * @param bool  $lazy
         * @param array $preset Preset the toolbar runs with.
         */
        return (bool) apply_filters('websac_lazy_toolbar', true, $preset);
    }

    /**
     * Move libraries that only the toolbar needs into the footer, so they can
     * wait with it.
     *
     * @return void
     */
    public function plan_lazy_scripts() {
        if (! $this->lazy) {
            return;
        }
        $scripts = wp_scripts();
        foreach ($this->lazy_candidates($scripts) as $handle) {
            if (! in_array($handle, $scripts->done, true)) {
                $scripts->add_data($handle, 'group', 1);
            }
        }
    }

    /**
     * Decide, with every script of the page now known, which ones wait.
     *
     * @return void
     */
    public function settle_lazy_scripts() {
        if (! $this->lazy) {
            return;
        }
        $scripts = wp_scripts();
        $waiting = array_diff($this->lazy_candidates($scripts), (array) $scripts->done);
        $this->lazy_handles = array_fill_keys($waiting, true);
    }

    /**
     * Print a waiting script inert (src/launcher runs it on demand).
     *
     * @param string $tag    The script tag(s) for the handle.
     * @param string $handle Script handle.
     * @return string
     */
    public function lazy_script_tag($tag, $handle) {
        if (! $this->lazy || ! isset($this->lazy_handles[$handle])) {
            return $tag;
        }

        return preg_replace_callback(
            '/<script\b([^>]*)>/i',
            static function ($match) {
                $attributes = preg_replace('/\s(?:type|async|defer)(?:=(["\'])[^"\']*\1)?(?=[\s>]|$)/i', '', $match[1]);
                $attributes = preg_replace('/\ssrc=/i', ' data-websac-src=', (string) $attributes);
                return '<script type="text/plain" data-websac-lazy' . $attributes . '>';
            },
            $tag
        );
    }

    /**
     * The toolbar's scripts (its own and add-ons' built on them) and the
     * libraries they need that nothing else on the page uses.
     *
     * @param \WP_Scripts $scripts
     * @return string[]
     */
    private function lazy_candidates($scripts) {
        $roots   = ['websac-components', 'websac-frontend'];
        $toolbar = [];
        $others  = [];

        foreach ((array) $scripts->queue as $handle) {
            if ('websac-launcher' === $handle) {
                continue;
            }
            $deps = $this->script_deps($handle, $scripts);
            if (in_array($handle, $roots, true) || array_intersect($roots, $deps)) {
                $toolbar[] = $handle;
            } else {
                $others = array_merge($others, [$handle], $deps);
            }
        }

        $needed = [];
        foreach ($toolbar as $handle) {
            $needed = array_merge($needed, [$handle], $this->script_deps($handle, $scripts));
        }

        return array_values(array_diff(array_unique($needed), $others, ['websac-launcher']));
    }

    /**
     * Every script a handle depends on, directly or not.
     *
     * @param string      $handle
     * @param \WP_Scripts $scripts
     * @param array       $seen
     * @return string[]
     */
    private function script_deps($handle, $scripts, &$seen = []) {
        if (! isset($scripts->registered[$handle])) {
            return [];
        }
        $all = [];
        foreach ((array) $scripts->registered[$handle]->deps as $dep) {
            if (isset($seen[$dep])) {
                continue;
            }
            $seen[$dep] = true;
            $all[] = $dep;
            $all = array_merge($all, $this->script_deps($dep, $scripts, $seen));
        }
        return $all;
    }

    /**
     * Put Pause Animations in force before the first paint.
     *
     * The toolbar loads in the footer, so without this a visitor who switched motion
     * off would still see every entrance animation start on each page load. Their
     * choice lives in this browser's localStorage, so a tiny inline script reads it
     * and sets the class the stylesheet keys on; the toolbar takes over once it loads.
     *
     * @return void
     */
    public function print_pause_animations_boot() {
        if (!$this->current_preset_id || !wp_script_is('websac-frontend')) {
            return;
        }

        // Must match `localStorageKeyPrefix` in src/frontend/context/reducer.js.
        $storage_key = 'websiteAccessibilityLocalPreferences-' . $this->current_preset_id;

        $script = sprintf(
            '(function(k){try{var p=JSON.parse(window.localStorage.getItem(k)||"null"),s=p&&p.settings&&p.settings.pauseAnimations;if(s&&s.currentStep){document.documentElement.classList.add("wap-animations-paused");}}catch(e){}})(%s);',
            wp_json_encode($storage_key)
        );

        wp_print_inline_script_tag($script, ['id' => 'websac-pause-animations-boot']);
    }

    /**
     * Front-end-safe settings for wp_localize_script.
     *
     * Only the keys owned by this plugin are exposed. Add-ons that store their
     * own keys in `websac_settings` must opt their public keys in through the
     * `websac_public_frontend_settings` filter, so server-side secrets are never
     * printed into the page by accident.
     *
     * @return array
     */
    private function get_public_settings() {
        $settings = Utils::get_settings();
        $public   = [];

        if (is_array($settings)) {
            foreach (['show_usage_statistics'] as $key) {
                if (array_key_exists($key, $settings)) {
                    $public[$key] = $settings[$key];
                }
            }
        }

        /**
         * Allow add-ons to expose their own (non-secret) settings to the public front end.
         *
         * @param array $public   Settings exposed so far.
         * @param array $settings Full settings array (never expose secrets from it).
         */
        return apply_filters('websac_public_frontend_settings', $public, is_array($settings) ? $settings : []);
    }

    public function render_preset_root() {
        if (Utils::is_builder_editor()) return;

        $this->print_theme_colors($this->current_preset);

        if (wp_script_is('websac-frontend')) {
            echo '<div id="website-accessibility-app">';
            if ($this->lazy) {
                $this->print_launcher($this->current_preset);
            }
            echo '</div>';
        }

        /**
         * Add-ons can print extra root containers next to the toolbar root.
         */
        do_action('websac_frontend_after_root');
    }

    /**
     * The preset's colour theme (panel.wrapper.theme, picked in the preset editor)
     * as page-wide CSS variables. The toolbar's accents (active tiles and profiles,
     * focus rings, buttons) read them, and so can anything an add-on draws on the
     * page. Nothing is printed without a theme, so every colour keeps its default.
     *
     * @param array|null $preset Preset the toolbar runs with.
     * @return void
     */
    private function print_theme_colors($preset) {
        $theme = isset($preset['panel']['wrapper']['theme']) && is_array($preset['panel']['wrapper']['theme'])
            ? $preset['panel']['wrapper']['theme']
            : [];
        $hex = static function ($value) {
            return is_string($value) && preg_match('/^#[0-9a-f]{6}$/i', $value) ? strtolower($value) : '';
        };

        $primary = $hex($theme['primary'] ?? '');
        if ('' === $primary) {
            return;
        }
        $variables = [
            '--wap-primary'        => $primary,
            '--wap-primary-rgb'    => implode(', ', array_map('hexdec', str_split(substr($primary, 1), 2))),
            '--wap-primary-hover'  => $hex($theme['hover'] ?? '') ?: $primary,
            '--wap-primary-active' => $hex($theme['active'] ?? '') ?: $primary,
            '--wap-on-primary'     => $hex($theme['onPrimary'] ?? '') ?: '#ffffff',
        ];
        $css = '';
        foreach ($variables as $name => $value) {
            $css .= $name . ':' . $value . ';';
        }
        // Every value is a validated #rrggbb or a list of numbers.
        echo '<style id="websac-theme-colors">:root{' . esc_html($css) . '}</style>';
    }

    /**
     * The toolbar's button as the toolbar draws it (src/frontend/view.js and
     * src/components/preview-button.js), for the page to show before the toolbar
     * has loaded; the toolbar replaces it when it mounts. Null when it cannot be
     * drawn the same way, and then the toolbar loads with the page.
     *
     * @param array $preset Preset the toolbar runs with.
     * @return array|null { classes, style, icon (SVG), text }
     */
    private function launcher_parts($preset) {
        $button = isset($preset['button']) && is_array($preset['button']) ? $preset['button'] : [];
        if (! $button) {
            return null;
        }

        $type      = isset($button['buttonType']) ? (string) $button['buttonType'] : '';
        $show_icon = 'text' !== $type;
        $icon      = $show_icon ? $this->launcher_icon(isset($button['icon']) ? (string) $button['icon'] : '') : '';
        if ($show_icon && '' === $icon) {
            return null;
        }
        // Like PreviewButton: text unless it is an icon-only button, with its default when none is set.
        $text = 'icon' === $type ? '' : (isset($button['text']) ? (string) $button['text'] : __('Preview Accessibility', 'website-accessibility'));

        $classes = array_filter([
            'wap-preview-button',
            'notranslate',
            'wap-button-style-preset__preview-btn',
            isset($button['position']) ? sanitize_html_class((string) $button['position']) : '',
            '' !== $type ? 'wap-button-style-preset__preview-btn--' . sanitize_html_class($type) : '',
            'wap-launcher-placeholder',
        ]);

        $length = static function ($value) {
            $raw = trim((string) $value);
            return preg_match('/^-?\d*\.?\d+$/', $raw) ? $raw . 'px' : $raw;
        };
        $variables = [
            '--button-font-size' => isset($button['fontSize']) ? (string) $button['fontSize'] : '',
            '--button-icon-size' => isset($button['iconSize']) ? (string) $button['iconSize'] : '',
            '--button-color'     => isset($button['color']) ? (string) $button['color'] : '',
            '--button-bg'        => isset($button['bgColor']) ? (string) $button['bgColor'] : '',
            '--button-padding'   => isset($button['padding']) ? (string) $button['padding'] : '',
            '--button-radius'    => isset($button['borderRadius']) ? $length($button['borderRadius']) : '',
            '--button-offset-x'  => ! empty($button['offsetX']) ? (float) $button['offsetX'] . 'px' : '',
            '--button-offset-y'  => ! empty($button['offsetY']) ? (float) $button['offsetY'] . 'px' : '',
        ];
        $style = '';
        foreach ($variables as $name => $value) {
            // Keep only what a CSS value needs: no way out of the declaration.
            $value = trim((string) preg_replace('/[^#%\w\s.,()+\-\/]/', '', $value));
            if ('' !== $value) {
                $style .= $name . ': ' . $value . ';';
            }
        }

        return [
            'classes' => implode(' ', $classes),
            'style'   => $style,
            'icon'    => $icon,
            'text'    => $text,
        ];
    }

    /**
     * Print the launcher placeholder.
     *
     * @param array $preset Preset the toolbar runs with.
     * @return void
     */
    private function print_launcher($preset) {
        $parts = $this->launcher_parts($preset);
        if (! $parts) {
            return;
        }
        printf(
            '<div class="wap-accessibility-view notranslate" translate="no"><button type="button" class="%1$s" style="%2$s" aria-label="%3$s" translate="no">%4$s%5$s</button></div>',
            esc_attr($parts['classes']),
            esc_attr($parts['style']),
            esc_attr__('Accessibility Menu', 'website-accessibility'),
            '' !== $parts['icon'] ? '<span class="ant-btn-icon">' . wp_kses($parts['icon'], self::svg_allowed_html()) . '</span>' : '',
            '' !== $parts['text'] ? '<span>' . esc_html($parts['text']) . '</span>' : ''
        );
    }

    /**
     * SVG markup a launcher icon may contain.
     *
     * @return array
     */
    private static function svg_allowed_html() {
        $attributes = [
            'xmlns' => true, 'width' => true, 'height' => true, 'viewbox' => true, 'fill' => true, 'd' => true,
            'fill-rule' => true, 'clip-rule' => true, 'stroke' => true, 'stroke-width' => true, 'stroke-linecap' => true,
            'stroke-linejoin' => true, 'transform' => true, 'id' => true, 'class' => true, 'opacity' => true,
            'cx' => true, 'cy' => true, 'r' => true, 'rx' => true, 'ry' => true, 'x' => true, 'y' => true,
            'aria-hidden' => true, 'focusable' => true,
        ];
        return array_fill_keys(['svg', 'path', 'g', 'circle', 'rect', 'defs', 'clippath'], $attributes);
    }

    /**
     * A launcher icon's SVG, read from the toolbar's own icon set
     * (src/assets/icons.js, which ships with the plugin) so both stay the same.
     *
     * @param string $name Icon name, e.g. "accessibility1".
     * @return string
     */
    private function launcher_icon($name) {
        static $icons = null;
        if (null === $icons) {
            $icons  = [];
            $file   = WEBSAC_DIR . 'src/assets/icons.js';
            $source = is_readable($file) ? (string) file_get_contents($file) : ''; // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- local plugin file.
            if (preg_match_all('/export\s+const\s+([A-Za-z0-9_]+)\s*=\s*\(?\s*(<svg\b.*?<\/svg>)/s', $source, $matches, PREG_SET_ORDER)) {
                foreach ($matches as $match) {
                    // JSX attribute names as SVG writes them.
                    $icons[$match[1]] = strtr($match[2], [
                        'fillRule='       => 'fill-rule=',
                        'clipRule='       => 'clip-rule=',
                        'strokeWidth='    => 'stroke-width=',
                        'strokeLinecap='  => 'stroke-linecap=',
                        'strokeLinejoin=' => 'stroke-linejoin=',
                        'className='      => 'class=',
                    ]);
                }
            }
        }
        return isset($icons[$name]) ? $icons[$name] : '';
    }
}
