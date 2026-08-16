<?php

namespace Websac\Routes;

use Websac\Traits\Singleton;
use WP_REST_Request;
use WP_REST_Server;

if (! defined('ABSPATH')) {
    exit;
}

class SystemInfoRouteV1
{
    use Singleton;

    private function __construct()
    {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    public function register_routes()
    {
        register_rest_route('websac/v1', '/system-info', [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => [$this, 'get_system_info'],
            'permission_callback' => [$this, 'can_manage_options'],
        ]);
    }

    public function can_manage_options()
    {
        return current_user_can('manage_options');
    }

    public function get_system_info(WP_REST_Request $request)
    {
        global $wpdb;

        $max_upload = wp_max_upload_size();
        $max_upload_mb = round($max_upload / (1024 * 1024), 1);

        $presets_count = (int) wp_count_posts('websac_preset')->publish;

        $info = [
            'success'          => true,
            'plugin_version'   => defined('WEBSAC_VERSION') ? WEBSAC_VERSION : '1.3.0',
            'wordpress_version'=> get_bloginfo('version'),
            'php_version'      => PHP_VERSION,
            'mysql_version'    => $wpdb->db_version(),
            'presets_count'    => $presets_count,
            'max_upload_size'  => $max_upload_mb . ' MB',
        ];

        /**
         * Add-ons can append their own rows (e.g. custom profile counts).
         *
         * @param array $info
         */
        return apply_filters('websac_system_info', $info);
    }
}
