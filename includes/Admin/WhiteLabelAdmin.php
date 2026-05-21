<?php
/**
 * White label admin hooks: recovery links, menu icon CSS, recovery email.
 *
 * @package WebsiteAccessibility
 */

namespace bdthemes\websiteaccessibility\Admin;

use bdthemes\websiteaccessibility\Core\WhiteLabel;
use bdthemes\websiteaccessibility\Traits\Singleton;

if (!defined('ABSPATH')) {
    exit;
}

class WhiteLabelAdmin {

    use Singleton;

    /**
     * @var bool
     */
    private static $recovery_session = false;

    /**
     * @return bool
     */
    public static function is_recovery_session() {
        return self::$recovery_session;
    }

    /**
     * Hide plugin admin menus when WEBSAC_HIDE is on unless recovery session.
     *
     * @return bool
     */
    public static function should_hide_admin_menus() {
        return defined('WEBSAC_HIDE') && WEBSAC_HIDE && !self::$recovery_session;
    }

    private function __construct() {
        add_action('admin_menu', array($this, 'maybe_process_recovery_link'), 1);
        add_action('admin_head', array($this, 'inject_white_label_icon_css'));
        add_action('admin_footer', array($this, 'print_admin_menu_title_sync'), 20);
        add_filter('admin_title', array($this, 'filter_admin_title'), 10, 2);
    }

