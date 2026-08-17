<?php
/**
 * Uninstall handler for One Accessibility.
 *
 * Removes every option, transient, user-meta key and post this plugin created.
 * Runs only when the plugin is deleted from the WordPress admin.
 *
 * @package Websac
 */

if (! defined('WP_UNINSTALL_PLUGIN')) {
	exit;
}

/**
 * Remove plugin data from the current site.
 */
function websac_uninstall_site()
{
	global $wpdb;

	$options = [
		'websac_version',
		'websac_data_schema_version',
		'websac_installed_time',
		'websac_do_activation_redirect',
		'websac_settings',
		'websac_usage_statistics',
		'websac_dashboard_tour_completed',
	];
	foreach ($options as $option) {
		delete_option($option);
	}

	delete_transient('websac_preference_stats');
	delete_transient('websac_product_feeds');
	delete_transient('websac_product_feeds_rss');

	// Short-lived usage-statistics throttle transients (websac_stats_<hash>).
	$wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- Uninstall cleanup of this plugin's own transients.
		$wpdb->prepare(
			"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
			$wpdb->esc_like('_transient_websac_stats_') . '%',
			$wpdb->esc_like('_transient_timeout_websac_stats_') . '%'
		)
	);

	// Visitor/user toolbar preferences.
	delete_metadata('user', 0, 'websac_preferences', '', true);

	// Preset posts.
	$presets = get_posts([
		'post_type'      => 'websac_preset',
		'post_status'    => 'any',
		'posts_per_page' => -1,
		'fields'         => 'ids',
		'no_found_rows'  => true,
	]);
	foreach ($presets as $preset_id) {
		wp_delete_post($preset_id, true);
	}
}

if (is_multisite()) {
	$websac_site_ids = get_sites(['fields' => 'ids', 'number' => 0]);
	foreach ($websac_site_ids as $websac_site_id) {
		switch_to_blog($websac_site_id);
		websac_uninstall_site();
		restore_current_blog();
	}
} else {
	websac_uninstall_site();
}
