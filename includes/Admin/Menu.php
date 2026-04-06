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
        add_action('admin_menu', [$this, 'add_toplevel_menu_li_class'], 999);
        add_action('admin_head', [$this, 'menu_icon_styles']);
        add_action('admin_footer', [$this, 'bfcm_menu_redirect_script']);
    }

    /**
     * Append a class on the top-level admin menu li (WordPress stores it in $menu[ $i ][4]).
     */
    public function add_toplevel_menu_li_class()
    {
        global $menu;
        if (!is_array($menu)) {
            return;
        }
        foreach ($menu as $key => $item) {
            if (isset($item[2], $item[4]) && $item[2] === 'website-accessibility') {
                $menu[$key][4] .= ' wap-admin-root-menu';
                break;
            }
        }
    }

    /**
     * Inline SVG for the top-level admin menu (data URI; avoids a separate asset file).
     */
    private function get_menu_page_icon_url(): string
    {
        $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">'
            . '<path d="M24.0557 37.04C24.4857 40.37 25.3357 43.4902 26.5557 46.1602H21.5557C22.7757 43.4902 23.6257 40.37 24.0557 37.04ZM31.3262 2C32.0661 2.00014 32.7257 2.46026 32.9756 3.16016L46.0459 43.8096L46.0362 43.7803C46.4459 44.9202 45.5957 46.1299 44.3858 46.1299H31.9659C31.9459 46.0799 31.9255 46.0402 31.8955 45.9902C30.0356 42.8902 28.8257 38.45 28.5957 33.79C28.5157 32.02 28.5561 30.2698 28.7461 28.5898C31.026 28.2898 33.1961 27.7602 35.1661 27.0303C36.4159 26.5703 37.0457 25.1903 36.586 23.9404C36.126 22.6906 34.746 22.0598 33.4961 22.5195C30.6961 23.5595 27.3658 24.1104 23.8858 24.1104C20.4058 24.1103 17.156 23.5696 14.376 22.5596C13.1261 22.1096 11.7462 22.7501 11.2862 24C10.8362 25.2499 11.4758 26.6297 12.7256 27.0898C14.7556 27.8298 17.016 28.3504 19.376 28.6504C19.556 30.3201 19.6056 32.0499 19.5157 33.8096C19.2857 38.4695 18.0758 42.9098 16.2159 46.0098L16.1455 46.1504H3.7559C2.55594 46.1504 1.70583 44.97 2.09574 43.8301L14.5362 3.19043C14.7762 2.48043 15.4463 2 16.1963 2H31.3262ZM27.7559 18.3301C27.5559 16.3001 25.7458 14.8196 23.7159 15.0195C21.686 15.2195 20.2065 17.0297 20.4063 19.0596C20.6063 21.0896 22.4163 22.5701 24.4463 22.3701C26.4761 22.1699 27.9558 20.3599 27.7559 18.3301Z" fill="black"/>'
            . '</svg>';

        $data_uri = 'data:image/svg+xml;base64,' . base64_encode($svg);

        return esc_url($data_uri, ['data']);
    }

    /**
     * Custom menu SVG: core fades .wp-menu-image img — keep brand icon at full opacity.
     */
    public function menu_icon_styles()
    {
        ?>
        <style id="wap-admin-menu-icon">
            /* Match core #adminmenu div.wp-menu-image (36×34) — do not shrink the hit box or icons sit high vs label */
            #adminmenu .wap-admin-root-menu .wp-menu-image {
                float: left;
                width: 36px;
                height: 34px;
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
            }
            #adminmenu .wap-admin-root-menu .wp-menu-image img {
                width: 20px !important;
                height: 20px !important;
                max-width: 20px;
                max-height: 20px;
                padding: 0 !important;
                margin: 0 !important;
                opacity: 1 !important;
                object-fit: contain;
                display: block;
            }
            .folded #adminmenu .wap-admin-root-menu .wp-menu-image {
                width: 35px;
                height: 30px;
            }
        </style>
        <?php
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
            $this->get_menu_page_icon_url(),
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

        // Tools & Backup — only when Pro plugin is active
        if (class_exists('\bdthemes\websiteaccessibilitypro\Admin\License')) {
            add_submenu_page(
                'website-accessibility',
                __('Tools & Backup', 'website-accessibility'),
                __('Tools & Backup', 'website-accessibility'),
                'manage_options',
                'website-accessibility-tools',
                [$this, 'render_menu_page']
            );
        }
        
        if (class_exists('\bdthemes\websiteaccessibilitypro\Admin\License\LicenseBase')) {
            add_submenu_page(
                'website-accessibility',
                __('License', 'website-accessibility'),
                __('License', 'website-accessibility'),
                'manage_options',
                'website-accessibility-license',
                [$this, 'render_menu_page']
            );
        }

        // Get Pro — show for free users and unlicensed installs (hide when license is active)
        $is_license_active = (
            class_exists('\bdthemes\websiteaccessibilitypro\Admin\License\LicenseHelper') &&
            \bdthemes\websiteaccessibilitypro\Admin\License\LicenseHelper::is_license_active()
        );
        if (! $is_license_active) {
            add_submenu_page(
                'website-accessibility',
                __('Get Pro', 'website-accessibility'),
                __('Get Pro', 'website-accessibility'),
                'manage_options',
                'website-accessibility-get-pro',
                [$this, 'render_menu_page']
            );
        }

        add_submenu_page(
            'website-accessibility',
            __('About & Info', 'website-accessibility'),
            __('About & Info', 'website-accessibility'),
            'manage_options',
            'website-accessibility-about',
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
        echo '<script>window.open("https://oneaccessibility.com/#pricing", "_blank"); window.history.back();</script>';
        exit;
    }
    

    public function bfcm_menu_redirect_script()
    {
        ?>
        <script type="text/javascript">
        jQuery(document).ready(function($) {
            $('a[href="admin.php?page=websac-bfcm-deal"]').on('click', function(e) {
                e.preventDefault();
                window.open('https://oneaccessibility.com/#pricing', '_blank');
                return false;
            });
        });
        </script>
        <?php
    }
}

