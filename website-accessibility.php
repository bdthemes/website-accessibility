<?php
/**
 * Plugin Name: Website Accessibility
 * Plugin URI: https://yourwebsite.com/website-accessibility
 * Description: A comprehensive WordPress accessibility plugin that meets WCAG 2.0 (AAA) standards with features like flexible settings, multilingual voice navigation, color modes, and more.
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://yourwebsite.com
 * Text Domain: website-accessibility
 * Domain Path: /languages
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('WAP_VERSION', '1.0.0');
define('WAP_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('WAP_PLUGIN_URL', plugin_dir_url(__FILE__));
define('WAP_PLUGIN_BASENAME', plugin_basename(__FILE__));
define('WAP_PLUGIN_FILE', __FILE__);

// Include required files
require_once WAP_PLUGIN_DIR . 'includes/class-website-accessibility.php';
require_once WAP_PLUGIN_DIR . 'includes/class-website-accessibility-settings.php';
require_once WAP_PLUGIN_DIR . 'admin/class-website-accessibility-admin.php';
require_once WAP_PLUGIN_DIR . 'public/class-website-accessibility-public.php';

/**
 * Initialize the plugin
 */
function website_accessibility_init() {
    // Load plugin textdomain
    load_plugin_textdomain('website-accessibility', false, dirname(plugin_basename(__FILE__)) . '/languages/');
    
    // Initialize the main plugin class
    $website_accessibility = new Website_Accessibility();
    $website_accessibility->init();
}
add_action('plugins_loaded', 'website_accessibility_init');

/**
 * Register activation hook
 */
function website_accessibility_activate() {
    // Activation code here
    flush_rewrite_rules();
}
register_activation_hook(__FILE__, 'website_accessibility_activate');

/**
 * Register deactivation hook
 */
function website_accessibility_deactivate() {
    // Deactivation code here
    flush_rewrite_rules();
}
register_deactivation_hook(__FILE__, 'website_accessibility_deactivate'); 