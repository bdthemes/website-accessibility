<?php
/**
 * Defines white-label constants when websac_white_label_enabled is on.
 *
 * @package WebsiteAccessibility
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!defined('WEBSAC_WHITE_LABEL_BRAND')) {
    $wl_title = get_option('websac_white_label_title', '');
    define('WEBSAC_WHITE_LABEL_BRAND', is_string($wl_title) ? $wl_title : '');
}

if (!defined('WEBSAC_LO')) {
    if (get_option('websac_white_label_hide_license', false)) {
        define('WEBSAC_LO', true);
    }
}

if (!defined('WEBSAC_HIDE')) {
    if (get_option('websac_white_label_hide_admin', false)) {
        define('WEBSAC_HIDE', true);
    }
}
