<?php

/**
 * Register Accessibility Preset Post Type
 */

namespace bdthemes\websiteaccessibility\Core;

use bdthemes\websiteaccessibility\Traits\Singleton;

if (!defined('ABSPATH')) {
    exit;
}

class AccessibilityPreset
{
    use Singleton;

    private function __construct()
    {
        add_action('init', [$this, 'register_post_type']);
        add_filter('wp_insert_post_data', [$this, 'save_preset'], 10, 2);
    }

    public function register_post_type()
    {
        register_post_type('websac_preset', [
            'labels' => [
                'name' => __('Presets', 'website-accessibility'),
                'singular_name' => __('Preset', 'website-accessibility'),
            ],
            'public' => false,
            'show_ui' => false,
            'show_in_menu' => false,
            'menu_icon' => 'dashicons-universal-access',
            'supports' => ['title', 'editor'],
            'show_in_rest' => true,
            // Presets drive the site-wide widget and must only be managed by
            // administrators. Without an explicit map, create_posts defaults to
            // the primitive edit_posts cap, letting Authors create/publish
            // presets through the core /wp/v2 REST endpoint. Lock every write
            // capability to manage_options (map_meta_cap resolves edit/delete of
            // individual posts to these primitives). The admin React app runs as
            // a manage_options user, so its core-data CRUD is unaffected.
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

    public function save_preset($data, $postarr)
    {
        if ($data['post_type'] !== 'websac_preset') {
            return $data;
        }
        
        // decode content
        $content = json_decode($data['post_content'], true);
        if (! is_array($content)) {
            return $data;
        }

        $isActive = $content['preset']['active'] ?? false;
        $currentCondition = $content['preset']['condition'] ?? null;

        // if becoming active and has condition – auto deactivate others
        if ($isActive && $currentCondition) {

            $existing = get_posts([
                'post_type'      => 'websac_preset',
                'posts_per_page' => -1,
                'post_status'    => 'publish',
            ]);

            foreach ($existing as $item) {
                if (isset($postarr['ID']) && $postarr['ID'] == $item->ID) continue;

                $item_content = json_decode($item->post_content, true);

                if (
                    is_array($item_content)
                    && ($item_content['preset']['condition'] ?? null) === $currentCondition
                    && ($item_content['preset']['active'] ?? false) === true
                ) {
                    $item_content['preset']['active'] = false;

                    wp_update_post([
                        'ID'          => $item->ID,
                        'post_content' => wp_slash(json_encode($item_content)) // important: wp_slash
                    ]);
                }
            }
        }

        return $data;
    }
}
