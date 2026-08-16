<?php

/**
 * Plugin Name:       One Accessibility
 * Description:       A comprehensive WordPress plugin to enhance website accessibility and ensure WCAG compliance.
 * Requires at least: 6.1
 * Requires PHP:      7.4
 * Version:           1.5.2
 * Author:            bdthemes
 * Author URI:        https://oneaccessibility.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       website-accessibility
 */

use Websac\Core\Utils;
use Websac\Core\Migrations;
use Websac\Traits\Singleton;

// Exit if accessed directly.
if (! defined('ABSPATH')) exit;

// Check if vendor directory and autoload.php exist
$websac_autoload_file = __DIR__ . '/vendor/autoload.php';
if (file_exists($websac_autoload_file)) {
	// Load autoloader (vendor/autoload.php).
	require_once $websac_autoload_file;
}

/**
 * Implements the singleton pattern to ensure only one instance is running.
 */
final class Websac_Plugin
{
	use Singleton;

	/**
	 * Plugin version.
	 *
	 * @var string
	 */
	const VERSION = '1.5.2';

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

		// Handle activation redirect
		add_action('admin_init', array($this, 'maybe_redirect_to_settings'));
	}

	/**
	 * Defines plugin constants for easy access across the plugin.
	 *
	 * @return void
	 */
	public function define_constants()
	{
		define('WEBSAC_VERSION', self::VERSION);
		define('WEBSAC_NAME', 'One Accessibility');
		define('WEBSAC_PLUGIN_FILE', __FILE__);
		define('WEBSAC_URL', trailingslashit(plugin_dir_url(__FILE__)));
		define('WEBSAC_DIR', trailingslashit(plugin_dir_path(__FILE__)));
		define('WEBSAC_INCLUDES_DIR', WEBSAC_DIR . 'includes/');
		define('WEBSAC_BUILD_DIR', WEBSAC_DIR . 'build/');
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
		update_option('websac_version', WEBSAC_VERSION);

		// Fresh install: stored data already matches the latest schema. On re-activation
		// of an existing install leave the stored version alone so pending migrations run.
		if (get_option('websac_data_schema_version', null) === null) {
			update_option('websac_data_schema_version', Migrations::LATEST_DATA_SCHEMA_VERSION);
		}

		// Set installed time if it doesn't exist.
		if (! get_option('websac_installed_time')) {
			add_option('websac_installed_time', time());
		}

		// Check if there is any published preset
		$existing_presets = get_posts([
			'post_type'      => 'websac_preset',
			'post_status'    => 'publish',
			'posts_per_page' => 1,
			'fields'         => 'ids',
			'no_found_rows'  => true, // improves performance
		]);

		$existing_statement = get_page_by_path('one-accessibility-statement-page', OBJECT, 'page');


		if (empty($existing_presets) || empty($existing_statement)) {
			Utils::get_filesystem();

			global $wp_filesystem;
		}

		if (empty($existing_presets)) {
			$json_path = WEBSAC_DIR . 'default-posts/preset.json';
			$data = json_decode($wp_filesystem->get_contents($json_path), true);

			if (!empty($data)) {
				$data['post_author'] = get_current_user_id();
				/**
				 * Filter the default preset seeded on activation (decoded JSON).
				 * Add-ons may append their own panel items, widgets or profile ids.
				 *
				 * @param array $content Preset content (button, panel, conditions...).
				 */
				$data['post_content'] = apply_filters('websac_default_preset_content', $data['post_content']);
				$data['post_content'] = wp_json_encode($data['post_content'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
				wp_insert_post($data);
			}
		}

		if (empty($existing_statement)) {
			$json_path = WEBSAC_DIR . 'default-posts/statement.json';
			$data = json_decode($wp_filesystem->get_contents($json_path), true);

			if (!empty($data)) {
				$data['post_author']  = get_current_user_id();
				$data['post_content'] = Utils::fill_statement_placeholders((string) $data['post_content']);
				wp_insert_post($data);
			}
		}

		// Set redirect flag to trigger on next admin page load
		add_option('websac_do_activation_redirect', true);
	}


	/**
	 * Fires once all plugins have been loaded.
	 * Initializes textdomain and other plugin-wide features.
	 *
	 * @return void
	 */
	public function plugins_loaded()
	{
		// Run DB/content migrations for plugin updates.
		Migrations::get_instance()->maybe_run_migrations();

		// Add a custom class to the admin body tag.
		add_filter('admin_body_class', fn($classes) => $classes . ' wap-admin');

		// Front-end body markers: very late PHP filter + JS reinforcer (some builders drop body_class output).
		add_filter('body_class', array($this, 'add_frontend_body_classes'), PHP_INT_MAX - 1);
		add_action('wp_body_open', array($this, 'print_frontend_body_class_reinforcer'), 0);
		add_action('wp_footer', array($this, 'print_frontend_body_class_reinforcer'), 1);

		do_action('websac_plugins_loaded');

		// Register post types
		\Websac\Core\AccessibilityPreset::get_instance();

		// Register admin menu
		\Websac\Admin\Menu::get_instance();

		// Initialize admin assets
		\Websac\Admin\Enqueue::get_instance();

		// Initialize frontend assets
		\Websac\View\Frontend::get_instance();

		// Initialize the routes
		\Websac\Routes\PreferenceRouteV1::get_instance();
		\Websac\Routes\DashboardTourRouteV1::get_instance();
		\Websac\Routes\SettingsRouteV1::get_instance();
		\Websac\Routes\UsageStatisticsRouteV1::get_instance();
		\Websac\Routes\SystemInfoRouteV1::get_instance();
	}

	/**
	 * Append front-end body classes as late as possible so other filters run first.
	 *
	 * @param string[]|mixed $classes Body classes from previous filters.
	 * @return string[]
	 */
	public function add_frontend_body_classes($classes)
	{
		if (! is_array($classes)) {
			$classes = array();
		}
		$markup = array('wap', 'wap-frontend');
		foreach ($markup as $class) {
			if (! in_array($class, $classes, true)) {
				$classes[] = $class;
			}
		}
		return $classes;
	}

	/**
	 * Re-apply body classes in the browser when a theme or builder strips PHP output.
	 *
	 * @return void
	 */
	public function print_frontend_body_class_reinforcer()
	{
		static $printed = false;
		if ($printed || is_admin()) {
			return;
		}
		$printed = true;
		echo '<script>(function(){var b=document.body,c=' . wp_json_encode(array('wap', 'wap-frontend')) . ';if(!b||!c)return;c.forEach(function(cl){b.classList.add(cl);});})();</script>' . "\n";
	}

	/**
	 * Redirect to plugin settings page on first activation.
	 *
	 * @return void
	 */
	public function maybe_redirect_to_settings()
	{
		// Only run in wp-admin and for users who can manage options
		if (! is_admin() || ! current_user_can('manage_options')) {
			return;
		}

		// Check if the redirect flag is set
		if (get_option('websac_do_activation_redirect', false)) {
			// Delete the flag so it only runs once
			delete_option('websac_do_activation_redirect');

			// phpcs:ignore WordPress.Security.NonceVerification.Recommended
			if (! isset($_GET['activate-multi'])) {
				wp_safe_redirect(admin_url('admin.php?page=website-accessibility'));
				exit;
			}
		}
	}
}

/**
 * Kickstart the One Accessibility plugin.
 *
 * @return Websac_Plugin
 */
function websac()
{
	return Websac_Plugin::get_instance();
}

// Initialize the plugin
websac();
