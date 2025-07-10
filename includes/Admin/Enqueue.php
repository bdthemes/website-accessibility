<?php
/**
 * Handle admin assets enqueuing
 *
 * @package WebsiteAccessibilityPro
 */

namespace WebsiteAccessibilityPro\Admin;

use WebsiteAccessibilityPro\Traits\Singleton;

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
        
        $admin_assets = WAP_BUILD_DIR . 'admin/index.asset.php';
        if (file_exists($admin_assets)) {
            $admin_assets = require $admin_assets;

            wp_enqueue_script(
                'website-accessibility-admin',
                WAP_URL . 'build/admin/index.js',
                $admin_assets['dependencies'],
                $admin_assets['version'],
                true
            );

            wp_enqueue_style(
                'website-accessibility-admin',
                WAP_URL . 'build/admin/index.css',
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
} 