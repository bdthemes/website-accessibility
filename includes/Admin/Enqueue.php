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
        // Capability first. is_plugin_screen() matches on $_GET['page'], which any
        // logged-in user controls, so it can identify a screen but must never be the
        // thing that authorizes one: without this check a Subscriber loading
        // profile.php?page=website-accessibility-x receives the payload below, admin
        // e-mail included. Every plugin and add-on screen is registered with
        // manage_options (Admin\Menu), so that is the capability this payload belongs to.
        if (! current_user_can('manage_options')) {
            return;
        }

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

        /**
         * Whether to load the WordPress media modal (wp.media) on this plugin's screens.
         *
         * The free screens never open it, and it is the heaviest thing they would load:
         * about twenty scripts plus the modal's templates printed into the page. It stays
         * on while the Pro add-on is active, which may use it; any add-on can ask for it.
         *
         * @param bool   $enqueue
         * @param string $hook_suffix
         */
        if (apply_filters('websac_admin_enqueue_media', defined('WEBSAC_PRO_VERSION'), $hook_suffix)) {
            wp_enqueue_media();
        }

        $this->preload_rest_requests($hook_suffix);

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
            /** Known at first paint so the dashboard can reserve the statistics
                card instead of popping it in once /settings answers. */
            'showUsageStatistics'          => (bool) Utils::get_settings('show_usage_statistics'),
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

    /**
     * Preload key for every preset: what the admin store asks for
     * (getEntityRecords with per_page -1, which apiFetch would fetch page by page).
     */
    const ALL_PRESETS_PATH = '/wp/v2/websac_preset?context=edit&per_page=-1';

    /**
     * The current plugin screen (its ?page= slug).
     *
     * @return string
     */
    private static function current_page() {
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only screen detection.
        return isset($_GET['page']) ? sanitize_key(wp_unslash($_GET['page'])) : '';
    }

    /**
     * REST requests each screen makes as soon as it renders, as the screen writes
     * them (apiFetch's preloading middleware matches the path, with its query
     * arguments in any order).
     *
     * @return string[]
     */
    private static function preload_paths() {
        $statement_page = '/wp/v2/pages?slug=one-accessibility-statement-page&status=any&_fields=id,title,link,status,slug&per_page=1';
        $post_search    = '/wp/v2/search?search=&per_page=10';

        switch (self::current_page()) {
            case 'website-accessibility':
                $paths = ['/wp/v2/types?context=view', self::ALL_PRESETS_PATH, '/websac/v1/preference?stats=true'];
                if (Utils::get_settings('show_usage_statistics')) {
                    $paths[] = '/websac/v1/usage-statistics?range=daily';
                }
                return $paths;

            case 'website-accessibility-presets':
                return ['/wp/v2/types?context=view', self::ALL_PRESETS_PATH];

            case 'website-accessibility-presets-edit':
                // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only screen detection.
                $id = isset($_GET['id']) ? absint(wp_unslash($_GET['id'])) : 0;
                if (! $id || 'websac_preset' !== get_post_type($id)) {
                    return ['/wp/v2/types?context=view'];
                }
                $paths = ['/wp/v2/types?context=view', '/wp/v2/websac_preset/' . $id . '?context=edit', $post_search];

                // The preset's target posts, which the editor looks up for their titles.
                $content = json_decode((string) get_post_field('post_content', $id), true);
                $targets = isset($content['preset']['specificPosts']) && is_array($content['preset']['specificPosts'])
                    ? array_values(array_filter(array_map('intval', $content['preset']['specificPosts'])))
                    : [];
                if ($targets && count($targets) <= 100) {
                    $paths[] = '/wp/v2/search?include=' . implode(',', $targets) . '&per_page=' . count($targets);
                }
                return $paths;

            case 'website-accessibility-presets-create':
                return [$post_search];

            case 'website-accessibility-settings':
                return ['/websac/v1/settings', $statement_page];

            case 'website-accessibility-about':
                return ['/websac/v1/system-info'];
        }

        return [];
    }

    /**
     * Print the REST answers the current screen needs with the page, computed
     * here, so it renders with its data instead of waiting for requests: every
     * REST request boots WordPress again (about half a second each on a typical
     * host), and some screens waited for two or three of them in a row. The same
     * mechanism the block editor uses (apiFetch's preloading middleware); each
     * answer is used once, later requests go to the server as before.
     *
     * @param string $hook_suffix
     * @return void
     */
    private function preload_rest_requests($hook_suffix) {
        /**
         * Filter the REST paths preloaded with a plugin screen. Add-on screens can add
         * the GET requests they make on load, written exactly as they request them.
         *
         * @param string[] $paths
         * @param string   $page        The screen's ?page= slug.
         * @param string   $hook_suffix
         */
        $paths = apply_filters('websac_admin_preload_paths', self::preload_paths(), self::current_page(), $hook_suffix);
        if (! is_array($paths) || ! $paths) {
            return;
        }

        $preloaded = [];
        foreach (array_unique(array_filter($paths, 'is_string')) as $path) {
            $preloaded = self::ALL_PRESETS_PATH === $path
                ? $this->preload_all_presets($preloaded)
                : rest_preload_api_request($preloaded, $path);
        }
        if (! $preloaded) {
            return;
        }

        wp_add_inline_script(
            'wp-api-fetch',
            sprintf(
                'wp.apiFetch.use( wp.apiFetch.createPreloadingMiddleware( %s ) );',
                wp_json_encode($preloaded, JSON_HEX_TAG | JSON_HEX_AMP)
            ),
            'after'
        );
    }

    /**
     * Every preset, as the store's per_page -1 request returns it. The REST API
     * caps a page at 100, so this is only preloaded when one page holds them all.
     *
     * @param array $memo Preloaded answers so far.
     * @return array
     */
    private function preload_all_presets(array $memo) {
        $request = new \WP_REST_Request('GET', '/wp/v2/websac_preset');
        $request->set_query_params(['context' => 'edit', 'per_page' => 100]);

        $response = rest_do_request($request);
        $headers  = $response->get_headers();
        if ($response->is_error() || 200 !== $response->get_status() || (int) ($headers['X-WP-TotalPages'] ?? 1) > 1) {
            return $memo;
        }

        $server   = rest_get_server();
        $response = apply_filters('rest_post_dispatch', rest_ensure_response($response), $server, $request);

        $memo[self::ALL_PRESETS_PATH] = [
            'body'    => $server->response_to_data($response, false),
            'headers' => $response->get_headers(),
        ];

        return $memo;
    }
}
