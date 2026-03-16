<?php


namespace bdthemes\websiteaccessibility\Admin\License;

use bdthemes\websiteaccessibility\Traits\Singleton;

/**
 * License REST API Controller
 *
 * @package WebsiteAccessibility
 * @since 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class LicenseController extends \WP_REST_Controller {

    use Singleton;

    /**
     * Namespace
     */
    protected $namespace = 'one-accessibility/v1';

    /**
     * Route base
     */
    protected $rest_base = 'license';

    /**
     * Register routes
     */

    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }
    public function register_routes() {
        // Check license status
        register_rest_route($this->namespace, '/' . $this->rest_base . '/status', [
            [
                'methods' => \WP_REST_Server::READABLE,
                'callback' => [$this, 'get_license_status'],
                'permission_callback' => [$this, 'check_permission'],
            ],
        ]);

        // Activate license
        register_rest_route($this->namespace, '/' . $this->rest_base . '/activate', [
            [
                'methods' => \WP_REST_Server::CREATABLE,
                'callback' => [$this, 'activate_license'],
                'permission_callback' => [$this, 'check_permission'],
                'args' => [
                    'license_key' => [
                        'required' => true,
                        'type' => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ],
                    'email' => [
                        'required' => true,
                        'type' => 'string',
                        'sanitize_callback' => 'sanitize_email',
                    ],
                ],
            ],
        ]);

        // Deactivate license
        register_rest_route($this->namespace, '/' . $this->rest_base . '/deactivate', [
            [
                'methods' => \WP_REST_Server::DELETABLE,
                'callback' => [$this, 'deactivate_license'],
                'permission_callback' => [$this, 'check_permission'],
            ],
        ]);

        // Get license info
        register_rest_route($this->namespace, '/' . $this->rest_base . '/info', [
            [
                'methods' => \WP_REST_Server::READABLE,
                'callback' => [$this, 'get_license_info'],
                'permission_callback' => [$this, 'check_permission'],
            ],
        ]);
    }

    /**
     * Check permissions
     */
    public function check_permission() {
        return current_user_can('manage_options');
    }

    /**
     * Get license status
     */
    public function get_license_status($request) {
        $main_lic_key = "WebsiteAccessibility_lic_Key";
        $lic_key_name = LicenseBase::get_lic_key_param($main_lic_key);
        $license_key = get_option($lic_key_name, "");
        $lice_email = get_option("WebsiteAccessibility_lic_email", "");

        if (empty($license_key)) {
            if (defined('WEBSITE_ACCESSIBILITY_LICENSE_KEY') && !empty(constant('WEBSITE_ACCESSIBILITY_LICENSE_KEY'))) {
                $license_key = constant('WEBSITE_ACCESSIBILITY_LICENSE_KEY');
            } else {
                return new \WP_REST_Response([
                    'success' => true,
                    'is_active' => false,
                    'license_data' => null,
                    'error_message' => '',
                ], 200);
            }
        }

        $license_message = '';
        $response_obj = null;

        $is_active = LicenseBase::check_wp_plugin(
            $license_key,
            $lice_email,
            $license_message,
            $response_obj,
            PLUGIN_FILE
        );

        if ($is_active && $response_obj) {
            return new \WP_REST_Response([
                'success' => true,
                'is_active' => true,
                'license_data' => [
                    'is_valid' => $response_obj->is_valid ?? false,
                    'license_title' => $response_obj->license_title ?? 'N/A',
                    'expire_date' => $response_obj->expire_date ?? 'N/A',
                    'support_end' => $response_obj->support_end ?? 'N/A',
                    'license_key' => $response_obj->license_key ?? '',
                    'expire_renew_link' => $response_obj->expire_renew_link ?? '',
                    'support_renew_link' => $response_obj->support_renew_link ?? '',
                ],
            ], 200);
        }

        return new \WP_REST_Response([
            'success' => true,
            'is_active' => false,
            'license_data' => null,
            'error_message' => $license_message,
        ], 200);
    }

    /**
     * Activate license
     */
    public function activate_license($request) {
        $license_key = $request->get_param('license_key');
        $email = $request->get_param('email');

        if (empty($license_key) || empty($email)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => __('License key and email are required', 'website-accessibility'),
            ], 400);
        }

        if (defined('WEBSITE_ACCESSIBILITY_LICENSE_KEY') && !empty(constant('WEBSITE_ACCESSIBILITY_LICENSE_KEY'))) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => __('License is managed via constant. Cannot activate manually.', 'website-accessibility'),
            ], 400);
        }

        $main_lic_key = "WebsiteAccessibility_lic_Key";
        $lic_key_name = LicenseBase::get_lic_key_param($main_lic_key);

        update_option($lic_key_name, $license_key);
        update_option("WebsiteAccessibility_lic_email", $email);

        $license_message = '';
        $response_obj = null;

        $is_active = LicenseBase::check_wp_plugin(
            $license_key,
            $email,
            $license_message,
            $response_obj,
            PLUGIN_FILE
        );

        if ($is_active && $response_obj) {
            update_option('_site_transient_update_plugins', '');

            return new \WP_REST_Response([
                'success' => true,
                'message' => __('License activated successfully', 'website-accessibility'),
                'license_data' => [
                    'is_valid' => $response_obj->is_valid ?? false,
                    'license_title' => $response_obj->license_title ?? 'N/A',
                    'expire_date' => $response_obj->expire_date ?? 'N/A',
                    'support_end' => $response_obj->support_end ?? 'N/A',
                    'license_key' => $response_obj->license_key ?? '',
                    'expire_renew_link' => $response_obj->expire_renew_link ?? '',
                    'support_renew_link' => $response_obj->support_renew_link ?? '',
                ],
            ], 200);
        }

        update_option($lic_key_name, "");

        return new \WP_REST_Response([
            'success' => false,
            'message' => $license_message ?: __('Failed to activate license', 'website-accessibility'),
        ], 400);
    }

    /**
     * Deactivate license
     */
    public function deactivate_license($request) {
        $message = "";
        $main_lic_key = "WebsiteAccessibility_lic_Key"; 
        $lic_key_name = LicenseBase::get_lic_key_param($main_lic_key);

        if (LicenseBase::remove_license_key(PLUGIN_FILE, $message)) {
            update_option($lic_key_name, "");
            update_option('_site_transient_update_plugins', '');

            return new \WP_REST_Response([
                'success' => true,
                'message' => __('License deactivated successfully', 'website-accessibility'),
            ], 200);
        }

        return new \WP_REST_Response([
            'success' => false,
            'message' => $message ?: __('Failed to deactivate license', 'website-accessibility'),
        ], 400);
    }

    /**
     * Get license info
     */
    public function get_license_info($request) {
        $response_obj = LicenseBase::get_register_info();

        if ($response_obj && !empty($response_obj->is_valid)) {
            return new \WP_REST_Response([
                'success' => true,
                'data' => [
                    'is_valid' => $response_obj->is_valid ?? false,
                    'license_title' => $response_obj->license_title ?? 'N/A',
                    'expire_date' => $response_obj->expire_date ?? 'N/A',
                    'support_end' => $response_obj->support_end ?? 'N/A',
                    'license_key' => $response_obj->license_key ?? '',
                    'expire_renew_link' => $response_obj->expire_renew_link ?? '',
                    'support_renew_link' => $response_obj->support_renew_link ?? '',
                ],
            ], 200);
        }

        return new \WP_REST_Response([
            'success' => false,
            'message' => __('No active license found', 'website-accessibility'),
        ], 404);
    }
}
