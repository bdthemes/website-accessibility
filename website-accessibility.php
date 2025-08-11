<?php

/**
 * Plugin Name:       Website Accessibility
 * Description:       A comprehensive WordPress plugin to enhance website accessibility and ensure WCAG compliance.
 * Requires at least: 6.1
 * Requires PHP:      7.4
 * Version:           1.0.0
 * Author:            bdthemes
 * Author URI:        https://bdthemes.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       website-accessibility
 * 
 * @package           Website Accessibility Pro
 */

use WebsiteAccessibility\Traits\Singleton;

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
final class WebsiteAccessibility
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

		// Check if there is any published preset
		$existing_presets = get_posts([
			'post_type'      => 'wap_preset',
			'post_status'    => 'publish',
			'posts_per_page' => 1,
			'fields'         => 'ids',
			'no_found_rows'  => true, // improves performance
		]);

		if (empty($existing_presets)) {
			// Create a default preset
			wp_insert_post([
				'post_title'   => 'Accessibility Preset',
				'post_content' => json_encode([
					'preset' => [
						'active'    => true,
						'condition' => 'entire_site',
					],
					'panel' => [
						'wrapper' => [
							'width' => '500',
						],
						'items' => [
							[
								'id'          => 'header',
								'title'       => 'Header',
								'slug'        => 'header',
								'active'      => true,
								'disableDrag' => true,
								'attributes'  => [
									'text'         => 'Accessibility Menu (CTRL+U)',
									'showClose'    => true,
									'background'   => '#2e6cf6',
									'border'       => '1px solid #2e6cf6',
									'borderRadius' => '6px',
									'boxShadow'    => '0 4px 24px rgba(0,0,0,0.08)',
									'padding'      => '10px 20px',
								],
								'chosen'   => false,
								'selected' => false,
							],
							[
								'id'      => 'language',
								'title'   => 'Language',
								'slug'    => 'language',
								'active'  => true,
								'close'   => true,
								'attributes' => [
									'text'        => 'Language',
									'showClose'   => true,
									'flipContent' => false,
									'background'  => '#ffffff',
									'border'      => '1px solid #e0e0e0',
								],
								'chosen'   => false,
								'selected' => false,
							],
							[
								'id'      => 'profiles',
								'title'   => 'Profiles',
								'slug'    => 'profiles',
								'active'  => true,
								'attributes' => [
									'profiles' => [
										'motor',
										'blind',
										'color-blind',
										'dyslexia',
										'low-vision',
										'cognitive',
										'seizure',
										'adhd',
									],
								],
								'chosen'   => false,
								'selected' => false,
							],
							[
								'id'      => 'features',
								'title'   => 'Features',
								'slug'    => 'features',
								'active'  => true,
								'close'   => true,
								'attributes' => [
									'text'        => 'Features',
									'showClose'   => true,
									'flipContent' => false,
									'background'  => '#ffffff',
									'border'      => '1px solid #e0e0e0',
								],
								'chosen'   => false,
								'selected' => false,
							],
							[
								'id'          => 'footer',
								'title'       => 'Footer',
								'slug'        => 'footer',
								'active'      => true,
								'close'       => true,
								'disableDrag' => true,
								'chosen'      => false,
								'selected'    => false,
							],
						],
					],
					'button' => [
						'text'     => 'Accessibility Menu',
						'showIcon' => true,
						'icon'     => 'accessibility1',
						'color'    => '#ffffff',
						'bgColor'  => '#1677ff',
						'position' => 'bottom-right',
					],
				]),
				'post_status'  => 'publish',
				'post_author'  => get_current_user_id(),
				'post_type'    => 'wap_preset',
			]);
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
		\WebsiteAccessibility\Core\AccessibilityPreset::get_instance();
		\WebsiteAccessibility\Core\PresetProfile::get_instance();

		// Register admin menu
		\WebsiteAccessibility\Admin\Menu::get_instance();

		// Initialize admin assets
		\WebsiteAccessibility\Admin\Enqueue::get_instance();

		// Initialize frontend assets
		\WebsiteAccessibility\View\Frontend::get_instance();
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
 * @return WebsiteAccessibility
 */
function website_accessibility_pro()
{
	return WebsiteAccessibility::get_instance();
}

// Initialize the plugin
website_accessibility_pro();
