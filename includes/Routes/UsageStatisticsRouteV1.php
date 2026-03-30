<?php

namespace bdthemes\websiteaccessibility\Routes;

use bdthemes\websiteaccessibility\Traits\Singleton;
use WP_REST_Request;
use WP_REST_Server;

if (! defined('ABSPATH')) exit;

class UsageStatisticsRouteV1
{
    use Singleton;

    const OPTION_KEY = 'one_accessibility_usage_statistics';

    /**
     * Features with zero counts
     */
    private $features = [
        'biggerText',
        'brightness',
        'contrast',
        'cursor',
        'dictionary',
        'dyslexiaFriendly',
        'grayscale',
        'hideImages',
        'highlightLinks',
        'lineHeight',
        'muteSounds',
        'pauseAnimations',
        'saturation',
        'screenReader',
        'smartContrast',
        'textAlign',
        'textSpacing',
        'tooltips'
    ];

    private function __construct()
    {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    public function register_routes()
    {
        register_rest_route('one-accessibility/v1', '/usage-statistics', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [$this, 'get_statistics'],
                'permission_callback' => [$this, 'can_manage_statistics'],
            ],
            [
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => [$this, 'save_statistics'],
                'permission_callback' => '__return_true', // Public
            ],
            [
                'methods' => WP_REST_Server::DELETABLE,
                'callback' => [$this, 'reset_statistics'],
                'permission_callback' => [$this, 'can_manage_statistics'],
            ],
        ]);
    }

    public function can_manage_statistics()
    {
        return current_user_can('manage_options');
    }

    /**
     * GET: Return filtered usage statistics
     */
    public function get_statistics(WP_REST_Request $request)
    {
        $stats = get_option(self::OPTION_KEY, []);
        $range = $request->get_param('range') ?? 'daily'; // daily|last7days|last30days|totals
        $today_ts = current_time('timestamp');

        // Initialize target counts
        $target = $this->empty_counts();

        // Remove metadata
        unset($stats['last_updated']);

        switch ($range) {
            case 'daily':
                $date = $request->get_param('date') ?? current_time('Y-m-d');

                foreach ($stats as $browser_key => $dates) {
                    if (! is_array($dates) || ! isset($dates[$date])) continue;

                    foreach ($this->features as $feature) {
                        $target[$feature] += absint($dates[$date][$feature] ?? 0);
                    }
                }
                break;

            case 'last7days':
                $this->aggregate_last_n_days($stats, 7, $target, $today_ts);
                break;

            case 'last30days':
                $this->aggregate_last_n_days($stats, 30, $target, $today_ts);
                break;

            case 'totals':
                $this->aggregate_last_n_days($stats, PHP_INT_MAX, $target, $today_ts);
                break;

            default:
                return rest_ensure_response([
                    'success' => false,
                    'message' => __('Invalid range filter.', 'website-accessibility'),
                ]);
        }

        return rest_ensure_response([
            'success' => true,
            'data' => $target,
            'last_updated' => $stats['last_updated'] ?? current_time('mysql'),
        ]);
    }

    /**
     * Helper: Aggregate counts for last N days
     */
    private function aggregate_last_n_days(array $stats, int $days, array &$target, int $today_ts)
    {
        foreach ($stats as $browser_key => $dates) {
            if (! is_array($dates)) continue;

            foreach ($dates as $date => $features) {
                $date_ts = strtotime($date);
                if (! $date_ts) continue;

                $diff_days = ($today_ts - $date_ts) / DAY_IN_SECONDS;
                if ($diff_days > $days) continue;

                foreach ($this->features as $feat) {
                    $target[$feat] += absint($features[$feat] ?? 0);
                }
            }
        }
    }



    public function save_statistics(WP_REST_Request $request)
    {
        $incoming = (array) $request->get_json_params();

        // Verify nonce
        $nonce = $request->get_header('X-WP-Nonce');
        if (! wp_verify_nonce($nonce, 'wp_rest')) {
            return rest_ensure_response([
                'success' => false,
                'message' => __('Invalid nonce.', 'website-accessibility'),
            ]);
        }

        // Browser key (acts like an anonymous user/session ID)
        $browser_key = sanitize_text_field($incoming['browserKey'] ?? '');
        if (! $browser_key) {
            return rest_ensure_response([
                'success' => false,
                'message' => __('Missing browser key.', 'website-accessibility'),
            ]);
        }

        // Current date (for per-day stats)
        $today = current_time('Y-m-d');

        // Get saved statistics (if any)
        $stats = get_option(self::OPTION_KEY, []);

        // Make sure this browser key exists
        if (! isset($stats[$browser_key])) {
            $stats[$browser_key] = [];
        }

        // Reset today's state for this browser, then apply incoming values.
        $stats[$browser_key][$today] = $this->empty_counts();

        // Loop through features and set today's values from current request
        foreach ($this->features as $feature) {
            $count = isset($incoming[$feature]) ? absint($incoming[$feature]) : 0;
            if ($count > 0) {
                $stats[$browser_key][$today][$feature] = $count;
            }
        }

        // Add last updated timestamp
        $stats['last_updated'] = current_time('mysql');

        // Save back to options
        update_option(self::OPTION_KEY, $stats, false);
        error_log( print_r( $stats, true ) );
        return rest_ensure_response([
            'success' => true,
            'message' => __('Statistics updated successfully.', 'website-accessibility'),
            'data' => $stats[$browser_key][$today],
            'last_updated' => $stats['last_updated'],
        ]);
    }


    /**
     * DELETE: Reset all counters
     */
    public function reset_statistics(WP_REST_Request $request)
    {
        $empty = $this->empty_counts();
        $stats = [
            'daily' => $empty,
            'last7days' => $empty,
            'last30days' => $empty,
            'totals' => $empty,
            'last_updated' => current_time('mysql'),
        ];

        update_option(self::OPTION_KEY, $stats);

        return rest_ensure_response([
            'success' => true,
            'message' => __('Usage statistics have been reset.', 'website-accessibility'),
            'data' => $stats,
        ]);
    }

    /**
     * Helper: Initialize zero counts for all features
     */
    private function empty_counts()
    {
        $empty = [];
        foreach ($this->features as $feature) {
            $empty[$feature] = 0;
        }
        return $empty;
    }
}
