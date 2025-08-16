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

    public function enqueue_components_scripts()
    {
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
        $profiles = get_posts([
            'post_type' => 'websac_profile',
            'posts_per_page' => -1,
        ]);

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
                'presets' => $presets_data,
                'profiles' => $profiles,
                'pageType' => $page_type,
                'currentPreset' => Utils::get_current_preset($presets_data, $page_type),
                'currentPresetId' => !empty(Utils::get_current_preset($presets_data, $page_type)['ID']) ? Utils::get_current_preset($presets_data, $page_type)['ID'] : null,
                'siteLanguage' => get_bloginfo('language'),
                'isUserLoggedIn' => is_user_logged_in(),
            ]);

            wp_enqueue_script(
                'gt-element',
                '//translate.google.com/translate_a/element.js?cb=wapGoogleTranslateInit',
                [],
                WEBSAC_VERSION,
                false // Must load in header so inline script is printed before this
            );

            $inline_function = 'function wapGoogleTranslateInit() {
                new window.google.translate.TranslateElement({
                    pageLanguage: "' . esc_js(get_bloginfo('language')) . '"
                }, "wap-google-translate-container");
            };';

            wp_add_inline_script('gt-element', $inline_function);
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
