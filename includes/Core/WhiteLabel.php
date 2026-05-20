<?php
/**
 * White label eligibility and helpers (tier-gated; mirrors Sigma Media Manager / UPK).
 *
 * @package WebsiteAccessibility
 */

namespace bdthemes\websiteaccessibility\Core;

if (!defined('ABSPATH')) {
    exit;
}

class WhiteLabel {

    public const OPTION_ENABLED = 'websac_white_label_enabled';

    public const OPTION_LICENSE_TITLE_STATUS = 'websac_white_label_license_title_status';

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
            'whiteLabelEligible'      => self::is_white_label_license(),
            'hideLicenseNav'          => self::should_hide_license_nav(),
            'hideAdminMenus'          => defined('WEBSAC_HIDE') && WEBSAC_HIDE,
            'whiteLabelRecovery'      => class_exists('\bdthemes\websiteaccessibility\Admin\WhiteLabelAdmin')
                && \bdthemes\websiteaccessibility\Admin\WhiteLabelAdmin::is_recovery_session(),
            'brandDisplayName'        => self::get_display_name(),
            'defaultBrandDisplayName' => __('One Accessibility', 'website-accessibility'),
            'brandLogoUrl'            => $settings_logo,
            'whiteLabelFooterHidden'  => defined('WEBSAC_WL') && WEBSAC_WL && self::license_wl_status(),
            'whiteLabelBoot'          => array(
                'enabled'      => (bool) get_option(self::OPTION_ENABLED, false),
                'hide_license' => (bool) get_option('websac_white_label_hide_license', false),
                'hide_admin'   => (bool) get_option('websac_white_label_hide_admin', false),
                'title'        => (string) get_option('websac_white_label_title', ''),
                'icon'         => (string) get_option('websac_white_label_icon', ''),
                'logo'         => (string) get_option('websac_white_label_logo', ''),
            ),
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
     * Hide License nav when hide_license + WL title status.
     *
     * @return bool
     */
    public static function should_hide_license_nav() {
        return defined('WEBSAC_LO') && WEBSAC_LO && self::license_wl_status();
    }

    /**
     * @return bool
     */
    public static function license_wl_status() {
        return (bool) get_option(self::OPTION_LICENSE_TITLE_STATUS, false);
    }

    /**
     * Allowed tier keywords → SHA-256(word).
     *
     * @return array<string, string>
     */
    public static function get_white_label_allowed_license_types() {
        return array(
            'agency'    => 'c4b2af4722ee54e317672875b2d8cf49aa884bf5820ec6091114fea5ec6560e4',
            'extended'  => '4d7120eb6c796b04273577476eb2e20c34c51d7fa1025ec19c3414448abc241e',
            'developer' => '88fa0d759f845b47c044c2cd44e29082cf6fea665c30c146374ec7c8f3d699e3',
        );
    }

    /**
     * Whether this installation may configure white label.
     *
     * @return bool
     */
    public static function is_white_label_license() {
        if (
            !class_exists('\bdthemes\websiteaccessibilitypro\Admin\License\LicenseHelper')
            || !\bdthemes\websiteaccessibilitypro\Admin\License\LicenseHelper::is_license_active()
        ) {
            return false;
        }

        if (!class_exists('\bdthemes\websiteaccessibilitypro\Admin\License\LicenseBase')) {
            return false;
        }

        $response_obj = \bdthemes\websiteaccessibilitypro\Admin\License\LicenseBase::get_register_info();

        if (
            empty($response_obj)
            || !is_object($response_obj)
            || empty($response_obj->license_title)
            || empty($response_obj->is_valid)
        ) {
            return false;
        }

        if (property_exists($response_obj, 'other_param') && !empty($response_obj->other_param)) {
            if (is_array($response_obj->other_param)) {
                if (in_array('WL', $response_obj->other_param, true)) {
                    return true;
                }
            } elseif (is_string($response_obj->other_param)) {
                if (strpos($response_obj->other_param, 'WL') !== false) {
                    return true;
                }
            }
        }

        $license_title  = sanitize_text_field(strtolower($response_obj->license_title));
        $allowed_hashes = array_values(self::get_white_label_allowed_license_types());
        $words          = preg_split('/\s+/', $license_title, -1, PREG_SPLIT_NO_EMPTY);

        if (!is_array($words)) {
            return false;
        }

        foreach ($words as $word) {
            $word = trim($word);
            if ($word === '' || strlen($word) > 50) {
                continue;
            }
            $hash = hash('sha256', $word);
            if (in_array($hash, $allowed_hashes, true)) {
                return true;
            }
        }

        return false;
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
        if ($stored['token'] !== $token) {
            return false;
        }

        $current_key = self::get_bound_license_key();
        if (empty($stored['license_key']) || $stored['license_key'] !== $current_key) {
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
     * @return string
     */
    public static function get_bound_license_key() {
        if (!class_exists('\bdthemes\websiteaccessibilitypro\Admin\License\LicenseBase')) {
            return '';
        }

        $main_lic_key = 'WebsiteAccessibility_lic_Key';
        $lic_key_name = \bdthemes\websiteaccessibilitypro\Admin\License\LicenseBase::get_lic_key_param($main_lic_key);

        return trim((string) get_option($lic_key_name, ''));
    }

    /**
     * @return string
     */
    public static function get_license_email_for_recovery() {
        return trim((string) get_option('WebsiteAccessibility_lic_email', ''));
    }
}
