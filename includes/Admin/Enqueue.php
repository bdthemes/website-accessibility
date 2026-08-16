<?php

/**
 * Handle admin assets enqueuing
 *
 * @package WebsiteAccessibility
 */

namespace Websac\Admin;

use Websac\Core\Utils;
use Websac\Core\WhiteLabel;
use Websac\Routes\DashboardTourRouteV1;
use Websac\Traits\Singleton;

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Class Enqueue
 */
class Enqueue {
    use Singleton;

    /**
     * Initialize the class
     */
    private function __construct() {
        add_action('admin_enqueue_scripts', [$this, 'enqueue_scripts']);
        add_filter('upload_mimes', [$this, 'allow_admin_svg_uploads'], 99);
        add_filter('wp_check_filetype_and_ext', [$this, 'fix_svg_filetype'], 10, 5);
        add_filter('wp_generate_attachment_metadata', [$this, 'fix_svg_attachment_metadata'], 10, 2);
        add_filter('intermediate_image_sizes_advanced', [$this, 'skip_svg_subsizes'], 10, 3);
        add_filter('wp_prepare_attachment_for_js', [$this, 'prepare_svg_attachment_for_js'], 10, 3);
    }

    /**
     * @param array<string, string> $mimes Existing mime map.
     * @return array<string, string>
     */
    public function allow_admin_svg_uploads($mimes) {
        // Restrict SVG uploads to administrators. SVGs are not sanitized here, so
        // a raw <script>-bearing SVG served as image/svg+xml is a stored-XSS
        // vector; limiting to manage_options prevents lower-privileged users
        // (Author/Editor) from planting one that fires in an admin's session.
        if (!is_admin() || !current_user_can('manage_options')) {
            return $mimes;
        }

        $mimes['svg']  = 'image/svg+xml';
        $mimes['svgz'] = 'image/svg+xml';

        return $mimes;
    }

    /**
     * @param array<string, mixed>  $data      File data array.
     * @param string               $file      Full path to the file.
     * @param string               $filename  The name of the file.
     * @param array<string, string> $mimes    Allowed mime types.
     * @param string               $real_mime Actual mime type or empty string.
     * @return array<string, mixed>
     */
    public function fix_svg_filetype($data, $file, $filename, $mimes, $real_mime = '') {
        unset($file, $real_mime);

        if (!is_admin() || !current_user_can('manage_options')) {
            return $data;
        }

        $ext = strtolower((string) pathinfo($filename, PATHINFO_EXTENSION));
        if ('svg' !== $ext && 'svgz' !== $ext) {
            return $data;
        }

        $filetype = wp_check_filetype($filename, $mimes);
        if (!empty($filetype['ext']) && !empty($filetype['type'])) {
            $data['ext']  = $filetype['ext'];
            $data['type'] = $filetype['type'];
        }

        return $data;
    }

    /**
     * Skip raster processing for SVG attachments (prevents upload failures).
     *
     * @param array<string, mixed>|false $metadata      Attachment metadata.
     * @param int                        $attachment_id Attachment ID.
     * @return array<string, mixed>|false
     */
    public function fix_svg_attachment_metadata($metadata, $attachment_id) {
        if ('image/svg+xml' !== get_post_mime_type($attachment_id)) {
            return $metadata;
        }

        $width  = 0;
        $height = 0;
        $file   = get_attached_file($attachment_id);

        if ($file && file_exists($file)) {
            $svg = file_get_contents($file);
            if (is_string($svg) && preg_match('/viewBox=["\']\\s*0\\s+0\\s+([\\d.]+)\\s+([\\d.]+)/i', $svg, $matches)) {
                $width  = (int) round((float) $matches[1]);
                $height = (int) round((float) $matches[2]);
            } elseif (is_string($svg) && preg_match('/width=["\']([\\d.]+)/i', $svg, $w) && preg_match('/height=["\']([\\d.]+)/i', $svg, $h)) {
                $width  = (int) round((float) $w[1]);
                $height = (int) round((float) $h[1]);
            }
        }

        return array(
            'width'  => $width,
            'height' => $height,
            'file'   => _wp_relative_upload_path($file),
        );
    }

    /**
     * @param array<string, array<string, mixed>> $sizes         Subsize definitions.
     * @param array<string, mixed>                $metadata      Attachment metadata.
     * @param int                                 $attachment_id Attachment ID.
     * @return array<string, array<string, mixed>>
     */
    public function skip_svg_subsizes($sizes, $metadata, $attachment_id) {
        unset($metadata);

        if ($attachment_id && 'image/svg+xml' === get_post_mime_type($attachment_id)) {
            return array();
        }

        return $sizes;
    }

    /**
     * @param array<string, mixed> $response   Attachment data.
     * @param \WP_Post             $attachment Attachment post object.
     * @param array<string, mixed> $meta       Attachment meta.
     * @return array<string, mixed>
     */
    public function prepare_svg_attachment_for_js($response, $attachment, $meta) {
        unset($attachment);

        if (empty($response['mime']) || 'image/svg+xml' !== $response['mime']) {
            return $response;
        }

        $url = isset($response['url']) ? (string) $response['url'] : '';
        if ('' === $url) {
            return $response;
        }

        $width  = isset($meta['width']) ? (int) $meta['width'] : 0;
        $height = isset($meta['height']) ? (int) $meta['height'] : 0;

        $response['icon']  = $url;
        $response['sizes'] = array(
            'full'      => array(
                'url'         => $url,
                'width'       => $width,
                'height'      => $height,
                'orientation' => 'portrait',
            ),
            'thumbnail' => array(
                'url'         => $url,
                'width'       => 150,
                'height'      => 150,
                'orientation' => 'portrait',
            ),
        );

        if (empty($response['image'])) {
            $response['image'] = array(
                'src'    => $url,
                'width'  => $width ?: null,
                'height' => $height ?: null,
            );
        }

        return $response;
    }

