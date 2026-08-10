<?php
/**
 * Register Preset Profile Post Type
 */

namespace bdthemes\websiteaccessibility\Core;

use bdthemes\websiteaccessibility\Traits\Singleton;

if (!defined('ABSPATH')) {
    exit;
}

class PresetProfile {
    use Singleton;

    private function __construct() {
        add_action('init', [$this, 'register_post_type']);
    }

    public function register_post_type() {
        register_post_type('websac_profile', [
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
            // Same rationale as websac_preset: profiles feed the public widget and
            // must be admin-only. Lock all write caps to manage_options so a
            // non-admin cannot create/edit profiles via the core /wp/v2 REST route.
            'map_meta_cap' => true,
            'capabilities' => [
                'create_posts'           => 'manage_options',
                'edit_posts'             => 'manage_options',
                'edit_others_posts'      => 'manage_options',
                'edit_published_posts'   => 'manage_options',
                'edit_private_posts'     => 'manage_options',
                'publish_posts'          => 'manage_options',
                'read_private_posts'     => 'manage_options',
                'delete_posts'           => 'manage_options',
                'delete_others_posts'    => 'manage_options',
                'delete_published_posts' => 'manage_options',
                'delete_private_posts'   => 'manage_options',
            ],
        ]);
    }
} 