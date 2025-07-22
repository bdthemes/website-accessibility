<?php
/**
 * Admin Menu Handler
 */

namespace WebsiteAccessibility\Admin;

use WebsiteAccessibility\Traits\Singleton;

if (!defined('ABSPATH')) {
    exit;
}

class Menu {
    use Singleton;

    private function __construct() {
        add_action('admin_menu', [$this, 'register_menu']);
    }

    public function register_menu() {
        // Add main menu
        add_menu_page(
            __('Website Accessibility', 'website-accessibility'),
            __('Accessibility', 'website-accessibility'),
            'manage_options',
            'website-accessibility',
            null,
            'dashicons-universal-access',
            30
        );

        add_submenu_page(
            'website-accessibility',
            __('Dashboard', 'website-accessibility'),
            __('Dashboard', 'website-accessibility'),
            'manage_options',
            'website-accessibility',
            [$this, 'render_menu_page']
        );

        // Add submenu for presets
        add_submenu_page(
            'website-accessibility',
            __('Accessibility Presets', 'website-accessibility'),
            __('Presets', 'website-accessibility'),
            'manage_options',
            'website-accessibility-presets',
            [$this, 'render_menu_page']
        );

        // Add submenu for profiles
        add_submenu_page(
            'website-accessibility',
            __('Preset Profiles', 'website-accessibility'),
            __('Profiles', 'website-accessibility'),
            'manage_options',
            'website-accessibilityfiles',
            [$this, 'render_menu_page']
        );

        add_submenu_page(
            'website-accessibility-presets-create', // parent slug
            __('Create Preset', 'website-accessibility'),             // page title
            __('Create Preset', 'website-accessibility'), 
            'manage_options',            // capability
            'website-accessibility-presets-create', // menu slug
            [$this, 'render_menu_page']
        );

        add_submenu_page(
            'website-accessibility-presets-edit',
            __('Edit Preset', 'website-accessibility'),
            __('Edit Preset', 'website-accessibility'),
            'manage_options',
            'website-accessibility-presets-edit',
            [$this, 'render_menu_page']
        );

        add_submenu_page(
            'website-accessibility-presets-preview',
            __('Preview Preset', 'website-accessibility'),
            __('Preview Preset', 'website-accessibility'),
            'manage_options',
            'website-accessibility-presets-preview',
            [$this, 'render_menu_page']
        );

        add_submenu_page(
            'website-accessibilityfiles-create',
            __('Create Profile', 'website-accessibility'),
            __('Create Profile', 'website-accessibility'),
            'manage_options',
            'website-accessibilityfiles-create',
            [$this, 'render_menu_page']
        );

        add_submenu_page(
            'website-accessibilityfiles-edit',
            __('Edit Profile', 'website-accessibility'),
            __('Edit Profile', 'website-accessibility'),
            'manage_options',
            'website-accessibilityfiles-edit',
            [$this, 'render_menu_page']
        );

        // Remove the default post type submenus
        remove_submenu_page('website-accessibility', 'edit.php?post_type=accessibility_preset');
        remove_submenu_page('website-accessibility', 'edit.php?post_type=preset_profile');
    }

    public function render_menu_page() {
        echo '<div class="wrap">';
        echo '<div id="website-accessibility-admin"></div>';
        echo '</div>';
    }
} 