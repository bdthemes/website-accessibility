<?php

/**
 * REST controller for presets (/wp/v2/websac_preset).
 */

namespace Websac\Core;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Reading presets over REST takes the capability that editing them takes.
 *
 * Presets are not public (`public => false`), but the core posts controller lets
 * anyone read the published posts of every post type shown in REST. Without this,
 * every visitor could list every preset, inactive ones included, with the posts
 * each one targets. The page itself gets only the preset it runs with
 * (View\Frontend), and the admin screens read them as a manage_options user.
 */
class PresetRestController extends \WP_REST_Posts_Controller
{
    /**
     * @return true|\WP_Error
     */
    private function check_can_manage()
    {
        $post_type = get_post_type_object($this->post_type);
        if ($post_type && current_user_can($post_type->cap->edit_posts)) {
            return true;
        }

        return new \WP_Error(
            'rest_forbidden',
            __('Sorry, you are not allowed to view presets.', 'website-accessibility'),
            ['status' => rest_authorization_required_code()]
        );
    }

    /**
     * @param \WP_REST_Request $request
     * @return true|\WP_Error
     */
    public function get_items_permissions_check($request)
    {
        $allowed = $this->check_can_manage();
        return is_wp_error($allowed) ? $allowed : parent::get_items_permissions_check($request);
    }

    /**
     * @param \WP_REST_Request $request
     * @return bool|\WP_Error
     */
    public function get_item_permissions_check($request)
    {
        $allowed = $this->check_can_manage();
        return is_wp_error($allowed) ? $allowed : parent::get_item_permissions_check($request);
    }
}
