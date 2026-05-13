<?php

namespace bdthemes\websiteaccessibility\Routes;

use bdthemes\websiteaccessibility\Traits\Singleton;
use WP_REST_Request;
use WP_REST_Server;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Persists admin dashboard guided tour completion (no localStorage).
 */
class DashboardTourRouteV1
{
    use Singleton;

    public const OPTION_KEY = 'websac_dashboard_tour_completed';

    private function __construct()
    {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    public function register_routes()
    {
        register_rest_route('one-accessibility/v1', '/dashboard-tour/complete', [
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => [$this, 'mark_complete'],
            'permission_callback' => [$this, 'can_complete_tour'],
        ]);
    }

    /**
     * Tour is per-site; only administrators who can manage the plugin should persist it.
     */
    public function can_complete_tour()
    {
        return current_user_can('manage_options');
    }

    /**
     * Mark the guided tour as finished (first-run auto tour will not run again).
     */
    public function mark_complete(WP_REST_Request $request)
    {
        update_option(self::OPTION_KEY, '1', false);

        return rest_ensure_response([
            'success' => true,
        ]);
    }

    /**
     * Whether the tour has already been completed or skipped (stored in wp_options).
     */
    public static function is_completed()
    {
        return (string) get_option(self::OPTION_KEY, '') === '1';
    }
}
