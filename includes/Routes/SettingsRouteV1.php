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
        'show_translations_consent'     => true,
        'force_translate_site_language' => false,
        'show_usage_statistics'         => true,
        'enable_accessibility_checker'  => true,
        'ai_provider'                   => 'openai',
        'openai_api_key'                => '',
        'gemini_api_key'                => '',
        /** Raw CSS appended on the public site (toolbar / widget tweaks). Stored as plain text. */
        'frontend_custom_css'           => '',
        'compliance_wcag_level'         => 'all',
        'compliance_email_alerts'       => true,
        'compliance_auto_scan_days'     => 0,
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
        return self::get_instance()->defaults;
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

        $clean['enable_accessibility_checker'] = isset($settings['enable_accessibility_checker'])
            ? (bool) $settings['enable_accessibility_checker']
            : $this->defaults['enable_accessibility_checker'];

        $clean['openai_api_key'] = isset($settings['openai_api_key'])
            ? sanitize_text_field((string) $settings['openai_api_key'])
            : $this->defaults['openai_api_key'];

        $provider = isset($settings['ai_provider'])
            ? sanitize_key((string) $settings['ai_provider'])
            : $this->defaults['ai_provider'];
        $clean['ai_provider'] = in_array($provider, ['openai', 'gemini'], true) ? $provider : 'openai';

        $clean['gemini_api_key'] = isset($settings['gemini_api_key'])
            ? sanitize_text_field((string) $settings['gemini_api_key'])
            : $this->defaults['gemini_api_key'];

        $css_raw = isset($settings['frontend_custom_css'])
            ? wp_strip_all_tags((string) $settings['frontend_custom_css'])
            : (string) $this->defaults['frontend_custom_css'];
        if (strlen($css_raw) > 524288) {
            $css_raw = substr($css_raw, 0, 524288);
        }
        $clean['frontend_custom_css'] = $css_raw;

        $wcag = isset($settings['compliance_wcag_level'])
            ? sanitize_key((string) $settings['compliance_wcag_level'])
            : $this->defaults['compliance_wcag_level'];
        $clean['compliance_wcag_level'] = in_array($wcag, ['all', 'a', 'aa', 'aaa'], true)
            ? $wcag
            : 'all';

        $clean['compliance_email_alerts'] = isset($settings['compliance_email_alerts'])
            ? (bool) $settings['compliance_email_alerts']
            : $this->defaults['compliance_email_alerts'];

        $auto_days = isset($settings['compliance_auto_scan_days'])
            ? (int) $settings['compliance_auto_scan_days']
            : (int) $this->defaults['compliance_auto_scan_days'];
        $clean['compliance_auto_scan_days'] = in_array($auto_days, [0, 7, 14, 30], true) ? $auto_days : 0;

        return $clean;
    }
}
