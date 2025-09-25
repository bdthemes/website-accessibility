<?php

namespace bdthemes\websiteaccessibility\Core;

class Utils
{
    public static function get_preset_data($preset)
    {
        if (is_object($preset) && !empty($preset->ID) && !empty($preset->post_content)) {
            $presetData = self::process_preset_data($preset->post_content);
            if (!empty($presetData)) {
                $presetData['ID'] = $preset->ID;
                $presetData['title'] = $preset->post_title;
                $presetData['slug'] = $preset->post_name;
                return $presetData;
            }
        }

        if (is_int($preset)) {
            $preset = get_post($preset);
            if ($preset) {
                $presetData = self::process_preset_data($preset->post_content);
                if (!empty($presetData)) {
                    $presetData['ID'] = $preset->ID;
                    $presetData['title'] = $preset->post_title;
                    $presetData['slug'] = $preset->post_name;
                    return $presetData;
                }
            }
        }

        return null;
    }

    public static function process_preset_data($content)
    {
        if (empty($content)) {
            return null;
        }

        $presetData = json_decode($content, true);

        if (!empty($presetData)) {
            return $presetData;
        }

        return null;
    }

    public static function get_page_type()
    {
        if (is_singular()) {
            return 'singular';
        } elseif (is_front_page() || is_home() || is_archive()) {
            return 'archive'; // treat homepage & blog index as archive
        }

        return 'entire_site';
    }


    private static function check_archive_pages($pages = [])
    {
        if (empty($pages)) return true; // apply to all archive pages if none selected

        foreach ($pages as $page) {
            switch ($page) {
                case 'home':
                    if (is_front_page()) return true;
                    break;
                case 'posts':
                    if (is_home()) return true;
                    break;
                case 'category':
                    if (is_category()) return true;
                    break;
                case 'tag':
                    if (is_tag()) return true;
                    break;
                case 'author':
                    if (is_author()) return true;
                    break;
                case 'date':
                    if (is_date()) return true;
                    break;
                case 'search':
                    if (is_search()) return true;
                    break;
                case '404':
                    if (is_404()) return true;
                    break;
                case 'attachment':
                    if (is_attachment()) return true;
                    break;
                default:
                    if (is_post_type_archive($page)) return true; // custom post type archive
                    break;
            }
        }

        return false;
    }

    /**
     * Check if current page matches selected singular posts.
     * If $selectedPosts is empty, apply to all singular pages.
     */
    private static function check_singular_pages($selectedPosts = [])
    {
        if (empty($selectedPosts)) return true; // apply to all singular pages if none selected

        if (is_singular()) {
            $currentId = get_queried_object_id();
            if (in_array($currentId, $selectedPosts)) return true;
        }

        return false;
    }

    /**
     * Get the current active preset for a page type.
     * Returns the first matching preset or the entire_site preset as fallback.
     */
    public static function get_current_preset($presets = [], $page_type = null)
    {
        $entire_site_preset = null;

        foreach ($presets as $preset) {
            $data = $preset['preset'] ?? null;

            if (!$data || empty($data['active'])) continue; // skip inactive presets

            error_log(print_r([$data, $page_type], true));
            if ($data['condition'] === $page_type) {

                if ($page_type === 'archive') {
                    if (self::check_archive_pages($data['specificArchive'] ?? [])) {
                        return $preset;
                    }
                }

                if ($page_type === 'singular') {
                    if (self::check_singular_pages($data['specificPosts'] ?? [])) {
                        return $preset;
                    }
                }
            }

            if ($data['condition'] === 'entire_site') {
                $entire_site_preset = $preset;
            }
        }

        return $entire_site_preset ?? null;
    }
}
