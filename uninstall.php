<?php
/**
 * Uninstall file for Website Accessibility plugin
 *
 * @package Website_Accessibility
 */

// If uninstall not called from WordPress, exit
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Delete plugin options
delete_option('website_accessibility_options');

// Remove user meta if created
global $wpdb;
$wpdb->query("DELETE FROM $wpdb->usermeta WHERE meta_key LIKE '%website_accessibility%'");

// Clear any transients we've set
$wpdb->query("DELETE FROM $wpdb->options WHERE option_name LIKE '%website_accessibility%'");
$wpdb->query("DELETE FROM $wpdb->options WHERE option_name LIKE '%_transient_website_accessibility%'");
$wpdb->query("DELETE FROM $wpdb->options WHERE option_name LIKE '%_transient_timeout_website_accessibility%'"); 