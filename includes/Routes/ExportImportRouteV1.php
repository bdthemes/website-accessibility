<?php

namespace bdthemes\websiteaccessibility\Routes;

use bdthemes\websiteaccessibility\Traits\Singleton;
use WP_REST_Request;
use WP_REST_Server;

if (! defined('ABSPATH')) exit;

class ExportImportRouteV1
{
    use Singleton;

    /**
     * Constructor
     */
    private function __construct()
    {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    /**
     * Register REST API routes
     */
    public function register_routes()
    {
        register_rest_route('sigmally/v1', '/export', [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => [$this, 'export_settings'],
            'permission_callback' => [$this, 'can_manage_settings'],
        ]);

        register_rest_route('sigmally/v1', '/import', [
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => [$this, 'import_settings'],
            'permission_callback' => [$this, 'can_manage_settings'],
        ]);
    }

    /**
     * Permission check
     */
    public function can_manage_settings()
    {
        return current_user_can('manage_options');
    }

    /**
     * Export all plugin settings and data
     */
    public function export_settings(WP_REST_Request $request)
    {
        try {
            $export_data = [
                'version'     => WEBSAC_VERSION ?? '1.0.0',
                'export_date' => current_time('mysql'),
                'site_url'    => get_site_url(),
                'settings'    => get_option('websac_settings', []),
                'presets'     => $this->get_all_presets(),
                'profiles'    => $this->get_all_profiles(),
                'metadata'    => [
                    'plugin_name'    => 'Website Accessibility',
                    'export_version' => '1.0',
                ],
            ];

            return rest_ensure_response([
                'success' => true,
                'data'    => $export_data,
                'message' => __('Settings exported successfully.', 'website-accessibility'),
            ]);
        } catch (\Exception $e) {
            return new \WP_Error(
                'export_failed',
                __('Failed to export settings: ', 'website-accessibility') . $e->getMessage(),
                ['status' => 500]
            );
        }
    }

    /**
     * Import settings and data
     */
    public function import_settings(WP_REST_Request $request)
    {
        try {
            $import_data = $request->get_json_params();

            if (empty($import_data)) {
                return new \WP_Error(
                    'invalid_data',
                    __('No data provided for import.', 'website-accessibility'),
                    ['status' => 400]
                );
            }

            // Validate import data structure
            if (!isset($import_data['metadata']) || !isset($import_data['settings'])) {
                return new \WP_Error(
                    'invalid_format',
                    __('Invalid import file format.', 'website-accessibility'),
                    ['status' => 400]
                );
            }

            $imported_items = [];

            // Import settings
            if (isset($import_data['settings']) && is_array($import_data['settings'])) {
                update_option('websac_settings', $import_data['settings']);
                $imported_items[] = 'settings';
            }

            // Import presets
            if (isset($import_data['presets']) && is_array($import_data['presets'])) {
                $presets_imported = $this->import_presets($import_data['presets']);
                if ($presets_imported > 0) {
                    // translators: %d: number of presets imported.
                    $imported_items[] = sprintf(__('%d presets', 'website-accessibility'), $presets_imported);
                }
            }

            // Import profiles
            if (isset($import_data['profiles']) && is_array($import_data['profiles'])) {
                $profiles_imported = $this->import_profiles($import_data['profiles']);
                if ($profiles_imported > 0) {
                    // translators: %d: number of profiles imported.
                    $imported_items[] = sprintf(__('%d profiles', 'website-accessibility'), $profiles_imported);
                }
            }

            $success_message = sprintf(
                // translators: %s: comma-separated list of imported items.
                __('Successfully imported: %s', 'website-accessibility'),
                implode(', ', $imported_items)
            );

            return rest_ensure_response([
                'success' => true,
                'message' => $success_message,
                'data'    => [
                    'imported_items' => $imported_items,
                    'import_date'    => current_time('mysql'),
                ],
            ]);
        } catch (\Exception $e) {
            return new \WP_Error(
                'import_failed',
                __('Failed to import settings: ', 'website-accessibility') . $e->getMessage(),
                ['status' => 500]
            );
        }
    }

    /**
     * Get all accessibility profiles
     */
    private function get_all_profiles()
    {
        $profiles = [];
        $query = new \WP_Query([
            'post_type'      => 'websac_profile',
            'posts_per_page' => -1,
            'post_status'    => 'publish',
        ]);

        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $post_id = get_the_ID();
                $profiles[] = [
                    'title'   => get_the_title(),
                    'content' => get_the_content(),
                    'meta'    => get_post_meta($post_id),
                ];
            }
            wp_reset_postdata();
        }

