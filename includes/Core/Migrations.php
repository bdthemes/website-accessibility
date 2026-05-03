<?php

namespace bdthemes\websiteaccessibility\Core;

use bdthemes\websiteaccessibility\Traits\Singleton;

if (! defined('ABSPATH')) {
    exit;
}

class Migrations
{
    use Singleton;

    const VERSION_OPTION_KEY = 'websac_version';
    const DATA_SCHEMA_OPTION_KEY = 'websac_data_schema_version';
    const LATEST_DATA_SCHEMA_VERSION = 4;

    private function __construct(){}

    /**
     * Run pending migrations after plugin updates.
     */
    public function maybe_run_migrations()
    {
        $installed_version = (string) get_option(self::VERSION_OPTION_KEY, '0.0.0');
        $current_schema_version = (int) get_option(self::DATA_SCHEMA_OPTION_KEY, 0);

        $needs_version_upgrade = version_compare($installed_version, WEBSAC_VERSION, '<');
        $needs_schema_upgrade = $current_schema_version < self::LATEST_DATA_SCHEMA_VERSION;

        if (! $needs_version_upgrade && ! $needs_schema_upgrade) {
            return;
        }

        if ($current_schema_version < 2) {
            $this->migrate_feature_widgets_to_categories();
            $current_schema_version = 2;
        }

        if ($current_schema_version < 3) {
            $this->migrate_panel_wrapper_style_keys();
            $current_schema_version = 3;
        }

        if ($current_schema_version < 4) {
            $this->migrate_panel_wrapper_section_border_to_color();
            $current_schema_version = 4;
        }

        update_option(self::DATA_SCHEMA_OPTION_KEY, $current_schema_version);
        update_option(self::VERSION_OPTION_KEY, WEBSAC_VERSION);
    }

