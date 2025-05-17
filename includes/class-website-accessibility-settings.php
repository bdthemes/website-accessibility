<?php
/**
 * Settings class
 *
 * @package Website_Accessibility
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Settings class
 */
class Website_Accessibility_Settings {

    /**
     * Option name
     *
     * @var string
     */
    private $option_name = 'website_accessibility_options';

    /**
     * Default settings
     *
     * @var array
     */
    private $defaults = array(
        'button_position' => 'right', // left, right, top-left, top-right, bottom-left, bottom-right, custom
        'button_size' => 'medium', // small, medium, large
        'button_icon' => 'default', // default, custom
        'custom_icon' => '',
        'button_color' => '#2271b1',
        'button_text_color' => '#ffffff',
        'animation_type' => 'slide', // none, fade, slide
        'auto_detect_language' => 'yes',
        'default_language' => 'en',
        'panel_theme' => 'light', // light, dark, high-contrast, custom
        'panel_position' => 'right', // left, right
        'auto_save_changes' => 'yes',
        'reset_on_page_change' => 'no',
        'show_on_mobile' => 'yes',
        'enable_voice_navigation' => 'yes',
        'enable_dark_mode' => 'yes',
        'enable_high_contrast' => 'yes',
        'enable_text_magnifier' => 'yes',
        'enable_readable_font' => 'yes', 
        'enable_dyslexia_font' => 'yes',
        'enable_highlight_titles' => 'yes',
        'enable_highlight_links' => 'yes',
        'enable_font_sizing' => 'yes',
        'enable_line_height' => 'yes',
        'enable_letter_spacing' => 'yes',
        'enable_align_text' => 'yes',
        'enable_text_colors' => 'yes',
        'enable_background_colors' => 'yes',
        'enable_mute_sounds' => 'yes',
        'enable_hide_images' => 'yes',
        'enable_virtual_keyboard' => 'yes',
        'enable_reading_guide' => 'yes',
        'enable_stop_animations' => 'yes',
        'enable_reading_mask' => 'yes', 
        'enable_highlight_hover' => 'yes',
        'enable_highlight_focus' => 'yes',
        'enable_big_cursor' => 'yes',
        'enable_cognitive_reading' => 'yes',
        'enable_keyboard_navigation' => 'yes',
        'enable_text_to_speech' => 'yes',
        'enable_dictionary' => 'yes',
        'enable_tooltips' => 'yes',
        'google_api_key' => '',
        'custom_css' => ''
    );

    /**
     * Constructor
     */
    public function __construct() {
        // Register settings
        add_action('admin_init', array($this, 'register_settings'));
    }

    /**
     * Register settings
     */
    public function register_settings() {
        register_setting(
            'website_accessibility_options_group',
            $this->option_name,
            array($this, 'sanitize_options')
        );
    }

    /**
     * Sanitize options
     *
     * @param array $input Input data.
     * @return array Sanitized data.
     */
    public function sanitize_options($input) {
        $sanitized = array();

        // Position
        if (isset($input['button_position'])) {
            $sanitized['button_position'] = sanitize_text_field($input['button_position']);
        }

        // Size
        if (isset($input['button_size'])) {
            $sanitized['button_size'] = sanitize_text_field($input['button_size']);
        }

        // Icon type
        if (isset($input['button_icon'])) {
            $sanitized['button_icon'] = sanitize_text_field($input['button_icon']);
        }

        // Custom icon
        if (isset($input['custom_icon'])) {
            $sanitized['custom_icon'] = esc_url_raw($input['custom_icon']);
        }

        // Button color
        if (isset($input['button_color'])) {
            $sanitized['button_color'] = sanitize_hex_color($input['button_color']);
        }

        // Button text color
        if (isset($input['button_text_color'])) {
            $sanitized['button_text_color'] = sanitize_hex_color($input['button_text_color']);
        }

        // Animation type
        if (isset($input['animation_type'])) {
            $sanitized['animation_type'] = sanitize_text_field($input['animation_type']);
        }

        // Auto detect language
        if (isset($input['auto_detect_language'])) {
            $sanitized['auto_detect_language'] = sanitize_text_field($input['auto_detect_language']);
        }

        // Default language
        if (isset($input['default_language'])) {
            $sanitized['default_language'] = sanitize_text_field($input['default_language']);
        }
        
        // Panel theme
        if (isset($input['panel_theme'])) {
            $sanitized['panel_theme'] = sanitize_text_field($input['panel_theme']);
        }
        
        // Panel position
        if (isset($input['panel_position'])) {
            $sanitized['panel_position'] = sanitize_text_field($input['panel_position']);
        }
        
        // Auto save changes
        if (isset($input['auto_save_changes'])) {
            $sanitized['auto_save_changes'] = sanitize_text_field($input['auto_save_changes']);
        }
        
        // Reset on page change
        if (isset($input['reset_on_page_change'])) {
            $sanitized['reset_on_page_change'] = sanitize_text_field($input['reset_on_page_change']);
        }
        
        // Show on mobile
        if (isset($input['show_on_mobile'])) {
            $sanitized['show_on_mobile'] = sanitize_text_field($input['show_on_mobile']);
        }

        // Google API key
        if (isset($input['google_api_key'])) {
            $sanitized['google_api_key'] = sanitize_text_field($input['google_api_key']);
        }

        // Custom CSS
        if (isset($input['custom_css'])) {
            $sanitized['custom_css'] = wp_kses_post($input['custom_css']);
        }

        // Feature toggles
        $toggle_options = array(
            'enable_voice_navigation',
            'enable_dark_mode',
            'enable_high_contrast',
            'enable_text_magnifier',
            'enable_readable_font',
            'enable_dyslexia_font',
            'enable_highlight_titles',
            'enable_highlight_links',
            'enable_font_sizing',
            'enable_line_height',
            'enable_letter_spacing',
            'enable_align_text',
            'enable_text_colors',
            'enable_background_colors',
            'enable_mute_sounds',
            'enable_hide_images',
            'enable_virtual_keyboard',
            'enable_reading_guide',
            'enable_stop_animations',
            'enable_reading_mask',
            'enable_highlight_hover',
            'enable_highlight_focus',
            'enable_big_cursor',
            'enable_cognitive_reading',
            'enable_keyboard_navigation',
            'enable_text_to_speech',
            'enable_dictionary',
            'enable_tooltips'
        );

        foreach ($toggle_options as $option) {
            if (isset($input[$option])) {
                $sanitized[$option] = sanitize_text_field($input[$option]);
            } else {
                $sanitized[$option] = 'no';
            }
        }

        return $sanitized;
    }

    /**
     * Set default options
     */
    public function set_defaults() {
        $existing_options = get_option($this->option_name, array());
        
        if (empty($existing_options)) {
            update_option($this->option_name, $this->defaults);
        }
    }

    /**
     * Get all options
     *
     * @return array Plugin options.
     */
    public function get_options() {
        return get_option($this->option_name, $this->defaults);
    }

    /**
     * Get specific option
     *
     * @param string $key Option key.
     * @param mixed  $default Default value.
     * @return mixed Option value.
     */
    public function get_option($key, $default = false) {
        $options = $this->get_options();
        
        if (isset($options[$key])) {
            return $options[$key];
        }
        
        if ($default === false && isset($this->defaults[$key])) {
            return $this->defaults[$key];
        }
        
        return $default;
    }
} 