<?php

namespace Websac\Core;

use Websac\Routes\SettingsRouteV1;

if (! defined('ABSPATH')) {
    exit;
}

class Utils
{
    /**
     * Name shown in the admin menu, page headers and the toolbar footer.
     * Add-ons (e.g. white-label) can override it through the filter.
     *
     * @return string
     */
    public static function get_brand_display_name()
    {
        $default = __('One Accessibility', 'website-accessibility');
        $name    = apply_filters('websac_brand_display_name', $default);
        $name    = is_string($name) ? trim($name) : '';
        return $name !== '' ? $name : $default;
    }

    public static function get_filesystem()
    {
        global $wp_filesystem;

        if ($wp_filesystem instanceof \WP_Filesystem_Base) {
            return $wp_filesystem;
        }

        // Check if WP_Filesystem is available
        if (!function_exists('WP_Filesystem')) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
        }

        // Initialize WP_Filesystem (may fail when credentials are required).
        WP_Filesystem();

        return $wp_filesystem instanceof \WP_Filesystem_Base ? $wp_filesystem : null;
    }

    /**
     * Decode one of the JSON files bundled with this plugin (default-posts/*.json).
     *
     * @param string $path Absolute path inside the plugin directory.
     * @return array|null Decoded array or null when unreadable/invalid.
     */
    public static function read_bundled_json($path)
    {
        $path = (string) $path;
        if ($path === '' || strpos(wp_normalize_path($path), wp_normalize_path(WEBSAC_DIR)) !== 0 || ! file_exists($path)) {
            return null;
        }

        $filesystem = self::get_filesystem();
        $contents   = $filesystem ? $filesystem->get_contents($path) : false;
        if (! is_string($contents) || $contents === '') {
            // WP_Filesystem unavailable (e.g. FTP credentials required): the file is
            // part of this plugin, so a plain local read is safe.
            $contents = file_get_contents($path); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- Bundled plugin file, WP_Filesystem unavailable.
        }
        if (! is_string($contents) || $contents === '') {
            return null;
        }

        $data = json_decode($contents, true);
        return is_array($data) ? $data : null;
    }

    public static function get_preset_data($preset)
    {
        if (is_object($preset) && !empty($preset->ID) && !empty($preset->post_content)) {
            $presetData = self::process_preset_data($preset->post_content);
            if (!empty($presetData)) {
                $presetData['ID'] = $preset->ID;
                $presetData['title'] = $preset->post_title;
                $presetData['slug'] = $preset->post_name;
                return $presetData;
            }
        }

        if (is_int($preset)) {
            $preset = get_post($preset);
            if ($preset) {
                $presetData = self::process_preset_data($preset->post_content);
                if (!empty($presetData)) {
                    $presetData['ID'] = $preset->ID;
                    $presetData['title'] = $preset->post_title;
                    $presetData['slug'] = $preset->post_name;
                    return $presetData;
                }
            }
        }

        return null;
    }

    private static function detect_page_builder_edit_mode()
    {
        global $pagenow;

        // phpcs:disable WordPress.Security.NonceVerification.Recommended -- Read-only page-builder detection from the URL; no form data is processed or saved.

        // Elementor
        if (did_action('elementor/loaded') && class_exists('\Elementor\Plugin')) {
            try {
                if (\Elementor\Plugin::$instance->editor->is_edit_mode() || \Elementor\Plugin::$instance->preview->is_preview_mode()) {
                    return 'elementor';
                }
            } catch (\Exception $e) {
            }
        }

        // Bricks
        if (defined('BRICKS_VERSION')) {
            if (function_exists('bricks_is_builder') && bricks_is_builder()) {
                return 'bricks';
            }
            if (isset($_GET['bricks']) && sanitize_text_field(wp_unslash($_GET['bricks'])) === 'editor') {
                return 'bricks';
            }
        }

        // Beaver Builder
        if (class_exists('FLBuilderModel') && \FLBuilderModel::is_builder_active()) {
            return 'beaver';
        }

        // Divi
        if (function_exists('et_core_is_fb_enabled') && et_core_is_fb_enabled()) {
            return 'divi';
        }

        // WPBakery / VC
        if (defined('WPB_VC_VERSION') && function_exists('vc_is_inline') && vc_is_inline()) {
            return 'wpbakery';
        }

        // Oxygen
        if (defined('OXYGEN_IFRAME') || isset($_GET['ct_builder']) || isset($_GET['oxygen_iframe'])) {
            return 'oxygen';
        }

        // SiteOrigin
        if (class_exists('SiteOrigin_Panels') && !empty($_GET['so_live_editor'])) {
            return 'siteorigin';
        }

        // Cornerstone
        if (isset($_GET['cornerstone']) || isset($_GET['x-cs-preview'])) {
            return 'cornerstone';
        }

        // Thrive
        if (isset($_GET['tve']) && sanitize_text_field(wp_unslash($_GET['tve'])) === 'true') {
            return 'thrive';
        }

        // Breakdance
        if (defined('BREAKDANCE_VERSION') && isset($_GET['breakdance']) && sanitize_text_field(wp_unslash($_GET['breakdance'])) === 'builder') {
            return 'breakdance';
        }
        // phpcs:enable WordPress.Security.NonceVerification.Recommended

        return false;
    }

    public static function is_builder_editor(){
        if (!empty(self::detect_page_builder_edit_mode())) {
            return true;
        }
        return false;
    }


    public static function process_preset_data($content)
    {
        if (empty($content)) {
            return null;
        }

        $presetData = json_decode($content, true);

        if (!empty($presetData)) {
            return $presetData;
        }

        return null;
    }

    public static function get_page_type()
    {
        if (is_singular()) {
            return 'singular';
        } elseif (is_front_page() || is_home() || is_archive() || is_search() || is_404()) {
            return 'archive'; // treat homepage & blog index as archive
        }

        return 'entire_site';
    }


    private static function check_archive_pages($pages = [])
    {
        if (empty($pages)) return true; // apply to all archive pages if none selected

        foreach ($pages as $page) {
            switch ($page) {
                case 'home':
                    if (is_front_page()) return true;
                    break;
                case 'posts':
                    if (is_home()) return true;
                    break;
                case 'category':
                    if (is_category()) return true;
                    break;
                case 'tag':
                    if (is_tag()) return true;
                    break;
                case 'author':
                    if (is_author()) return true;
                    break;
                case 'date':
                    if (is_date()) return true;
                    break;
                case 'search':
                    if (is_search()) return true;
                    break;
                case '404':
                    if (is_404()) return true;
                    break;
                case 'attachment':
                    if (is_attachment()) return true;
                    break;
                default:
                    if (is_post_type_archive($page)) return true; // custom post type archive
                    break;
            }
        }

        return false;
    }

    /**
     * Check if current page matches selected singular posts.
     * If $selectedPosts is empty, apply to all singular pages.
     */
    private static function check_singular_pages($selectedPosts = [])
    {
        if (empty($selectedPosts)) return true; // apply to all singular pages if none selected

        if (is_singular()) {
            $currentId = get_queried_object_id();
            if (in_array((int) $currentId, array_map('intval', (array) $selectedPosts), true)) return true;
        }

        return false;
    }

    /**
     * Get the current active preset for a page type.
     * Returns the first matching preset or the entire_site preset as fallback.
     */
    public static function get_current_preset($presets = [], $page_type = null)
    {
        $entire_site_preset = null;

        foreach ($presets as $preset) {
            $data = $preset['preset'] ?? null;

            if (!$data || empty($data['active'])) continue; // skip inactive presets

            if ($data['condition'] === $page_type) {

                if ($page_type === 'archive') {
                    if (self::check_archive_pages($data['specificArchive'] ?? [])) {
                        return $preset;
                    }
                }

                if ($page_type === 'singular') {
                    if (self::check_singular_pages($data['specificPosts'] ?? [])) {
                        return $preset;
                    }
                }
            }

            if ($data['condition'] === 'entire_site') {
                $entire_site_preset = $preset;
            }
        }

        return $entire_site_preset ?? null;
    }

    public static function get_settings($key = null)
    {
        // Get saved options (may be partial)
        $options = get_option('websac_settings', []);

        // Merge with defaults so missing values fallback correctly
        $options = wp_parse_args($options, SettingsRouteV1::get_defaults_settings());

        // If no key requested, return full merged settings
        if ($key === null) {
            return $options;
        }

        // Return specific key or null if it still doesn't exist
        return $options[$key] ?? null;
    }


    /**
     * Replace the placeholders used in default-posts/statement.json with
     * this site's details.
     *
     * @param string $content
     * @return string
     */
    public static function fill_statement_placeholders($content) {
        $replacements = [
            '{{site_name}}'   => wp_specialchars_decode(get_bloginfo('name'), ENT_QUOTES),
            '{{site_url}}'    => home_url('/'),
            '{{admin_email}}' => (string) get_option('admin_email'),
            '{{date}}'        => date_i18n(get_option('date_format')),
        ];

        return strtr((string) $content, $replacements);
    }
}
