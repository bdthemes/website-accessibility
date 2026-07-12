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

    /** Pro settings guided tour (runs after license activation). */
    public const PRO_SETTINGS_OPTION_KEY = 'websac_pro_settings_tour_completed';

    /** Custom Profiles guided tour (manual start from About). */
    public const PROFILE_OPTION_KEY = 'websac_profile_tour_completed';

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

        register_rest_route('one-accessibility/v1', '/pro-settings-tour/complete', [
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => [$this, 'mark_pro_settings_complete'],
            'permission_callback' => [$this, 'can_complete_tour'],
        ]);

        register_rest_route('one-accessibility/v1', '/profile-tour/complete', [
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => [$this, 'mark_profile_complete'],
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

    /**
     * Mark the Pro settings guided tour as finished.
     */
    public function mark_pro_settings_complete(WP_REST_Request $request)
    {
        update_option(self::PRO_SETTINGS_OPTION_KEY, '1', false);

        return rest_ensure_response([
            'success' => true,
        ]);
    }

    /**
     * Whether the Pro settings tour has been completed or skipped.
     */
    public static function is_pro_settings_completed()
    {
        return (string) get_option(self::PRO_SETTINGS_OPTION_KEY, '') === '1';
    }

    /**
     * Mark the Custom Profiles guided tour as finished.
     */
    public function mark_profile_complete(WP_REST_Request $request)
    {
        update_option(self::PROFILE_OPTION_KEY, '1', false);

        return rest_ensure_response([
            'success' => true,
        ]);
    }

    /**
     * Whether the Custom Profiles tour has been completed or skipped.
     */
    public static function is_profile_completed()
    {
        return (string) get_option(self::PROFILE_OPTION_KEY, '') === '1';
    }
}
