<?php

/**
 * Admin Menu Handler
 */

namespace Websac\Admin;

use Websac\Core\Utils;
use Websac\Core\WhiteLabel;
use Websac\Traits\Singleton;

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
                $menu[$key][4] .= ' wap-admin-root-menu'; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited -- Appends a CSS class to this plugin's own top-level menu entry only.
                break;
            }
        }
    }

    /**
     * Accessibility figure path (shared by gray + white menu icon variants).
     */
    private function get_menu_icon_path(): string
    {
        return 'M24.0557 37.04C24.4857 40.37 25.3357 43.4902 26.5557 46.1602H21.5557C22.7757 43.4902 23.6257 40.37 24.0557 37.04ZM31.3262 2C32.0661 2.00014 32.7257 2.46026 32.9756 3.16016L46.0459 43.8096L46.0362 43.7803C46.4459 44.9202 45.5957 46.1299 44.3858 46.1299H31.9659C31.9459 46.0799 31.9255 46.0402 31.8955 45.9902C30.0356 42.8902 28.8257 38.45 28.5957 33.79C28.5157 32.02 28.5561 30.2698 28.7461 28.5898C31.026 28.2898 33.1961 27.7602 35.1661 27.0303C36.4159 26.5703 37.0457 25.1903 36.586 23.9404C36.126 22.6906 34.746 22.0598 33.4961 22.5195C30.6961 23.5595 27.3658 24.1104 23.8858 24.1104C20.4058 24.1103 17.156 23.5696 14.376 22.5596C13.1261 22.1096 11.7462 22.7501 11.2862 24C10.8362 25.2499 11.4758 26.6297 12.7256 27.0898C14.7556 27.8298 17.016 28.3504 19.376 28.6504C19.556 30.3201 19.6056 32.0499 19.5157 33.8096C19.2857 38.4695 18.0758 42.9098 16.2159 46.0098L16.1455 46.1504H3.7559C2.55594 46.1504 1.70583 44.97 2.09574 43.8301L14.5362 3.19043C14.7762 2.48043 15.4463 2 16.1963 2H31.3262ZM27.7559 18.3301C27.5559 16.3001 25.7458 14.8196 23.7159 15.0195C21.686 15.2195 20.2065 17.0297 20.4063 19.0596C20.6063 21.0896 22.4163 22.5701 24.4463 22.3701C26.4761 22.1699 27.9558 20.3599 27.7559 18.3301Z';
    }

    /**
     * @param string $fill SVG fill color (e.g. #a7aaad, #ffffff).
     */
    private function build_menu_icon_data_uri(string $fill): string
    {
        $path = $this->get_menu_icon_path();
        $svg  = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="' . $fill . '">'
            . '<path d="' . $path . '" fill="' . $fill . '"/>'
            . '</svg>';

        return 'data:image/svg+xml;base64,' . base64_encode($svg);
    }

    /**
     * Inline SVG menu icon (#a7aaad — matches WordPress admin dashicon gray).
     */
    private function get_menu_page_icon_url(): string
    {
        return esc_url($this->build_menu_icon_data_uri('#a7aaad'), ['data']);
    }

    /**
     * Custom menu SVG: core fades .wp-menu-image img — keep brand icon at full opacity.
     */
    public function menu_icon_styles()
    {
        $default_icon = esc_url($this->build_menu_icon_data_uri('#a7aaad'), ['data']);
        $active_icon  = esc_url($this->build_menu_icon_data_uri('#ffffff'), ['data']);
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
                background-repeat: no-repeat;
                background-position: center center;
                background-size: 20px 20px;
            }
            /*
             * Always paint the icon via background-image. Core <img data:> icons are unreliable
             * on first paint (e.g. Dashboard) but background works once the menu is active.
             */
            #adminmenu li.wap-admin-root-menu .wp-menu-image:not(.websac-wl-has-custom-icon),
            #adminmenu li.toplevel_page_website-accessibility .wp-menu-image:not(.websac-wl-has-custom-icon) {
                background-image: url(<?php echo wp_json_encode($default_icon); ?>) !important;
            }
            #adminmenu li.wap-admin-root-menu.current .wp-menu-image:not(.websac-wl-has-custom-icon),
            #adminmenu li.wap-admin-root-menu.wp-has-current-submenu .wp-menu-image:not(.websac-wl-has-custom-icon),
            #adminmenu li.toplevel_page_website-accessibility.current .wp-menu-image:not(.websac-wl-has-custom-icon),
            #adminmenu li.toplevel_page_website-accessibility.wp-has-current-submenu .wp-menu-image:not(.websac-wl-has-custom-icon) {
                background-image: url(<?php echo wp_json_encode($active_icon); ?>) !important;
            }
            #adminmenu li.wap-admin-root-menu .wp-menu-image:not(.websac-wl-has-custom-icon) img,
            #adminmenu li.toplevel_page_website-accessibility .wp-menu-image:not(.websac-wl-has-custom-icon) img {
                opacity: 0 !important;
                visibility: hidden !important;
                width: 0 !important;
                height: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
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
        if (WhiteLabelAdmin::should_hide_admin_menus()) {
            return;
        }

        $menu_title = WhiteLabel::get_display_name();

        // Add main menu
        add_menu_page(
            $menu_title,
            $menu_title,
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

        add_submenu_page(
            'website-accessibility',
            __('CSS Overrides', 'website-accessibility'),
            __('CSS Overrides', 'website-accessibility'),
            'manage_options',
            'website-accessibility-css-overrides',
            [$this, 'render_menu_page']
        );

        add_submenu_page(
            'website-accessibility',
            __('Tools & Backup', 'website-accessibility'),
            __('Tools & Backup', 'website-accessibility'),
            'manage_options',
            'website-accessibility-tools',
            [$this, 'render_menu_page']
        );

        // License screen belongs to the separate Pro plugin; only link to it when that plugin is present.
        if (Utils::is_pro_plugin_active()) {
            add_submenu_page(
                'website-accessibility',
                __('License', 'website-accessibility'),
                __('License', 'website-accessibility'),
                'manage_options',
                'website-accessibility-license',
                [$this, 'render_menu_page']
            );
        }

        add_submenu_page(
            'website-accessibility',
            __('White Label', 'website-accessibility'),
            __('White Label', 'website-accessibility'),
            'manage_options',
            'website-accessibility-white-label',
            [$this, 'render_menu_page']
        );

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
}
