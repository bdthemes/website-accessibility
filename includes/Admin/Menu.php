<?php

/**
 * Admin Menu Handler
 */

namespace bdthemes\websiteaccessibility\Admin;

use bdthemes\websiteaccessibility\Traits\Singleton;

if (!defined('ABSPATH')) {
    exit;
}

class Menu
{
    use Singleton;

    private function __construct()
    {
        add_action('admin_menu', [$this, 'register_menu']);
        add_action('admin_footer', [$this, 'bfcm_menu_redirect_script']);
    }

    public function register_menu()
    {
        // Add main menu
        add_menu_page(
            __('One Accessibility', 'website-accessibility'),
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
            __('Custom Profiles', 'website-accessibility'),
            'manage_options',
            'website-accessibilityfiles',
            [$this, 'render_menu_page']
        );

        add_submenu_page(
            'website-accessibility',
            __('Settings', 'website-accessibility'),
            __('Settings', 'website-accessibility'),
            'manage_options',
            'website-accessibility-settings',
            [$this, 'render_menu_page']
        );

        // Add BFCM Deal Menu
        $license = null;
		if (class_exists('\bdthemes\websiteaccessibilitypro\Admin\License')) {
            $license = \bdthemes\websiteaccessibilitypro\Admin\License::get_instance();
        }

        $has_pro_active = $license && method_exists($license, 'is_license_valid') ? $license->is_license_valid() : false;
        if(!$has_pro_active) {
            add_submenu_page(
                'website-accessibility',
                __('Black Friday Limited Offer Up To 87%', 'website-accessibility'),
                '<span style="color:#ff9800;font-weight:bold;">' . __('Black Friday Limited Offer Up To 87%', 'website-accessibility') . '</span>',
                'manage_options',
                'websac-bfcm-deal',
                [$this, 'redirect_to_bfcm_deal'],
                999
            );
        }

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

        do_action('websac_pro_admin_menu');


        // Remove the default post type submenus
        remove_submenu_page('website-accessibility', 'edit.php?post_type=accessibility_preset');
        remove_submenu_page('website-accessibility', 'edit.php?post_type=preset_profile');
    }

    public function render_menu_page()
    {
        echo '<div class="wrap">';
        echo '<div id="website-accessibility-admin"></div>';
        echo '</div>';
    }

    public function redirect_to_bfcm_deal()
    {
        // This page won't be displayed as we're using JavaScript redirect
        echo '<script>window.open("https://bdthemes.com/deals/?utm_source=WordPress_org&utm_medium=bfcm_cta&utm_campaign=one_accessibility", "_blank"); window.history.back();</script>';
        exit;
    }

    public function bfcm_menu_redirect_script()
    {
        ?>
        <script type="text/javascript">
        jQuery(document).ready(function($) {
            $('a[href="admin.php?page=websac-bfcm-deal"]').on('click', function(e) {
                e.preventDefault();
                window.open('https://bdthemes.com/deals/?utm_source=WordPress_org&utm_medium=bfcm_cta&utm_campaign=one_accessibility', '_blank');
                return false;
            });
        });
        </script>
        <?php
    }
}
