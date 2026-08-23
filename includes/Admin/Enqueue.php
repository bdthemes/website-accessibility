<?php

/**
 * Handle admin assets enqueuing
 *
 * @package WebsiteAccessibility
 */

namespace Websac\Admin;

use Websac\Core\Utils;
use Websac\Routes\DashboardTourRouteV1;
use Websac\Traits\Singleton;

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
     * Whether the current admin screen belongs to this plugin (or an add-on
     * screen registered under the same slug family).
     *
     * @param string $hook_suffix
     * @return bool
     */
    public static function is_plugin_screen($hook_suffix) {
        if (! is_string($hook_suffix) || $hook_suffix === '') {
            return false;
        }

        // Every plugin/add-on screen slug starts with the plugin slug (see Admin\Menu).
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only screen detection.
        $page = isset($_GET['page']) ? sanitize_key(wp_unslash($_GET['page'])) : '';

        return strpos($hook_suffix, 'website-accessibility') !== false
            || strpos($page, 'website-accessibility') === 0;
    }

    /**
     * Enqueue admin scripts and styles
     *
     * @param string $hook_suffix The current admin page.
     */
    public function enqueue_scripts($hook_suffix) {
        // The admin SPA (and its localized data) is only needed on this plugin's screens.
        if (! self::is_plugin_screen($hook_suffix)) {
            return;
        }

        $admin_assets_file = WEBSAC_BUILD_DIR . 'admin/index.asset.php';
        if (! file_exists($admin_assets_file)) {
            return;
        }

        $admin_assets       = require $admin_assets_file;
        $dependencies       = is_array($admin_assets['dependencies'] ?? null)
            ? $admin_assets['dependencies']
            : [];
        $version            = $admin_assets['version'] ?? WEBSAC_VERSION;

        /** Shared toolbar components must load before the admin SPA (sets window.wapComponents / wapHelpers). */
        if (
            wp_script_is('websac-components', 'registered') &&
            ! in_array('websac-components', $dependencies, true)
        ) {
            $dependencies[] = 'websac-components';
        }

        /**
         * Add-ons that extend the admin SPA (page registry on window.websacAdminExtensions)
         * must load before it; they append their script handle here.
         *
         * @param string[] $dependencies
         * @param string   $hook_suffix
         */
        $dependencies = apply_filters('websac_admin_script_dependencies', $dependencies, $hook_suffix);

        wp_enqueue_script(
            'websac-admin',
            WEBSAC_URL . 'build/admin/index.js',
            $dependencies,
            $version,
            true
        );

        wp_enqueue_media();

        wp_set_script_translations('websac-admin', 'website-accessibility', WEBSAC_DIR . 'languages/');

        $localized = [
            'version'                      => WEBSAC_VERSION,
            'apiUrl'                       => rest_url(),
            'homeUrl'                      => home_url('/'),
            'siteName'                     => wp_specialchars_decode(get_bloginfo('name'), ENT_QUOTES),
            'adminEmail'                   => (string) get_option('admin_email'),
            'nonce'                        => wp_create_nonce('wp_rest'),
            'proUpgradeUrl'                => 'https://oneaccessibility.com#pricing',
            /** Set false in JS after completing tour via REST (same page session). */
            'shouldAutoStartDashboardTour' => ! DashboardTourRouteV1::is_completed(),
            'brandDisplayName'             => Utils::get_brand_display_name(),
            'defaultBrandDisplayName'      => __('One Accessibility', 'website-accessibility'),
            'brandLogoUrl'                 => '',
        ];

        /**
         * Filter the data localized for the admin SPA (add-ons may append keys).
         *
         * @param array  $localized
         * @param string $hook_suffix
         */
        $localized = apply_filters('websac_admin_localized_data', $localized, $hook_suffix);

        wp_localize_script('websac-admin', 'websacAdmin', $localized);

        wp_enqueue_style(
            'websac-admin',
            WEBSAC_URL . 'build/admin/index.css',
            ['wp-components'],
            $version
        );
    }
}
