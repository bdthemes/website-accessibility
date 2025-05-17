<?php
/**
 * Public class
 *
 * @package Website_Accessibility
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Public class
 */
class Website_Accessibility_Public {

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
     * Initialize the public functionality
     */
    public function init() {
        // Enqueue public scripts and styles
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));

        // Add accessibility button to footer
        add_action('wp_footer', array($this, 'render_accessibility_button'));

        // Add custom CSS if set
        add_action('wp_head', array($this, 'add_custom_css'));
    }

    /**
     * Enqueue public scripts and styles
     */
    public function enqueue_scripts() {
        // Main CSS
        wp_enqueue_style(
            'website-accessibility-public',
            WAP_PLUGIN_URL . 'public/css/website-accessibility-public.css',
            array(),
            WAP_VERSION
        );

        // Main JS
        wp_enqueue_script(
            'website-accessibility-public',
            WAP_PLUGIN_URL . 'public/js/website-accessibility-public.js',
            array('jquery'),
            WAP_VERSION,
            true
        );

        // Pass settings to JavaScript
        wp_localize_script(
            'website-accessibility-public',
            'websiteAccessibility',
            array(
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'pluginUrl' => WAP_PLUGIN_URL,
                'settings' => $this->get_frontend_settings(),
                'translations' => $this->get_translations()
            )
        );

        // Optional: Enqueue voice navigation if enabled
        if ($this->settings->get_option('enable_voice_navigation') === 'yes') {
            wp_enqueue_script(
                'website-accessibility-voice',
                WAP_PLUGIN_URL . 'public/js/website-accessibility-voice.js',
                array('jquery', 'website-accessibility-public'),
                WAP_VERSION,
                true
            );
        }
    }

    /**
     * Add custom CSS
     */
    public function add_custom_css() {
        $custom_css = $this->settings->get_option('custom_css');
        
        if (!empty($custom_css)) {
            echo '<style type="text/css" id="website-accessibility-custom-css">' . esc_html($custom_css) . '</style>';
        }
    }

    /**
     * Render accessibility button
     */
    public function render_accessibility_button() {
        $button_position = $this->settings->get_option('button_position');
        $button_size = $this->settings->get_option('button_size');
        $animation_type = $this->settings->get_option('animation_type');
        $button_color = $this->settings->get_option('button_color');
        $button_text_color = $this->settings->get_option('button_text_color');
        
        $button_icon = $this->settings->get_option('button_icon');
        $icon_url = '';
        
        if ($button_icon === 'custom') {
            $icon_url = $this->settings->get_option('custom_icon');
        }
        
        // Button position class
        $position_class = 'wap-btn-' . $button_position;
        
        // Button size class
        $size_class = 'wap-btn-' . $button_size;
        
        // Animation class
        $animation_class = 'wap-animation-' . $animation_type;
        
        // Button style
        $button_style = 'background-color: ' . esc_attr($button_color) . '; color: ' . esc_attr($button_text_color) . ';';
        
        ?>
        <button id="wap-accessibility-btn" class="<?php echo esc_attr($position_class . ' ' . $size_class . ' ' . $animation_class); ?>" style="<?php echo esc_attr($button_style); ?>" aria-label="<?php esc_attr_e('Open Accessibility Panel', 'website-accessibility'); ?>">
            <?php if ($button_icon === 'custom' && !empty($icon_url)) : ?>
                <img src="<?php echo esc_url($icon_url); ?>" alt="<?php esc_attr_e('Accessibility', 'website-accessibility'); ?>">
            <?php else : ?>
                <span class="wap-accessibility-icon" aria-hidden="true"></span>
                <span class="wap-accessibility-text"><?php esc_html_e('Accessibility', 'website-accessibility'); ?></span>
            <?php endif; ?>
        </button>
        
        <div id="wap-accessibility-panel" class="wap-hidden" role="dialog" aria-modal="true" aria-labelledby="wap-accessibility-panel-title">
            <div class="wap-accessibility-panel-header">
                <h2 id="wap-accessibility-panel-title"><?php esc_html_e('Accessibility Settings', 'website-accessibility'); ?></h2>
                <button class="wap-accessibility-panel-close" aria-label="<?php esc_attr_e('Close Accessibility Panel', 'website-accessibility'); ?>">×</button>
            </div>
            
            <div class="wap-accessibility-panel-content">
                <?php $this->render_accessibility_profiles(); ?>
                
                <?php $this->render_accessibility_features(); ?>
            </div>
            
            <div class="wap-accessibility-panel-footer">
                <button id="wap-accessibility-reset" class="wap-accessibility-btn"><?php esc_html_e('Reset Settings', 'website-accessibility'); ?></button>
                <a href="#" id="wap-accessibility-statement" class="wap-accessibility-link"><?php esc_html_e('Accessibility Statement', 'website-accessibility'); ?></a>
            </div>
        </div>
        <?php
    }

    /**
     * Render accessibility profiles
     */
    private function render_accessibility_profiles() {
        ?>
        <div class="wap-accessibility-section">
            <h3><?php esc_html_e('Accessibility Profiles', 'website-accessibility'); ?></h3>
            
            <div class="wap-accessibility-profiles">
                <div class="wap-accessibility-profile" data-profile="epilepsy" title="<?php esc_attr_e('This mode enables people with epilepsy to use the website safely by eliminating the risk of seizures that result from flashing or blinking animations and risky color combinations.', 'website-accessibility'); ?>">
                    <span class="wap-accessibility-profile-icon" aria-hidden="true"></span>
                    <h4 class="wap-accessibility-profile-title"><?php esc_html_e('Epilepsy Safe Mode', 'website-accessibility'); ?></h4>
                </div>
                
                <div class="wap-accessibility-profile" data-profile="visually-impaired" title="<?php esc_attr_e('This mode adjusts the website for the convenience of users with visual impairments such as Degrading Eyesight, Tunnel Vision, Cataract, Glaucoma, and others.', 'website-accessibility'); ?>">
                    <span class="wap-accessibility-profile-icon" aria-hidden="true"></span>
                    <h4 class="wap-accessibility-profile-title"><?php esc_html_e('Visually Impaired Mode', 'website-accessibility'); ?></h4>
                </div>
                
                <div class="wap-accessibility-profile" data-profile="cognitive-disability" title="<?php esc_attr_e('This mode provides different assistive options to help users with cognitive impairments such as Dyslexia, Autism, CVA, and others, to focus on the essential elements of the website more easily.', 'website-accessibility'); ?>">
                    <span class="wap-accessibility-profile-icon" aria-hidden="true"></span>
                    <h4 class="wap-accessibility-profile-title"><?php esc_html_e('Cognitive Disability Mode', 'website-accessibility'); ?></h4>
                </div>
                
                <div class="wap-accessibility-profile" data-profile="adhd-friendly" title="<?php esc_attr_e('This mode helps users with ADHD and Neurodevelopmental disorders to read, browse, and focus on the main website elements more easily while significantly reducing distractions.', 'website-accessibility'); ?>">
                    <span class="wap-accessibility-profile-icon" aria-hidden="true"></span>
                    <h4 class="wap-accessibility-profile-title"><?php esc_html_e('ADHD Friendly Mode', 'website-accessibility'); ?></h4>
                </div>
                
                <div class="wap-accessibility-profile" data-profile="blind-users" title="<?php esc_attr_e('This mode configures the website to be compatible with screen-readers such as JAWS, NVDA, VoiceOver, and TalkBack. A screen-reader is software for blind users that is installed on a computer and smartphone, and websites must be compatible with it.', 'website-accessibility'); ?>">
                    <span class="wap-accessibility-profile-icon" aria-hidden="true"></span>
                    <h4 class="wap-accessibility-profile-title"><?php esc_html_e('Blindness Mode', 'website-accessibility'); ?></h4>
                </div>
            </div>
        </div>
        <?php
    }

    /**
     * Render accessibility features
     */
    private function render_accessibility_features() {
        ?>
        <div class="wap-accessibility-section">
            <h3><?php esc_html_e('Readable Experience', 'website-accessibility'); ?></h3>
            
            <div class="wap-accessibility-features">
                <?php if ($this->settings->get_option('enable_text_magnifier') === 'yes') : ?>
                <div class="wap-accessibility-feature wap-toggle-feature" data-feature="text-magnifier">
                    <span class="wap-accessibility-feature-icon"></span>
                    <span class="wap-accessibility-feature-title"><?php esc_html_e('Text Magnifier', 'website-accessibility'); ?></span>
                </div>
                <?php endif; ?>
                
                <?php if ($this->settings->get_option('enable_readable_font') === 'yes') : ?>
                <div class="wap-accessibility-feature wap-toggle-feature" data-feature="readable-font">
                    <span class="wap-accessibility-feature-icon"></span>
                    <span class="wap-accessibility-feature-title"><?php esc_html_e('Readable Font', 'website-accessibility'); ?></span>
                </div>
                <?php endif; ?>
                
                <?php if ($this->settings->get_option('enable_dyslexia_font') === 'yes') : ?>
                <div class="wap-accessibility-feature wap-toggle-feature" data-feature="dyslexia-font">
                    <span class="wap-accessibility-feature-icon"></span>
                    <span class="wap-accessibility-feature-title"><?php esc_html_e('Dyslexia Friendly', 'website-accessibility'); ?></span>
                </div>
                <?php endif; ?>
                
                <?php if ($this->settings->get_option('enable_highlight_titles') === 'yes') : ?>
                <div class="wap-accessibility-feature wap-toggle-feature" data-feature="highlight-titles">
                    <span class="wap-accessibility-feature-icon"></span>
                    <span class="wap-accessibility-feature-title"><?php esc_html_e('Highlight Titles', 'website-accessibility'); ?></span>
                </div>
                <?php endif; ?>
                
                <?php if ($this->settings->get_option('enable_highlight_links') === 'yes') : ?>
                <div class="wap-accessibility-feature wap-toggle-feature" data-feature="highlight-links">
                    <span class="wap-accessibility-feature-icon"></span>
                    <span class="wap-accessibility-feature-title"><?php esc_html_e('Highlight Links', 'website-accessibility'); ?></span>
                </div>
                <?php endif; ?>
                
                <?php if ($this->settings->get_option('enable_font_sizing') === 'yes') : ?>
                <div class="wap-accessibility-feature wap-range-feature" data-feature="font-sizing">
                    <span class="wap-accessibility-feature-title"><?php esc_html_e('Font Size', 'website-accessibility'); ?></span>
                    <div class="wap-accessibility-range-controls">
                        <button class="wap-accessibility-decrease" aria-label="<?php esc_attr_e('Decrease Font Size', 'website-accessibility'); ?>">-</button>
                        <div class="wap-accessibility-value" data-default="0">0%</div>
                        <button class="wap-accessibility-increase" aria-label="<?php esc_attr_e('Increase Font Size', 'website-accessibility'); ?>">+</button>
                    </div>
                </div>
                <?php endif; ?>
                
                <?php if ($this->settings->get_option('enable_line_height') === 'yes') : ?>
                <div class="wap-accessibility-feature wap-range-feature" data-feature="line-height">
                    <span class="wap-accessibility-feature-title"><?php esc_html_e('Line Height', 'website-accessibility'); ?></span>
                    <div class="wap-accessibility-range-controls">
                        <button class="wap-accessibility-decrease" aria-label="<?php esc_attr_e('Decrease Line Height', 'website-accessibility'); ?>">-</button>
                        <div class="wap-accessibility-value" data-default="0">0%</div>
                        <button class="wap-accessibility-increase" aria-label="<?php esc_attr_e('Increase Line Height', 'website-accessibility'); ?>">+</button>
                    </div>
                </div>
                <?php endif; ?>
                
                <?php if ($this->settings->get_option('enable_letter_spacing') === 'yes') : ?>
                <div class="wap-accessibility-feature wap-range-feature" data-feature="letter-spacing">
                    <span class="wap-accessibility-feature-title"><?php esc_html_e('Letter Spacing', 'website-accessibility'); ?></span>
                    <div class="wap-accessibility-range-controls">
                        <button class="wap-accessibility-decrease" aria-label="<?php esc_attr_e('Decrease Letter Spacing', 'website-accessibility'); ?>">-</button>
                        <div class="wap-accessibility-value" data-default="0">0%</div>
                        <button class="wap-accessibility-increase" aria-label="<?php esc_attr_e('Increase Letter Spacing', 'website-accessibility'); ?>">+</button>
                    </div>
                </div>
                <?php endif; ?>
            </div>
        </div>
        
        <div class="wap-accessibility-section">
            <h3><?php esc_html_e('Visually Pleasing Experience', 'website-accessibility'); ?></h3>
            
            <div class="wap-accessibility-features">
                <?php if ($this->settings->get_option('enable_dark_mode') === 'yes') : ?>
                <div class="wap-accessibility-feature wap-toggle-feature" data-feature="dark-mode">
                    <span class="wap-accessibility-feature-icon"></span>
                    <span class="wap-accessibility-feature-title"><?php esc_html_e('Dark Mode', 'website-accessibility'); ?></span>
                </div>
                <?php endif; ?>
                
                <?php if ($this->settings->get_option('enable_high_contrast') === 'yes') : ?>
                <div class="wap-accessibility-feature wap-toggle-feature" data-feature="high-contrast">
                    <span class="wap-accessibility-feature-icon"></span>
                    <span class="wap-accessibility-feature-title"><?php esc_html_e('High Contrast', 'website-accessibility'); ?></span>
                </div>
                <?php endif; ?>
                
                <?php if ($this->settings->get_option('enable_text_colors') === 'yes') : ?>
                <div class="wap-accessibility-feature wap-color-feature" data-feature="text-colors">
                    <span class="wap-accessibility-feature-title"><?php esc_html_e('Text Colors', 'website-accessibility'); ?></span>
                    <div class="wap-accessibility-color-palette">
                        <?php $this->render_color_palette('text'); ?>
                    </div>
                </div>
                <?php endif; ?>
                
                <?php if ($this->settings->get_option('enable_background_colors') === 'yes') : ?>
                <div class="wap-accessibility-feature wap-color-feature" data-feature="background-colors">
                    <span class="wap-accessibility-feature-title"><?php esc_html_e('Background Colors', 'website-accessibility'); ?></span>
                    <div class="wap-accessibility-color-palette">
                        <?php $this->render_color_palette('background'); ?>
                    </div>
                </div>
                <?php endif; ?>
            </div>
        </div>
        
        <div class="wap-accessibility-section">
            <h3><?php esc_html_e('Easy Orientation', 'website-accessibility'); ?></h3>
            
            <div class="wap-accessibility-features">
                <?php if ($this->settings->get_option('enable_mute_sounds') === 'yes') : ?>
                <div class="wap-accessibility-feature wap-toggle-feature" data-feature="mute-sounds">
                    <span class="wap-accessibility-feature-icon"></span>
                    <span class="wap-accessibility-feature-title"><?php esc_html_e('Mute Sounds', 'website-accessibility'); ?></span>
                </div>
                <?php endif; ?>
                
                <?php if ($this->settings->get_option('enable_hide_images') === 'yes') : ?>
                <div class="wap-accessibility-feature wap-toggle-feature" data-feature="hide-images">
                    <span class="wap-accessibility-feature-icon"></span>
                    <span class="wap-accessibility-feature-title"><?php esc_html_e('Hide Images', 'website-accessibility'); ?></span>
                </div>
                <?php endif; ?>
                
                <?php if ($this->settings->get_option('enable_reading_guide') === 'yes') : ?>
                <div class="wap-accessibility-feature wap-toggle-feature" data-feature="reading-guide">
                    <span class="wap-accessibility-feature-icon"></span>
                    <span class="wap-accessibility-feature-title"><?php esc_html_e('Reading Guide', 'website-accessibility'); ?></span>
                </div>
                <?php endif; ?>
                
                <?php if ($this->settings->get_option('enable_stop_animations') === 'yes') : ?>
                <div class="wap-accessibility-feature wap-toggle-feature" data-feature="stop-animations">
                    <span class="wap-accessibility-feature-icon"></span>
                    <span class="wap-accessibility-feature-title"><?php esc_html_e('Stop Animations', 'website-accessibility'); ?></span>
                </div>
                <?php endif; ?>
                
                <?php if ($this->settings->get_option('enable_reading_mask') === 'yes') : ?>
                <div class="wap-accessibility-feature wap-toggle-feature" data-feature="reading-mask">
                    <span class="wap-accessibility-feature-icon"></span>
                    <span class="wap-accessibility-feature-title"><?php esc_html_e('Reading Mask', 'website-accessibility'); ?></span>
                </div>
                <?php endif; ?>
                
                <?php if ($this->settings->get_option('enable_highlight_hover') === 'yes') : ?>
                <div class="wap-accessibility-feature wap-toggle-feature" data-feature="highlight-hover">
                    <span class="wap-accessibility-feature-icon"></span>
                    <span class="wap-accessibility-feature-title"><?php esc_html_e('Highlight Hover', 'website-accessibility'); ?></span>
                </div>
                <?php endif; ?>
                
                <?php if ($this->settings->get_option('enable_highlight_focus') === 'yes') : ?>
                <div class="wap-accessibility-feature wap-toggle-feature" data-feature="highlight-focus">
                    <span class="wap-accessibility-feature-icon"></span>
                    <span class="wap-accessibility-feature-title"><?php esc_html_e('Highlight Focus', 'website-accessibility'); ?></span>
                </div>
                <?php endif; ?>
                
                <?php if ($this->settings->get_option('enable_big_cursor') === 'yes') : ?>
                <div class="wap-accessibility-feature wap-toggle-feature" data-feature="big-cursor">
                    <span class="wap-accessibility-feature-icon"></span>
                    <span class="wap-accessibility-feature-title"><?php esc_html_e('Big Cursor', 'website-accessibility'); ?></span>
                </div>
                <?php endif; ?>
                
                <?php if ($this->settings->get_option('enable_keyboard_navigation') === 'yes') : ?>
                <div class="wap-accessibility-feature wap-toggle-feature" data-feature="keyboard-navigation">
                    <span class="wap-accessibility-feature-icon"></span>
                    <span class="wap-accessibility-feature-title"><?php esc_html_e('Keyboard Navigation', 'website-accessibility'); ?></span>
                </div>
                <?php endif; ?>
                
                <?php if ($this->settings->get_option('enable_text_to_speech') === 'yes') : ?>
                <div class="wap-accessibility-feature wap-toggle-feature" data-feature="text-to-speech">
                    <span class="wap-accessibility-feature-icon"></span>
                    <span class="wap-accessibility-feature-title"><?php esc_html_e('Text to Speech', 'website-accessibility'); ?></span>
                </div>
                <?php endif; ?>
                
                <?php if ($this->settings->get_option('enable_voice_navigation') === 'yes') : ?>
                <div class="wap-accessibility-feature wap-toggle-feature" data-feature="voice-navigation">
                    <span class="wap-accessibility-feature-icon"></span>
                    <span class="wap-accessibility-feature-title"><?php esc_html_e('Voice Navigation', 'website-accessibility'); ?></span>
                </div>
                <?php endif; ?>
            </div>
        </div>
        
        <?php if ($this->settings->get_option('enable_dictionary') === 'yes') : ?>
        <div class="wap-accessibility-section">
            <h3><?php esc_html_e('Online Dictionary', 'website-accessibility'); ?></h3>
            
            <div class="wap-accessibility-dictionary">
                <input type="text" id="wap-dictionary-search" placeholder="<?php esc_attr_e('Search the online dictionary...', 'website-accessibility'); ?>" aria-label="<?php esc_attr_e('Search the online dictionary', 'website-accessibility'); ?>">
                <button id="wap-dictionary-search-button" aria-label="<?php esc_attr_e('Search', 'website-accessibility'); ?>">
                    <span class="wap-search-icon" aria-hidden="true"></span>
                </button>
                <div id="wap-dictionary-results"></div>
            </div>
        </div>
        <?php endif; ?>
        <?php
    }

    /**
     * Render color palette
     *
     * @param string $type Color type (text or background).
     */
    private function render_color_palette($type) {
        $colors = array(
            'black' => '#000000',
            'white' => '#ffffff',
            'red' => '#ff0000',
            'green' => '#00ff00',
            'blue' => '#0000ff',
            'yellow' => '#ffff00',
            'orange' => '#ffa500',
            'purple' => '#800080'
        );

        foreach ($colors as $name => $hex) {
            echo '<button class="wap-color-option" data-type="' . esc_attr($type) . '" data-color="' . esc_attr($hex) . '" style="background-color: ' . esc_attr($hex) . ';" aria-label="' . esc_attr(sprintf(__('Set %s color to %s', 'website-accessibility'), $type, $name)) . '"></button>';
        }
    }

    /**
     * Get frontend settings
     */
    public function get_frontend_settings() {
        $options = get_option('website_accessibility');
        
        $settings = array(
            'ajaxUrl'               => admin_url('admin-ajax.php'),
            'pluginUrl'             => plugin_dir_url(dirname(__FILE__)),
            'autoOpen'              => isset($options['auto_open']) ? filter_var($options['auto_open'], FILTER_VALIDATE_BOOLEAN) : false,
            'customCSS'             => isset($options['custom_css']) ? $options['custom_css'] : '',
            'saveOptions'           => isset($options['save_user_options']) ? filter_var($options['save_user_options'], FILTER_VALIDATE_BOOLEAN) : true,
            'hideOnMobile'          => isset($options['hide_on_mobile']) ? filter_var($options['hide_on_mobile'], FILTER_VALIDATE_BOOLEAN) : false,
            'speechLang'            => isset($options['voice_language']) ? $options['voice_language'] : 'en-US',
            'keyboardShortcut'      => isset($options['keyboard_shortcut']) ? filter_var($options['keyboard_shortcut'], FILTER_VALIDATE_BOOLEAN) : true,
            'speechRate'            => isset($options['speech_rate']) ? floatval($options['speech_rate']) : 1,
            'speechPitch'           => isset($options['speech_pitch']) ? floatval($options['speech_pitch']) : 1,
            'speechVolume'          => isset($options['speech_volume']) ? floatval($options['speech_volume']) : 1,
            'colorAdjustmentValues' => array(
                'textColor'       => isset($options['text_color_value']) ? $options['text_color_value'] : '#000000',
                'bgColor'         => isset($options['bg_color_value']) ? $options['bg_color_value'] : '#ffffff',
                'linkColor'       => isset($options['link_color_value']) ? $options['link_color_value'] : '#0000ff',
                'titleColor'      => isset($options['title_color_value']) ? $options['title_color_value'] : '#000000'
            ),
            'googleApiKey'          => isset($options['google_api_key']) ? $options['google_api_key'] : '',
            'tooltipsEnabled'       => isset($options['enable_tooltips']) ? filter_var($options['enable_tooltips'], FILTER_VALIDATE_BOOLEAN) : false,
            'profileLabel'          => __('Profile:', 'website-accessibility'),
            'resetLabel'            => __('Reset all', 'website-accessibility'),
            'closeLabel'            => __('Close', 'website-accessibility'),
            'tooltipLabels'         => array(
                'voice'              => __('Activate voice navigation', 'website-accessibility'),
                'textMagnifier'      => __('Magnify text on hover', 'website-accessibility'),
                'readableFont'       => __('Change to readable font', 'website-accessibility'),
                'dyslexiaFont'       => __('Change to dyslexia-friendly font', 'website-accessibility'),
                'darkMode'           => __('Enable dark mode', 'website-accessibility'),
                'highContrast'       => __('High contrast colors', 'website-accessibility'),
                'highlightLinks'     => __('Highlight all links', 'website-accessibility'),
                'highlightTitles'    => __('Highlight all titles', 'website-accessibility'),
                'textToSpeech'       => __('Text to speech functionality', 'website-accessibility'),
                'fontSizing'         => __('Adjust font size', 'website-accessibility'),
                'lineHeight'         => __('Adjust line height', 'website-accessibility'),
                'letterSpacing'      => __('Adjust letter spacing', 'website-accessibility'),
                'alignCenter'        => __('Center-align text', 'website-accessibility'),
                'alignLeft'          => __('Left-align text', 'website-accessibility'),
                'alignRight'         => __('Right-align text', 'website-accessibility'),
                'fontColorPicker'    => __('Change text color', 'website-accessibility'),
                'bgColorPicker'      => __('Change background color', 'website-accessibility'),
                'muteSounds'         => __('Mute all sounds', 'website-accessibility'),
                'hideImages'         => __('Hide all images', 'website-accessibility'),
                'virtualKeyboard'    => __('Show virtual keyboard', 'website-accessibility'),
                'readingGuide'       => __('Show reading guide', 'website-accessibility'),
                'stopAnimations'     => __('Stop animations', 'website-accessibility'),
                'readingMask'        => __('Show reading mask', 'website-accessibility'),
                'bigCursor'          => __('Show big cursor', 'website-accessibility'),
                'highlightHover'     => __('Highlight elements on hover', 'website-accessibility'),
                'highlightFocus'     => __('Highlight elements on focus', 'website-accessibility'),
                'cognitiveReading'   => __('Enable cognitive reading mode', 'website-accessibility'),
                'keyboardNavigation' => __('Enable keyboard navigation', 'website-accessibility'),
                'dictionary'         => __('Enable dictionary', 'website-accessibility')
            )
        );
        
        return $settings;
    }

    /**
     * Get enabled features
     *
     * @return array Enabled features.
     */
    private function get_enabled_features() {
        $features = array();
        $feature_options = array(
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
            'enable_dictionary'
        );

        foreach ($feature_options as $option) {
            $feature_key = str_replace('enable_', '', $option);
            $features[$feature_key] = ($this->settings->get_option($option) === 'yes');
        }

        return $features;
    }

    /**
     * Get translations for JS
     *
     * @return array Translations.
     */
    private function get_translations() {
        return array(
            'accessibility' => __('Accessibility', 'website-accessibility'),
            'openAccessibility' => __('Open Accessibility Panel', 'website-accessibility'),
            'closeAccessibility' => __('Close Accessibility Panel', 'website-accessibility'),
            'resetSettings' => __('Reset Settings', 'website-accessibility'),
            'accessibilityStatement' => __('Accessibility Statement', 'website-accessibility'),
            'searchDictionary' => __('Search the online dictionary...', 'website-accessibility'),
            'searchResults' => __('Search Results', 'website-accessibility'),
            'noResults' => __('No results found', 'website-accessibility'),
            'loading' => __('Loading...', 'website-accessibility'),
            'increase' => __('Increase', 'website-accessibility'),
            'decrease' => __('Decrease', 'website-accessibility'),
            'default' => __('Default', 'website-accessibility')
        );
    }
} 