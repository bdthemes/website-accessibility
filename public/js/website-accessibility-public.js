/**
 * Public JavaScript for Website Accessibility Plugin
 */
(function($) {
    'use strict';

    // Initialize variables
    var settings = websiteAccessibility.settings || {};
    var translations = websiteAccessibility.translations || {};
    var $body = $('body');
    var pluginUrl = '';
    
    // Try to get plugin URL
    if (typeof websiteAccessibility !== 'undefined' && websiteAccessibility.pluginUrl) {
        pluginUrl = websiteAccessibility.pluginUrl;
    } else {
        // Fallback - try to detect from script src
        var scriptTags = document.getElementsByTagName('script');
        for (var i = 0; i < scriptTags.length; i++) {
            var src = scriptTags[i].src;
            if (src.indexOf('website-accessibility-public.js') !== -1) {
                pluginUrl = src.replace(/js\/website-accessibility-public\.js.*$/, '');
                break;
            }
        }
    }
    
    // Store active features
    var activeFeatures = {};
    
    // DOM elements for reading guide and mask
    var readingGuide = null;
    var readingMask = null;
    var readingMaskHole = null;

    // SVG Icons for features
    var svgIcons = {
        // Main accessibility icon
        accessibility: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/></svg>',
        
        // Profile icons
        epilepsy: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34a.996.996 0 0 0-1.41 0L9 12.25 11.75 15l8.96-8.96a.996.996 0 0 0 0-1.41z"/></svg>',
        visual: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>',
        cognitive: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 8c1.04 0 2.34-.5 3-1.6.66 1.1 1.96 1.6 3 1.6 1.04 0 2.34-.5 3-1.6.66 1.1 1.96 1.6 3 1.6v2c-1.04 0-2.34.5-3 1.6-.66-1.1-1.96-1.6-3-1.6-1.04 0-2.34.5-3 1.6-.66-1.1-1.96-1.6-3-1.6v-2zm0 6c1.04 0 2.34-.5 3-1.6.66 1.1 1.96 1.6 3 1.6 1.04 0 2.34-.5 3-1.6.66 1.1 1.96 1.6 3 1.6v2c-1.04 0-2.34.5-3 1.6-.66-1.1-1.96-1.6-3-1.6-1.04 0-2.34.5-3 1.6-.66-1.1-1.96-1.6-3-1.6v-2z"/></svg>',
        adhd: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M21 1H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14zM3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm14 8v-2c0-1.11-.9-2-2-2h-2V7h4V5h-6v6h4v2h-4v2h4c1.1 0 2-.89 2-2z"/></svg>',
        blind: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>',
        
        // Feature icons
        'dark-mode': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z"/></svg>',
        'high-contrast': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.06-7.44 7-7.93v15.86zm2-15.86c1.03.13 2 .45 2.87.93H13v-.93zM13 7h5.24c.25.31.48.65.68 1H13V7zm0 3h6.74c.08.33.15.66.19 1H13v-1zm0 9.93V19h2.87c-.87.48-1.84.8-2.87.93zM18.24 17H13v-1h5.92c-.2.35-.43.69-.68 1zm1.5-3H13v-1h6.93c-.04.34-.11.67-.19 1z"/></svg>',
        'readable-font': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9.93 13.5h4.14L12 7.98zM20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-4.05 16.5l-1.14-3H9.17l-1.12 3H5.96l5.11-13h1.86l5.11 13h-2.09z"/></svg>',
        'dyslexia-font': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 12.5h8V14H8zM8 16.5h8V18H8zM14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-2 6V4l4 4h-4z"/></svg>',
        'highlight-titles': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 4v3h5.5v12h3V7H19V4z"/></svg>',
        'highlight-links': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>',
        'font-sizing': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z"/></svg>',
        'line-height': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',
        'letter-spacing': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21h18v-2H3v2zM3 8v8l4-4-4-4zm8 9h10v-2H11v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2zm0-4h10v-2H11v2zm0-4h10v-2H11v2z"/></svg>',
        'mute-sounds': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>',
        'hide-images': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M21 17H7V3h14v14zm0-16H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zM3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm14 8v-1.5c0-.83-.67-1.5-1.5-1.5.83 0 1.5-.67 1.5-1.5V7c0-1.11-.9-2-2-2h-4v2h4v2h-2v2h2v2h-4v2h4c1.1 0 2-.89 2-2z"/></svg>',
        'reading-guide': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',
        'stop-animations': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>',
        'reading-mask': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6 8h1.5v1.5H13V13zm1.5 1.5H16V16h-1.5v-1.5zM16 13h1.5v1.5H16V13zm-3 3h1.5v1.5H13V16zm1.5 1.5H16V19h-1.5v-1.5zM16 16h1.5v1.5H16V16zm1.5-1.5H19V16h-1.5v-1.5zm0 3H19V19h-1.5v-1.5zM22 7h-2v1.5h2v-1.5zm0 3h-2v1.5h2v-1.5zm0 3h-2v1.5h2v-1.5zm0 3h-2v1.5h2v-1.5z"/></svg>',
        'highlight-hover': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M2.53 19.65l1.34.56v-9.03l-2.43 5.86c-.41 1.02.08 2.19 1.09 2.61zm19.5-3.7L17.07 3.98c-.31-.75-1.04-1.21-1.81-1.23-.26 0-.53.04-.79.15L7.1 5.95c-.75.31-1.21 1.03-1.23 1.8-.01.27.04.54.15.8l4.96 11.97c.31.76 1.05 1.22 1.83 1.23.26 0 .52-.05.77-.15l7.36-3.05c1.02-.42 1.51-1.59 1.09-2.6zM7.88 8.75c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-2 11c0 1.1.9 2 2 2h1.45l-3.45-8.34v6.34z"/></svg>',
        'highlight-focus': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 10.1c.1-.1.1-.2.2-.3l1.5-2.1c.3-.5.1-1.1-.4-1.5L16.6 5c-.5-.3-1.1-.1-1.5.4l-1.5 2.1c-.1.1-.1.2-.1.3l-7.3 7.5c-.3.3-.3.8 0 1.1.1.2.3.3.6.3.1 0 .3-.1.4-.1L12 13l.9 1.6c.1.2.3.4.6.4h.1c.2 0 .4-.1.6-.2l2.9-3.3c.1-.2.1-.4.1-.6s-.1-.5-.2-.6l-.9-1.6 1.5-1.6zM5.5 7C6.3 7 7 6.3 7 5.5S6.3 4 5.5 4 4 4.7 4 5.5 4.7 7 5.5 7zM5 21h14c1.1 0 2-.9 2-2v-9c0-1.1-.9-2-2-2h-3.2l-1.2 1.7.9 1.7c.3.5.4 1.1.3 1.7-.1.5-.4 1-.9 1.3l-2.9 3.3c-.5.6-1.2.9-2 .9-.5 0-.9-.1-1.4-.4-.9-.5-1.4-1.4-1.5-2.4L6.6 14l-1.2 1.2c-.5.5-.9 1.2-.9 2V19c0 1.1.9 2 2 2z"/></svg>',
        'big-cursor': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>',
        'keyboard-navigation': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"/></svg>',
        'text-to-speech': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 13c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0-6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 8c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm-6 4c.22-.72 3.31-2 6-2 2.7 0 5.8 1.29 6 2H3zM16.76 5.36l-1.68 1.69c.84 1.18.84 2.71 0 3.89l1.68 1.69c2.02-2.02 2.02-5.07 0-7.27zM20.07 2l-1.63 1.63c2.77 3.02 2.77 7.56 0 10.74L20.07 16c3.9-3.89 3.91-9.95 0-14z"/></svg>',
        'voice-navigation': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>',
        'dictionary': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 11.55C9.64 9.35 6.48 8 3 8v11c3.48 0 6.64 1.35 9 3.55 2.36-2.19 5.52-3.55 9-3.55V8c-3.48 0-6.64 1.35-9 3.55zM12 8c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z"/></svg>',
        'tooltips': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.06-7.44 7-7.93v15.86zm2-15.86c1.03.13 2 .45 2.87.93H13v-.93zM13 7h5.24c.25.31.48.65.68 1H13V7zm0 3h6.74c.08.33.15.66.19 1H13v-1zm0 9.93V19h2.87c-.87.48-1.84.8-2.87.93zM18.24 17H13v-1h5.92c-.2.35-.43.69-.68 1zm1.5-3H13v-1h6.93c-.04.34-.11.67-.19 1z"/></svg>',
        'enableTooltips': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.06-7.44 7-7.93v15.86zm2-15.86c1.03.13 2 .45 2.87.93H13v-.93zM13 7h5.24c.25.31.48.65.68 1H13V7zm0 3h6.74c.08.33.15.66.19 1H13v-1zm0 9.93V19h2.87c-.87.48-1.84.8-2.87.93zM18.24 17H13v-1h5.92c-.2.35-.43.69-.68 1zm1.5-3H13v-1h6.93c-.04.34-.11.67-.19 1z"/></svg>',
        'text-magnifier': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm.5-7H9v2H7v1h2v2h1v-2h2V9h-2z"/></svg>'
    };

    /**
     * Add tooltips to section headings and features
     */
    function addTooltips() {
        // Define translation keys for section tooltips
        var sectionTooltipKeys = {
            'profiles': 'tooltip_section_profiles',
            'features': 'tooltip_section_features',
            'reading': 'tooltip_section_reading',
            'color': 'tooltip_section_color',
            'dictionary': 'tooltip_section_dictionary'
        };
        
        // Define translation keys for feature tooltips
        var featureTooltipKeys = {
            'dark-mode': 'tooltip_feature_dark_mode',
            'high-contrast': 'tooltip_feature_high_contrast',
            'readable-font': 'tooltip_feature_readable_font',
            'dyslexia-font': 'tooltip_feature_dyslexia_font',
            'text-magnifier': 'tooltip_feature_text_magnifier',
            'highlight-titles': 'tooltip_feature_highlight_titles',
            'highlight-links': 'tooltip_feature_highlight_links',
            'mute-sounds': 'tooltip_feature_mute_sounds',
            'hide-images': 'tooltip_feature_hide_images',
            'reading-guide': 'tooltip_feature_reading_guide',
            'stop-animations': 'tooltip_feature_stop_animations',
            'reading-mask': 'tooltip_feature_reading_mask',
            'highlight-hover': 'tooltip_feature_highlight_hover',
            'highlight-focus': 'tooltip_feature_highlight_focus',
            'big-cursor': 'tooltip_feature_big_cursor',
            'keyboard-navigation': 'tooltip_feature_keyboard_navigation',
            'text-to-speech': 'tooltip_feature_text_to_speech',
            'voice-navigation': 'tooltip_feature_voice_navigation',
            'font-sizing': 'tooltip_feature_font_sizing',
            'line-height': 'tooltip_feature_line_height',
            'letter-spacing': 'tooltip_feature_letter_spacing',
            'text-color': 'tooltip_feature_text_color',
            'bg-color': 'tooltip_feature_bg_color',
            'tooltips': 'tooltip_feature_tooltips',
            'enableTooltips': 'tooltip_feature_enableTooltips'
        };
        
        // Default tooltip text in English - this serves as a fallback
        var defaultTooltips = {
            // Section tooltips
            'tooltip_section_profiles': 'Choose a pre-configured accessibility profile that suits your needs.',
            'tooltip_section_features': 'Toggle individual accessibility features to customize your experience.',
            'tooltip_section_reading': 'Adjust text display settings for better readability.',
            'tooltip_section_color': 'Change text and background colors for better contrast and visibility.',
            'tooltip_section_dictionary': 'Look up definitions for words you don\'t understand.',
            
            // Feature tooltips
            'tooltip_feature_dark_mode': 'Changes the site to dark colors to reduce eye strain. This inverts background to dark and text to light colors across the website.',
            'tooltip_feature_high_contrast': 'Increases contrast for better visibility. This makes text white on black background with yellow links and bold borders for better distinction between elements.',
            'tooltip_feature_readable_font': 'Changes to a font that\'s easier to read. This applies a clean sans-serif font with good letter spacing and character distinction.',
            'tooltip_feature_dyslexia_font': 'Uses OpenDyslexic font designed specifically for readers with dyslexia. This font has heavier bottoms on letters to help prevent them from appearing to flip or rotate.',
            'tooltip_feature_text_magnifier': 'Shows magnified text when hovering over content. This creates a popup with enlarged text that follows your cursor when moving over paragraphs, headings, and links.',
            'tooltip_feature_highlight_titles': 'Makes headings stand out with yellow background highlighting. This helps you quickly scan for section headings and important titles.',
            'tooltip_feature_highlight_links': 'Makes links more visible with yellow background highlighting. This makes all hyperlinks clearly stand out from regular text for easier navigation.',
            'tooltip_feature_mute_sounds': 'Turns off all audio on the website. This mutes all videos, audio players, and sound effects that may be distracting or disruptive.',
            'tooltip_feature_hide_images': 'Hides all images for distraction-free reading. This removes images while preserving the layout, allowing you to focus solely on text content.',
            'tooltip_feature_reading_guide': 'Displays a horizontal guide that follows your cursor for easier reading. This helps track lines of text and maintain your place while reading.',
            'tooltip_feature_stop_animations': 'Stops all animations and moving elements that may cause distractions. This freezes GIFs, slideshows, and CSS animations.',
            'tooltip_feature_reading_mask': 'Dims the screen except around your cursor to focus reading. This creates a spotlight effect that highlights only the content you\'re currently reading.',
            'tooltip_feature_highlight_hover': 'Highlights elements when hovering over them with your cursor. This adds a clear outline to interactive elements to make them more noticeable.',
            'tooltip_feature_highlight_focus': 'Highlights elements when they receive keyboard focus. This makes it easier to see which element is selected when navigating with the Tab key.',
            'tooltip_feature_big_cursor': 'Uses a larger cursor that\'s easier to see on screen. This replaces the default cursor with a larger, more visible pointer.',
            'tooltip_feature_keyboard_navigation': 'Enhances keyboard navigation with improved visual focus indicators. This helps you navigate the website without using a mouse.',
            'tooltip_feature_text_to_speech': 'Reads selected text aloud. Simply select any text and click the Speak button that appears to have it read aloud to you.',
            'tooltip_feature_voice_navigation': 'Allows you to navigate the website using voice commands. This enables hands-free browsing through voice recognition.',
            'tooltip_feature_font_sizing': 'Adjusts the size of text on the website. Use the plus and minus buttons to increase or decrease the font size.',
            'tooltip_feature_line_height': 'Changes the space between lines of text. Increasing line height makes text more readable by adding more vertical space between lines.',
            'tooltip_feature_letter_spacing': 'Adjusts the space between letters. Increasing letter spacing can help with reading difficulties by making individual letters more distinct.',
            'tooltip_feature_text_color': 'Changes the color of all text on the website. Select a color that provides the best readability for you.',
            'tooltip_feature_bg_color': 'Changes the background color of the website. Select a background color that provides comfortable contrast with the text.',
            'tooltip_feature_tooltips': 'Enables or disables tooltips for accessibility features.',
            'tooltip_feature_enableTooltips': 'Enables or disables tooltips for accessibility features.'
        };
        
        // Get translated tooltip or fall back to default
        function getTooltipText(key) {
            return (translations[key] !== undefined) ? translations[key] : defaultTooltips[key];
        }
        
        // Apply tooltip state
        var tooltipsEnabled = activeFeatures['tooltips-enabled'] !== false; // Default is enabled
        if (!tooltipsEnabled) {
            $('body').addClass('wap-tooltip-disabled');
        } else {
            $('body').removeClass('wap-tooltip-disabled');
        }
        
        // Add tooltips to section headings
        $('.wap-accessibility-section h3').each(function() {
            var sectionId = $(this).closest('.wap-accessibility-section').attr('id');
            if (sectionId) {
                sectionId = sectionId.replace('wap-section-', '');
                var tooltipKey = sectionTooltipKeys[sectionId];
                if (tooltipKey) {
                    var tooltipText = getTooltipText(tooltipKey);
                    $(this).append('<span class="wap-section-tooltip" aria-label="' + translations.help + '">?<span class="wap-tooltip">' + tooltipText + '</span></span>');
                }
            }
        });
        
        // Add tooltips to features
        $('.wap-accessibility-feature').each(function() {
            var featureId = $(this).data('feature');
            var tooltipKey = featureTooltipKeys[featureId];
            if (tooltipKey) {
                var tooltipText = getTooltipText(tooltipKey);
                $(this).find('.wap-accessibility-feature-title').append('<span class="wap-feature-tooltip" aria-label="' + translations.help + '">?<span class="wap-tooltip">' + tooltipText + '</span></span>');
            }
        });
    }

    /**
     * Toggle tooltips
     * 
     * @param {boolean} enabled Whether tooltips should be enabled
     */
    function toggleTooltips(enabled) {
        if (enabled) {
            $('body').removeClass('wap-tooltip-disabled');
            activeFeatures['tooltips-enabled'] = true;
            addTooltips();
        } else {
            $('body').addClass('wap-tooltip-disabled');
            activeFeatures['tooltips-enabled'] = false;
        }
    }

    /**
     * Initialize
     */
    function init() {
        // Create reading guide and mask elements if they don't exist
        if (!readingGuide) {
            readingGuide = $('<div id="wap-reading-guide"></div>').appendTo('body');
        }
        
        if (!readingMask) {
            readingMask = $('<div id="wap-reading-mask"><div id="wap-reading-mask-hole"></div></div>').appendTo('body');
            readingMaskHole = $('#wap-reading-mask-hole');
        }
        
        // Add SVG icons to elements
        addSvgIcons();
        
        // Add tooltips
        if (settings.tooltipsEnabled) {
            addTooltips();
            activeFeatures['tooltips-enabled'] = true;
        } else {
            $('body').addClass('wap-tooltip-disabled');
            activeFeatures['tooltips-enabled'] = false;
        }
        
        // Set up event listeners
        setupEventListeners();
        
        // Add tooltips toggle option to dashboard
        addTooltipsOption();
        
        // Set up reading tools
        setupReadingTools();
        
        // Initialize voice features if enabled
        if (settings.enableVoiceNavigation) {
            initializeVoiceFeatures();
        }
        
        // Load saved settings if any
        loadSavedSettings();
    }
    
    /**
     * Add SVG icons to elements
     */
    function addSvgIcons() {
        // Add main accessibility icon
        $('#wap-accessibility-btn .wap-accessibility-icon').html(svgIcons.accessibility);
        
        // Add profile icons
        $('.wap-accessibility-profile[data-profile="epilepsy"] .wap-accessibility-profile-icon').html(svgIcons.epilepsy);
        $('.wap-accessibility-profile[data-profile="visually-impaired"] .wap-accessibility-profile-icon').html(svgIcons.visual);
        $('.wap-accessibility-profile[data-profile="cognitive-disability"] .wap-accessibility-profile-icon').html(svgIcons.cognitive);
        $('.wap-accessibility-profile[data-profile="adhd-friendly"] .wap-accessibility-profile-icon').html(svgIcons.adhd);
        $('.wap-accessibility-profile[data-profile="blind-users"] .wap-accessibility-profile-icon').html(svgIcons.blind);
        
        // Add feature icons
        for (var feature in svgIcons) {
            if (feature !== 'accessibility' && 
                feature !== 'epilepsy' && 
                feature !== 'visual' && 
                feature !== 'cognitive' && 
                feature !== 'adhd' && 
                feature !== 'blind') {
                $('.wap-toggle-feature[data-feature="' + feature + '"] .wap-accessibility-feature-icon').html(svgIcons[feature]);
            }
        }
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Toggle accessibility panel
        $('#wap-accessibility-btn').on('click', function(e) {
            e.preventDefault();
            toggleAccessibilityPanel();
        });
        
        // Close panel
        $('.wap-accessibility-panel-close').on('click', function() {
            closeAccessibilityPanel();
        });
        
        // Close panel when clicking outside
        $(document).on('click', function(e) {
            if (!$(e.target).closest('#wap-accessibility-panel, #wap-accessibility-btn').length) {
                closeAccessibilityPanel();
            }
        });
        
        // Prevent clicks inside panel from closing it
        $('#wap-accessibility-panel').on('click', function(e) {
            e.stopPropagation();
        });
        
        // Apply profile
        $('.wap-accessibility-profile').on('click', function() {
            var profile = $(this).data('profile');
            applyProfile(profile);
        });
        
        // Toggle features
        $('.wap-toggle-feature').on('click', function() {
            var feature = $(this).data('feature');
            toggleFeature(feature);
        });
        
        // Decrease value
        $('.wap-accessibility-decrease').on('click', function() {
            var feature = $(this).closest('.wap-range-feature').data('feature');
            decreaseValue(feature);
        });
        
        // Increase value
        $('.wap-accessibility-increase').on('click', function() {
            var feature = $(this).closest('.wap-range-feature').data('feature');
            increaseValue(feature);
        });
        
        // Apply color
        $('.wap-color-option').on('click', function() {
            var type = $(this).data('type');
            var color = $(this).data('color');
            // Map data-feature from HTML to the internal feature IDs
            var featureType = (type === 'text') ? 'text-color' : 'bg-color';
            applyColor(type, color, featureType);
        });
        
        // Dictionary search
        $('#wap-dictionary-search-button').on('click', function(e) {
            e.preventDefault();
            searchDictionary();
        });
        
        $('#wap-dictionary-search').on('keypress', function(e) {
            if (e.which === 13) {
                e.preventDefault();
                searchDictionary();
            }
        });
        
        // Reset settings - use any selector that might match the reset button
        $('#wap-accessibility-reset, .wap-reset-settings, #wap-reset-settings, .wap-accessibility-reset, .wap-accessibility-btn[data-action="reset"]').on('click', function(e) {
            e.preventDefault();
            console.log("Reset button clicked");
            resetSettings();
        });
        
        // Toggle tooltips
        $('.wap-toggle-tooltips').on('click', function() {
            var isActive = !$(this).hasClass('active');
            $(this).toggleClass('active', isActive);
            toggleTooltips(isActive);
        });
        
        // Mouse movement for reading guide and mask
        $(document).on('mousemove', function(e) {
            if ($('#wap-reading-guide').hasClass('active')) {
                $('#wap-reading-guide').css({
                    top: e.pageY,
                    width: '100%'
                });
            }
            
            if ($('#wap-reading-mask').hasClass('active')) {
                $('.wap-reading-mask-hole').css({
                    top: e.pageY - 75,
                    left: e.pageX - 100,
                    width: 200,
                    height: 150
                });
            }
        });
    }

    /**
     * Add tooltips option to dashboard
     */
    function addTooltipsOption() {
        // Create HTML for the tooltips toggle section
        var tooltipsHtml = '<div class="wap-accessibility-feature" data-feature="tooltips">' +
                           '<div class="wap-accessibility-feature-header">' +
                           '<div class="wap-accessibility-feature-title">' + 
                           (translations.tooltipsLabel || 'Help Tooltips') + 
                           '</div>' +
                           '<div class="wap-accessibility-feature-toggle">' +
                           '<label class="wap-toggle-switch">' +
                           '<input type="checkbox" class="wap-toggle-checkbox" ' + 
                           (activeFeatures['tooltips-enabled'] ? 'checked' : '') + '>' +
                           '<span class="wap-toggle-slider"></span>' +
                           '</label>' +
                           '</div>' +
                           '</div>' +
                           '</div>';
        
        // Add tooltips toggle to the dashboard in the features section
        $('#wap-section-features').append(tooltipsHtml);
        
        // Add the tooltips icon
        addIconToElement('#wap-section-features .wap-accessibility-feature[data-feature="tooltips"] .wap-accessibility-feature-title', 'enableTooltips');
        
        // Add click handler for the tooltips toggle
        $('#wap-section-features .wap-accessibility-feature[data-feature="tooltips"] .wap-toggle-checkbox').on('change', function() {
            toggleTooltips($(this).is(':checked'));
            saveSettings();
        });
    }

    /**
     * Set up reading guide and mask
     */
    function setupReadingTools() {
        // Set up mouse tracking for reading guide and mask
        $(document).on('mousemove', function(e) {
            if (activeFeatures['reading-guide'] && readingGuide) {
                readingGuide.css('top', e.pageY + 'px');
            }

            if (activeFeatures['reading-mask'] && readingMask && readingMaskHole) {
                var holeWidth = 400;
                var holeHeight = 60;
                var holeLeft = e.pageX - (holeWidth / 2);
                var holeTop = e.pageY - (holeHeight / 2);

                $('.wap-reading-mask-hole').css({
                    'width': holeWidth + 'px',
                    'height': holeHeight + 'px',
                    'top': holeTop + 'px',
                    'left': holeLeft + 'px'
                });
            }
        });
    }

    /**
     * Toggle accessibility panel
     */
    function toggleAccessibilityPanel() {
        var $accessibilityPanel = $('#wap-accessibility-panel');
        $accessibilityPanel.toggleClass('wap-hidden');
    }

    /**
     * Close accessibility panel
     */
    function closeAccessibilityPanel() {
        var $accessibilityPanel = $('#wap-accessibility-panel');
        $accessibilityPanel.addClass('wap-hidden');
    }

    /**
     * Apply accessibility profile
     *
     * @param {string} profile Profile ID
     */
    function applyProfile(profile) {
        // Reset existing profiles
        $('.wap-accessibility-profile').removeClass('active');
        
        // Activate selected profile
        $('.wap-accessibility-profile[data-profile="' + profile + '"]').addClass('active');

        // Reset all features
        resetFeatures();

        // Apply profile specific features
        switch (profile) {
            case 'epilepsy':
                toggleFeature('stop-animations', true);
                break;
            case 'visually-impaired':
                toggleFeature('font-sizing', true);
                setRangeValue('font-sizing', 30);
                toggleFeature('high-contrast', true);
                toggleFeature('highlight-links', true);
                break;
            case 'cognitive-disability':
                toggleFeature('readable-font', true);
                toggleFeature('highlight-titles', true);
                toggleFeature('line-height', true);
                setRangeValue('line-height', 50);
                break;
            case 'adhd-friendly':
                toggleFeature('reading-mask', true);
                toggleFeature('reading-guide', true);
                break;
            case 'blind-users':
                toggleFeature('text-to-speech', true);
                toggleFeature('keyboard-navigation', true);
                break;
        }

        // Save settings
        saveSettings();
    }

    /**
     * Toggle feature on/off
     *
     * @param {string} feature Feature ID
     * @param {boolean} forceState Optional. Force feature to specific state
     */
    function toggleFeature(feature, forceState) {
        // Map feature IDs from HTML to internal feature IDs
        var internalFeature = feature;
        if (feature === 'text-colors') {
            internalFeature = 'text-color';
        } else if (feature === 'background-colors') {
            internalFeature = 'bg-color';
        }
        
        var $featureEl = $('.wap-toggle-feature[data-feature="' + feature + '"]');
        var isActive = (typeof forceState !== 'undefined') ? forceState : !activeFeatures[internalFeature];
        
        // Handle conflicts between high contrast and color features
        if (feature === 'high-contrast' && isActive) {
            // If enabling high contrast, disable conflicting color features
            $('.wap-color-feature[data-feature="text-colors"]').removeClass('active');
            $('.wap-color-feature[data-feature="background-colors"]').removeClass('active');
            activeFeatures['text-color'] = false;
            activeFeatures['bg-color'] = false;
            
            // Remove any custom color styles when high contrast is enabled
            $('#wap-text-color-style, #wap-bg-color-style').remove();
            document.body.style.color = '';
            document.body.style.backgroundColor = '';
        } else if ((feature === 'text-colors' || feature === 'background-colors') && isActive) {
            // If enabling a color feature, disable high contrast
            if ($('body').hasClass('wap-high-contrast')) {
                $('.wap-toggle-feature[data-feature="high-contrast"]').removeClass('active');
                activeFeatures['high-contrast'] = false;
                $('body').removeClass('wap-high-contrast');
                $('#wap-high-contrast-style').remove();
            }
            
            // Don't deactivate the other color feature, they can work together
        }
        
        // Update active features using the internal feature ID
        activeFeatures[internalFeature] = isActive;

        // Toggle feature element class
        if (isActive) {
            $featureEl.addClass('active');
        } else {
            $featureEl.removeClass('active');
            
            // If deactivating a color feature, remove its style and reset the body style
            if (feature === 'text-colors') {
                $('#wap-text-color-style').remove();
                document.body.style.color = '';
            } else if (feature === 'background-colors') {
                $('#wap-bg-color-style').remove();
                document.body.style.backgroundColor = '';
            }
        }
        
        // Apply feature-specific actions
        applyFeature(feature, isActive);
        
        // Save settings
        saveSettings();
    }

    /**
     * Apply feature
     *
     * @param {string} feature Feature name
     * @param {boolean} isActive Whether feature is active
     */
    function applyFeature(feature, isActive) {
        // Update UI
        // For regular toggle features
        var $featureEl = $('.wap-toggle-feature[data-feature="' + feature + '"]');
        
        // Handle color features which use different selectors
        if (feature === 'text-colors' || feature === 'background-colors') {
            $featureEl = $('.wap-color-feature[data-feature="' + feature + '"]');
        }
        
        $featureEl.toggleClass('active', isActive);
        
        // Map feature IDs from HTML to internal feature IDs
        var internalFeature = feature;
        if (feature === 'text-colors') {
            internalFeature = 'text-color';
        } else if (feature === 'background-colors') {
            internalFeature = 'bg-color';
        }
        
        // Apply or remove feature using the feature name as provided in HTML
        switch(feature) {
            case 'dark-mode':
                if (isActive) {
                    // Add dark mode styles directly to head
                    var darkModeStyles = '<style id="wap-dark-mode-style">' +
                        'body.wap-dark-mode { background-color: #222 !important; color: #f5f5f5 !important; }' +
                        'body.wap-dark-mode a { color: #4da6ff !important; }' +
                        'body.wap-dark-mode h1, body.wap-dark-mode h2, body.wap-dark-mode h3, ' +
                        'body.wap-dark-mode h4, body.wap-dark-mode h5, body.wap-dark-mode h6 { color: #f5f5f5 !important; }' +
                        'body.wap-dark-mode input, body.wap-dark-mode textarea, body.wap-dark-mode select { ' +
                        'background-color: #333 !important; color: #f5f5f5 !important; border-color: #444 !important; }' +
                        '</style>';
                    
                    if ($('#wap-dark-mode-style').length) {
                        $('#wap-dark-mode-style').replaceWith(darkModeStyles);
                    } else {
                        $('head').append(darkModeStyles);
                    }
                    
                    $('body').addClass('wap-dark-mode');
                    
                    // Disable high contrast if enabled
                    if ($('body').hasClass('wap-high-contrast')) {
                        toggleFeature('high-contrast', false);
                    }
                } else {
                    $('body').removeClass('wap-dark-mode');
                    $('#wap-dark-mode-style').remove();
                }
                break;
                
            case 'high-contrast':
                if (isActive) {
                    // Add high contrast styles directly to head
                    var highContrastStyles = '<style id="wap-high-contrast-style">' +
                        'body.wap-high-contrast { background-color: #000 !important; color: #fff !important; }' +
                        'body.wap-high-contrast a { color: #ffff00 !important; text-decoration: underline !important; }' +
                        'body.wap-high-contrast button:not(.wap-color-option), body.wap-high-contrast input[type="button"], ' +
                        'body.wap-high-contrast input[type="submit"] { background-color: #fff !important; color: #000 !important; ' +
                        'border: 2px solid #fff !important; }' +
                        // Exclude color palette buttons from high contrast styling
                        'body.wap-high-contrast .wap-accessibility-color-palette .wap-color-option { border-color: #fff !important;  }' +
                        'body.wap-high-contrast .wap-accessibility-color-palette .wap-color-option:hover, ' +
                        'body.wap-high-contrast .wap-accessibility-color-palette .wap-color-option.active { border-color: #ffff00 !important; }' +
                        '</style>';
                    
                    if ($('#wap-high-contrast-style').length) {
                        $('#wap-high-contrast-style').replaceWith(highContrastStyles);
                    } else {
                        $('head').append(highContrastStyles);
                    }
                    
                    $('body').addClass('wap-high-contrast');
                    
                    // Remove any custom color styles
                    $('#wap-text-color-style, #wap-bg-color-style').remove();
                    
                    // Disable dark mode if enabled
                    if ($('body').hasClass('wap-dark-mode')) {
                        toggleFeature('dark-mode', false);
                    }
                    
                    // Update color features UI
                    $('.wap-color-feature[data-feature="text-colors"], .wap-color-feature[data-feature="background-colors"]').removeClass('active');
                    activeFeatures['text-color'] = false;
                    activeFeatures['bg-color'] = false;
                } else {
                    $('body').removeClass('wap-high-contrast');
                    $('#wap-high-contrast-style').remove();
                }
                break;
                
            // Note: 'text-colors' and 'background-colors' are handled by the applyColor function
            // Don't need to include cases for them here
                
            case 'readable-font':
            case 'dyslexia-font':
                // Handle font-related features
                applyFontFeature(feature, isActive);
                break;
                
            // Handle other toggle features with simpler implementation
            case 'text-magnifier':
                if (isActive) {
                    initTextMagnifier();
                } else {
                    destroyTextMagnifier();
                }
                break;
                
            case 'highlight-titles':
                $('body').toggleClass('wap-highlight-titles', isActive);
                break;
                
            case 'highlight-links':
                $('body').toggleClass('wap-highlight-links', isActive);
                break;
                
            case 'mute-sounds':
                if (isActive) {
                    $('audio, video').prop('muted', true);
                    // Store the original volume
                    $('audio, video').each(function() {
                        $(this).attr('data-original-volume', $(this).prop('volume'));
                        $(this).prop('volume', 0);
                    });
                } else {
                    $('audio, video').prop('muted', false);
                    // Restore the original volume
                    $('audio, video').each(function() {
                        var originalVolume = $(this).attr('data-original-volume');
                        if (originalVolume) {
                            $(this).prop('volume', originalVolume);
                        }
                    });
                }
                break;
                
            case 'hide-images':
                $('body').toggleClass('wap-hide-images', isActive);
                break;
                
            case 'reading-guide':
                if (isActive) {
                    // Create reading guide if it doesn't exist
                    if ($('#wap-reading-guide').length === 0) {
                        $('body').append('<div id="wap-reading-guide" class="wap-reading-guide"></div>');
                        $(document).on('mousemove', function(e) {
                            $('#wap-reading-guide').css({
                                top: e.pageY - 20,
                                width: '100%'
                            });
                        });
                    }
                    $('#wap-reading-guide').addClass('active');
                } else {
                    $('#wap-reading-guide').removeClass('active');
                }
                break;
                
            case 'stop-animations':
                $('body').toggleClass('wap-stop-animations', isActive);
                break;
                
            case 'reading-mask':
                if (isActive) {
                    // Create reading mask if it doesn't exist
                    if ($('#wap-reading-mask').length === 0) {
                        $('body').append('<div id="wap-reading-mask" class="wap-reading-mask"><div class="wap-reading-mask-hole"></div></div>');
                        $(document).on('mousemove', function(e) {
                            $('.wap-reading-mask-hole').css({
                                top: e.pageY - 50,
                                left: e.pageX - 100
                            });
                        });
                    }
                    $('#wap-reading-mask').addClass('active');
                } else {
                    $('#wap-reading-mask').removeClass('active');
                }
                break;
                
            case 'highlight-hover':
                $('body').toggleClass('wap-highlight-hover', isActive);
                break;
                
            case 'highlight-focus':
                $('body').toggleClass('wap-highlight-focus', isActive);
                break;
                
            case 'big-cursor':
                $('body').toggleClass('wap-big-cursor', isActive);
                if (isActive) {
                    var bigCursorStyles = '<style id="wap-big-cursor-style">' +
                        'body.wap-big-cursor, body.wap-big-cursor * { cursor: url("' + pluginUrl + 'assets/images/big-cursor.png"), auto !important; }' +
                        'body.wap-big-cursor a, body.wap-big-cursor button, body.wap-big-cursor [role="button"] { cursor: url("' + pluginUrl + 'assets/images/big-pointer.png"), pointer !important; }' +
                        '</style>';
                    
                    $('head').append(bigCursorStyles);
                } else {
                    $('#wap-big-cursor-style').remove();
                }
                break;
                
            case 'keyboard-navigation':
                if (isActive) {
                    initKeyboardNavigation();
                } else {
                    destroyKeyboardNavigation();
                }
                break;
                
            case 'text-to-speech':
                if (isActive) {
                    initTextToSpeech();
                } else {
                    destroyTextToSpeech();
                }
                break;
                
            case 'voice-navigation':
                // Handle voice navigation
                if (isActive && settings.enableVoiceNavigation) {
                    initVoiceNavigation();
                } else {
                    destroyVoiceNavigation();
                }
                break;
        }
    }

    /**
     * Apply font-related features
     *
     * @param {string} feature Feature name
     * @param {boolean} isActive Whether feature is active
     */
    function applyFontFeature(feature, isActive) {
        switch(feature) {
            case 'readable-font':
                if (isActive) {
                    // Apply readable font only to specific elements, not body by default
                    var readableFontStyles = '<style id="wap-readable-font-style">' +
                        '.wap-readable-font-active h1:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-readable-font-active h2:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-readable-font-active h3:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-readable-font-active h4:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-readable-font-active h5:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-readable-font-active h6:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-readable-font-active p:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-readable-font-active li:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-readable-font-active td:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-readable-font-active th:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-readable-font-active div:not(#wap-accessibility-panel, #wap-accessibility-panel *, .wap-accessibility-panel, .wap-accessibility-panel *), ' + 
                        '.wap-readable-font-active span:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-readable-font-active a:not(#wap-accessibility-panel *, .wap-accessibility-panel *) { ' + 
                        'font-family: Arial, sans-serif !important; }' +
                        '</style>';
                    
                    if ($('#wap-readable-font-style').length) {
                        $('#wap-readable-font-style').replaceWith(readableFontStyles);
                    } else {
                        $('head').append(readableFontStyles);
                    }
                    
                    $('body').addClass('wap-readable-font-active');
                    
                    // Disable dyslexia font if enabled
                    if ($('body').hasClass('wap-dyslexia-font-active')) {
                        toggleFeature('dyslexia-font', false);
                    }
                } else {
                    $('body').removeClass('wap-readable-font-active');
                    $('#wap-readable-font-style').remove();
                }
                break;
                
            case 'dyslexia-font':
                if (isActive) {
                    // Apply dyslexia-friendly font only to specific elements, not body by default
                    var dyslexiaFontStyles = '<style id="wap-dyslexia-font-style">' +
                        '@font-face { font-family: "OpenDyslexic"; src: url("' + pluginUrl + 'assets/fonts/OpenDyslexic-Regular.otf") format("opentype"); }' +
                        '.wap-dyslexia-font-active h1:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-dyslexia-font-active h2:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-dyslexia-font-active h3:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-dyslexia-font-active h4:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-dyslexia-font-active h5:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-dyslexia-font-active h6:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-dyslexia-font-active p:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-dyslexia-font-active li:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-dyslexia-font-active td:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-dyslexia-font-active th:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-dyslexia-font-active div:not(#wap-accessibility-panel, #wap-accessibility-panel *, .wap-accessibility-panel, .wap-accessibility-panel *), ' + 
                        '.wap-dyslexia-font-active span:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-dyslexia-font-active a:not(#wap-accessibility-panel *, .wap-accessibility-panel *) { ' + 
                        'font-family: "OpenDyslexic", sans-serif !important; }' +
                        '</style>';
                    
                    if ($('#wap-dyslexia-font-style').length) {
                        $('#wap-dyslexia-font-style').replaceWith(dyslexiaFontStyles);
                    } else {
                        $('head').append(dyslexiaFontStyles);
                    }
                    
                    $('body').addClass('wap-dyslexia-font-active');
                    
                    // Disable readable font if enabled
                    if ($('body').hasClass('wap-readable-font-active')) {
                        toggleFeature('readable-font', false);
                    }
                } else {
                    $('body').removeClass('wap-dyslexia-font-active');
                    $('#wap-dyslexia-font-style').remove();
                }
                break;
        }
    }

    /**
     * Decrease range value
     *
     * @param {string} feature Feature name
     */
    function decreaseValue(feature) {
        console.log("Decreasing value for:", feature);
        var $valueEl = $('.wap-range-feature[data-feature="' + feature + '"] .wap-accessibility-value');
        var currentText = $valueEl.text();
        var currentValue = parseInt(currentText, 10);
        
        if (isNaN(currentValue)) {
            currentValue = 0;
        }
        
        // Different step sizes for different features
        var step = 2; // Default step size (2% for font size)
        
        if (feature === 'line-height' || feature === 'letter-spacing') {
            step = 5; // 5% step for these features
        }
        
        // Calculate new value (min value is -20)
        var newValue = Math.max(currentValue - step, -20);
        
        console.log("Old value:", currentValue, "New value:", newValue);
        
        // Update UI and apply
        $valueEl.text(newValue + '%');
        $valueEl.data('value', newValue);
        
        // Apply the changes
        applyRangeValue(feature, newValue);
        
        // Update activeFeatures
        activeFeatures[feature] = newValue;
        
        // Save settings
        saveSettings();
    }

    /**
     * Increase range value
     *
     * @param {string} feature Feature name
     */
    function increaseValue(feature) {
        console.log("Increasing value for:", feature);
        var $valueEl = $('.wap-range-feature[data-feature="' + feature + '"] .wap-accessibility-value');
        var currentText = $valueEl.text();
        var currentValue = parseInt(currentText, 10);
        
        if (isNaN(currentValue)) {
            currentValue = 0;
        }
        
        // Different step sizes for different features
        var step = 2; // Default step size (2% for font size)
        
        if (feature === 'line-height' || feature === 'letter-spacing') {
            step = 5; // 5% step for these features
        }
        
        // Calculate new value (max value is 50)
        var newValue = Math.min(currentValue + step, 50);
        
        console.log("Old value:", currentValue, "New value:", newValue);
        
        // Update UI and apply
        $valueEl.text(newValue + '%');
        $valueEl.data('value', newValue);
        
        // Apply the changes
        applyRangeValue(feature, newValue);
        
        // Update activeFeatures
        activeFeatures[feature] = newValue;
        
        // Save settings
        saveSettings();
    }

    /**
     * Set range value
     *
     * @param {string} feature Feature ID
     * @param {number} value Value to set
     */
    function setRangeValue(feature, value) {
        var $valueElement = $('.wap-range-feature[data-feature="' + feature + '"] .wap-accessibility-value');
        var displayValue = (value > 0) ? '+' + value + '%' : (value === 0) ? translations.default : value + '%';
        
        // Update display value
        $valueElement.text(displayValue);
        $valueElement.data('value', value);
        
        // Apply feature-specific value
        applyRangeValue(feature, value);
        
        // Save settings
        saveSettings();
    }

    /**
     * Apply range value
     *
     * @param {string} feature Feature name
     * @param {number} value Value to apply
     */
    function applyRangeValue(feature, value) {
        console.log("Applying range value:", feature, value);
        
        // Handle display in UI differently than actual application
        var displayValue = (value > 0) ? '+' + value + '%' : (value === 0) ? translations.default : value + '%';
        
        // Update display value
        var $valueEl = $('.wap-range-feature[data-feature="' + feature + '"] .wap-accessibility-value');
        $valueEl.text(displayValue);
        $valueEl.data('value', value);
        
        // Apply value based on feature
        switch(feature) {
            case 'font-sizing':
                if (value != 0) {
                    // Apply font size using specific selectors rather than body
                    // Explicitly exclude all panel elements from being affected
                    var fontSizeStyle = '<style id="wap-font-size-style">' +
                        '.wap-font-size-changed h1:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-font-size-changed h2:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-font-size-changed h3:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-font-size-changed h4:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-font-size-changed h5:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-font-size-changed h6:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-font-size-changed p:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-font-size-changed li:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-font-size-changed td:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-font-size-changed th:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-font-size-changed div:not(#wap-accessibility-panel, #wap-accessibility-panel *, .wap-accessibility-panel, .wap-accessibility-panel *), ' + 
                        '.wap-font-size-changed span:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-font-size-changed a:not(#wap-accessibility-panel *, .wap-accessibility-panel *) { ' + 
                        'font-size: calc(1em * ' + (1 + parseInt(value)/100) + ') !important; ' +
                        '}';
                        
                    if ($('#wap-font-size-style').length) {
                        $('#wap-font-size-style').replaceWith(fontSizeStyle);
                    } else {
                        $('head').append(fontSizeStyle);
                    }
                    
                    $('body').addClass('wap-font-size-changed');
                    console.log("Applied font size:", value);
                } else {
                    $('#wap-font-size-style').remove();
                    $('body').removeClass('wap-font-size-changed');
                    console.log("Removed font size style");
                }
                break;
                
            case 'line-height':
                if (value != 0) {
                    // Apply line height using specific selectors
                    // Explicitly exclude all panel elements
                    var lineHeightStyle = '<style id="wap-line-height-style">' +
                        '.wap-line-height-changed p:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-line-height-changed li:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-line-height-changed td:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-line-height-changed th:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-line-height-changed div:not(#wap-accessibility-panel, #wap-accessibility-panel *, .wap-accessibility-panel, .wap-accessibility-panel *), ' + 
                        '.wap-line-height-changed span:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-line-height-changed a:not(#wap-accessibility-panel *, .wap-accessibility-panel *) { ' + 
                        'line-height: calc(1.5 * ' + (1 + parseInt(value)/100) + ') !important; ' +
                        '}';
                        
                    if ($('#wap-line-height-style').length) {
                        $('#wap-line-height-style').replaceWith(lineHeightStyle);
                    } else {
                        $('head').append(lineHeightStyle);
                    }
                    
                    $('body').addClass('wap-line-height-changed');
                    console.log("Applied line height:", value);
                } else {
                    $('#wap-line-height-style').remove();
                    $('body').removeClass('wap-line-height-changed');
                    console.log("Removed line height style");
                }
                break;
                
            case 'letter-spacing':
                if (value != 0) {
                    // Apply letter spacing using specific selectors
                    // Explicitly exclude all panel elements
                    var letterSpacingStyle = '<style id="wap-letter-spacing-style">' +
                        '.wap-letter-spacing-changed p:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-letter-spacing-changed li:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-letter-spacing-changed td:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-letter-spacing-changed th:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-letter-spacing-changed div:not(#wap-accessibility-panel, #wap-accessibility-panel *, .wap-accessibility-panel, .wap-accessibility-panel *), ' + 
                        '.wap-letter-spacing-changed span:not(#wap-accessibility-panel *, .wap-accessibility-panel *), ' + 
                        '.wap-letter-spacing-changed a:not(#wap-accessibility-panel *, .wap-accessibility-panel *) { ' + 
                        'letter-spacing: ' + (parseInt(value)/10) + 'px !important; ' +
                        '}';
                        
                    if ($('#wap-letter-spacing-style').length) {
                        $('#wap-letter-spacing-style').replaceWith(letterSpacingStyle);
                    } else {
                        $('head').append(letterSpacingStyle);
                    }
                    
                    $('body').addClass('wap-letter-spacing-changed');
                    console.log("Applied letter spacing:", value);
                } else {
                    $('#wap-letter-spacing-style').remove();
                    $('body').removeClass('wap-letter-spacing-changed');
                    console.log("Removed letter spacing style");
                }
                break;
        }
    }

    /**
     * Apply color
     *
     * @param {string} type Color type (text or background)
     * @param {string} color Color value
     * @param {string} featureType Internal feature ID (text-color or bg-color)
     */
    function applyColor(type, color, featureType) {
        // First remove any existing color styles to prevent stacking
        var styleId = 'wap-' + type + '-color-style';
        var cssProperty = type === 'text' ? 'color' : 'background-color';
        
        console.log("Applying " + type + " color: " + color + " for feature " + featureType);
        
        // If high contrast is active, disable it first
        if ($('body').hasClass('wap-high-contrast')) {
            // Use a direct approach instead of toggleFeature to avoid circular references
            $('body').removeClass('wap-high-contrast');
            $('#wap-high-contrast-style').remove();
            $('.wap-toggle-feature[data-feature="high-contrast"]').removeClass('active');
            activeFeatures['high-contrast'] = false;
        }
        
        // Store the current value of the other color type to ensure it's preserved
        var otherType = type === 'text' ? 'background' : 'text';
        var otherFeatureId = type === 'text' ? 'bg-color' : 'text-color';
        var otherStyleId = 'wap-' + otherType + '-color-style';
        var otherCssProperty = type === 'text' ? 'background-color' : 'color';
        var otherColor = activeFeatures[otherFeatureId + '-value'];
        
        // Remove existing style element for current color type
        $('#' + styleId).remove();
        
        // Apply color directly to body for immediate effect
        document.body.style[cssProperty] = color;
        
        // Create style elements for both color types to ensure they work together
        var customStyle = '<style id="' + styleId + '">' +
            'body:not(.wap-high-contrast) { ' + cssProperty + ': ' + color + ' !important; }' +
            '</style>';
        
        $('head').append(customStyle);
        
        // If the other color type is active, ensure it's applied correctly in combination
        if (activeFeatures[otherFeatureId] && otherColor) {
            // Create/update style for combined colors
            if ($('#' + otherStyleId).length) {
                $('#' + otherStyleId).remove();
            }
            
            var otherStyle = '<style id="' + otherStyleId + '">' +
                'body:not(.wap-high-contrast) { ' + otherCssProperty + ': ' + otherColor + ' !important; }' +
                '</style>';
            
            $('head').append(otherStyle);
            document.body.style[otherCssProperty] = otherColor;
        }
        
        // Update color swatch selection UI
        $('.wap-color-option[data-type="' + type + '"]').removeClass('active');
        $('.wap-color-option[data-type="' + type + '"][data-color="' + color + '"]').addClass('active');
        
        // Activate the feature in UI - add active class to the color feature container
        var featureSelector = '';
        if (type === 'text') {
            featureSelector = '.wap-color-feature[data-feature="text-colors"]';
        } else {
            featureSelector = '.wap-color-feature[data-feature="background-colors"]';
        }
        
        // Add active class to the feature in UI
        $(featureSelector).addClass('active');
        
        // Update active features with the internal feature ID
        activeFeatures[featureType] = true;
        activeFeatures[featureType + '-value'] = color;
        
        // Save settings
        saveSettings();
    }

    /**
     * Search dictionary
     */
    function searchDictionary() {
        var query = $('#wap-dictionary-search').val().trim();
        var $results = $('#wap-dictionary-results');
        
        if (query.length < 2) {
            return;
        }
        
        // Show loading
        $results.html('<p>' + translations.loading + '...</p>').show();
        
        // Fetch from Wikipedia API
        $.ajax({
            url: 'https://en.wikipedia.org/w/api.php',
            data: {
                action: 'query',
                list: 'search',
                srsearch: query,
                format: 'json',
                utf8: 1,
                srlimit: 3
            },
            dataType: 'jsonp',
            success: function(data) {
                if (data.query.search.length > 0) {
                    var resultsHtml = '<h4>' + translations.searchResults + '</h4><ul>';
                    
                    for (var i = 0; i < data.query.search.length; i++) {
                        var item = data.query.search[i];
                        var title = item.title;
                        var snippet = item.snippet;
                        var url = 'https://en.wikipedia.org/wiki/' + encodeURIComponent(title.replace(/ /g, '_'));
                        
                        resultsHtml += '<li><a href="' + url + '" target="_blank">' + title + '</a><p>' + snippet + '...</p></li>';
                    }
                    
                    resultsHtml += '</ul>';
                    $results.html(resultsHtml).addClass('active');
                } else {
                    $results.html('<p>' + translations.noResults + '</p>').addClass('active');
                }
            },
            error: function() {
                $results.html('<p>Error fetching results</p>').addClass('active');
            }
        });
    }

    /**
     * Initialize text magnifier
     */
    function initTextMagnifier() {
        var magnifier = $('<div id="wap-text-magnifier"></div>');
        magnifier.css({
            'position': 'absolute',
            'background': 'white',
            'border': '1px solid #ccc',
            'border-radius': '5px',
            'padding': '5px',
            'font-size': '24px',
            'z-index': '99999',
            'display': 'none',
            'pointer-events': 'none',
            'box-shadow': '0 2px 5px rgba(0,0,0,0.2)'
        });
        
        $body.append(magnifier);
        
        $('p, h1, h2, h3, h4, h5, h6, a, li, span, div').on('mouseenter.magnifier', function() {
            var text = $(this).text().trim();
            if (text) {
                magnifier.text(text).show();
            }
        }).on('mouseleave.magnifier', function() {
            magnifier.hide();
        }).on('mousemove.magnifier', function(e) {
            magnifier.css({
                'top': (e.pageY + 20) + 'px',
                'left': (e.pageX + 20) + 'px'
            });
        });
    }

    /**
     * Destroy text magnifier
     */
    function destroyTextMagnifier() {
        $('#wap-text-magnifier').remove();
        $('p, h1, h2, h3, h4, h5, h6, a, li, span, div').off('.magnifier');
    }

    /**
     * Initialize keyboard navigation
     */
    function initKeyboardNavigation() {
        $('a, button, input, select, textarea').on('focus.keyboardnav', function() {
            $(this).css('outline', '3px solid blue');
        }).on('blur.keyboardnav', function() {
            $(this).css('outline', '');
        });
        
        $(document).on('keydown.keyboardnav', function(e) {
            if (e.key === 'Tab') {
                // Add visual indicator for tab navigation
                $body.addClass('wap-keyboard-nav-active');
            }
        });
    }

    /**
     * Destroy keyboard navigation
     */
    function destroyKeyboardNavigation() {
        $('a, button, input, select, textarea').off('.keyboardnav');
        $(document).off('.keyboardnav');
        $body.removeClass('wap-keyboard-nav-active');
    }

    /**
     * Initialize text to speech
     */
    function initTextToSpeech() {
        // Check if browser supports speech synthesis
        if ('speechSynthesis' in window) {
            // Create overlay button
            var speakButton = $('<button>', {
                'id': 'wap-speak-button',
                'text': 'Speak',
                'aria-label': 'Speak selected text'
            }).css({
                'position': 'fixed',
                'bottom': '20px',
                'right': '20px',
                'z-index': '99999',
                'background': '#2271b1',
                'color': 'white',
                'border': 'none',
                'border-radius': '5px',
                'padding': '10px 15px',
                'display': 'none',
                'cursor': 'pointer'
            });
            
            $body.append(speakButton);
            
            // Listen for text selection
            $(document).on('mouseup.texttospeech', function() {
                var selection = window.getSelection();
                var text = selection.toString().trim();
                
                if (text.length > 0) {
                    speakButton.show();
                    
                    // Position button near selection
                    var range = selection.getRangeAt(0);
                    var rect = range.getBoundingClientRect();
                    speakButton.css({
                        'top': (window.scrollY + rect.bottom + 10) + 'px',
                        'left': (window.scrollX + rect.left) + 'px'
                    });
                } else {
                    speakButton.hide();
                }
            });
            
            // Speak button click
            speakButton.on('click', function() {
                var text = window.getSelection().toString().trim();
                if (text.length > 0) {
                    speakText(text);
                    speakButton.hide();
                }
            });
        }
    }

    /**
     * Speak text using speech synthesis
     *
     * @param {string} text Text to speak
     */
    function speakText(text) {
        if ('speechSynthesis' in window) {
            // Stop any current speech
            window.speechSynthesis.cancel();
            
            // Create new speech synthesis utterance
            var utterance = new SpeechSynthesisUtterance(text);
            
            // Set language
            utterance.lang = settings.defaultLanguage || 'en-US';
            
            // Speak
            window.speechSynthesis.speak(utterance);
        }
    }

    /**
     * Destroy text to speech
     */
    function destroyTextToSpeech() {
        $('#wap-speak-button').remove();
        $(document).off('.texttospeech');
        
        // Stop any current speech
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }

    /**
     * Initialize voice features if available
     */
    function initializeVoiceFeatures() {
        if (settings.enableVoiceNavigation) {
            // Voice navigation is enabled but will be initialized only when toggled on
        }
    }

    /**
     * Initialize voice navigation
     */
    function initVoiceNavigation() {
        // Check if browser supports speech recognition
        if ('webkitSpeechRecognition' in window) {
            var recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = settings.defaultLanguage || 'en-US';
            
            // Create listening indicator
            var listeningIndicator = $('<div>', {
                'id': 'wap-listening-indicator',
                'text': 'Listening...'
            }).css({
                'position': 'fixed',
                'top': '60px',
                'right': '20px',
                'background': 'rgba(0,0,0,0.7)',
                'color': 'white',
                'padding': '10px 15px',
                'border-radius': '5px',
                'z-index': '99999',
                'display': 'none'
            });
            
            $body.append(listeningIndicator);
            
            // Start listening
            recognition.start();
            listeningIndicator.show();
            
            // Speech results
            recognition.onresult = function(event) {
                var transcript = '';
                for (var i = event.resultIndex; i < event.results.length; ++i) {
                    transcript += event.results[i][0].transcript;
                }
                
                // Process voice commands
                processVoiceCommand(transcript.toLowerCase().trim());
            };
            
            // Handle errors
            recognition.onerror = function() {
                listeningIndicator.hide();
            };
            
            // Save recognition instance
            window.wapSpeechRecognition = recognition;
        } else {
            alert('Your browser does not support voice recognition.');
        }
    }

    /**
     * Process voice command
     *
     * @param {string} command Command text
     */
    function processVoiceCommand(command) {
        // Navigation commands
        if (command.includes('go to')) {
            var page = command.replace('go to', '').trim();
            navigateByVoice(page);
        }
        
        // Accessibility commands
        if (command.includes('enable dark mode')) {
            toggleFeature('dark-mode', true);
        }
        
        if (command.includes('disable dark mode')) {
            toggleFeature('dark-mode', false);
        }
        
        if (command.includes('increase font size')) {
            increaseValue('font-sizing');
        }
        
        if (command.includes('decrease font size')) {
            decreaseValue('font-sizing');
        }
        
        // Search command
        if (command.includes('search for')) {
            var query = command.replace('search for', '').trim();
            if (query) {
                window.location.href = '/search?q=' + encodeURIComponent(query);
            }
        }
    }

    /**
     * Navigate by voice command
     *
     * @param {string} target Target page name
     */
    function navigateByVoice(target) {
        // Find links that match the target
        var $links = $('a').filter(function() {
            var text = $(this).text().toLowerCase();
            return text.includes(target);
        });
        
        if ($links.length > 0) {
            // Navigate to the first matching link
            window.location.href = $links.first().attr('href');
        }
    }

    /**
     * Destroy voice navigation
     */
    function destroyVoiceNavigation() {
        // Stop speech recognition
        if (window.wapSpeechRecognition) {
            window.wapSpeechRecognition.stop();
            delete window.wapSpeechRecognition;
        }
        
        // Remove listening indicator
        $('#wap-listening-indicator').remove();
    }

    /**
     * Load saved settings
     */
    function loadSavedSettings() {
        var savedSettings = localStorage.getItem('wap_accessibility_settings');
        
        if (savedSettings) {
            try {
                var settings = JSON.parse(savedSettings);
                
                // Apply active features
                activeFeatures = settings.features || {};
                
                // Apply each active feature
                for (var feature in activeFeatures) {
                    if (activeFeatures[feature] === true) {
                        toggleFeature(feature, true);
                    }
                }
                
                // Apply range values
                if (settings.rangeValues) {
                    for (var feature in settings.rangeValues) {
                        setRangeValue(feature, settings.rangeValues[feature]);
                    }
                }
                
                // Apply colors
                if (settings.colors) {
                    if (settings.colors.text) {
                        // Store in activeFeatures with proper naming
                        activeFeatures['text-color'] = true;
                        activeFeatures['text-color-value'] = settings.colors.text;
                        applyColor('text', settings.colors.text, 'text-color');
                    }
                    if (settings.colors.background) {
                        // Store in activeFeatures with proper naming
                        activeFeatures['bg-color'] = true;
                        activeFeatures['bg-color-value'] = settings.colors.background;
                        applyColor('background', settings.colors.background, 'bg-color');
                    }
                }
                
                // Apply active profile
                if (settings.activeProfile) {
                    $('.wap-accessibility-profile[data-profile="' + settings.activeProfile + '"]').addClass('active');
                }
            } catch (e) {
                console.error('Error loading accessibility settings:', e);
            }
        }
    }

    /**
     * Save settings
     */
    function saveSettings() {
        // Get range values
        var rangeValues = {};
        $('.wap-range-feature .wap-accessibility-value').each(function() {
            var feature = $(this).closest('.wap-range-feature').data('feature');
            var value = parseInt($(this).data('value'), 10);
            rangeValues[feature] = value;
        });
        
        // Get colors
        var colors = {};
        if (activeFeatures['text-color']) {
            colors.text = activeFeatures['text-color-value'];
        }
        if (activeFeatures['bg-color']) {
            colors.background = activeFeatures['bg-color-value'];
        }
        
        // Get active profile
        var activeProfile = $('.wap-accessibility-profile.active').data('profile');
        
        // Save settings to localStorage
        var settings = {
            features: activeFeatures,
            rangeValues: rangeValues,
            colors: colors,
            activeProfile: activeProfile
        };
        
        localStorage.setItem('wap_accessibility_settings', JSON.stringify(settings));
    }

    /**
     * Reset features
     */
    function resetFeatures() {
        console.log("Resetting features...");
        
        // Reset feature toggles
        $('.wap-toggle-feature').removeClass('active');
        
        // Remove body classes
        $body.removeClass(function(index, className) {
            return (className.match(/(^|\s)wap-\S+/g) || []).join(' ');
        });
        
        // Remove all injected style elements (be thorough with variations)
        $('#wap-text-color-style, #wap-bg-color-style, #wap-background-color-style, #wap-color-style, #wap-dark-mode-style, #wap-high-contrast-style, #wap-font-size-style, #wap-line-height-style, #wap-letter-spacing-style, #wap-big-cursor-style').remove();
        console.log("Removed style elements in resetFeatures");
        
        // Reset body inline styles explicitly
        $body.attr('style', '');
        document.body.style.backgroundColor = '';
        document.body.style.color = '';
        console.log("Reset body styles in resetFeatures");
        
        // Reset inline styles with jQuery too for thoroughness
        $body.css({
            'color': '',
            'background-color': '',
            'background': '',
            'font-size': '',
            'line-height': '',
            'letter-spacing': ''
        });
        
        // Reset specific features
        destroyTextMagnifier();
        destroyKeyboardNavigation();
        destroyTextToSpeech();
        destroyVoiceNavigation();
        
        // Hide reading guide and mask
        $('.wap-reading-guide').removeClass('active');
        $('.wap-reading-mask').removeClass('active');
    }

    /**
     * This is a last resort cleanup function for background colors
     */
    function forceCleanupBackgroundColor() {
        // 1. Clear inline styles
        document.body.style.backgroundColor = '';
        $('body').css('background-color', '');
        $('body').css('background', '');
        
        // 2. Remove style elements
        $('#wap-bg-color-style, #wap-background-color-style').remove();
        
        // 3. Create a style that enforces no background color
        var cleanupStyle = '<style id="wap-bg-cleanup-style">' +
            'body:not(.wap-high-contrast):not(.wap-dark-mode) { background-color: initial !important; }' +
            '</style>';
        
        $('head').append(cleanupStyle);
        
        // 4. Remove this cleanup style after a delay
        setTimeout(function() {
            $('#wap-bg-cleanup-style').remove();
        }, 100);
        
        console.log("Forced background color cleanup");
    }

    /**
     * Reset settings
     */
    function resetSettings() {
        console.log("RESETTING ALL SETTINGS");
        
        // Clear localStorage
        localStorage.removeItem('wap_accessibility_settings');
        
        // Explicitly remove all color styles first
        $('#wap-text-color-style, #wap-bg-color-style, #wap-background-color-style, #wap-dark-mode-style, #wap-high-contrast-style').remove();
        console.log("Removed style elements");
        
        // Directly clear body styles
        document.body.style.backgroundColor = '';
        document.body.style.color = '';
        console.log("Cleared inline body styles");
        
        // Reset features
        resetFeatures();
        
        // Reset profiles
        $('.wap-accessibility-profile').removeClass('active');
        
        // Reset range values
        $('.wap-range-feature .wap-accessibility-value').each(function() {
            $(this).text(translations.default).data('value', 0);
        });
        
        // Reset all color options (remove active class)
        $('.wap-color-option').removeClass('active');
        console.log("Removed color option active classes");
        
        // EXPLICITLY handle background color reset since it's problematic
        $('body').css('background-color', '');
        $('#wap-background-color-style, #wap-bg-color-style').remove();
        $('.wap-toggle-feature[data-feature="bg-color"]').removeClass('active');
        console.log("Extra background color reset steps done");
        
        // Reset activeFeatures object (create a fresh empty object)
        activeFeatures = {};
        
        // Save empty settings
        saveSettings();
        
        // Force browser refresh of the styles
        setTimeout(function() {
            document.body.style.backgroundColor = '';
            document.body.style.color = '';
            var forceRedraw = document.body.offsetHeight;
            console.log("Forced style refresh");
            console.log("Current background color:", window.getComputedStyle(document.body).backgroundColor);
            
            // Call the special cleanup function after a short delay
            forceCleanupBackgroundColor();
        }, 50);
    }

    // Initialize on document ready
    $(document).ready(function() {
        init();
    });

})(jQuery); 