/**
 * Voice Navigation JavaScript for Website Accessibility Plugin
 */
(function($) {
    'use strict';

    // Variables
    var synth = window.speechSynthesis;
    var voices = [];
    var settings = websiteAccessibility.settings;
    var currentLanguage = settings.defaultLanguage || 'en-US';
    var voiceCommands = {
        'open': {
            action: openPanel,
            description: 'Open accessibility panel'
        },
        'close': {
            action: closePanel,
            description: 'Close accessibility panel'
        },
        'increase font': {
            action: increaseFontSize,
            description: 'Increase font size'
        },
        'decrease font': {
            action: decreaseFontSize,
            description: 'Decrease font size'
        },
        'dark mode': {
            action: toggleDarkMode,
            description: 'Toggle dark mode'
        },
        'high contrast': {
            action: toggleHighContrast,
            description: 'Toggle high contrast'
        },
        'read page': {
            action: readPageContent,
            description: 'Read page content'
        },
        'stop reading': {
            action: stopReading,
            description: 'Stop reading'
        },
        'help': {
            action: showVoiceHelp,
            description: 'Show voice commands help'
        }
    };

    /**
     * Initialize voice navigation
     */
    function init() {
        // Load available voices
        loadVoices();

        // Initialize voice recognition if enabled
        if (settings.enableVoiceNavigation) {
            initVoiceRecognition();
        }

        // Add voice help section to panel
        addVoiceHelpSection();
    }

    /**
     * Load available voices
     */
    function loadVoices() {
        // Wait for voices to be loaded
        if ('onvoiceschanged' in synth) {
            synth.onvoiceschanged = function() {
                voices = synth.getVoices();
            };
        } else {
            voices = synth.getVoices();
        }
    }

    /**
     * Initialize voice recognition
     */
    function initVoiceRecognition() {
        // Check if browser supports speech recognition
        if (!('webkitSpeechRecognition' in window)) {
            console.error('Browser does not support speech recognition');
            return;
        }

        // Create recognition object
        var recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = currentLanguage;

        // Voice command listener
        recognition.onresult = function(event) {
            var command = event.results[event.resultIndex][0].transcript.toLowerCase().trim();
            processCommand(command);
        };

        // Handle errors
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
        };

        // Start listening
        try {
            recognition.start();
            console.log('Voice recognition started');
            
            // Create listening indicator
            var $indicator = $('<div id="wap-voice-indicator" aria-hidden="true">🎤</div>')
                .css({
                    position: 'fixed',
                    bottom: '20px',
                    left: '20px',
                    background: '#2271b1',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    zIndex: 99999,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    cursor: 'pointer'
                })
                .appendTo('body');
                
            // Toggle recognition on indicator click
            $indicator.on('click', function() {
                if ($(this).hasClass('wap-paused')) {
                    recognition.start();
                    $(this).removeClass('wap-paused')
                        .css('background', '#2271b1');
                } else {
                    recognition.stop();
                    $(this).addClass('wap-paused')
                        .css('background', '#999');
                }
            });
            
            // Add tooltip
            $indicator.attr('title', 'Voice Recognition Active (Click to toggle)');
        } catch (e) {
            console.error('Could not start voice recognition:', e);
        }

        // Store recognition object
        window.wapVoiceRecognition = recognition;
    }

    /**
     * Process voice command
     *
     * @param {string} command User voice command
     */
    function processCommand(command) {
        console.log('Voice command:', command);

        // Check for matching commands
        for (var key in voiceCommands) {
            if (command.includes(key)) {
                voiceCommands[key].action();
                
                // Provide audible feedback
                speakFeedback('Command: ' + key);
                
                return;
            }
        }

        // Navigation commands
        if (command.includes('go to')) {
            var target = command.replace('go to', '').trim();
            navigateByVoice(target);
            return;
        }

        // Search commands
        if (command.includes('search for')) {
            var query = command.replace('search for', '').trim();
            searchByVoice(query);
            return;
        }

        // Link interaction
        if (command.includes('click on')) {
            var linkText = command.replace('click on', '').trim();
            clickLinkByVoice(linkText);
            return;
        }
    }

    /**
     * Speak feedback to the user
     *
     * @param {string} text Text to speak
     */
    function speakFeedback(text) {
        if (!synth) return;
        
        // Create utterance
        var utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = currentLanguage;
        
        // Find appropriate voice
        if (voices.length > 0) {
            for (var i = 0; i < voices.length; i++) {
                if (voices[i].lang.indexOf(currentLanguage.split('-')[0]) !== -1) {
                    utterance.voice = voices[i];
                    break;
                }
            }
        }
        
        // Speak feedback
        synth.speak(utterance);
    }

    /**
     * Navigate by voice
     *
     * @param {string} target Page to navigate to
     */
    function navigateByVoice(target) {
        var found = false;
        
        // Look for links matching the target text
        $('a').each(function() {
            var linkText = $(this).text().toLowerCase();
            if (linkText.includes(target)) {
                // Provide feedback
                speakFeedback('Navigating to ' + $(this).text());
                
                // Navigate after a short delay
                setTimeout(function() {
                    window.location.href = $(this).attr('href');
                }.bind(this), 1500);
                
                found = true;
                return false; // break loop
            }
        });
        
        if (!found) {
            speakFeedback('Could not find a link to ' + target);
        }
    }

    /**
     * Search by voice
     *
     * @param {string} query Search query
     */
    function searchByVoice(query) {
        // Look for search form
        var $searchForm = $('form[role="search"], form.search-form');
        
        if ($searchForm.length > 0) {
            var $searchInput = $searchForm.find('input[type="search"], input[type="text"]').first();
            
            if ($searchInput.length > 0) {
                // Fill in the search input
                $searchInput.val(query);
                
                // Provide feedback
                speakFeedback('Searching for ' + query);
                
                // Submit the form after a short delay
                setTimeout(function() {
                    $searchForm.submit();
                }, 1500);
            } else {
                speakFeedback('Could not find search input');
            }
        } else {
            speakFeedback('Could not find search form');
        }
    }

    /**
     * Click link by voice
     *
     * @param {string} linkText Link text to click
     */
    function clickLinkByVoice(linkText) {
        var found = false;
        
        // Look for links matching the text
        $('a, button').each(function() {
            var text = $(this).text().toLowerCase();
            if (text.includes(linkText)) {
                // Provide feedback
                speakFeedback('Clicking on ' + $(this).text());
                
                // Highlight and click after a short delay
                $(this).css('outline', '2px solid blue');
                
                setTimeout(function() {
                    $(this).trigger('click');
                    $(this).css('outline', '');
                }.bind(this), 1500);
                
                found = true;
                return false; // break loop
            }
        });
        
        if (!found) {
            speakFeedback('Could not find ' + linkText);
        }
    }

    /**
     * Open accessibility panel
     */
    function openPanel() {
        $('#wap-accessibility-btn').trigger('click');
    }

    /**
     * Close accessibility panel
     */
    function closePanel() {
        $('.wap-accessibility-panel-close').trigger('click');
    }

    /**
     * Increase font size
     */
    function increaseFontSize() {
        $('.wap-range-feature[data-feature="font-sizing"] .wap-accessibility-increase').trigger('click');
    }

    /**
     * Decrease font size
     */
    function decreaseFontSize() {
        $('.wap-range-feature[data-feature="font-sizing"] .wap-accessibility-decrease').trigger('click');
    }

    /**
     * Toggle dark mode
     */
    function toggleDarkMode() {
        $('.wap-toggle-feature[data-feature="dark-mode"]').trigger('click');
    }

    /**
     * Toggle high contrast
     */
    function toggleHighContrast() {
        $('.wap-toggle-feature[data-feature="high-contrast"]').trigger('click');
    }

    /**
     * Read page content
     */
    function readPageContent() {
        if (!synth) return;
        
        // Stop any existing speech
        synth.cancel();
        
        // Get main content
        var content = '';
        
        // Try to find main content area
        var $mainContent = $('main, #main, #content, article, .content').first();
        
        if ($mainContent.length > 0) {
            content = $mainContent.text();
        } else {
            // Fallback to body content
            content = $('body').clone()
                        .find('script, style, nav, footer, header, aside').remove().end()
                        .text();
        }
        
        // Clean up content
        content = content.replace(/\s+/g, ' ').trim();
        
        // Create utterance
        var utterance = new SpeechSynthesisUtterance(content);
        utterance.lang = currentLanguage;
        
        // Find appropriate voice
        if (voices.length > 0) {
            for (var i = 0; i < voices.length; i++) {
                if (voices[i].lang.indexOf(currentLanguage.split('-')[0]) !== -1) {
                    utterance.voice = voices[i];
                    break;
                }
            }
        }
        
        // Speak content
        synth.speak(utterance);
    }

    /**
     * Stop reading
     */
    function stopReading() {
        if (synth) {
            synth.cancel();
        }
    }

    /**
     * Show voice help
     */
    function showVoiceHelp() {
        // Create or show voice help overlay
        var $helpOverlay = $('#wap-voice-help-overlay');
        
        if ($helpOverlay.length === 0) {
            // Create help overlay
            $helpOverlay = $('<div id="wap-voice-help-overlay"></div>')
                .css({
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    zIndex: 100000,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                })
                .appendTo('body');
                
            // Create help content
            var $helpContent = $('<div></div>')
                .css({
                    backgroundColor: '#fff',
                    borderRadius: '5px',
                    padding: '20px',
                    maxWidth: '600px',
                    maxHeight: '80vh',
                    overflow: 'auto'
                })
                .appendTo($helpOverlay);
                
            // Add help title
            $('<h2>Voice Commands</h2>')
                .css({
                    marginTop: 0,
                    borderBottom: '1px solid #eee',
                    paddingBottom: '10px'
                })
                .appendTo($helpContent);
                
            // Add command list
            var $commandList = $('<ul></ul>')
                .css({
                    paddingLeft: '20px'
                })
                .appendTo($helpContent);
                
            // Add each command
            for (var key in voiceCommands) {
                $('<li><strong>"' + key + '"</strong> - ' + voiceCommands[key].description + '</li>')
                    .appendTo($commandList);
            }
            
            // Add additional commands
            $('<li><strong>"go to [page name]"</strong> - Navigate to a page with that name</li>')
                .appendTo($commandList);
                
            $('<li><strong>"search for [query]"</strong> - Search the website</li>')
                .appendTo($commandList);
                
            $('<li><strong>"click on [link text]"</strong> - Click a link with that text</li>')
                .appendTo($commandList);
                
            // Add close button
            $('<button>Close</button>')
                .css({
                    display: 'block',
                    margin: '20px auto 0',
                    padding: '8px 16px',
                    backgroundColor: '#2271b1',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                })
                .on('click', function() {
                    $helpOverlay.hide();
                })
                .appendTo($helpContent);
        } else {
            // Show existing overlay
            $helpOverlay.show();
        }
    }

    /**
     * Add voice help section to accessibility panel
     */
    function addVoiceHelpSection() {
        if (!settings.enableVoiceNavigation) return;
        
        // Create voice help section
        var $voiceSection = $('<div class="wap-accessibility-section"></div>');
        
        // Add title
        $('<h3>Voice Navigation</h3>').appendTo($voiceSection);
        
        // Add help button
        $('<button class="wap-accessibility-btn">Voice Commands Help</button>')
            .on('click', showVoiceHelp)
            .appendTo($voiceSection);
            
        // Add section to panel
        $voiceSection.appendTo('.wap-accessibility-panel-content');
    }

    // Initialize on document ready
    $(document).ready(function() {
        init();
    });

})(jQuery); 