    /**
     * Add categorized widget groups for feature items in existing presets.
     * Keeps the legacy flat widgets list for backward compatibility.
     */
    private function migrate_feature_widgets_to_categories()
    {
        $presets = get_posts([
            'post_type'      => 'websac_preset',
            'post_status'    => 'any',
            'posts_per_page' => -1,
            'fields'         => 'ids',
            'no_found_rows'  => true,
        ]);

        if (empty($presets)) {
            return;
        }

        foreach ($presets as $preset_id) {
            $post = get_post($preset_id);
            if (! $post || empty($post->post_content)) {
                continue;
            }

            $preset_content = json_decode($post->post_content, true);
            if (json_last_error() !== JSON_ERROR_NONE || ! is_array($preset_content)) {
                continue;
            }

            $migrated_content = $this->migrate_single_preset_content($preset_content);
            if ($migrated_content === null) {
                continue;
            }

            wp_update_post([
                'ID'           => $preset_id,
                'post_content' => wp_json_encode($migrated_content, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            ]);
        }
    }

    /**
     * Remove empty wrapper style keys and the accidental all-black card palette
     * (legacy ColorPicker defaulted unset values to #000000 in the admin UI).
     */
    private function migrate_panel_wrapper_style_keys()
    {
        $presets = get_posts([
            'post_type'      => 'websac_preset',
            'post_status'    => 'any',
            'posts_per_page' => -1,
            'fields'         => 'ids',
            'no_found_rows'  => true,
        ]);

        if (empty($presets)) {
            return;
        }

        foreach ($presets as $preset_id) {
            $post = get_post($preset_id);
            if (! $post || empty($post->post_content)) {
                continue;
            }

            $preset_content = json_decode($post->post_content, true);
            if (json_last_error() !== JSON_ERROR_NONE || ! is_array($preset_content)) {
                continue;
            }

            $changed = $this->sanitize_preset_wrapper_colors_in_place($preset_content);
            if (! $changed) {
                continue;
            }

            wp_update_post([
                'ID'           => $preset_id,
                'post_content' => wp_json_encode($preset_content, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            ]);
        }
    }

    /**
     * Move legacy full-CSS "sectionBorder" string to sectionBorderColor (hex only) and drop the old key.
     */
    private function migrate_panel_wrapper_section_border_to_color()
    {
        $presets = get_posts([
            'post_type'      => 'websac_preset',
            'post_status'    => 'any',
            'posts_per_page' => -1,
            'fields'         => 'ids',
            'no_found_rows'  => true,
        ]);

        if (empty($presets)) {
            return;
        }

        foreach ($presets as $preset_id) {
            $post = get_post($preset_id);
            if (! $post || empty($post->post_content)) {
                continue;
            }

            $preset_content = json_decode($post->post_content, true);
            if (json_last_error() !== JSON_ERROR_NONE || ! is_array($preset_content)) {
                continue;
            }

            $changed = $this->convert_section_border_string_to_color_key($preset_content);
            if (! $changed) {
                continue;
            }

            wp_update_post([
                'ID'           => $preset_id,
                'post_content' => wp_json_encode($preset_content, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            ]);
        }
    }

    /**
     * @return bool True when preset JSON was modified.
     */
    private function convert_section_border_string_to_color_key(array &$content)
    {
        if (empty($content['panel']['wrapper']) || ! is_array($content['panel']['wrapper'])) {
            return false;
        }

        $w = &$content['panel']['wrapper'];

        if (! array_key_exists('sectionBorder', $w)) {
            return false;
        }

        $raw = trim((string) $w['sectionBorder']);
        unset($w['sectionBorder']);

        if ('' === $raw) {
            return true;
        }

        $has_color = isset($w['sectionBorderColor']) && '' !== trim((string) $w['sectionBorderColor']);
        if ($has_color) {
            return true;
        }

        if (preg_match('/#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})\b/', $raw, $matches)) {
            $w['sectionBorderColor'] = strtoupper($matches[0]);

            return true;
        }

        return true;
    }

    /**
     * @return bool True when preset JSON was modified.
     */
    private function sanitize_preset_wrapper_colors_in_place(array &$content)
    {
        if (empty($content['panel']['wrapper']) || ! is_array($content['panel']['wrapper'])) {
            return false;
        }

        $w       = &$content['panel']['wrapper'];
        $changed = false;

        $norm_hex = static function ($v) {
            if (! is_string($v)) {
                return '';
            }
            $s = strtoupper(trim($v));
            if ('' === $s) {
                return '';
            }
            if (preg_match('/^#([0-9A-F]{3}|[0-9A-F]{6})$/', $s)) {
                return $s;
            }
            if (preg_match('/^RGB\\(\\s*0\\s*,\\s*0\\s*,\\s*0\\s*\\)$/i', $s)) {
                return '#000000';
            }

            return $s;
        };

        $cb = isset($w['cardBackground']) ? $norm_hex($w['cardBackground']) : '';
        $ct = isset($w['cardTextColor']) ? $norm_hex($w['cardTextColor']) : '';
        $ci = isset($w['cardIconColor']) ? $norm_hex($w['cardIconColor']) : '';

        if ('#000000' === $cb && '#000000' === $ct && '#000000' === $ci) {
            unset($w['cardBackground'], $w['cardTextColor'], $w['cardIconColor']);
            $changed = true;
        }

        foreach (['cardBackground', 'cardTextColor', 'cardIconColor', 'featureInfoIconColor', 'sectionBackground', 'sectionTitleColor', 'sectionBorderColor'] as $key) {
            if (isset($w[$key]) && '' === trim((string) $w[$key])) {
                unset($w[$key]);
                $changed = true;
            }
        }

        if (isset($w['sectionBorder']) && '' === trim((string) $w['sectionBorder'])) {
            unset($w['sectionBorder']);
            $changed = true;
        }

        return $changed;
    }

    /**
     * Migrate one preset payload and return null when no changes are needed.
     */
    private function migrate_single_preset_content(array $content)
    {
        if (empty($content['panel']['items']) || ! is_array($content['panel']['items'])) {
            return null;
        }

        $changed = false;

        foreach ($content['panel']['items'] as $index => $item) {
            if (($item['slug'] ?? '') !== 'features') {
                continue;
            }

            $attributes = $item['attributes'] ?? [];
            $widgets = $this->extract_widgets($attributes);

            if (empty($widgets)) {
                continue;
            }

            $widget_categories = $this->build_widget_categories($widgets);
            if (empty($widget_categories)) {
                continue;
            }

            $has_same_categories = isset($attributes['widgetCategories']) && $attributes['widgetCategories'] === $widget_categories;
            $has_schema_version = isset($attributes['widgetSchemaVersion']) && (int) $attributes['widgetSchemaVersion'] === 2;

            if ($has_same_categories && $has_schema_version) {
                continue;
            }

            $content['panel']['items'][$index]['attributes']['widgets'] = $widgets;
            $content['panel']['items'][$index]['attributes']['widgetCategories'] = $widget_categories;
            $content['panel']['items'][$index]['attributes']['widgetSchemaVersion'] = 2;
            $changed = true;
        }

        return $changed ? $content : null;
    }

    /**
     * Normalize feature widget list to legacy flat format.
     */
    private function extract_widgets(array $attributes)
    {
        if (! empty($attributes['widgets']) && is_array($attributes['widgets'])) {
            return $this->sanitize_widgets($attributes['widgets']);
        }

        // Future-safe: if only categories exist, flatten them.
        if (! empty($attributes['widgetCategories']) && is_array($attributes['widgetCategories'])) {
            $flattened = [];
            foreach ($attributes['widgetCategories'] as $category) {
                if (! empty($category['widgets']) && is_array($category['widgets'])) {
                    $flattened = array_merge($flattened, $category['widgets']);
                }
            }

            return $this->sanitize_widgets($flattened);
        }

        return [];
    }

    /**
     * Keep one-key widget objects only.
     */
    private function sanitize_widgets(array $widgets)
    {
        $clean = [];

        foreach ($widgets as $widget) {
            if (! is_array($widget) || empty($widget)) {
                continue;
            }

            $key = array_key_first($widget);
            if (! is_string($key) || $key === '') {
                continue;
            }

            $value = is_array($widget[$key]) ? $widget[$key] : ['active' => (bool) $widget[$key]];
            if (! isset($value['active'])) {
                $value['active'] = true;
            }

            $clean[] = [
                $key => $value,
            ];
        }

        return $clean;
    }

    /**
     * Build categorized widget groups for the next-generation feature UI.
     */
    private function build_widget_categories(array $widgets)
    {
        $definitions = [
            [
                'slug'  => 'text',
                'title' => 'Text',
                'keys'  => ['biggerText', 'textSpacing', 'lineHeight', 'textAlign', 'dyslexiaFriendly', 'dictionary'],
            ],
            [
                'slug'  => 'color',
                'title' => 'Color & Contrast',
                'keys'  => ['contrast', 'smartContrast', 'brightness', 'grayscale', 'saturation', 'highlightLinks', 'hideImages'],
            ],
            [
                'slug'  => 'orientation',
                'title' => 'Orientation',
                'keys'  => ['cursor', 'tooltips'],
            ],
            [
                'slug'  => 'behavior',
                'title' => 'Behavior',
                'keys'  => ['pauseAnimations', 'muteSounds', 'screenReader'],
            ],
        ];

        $widget_index = [];
        foreach ($widgets as $widget) {
            $key = array_key_first($widget);
            if ($key) {
                $widget_index[$key] = $widget;
            }
        }

        $categories = [];
        $used_keys = [];

        foreach ($definitions as $definition) {
            $group_widgets = [];

            foreach ($definition['keys'] as $key) {
                if (! isset($widget_index[$key])) {
                    continue;
                }

                $group_widgets[] = $widget_index[$key];
                $used_keys[$key] = true;
            }

            if (! empty($group_widgets)) {
                $categories[] = [
                    'slug'    => $definition['slug'],
                    'title'   => $definition['title'],
                    'widgets' => $group_widgets,
                ];
            }
        }

        $other_widgets = [];
        foreach ($widget_index as $key => $widget) {
            if (isset($used_keys[$key])) {
                continue;
            }

            $other_widgets[] = $widget;
        }

        if (! empty($other_widgets)) {
            $categories[] = [
                'slug'    => 'other',
                'title'   => 'Other',
                'widgets' => $other_widgets,
            ];
        }

        return $categories;
    }
}
