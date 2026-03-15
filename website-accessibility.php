<?php

/**
 * Plugin Name:       One Accessibility
 * Description:       A comprehensive WordPress plugin to enhance website accessibility and ensure WCAG compliance.
 * Requires at least: 6.1
 * Requires PHP:      7.4
 * Version:           1.2.7
 * Author:            bdthemes
 * Author URI:        https://oneaccessibility.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       website-accessibility 
 */

use bdthemes\websiteaccessibility\Core\Utils;
use bdthemes\websiteaccessibility\Traits\Singleton;

// Exit if accessed directly.
if (! defined('ABSPATH')) exit;

// Check if vendor directory and autoload.php exist
$autoload_file = __DIR__ . '/vendor/autoload.php';
if (file_exists($autoload_file)) {
	// Load autoloader (vendor/autoload.php).
	require_once $autoload_file;
}

/**
 * Implements the singleton pattern to ensure only one instance is running.
 */
final class WebsiteAccessibility
{
	use Singleton;

	/**
	 * Plugin version.
	 *
	 * @var string
	 */
	const VERSION = '1.2.7';

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
		update_option('websac_data_schema_version', \bdthemes\websiteaccessibility\Core\Migrations::LATEST_DATA_SCHEMA_VERSION);

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

		$existing_statement = $existing_statement = get_page_by_path('one-accessibility-statement-page', OBJECT, 'page');


		if (empty($existing_presets) || empty($existing_statement)) {
			Utils::get_filesystem();

			global $wp_filesystem;
		}

		if(empty($existing_presets)) {
			$json_path = WEBSAC_DIR . 'default-posts/preset.json';
			$data = json_decode($wp_filesystem->get_contents($json_path), true);

			if (!empty($data)) {
				if (!empty($data)) {
					$data['post_author'] = get_current_user_id();
					$data['post_content'] = json_encode($data['post_content'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
					wp_insert_post($data);
				}
			}
		}

		if(empty($existing_statement)) {
			$json_path = WEBSAC_DIR . 'default-posts/statement.json';
			$data = json_decode($wp_filesystem->get_contents($json_path), true);

			if (!empty($data)) {
				if (!empty($data)) {
					$data['post_author'] = get_current_user_id();
					$data['post_content'] = $data['post_content'];
					wp_insert_post($data);
				}
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
		\bdthemes\websiteaccessibility\Core\Migrations::get_instance()->maybe_run_migrations();

		// Add a custom class to the admin body tag.
		add_filter('admin_body_class', fn($classes) => $classes . ' wap-admin');

		// Add custom classes to the front-end body tag.
		add_filter('body_class', fn($classes) => array_merge($classes, ['wap', 'wap-frontend']));

		do_action('websac_plugins_loaded');

		// Register post types
		\bdthemes\websiteaccessibility\Core\AccessibilityPreset::get_instance();
		\bdthemes\websiteaccessibility\Core\PresetProfile::get_instance();

		// Register admin menu
		\bdthemes\websiteaccessibility\Admin\Menu::get_instance();

		// Initialize admin assets
		\bdthemes\websiteaccessibility\Admin\Enqueue::get_instance();

		// Initialize admin biggopti system
		\bdthemes\websiteaccessibility\Admin\Biggopti::get_instance();

		// Initialize dashboard product feed widget
		new \bdthemes\websiteaccessibility\Admin\Admin_Feeds( [
			'feed_title'       => 'One Accessibility News & Updates',
			'transient_key'    => 'websac_product_feeds',
			'feed_link'        => 'https://bdthemes.com/feed',
			'remote_feed_link' => 'https://dashboard.bdthemes.io/wp-json/bdthemes/v1/product-feed/?product_category=website-accessibility',
			'text_domain'      => 'website-accessibility',
			'footer_links'     => [
				[
					'url'   => 'https://bdthemes.com/blog/',
					'title' => 'Blog',
				],
				[
					'url'   => 'https://bdthemes.com/knowledge-base/',
					'title' => 'Docs',
				],
				[
					'url'   => 'https://oneaccessibility.com/#pricing',
					'title' => 'Get Pro',
				],
				[
					'url'   => 'https://feedback.elementpack.pro/announcements/',
					'title' => 'Changelog',
				],
			],
		] );

		// Initialize frontend assets
		\bdthemes\websiteaccessibility\View\Frontend::get_instance();

	// Initialize the routes
	\bdthemes\websiteaccessibility\Routes\PreferenceRouteV1::get_instance();
	\bdthemes\websiteaccessibility\Routes\SettingsRouteV1::get_instance();
	\bdthemes\websiteaccessibility\Routes\UsageStatisticsRouteV1::get_instance();
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
 * @return WebsiteAccessibility
 */
function website_accessibility()
{
	return WebsiteAccessibility::get_instance();
}

// Initialize the plugin
website_accessibility();
