<?php
/**
 * White label helpers (branding, recovery token, boot payload).
 *
 * @package WebsiteAccessibility
 */

namespace Websac\Core;

if (!defined('ABSPATH')) {
    exit;
}

class WhiteLabel {

    public const OPTION_ENABLED = 'websac_white_label_enabled';

    public const OPTION_STATUS = 'websac_white_label_status';

    public const OPTION_RECOVERY_SECRET = 'websac_white_label_recovery_secret';

    public const OPTION_ACCESS_TOKEN = 'websac_white_label_access_token';

    public const OPTION_LOCALHOST_EMAIL = 'websac_localhost_wl_email_data';

    /**
     * Script localization for React / wp-admin.
     *
     * @return array<string, mixed>
     */
    public static function get_localized_script_data() {
        $settings_logo = '';
        if (get_option(self::OPTION_ENABLED, false)) {
            $settings_logo = trim((string) get_option('websac_white_label_logo', ''));
        }

        return array(
            'whiteLabelEligible'      => self::is_white_label_eligible(),
            'hideLicenseNav'          => self::should_hide_license_nav(),
            'hideAdminMenus'          => defined('WEBSAC_HIDE') && WEBSAC_HIDE,
            'whiteLabelRecovery'      => \Websac\Admin\WhiteLabelAdmin::is_recovery_session(),
            'brandDisplayName'        => self::get_display_name(),
            'defaultBrandDisplayName' => __('One Accessibility', 'website-accessibility'),
            'brandLogoUrl'            => $settings_logo,
            'whiteLabelFooterHidden'  => defined('WEBSAC_WL') && WEBSAC_WL && self::wl_status(),
            'whiteLabelBoot'          => self::get_boot_payload(),
        );
    }

    /**
     * White label settings for JS boot / REST (panel icons, title, etc.).
     *
     * @return array<string, mixed>
     */
    public static function get_boot_payload() {
        $enabled = (bool) get_option(self::OPTION_ENABLED, false);

        return array(
            'enabled'           => $enabled,
            'hide_license'      => (bool) get_option('websac_white_label_hide_license', false),
            'hide_admin'        => (bool) get_option('websac_white_label_hide_admin', false),
            'title'             => (string) get_option('websac_white_label_title', ''),
            'icon'              => (string) get_option('websac_white_label_icon', ''),
            'logo'              => (string) get_option('websac_white_label_logo', ''),
            'panel_header_icon' => $enabled
                ? (string) get_option('websac_white_label_panel_header_icon', '')
                : '',
            'panel_footer_icon' => $enabled
                ? (string) get_option('websac_white_label_panel_footer_icon', '')
                : '',
        );
    }

    /**
     * Public menu / header title.
     *
     * @return string
     */
    public static function get_display_name() {
        if (defined('WEBSAC_WHITE_LABEL_BRAND') && WEBSAC_WHITE_LABEL_BRAND !== '') {
            return WEBSAC_WHITE_LABEL_BRAND;
        }

        if (get_option(self::OPTION_ENABLED, false)) {
            $saved = trim((string) get_option('websac_white_label_title', ''));
            if ($saved !== '') {
                return $saved;
            }
        }

        return __('One Accessibility', 'website-accessibility');
    }

    /**
     * Hide the (Pro) License nav when hide_license is on and white label is active.
     *
     * @return bool
     */
    public static function should_hide_license_nav() {
        return defined('WEBSAC_LO') && WEBSAC_LO && self::wl_status();
    }

    /**
     * @return bool
     */
    public static function wl_status() {
        return (bool) get_option(self::OPTION_STATUS, false);
    }

    /**
     * Whether the current user may configure white label.
     *
     * @return bool
     */
    public static function is_white_label_eligible() {
        return current_user_can('manage_options');
    }

    /**
     * @param string $token Raw token from URL.
     * @return bool
     */
    public static function validate_access_token($token) {
        $stored = get_option(self::OPTION_ACCESS_TOKEN, array());
        if (empty($stored) || !is_array($stored) || empty($stored['token'])) {
            return false;
        }
        if (!hash_equals((string) $stored['token'], (string) $token)) {
            return false;
        }

        $current_secret = self::get_recovery_secret();
        if (empty($stored['secret']) || !hash_equals($current_secret, (string) $stored['secret'])) {
            return false;
        }

        return true;
    }

    /**
     * @return bool
     */
    public static function revoke_access_token() {
        $data = get_option(self::OPTION_ACCESS_TOKEN, array());
        if (!empty($data)) {
            delete_option(self::OPTION_ACCESS_TOKEN);
            return true;
        }
        return false;
    }

    /**
     * Per-site secret that recovery tokens are bound to (created on first use).
     *
     * @return string
     */
    public static function get_recovery_secret() {
        $secret = get_option(self::OPTION_RECOVERY_SECRET, '');
        if (!is_string($secret) || $secret === '') {
            $secret = wp_generate_password(64, false, false);
            update_option(self::OPTION_RECOVERY_SECRET, $secret, false);
        }
        return $secret;
    }

    /**
     * Address that receives the hide-admin recovery link.
     *
     * @return string
     */
    public static function get_recovery_email() {
        return trim((string) get_bloginfo('admin_email'));
    }

    /**
     * Allow HTTP(S) media URLs and inline SVG data URIs from the admin uploader.
     *
     * @param string $url Raw asset URL.
     * @return string
     */
    public static function sanitize_brand_asset_url($url) {
        $url = trim((string) $url);
        if ($url === '') {
            return '';
        }

        if (preg_match('#^data:image/svg\\+xml;base64,[a-zA-Z0-9+/=]+$#', $url)) {
            return $url;
        }

        if (preg_match('#^data:image/svg\\+xml;charset=utf-8,.+#', $url)) {
            return $url;
        }

        return esc_url_raw($url);
    }
}
