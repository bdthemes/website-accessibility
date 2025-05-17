<?php
/**
 * Main plugin class
 *
 * @package Website_Accessibility
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Main plugin class
 */
class Website_Accessibility {

    /**
     * Settings instance
     *
     * @var Website_Accessibility_Settings
     */
    private $settings;

    /**
     * Admin instance
     *
     * @var Website_Accessibility_Admin
     */
    private $admin;

    /**
     * Public instance
     *
     * @var Website_Accessibility_Public
     */
    private $public;

    /**
     * Constructor
     */
    public function __construct() {
        $this->settings = new Website_Accessibility_Settings();
    }

    /**
     * Initialize the plugin
     */
    public function init() {
        // Register activation/deactivation hooks
        register_activation_hook(WAP_PLUGIN_FILE, array($this, 'activate'));
        register_deactivation_hook(WAP_PLUGIN_FILE, array($this, 'deactivate'));

        // Initialize admin class if in admin
        if (is_admin()) {
            $this->admin = new Website_Accessibility_Admin($this->settings);
            $this->admin->init();
        }

        // Initialize public class
        $this->public = new Website_Accessibility_Public($this->settings);
        $this->public->init();

        // Add action links
        add_filter('plugin_action_links_' . WAP_PLUGIN_BASENAME, array($this, 'add_action_links'));
    }

    /**
     * Plugin activation
     */
    public function activate() {
        // Set default options
        $this->settings->set_defaults();
    }

    /**
     * Plugin deactivation
     */
    public function deactivate() {
        // Clean up if needed
    }

    /**
     * Add action links to the plugin page
     *
     * @param array $links Plugin action links.
     * @return array Modified action links.
     */
    public function add_action_links($links) {
        $settings_link = '<a href="' . admin_url('admin.php?page=website-accessibility') . '">' . __('Settings', 'website-accessibility') . '</a>';
        array_unshift($links, $settings_link);
        return $links;
    }
} 