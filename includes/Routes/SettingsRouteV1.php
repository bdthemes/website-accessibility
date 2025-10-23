<?php

namespace bdthemes\websiteaccessibility\Routes;

use bdthemes\websiteaccessibility\Traits\Singleton;
use WP_REST_Request;
use WP_REST_Server;

if (! defined('ABSPATH')) exit;

class SettingsRouteV1
{
    use Singleton;

    const OPTION_KEY = 'websac_settings';

    /**
     * Default settings
     *
     * @var array
     */
    private $defaults = [
        'show_translations_consent' => true,
        'force_translate_site_language' => false,
        'show_usage_statistics'     => true,
    ];

    /**
     * Constructor
     */
    private function __construct()
    {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    /**
     * Register REST API routes
     */
    public function register_routes()
    {
        register_rest_route('sigmally/v1', '/settings', [
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
        $settings = wp_parse_args($settings, $this->defaults);

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
        update_option(self::OPTION_KEY, $this->defaults);

        return rest_ensure_response([
            'success' => true,
            'message' => __('Settings have been reset to defaults.', 'website-accessibility'),
            'data'    => $this->defaults,
        ]);
    }

    /**
     * Sanitize all settings fields
     */
    private function sanitize_settings(array $settings): array
    {
        $clean = [];

        $clean['show_translations_consent'] = isset($settings['show_translations_consent'])
            ? (bool) $settings['show_translations_consent']
            : $this->defaults['show_translations_consent'];

        $clean['force_translate_site_language'] = isset($settings['force_translate_site_language'])
            ? (bool) $settings['force_translate_site_language']
            : $this->defaults['force_translate_site_language'];
            
        $clean['show_usage_statistics'] = isset($settings['show_usage_statistics'])
            ? (bool) $settings['show_usage_statistics']
            : $this->defaults['show_usage_statistics'];

        return $clean;
    }
}
