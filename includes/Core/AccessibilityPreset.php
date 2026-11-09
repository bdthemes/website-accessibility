<?php

/**
 * Register Accessibility Preset Post Type
 */

namespace Websac\Core;

use Websac\Traits\Singleton;

if (!defined('ABSPATH')) {
    exit;
}

class AccessibilityPreset
{
    use Singleton;

    private function __construct()
    {
        add_action('init', [$this, 'register_post_type']);
        add_filter('wp_insert_post_data', [$this, 'save_preset'], 10, 2);
    }

    public function register_post_type()
    {
        register_post_type('websac_preset', [
            'labels' => [
                'name' => __('Presets', 'website-accessibility'),
                'singular_name' => __('Preset', 'website-accessibility'),
            ],
            'public' => false,
            'show_ui' => false,
            'show_in_menu' => false,
            'menu_icon' => 'dashicons-universal-access',
            'supports' => ['title', 'editor'],
            'show_in_rest' => true,
            // Presets drive the site-wide widget and must only be managed by
            // administrators. Without an explicit map, create_posts defaults to
            // the primitive edit_posts cap, letting Authors create/publish
            // presets through the core /wp/v2 REST endpoint. Lock every write
            // capability to manage_options (map_meta_cap resolves edit/delete of
            // individual posts to these primitives). The admin React app runs as
            // a manage_options user, so its core-data CRUD is unaffected.
            'map_meta_cap' => true,
            'capabilities' => [
                'create_posts'           => 'manage_options',
                'edit_posts'             => 'manage_options',
                'edit_others_posts'      => 'manage_options',
                'edit_published_posts'   => 'manage_options',
                'edit_private_posts'     => 'manage_options',
                'publish_posts'          => 'manage_options',
                'read_private_posts'     => 'manage_options',
                'delete_posts'           => 'manage_options',
                'delete_others_posts'    => 'manage_options',
                'delete_published_posts' => 'manage_options',
                'delete_private_posts'   => 'manage_options',
            ],
        ]);
    }

    /**
     * Whether two presets compete for the same pages, so only one may stay active.
     * Same condition is not enough: "Singular: page A" and "Singular: page B" (or two
     * archive presets on different archives) can both be live. An empty target list
     * means every page of that kind, so it overlaps any other of the same condition.
     *
     * @param array $a Preset settings (`preset` key of the stored JSON).
     * @param array $b Preset settings.
     * @return bool
     */
    private static function presets_overlap(array $a, array $b)
    {
        $condition = $a['condition'] ?? null;
        if ($condition === null || $condition !== ($b['condition'] ?? null)) {
            return false;
        }

        $key = $condition === 'singular' ? 'specificPosts' : ($condition === 'archive' ? 'specificArchive' : null);
        if ($key === null) {
            return true; // entire_site
        }

        $normalize = static function ($list) {
            return array_map('strval', array_filter((array) $list, 'is_scalar'));
        };
        $targets_a = $normalize($a[$key] ?? []);
        $targets_b = $normalize($b[$key] ?? []);
        if (! $targets_a || ! $targets_b) {
            return true;
        }

        return (bool) array_intersect($targets_a, $targets_b);
    }

    /**
     * Store preset JSON written by the plugin itself (migrations, switching
     * overlapping presets off).
     *
     * For a user without `unfiltered_html` WordPress runs kses on post_content,
     * which treats the JSON as HTML and turns every "&" into "&amp;" (a category
     * titled "Color & Contrast" came back as "Color &amp; Contrast"). This
     * content is the plugin's own, already-validated data, so kses is off for
     * the write and restored right after.
     *
     * @param int   $post_id
     * @param array $content Decoded preset content.
     * @param int   $flags   wp_json_encode() flags.
     * @return int|\WP_Error
     */
    public static function write_content($post_id, array $content, $flags = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
    {
        $kses_active = false !== has_filter('content_save_pre', 'wp_filter_post_kses');
        if ($kses_active) {
            kses_remove_filters();
        }

        // wp_update_post() unslashes what it is given, so JSON must be slashed
        // first or the backslashes in \" are stripped and it stops being valid JSON.
        $result = wp_update_post([
            'ID'           => (int) $post_id,
            'post_content' => wp_slash(wp_json_encode($content, $flags)),
        ]);

        if ($kses_active) {
            kses_init_filters();
        }

        return $result;
    }

    public function save_preset($data, $postarr)
    {
        if ($data['post_type'] !== 'websac_preset') {
            return $data;
        }
        
        // decode content
        // `wp_insert_post_data` runs before core unslashes $data, so post_content
        // still carries slashes here and would fail to decode as JSON.
        $content = json_decode(wp_unslash($data['post_content']), true);
        if (! is_array($content)) {
            return $data;
        }

        $isActive = $content['preset']['active'] ?? false;
        $currentCondition = $content['preset']['condition'] ?? null;

        // if becoming active and has condition – auto deactivate others
        if ($isActive && $currentCondition) {

            $existing = get_posts([
                'post_type'      => 'websac_preset',
                'posts_per_page' => -1,
                'post_status'    => 'publish',
            ]);

            foreach ($existing as $item) {
                if (isset($postarr['ID']) && $postarr['ID'] == $item->ID) continue;

                $item_content = json_decode($item->post_content, true);

                if (
                    is_array($item_content)
                    && ($item_content['preset']['active'] ?? false) === true
                    && self::presets_overlap($content['preset'], $item_content['preset'] ?? [])
                ) {
                    $item_content['preset']['active'] = false;

                    self::write_content($item->ID, $item_content, 0);
                }
            }
        }

        return $data;
    }
}