    /**
     * @return void
     */
    public function maybe_process_recovery_link() {
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Public bookmark-style recovery URL (token verified separately).
        if (!isset($_GET['websac_wl']) || !isset($_GET['token'])) {
            return;
        }

        if (!current_user_can('manage_options')) {
            wp_die(
                esc_html__('You do not have sufficient permissions to access this page.', 'website-accessibility'),
                esc_html__('Access denied', 'website-accessibility'),
                array('response' => 403)
            );
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        $wl_flag = sanitize_text_field(wp_unslash($_GET['websac_wl']));
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        $token   = sanitize_text_field(wp_unslash($_GET['token']));

        if ($wl_flag !== '1') {
            $this->die_recovery_error(
                esc_html__('Invalid access parameter. Use the link from your recovery email.', 'website-accessibility')
            );
        }

        if (!WhiteLabel::validate_access_token($token)) {
            $this->die_recovery_error(
                esc_html__('Invalid or outdated recovery link. Request a new one from the site owner or support.', 'website-accessibility')
            );
        }

        self::$recovery_session = true;

        add_action(
            'admin_notices',
            static function () {
                echo '<div class="notice notice-success is-dismissible"><p><strong>';
                esc_html_e('White label recovery access granted. You can adjust hide-admin and branding settings.', 'website-accessibility');
                echo '</strong></p></div>';
            }
        );
    }

    /**
     * @param string $message Message.
     * @return void
     */
    private function die_recovery_error($message) {
        wp_die(
            '<h1>' . esc_html__('One Accessibility — recovery link', 'website-accessibility') . '</h1>'
            . '<p><strong>' . esc_html__('Access denied:', 'website-accessibility') . '</strong> ' . esc_html($message) . '</p>'
            . '<p><a class="button button-primary" href="' . esc_url(admin_url()) . '">' . esc_html__('Return to dashboard', 'website-accessibility') . '</a></p>',
            esc_html__('Access denied', 'website-accessibility'),
            array('response' => 403)
        );
    }

    /**
     * Replace default plugin name in browser tab title on our admin screens.
     *
     * @param string $admin_title Full admin title.
     * @param string $title       Page title segment.
     * @return string
     */
    public function filter_admin_title($admin_title, $title) {
        if (!get_option(WhiteLabel::OPTION_ENABLED, false)) {
            return $admin_title;
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        $page = isset($_GET['page']) ? sanitize_key(wp_unslash($_GET['page'])) : '';
        if ($page === '' || strpos($page, 'website-accessibility') !== 0) {
            return $admin_title;
        }

        $default = __('One Accessibility', 'website-accessibility');
        $brand   = WhiteLabel::get_display_name();

        if ($brand === $default) {
            return $admin_title;
        }

        return str_replace($default, $brand, $admin_title);
    }

    /**
     * Keep wp-admin menu label in sync on every admin screen (SPA save + non-plugin pages).
     *
     * @return void
     */
    public function print_admin_menu_title_sync() {
        if (!get_option(WhiteLabel::OPTION_ENABLED, false)) {
            return;
        }

        $boot = array(
            'enabled'    => true,
            'title'      => (string) get_option('websac_white_label_title', ''),
            'icon'       => (string) get_option('websac_white_label_icon', ''),
            'hide_admin' => (bool) get_option('websac_white_label_hide_admin', false),
        );

        if ($boot['title'] === '' && $boot['icon'] === '' && !$boot['hide_admin']) {
            return;
        }

        $default = __('One Accessibility', 'website-accessibility');
        $icon_css = !empty($boot['icon']) ? self::build_menu_icon_css($boot['icon']) : '';
        ?>
        <?php if ($icon_css !== '') : ?>
        <style type="text/css" id="websac-wl-admin-menu-icon-footer"><?php echo $icon_css; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built via esc_url in build_menu_icon_css ?></style>
        <?php endif; ?>
        <script id="websac-wl-admin-menu-sync">
        (function () {
            var boot = <?php echo wp_json_encode($boot); ?>;
            var base = <?php echo wp_json_encode($default); ?>;
            if (!boot || !boot.enabled) {
                return;
            }
            var title = (boot.title && String(boot.title).trim()) || base;
            var top = document.querySelector('#adminmenu a.toplevel_page_website-accessibility');
            if (top) {
                var label = top.querySelector('.wp-menu-name');
                if (label) {
                    label.textContent = title;
                }
                top.setAttribute('aria-label', title);
            }
            if (document.title && document.title.indexOf(base) !== -1) {
                document.title = document.title.split(base).join(title);
            }
            if (boot.hide_admin && top) {
                var li = top.closest('li');
                if (li) {
                    li.style.display = 'none';
                }
            }
        })();
        </script>
        <?php
    }

    /**
     * @return void
     */
    public function inject_white_label_icon_css() {
        if (WhiteLabel::should_hide_license_nav() && !self::$recovery_session) {
            echo '<style type="text/css" id="websac-wl-hide-license-submenu">
                #adminmenu a[href*="page=website-accessibility-license"] { display: none !important; }
            </style>';
        }

        if (!get_option(WhiteLabel::OPTION_ENABLED, false)) {
            return;
        }

        $icon = get_option('websac_white_label_icon', '');
        if (empty($icon)) {
            return;
        }

        $url = esc_url($icon, array('http', 'https', 'data'));
        echo '<style type="text/css" id="websac-wl-admin-menu-icon-php">' . self::build_menu_icon_css($url) . '</style>';
    }

    /**
     * CSS: keep custom WL icon inside .wp-menu-image (never over menu text).
     *
     * @param string $url Icon URL.
     * @return string
     */
    public static function build_menu_icon_css($url) {
        $safe = esc_url($url, array('http', 'https', 'data'));
        return '
            #adminmenu .wap-admin-root-menu .wp-menu-image {
                position: relative !important;
                background-image: url(' . $safe . ') !important;
                background-size: 20px 20px !important;
                background-repeat: no-repeat !important;
                background-position: center center !important;
            }
            #adminmenu .wap-admin-root-menu .wp-menu-image::before,
            #adminmenu .wap-admin-root-menu .wp-menu-image::after {
                display: none !important;
                content: none !important;
            }
            #adminmenu .wap-admin-root-menu .wp-menu-image img {
                opacity: 0 !important;
                visibility: hidden !important;
                width: 0 !important;
                height: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
            }
            .folded #adminmenu .wap-admin-root-menu .wp-menu-image {
                background-position: center center !important;
            }
        ';
    }

    /**
     * @return bool
     */
    public static function send_recovery_email() {
        $license_email = WhiteLabel::get_license_email_for_recovery();
        $admin_email   = get_bloginfo('admin_email');
        $license_key   = WhiteLabel::get_bound_license_key();
        $site_name     = get_bloginfo('name');
        $site_url      = get_bloginfo('url');

        if ($license_key === '') {
            return false;
        }

        $access_token = wp_hash($license_key . time() . wp_salt() . wp_generate_password(32, false));

        $token_data = array(
            'token'       => $access_token,
            'license_key' => $license_key,
            'created_at'  => current_time('timestamp'),
            'user_id'     => get_current_user_id(),
        );

        update_option(WhiteLabel::OPTION_ACCESS_TOKEN, $token_data);

        $access_url = admin_url(
            'admin.php?page=website-accessibility-white-label&websac_wl=1&token=' . rawurlencode($access_token)
        );

        $subject = sprintf(
            /* translators: %s: Site title. */
            __('[%s] One Accessibility — white label recovery link', 'website-accessibility'),
            $site_name
        );

        $message = self::build_email_html($site_name, $site_url, $access_url, $license_key);

        $headers = array(
            'Content-Type: text/html; charset=UTF-8',
            'From: ' . $site_name . ' <' . $admin_email . '>',
        );

        $sent = false;
        if (!empty($license_email) && is_email($license_email)) {
            $sent = (bool) wp_mail($license_email, $subject, $message, $headers);
        }

        if (!$sent || self::is_localhost()) {
            self::save_localhost_email_fallback($access_url, $message, $license_email);
        }

        return $sent;
    }

    /**
     * @return bool
     */
    private static function is_localhost() {
        $server_name = isset($_SERVER['SERVER_NAME']) ? (string) $_SERVER['SERVER_NAME'] : '';
        $server_addr = isset($_SERVER['SERVER_ADDR']) ? (string) $_SERVER['SERVER_ADDR'] : '';

        foreach (array('localhost', '127.0.0.1', '::1', '.local', '.test', '.dev') as $needle) {
            if ($needle !== '' && (strpos($server_name, $needle) !== false || strpos($server_addr, $needle) !== false)) {
                return true;
            }
        }
        return false;
    }

    /**
     * @param string $access_url Recovery URL.
     * @param string $html       Email HTML.
     * @param string $recipient  Intended recipient.
     * @return void
     */
    private static function save_localhost_email_fallback($access_url, $html, $recipient) {
        update_option(
            WhiteLabel::OPTION_LOCALHOST_EMAIL,
            array(
                'access_url'      => $access_url,
                'email_content'   => $html,
                'recipient_email' => $recipient,
                'message'         => __('Mail may not work on localhost. Save this recovery URL:', 'website-accessibility'),
            )
        );
    }

    /**
     * @param string $site_name   Site name.
     * @param string $site_url    Home URL.
     * @param string $access_url  Recovery URL.
     * @param string $license_key Full license key.
     * @return string
     */
    private static function build_email_html($site_name, $site_url, $access_url, $license_key) {
        $masked = strlen($license_key) > 13
            ? substr($license_key, 0, 8) . '****-****-****-' . substr($license_key, -4)
            : '****';

        ob_start();
        ?>
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;">
            <div style="max-width:600px;margin:0 auto;padding:20px;">
                <h2 style="color:#007bff;"><?php esc_html_e('One Accessibility — hide-admin recovery', 'website-accessibility'); ?></h2>
                <p><?php esc_html_e('Hide-admin / aggressive white label mode was enabled. Keep this email — it contains your private settings link.', 'website-accessibility'); ?></p>
                <p><strong><?php esc_html_e('Site:', 'website-accessibility'); ?></strong> <?php echo esc_html($site_name); ?> — <?php echo esc_html($site_url); ?></p>
                <p><strong><?php esc_html_e('License (masked):', 'website-accessibility'); ?></strong> <?php echo esc_html($masked); ?></p>
                <p style="text-align:center;margin:28px 0;">
                    <a href="<?php echo esc_url($access_url); ?>" style="background:#007bff;color:#fff;padding:14px 22px;text-decoration:none;border-radius:4px;display:inline-block;">
                        <?php esc_html_e('Open white label settings', 'website-accessibility'); ?>
                    </a>
                </p>
                <p style="word-break:break-all;font-size:13px;"><strong><?php esc_html_e('Direct link:', 'website-accessibility'); ?></strong><br>
                    <a href="<?php echo esc_url($access_url); ?>"><?php echo esc_html($access_url); ?></a>
                </p>
            </div>
        </body>
        </html>
        <?php
        return (string) ob_get_clean();
    }
}
