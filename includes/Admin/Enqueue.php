<?php

/**
 * Handle admin assets enqueuing
 *
 * @package WebsiteAccessibility
 */

namespace bdthemes\websiteaccessibility\Admin;

use bdthemes\websiteaccessibility\Traits\Singleton;

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Class Enqueue
 */
class Enqueue {
    use Singleton;

    /**
     * Initialize the class
     */
    private function __construct() {
        add_action('admin_enqueue_scripts', [$this, 'enqueue_scripts']);
    }

    /**
     * Enqueue admin scripts and styles
     *
     * @param string $hook_suffix The current admin page.
     */
    public function enqueue_scripts($hook_suffix) {

        $admin_assets = WEBSAC_BUILD_DIR . 'admin/index.asset.php';
        if (file_exists($admin_assets)) {
            $admin_assets = require $admin_assets;

            wp_enqueue_script(
                'website-accessibility-admin',
                WEBSAC_URL . 'build/admin/index.js',
                $admin_assets['dependencies'],
                $admin_assets['version'],
                true
            );

            wp_set_script_translations('website-accessibility-admin', 'website-accessibility', WEBSAC_DIR . 'languages/');

            $license_page_url = admin_url('admin.php?page=website-accessibility-pro_license');

            wp_localize_script(
                'website-accessibility-admin',
                'websacAdmin',
                [
                    'version'           => WEBSAC_VERSION,
                    'apiUrl'            => rest_url(),
                    'homeUrl'           => home_url('/'),
                    'nonce'             => wp_create_nonce('wp_rest'),
                    'isProPluginActive' => function_exists('website_accessibility_pro'),
                    'hasFixedIssuesPage' => $this->has_fixed_issues_page(),
                    'licensePageUrl'    => $license_page_url,
                    'proUpgradeUrl'     => 'https://oneaccessibility.com#pricing',
                ]
            );

            wp_enqueue_style(
                'website-accessibility-admin',
                WEBSAC_URL . 'build/admin/index.css',
                ['wp-components'],
                $admin_assets['version']
            );
        }
    }

    /**
     * Check if current page is our plugin page
     *
     * @param string $hook_suffix The current admin page.
     * @return boolean
     */
    private function is_plugin_page($hook_suffix) {
        $plugin_pages = [
            'toplevel_page_website-accessibility',
            'accessibility_page_website-accessibility-presets',
            'accessibility_page_website-accessibilityfiles',
        ];

        return in_array($hook_suffix, $plugin_pages, true);
    }

    /**
     * Get current page slug
     *
     * @param string $hook_suffix The current admin page.
     * @return string
     */
    private function get_current_page($hook_suffix) {
        $page_map = [
            'toplevel_page_website-accessibility' => 'website-accessibility-dashboard',
            'website-accessibility_page_website-accessibility-presets' => 'website-accessibility-presets',
            'website-accessibility_page_website-accessibilityfiles' => 'website-accessibilityfiles',
        ];

        return isset($page_map[$hook_suffix]) ? $page_map[$hook_suffix] : 'website-accessibility-dashboard';
    }

    private function has_fixed_issues_page() {
        if (!function_exists('website_accessibility_pro')) {
            return false;
        }

        if (
            !class_exists('\bdthemes\websiteaccessibilitypro\Admin\License\LicenseHelper') ||
            !\bdthemes\websiteaccessibilitypro\Admin\License\LicenseHelper::is_license_active()
        ) {
            return false;
        }

        $settings = get_option('websac_settings', []);
        if (!is_array($settings)) return false;
        $raw_enabled = $settings['enable_accessibility_checker'] ?? false;
        $checker_enabled = is_bool($raw_enabled)
            ? $raw_enabled
            : in_array(strtolower(trim((string) $raw_enabled)), ['1', 'true', 'yes', 'on'], true);
        if (!$checker_enabled) return false;

        return true;
    }
}
