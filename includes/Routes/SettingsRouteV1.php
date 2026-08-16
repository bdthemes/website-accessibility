<?php

namespace Websac\Routes;

use Websac\Traits\Singleton;
use WP_REST_Request;
use WP_REST_Server;

if (! defined('ABSPATH')) exit;

class SettingsRouteV1
{
    use Singleton;

    const OPTION_KEY = 'websac_settings';

    /**
     * Default settings for options that ship with this plugin.
     *
     * Add-ons register their own keys through the `websac_settings_defaults`
     * filter and sanitize them through `websac_sanitize_settings`.
     *
     * @var array
     */
    private $defaults = [
        'show_usage_statistics' => true,
        /** Raw CSS appended on the public site (toolbar / widget tweaks). Stored as plain text. */
        'frontend_custom_css'   => '',
    ];

    /**
     * Constructor
     */
    private function __construct()
    {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    public static function get_defaults_settings()
    {
        return self::get_instance()->get_defaults();
    }

    /**
     * Defaults including keys registered by add-ons.
     *
     * @return array
     */
    public function get_defaults()
    {
        $defaults = apply_filters('websac_settings_defaults', $this->defaults);
        return is_array($defaults) ? $defaults : $this->defaults;
    }

    /**
     * Register REST API routes
     */
    public function register_routes()
    {
        register_rest_route('websac/v1', '/settings', [
            [
                'methods'             => WP_REST_Server::READABLE, // GET
                'callback'            => [$this, 'get_settings'],
                'permission_callback' => [$this, 'can_manage_settings'],
            ],
            [
                'methods'             => WP_REST_Server::CREATABLE, // POST
                'callback'            => [$this, 'update_settings'],
                'permission_callback' => [$this, 'can_manage_settings'],
            ],
            [
                'methods'             => WP_REST_Server::DELETABLE, // DELETE
                'callback'            => [$this, 'reset_settings'],
                'permission_callback' => [$this, 'can_manage_settings'],
            ],
        ]);
    }

    /**
     * Permission check
     */
    public function can_manage_settings()
    {
        return current_user_can('manage_options');
    }

    /**
     * Get plugin settings (merged with defaults)
     */
    public function get_settings(WP_REST_Request $request)
    {
        $settings = get_option(self::OPTION_KEY, []);
        $settings = wp_parse_args($settings, $this->get_defaults());

        return rest_ensure_response([
            'success' => true,
            'data'    => $settings,
        ]);
    }

    /**
     * Update plugin settings directly from key/value pairs
     */
    public function update_settings(WP_REST_Request $request)
    {
        $incoming = (array) $request->get_json_params();
        $current  = get_option(self::OPTION_KEY, []);
        $merged   = wp_parse_args($incoming, $current);

        $sanitized = $this->sanitize_settings($merged);

        // Keys owned by a currently inactive add-on are neither known nor
        // sanitizable here: keep their previously stored (already sanitized)
        // values instead of silently dropping them; incoming values are ignored.
        if (is_array($current)) {
            $sanitized = array_merge(array_diff_key($current, $sanitized), $sanitized);
        }

        update_option(self::OPTION_KEY, $sanitized);

        return rest_ensure_response([
            'success' => true,
            'message' => __('Settings updated successfully.', 'website-accessibility'),
            'data'    => $sanitized,
        ]);
    }

    /**
     * Reset all settings to defaults
     */
    public function reset_settings(WP_REST_Request $request)
    {
        $defaults = $this->get_defaults();
        update_option(self::OPTION_KEY, $defaults);

        return rest_ensure_response([
            'success' => true,
            'message' => __('Settings have been reset to defaults.', 'website-accessibility'),
            'data'    => $defaults,
        ]);
    }

    /**
     * Sanitize all settings fields.
     *
     * Public so the import routes can run imported settings through the same
     * whitelist/sanitization as a normal save (prevents e.g. an unsanitized
     * frontend_custom_css from being stored via import).
     */
    public function sanitize_settings(array $settings): array
    {
        $clean = [];

        $clean['show_usage_statistics'] = isset($settings['show_usage_statistics'])
            ? (bool) $settings['show_usage_statistics']
            : $this->defaults['show_usage_statistics'];

        $css_raw = isset($settings['frontend_custom_css'])
            ? wp_strip_all_tags((string) $settings['frontend_custom_css'])
            : (string) $this->defaults['frontend_custom_css'];
        if (strlen($css_raw) > 524288) {
            $css_raw = substr($css_raw, 0, 524288);
        }
        $clean['frontend_custom_css'] = $css_raw;

        /**
         * Let add-ons whitelist and sanitize the settings keys they own.
         *
         * @param array $clean    Sanitized settings so far (only keys owned by this plugin).
         * @param array $settings Raw merged settings as submitted.
         */
        $clean = apply_filters('websac_sanitize_settings', $clean, $settings);

        return is_array($clean) ? $clean : [];
    }
}
