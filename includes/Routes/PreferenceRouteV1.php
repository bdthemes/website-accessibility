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
                            'required'          => true,
                            'validate_callback' => [$this, 'validate_preference_data'],
                            'sanitize_callback' => [$this, 'sanitize_preference_data'],
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
     * Preference payloads are small JSON objects (profile, feature steps, language...).
     * Reject anything that is not an object/array or is unreasonably large.
     *
     * @param mixed $value
     * @return bool|\WP_Error
     */
    public function validate_preference_data($value)
    {
        if (! is_array($value)) {
            return new \WP_Error('rest_invalid_param', __('Preference data must be an object.', 'website-accessibility'), ['status' => 400]);
        }

        $encoded = wp_json_encode($value);
        if (! is_string($encoded) || strlen($encoded) > 65536) {
            return new \WP_Error('rest_invalid_param', __('Preference data is too large.', 'website-accessibility'), ['status' => 400]);
        }

        return true;
    }

    /**
     * REST sanitize_callback: recursively sanitize scalar leaves; keys are
     * limited to plain identifiers.
     *
     * @param mixed $value
     * @return mixed
     */
    public function sanitize_preference_data($value)
    {
        return $this->sanitize_preference_value($value, 0);
    }

    /**
     * @param mixed $value
     * @param int   $depth
     * @return mixed
     */
    private function sanitize_preference_value($value, $depth)
    {
        if ($depth > 8) {
            return null;
        }

        if (is_array($value)) {
            $clean = [];
            foreach ($value as $key => $item) {
                // Keys are camelCase feature/profile identifiers: keep case, strip anything odd.
                $key = is_int($key) ? $key : substr(preg_replace('/[^A-Za-z0-9_\-]/', '', (string) $key), 0, 64);
                if ($key === '') {
                    continue;
                }
                $clean[$key] = $this->sanitize_preference_value($item, $depth + 1);
            }
            return $clean;
        }

        if (is_bool($value) || is_int($value) || is_float($value) || $value === null) {
            return $value;
        }

        // Leaves are feature values / CSS fragments / labels: strip markup and
        // control characters but keep punctuation such as %, (), # intact.
        $text = wp_check_invalid_utf8((string) $value);
        $text = wp_strip_all_tags($text, false);
        $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $text);

        return substr((string) $text, 0, 2048);
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
            return new \WP_Error('invalid_post', __('Invalid preset post ID.', 'website-accessibility'), ['status' => 400]);
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
            'message' => __('Preference saved successfully.', 'website-accessibility'),
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
            return new \WP_Error('not_found', __('Preference not found.', 'website-accessibility'), ['status' => 404]);
        }

        unset($preferences[$post_id]);
        update_user_meta($user_id, self::META_KEY, $preferences);

        // Clear cache when data changes
        delete_transient(self::CACHE_KEY);

        return rest_ensure_response([
            'success' => true,
            'message' => __('Preference deleted successfully.', 'website-accessibility'),
        ]);
    }
}
