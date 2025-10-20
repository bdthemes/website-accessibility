<?php

namespace bdthemes\websiteaccessibility\View;

use bdthemes\websiteaccessibility\Core\Utils;

class Frontend
{
    use \bdthemes\websiteaccessibility\Traits\Singleton;

    public function __construct()
    {
        add_action('wp_enqueue_scripts', [$this, 'enqueue_frontend_scripts']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_components_scripts'], 1);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_components_scripts'], 1);
        add_action('wp_footer', [$this, 'render_preset_root']);
    }

    private function get_profiles()
    {
        // Check if the Pro plugin class exists
        if (class_exists('\bdthemes\websiteaccessibilitypro\Admin\License')) {
            $license = \bdthemes\websiteaccessibilitypro\Admin\License::get_instance();

            // Check if the license method exists and is valid
            if (method_exists($license, 'is_license_valid') && $license->is_license_valid()) {
                return get_posts([
                    'post_type'      => 'websac_profile',
                    'posts_per_page' => -1,
                ]);
            }
        }

        // If class or license method not found, or license is invalid — return empty array
        return [];
    }

    /**
     * Get the Accessibility Statement page link if it exists.
     *
     * @return string|null URL of the page or null if not found.
     */
    private function get_statement_page_link()
    {
        $pages = get_posts([
            'post_type'      => 'page',
            'name'           => 'sigmally-accessibility-statement-page', // slug of the page
            'post_status'    => ['publish', 'draft'],                   // include draft & published
            'numberposts'    => 1,
            'fields'         => 'ids',                                   // only need ID
        ]);

        if (! empty($pages)) {
            return get_permalink($pages[0]);
        }

        return null;
    }


    public function enqueue_components_scripts($hook)
    {
        if (!str_contains($hook, 'accessibility') && is_admin()) {
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
            wp_enqueue_style(
                'wap-accessibility-components',
                WEBSAC_URL . 'build/components/index.css',
                [],
                $components_assets['version']
            );
        }
    }

    public function enqueue_frontend_scripts()
    {
        $frontend_assets = WEBSAC_BUILD_DIR . 'frontend/frontend.asset.php';
        $presets = get_posts([
            'post_type' => 'websac_preset',
            'posts_per_page' => -1,
        ]);
        $profiles = $this->get_profiles();

        $presets_data = array_map(function ($preset) {
            $data = Utils::get_preset_data($preset);
            if (!empty($data['preset']['active'])) {
                return $data;
            }
            return null;
        }, $presets);

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
                'settings'        => get_option('websac_settings', [
                    'show_translations_consent' => true
                ]),
                'nonce'           => wp_create_nonce('wp_rest'),
            ]);
        }
    }
    public function render_preset_root()
    {
        if (!wp_script_is('wap-accessibility-frontend')) {
            return;
        }

        echo '<div id="website-accessibility-app"></div>';
        // Google Translate
        echo '<div id="wap-google-translate-container"></div>';
    }
}
