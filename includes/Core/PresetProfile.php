<?php
/**
 * Register Preset Profile Post Type
 */

namespace WebsiteAccessibility\Core;

use WebsiteAccessibility\Traits\Singleton;

if (!defined('ABSPATH')) {
    exit;
}

class PresetProfile {
    use Singleton;

    private function __construct() {
        add_action('init', [$this, 'register_post_type']);
    }

    public function register_post_type() {
        register_post_type('wap_profile', [
            'labels' => [
                'name' => __('Profiles', 'website-accessibility'),
                'singular_name' => __('Profile', 'website-accessibility'),
            ],
            'public' => false,
            'show_ui' => false,
            'show_in_menu' => false,
            'menu_icon' => 'dashicons-admin-users',
            'supports' => ['title', 'editor'],
            'show_in_rest' => true,
        ]);
    }
} 