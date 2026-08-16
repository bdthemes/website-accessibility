<?php

namespace Websac\Routes;

use Websac\Traits\Singleton;

if (! defined('ABSPATH')) exit;

class PreferenceRouteV1
{
    use Singleton;

    const META_KEY = 'websac_preferences';
    const CACHE_KEY = 'websac_preference_stats';
    const CACHE_DURATION = 1 * MINUTE_IN_SECONDS;

    private function __construct()
    {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    /**
     * Register REST API routes
     */
    public function register_routes()
    {
        register_rest_route(
            'websac/v1',
            '/preference',
            [
                [
                    'methods'             => \WP_REST_Server::READABLE, // GET
                    'callback'            => [$this, 'get_preference'],
                    'permission_callback' => [$this, 'check_user_logged_in'],
                    'args'                => [
                        'post_id' => [
                            'type'     => 'integer',
                            'required' => false,
                        ],
                        'stats' => [
                            'type'     => 'boolean',
                            'required' => false,
                        ],
                    ],
                ],
                [
                    'methods'             => \WP_REST_Server::CREATABLE, // POST
                    'callback'            => [$this, 'save_preference'],
                    'permission_callback' => [$this, 'check_user_logged_in'],
                    'args'                => [
                        'post_id' => [
                            'type'     => 'integer',
                            'required' => true,
                        ],
                        'data' => [
                            'required' => true,
                        ],
                    ],
                ],
                [
                    'methods'             => \WP_REST_Server::DELETABLE, // DELETE
                    'callback'            => [$this, 'delete_preference'],
                    'permission_callback' => [$this, 'check_user_logged_in'],
                    'args'                => [
                        'post_id' => [
                            'type'     => 'integer',
                            'required' => true,
                        ],
                    ],
                ],
            ]
        );
    }

    /**
     * Check if user is logged in
     */
    public function check_user_logged_in()
    {
        return is_user_logged_in();
    }

    /**
     * Get user preferences or overall stats if ?stats=true
     */
    public function get_preference(\WP_REST_Request $request)
    {
        $stats = $request->get_param('stats');
        $user_id = get_current_user_id();
        $post_id = $request->get_param('post_id');

        /**
         * 📊 If "stats=true", return overall stats.
         *
         * This branch aggregates data across ALL users (total_users), so it must
         * be admin-only. The route's own permission_callback is is_user_logged_in(),
         * which would otherwise let any Subscriber read the site's user count and
         * trigger an all-users scan.
         */
        if ($stats) {
            if (! current_user_can('manage_options')) {
                return new \WP_Error(
                    'rest_forbidden',
                    __('Sorry, you are not allowed to view statistics.', 'website-accessibility'),
                    ['status' => rest_authorization_required_code()]
                );
            }

            // Try to get cached data
            $cached = get_transient(self::CACHE_KEY);
            if ($cached !== false) {
                return rest_ensure_response([
                    'success' => true,
                    'data'    => $cached,
                    'cached'  => true,
                ]);
            }

            $users = get_users(['fields' => ['ID']]);
            $total_users = count($users);
            $users_with_data = 0;

            foreach ($users as $user) {
                $pref = get_user_meta($user->ID, self::META_KEY, true);
                if (!empty($pref) && is_array($pref) && count($pref) > 0) {
                    $users_with_data++;
                }
            }

            $average_percent = $total_users > 0 ? round(($users_with_data / $total_users) * 100, 2) : 0;

            $data = [
                'total_users'     => $total_users,
                'users_with_data' => $users_with_data,
                'average_percent' => $average_percent,
                'timestamp'       => current_time('mysql'),
            ];

            // Cache briefly so dashboard changes are reflected quickly.
            set_transient(self::CACHE_KEY, $data, self::CACHE_DURATION);

            return rest_ensure_response([
                'success' => true,
                'data'    => $data,
                'cached'  => false,
            ]);
        }

        /**
         * 👤 Otherwise, return current user's preferences
         */
        $preferences = get_user_meta($user_id, self::META_KEY, true);

        if (empty($preferences) || !is_array($preferences)) {
            $preferences = [];
        }

        if ($post_id) {
            return rest_ensure_response([
                'success' => true,
                'data'    => isset($preferences[$post_id]) ? $preferences[$post_id] : [],
            ]);
        }

        return rest_ensure_response([
            'success' => true,
            'data'    => $preferences,
        ]);
    }

    /**
     * Save or update a preset for the current user
     */
    public function save_preference(\WP_REST_Request $request)
    {
        $user_id = get_current_user_id();
        $post_id = (int) $request->get_param('post_id');
        $data    = $request->get_param('data');

        if (! $post_id || ! get_post($post_id) || get_post_type($post_id) !== 'websac_preset') {
            return new \WP_Error('invalid_post', 'Invalid preset post ID', ['status' => 400]);
        }

        $preferences = get_user_meta($user_id, self::META_KEY, true);
        if (! is_array($preferences)) {
            $preferences = [];
        }

        $preferences[$post_id] = $data;

        update_user_meta($user_id, self::META_KEY, $preferences);

        // Clear cache when new preference is saved
        delete_transient(self::CACHE_KEY);

        return rest_ensure_response([
            'success' => true,
            'message' => 'Preset saved successfully',
            'data'    => [$post_id => $data],
        ]);
    }

    /**
     * Delete a preset by post_id
     */
    public function delete_preference(\WP_REST_Request $request)
    {
        $user_id = get_current_user_id();
        $post_id = (int) $request->get_param('post_id');

        $preferences = get_user_meta($user_id, self::META_KEY, true);
        if (! is_array($preferences) || ! isset($preferences[$post_id])) {
            return new \WP_Error('not_found', 'Preset not found', ['status' => 404]);
        }

        unset($preferences[$post_id]);
        update_user_meta($user_id, self::META_KEY, $preferences);

        // Clear cache when data changes
        delete_transient(self::CACHE_KEY);

        return rest_ensure_response([
            'success' => true,
            'message' => 'Preset deleted successfully',
        ]);
    }
}
