<?php
/**
 * Admin class
 *
 * @package Website_Accessibility
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Admin class
 */
class Website_Accessibility_Admin {

    /**
     * Settings instance
     *
     * @var Website_Accessibility_Settings
     */
    private $settings;

    /**
     * Constructor
     *
     * @param Website_Accessibility_Settings $settings Settings instance.
     */
    public function __construct($settings) {
        $this->settings = $settings;
    }

    /**
     * Initialize the admin functionality
     */
    public function init() {
        // Add menu
        add_action('admin_menu', array($this, 'add_menu'));

        // Enqueue admin scripts and styles
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));

        // Add settings sections and fields
        add_action('admin_init', array($this, 'setup_settings_sections'));
        
        // Add AJAX handler for saving settings
        add_action('wp_ajax_save_website_accessibility_settings', array($this, 'ajax_save_settings'));
    }

    /**
     * Add admin menu
     */
    public function add_menu() {
        add_menu_page(
            esc_html__('Website Accessibility', 'website-accessibility'),
            esc_html__('Accessibility', 'website-accessibility'),
            'manage_options',
            'website-accessibility',
            array($this, 'render_settings_page'),
            'dashicons-universal-access',
            85
        );

        add_submenu_page(
            'website-accessibility',
            esc_html__('Settings', 'website-accessibility'),
            esc_html__('Settings', 'website-accessibility'), 
            'manage_options',
            'website-accessibility',
            array($this, 'render_settings_page')
        );

        add_submenu_page(
            'website-accessibility',
            esc_html__('Help', 'website-accessibility'),
            esc_html__('Help', 'website-accessibility'),
            'manage_options', 
            'website-accessibility-help',
            array($this, 'render_help_page')
        );
    }

    /**
     * Enqueue admin scripts and styles
     *
     * @param string $hook Current admin page.
     */
    public function enqueue_admin_scripts($hook) {
        // Only load on plugin settings pages
        if (strpos($hook, 'website-accessibility') === false) {
            return;
        }

        // Enqueue WordPress color picker
        wp_enqueue_style('wp-color-picker');
        wp_enqueue_script('wp-color-picker');

        // Enqueue admin CSS
        wp_enqueue_style(
            'website-accessibility-admin',
            esc_url(WAP_PLUGIN_URL . 'admin/css/website-accessibility-admin.css'),
            array(),
            esc_attr(WAP_VERSION)
        );

        // Enqueue admin JS
        wp_enqueue_script(
            'website-accessibility-admin',
            esc_url(WAP_PLUGIN_URL . 'admin/js/website-accessibility-admin.js'),
            array('jquery', 'wp-color-picker'),
            esc_attr(WAP_VERSION),
            true
        );

        // Add nonce and localized data for AJAX
        wp_localize_script('website-accessibility-admin', 'wapAjax', array(
            'nonce' => wp_create_nonce('website_accessibility_ajax_nonce'),
            'ajaxurl' => admin_url('admin-ajax.php')
        ));

        // Media uploader
        wp_enqueue_media();
    }

    /**
     * Handle AJAX save settings
     */
    public function ajax_save_settings() {
        // Check nonce for security
        if (!check_ajax_referer('website_accessibility_ajax_nonce', 'wap_nonce', false)) {
            wp_send_json_error(array('message' => esc_html__('Security check failed', 'website-accessibility')));
            return;
        }
        
        // Check user capabilities
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => esc_html__('Permission denied', 'website-accessibility')));
            return;
        }
        
        // Get and sanitize the posted data
        if (!isset($_POST['website_accessibility_options']) || !is_array($_POST['website_accessibility_options'])) {
            wp_send_json_error(array('message' => esc_html__('Invalid data format', 'website-accessibility')));
            return;
        }

        // Deep sanitize the options array
        $sanitized_options = $this->sanitize_options_recursive(wp_unslash($_POST['website_accessibility_options']));
        
        // Update the options
        update_option('website_accessibility_options', $sanitized_options);
        
        // Send success response
        wp_send_json_success(array('message' => esc_html__('Settings saved successfully', 'website-accessibility')));
    }

    /**
     * Recursively sanitize options array
     *
     * @param array $options Options array to sanitize
     * @return array Sanitized options
     */
    private function sanitize_options_recursive($options) {
        $sanitized = array();
        
        foreach ($options as $key => $value) {
            // Sanitize the key
            $key = sanitize_key($key);
            
            if (is_array($value)) {
                $sanitized[$key] = $this->sanitize_options_recursive($value);
            } else {
                switch ($key) {
                    case 'custom_css':
                        $sanitized[$key] = wp_strip_all_tags($value);
                        break;
                    case 'google_api_key':
                        $sanitized[$key] = sanitize_text_field($value);
                        break;
                    case 'custom_icon':
                        $sanitized[$key] = esc_url_raw($value);
                        break;
                    case 'button_color':
                    case 'button_text_color':
                        $sanitized[$key] = sanitize_hex_color($value);
                        break;
                    default:
                        // For boolean values (checkboxes)
                        if ($value === 'yes' || $value === 'no') {
                            $sanitized[$key] = $value;
                        } else {
                            $sanitized[$key] = sanitize_text_field($value);
                        }
                }
            }
        }
        
        return $sanitized;
    }

    /**
     * Render settings page
     */
    public function render_settings_page() {
        // Check user capabilities
        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'website-accessibility'));
        }
        
        // Verify nonce
        if (isset($_POST['_wpnonce']) && !wp_verify_nonce($_POST['_wpnonce'], 'website_accessibility_options_group-options')) {
            wp_die(esc_html__('Security check failed.', 'website-accessibility'));
        }
        
        // Get plugin version
        $plugin_data = get_plugin_data(WAP_PLUGIN_FILE);
        $version = isset($plugin_data['Version']) ? $plugin_data['Version'] : '';
        ?>
        <div class="wrap">
            <div class="wap-admin-container">
                <div class="wap-header">
                    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
                    <p><?php esc_html_e('Configure accessibility options for your website', 'website-accessibility'); ?></p>
                    <span class="wap-version"><?php echo esc_html('v' . $version); ?></span>
                </div>
                
                <div class="wap-tabs-nav">
                    <?php $this->render_tabs_navigation(); ?>
                </div>
                
                <form method="post" action="<?php echo esc_url(admin_url('options.php')); ?>" class="wap-settings-form">
                    <?php 
                    settings_fields('website_accessibility_options_group');
                    wp_nonce_field('website_accessibility_ajax_nonce', 'wap_nonce'); 
                    ?>
                    
                    <div id="wap-tab-general" class="wap-tab-content">
                        <?php $this->render_general_tab(); ?>
                    </div>
                    
                    <div id="wap-tab-button" class="wap-tab-content">
                        <?php $this->render_button_tab(); ?>
                    </div>
                    
                    <div id="wap-tab-appearance" class="wap-tab-content">
                        <?php $this->render_appearance_tab(); ?>
                    </div>
                    
                    <div id="wap-tab-features" class="wap-tab-content">
                        <?php $this->render_features_tab(); ?>
                    </div>
                    
                    <div id="wap-tab-advanced" class="wap-tab-content">
                        <?php $this->render_advanced_tab(); ?>
                    </div>
                    
                    <div class="wap-button-container">
                        <?php submit_button(esc_html__('Save Settings', 'website-accessibility'), 'wap-save-button'); ?>
                        <noscript>
                            <?php submit_button(esc_html__('Save Settings', 'website-accessibility'), 'button button-primary'); ?>
                        </noscript>
                    </div>
                </form>
            </div>
        </div>
        <?php
    }

    /**
     * Render tabs navigation
     */
    private function render_tabs_navigation() {
        $tabs = array(
            'general' => array(
                'icon' => 'settings',
                'label' => esc_html__('General', 'website-accessibility')
            ),
            'button' => array(
                'icon' => 'button',
                'label' => esc_html__('Button', 'website-accessibility')
            ),
            'appearance' => array(
                'icon' => 'admin-appearance',
                'label' => esc_html__('Appearance', 'website-accessibility')
            ),
            'features' => array(
                'icon' => 'universal-access',
                'label' => esc_html__('Features', 'website-accessibility')
            ),
            'advanced' => array(
                'icon' => 'admin-generic',
                'label' => esc_html__('Advanced', 'website-accessibility')
            )
        );

        foreach ($tabs as $tab_id => $tab) {
            printf(
                '<a class="wap-tab-link" data-tab="wap-tab-%1$s"><span class="dashicons dashicons-%2$s"></span>%3$s</a>',
                esc_attr($tab_id),
                esc_attr($tab['icon']),
                esc_html($tab['label'])
            );
        }
    }

    /**
     * Render the General tab
     */
    private function render_general_tab() {
        ?>
        <div class="wap-card">
            <div class="wap-card-header">
                <h2><?php esc_html_e('Language Settings', 'website-accessibility'); ?></h2>
            </div>
            <div class="wap-card-body">
                <p class="wap-card-description"><?php esc_html_e('Configure language detection and default language settings.', 'website-accessibility'); ?></p>
                
                <div class="wap-form-field">
                    <label class="wap-label"><?php esc_html_e('Auto Detect Language', 'website-accessibility'); ?></label>
                    <div class="wap-toggle-field">
                        <label class="wap-toggle-switch">
                            <input type="checkbox" name="website_accessibility_options[auto_detect_language]" value="yes" <?php checked($this->settings->get_option('auto_detect_language'), 'yes'); ?>>
                            <span class="wap-toggle-slider"></span>
                        </label>
                        <span class="wap-toggle-label"><?php esc_html_e('Enable automatic language detection', 'website-accessibility'); ?></span>
                    </div>
                </div>
                
                <div class="wap-form-field">
                    <label class="wap-label" for="wap-default-language"><?php esc_html_e('Default Language', 'website-accessibility'); ?></label>
                    <select id="wap-default-language" name="website_accessibility_options[default_language]" class="wap-select">
                        <?php
                        $languages = $this->get_available_languages();
                        $selected_language = $this->settings->get_option('default_language');
                        
                        foreach ($languages as $code => $name) {
                            printf(
                                '<option value="%s" %s>%s</option>',
                                esc_attr($code),
                                selected($selected_language, $code, false),
                                esc_html($name)
                            );
                        }
                        ?>
                    </select>
                </div>
            </div>
        </div>
        
        <div class="wap-card">
            <div class="wap-card-header">
                <h2><?php esc_html_e('User Interface Settings', 'website-accessibility'); ?></h2>
            </div>
            <div class="wap-card-body">
                <p class="wap-card-description"><?php esc_html_e('Configure how the accessibility panel behaves.', 'website-accessibility'); ?></p>
                
                <div class="wap-settings-grid">
                    <div class="wap-form-field">
                        <label class="wap-label"><?php esc_html_e('Help Tooltips', 'website-accessibility'); ?></label>
                        <div class="wap-toggle-field">
                            <label class="wap-toggle-switch">
                                <input type="checkbox" name="website_accessibility_options[enable_tooltips]" value="yes" <?php checked($this->settings->get_option('enable_tooltips'), 'yes'); ?>>
                                <span class="wap-toggle-slider"></span>
                            </label>
                            <span class="wap-toggle-label"><?php esc_html_e('Enable help tooltips in accessibility panel', 'website-accessibility'); ?></span>
                        </div>
                    </div>
                    
                    <div class="wap-form-field">
                        <label class="wap-label"><?php esc_html_e('Panel Theme', 'website-accessibility'); ?></label>
                        <select name="website_accessibility_options[panel_theme]" class="wap-select">
                            <option value="light" <?php selected($this->settings->get_option('panel_theme'), 'light'); ?>><?php esc_html_e('Light', 'website-accessibility'); ?></option>
                            <option value="dark" <?php selected($this->settings->get_option('panel_theme'), 'dark'); ?>><?php esc_html_e('Dark', 'website-accessibility'); ?></option>
                            <option value="high-contrast" <?php selected($this->settings->get_option('panel_theme'), 'high-contrast'); ?>><?php esc_html_e('High Contrast', 'website-accessibility'); ?></option>
                            <option value="custom" <?php selected($this->settings->get_option('panel_theme'), 'custom'); ?>><?php esc_html_e('Custom', 'website-accessibility'); ?></option>
                        </select>
                    </div>
                    
                    <div class="wap-form-field">
                        <label class="wap-label"><?php esc_html_e('Panel Position', 'website-accessibility'); ?></label>
                        <select name="website_accessibility_options[panel_position]" class="wap-select">
                            <option value="left" <?php selected($this->settings->get_option('panel_position'), 'left'); ?>><?php esc_html_e('Left', 'website-accessibility'); ?></option>
                            <option value="right" <?php selected($this->settings->get_option('panel_position'), 'right'); ?>><?php esc_html_e('Right', 'website-accessibility'); ?></option>
                        </select>
                    </div>
                    
                    <div class="wap-form-field">
                        <label class="wap-label"><?php esc_html_e('Auto Save Changes', 'website-accessibility'); ?></label>
                        <div class="wap-toggle-field">
                            <label class="wap-toggle-switch">
                                <input type="checkbox" name="website_accessibility_options[auto_save_changes]" value="yes" <?php checked($this->settings->get_option('auto_save_changes'), 'yes'); ?>>
                                <span class="wap-toggle-slider"></span>
                            </label>
                            <span class="wap-toggle-label"><?php esc_html_e('Enable automatic saving of user changes', 'website-accessibility'); ?></span>
                        </div>
                    </div>
                    
                    <div class="wap-form-field">
                        <label class="wap-label"><?php esc_html_e('Reset on Page Change', 'website-accessibility'); ?></label>
                        <div class="wap-toggle-field">
                            <label class="wap-toggle-switch">
                                <input type="checkbox" name="website_accessibility_options[reset_on_page_change]" value="yes" <?php checked($this->settings->get_option('reset_on_page_change'), 'yes'); ?>>
                                <span class="wap-toggle-slider"></span>
                            </label>
                            <span class="wap-toggle-label"><?php esc_html_e('Reset accessibility settings when user navigates to a new page', 'website-accessibility'); ?></span>
                        </div>
                    </div>
                    
                    <div class="wap-form-field">
                        <label class="wap-label"><?php esc_html_e('Mobile Visibility', 'website-accessibility'); ?></label>
                        <div class="wap-toggle-field">
                            <label class="wap-toggle-switch">
                                <input type="checkbox" name="website_accessibility_options[show_on_mobile]" value="yes" <?php checked($this->settings->get_option('show_on_mobile'), 'yes'); ?>>
                                <span class="wap-toggle-slider"></span>
                            </label>
                            <span class="wap-toggle-label"><?php esc_html_e('Show accessibility panel on mobile devices', 'website-accessibility'); ?></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }
    
    /**
     * Render the Button tab
     */
    private function render_button_tab() {
        ?>
        <div class="wap-card">
            <div class="wap-card-header">
                <h2><?php esc_html_e('Button Appearance', 'website-accessibility'); ?></h2>
            </div>
            <div class="wap-card-body">
                <p class="wap-card-description"><?php esc_html_e('Configure how the accessibility button appears on your website.', 'website-accessibility'); ?></p>
                
                <div class="wap-settings-grid">
                    <div class="wap-form-field">
                        <label class="wap-label"><?php esc_html_e('Button Position', 'website-accessibility'); ?></label>
                        <select name="website_accessibility_options[button_position]" class="wap-select">
                            <option value="left" <?php selected($this->settings->get_option('button_position'), 'left'); ?>><?php esc_html_e('Left', 'website-accessibility'); ?></option>
                            <option value="right" <?php selected($this->settings->get_option('button_position'), 'right'); ?>><?php esc_html_e('Right', 'website-accessibility'); ?></option>
                            <option value="top-left" <?php selected($this->settings->get_option('button_position'), 'top-left'); ?>><?php esc_html_e('Top Left', 'website-accessibility'); ?></option>
                            <option value="top-right" <?php selected($this->settings->get_option('button_position'), 'top-right'); ?>><?php esc_html_e('Top Right', 'website-accessibility'); ?></option>
                            <option value="bottom-left" <?php selected($this->settings->get_option('button_position'), 'bottom-left'); ?>><?php esc_html_e('Bottom Left', 'website-accessibility'); ?></option>
                            <option value="bottom-right" <?php selected($this->settings->get_option('button_position'), 'bottom-right'); ?>><?php esc_html_e('Bottom Right', 'website-accessibility'); ?></option>
                            <option value="custom" <?php selected($this->settings->get_option('button_position'), 'custom'); ?>><?php esc_html_e('Custom', 'website-accessibility'); ?></option>
                        </select>
                    </div>
                    
                    <div class="wap-form-field">
                        <label class="wap-label"><?php esc_html_e('Button Size', 'website-accessibility'); ?></label>
                        <select name="website_accessibility_options[button_size]" class="wap-select">
                            <option value="small" <?php selected($this->settings->get_option('button_size'), 'small'); ?>><?php esc_html_e('Small', 'website-accessibility'); ?></option>
                            <option value="medium" <?php selected($this->settings->get_option('button_size'), 'medium'); ?>><?php esc_html_e('Medium', 'website-accessibility'); ?></option>
                            <option value="large" <?php selected($this->settings->get_option('button_size'), 'large'); ?>><?php esc_html_e('Large', 'website-accessibility'); ?></option>
                        </select>
                    </div>
                    
                    <div class="wap-form-field">
                        <label class="wap-label"><?php esc_html_e('Button Icon', 'website-accessibility'); ?></label>
                        <select name="website_accessibility_options[button_icon]" class="wap-select">
                            <option value="default" <?php selected($this->settings->get_option('button_icon'), 'default'); ?>><?php esc_html_e('Default Icon', 'website-accessibility'); ?></option>
                            <option value="custom" <?php selected($this->settings->get_option('button_icon'), 'custom'); ?>><?php esc_html_e('Custom Icon', 'website-accessibility'); ?></option>
                        </select>
                    </div>
                    
                    <div class="wap-form-field wap-form-field-custom-icon">
                        <label class="wap-label"><?php esc_html_e('Custom Icon', 'website-accessibility'); ?></label>
                        <div class="wap-image-field">
                            <input type="text" id="wap-custom-icon" name="website_accessibility_options[custom_icon]" value="<?php echo esc_url($this->settings->get_option('custom_icon')); ?>" class="wap-text-field" readonly>
                            <button type="button" class="button wap-upload-button" data-target="wap-custom-icon"><?php esc_html_e('Upload', 'website-accessibility'); ?></button>
                            <?php if (!empty($this->settings->get_option('custom_icon'))) : ?>
                                <div class="wap-image-preview">
                                    <img src="<?php echo esc_url($this->settings->get_option('custom_icon')); ?>" alt="<?php esc_attr_e('Custom Icon', 'website-accessibility'); ?>">
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="wap-card">
            <div class="wap-card-header">
                <h2><?php esc_html_e('Button Colors', 'website-accessibility'); ?></h2>
            </div>
            <div class="wap-card-body">
                <div class="wap-settings-grid">
                    <div class="wap-form-field">
                        <label class="wap-label"><?php esc_html_e('Button Color', 'website-accessibility'); ?></label>
                        <div class="wap-color-field">
                            <div class="wap-color-preview"></div>
                            <input type="text" class="wap-color-picker" name="website_accessibility_options[button_color]" value="<?php echo esc_attr($this->settings->get_option('button_color')); ?>" data-default-color="<?php echo esc_attr($this->settings->get_option('button_color')); ?>">
                        </div>
                    </div>
                    
                    <div class="wap-form-field">
                        <label class="wap-label"><?php esc_html_e('Button Text Color', 'website-accessibility'); ?></label>
                        <div class="wap-color-field">
                            <div class="wap-color-preview"></div>
                            <input type="text" class="wap-color-picker" name="website_accessibility_options[button_text_color]" value="<?php echo esc_attr($this->settings->get_option('button_text_color')); ?>" data-default-color="<?php echo esc_attr($this->settings->get_option('button_text_color')); ?>">
                        </div>
                    </div>
                    
                    <div class="wap-form-field">
                        <label class="wap-label"><?php esc_html_e('Animation Type', 'website-accessibility'); ?></label>
                        <select name="website_accessibility_options[animation_type]" class="wap-select">
                            <option value="none" <?php selected($this->settings->get_option('animation_type'), 'none'); ?>><?php esc_html_e('None', 'website-accessibility'); ?></option>
                            <option value="fade" <?php selected($this->settings->get_option('animation_type'), 'fade'); ?>><?php esc_html_e('Fade', 'website-accessibility'); ?></option>
                            <option value="slide" <?php selected($this->settings->get_option('animation_type'), 'slide'); ?>><?php esc_html_e('Slide', 'website-accessibility'); ?></option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }
    
    /**
     * Render the Appearance tab
     */
    private function render_appearance_tab() {
        ?>
        <div class="wap-card">
            <div class="wap-card-header">
                <h2><?php esc_html_e('Panel Appearance', 'website-accessibility'); ?></h2>
            </div>
            <div class="wap-card-body">
                <p class="wap-card-description"><?php esc_html_e('Configure the appearance of the accessibility panel.', 'website-accessibility'); ?></p>
                
                <div class="wap-settings-grid">
                    <!-- Panel appearance settings will go here in future updates -->
                    <div class="wap-form-field">
                        <p><?php esc_html_e('Panel appearance customization options will be available in a future update.', 'website-accessibility'); ?></p>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }
    
    /**
     * Render the Features tab
     */
    private function render_features_tab() {
        $features = array(
            'reading_experience' => array(
                'title' => esc_html__('Reading Experience', 'website-accessibility'),
                'features' => array(
                    'enable_text_magnifier' => esc_html__('Text Magnifier', 'website-accessibility'),
                    'enable_readable_font' => esc_html__('Readable Font', 'website-accessibility'),
                    'enable_dyslexia_font' => esc_html__('Dyslexia Friendly Font', 'website-accessibility'),
                    'enable_highlight_titles' => esc_html__('Highlight Titles', 'website-accessibility'),
                    'enable_highlight_links' => esc_html__('Highlight Links', 'website-accessibility'),
                    'enable_font_sizing' => esc_html__('Font Sizing Controls', 'website-accessibility'),
                    'enable_line_height' => esc_html__('Line Height Controls', 'website-accessibility'),
                    'enable_letter_spacing' => esc_html__('Letter Spacing Controls', 'website-accessibility'),
                )
            ),
            'visual_experience' => array(
                'title' => esc_html__('Visual Experience', 'website-accessibility'),
                'features' => array(
                    'enable_dark_mode' => esc_html__('Dark Mode', 'website-accessibility'),
                    'enable_high_contrast' => esc_html__('High Contrast', 'website-accessibility'),
                    'enable_text_colors' => esc_html__('Text Color Adjustments', 'website-accessibility'),
                    'enable_background_colors' => esc_html__('Background Color Adjustments', 'website-accessibility'),
                    'enable_hide_images' => esc_html__('Hide Images', 'website-accessibility'),
                    'enable_stop_animations' => esc_html__('Stop Animations', 'website-accessibility'),
                )
            ),
            'navigation_experience' => array(
                'title' => esc_html__('Navigation Experience', 'website-accessibility'),
                'features' => array(
                    'enable_mute_sounds' => esc_html__('Mute Sounds', 'website-accessibility'),
                    'enable_reading_guide' => esc_html__('Reading Guide', 'website-accessibility'),
                    'enable_reading_mask' => esc_html__('Reading Mask', 'website-accessibility'),
                    'enable_highlight_hover' => esc_html__('Highlight Hover', 'website-accessibility'),
                    'enable_highlight_focus' => esc_html__('Highlight Focus', 'website-accessibility'),
                    'enable_big_cursor' => esc_html__('Big Cursor', 'website-accessibility'),
                    'enable_keyboard_navigation' => esc_html__('Keyboard Navigation', 'website-accessibility'),
                )
            ),
            'advanced_features' => array(
                'title' => esc_html__('Advanced Features', 'website-accessibility'),
                'features' => array(
                    'enable_voice_navigation' => esc_html__('Voice Navigation', 'website-accessibility'),
                    'enable_text_to_speech' => esc_html__('Text to Speech', 'website-accessibility'),
                    'enable_cognitive_reading' => esc_html__('Cognitive Reading', 'website-accessibility'),
                    'enable_virtual_keyboard' => esc_html__('Virtual Keyboard', 'website-accessibility'),
                    'enable_dictionary' => esc_html__('Dictionary', 'website-accessibility'),
                )
            )
        );
        
        foreach ($features as $section => $data) :
        ?>
        <div class="wap-card">
            <div class="wap-card-header">
                <h2><?php echo esc_html($data['title']); ?></h2>
            </div>
            <div class="wap-card-body">
                <div class="wap-features-grid">
                    <?php foreach ($data['features'] as $feature_id => $feature_label) : ?>
                        <div class="wap-feature-item">
                            <div class="wap-feature-icon">
                                <?php echo $this->get_feature_icon($feature_id); ?>
                            </div>
                            <div class="wap-toggle-field">
                                <label class="wap-toggle-switch">
                                    <input type="checkbox" name="website_accessibility_options[<?php echo esc_attr($feature_id); ?>]" value="yes" <?php checked($this->settings->get_option($feature_id), 'yes'); ?>>
                                    <span class="wap-toggle-slider"></span>
                                </label>
                                <span class="wap-toggle-label"><?php echo esc_html($feature_label); ?></span>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
        <?php
        endforeach;
    }
    
    /**
     * Render the Advanced tab
     */
    private function render_advanced_tab() {
        ?>
        <div class="wap-card">
            <div class="wap-card-header">
                <h2><?php esc_html_e('API Integration', 'website-accessibility'); ?></h2>
            </div>
            <div class="wap-card-body">
                <div class="wap-form-field wap-form-field-google-api-key">
                    <label class="wap-label" for="wap-google-api-key"><?php esc_html_e('Google Cloud API Key', 'website-accessibility'); ?></label>
                    <input type="text" id="wap-google-api-key" name="website_accessibility_options[google_api_key]" value="<?php echo esc_attr($this->settings->get_option('google_api_key')); ?>" class="wap-text-field">
                    <p class="wap-description"><?php esc_html_e('Required for Text to Speech and Voice Navigation features.', 'website-accessibility'); ?></p>
                </div>
            </div>
        </div>
        
        <div class="wap-card">
            <div class="wap-card-header">
                <h2><?php esc_html_e('Custom CSS', 'website-accessibility'); ?></h2>
            </div>
            <div class="wap-card-body">
                <div class="wap-form-field">
                    <label class="wap-label" for="wap-custom-css"><?php esc_html_e('Custom CSS', 'website-accessibility'); ?></label>
                    <textarea id="wap-custom-css" name="website_accessibility_options[custom_css]" class="wap-textarea"><?php echo esc_textarea($this->settings->get_option('custom_css')); ?></textarea>
                    <p class="wap-description"><?php esc_html_e('Add custom CSS to customize the appearance of the accessibility panel.', 'website-accessibility'); ?></p>
                </div>
            </div>
        </div>
        <?php
    }

    /**
     * Get available languages
     *
     * @return array Languages.
     */
    private function get_available_languages() {
        return array(
            'en' => esc_html__('English', 'website-accessibility'),
            'ar' => esc_html__('Arabic', 'website-accessibility'),
            'zh' => esc_html__('Chinese', 'website-accessibility'),
            'cs' => esc_html__('Czech', 'website-accessibility'),
            'de' => esc_html__('German', 'website-accessibility'),
            'es' => esc_html__('Spanish', 'website-accessibility'),
            'fr' => esc_html__('French', 'website-accessibility'),
            'it' => esc_html__('Italian', 'website-accessibility'),
            'ja' => esc_html__('Japanese', 'website-accessibility'),
            'ko' => esc_html__('Korean', 'website-accessibility'),
            'pl' => esc_html__('Polish', 'website-accessibility'),
            'pt' => esc_html__('Portuguese', 'website-accessibility'),
            'ru' => esc_html__('Russian', 'website-accessibility'),
            'tr' => esc_html__('Turkish', 'website-accessibility'),
            'vi' => esc_html__('Vietnamese', 'website-accessibility')
        );
    }

    /**
     * Section general callback
     */
    public function section_general_callback() {
        echo '<p>' . esc_html__('Configure general plugin settings.', 'website-accessibility') . '</p>';
    }

    /**
     * Section button callback
     */
    public function section_button_callback() {
        echo '<p>' . esc_html__('Configure how the accessibility button appears on your website.', 'website-accessibility') . '</p>';
    }

    /**
     * Section features callback
     */
    public function section_features_callback() {
        echo '<p>' . esc_html__('Enable or disable specific accessibility features.', 'website-accessibility') . '</p>';
    }

    /**
     * Section UI callback
     */
    public function section_ui_callback() {
        echo '<p>' . esc_html__('Configure user interface behavior and appearance for the accessibility panel.', 'website-accessibility') . '</p>';
    }

    /**
     * Section advanced callback
     */
    public function section_advanced_callback() {
        echo '<p>' . esc_html__('Advanced settings for additional customization.', 'website-accessibility') . '</p>';
    }

    /**
     * Render toggle field
     *
     * @param array $args Field arguments.
     */
    public function render_toggle_field($args) {
        $id = $args['id'];
        $label = isset($args['label']) ? $args['label'] : '';
        $value = $this->settings->get_option($id);
        $checked = ($value === 'yes') ? 'checked' : '';
        ?>
        <label class="wap-toggle-switch">
            <input type="checkbox" name="website_accessibility_options[<?php echo esc_attr($id); ?>]" value="yes" <?php echo $checked; ?>>
            <span class="wap-toggle-slider"></span>
        </label>
        <span class="wap-toggle-label"><?php echo esc_html($label); ?></span>
        <?php
    }

    /**
     * Render select field
     *
     * @param array $args Field arguments.
     */
    public function render_select_field($args) {
        $id = $args['id'];
        $options = $args['options'];
        $value = $this->settings->get_option($id);
        ?>
        <select name="website_accessibility_options[<?php echo esc_attr($id); ?>]">
            <?php foreach ($options as $option_value => $option_label) : ?>
                <option value="<?php echo esc_attr($option_value); ?>" <?php selected($value, $option_value); ?>>
                    <?php echo esc_html($option_label); ?>
                </option>
            <?php endforeach; ?>
        </select>
        <?php
    }

    /**
     * Render text field
     *
     * @param array $args Field arguments.
     */
    public function render_text_field($args) {
        $id = $args['id'];
        $description = isset($args['description']) ? $args['description'] : '';
        $value = $this->settings->get_option($id);
        ?>
        <input type="text" class="regular-text" name="website_accessibility_options[<?php echo esc_attr($id); ?>]" value="<?php echo esc_attr($value); ?>">
        <?php if (!empty($description)) : ?>
            <p class="description"><?php echo esc_html($description); ?></p>
        <?php endif; ?>
        <?php
    }

    /**
     * Render color field
     *
     * @param array $args Field arguments.
     */
    public function render_color_field($args) {
        $id = $args['id'];
        $value = $this->settings->get_option($id);
        ?>
        <input type="text" class="wap-color-picker" name="website_accessibility_options[<?php echo esc_attr($id); ?>]" value="<?php echo esc_attr($value); ?>" data-default-color="<?php echo esc_attr($this->settings->get_option($id)); ?>">
        <?php
    }

    /**
     * Render image field
     *
     * @param array $args Field arguments.
     */
    public function render_image_field($args) {
        $id = $args['id'];
        $label = isset($args['label']) ? $args['label'] : '';
        $value = $this->settings->get_option($id);
        ?>
        <div class="wap-image-field">
            <input type="text" class="regular-text" name="website_accessibility_options[<?php echo esc_attr($id); ?>]" value="<?php echo esc_url($value); ?>" id="<?php echo esc_attr($id); ?>_field" readonly>
            <button type="button" class="button button-secondary wap-upload-button" data-target="<?php echo esc_attr($id); ?>_field"><?php esc_html_e('Upload', 'website-accessibility'); ?></button>
            <?php if (!empty($value)) : ?>
                <div class="wap-image-preview">
                    <img src="<?php echo esc_url($value); ?>" alt="<?php echo esc_attr($label); ?>">
                </div>
            <?php endif; ?>
        </div>
        <?php
    }

    /**
     * Render textarea field
     *
     * @param array $args Field arguments.
     */
    public function render_textarea_field($args) {
        $id = $args['id'];
        $description = isset($args['description']) ? $args['description'] : '';
        $value = $this->settings->get_option($id);
        ?>
        <textarea class="large-text code" rows="10" name="website_accessibility_options[<?php echo esc_attr($id); ?>]"><?php echo esc_textarea($value); ?></textarea>
        <?php if (!empty($description)) : ?>
            <p class="description"><?php echo esc_html($description); ?></p>
        <?php endif; ?>
        <?php
    }

    /**
     * Render help page
     */
    public function render_help_page() {
        // Check user capabilities
        if (!current_user_can('manage_options')) {
            return;
        }
        
        // Get plugin version
        $plugin_data = get_plugin_data(WAP_PLUGIN_FILE);
        $version = $plugin_data['Version'];
        ?>
        <div class="wrap">
            <div class="wap-admin-container">
                <div class="wap-header">
                    <h1><?php esc_html_e('Website Accessibility - Help', 'website-accessibility'); ?></h1>
                    <p><?php esc_html_e('Get help and learn more about the accessibility features', 'website-accessibility'); ?></p>
                    <span class="wap-version"><?php echo esc_html('v' . $version); ?></span>
                </div>
                
                <div class="wap-help-container">
                    <div class="wap-help-card">
                        <h2><?php esc_html_e('Getting Started', 'website-accessibility'); ?></h2>
                        <p><?php esc_html_e('To get started with Website Accessibility plugin, configure the settings on the main settings page. Once configured, the accessibility button will appear on your website, allowing visitors to customize their viewing experience.', 'website-accessibility'); ?></p>
                        <p><a href="<?php echo esc_url(admin_url('admin.php?page=website-accessibility')); ?>" class="button button-primary"><?php esc_html_e('Go to Settings', 'website-accessibility'); ?></a></p>
                    </div>
                    
                    <div class="wap-help-card">
                        <h2><?php esc_html_e('Features Overview', 'website-accessibility'); ?></h2>
                        <ul>
                            <li><?php esc_html_e('Flexible accessibility settings with multiple options', 'website-accessibility'); ?></li>
                            <li><?php esc_html_e('Draggable accessibility window for user convenience', 'website-accessibility'); ?></li>
                            <li><?php esc_html_e('Customizable appearance and animation of the accessibility button', 'website-accessibility'); ?></li>
                            <li><?php esc_html_e('Multilingual Voice Navigation with 40+ supported languages', 'website-accessibility'); ?></li>
                            <li><?php esc_html_e('Light and Dark modes for better visual accessibility', 'website-accessibility'); ?></li>
                            <li><?php esc_html_e('High contrast mode for visually impaired users', 'website-accessibility'); ?></li>
                            <li><?php esc_html_e('Text magnifier for easier reading', 'website-accessibility'); ?></li>
                            <li><?php esc_html_e('Text-to-speech functionality for screen reading', 'website-accessibility'); ?></li>
                            <li><?php esc_html_e('Reading guides and masks for better focus', 'website-accessibility'); ?></li>
                            <li><?php esc_html_e('Meets standards WCAG 2.0 (AAA) for maximum compatibility', 'website-accessibility'); ?></li>
                        </ul>
                    </div>
                    
                    <div class="wap-help-card">
                        <h2><?php esc_html_e('Voice Navigation Setup', 'website-accessibility'); ?></h2>
                        <p><?php esc_html_e('To use voice navigation features, you need to obtain a Google Cloud API key with Speech-to-Text and Text-to-Speech APIs enabled.', 'website-accessibility'); ?></p>
                        <ol>
                            <li><?php esc_html_e('Create a Google Cloud account', 'website-accessibility'); ?></li>
                            <li><?php esc_html_e('Create a new project', 'website-accessibility'); ?></li>
                            <li><?php esc_html_e('Enable the Speech-to-Text and Text-to-Speech APIs', 'website-accessibility'); ?></li>
                            <li><?php esc_html_e('Create an API key with appropriate restrictions', 'website-accessibility'); ?></li>
                            <li><?php esc_html_e('Enter the API key in the Advanced tab of the plugin settings', 'website-accessibility'); ?></li>
                        </ol>
                        <p><a href="https://cloud.google.com/docs/authentication/api-keys" target="_blank" class="button"><?php esc_html_e('Google Cloud API Documentation', 'website-accessibility'); ?></a></p>
                    </div>
                    
                    <div class="wap-help-card">
                        <h2><?php esc_html_e('Creating an Accessibility Statement', 'website-accessibility'); ?></h2>
                        <p><?php esc_html_e('It\'s important to include an accessibility statement on your website. This plugin adds a link to your statement in the accessibility panel.', 'website-accessibility'); ?></p>
                        <p><?php esc_html_e('To create a comprehensive accessibility statement, consider including:', 'website-accessibility'); ?></p>
                        <ul>
                            <li><?php esc_html_e('Your commitment to accessibility', 'website-accessibility'); ?></li>
                            <li><?php esc_html_e('Accessibility features your site provides', 'website-accessibility'); ?></li>
                            <li><?php esc_html_e('Known limitations', 'website-accessibility'); ?></li>
                            <li><?php esc_html_e('Contact information for accessibility issues', 'website-accessibility'); ?></li>
                        </ul>
                    </div>
                    
                    <div class="wap-help-card">
                        <h2><?php esc_html_e('Troubleshooting', 'website-accessibility'); ?></h2>
                        <p><?php esc_html_e('If you encounter issues with the plugin, try these steps:', 'website-accessibility'); ?></p>
                        <ul>
                            <li><?php esc_html_e('Check for JavaScript errors in your browser console', 'website-accessibility'); ?></li>
                            <li><?php esc_html_e('Ensure the plugin\'s CSS and JavaScript are properly loaded', 'website-accessibility'); ?></li>
                            <li><?php esc_html_e('Test if the issue persists with all other plugins deactivated', 'website-accessibility'); ?></li>
                            <li><?php esc_html_e('Make sure your theme doesn\'t override the plugin\'s styles', 'website-accessibility'); ?></li>
                            <li><?php esc_html_e('Verify that your server meets the minimum requirements', 'website-accessibility'); ?></li>
                        </ul>
                    </div>
                    
                    <div class="wap-help-card">
                        <h2><?php esc_html_e('Need More Help?', 'website-accessibility'); ?></h2>
                        <p><?php esc_html_e('If you need additional assistance, please contact our support team.', 'website-accessibility'); ?></p>
                        <p><a href="mailto:support@example.com" class="button"><?php esc_html_e('Contact Support', 'website-accessibility'); ?></a></p>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }

    /**
     * Setup settings sections and fields
     */
    public function setup_settings_sections() {
        // Register settings if not already registered by the Settings class
        register_setting(
            'website_accessibility_options_group',
            'website_accessibility_options',
            array($this->settings, 'sanitize_options')
        );
    }

    /**
     * Get feature icon
     *
     * @param string $feature_id Feature ID.
     * @return string Icon SVG.
     */
    private function get_feature_icon($feature_id) {
        // Sanitize feature ID
        $feature_id = sanitize_key($feature_id);
        
        // Map feature IDs to icon keys used in the frontend
        $icon_map = array(
            'enable_text_magnifier' => 'text-magnifier',
            'enable_readable_font' => 'readable-font',
            'enable_dyslexia_font' => 'dyslexia-font',
            'enable_highlight_titles' => 'highlight-titles',
            'enable_highlight_links' => 'highlight-links',
            'enable_font_sizing' => 'font-sizing',
            'enable_line_height' => 'line-height',
            'enable_letter_spacing' => 'letter-spacing',
            'enable_dark_mode' => 'dark-mode',
            'enable_high_contrast' => 'high-contrast',
            'enable_text_colors' => 'text-color',
            'enable_background_colors' => 'bg-color',
            'enable_hide_images' => 'hide-images',
            'enable_stop_animations' => 'stop-animations',
            'enable_mute_sounds' => 'mute-sounds',
            'enable_reading_guide' => 'reading-guide',
            'enable_reading_mask' => 'reading-mask',
            'enable_highlight_hover' => 'highlight-hover',
            'enable_highlight_focus' => 'highlight-focus',
            'enable_big_cursor' => 'big-cursor',
            'enable_keyboard_navigation' => 'keyboard-navigation',
            'enable_voice_navigation' => 'voice-navigation',
            'enable_text_to_speech' => 'text-to-speech',
            'enable_cognitive_reading' => 'cognitive',
            'enable_virtual_keyboard' => 'keyboard-navigation',
            'enable_dictionary' => 'dictionary',
        );

        // SVG icons matching the frontend icons
        $svg_icons = array(
            // Text magnifier icon
            'text-magnifier' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm.5-7H9v2H7v1h2v2h1v-2h2V9h-2z"/></svg>',
            // Readable font icon
            'readable-font' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9.93 13.5h4.14L12 7.98zM20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8l-6-6zm-2 6V4l4 4h-4z"/></svg>',
            // Dyslexia font icon
            'dyslexia-font' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8 12.5h8V14H8zM8 16.5h8V18H8zM14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-2 6V4l4 4h-4z"/></svg>',
            // Dark mode icon
            'dark-mode' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z"/></svg>',
            // High contrast icon
            'high-contrast' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.06-7.44 7-7.93v15.86zm2-15.86c1.03.13 2 .45 2.87.93H13v-.93zM13 7h5.24c.25.31.48.65.68 1H13V7zm0 3h6.74c.08.33.15.66.19 1H13v-1zm0 9.93V19h2.87c-.87.48-1.84.8-2.87.93zM18.24 17H13v-1h5.92c-.2.35-.43.69-.68 1zm1.5-3H13v-1h6.93c-.04.34-.11.67-.19 1z"/></svg>',
            // Highlight titles icon
            'highlight-titles' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5 4v3h5.5v12h3V7H19V4z"/></svg>',
            // Highlight links icon
            'highlight-links' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>',
            // Font sizing icon
            'font-sizing' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z"/></svg>',
            // Line height icon
            'line-height' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',
            // Letter spacing icon
            'letter-spacing' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 21h18v-2H3v2zM3 8v8l4-4-4-4zm8 9h10v-2H11v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2zm0-4h10v-2H11v2zm0-4h10v-2H11v2z"/></svg>',
            // Text color icon
            'text-color' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11 3L5.5 17h2.25l1.12-3h6.25l1.12 3h2.25L13 3h-2zm-1.38 9L12 5.67 14.38 12H9.62z"/></svg>',
            // Background color icon
            'bg-color' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16.56 8.94L7.62 0 6.21 1.41l2.38 2.38-5.15 5.15c-.59.59-.59 1.54 0 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.12zM5.21 10L10 5.21 14.79 10H5.21zM19 11.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5z"/></svg>',
            // Hide images icon
            'hide-images' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21 17H7V3h14v14zm0-16H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zM3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm14 8v-1.5c0-.83-.67-1.5-1.5-1.5.83 0 1.5-.67 1.5-1.5V7c0-1.11-.9-2-2-2h-4v2h4v2h-2v2h2v2h-4v2h4c1.1 0 2-.89 2-2z"/></svg>',
            // Stop animations icon
            'stop-animations' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>',
            // Mute sounds icon
            'mute-sounds' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>',
            // Reading guide icon
            'reading-guide' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',
            // Reading mask icon
            'reading-mask' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6 8h1.5v1.5H13V13zm1.5 1.5H16V16h-1.5v-1.5zM16 13h1.5v1.5H16V13zm-3 3h1.5v1.5H13V16zm1.5 1.5H16V19h-1.5v-1.5zm1.5-1.5H19V19h-1.5v-1.5zM22 7h-2v1.5h2v-1.5zm0 3h-2v1.5h2v-1.5zm0 3h-2v1.5h2v-1.5zm0 3h-2v1.5h2v-1.5z"/></svg>',
            // Highlight hover icon
            'highlight-hover' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2.53 19.65l1.34.56v-9.03l-2.43 5.86c-.41 1.02.08 2.19 1.09 2.61zm19.5-3.7L17.07 3.98c-.31-.75-1.04-1.21-1.81-1.23-.26 0-.53.04-.79.15L7.1 5.95c-.75.31-1.21 1.03-1.23 1.8-.01.27.04.54.15.8l4.96 11.97c.31.76 1.05 1.22 1.83 1.23.26 0 .52-.05.77-.15l7.36-3.05c1.02-.42 1.51-1.59 1.09-2.6zM7.88 8.75c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-2 11c0 1.1.9 2 2 2h1.45l-3.45-8.34v6.34z"/></svg>',
            // Highlight focus icon
            'highlight-focus' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17.6 10.1c.1-.1.1-.2.2-.3l1.5-2.1c.3-.5.1-1.1-.4-1.5L16.6 5c-.5-.3-1.1-.1-1.5.4l-1.5 2.1c-.1.1-.1.2-.1.3l-7.3 7.5c-.3.3-.3.8 0 1.1.1.2.3.3.6.3.1 0 .3-.1.4-.1L12 13l.9 1.6c.1.2.3.4.6.4h.1c.2 0 .4-.1.6-.2l2.9-3.3c.1-.2.1-.4.1-.6s-.1-.5-.2-.6l-.9-1.6 1.5-1.6zM5.5 7C6.3 7 7 6.3 7 5.5S6.3 4 5.5 4 4 4.7 4 5.5 4.7 7 5.5 7zM5 21h14c1.1 0 2-.9 2-2v-9c0-1.1-.9-2-2-2h-3.2l-1.2 1.7.9 1.7c.3.5.4 1.1.3 1.7-.1.5-.4 1-.9 1.3l-2.9 3.3c-.5.6-1.2.9-2 .9-.5 0-.9-.1-1.4-.4-.9-.5-1.4-1.4-1.5-2.4L6.6 14l-1.2 1.2c-.5.5-.9 1.2-.9 2V19c0 1.1.9 2 2 2z"/></svg>',
            // Big cursor icon
            'big-cursor' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>',
            // Keyboard navigation icon
            'keyboard-navigation' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"/></svg>',
            // Text to speech icon
            'text-to-speech' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9 13c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0-6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 8c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm-6 4c.22-.72 3.31-2 6-2 2.7 0 5.8 1.29 6 2H3zM16.76 5.36l-1.68 1.69c.84 1.18.84 2.71 0 3.89l1.68 1.69c2.02-2.02 2.02-5.07 0-7.27zM20.07 2l-1.63 1.63c2.77 3.02 2.77 7.56 0 10.74L20.07 16c3.9-3.89 3.91-9.95 0-14z"/></svg>',
            // Voice navigation icon
            'voice-navigation' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>',
            // Dictionary icon
            'dictionary' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 11.55C9.64 9.35 6.48 8 3 8v11c3.48 0 6.64 1.35 9 3.55 2.36-2.19 5.52-3.55 9-3.55V8c-3.48 0-6.64 1.35-9 3.55zM12 8c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z"/></svg>',
            // Cognitive icon (for cognitive reading)
            'cognitive' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4.5 8c1.04 0 2.34-.5 3-1.6.66 1.1 1.96 1.6 3 1.6 1.04 0 2.34-.5 3-1.6.66 1.1 1.96 1.6 3 1.6v2c-1.04 0-2.34.5-3 1.6-.66-1.1-1.96-1.6-3-1.6-1.04 0-2.34.5-3 1.6-.66-1.1-1.96-1.6-3-1.6v-2zm0 6c1.04 0 2.34-.5 3-1.6.66 1.1 1.96 1.6 3 1.6 1.04 0 2.34-.5 3-1.6.66 1.1 1.96 1.6 3 1.6v2c-1.04 0-2.34.5-3 1.6-.66-1.1-1.96-1.6-3-1.6-1.04 0-2.34.5-3 1.6-.66-1.1-1.96-1.6-3-1.6v-2z"/></svg>',
            // Default icon for other features
            'default' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>',
        );

        // Get the mapped icon key
        $icon_key = isset($icon_map[$feature_id]) ? $icon_map[$feature_id] : '';
        
        // Return the SVG for the icon key or a default icon
        if (!empty($icon_key) && isset($svg_icons[$icon_key])) {
            return $svg_icons[$icon_key];
        }
        
        // Fallback to default icon
        return $svg_icons['default'];
    }
} 