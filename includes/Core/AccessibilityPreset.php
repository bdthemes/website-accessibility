<?php
/**
 * Register Accessibility Preset Post Type
 */

namespace WebsiteAccessibility\Core;

use WebsiteAccessibility\Traits\Singleton;

if (!defined('ABSPATH')) {
    exit;
}

class AccessibilityPreset {
    use Singleton;

    private function __construct() {
        add_action('init', [$this, 'register_post_type']);
    }

    public function register_post_type() {
        register_post_type('wap_preset', [
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
} 