        return $profiles;
    }

    /**
     * Get all accessibility presets
     */
    private function get_all_presets()
    {
        $presets = [];
        $query = new \WP_Query([
            'post_type'      => 'websac_preset',
            'posts_per_page' => -1,
            'post_status'    => 'publish',
        ]);

        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $post_id = get_the_ID();
                $presets[] = [
                    'title'   => get_the_title(),
                    'content' => get_the_content(),
                    'meta'    => get_post_meta($post_id),
                ];
            }
            wp_reset_postdata();
        }

        return $presets;
    }

    /**
     * Import accessibility presets
     */
    private function import_presets($presets)
    {
        $count = 0;

        foreach ($presets as $preset) {
            if (!isset($preset['title'])) {
                continue;
            }

            // Check if preset with same title exists
            $existing = get_page_by_title($preset['title'], OBJECT, 'websac_preset');

            $post_data = [
                'post_title'   => sanitize_text_field($preset['title']),
                'post_content' => isset($preset['content']) ? wp_kses_post($preset['content']) : '',
                'post_type'    => 'websac_preset',
                'post_status'  => 'publish',
            ];

            if ($existing) {
                // Update existing preset
                $post_data['ID'] = $existing->ID;
                $post_id = wp_update_post($post_data);
            } else {
                // Create new preset
                $post_id = wp_insert_post($post_data);
            }

            if ($post_id && !is_wp_error($post_id)) {
                // Import meta data
                if (isset($preset['meta']) && is_array($preset['meta'])) {
                    foreach ($preset['meta'] as $meta_key => $meta_values) {
                        delete_post_meta($post_id, $meta_key);
                        foreach ((array) $meta_values as $meta_value) {
                            add_post_meta($post_id, $meta_key, maybe_unserialize($meta_value));
                        }
                    }
                }
                $count++;
            }
        }

        return $count;
    }

    /**
     * Import accessibility profiles
     */
    private function import_profiles($profiles)
    {
        $count = 0;

        foreach ($profiles as $profile) {
            if (!isset($profile['title'])) {
                continue;
            }

            // Check if profile with same title exists
            $existing = get_page_by_title($profile['title'], OBJECT, 'websac_profile');

            $post_data = [
                'post_title'   => sanitize_text_field($profile['title']),
                'post_content' => isset($profile['content']) ? wp_kses_post($profile['content']) : '',
                'post_type'    => 'websac_profile',
                'post_status'  => 'publish',
            ];

            if ($existing) {
                // Update existing profile
                $post_data['ID'] = $existing->ID;
                $post_id = wp_update_post($post_data);
            } else {
                // Create new profile
                $post_id = wp_insert_post($post_data);
            }

            if ($post_id && !is_wp_error($post_id)) {
                // Import meta data
                if (isset($profile['meta']) && is_array($profile['meta'])) {
                    foreach ($profile['meta'] as $meta_key => $meta_values) {
                        delete_post_meta($post_id, $meta_key);
                        foreach ((array) $meta_values as $meta_value) {
                            add_post_meta($post_id, $meta_key, maybe_unserialize($meta_value));
                        }
                    }
                }
                $count++;
            }
        }

        return $count;
    }
}
