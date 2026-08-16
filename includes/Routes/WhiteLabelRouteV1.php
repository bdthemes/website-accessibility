<?php
/**
 * REST: White label configuration.
 *
 * @package WebsiteAccessibility
 */

namespace Websac\Routes;

use Websac\Admin\WhiteLabelAdmin;
use Websac\Core\WhiteLabel;
use Websac\Traits\Singleton;
use WP_REST_Request;
use WP_REST_Server;

if (!defined('ABSPATH')) {
    exit;
}

class WhiteLabelRouteV1 {

    use Singleton;

    private function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    /**
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            'websac/v1',
            '/white-label',
            array(
                array(
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => array($this, 'get_white_label'),
                    'permission_callback' => array($this, 'check_manage_options'),
                ),
                array(
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => array($this, 'save_white_label'),
                    'permission_callback' => array($this, 'check_eligible_manage'),
                ),
            )
        );

        register_rest_route(
            'websac/v1',
            '/white-label/revoke-token',
            array(
                array(
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => array($this, 'revoke_token'),
                    'permission_callback' => array($this, 'check_eligible_manage'),
                ),
            )
        );
    }

    /**
     * @return bool
     */
    public function check_manage_options() {
        return current_user_can('manage_options');
    }

    /**
     * @return bool|\WP_Error
     */
    public function check_eligible_manage() {
        if (!current_user_can('manage_options')) {
            return new \WP_Error('forbidden', __('Permission denied.', 'website-accessibility'), array('status' => 403));
        }
        return true;
    }

    /**
     * @param WP_REST_Request $request Request.
     * @return \WP_REST_Response
     */
    public function get_white_label($request) {
        $token_row = get_option(WhiteLabel::OPTION_ACCESS_TOKEN, array());

        $localhost = get_option(WhiteLabel::OPTION_LOCALHOST_EMAIL, null);
        $localhost_preview = null;
        if (is_array($localhost) && !empty($localhost['access_url'])) {
            $localhost_preview = array(
                'access_url' => (string) $localhost['access_url'],
                'message'    => isset($localhost['message']) ? (string) $localhost['message'] : '',
            );
        }

        return rest_ensure_response(
            array(
                'success'           => true,
                'eligible'          => WhiteLabel::is_white_label_eligible(),
                'enabled'           => (bool) get_option(WhiteLabel::OPTION_ENABLED, false),
                'hide_license'      => (bool) get_option('websac_white_label_hide_license', false),
                'hide_admin'        => (bool) get_option('websac_white_label_hide_admin', false),
                'title'             => (string) get_option('websac_white_label_title', ''),
                'icon'              => (string) get_option('websac_white_label_icon', ''),
                'icon_id'           => (int) get_option('websac_white_label_icon_id', 0),
                'logo'              => (string) get_option('websac_white_label_logo', ''),
                'logo_id'           => (int) get_option('websac_white_label_logo_id', 0),
                'panel_header_icon'    => (string) get_option('websac_white_label_panel_header_icon', ''),
                'panel_header_icon_id' => (int) get_option('websac_white_label_panel_header_icon_id', 0),
                'panel_footer_icon'    => (string) get_option('websac_white_label_panel_footer_icon', ''),
                'panel_footer_icon_id' => (int) get_option('websac_white_label_panel_footer_icon_id', 0),
                'has_access_token'  => !empty($token_row) && is_array($token_row) && !empty($token_row['token']),
                'localhost_preview' => $localhost_preview,
            )
        );
    }

    /**
     * @param WP_REST_Request $request Request.
     * @return \WP_REST_Response|\WP_Error
     */
    public function save_white_label($request) {
        $params = $request->get_json_params();
        if (!is_array($params)) {
            $params = array();
        }

        $enabled      = !empty($params['enabled']);
        $hide_license = !empty($params['hide_license']);
        $hide_admin   = !empty($params['hide_admin']);
        $title        = isset($params['title']) ? sanitize_text_field($params['title']) : '';
        $icon         = isset($params['icon']) ? WhiteLabel::sanitize_brand_asset_url($params['icon']) : '';
        $icon_id      = isset($params['icon_id']) ? absint($params['icon_id']) : 0;
        $logo         = isset($params['logo']) ? WhiteLabel::sanitize_brand_asset_url($params['logo']) : '';
        $logo_id      = isset($params['logo_id']) ? absint($params['logo_id']) : 0;
        $panel_header_icon    = isset($params['panel_header_icon']) ? WhiteLabel::sanitize_brand_asset_url($params['panel_header_icon']) : '';
        $panel_header_icon_id = isset($params['panel_header_icon_id']) ? absint($params['panel_header_icon_id']) : 0;
        $panel_footer_icon    = isset($params['panel_footer_icon']) ? WhiteLabel::sanitize_brand_asset_url($params['panel_footer_icon']) : '';
        $panel_footer_icon_id = isset($params['panel_footer_icon_id']) ? absint($params['panel_footer_icon_id']) : 0;

        update_option(WhiteLabel::OPTION_ENABLED, $enabled);
        update_option('websac_white_label_hide_license', $hide_license);
        update_option('websac_white_label_hide_admin', $hide_admin);
        update_option('websac_white_label_title', $title);
        update_option('websac_white_label_icon', $icon);
        update_option('websac_white_label_icon_id', $icon_id);
        update_option('websac_white_label_logo', $logo);
        update_option('websac_white_label_logo_id', $logo_id);
        update_option('websac_white_label_panel_header_icon', $panel_header_icon);
        update_option('websac_white_label_panel_header_icon_id', $panel_header_icon_id);
        update_option('websac_white_label_panel_footer_icon', $panel_footer_icon);
        update_option('websac_white_label_panel_footer_icon_id', $panel_footer_icon_id);

        if ($enabled) {
            update_option(WhiteLabel::OPTION_STATUS, true);
        } else {
            delete_option(WhiteLabel::OPTION_STATUS);
            delete_option(WhiteLabel::OPTION_ACCESS_TOKEN);
            delete_option(WhiteLabel::OPTION_LOCALHOST_EMAIL);
        }

        $email_sent = false;
        if ($enabled && $hide_admin) {
            $email_sent = WhiteLabelAdmin::send_recovery_email();
        }

        return rest_ensure_response(
            array(
                'success'    => true,
                'message'    => __('White label settings saved.', 'website-accessibility'),
                'email_sent' => $email_sent,
                'settings'   => $this->get_white_label($request)->get_data(),
            )
        );
    }

    /**
     * @param WP_REST_Request $request Request.
     * @return \WP_REST_Response|\WP_Error
     */
    public function revoke_token($request) {
        $ok = WhiteLabel::revoke_access_token();
        if (!$ok) {
            return new \WP_Error(
                'websac_no_token',
                __('No active recovery token found.', 'website-accessibility'),
                array('status' => 400)
            );
        }

        return rest_ensure_response(
            array(
                'success' => true,
                'message' => __('Recovery token revoked.', 'website-accessibility'),
            )
        );
    }
}
