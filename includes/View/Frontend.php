<?php

namespace bdthemes\websiteaccessibility\View;

use bdthemes\websiteaccessibility\Core\Utils;

class Frontend {
    use \bdthemes\websiteaccessibility\Traits\Singleton;

    public function __construct() {
        add_action('wp_enqueue_scripts', [$this, 'enqueue_frontend_scripts']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_frontend_custom_css'], 99);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_components_scripts'], 1);
        add_action('wp_enqueue_scripts', [$this, 'maybe_enqueue_fix_highlight'], 3);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_components_scripts'], 1);
        add_action('wp_footer', [$this, 'render_preset_root']);
    }

    private function get_profiles() {
        if (
            class_exists('\bdthemes\websiteaccessibilitypro\Admin\License\LicenseHelper') &&
            \bdthemes\websiteaccessibilitypro\Admin\License\LicenseHelper::is_license_active()
        ) {
            return get_posts([
                'post_type'      => 'websac_profile',
                'posts_per_page' => -1,
            ]);
        }

        // Pro is missing or license inactive.
        return [];
    }

    /**
     * Get the Accessibility Statement page link if it exists.
     *
     * @return string|null URL of the page or null if not found.
     */
    private function get_statement_page_link() {
        $pages = get_posts([
            'post_type'      => 'page',
            'name'           => 'one-accessibility-statement-page', // slug of the page
            'post_status'    => ['publish', 'draft'],                   // include draft & published
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
     * When an admin visits with ?websac_highlight=1&websac_xpath=<base64>, scroll to / outline that element on the frontend.
     * Capability-gated server-side — avoids abusive public URLs.
     */
    public function maybe_enqueue_fix_highlight() {
        if (is_admin()) {
            return;
        }

        if (Utils::is_builder_editor()) {
            return;
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only UX gated by capability.
        $flag = isset($_GET['websac_highlight'])
            ? sanitize_key((string) wp_unslash($_GET['websac_highlight']))
            : '';
        if ($flag !== '1') {
            return;
        }

        if (! is_user_logged_in() || ! current_user_can('manage_options')) {
            return;
        }

        $xpath = $this->decode_xpath_highlight_param();
        if ($xpath === '') {
            return;
        }

        $asset_path = WEBSAC_DIR . 'assets/js/websac-fix-highlight.js';
        if (! file_exists($asset_path)) {
            return;
        }

        $ver = WEBSAC_VERSION . '.' . (string) filemtime($asset_path);
        wp_enqueue_script(
            'websac-fix-highlight',
            WEBSAC_URL . 'assets/js/websac-fix-highlight.js',
            [],
            $ver,
            true
        );

        wp_localize_script(
            'websac-fix-highlight',
            'websacFixHighlight',
            [
                'xpath'  => $xpath,
                'fadeMs' => 14000,
            ]
        );
    }

    /**
     * Decode XPath from GET params (UTF-8, base64). Empty string when invalid.
     *
     * @return string
     */
    private function decode_xpath_highlight_param() {

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        $raw = isset($_GET['websac_xpath']) ? (string) wp_unslash($_GET['websac_xpath']) : '';

        $normalized = trim(str_replace(' ', '+', rawurldecode($raw)));

        if ($normalized === '') {
            return '';
        }

        if (! preg_match('/^[a-zA-Z0-9+\/_-]+=*$/', $normalized)) {
            return '';
        }

        $normalized = strtr($normalized, '-_', '+/');
        $pad = strlen($normalized) % 4;
        if ($pad !== 0) {
            $normalized .= str_repeat('=', 4 - $pad);
        }

        $binary = base64_decode($normalized, true);
        if ($binary === false || ! is_string($binary)) {
            return '';
        }

        if (strlen($binary) > 8192 || preg_match('/\0/', $binary)) {
            return '';
        }

        if (! preg_match('//u', $binary)) {
            return '';
        }

        if (
            preg_match('/\bjavascript\s*:|data\s*\(|vbscript\s*:/iu', $binary)
            || preg_match('/<\s*\/?script/iu', $binary)
        ) {
            return '';
        }

        return $binary;
    }

    /**
     * Load shared components on the front when the Pro accessibility checker may run
     * (Customizer preview often has no matching preset; script order must still be valid).
     */
    private function should_enqueue_accessibility_checker_shared_assets() {
        if (is_admin() || Utils::is_builder_editor()) {
            return false;
        }
        if (! is_user_logged_in() || ! current_user_can('manage_options')) {
            return false;
        }
        if (
            ! class_exists('\bdthemes\websiteaccessibilitypro\Admin\License\LicenseHelper')
            || ! \bdthemes\websiteaccessibilitypro\Admin\License\LicenseHelper::is_license_active()
        ) {
            return false;
        }

        return ! empty(Utils::get_settings('enable_accessibility_checker'));
    }

    public function enqueue_components_scripts($hook) {
        if (!str_contains($hook, 'accessibility') && is_admin()) return;

        $checker_shared = $this->should_enqueue_accessibility_checker_shared_assets();
        if ((! $this->should_render_preset_assets() && ! $checker_shared) || Utils::is_builder_editor()) {
            return;
        }

        $components_assets = WEBSAC_BUILD_DIR . 'components/index.asset.php';
        if (file_exists($components_assets)) {
            $components_assets = require $components_assets;
            wp_enqueue_script(
                'wap-accessibility-components',
                WEBSAC_URL . 'build/components/index.js',
                $components_assets['dependencies'],
                $components_assets['version'],
                true
            );
            wp_set_script_translations('wap-accessibility-components', 'website-accessibility', WEBSAC_DIR . 'languages/');
            wp_enqueue_style(
                'wap-accessibility-components',
                WEBSAC_URL . 'build/components/index.css',
                [],
                $components_assets['version']
            );
        }
    }

    /**
     * Output site-wide custom CSS saved from the dashboard (after theme/plugin CSS).
     */
    public function enqueue_frontend_custom_css() {
        if (is_admin()) {
            return;
        }

        if (Utils::is_builder_editor()) {
            return;
        }

        $css = Utils::get_settings('frontend_custom_css');
        if (! is_string($css) || trim($css) === '') {
            return;
        }

        $handle = 'websac-frontend-custom-css';
        wp_register_style($handle, false, [], WEBSAC_VERSION);
        wp_enqueue_style($handle);
        wp_add_inline_style($handle, $css);
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
                'wap-accessibility-frontend',
                WEBSAC_URL . 'build/frontend/frontend.js',
                $frontend_assets['dependencies'],
                $frontend_assets['version'],
                true
            );
            wp_set_script_translations('wap-accessibility-frontend', 'website-accessibility', WEBSAC_DIR . 'languages/');
            wp_enqueue_style(
                'wap-accessibility-frontend',
                WEBSAC_URL . 'build/frontend/frontend.css',
                [],
                $frontend_assets['version']
            );
            wp_localize_script('wap-accessibility-frontend', 'websiteAccessibility', [
                'presets'         => $presets_data,
                'profiles'        => $profiles,
                'pageType'        => $page_type,
                'currentPreset'   => Utils::get_current_preset($presets_data, $page_type),
                'currentPresetId' => !empty(Utils::get_current_preset($presets_data, $page_type)['ID']) ? Utils::get_current_preset($presets_data, $page_type)['ID'] : null,
                'siteLanguage'    => get_bloginfo('language'),
                'isUserLoggedIn'  => is_user_logged_in(),
                'statementLink'   => $this->get_statement_page_link(),
                'settings'        => Utils::get_settings(),
                'nonce'           => wp_create_nonce('wp_rest'),
                'restUrl'         => rest_url(),
                'postId'          => get_the_ID(),
            ]);
        }
    }

    public function render_preset_root() {
        if (Utils::is_builder_editor()) return;

        if (wp_script_is('wap-accessibility-frontend')) {
            echo '<div id="website-accessibility-app"></div>';
            // Google Translate
            echo '<div id="wap-google-translate-container"></div>';
        }


        // Admin View Container - Will be used by the admin view script
        if (
            current_user_can('manage_options') &&
            class_exists('\bdthemes\websiteaccessibilitypro\Admin\License\LicenseHelper') &&
            \bdthemes\websiteaccessibilitypro\Admin\License\LicenseHelper::is_license_active()
        ) {
            echo '<div id="website-accessibility-checker"></div>';
        }
    }
}
