/**
 * Admin JavaScript for Website Accessibility Plugin
 */
(function($) {
    'use strict';

    // Initialize tabs
    function initTabs() {
        // Show the first tab by default
        $('.wap-tab-content:first').addClass('active');
        $('.wap-tab-link:first').addClass('active');

        // Handle tab clicks
        $('.wap-tab-link').on('click', function(e) {
            e.preventDefault();
            var tabId = $(this).data('tab');
            
            // Hide all tabs and show the selected one
            $('.wap-tab-content').removeClass('active');
            $('#' + tabId).addClass('active');
            
            // Update tab link active states
            $('.wap-tab-link').removeClass('active');
            $(this).addClass('active');

            // Save the active tab to localStorage
            localStorage.setItem('wap_active_tab', tabId);
        });

        // Restore active tab from localStorage
        var activeTab = localStorage.getItem('wap_active_tab');
        if (activeTab) {
            $('.wap-tab-link[data-tab="' + activeTab + '"]').trigger('click');
        }
    }

    // Initialize color pickers
    function initColorPickers() {
        $('.wap-color-picker').wpColorPicker({
            change: function(event, ui) {
                var hexColor = ui.color.toString();
                $(this).closest('.wap-color-field').find('.wap-color-preview').css('background-color', hexColor);
            }
        });

        // Initialize color preview
        $('.wap-color-picker').each(function() {
            var color = $(this).val();
            $(this).closest('.wap-color-field').find('.wap-color-preview').css('background-color', color);
        });
    }

    // Toggle feature sections based on settings
    function initFeatureSections() {
        // Show/hide Google API Key field based on voice navigation and text-to-speech
        function toggleGoogleApiField() {
            var voiceEnabled = $('input[name="website_accessibility_options[enable_voice_navigation]"]').is(':checked');
            var ttsEnabled = $('input[name="website_accessibility_options[enable_text_to_speech]"]').is(':checked');
            var googleApiField = $('.wap-form-field-google-api-key');
            
            if (voiceEnabled || ttsEnabled) {
                googleApiField.show();
            } else {
                googleApiField.hide();
            }
        }

        // Initialize state
        toggleGoogleApiField();

        // Watch for changes
        $('input[name="website_accessibility_options[enable_voice_navigation]"], input[name="website_accessibility_options[enable_text_to_speech]"]').on('change', function() {
            toggleGoogleApiField();
        });
    }

    // Media uploader for image fields
    function initMediaUploader() {
        var file_frame;
        var wp_media_post_id = wp.media.model.settings.post.id;
        var set_to_post_id = 0;

        $('.wap-upload-button').on('click', function(e) {
            e.preventDefault();

            var targetInputId = $(this).data('target');
            
            // If the media frame already exists, reopen it.
            if (file_frame) {
                file_frame.uploader.uploader.param('post_id', set_to_post_id);
                file_frame.open();
                return;
            }

            // Create the media frame.
            file_frame = wp.media.frames.file_frame = wp.media({
                title: 'Select or Upload Media',
                button: {
                    text: 'Use this Media'
                },
                multiple: false
            });

            // When an image is selected, run a callback.
            file_frame.on('select', function() {
                var attachment = file_frame.state().get('selection').first().toJSON();
                $('#' + targetInputId).val(attachment.url);
                
                // Add preview image
                var preview = '<div class="wap-image-preview"><img src="' + attachment.url + '" alt=""></div>';
                $('#' + targetInputId).parent().find('.wap-image-preview').remove();
                $('#' + targetInputId).parent().append(preview);
                
                // Restore the main post ID
                wp.media.model.settings.post.id = wp_media_post_id;
            });

            // Open the modal
            file_frame.open();
        });

        // Restore the main ID when the add media button is pressed
        $('a.add_media').on('click', function() {
            wp.media.model.settings.post.id = wp_media_post_id;
        });
    }

    // Toggle dependent fields based on selections
    function initDependentFields() {
        // Show custom icon field only when custom icon is selected
        function toggleCustomIconField() {
            var iconType = $('select[name="website_accessibility_options[button_icon]"]').val();
            var customIconField = $('.wap-form-field-custom-icon');
            
            if (iconType === 'custom') {
                customIconField.show();
            } else {
                customIconField.hide();
            }
        }

        // Initialize state
        toggleCustomIconField();

        // Watch for changes
        $('select[name="website_accessibility_options[button_icon]"]').on('change', function() {
            toggleCustomIconField();
        });
    }

    // Feature toggles animation
    function initFeatureToggles() {
        $('.wap-toggle-switch input').on('change', function() {
            var checked = $(this).is(':checked');
            var featureItem = $(this).closest('.wap-feature-item');
            
            if (checked) {
                featureItem.addClass('active');
            } else {
                featureItem.removeClass('active');
            }
        });

        // Initialize states
        $('.wap-toggle-switch input').each(function() {
            if ($(this).is(':checked')) {
                $(this).closest('.wap-feature-item').addClass('active');
            }
        });
    }

    // Save form with AJAX
    function initAjaxSave() {
        $('.wap-settings-form').on('submit', function(e) {
            e.preventDefault();
            
            var $form = $(this);
            var $submitButton = $form.find('.wap-save-button');
            var originalText = $submitButton.text();
            
            $submitButton.text('Saving...').prop('disabled', true);
            
            var formData = $form.serialize();
            
            // Log form data for debugging
            console.log('Form Data:', formData);
            
            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: formData + '&action=save_website_accessibility_settings',
                success: function(response) {
                    console.log('Response:', response);
                    if (response.success) {
                        $submitButton.text('Saved!');
                        setTimeout(function() {
                            $submitButton.text(originalText).prop('disabled', false);
                        }, 1500);
                    } else {
                        $submitButton.text('Error').prop('disabled', false);
                        alert('There was an error saving the settings: ' + (response.data || 'Unknown error'));
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error('AJAX Error:', textStatus, errorThrown);
                    $submitButton.text('Error').prop('disabled', false);
                    alert('There was an error saving the settings: ' + textStatus);
                }
            });
        });
    }

    // Initialize on document ready
    $(document).ready(function() {
        initTabs();
        initColorPickers();
        initFeatureSections();
        initMediaUploader();
        initDependentFields();
        initFeatureToggles();
        initAjaxSave();
    });

})(jQuery); 