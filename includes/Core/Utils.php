<?php

namespace WebsiteAccessibility\Core;

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
        } elseif (is_archive()) {
            return 'archive';
        }
        return 'entire_site';
    }

    public static function get_current_preset($presets = [], $page_type = null)
    {
        $entire_site_preset = null;

        foreach ($presets as $preset) {
            $data = $preset['preset'] ?? null;

            if (!$data || empty($data['active'])) {
                continue;
            }

            if ($data['condition'] === $page_type) {
                return $preset; // Early return if exact match is found
            }

            if ($data['condition'] === 'entire_site') {
                $entire_site_preset = $preset;
            }
        }

        return $entire_site_preset ?? null;
    }
}
