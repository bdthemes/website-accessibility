<?php

namespace WebsiteAccessibilityPro\Core;

class Utils {
    public static function get_preset_data($preset) {
        if (is_object($preset) && !empty($preset->ID) && !empty($preset->post_content)) {
            $presetData = self::process_preset_data($preset->post_content);
            if (!empty($presetData)) {
                return $presetData;
            }
        }

        if (is_int($preset)) {
            $preset = get_post($preset);
            if ($preset) {
                $presetData = self::process_preset_data($preset->post_content);
                if (!empty($presetData)) {
                    return $presetData;
                }
            }
        }
        
        return null;
    }

    public static function process_preset_data($content) {
        if (empty($content)) {
            return null;
        }

        $presetData = json_decode($content, true);

        if (!empty($presetData)) {
            return $presetData;
        }

        return null;
    }

    public static function get_page_type() {
        if (is_singular()) {
            return 'singular';
        } elseif (is_archive()) {
            return 'archive';
        }
        return 'entire_site';
    }
}