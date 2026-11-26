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
        add_filter('wp_insert_post_data', [$this, 'save_preset'], 10, 3);
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
            // Reading presets over REST needs the editing capability too (see the class).
            'rest_controller_class' => PresetRestController::class,
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
     * Clean a preset's settings before they are stored. Every visitor's page gets
     * them, so they are rebuilt from the decoded JSON rather than trusted as sent:
     * the fields the plugin reads are given their expected types, and strings lose
     * HTML unless the user may post unfiltered HTML anyway (as with post content).
     *
     * @param object $content Preset settings (json_decode() without $associative).
     * @param bool   $allow_html Whether the saving user has `unfiltered_html`.
     * @return object
     */
    public static function sanitize_content($content, $allow_html)
    {
        $content = Utils::sanitize_json_value($content, [
            'strip_tags' => ! $allow_html,
            // Keys belong to the preset editor and to add-ons: only odd characters go.
            'clean_keys' => false,
            'max_depth'  => 32,
            'max_length' => 65535,
        ]);
        if (! $content instanceof \stdClass) {
            return new \stdClass();
        }

        if (isset($content->preset) && $content->preset instanceof \stdClass) {
            $preset = $content->preset;

            if (property_exists($preset, 'active')) {
                $preset->active = (bool) $preset->active;
            }
            if (property_exists($preset, 'condition')) {
                $preset->condition = in_array($preset->condition, ['entire_site', 'singular', 'archive'], true)
                    ? $preset->condition
                    : '';
            }
            if (property_exists($preset, 'specificPosts')) {
                // Post IDs: positive integers only (absint() would turn -5 into post 5).
                $ids = array_map('intval', array_filter((array) $preset->specificPosts, 'is_numeric'));
                $preset->specificPosts = array_values(array_unique(array_filter($ids, static function ($id) {
                    return $id > 0;
                })));
            }
            if (property_exists($preset, 'specificArchive')) {
                $preset->specificArchive = array_values(array_filter(
                    array_map('sanitize_key', array_filter((array) $preset->specificArchive, 'is_scalar'))
                ));
            }
        }

        // Colour theme: printed into a <style> on every page (View\Frontend::print_theme_colors()).
        if (isset($content->panel->wrapper) && $content->panel->wrapper instanceof \stdClass && property_exists($content->panel->wrapper, 'theme')) {
            $wrapper = $content->panel->wrapper;
            $theme   = $wrapper->theme;
            $is_hex  = static function ($value) {
                return is_string($value) && preg_match('/^#[0-9a-f]{6}$/i', $value);
            };

            if (! $theme instanceof \stdClass || ! $is_hex($theme->primary ?? null)) {
                unset($wrapper->theme);
            } else {
                foreach (['hover', 'active', 'onPrimary'] as $field) {
                    if (property_exists($theme, $field) && ! $is_hex($theme->$field)) {
                        unset($theme->$field);
                    }
                }
                if (property_exists($theme, 'id')) {
                    $theme->id = sanitize_key((string) $theme->id);
                }
            }
        }

        return $content;
    }

    /**
     * @param array $data                Slashed, sanitized post data.
     * @param array $postarr             Sanitized post data.
     * @param array $unsanitized_postarr Post data as it was passed in (slashed).
     * @return array
     */
    public function save_preset($data, $postarr, $unsanitized_postarr = [])
    {
        if ($data['post_type'] !== 'websac_preset') {
            return $data;
        }

        // `wp_insert_post_data` runs before core unslashes $data, so post_content
        // still carries slashes here and would fail to decode as JSON.
        //
        // Read what was sent, not what core's kses left of it: for users without
        // `unfiltered_html` kses parses the JSON as HTML, which can cut a string
        // value short and leave invalid JSON behind. The settings are cleaned field
        // by field below instead, more strictly than kses would (no tags at all).
        $raw = isset($unsanitized_postarr['post_content']) && is_string($unsanitized_postarr['post_content'])
            ? $unsanitized_postarr['post_content']
            : $data['post_content'];
        $decoded = json_decode(wp_unslash($raw));
        if (! $decoded instanceof \stdClass) {
            return $data;
        }

        $clean   = self::sanitize_content($decoded, current_user_can('unfiltered_html'));
        $encoded = wp_json_encode($clean, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if (! is_string($encoded)) {
            return $data;
        }
        $data['post_content'] = wp_slash($encoded);

        $content = json_decode($encoded, true);
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

                    wp_update_post([
                        'ID'          => $item->ID,
                        'post_content' => wp_slash(wp_json_encode($item_content)) // important: wp_slash
                    ]);
                }
            }
        }

        return $data;
    }
}
