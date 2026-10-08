<?php

namespace Websac\Routes;

use Websac\Core\Utils;
use Websac\Traits\Singleton;
use WP_REST_Request;
use WP_REST_Server;

if (! defined('ABSPATH')) exit;

class UsageStatisticsRouteV1
{
    use Singleton;

    const OPTION_KEY = 'websac_usage_statistics';

    /**
     * Reserved slot inside OPTION_KEY. It holds a string, while every other
     * top-level key holds a per-browser array, so a client-supplied browser key
     * must never be allowed to address it.
     */
    const METADATA_KEY = 'last_updated';

    /**
     * Reserved slot holding past days for the whole site, shaped like a browser
     * slot (date => feature => count) so every reader sums it the same way. Only
     * today is kept per browser: older days fold in here once a day, which keeps
     * the option's size bounded however many browser keys post.
     */
    const HISTORY_KEY = '_history';

    /** Reserved slot: the date past days were last folded into HISTORY_KEY. */
    const FOLDED_KEY = '_folded';

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
                // Anonymous visitors record which toolbar tools they used on THIS
                // site (never sent off-site). Writes are only accepted when the
                // request carries the REST nonce printed with the toolbar and the
                // site owner has the statistics feature switched on.
                'permission_callback' => [$this, 'can_save_statistics'],
                'args'                => [
                    'browserKey' => [
                        'type'              => 'string',
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_text_field',
                        'validate_callback' => static function ($value) {
                            return is_string($value) && preg_match('/^[A-Za-z0-9_-]{1,64}$/', $value) === 1;
                        },
                    ],
                ],
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
     * Permission check for the public counter endpoint: statistics must be
     * enabled and the request must carry a valid REST nonce.
     *
     * @param WP_REST_Request $request
     * @return bool|\WP_Error
     */
    public function can_save_statistics(WP_REST_Request $request)
    {
        if (! Utils::get_settings('show_usage_statistics')) {
            return new \WP_Error(
                'websac_statistics_disabled',
                __('Usage statistics are disabled.', 'website-accessibility'),
                ['status' => 403]
            );
        }

        $nonce = (string) $request->get_header('X-WP-Nonce');
        if (! wp_verify_nonce($nonce, 'wp_rest')) {
            return new \WP_Error(
                'websac_invalid_nonce',
                __('Invalid nonce.', 'website-accessibility'),
                ['status' => 403]
            );
        }

        return true;
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

        // Read the timestamp before dropping it: everything below treats each
        // remaining top-level key as a browser key, and reporting it afterwards
        // would always fall through to "now" instead of when data last arrived.
        $last_updated = isset($stats[self::METADATA_KEY]) && is_string($stats[self::METADATA_KEY])
            ? $stats[self::METADATA_KEY]
            : current_time('mysql');

        // Remove metadata
        unset($stats[self::METADATA_KEY], $stats[self::FOLDED_KEY]);

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
            'last_updated' => $last_updated,
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

        // Browser key (acts like an anonymous per-browser ID). Character set and length
        // are enforced by the route args; what they cannot express is that METADATA_KEY
        // is reserved. It holds a string rather than a per-browser array, so accepting it
        // here made the writes below index into that string, raising an uncaught Error
        // ("Cannot use string offset as an array") on a route anonymous visitors reach.
        $browser_key = (string) $request->get_param('browserKey');
        if ($browser_key === '' || in_array($browser_key, self::reserved_keys(), true)) {
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

        $stats = $this->fold_past_days($stats, $today);

        // Cap the number of distinct browser keys retained. This endpoint is
        // reachable by anonymous visitors (the wp_rest nonce is printed on public
        // pages), so an unbounded key space would let an attacker grow this
        // option indefinitely (storage exhaustion / write amplification). Once the
        // cap is reached, only updates to already-known keys are accepted.
        //
        // This runs BEFORE the throttle below: set_transient() itself allocates two
        // wp_options rows per distinct key on installs without a persistent object
        // cache, so throttling first would let rejected requests keep growing the
        // options table long after this cap had stopped the statistics option itself.
        $max_keys = (int) apply_filters('websac_usage_statistics_max_keys', 5000);
        $browser_count = count(array_diff_key($stats, array_flip(self::reserved_keys())));
        if (! isset($stats[$browser_key]) && $browser_count >= $max_keys) {
            return rest_ensure_response([
                'success' => false,
                'message' => __('Statistics capacity reached.', 'website-accessibility'),
            ]);
        }

        // Throttle: at most one write per browser key every 5 seconds (the
        // toolbar debounces to one request per second per interaction burst).
        $throttle_key = 'websac_stats_' . md5($browser_key);
        if (get_transient($throttle_key)) {
            return rest_ensure_response([
                'success' => false,
                'message' => __('Too many requests, please retry shortly.', 'website-accessibility'),
            ]);
        }
        set_transient($throttle_key, 1, 5);

        // Make sure this browser key exists and holds an array. The is_array() arm also
        // repairs any non-array slot written by an older version.
        if (! isset($stats[$browser_key]) || ! is_array($stats[$browser_key])) {
            $stats[$browser_key] = [];
        }

        // Replace today's state for this browser. The toolbar sends 1 per tool in
        // use, so a browser counts at most once per tool per day: larger numbers
        // are forged. Tools not in use are not stored.
        $today_counts = [];
        foreach ($this->get_features() as $feature) {
            if (! empty($incoming[$feature]) && absint($incoming[$feature]) > 0) {
                $today_counts[$feature] = 1;
            }
        }
        $stats[$browser_key] = [$today => $today_counts];

        // Add last updated timestamp
        $stats[self::METADATA_KEY] = current_time('mysql');

        // Save back to options
        update_option(self::OPTION_KEY, $stats, false);

        return rest_ensure_response([
            'success' => true,
            'message' => __('Statistics updated successfully.', 'website-accessibility'),
            'data' => $stats[$browser_key][$today],
            'last_updated' => $stats[self::METADATA_KEY],
        ]);
    }


    /**
     * DELETE: Reset all counters
     */
    public function reset_statistics(WP_REST_Request $request)
    {
        // Every top-level key other than METADATA_KEY is read back as a browser key
        // whose value is a map of dates. Seeding 'daily'/'last7days'/'last30days'/
        // 'totals' here wrote range names into that same space, so four fake browser
        // keys survived every reset and counted against the key cap for good. A reset
        // means no browsers recorded yet.
        $stats = [
            self::METADATA_KEY => current_time('mysql'),
        ];

        update_option(self::OPTION_KEY, $stats, false);

        return rest_ensure_response([
            'success' => true,
            'message' => __('Usage statistics have been reset.', 'website-accessibility'),
            'data' => $this->empty_counts(),
        ]);
    }

    /**
     * Top-level keys of OPTION_KEY that are not browser keys.
     *
     * @return string[]
     */
    private static function reserved_keys()
    {
        return [self::METADATA_KEY, self::HISTORY_KEY, self::FOLDED_KEY];
    }

    /**
     * Once a day, fold every browser's past days into HISTORY_KEY and drop the
     * browsers left with nothing, so only today stays per browser.
     *
     * @param array  $stats Saved statistics.
     * @param string $today Today's date (Y-m-d).
     * @return array
     */
    private function fold_past_days(array $stats, $today)
    {
        if (($stats[self::FOLDED_KEY] ?? '') === $today) {
            return $stats;
        }

        $history  = isset($stats[self::HISTORY_KEY]) && is_array($stats[self::HISTORY_KEY]) ? $stats[self::HISTORY_KEY] : [];
        $features = array_flip($this->get_features());

        foreach ($stats as $key => $dates) {
            if (in_array($key, self::reserved_keys(), true)) {
                continue;
            }
            if (! is_array($dates)) {
                unset($stats[$key]);
                continue;
            }
            foreach ($dates as $date => $counts) {
                if ($date === $today) {
                    continue;
                }
                if (is_array($counts) && preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) $date)) {
                    foreach (array_intersect_key($counts, $features) as $feature => $count) {
                        $count = absint($count);
                        if ($count > 0) {
                            $history[$date][$feature] = ($history[$date][$feature] ?? 0) + $count;
                        }
                    }
                }
                unset($stats[$key][$date]);
            }
            if (empty($stats[$key])) {
                unset($stats[$key]);
            }
        }

        $stats[self::HISTORY_KEY] = $history;
        $stats[self::FOLDED_KEY]  = $today;

        return $stats;
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