    /**
     * Enqueue admin scripts and styles
     *
     * @param string $hook_suffix The current admin page.
     */
    public function enqueue_scripts($hook_suffix) {

        $admin_assets_file = WEBSAC_BUILD_DIR . 'admin/index.asset.php';
        if (! file_exists($admin_assets_file)) {
            return;
        }

        $admin_assets       = require $admin_assets_file;
        $dependencies       = is_array($admin_assets['dependencies'] ?? null)
            ? $admin_assets['dependencies']
            : [];
        $version            = $admin_assets['version'] ?? WEBSAC_VERSION;
        $code_editor_bundle = [];

        /** Shared toolbar components must load before the admin SPA (sets window.wapComponents / wapHelpers). */
        if (
            preg_match('/website-accessibility/', (string) $hook_suffix) &&
            wp_script_is('websac-components', 'registered') &&
            ! in_array('websac-components', $dependencies, true)
        ) {
            $dependencies[] = 'websac-components';
        }

        /** WordPress CodeMirror wrapper: load core `code-editor` before the SPA bundle. */
        if (preg_match('/website-accessibility/', (string) $hook_suffix) && function_exists('wp_enqueue_code_editor')) {
            $code_editor_settings = wp_enqueue_code_editor([
                'type'       => 'text/css',
                'codemirror' => [
                    'indentUnit'   => 2,
                    'tabSize'      => 2,
                    'lineNumbers'  => true,
                    'lineWrapping' => true,
                    /* Light theme: contrasts with admin card; syntax tokens stay colorful */
                    'theme'        => 'default',
                ],
            ]);

            if (false !== $code_editor_settings) {
                if (! in_array('code-editor', $dependencies, true)) {
                    $dependencies[] = 'code-editor';
                }
                $code_editor_bundle = $code_editor_settings;
            }
        }

        wp_enqueue_script(
            'websac-admin',
            WEBSAC_URL . 'build/admin/index.js',
            $dependencies,
            $version,
            true
        );

        if (preg_match('/website-accessibility/', (string) $hook_suffix)) {
            wp_enqueue_media();
        }

        if ([] !== $code_editor_bundle) {
            wp_add_inline_script(
                'websac-admin',
                sprintf('window.websacCssOverridesCodeEditor=%s;', wp_json_encode($code_editor_bundle)),
                'before'
            );
        }

        wp_set_script_translations('websac-admin', 'website-accessibility', WEBSAC_DIR . 'languages/');

        $license_page_url = admin_url('admin.php?page=website-accessibility-pro_license');

        $wl_data = class_exists(WhiteLabel::class) ? WhiteLabel::get_localized_script_data() : [];

        wp_localize_script(
            'websac-admin',
            'websacAdmin',
            array_merge(
                [
                    'version'           => WEBSAC_VERSION,
                    'apiUrl'            => rest_url(),
                    'homeUrl'           => home_url('/'),
                    'nonce'             => wp_create_nonce('wp_rest'),
                    'isProPluginActive' => Utils::is_pro_plugin_active(),
                    'hasFixedIssuesPage' => $this->has_fixed_issues_page(),
                    'licensePageUrl'    => $license_page_url,
                    'proUpgradeUrl'     => 'https://oneaccessibility.com#pricing',
                    /** Set false in JS after completing tour via REST (same page session). */
                    'shouldAutoStartDashboardTour' => ! DashboardTourRouteV1::is_completed(),
					'isProSettingsTourCompleted'  => DashboardTourRouteV1::is_pro_settings_completed(),
                    'isProfileTourCompleted'      => DashboardTourRouteV1::is_profile_completed(),
                    'shouldAutoStartProfileTour'  => ! DashboardTourRouteV1::is_profile_completed(),
                ],
                $wl_data
            )
        );

        wp_enqueue_style(
            'websac-admin',
            WEBSAC_URL . 'build/admin/index.css',
            ['wp-components'],
            $version
        );
    }

    /**
     * Check if current page is our plugin page
     *
     * @param string $hook_suffix The current admin page.
     * @return boolean
     */
    private function is_plugin_page($hook_suffix) {
        $plugin_pages = [
            'toplevel_page_website-accessibility',
            'accessibility_page_website-accessibility-presets',
            'accessibility_page_website-accessibilityfiles',
        ];

        return in_array($hook_suffix, $plugin_pages, true);
    }

    /**
     * Get current page slug
     *
     * @param string $hook_suffix The current admin page.
     * @return string
     */
    private function get_current_page($hook_suffix) {
        $page_map = [
            'toplevel_page_website-accessibility' => 'website-accessibility-dashboard',
            'website-accessibility_page_website-accessibility-presets' => 'website-accessibility-presets',
            'website-accessibility_page_website-accessibilityfiles' => 'website-accessibilityfiles',
        ];

        return isset($page_map[$hook_suffix]) ? $page_map[$hook_suffix] : 'website-accessibility-dashboard';
    }

    /**
     * The "Fixed Issues" screen is backed by the Pro accessibility checker;
     * only offer it when that plugin is present and the checker is enabled.
     */
    private function has_fixed_issues_page() {
        if (!Utils::is_pro_plugin_active()) {
            return false;
        }

        $settings = get_option('websac_settings', []);
        if (!is_array($settings)) return false;
        $raw_enabled = $settings['enable_accessibility_checker'] ?? false;
        $checker_enabled = is_bool($raw_enabled)
            ? $raw_enabled
            : in_array(strtolower(trim((string) $raw_enabled)), ['1', 'true', 'yes', 'on'], true);
        if (!$checker_enabled) return false;

        return true;
    }
}
