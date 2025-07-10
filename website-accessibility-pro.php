<?php

/**
 * Plugin Name:       Website Accessibility Pro
 * Description:       A comprehensive WordPress plugin to enhance website accessibility and ensure WCAG compliance.
 * Requires at least: 6.1
 * Requires PHP:      7.4
 * Version:           1.0.0
 * Author:            bdthemes
 * Author URI:        https://bdthemes.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       website-accessibility
 * Domain Path:       /languages
 * 
 * @package           Website Accessibility Pro
 */

use WebsiteAccessibilityPro\Traits\Singleton;

// Exit if accessed directly.
if (! defined('ABSPATH')) exit;

// Check if vendor directory and autoload.php exist
$autoload_file = __DIR__ . '/vendor/autoload.php';
if (file_exists($autoload_file)) {
	// Load autoloader (vendor/autoload.php).
	require_once $autoload_file;
}

/**
 * Main Website Accessibility Pro Class.
 * Implements the singleton pattern to ensure only one instance is running.
 */
final class WebsiteAccessibilityPro
{
	use Singleton;

	/**
	 * Plugin version.
	 *
	 * @var string
	 */
	const VERSION = '1.0.0';

	/**
	 * Private constructor for singleton pattern.
	 * Prevents the direct creation of an object from this class.
	 */
	private function __construct()
	{
		// Define plugin constants.
		$this->define_constants();

		// Load after plugin activation.
		register_activation_hook(__FILE__, array($this, 'activated_plugin'));

		// Initialize plugin hooks.
		add_action('plugins_loaded', array($this, 'plugins_loaded'));
	}

	/**
	 * Defines plugin constants for easy access across the plugin.
	 *
	 * @return void
	 */
	public function define_constants()
	{
		define('WAP_VERSION', self::VERSION);
		define('WAP_NAME', 'Website Accessibility Pro');
		define('WAP_URL', trailingslashit(plugin_dir_url(__FILE__)));
		define('WAP_DIR', trailingslashit(plugin_dir_path(__FILE__)));
		define('WAP_INCLUDES_DIR', WAP_DIR . 'includes/');
		define('WAP_BUILD_DIR', WAP_DIR . 'build/');
	}

	/**
	 * Handles tasks to run upon plugin activation.
	 * Sets version and installed time in the WordPress options table.
	 *
	 * @return void
	 */
	public function activated_plugin()
	{
		// Update plugin version in the options table.
		update_option('wap_version', WAP_VERSION);

		// Set installed time if it doesn't exist.
		if (! get_option('wap_installed_time')) {
			add_option('wap_installed_time', time());
		}
	}

	/**
	 * Fires once all plugins have been loaded.
	 * Initializes textdomain and other plugin-wide features.
	 *
	 * @return void
	 */
	public function plugins_loaded()
	{
		// init plugin
		add_action('init', array($this, 'init'));

		// Add a custom class to the admin body tag.
		add_filter('admin_body_class', fn($classes) => $classes . ' wap-admin');
		
		// Add custom classes to the front-end body tag.
		add_filter('body_class', fn($classes) => array_merge($classes, ['wap', 'wap-frontend']));

		// Register post types
		\WebsiteAccessibilityPro\Core\AccessibilityPreset::get_instance();
		\WebsiteAccessibilityPro\Core\PresetProfile::get_instance();

		// Register admin menu
		\WebsiteAccessibilityPro\Admin\Menu::get_instance();

		// Initialize admin assets
		\WebsiteAccessibilityPro\Admin\Enqueue::get_instance();

		// Initialize frontend assets
		\WebsiteAccessibilityPro\View\Frontend::get_instance();
	}

	/**
	 * Initialize the plugin.
	 *
	 * @return void
	 */
	public function init()
	{
		// Load plugin text domain
		load_plugin_textdomain('website-accessibility', false, dirname(plugin_basename(__FILE__)) . '/languages');
	}
}

/**
 * Kickstart the Website Accessibility Pro plugin.
 *
 * @return WebsiteAccessibilityPro
 */
function website_accessibility_pro()
{
	return WebsiteAccessibilityPro::get_instance();
}

// Initialize the plugin
website_accessibility_pro();
