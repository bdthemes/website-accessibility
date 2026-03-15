<?php

/**
 * License Helper - Utility class for checking license status
 *
 * @package SigmaStoreLocator
 * @since 1.0.0
 */

namespace bdthemes\websiteaccessibility\Admin\License;

if (!defined('ABSPATH')) {
    exit;
}


class LicenseHelper {

    /**
     * Check if license is active
     *
     * @return bool
     */
    public static function is_license_active() {
        $main_lic_key = "WebsiteAccessibility_lic_Key";
        $lic_key_name = LicenseBase::get_lic_key_param($main_lic_key);
        $license_key = get_option($lic_key_name, "");
        $lice_email = get_option("WebsiteAccessibility_lic_email", "");

        if (empty($license_key)) {
            if (defined('WEBSITE_ACCESSIBILITY_LICENSE_KEY') && !empty(constant('WEBSITE_ACCESSIBILITY_LICENSE_KEY'))) {
                $license_key = constant('WEBSITE_ACCESSIBILITY_LICENSE_KEY');
            } else {
                return false;
            }
        }

        $license_message = '';
        $response_obj = null;

        $is_active = LicenseBase::check_wp_plugin(
            $license_key,
            $lice_email,
            $license_message,
            $response_obj,
            WEBSAC_PLUGIN_FILE
        );

        return $is_active && $response_obj && !empty($response_obj->is_valid);
    }

    /**
     * Get license data
     *
     * @return object|null
     */
    public static function get_license_data() {
        if (!self::is_license_active()) {
            return null;
        }

        return LicenseBase::get_register_info();
    }

    /**
     * Check if a specific feature is available
     *
     * @param string $feature Feature name/slug
     * @return bool
     */
    public static function can_use_feature($feature = '') {
        // For now, all premium features require active license
        // You can extend this to check specific feature flags
        return self::is_license_active();
    }

    /**
     * Get locked feature message
     *
     * @param string $feature_name Feature name for display
     * @return string
     */
    public static function get_locked_message($feature_name = 'This feature') {
        return sprintf(
            /* translators: %s: Feature name */
            __('%s is only available with an active license. Please activate your license to unlock this feature.', 'website-accessibility'),
            $feature_name
        );
    }

    /**
     * Render locked feature notice
     *
     * @param string $feature_name Feature name
     * @param string $description Optional description
     */
    public static function render_locked_notice($feature_name, $description = '') {
?>
        <div class="ssl-locked-feature notice notice-warning inline">
            <div style="display: flex; align-items: center; gap: 16px; padding: 12px 0;">
                <span class="dashicons dashicons-lock" style="font-size: 24px; color: #f0b429;"></span>
                <div>
                    <h4 style="margin: 0 0 4px 0;"><?php echo esc_html($feature_name); ?> - Premium Feature</h4>
                    <?php if ($description): ?>
                        <p style="margin: 0 0 8px 0;"><?php echo esc_html($description); ?></p>
                    <?php endif; ?>
                    <p style="margin: 0;">
                        <?php echo esc_html(self::get_locked_message($feature_name)); ?>
                        <a href="<?php echo esc_url(admin_url('upload.php?page=ssl-settings&tab=license')); ?>" class="button button-primary" style="margin-left: 8px;">
                            <?php esc_html_e('Activate License', 'website-accessibility'); ?>
                        </a>
                    </p>
                </div>
            </div>
        </div>
<?php
    }

    /**
     * Check feature access and show notice if locked
     * Returns true if feature is available, false otherwise
     *
     * @param string $feature Feature slug
     * @param string $feature_name Display name
     * @param string $description Optional description
     * @return bool
     */
    public static function check_and_render($feature, $feature_name, $description = '') {
        if (self::can_use_feature($feature)) {
            return true;
        }

        self::render_locked_notice($feature_name, $description);
        return false;
    }

    /**
     * Get license status data for JavaScript
     *
     * @return array
     */
    public static function get_js_data() {
        $is_active = self::is_license_active();
        $license_data = $is_active ? self::get_license_data() : null;

        return [
            'isActive' => $is_active,
            'hasLicense' => $is_active,
            'licenseData' => $license_data ? [
                'isValid' => $license_data->is_valid ?? false,
                'licenseTitle' => $license_data->license_title ?? '',
                'expireDate' => $license_data->expire_date ?? '',
                'supportEnd' => $license_data->support_end ?? '',
            ] : null,
        ];
    }
}
