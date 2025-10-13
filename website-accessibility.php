<?php

/**
 * Plugin Name:       Sigmally Website Accessibility
 * Description:       A comprehensive WordPress plugin to enhance website accessibility and ensure WCAG compliance.
 * Requires at least: 6.1
 * Requires PHP:      7.4
 * Version:           1.0.1
 * Author:            bdthemes
 * Author URI:        https://bdthemes.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       website-accessibility 
 */

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
	const VERSION = '1.0.1';

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
		define('WEBSAC_NAME', 'Sigmally Website Accessibility');
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
							'width' => '420',
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
								'isPro'   => true,
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
					'button'     => [
						'text'       => 'Accessibility Menu',
						'showIcon'   => true,
						'icon'       => 'accessibility1',
						'color'      => '#ffffff',
						'bgColor'    => '#1677ff',
						'position'   => 'bottom-right',
						'buttonType' => 'icon',
						'offsetX'   => '40',
						'offsetY'    => '40',
					],
				]),
				'post_status'  => 'publish',
				'post_author'  => get_current_user_id(),
				'post_type'    => 'websac_preset',
			]);
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
		
		// Initialize frontend assets
		\bdthemes\websiteaccessibility\View\Frontend::get_instance();
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
 * Kickstart the Sigmally Website Accessibility plugin.
 *
 * @return WebsiteAccessibility
 */
function website_accessibility()
{
	return WebsiteAccessibility::get_instance();
}

// Initialize the plugin
website_accessibility();
