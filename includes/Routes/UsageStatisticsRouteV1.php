<?php

namespace Websac\Routes;

use Websac\Traits\Singleton;
use WP_REST_Request;
use WP_REST_Server;

if (! defined('ABSPATH')) exit;

class UsageStatisticsRouteV1
{
    use Singleton;

    const OPTION_KEY = 'websac_usage_statistics';

    /**
     * Feature keys tracked by this plugin. Add-ons register the keys of the
     * features they ship through the `websac_usage_statistics_features` filter.
     */
    private $features = [
        'biggerText',
        'contrast',
        'cursor',
        'dictionary',
        'hideImages',
        'highlightLinks',
        'lineHeight',
        'pauseAnimations',
        'saturation',
        'textAlign',
        'textSpacing',
        'tooltips',
    ];

    /** @var string[]|null Resolved (filtered) feature keys. */
    private $resolved_features = null;

    private function __construct()
    {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    /**
     * Full list of tracked feature keys (built-in + add-on keys).
     *
     * @return string[]
     */
    private function get_features()
    {
        if ($this->resolved_features !== null) {
            return $this->resolved_features;
        }

        /**
         * Filter the toolbar feature keys tracked by the usage statistics.
         *
         * @param string[] $features Feature keys.
         */
        $features = apply_filters('websac_usage_statistics_features', $this->features);
        $keys     = [];
        if (is_array($features)) {
            foreach ($features as $feature) {
                if (is_string($feature) && preg_match('/^[A-Za-z0-9_-]{1,64}$/', $feature)) {
                    $keys[] = $feature;
                }
            }
        }
        $this->resolved_features = array_values(array_unique($keys ?: $this->features));

        return $this->resolved_features;
    }

    public function register_routes()
    {
        register_rest_route('websac/v1', '/usage-statistics', [
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
        $previous = $this->empty_counts();

        // Remove metadata
        unset($stats['last_updated']);

        switch ($range) {
            case 'daily':
                $date = $request->get_param('date') ?? current_time('Y-m-d');
                $prev_date = gmdate('Y-m-d', strtotime($date . ' -1 day'));

                foreach ($stats as $browser_key => $dates) {
                    if (! is_array($dates)) continue;

                    foreach ($this->get_features() as $feature) {
                        $target[$feature] += absint($dates[$date][$feature] ?? 0);
                        $previous[$feature] += absint($dates[$prev_date][$feature] ?? 0);
                    }
                }
                break;

            case 'last7days':
                $this->aggregate_last_n_days($stats, 7, $target, $today_ts);
                $this->aggregate_day_window($stats, 8, 14, $previous, $today_ts);
                break;

            case 'last30days':
                $this->aggregate_last_n_days($stats, 30, $target, $today_ts);
                $this->aggregate_day_window($stats, 31, 60, $previous, $today_ts);
                break;

            case 'totals':
                $this->aggregate_last_n_days($stats, PHP_INT_MAX, $target, $today_ts);
                // No meaningful "previous totals" window for all-time aggregation.
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
            'previous_data' => $previous,
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

                foreach ($this->get_features() as $feat) {
                    $target[$feat] += absint($features[$feat] ?? 0);
                }
            }
        }
    }

    /**
     * Helper: Aggregate counts for an inclusive day offset window.
     * Example: 8..14 means from 8 days ago through 14 days ago.
     */
    private function aggregate_day_window(array $stats, int $from_days, int $to_days, array &$target, int $today_ts)
    {
        foreach ($stats as $browser_key => $dates) {
            if (! is_array($dates)) continue;

            foreach ($dates as $date => $features) {
                $date_ts = strtotime($date);
                if (! $date_ts) continue;

                $diff_days = ($today_ts - $date_ts) / DAY_IN_SECONDS;
                if ($diff_days < $from_days || $diff_days > $to_days) continue;

                foreach ($this->get_features() as $feat) {
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

        // Browser key (acts like an anonymous user/session ID). Bound the length
        // so an attacker cannot store oversized keys.
        $browser_key = substr(sanitize_text_field($incoming['browserKey'] ?? ''), 0, 64);
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
        if (! is_array($stats)) {
            $stats = [];
        }

        // Cap the number of distinct browser keys retained. This endpoint is
        // reachable by anonymous visitors (the wp_rest nonce is printed on public
        // pages), so an unbounded key space would let an attacker grow this
        // option indefinitely (storage exhaustion / write amplification). Once the
        // cap is reached, only updates to already-known keys are accepted.
        $max_keys = (int) apply_filters('websac_usage_statistics_max_keys', 5000);
        if (! isset($stats[$browser_key]) && (count($stats) - (isset($stats['last_updated']) ? 1 : 0)) >= $max_keys) {
            return rest_ensure_response([
                'success' => false,
                'message' => __('Statistics capacity reached.', 'website-accessibility'),
            ]);
        }

        // Make sure this browser key exists
        if (! isset($stats[$browser_key])) {
            $stats[$browser_key] = [];
        }

        // Reset today's state for this browser, then apply incoming values.
        $stats[$browser_key][$today] = $this->empty_counts();

        // Loop through features and set today's values from current request
        foreach ($this->get_features() as $feature) {
            $count = isset($incoming[$feature]) ? absint($incoming[$feature]) : 0;
            if ($count > 0) {
                $stats[$browser_key][$today][$feature] = $count;
            }
        }

        // Add last updated timestamp
        $stats['last_updated'] = current_time('mysql');

        // Save back to options
        update_option(self::OPTION_KEY, $stats, false);

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
        foreach ($this->get_features() as $feature) {
            $empty[$feature] = 0;
        }
        return $empty;
    }
}
