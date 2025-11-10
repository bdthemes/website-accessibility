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
