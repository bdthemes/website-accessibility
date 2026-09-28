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

    private function __construct() {
        add_action('wp_enqueue_scripts', [$this, 'enqueue_frontend_scripts']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_components_scripts'], 1);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_components_scripts'], 1);
        // After wp_enqueue_scripts (priority 1), which decides whether the toolbar loads.
        add_action('wp_head', [$this, 'print_pause_animations_boot'], 2);
        add_action('wp_footer', [$this, 'render_preset_root']);
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

        $components_assets = WEBSAC_BUILD_DIR . 'components/index.asset.php';
        if (file_exists($components_assets)) {
            $components_assets = require $components_assets;
            wp_enqueue_script(
                'websac-components',
                WEBSAC_URL . 'build/components/index.js',
                $components_assets['dependencies'],
                $components_assets['version'],
                true
            );
            wp_set_script_translations('websac-components', 'website-accessibility', WEBSAC_DIR . 'languages/');
            wp_enqueue_style(
                'websac-components',
                WEBSAC_URL . 'build/components/index.css',
                [],
                $components_assets['version']
            );
        }
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
        }
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

        if (wp_script_is('websac-frontend')) {
            echo '<div id="website-accessibility-app"></div>';
        }

        /**
         * Add-ons can print extra root containers next to the toolbar root.
         */
        do_action('websac_frontend_after_root');
    }
}
