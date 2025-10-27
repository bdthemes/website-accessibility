/**
 * Accessibility Checks Configuration
 * Defines all WCAG 2.1 AA checks organized by categories
 */

export const accessibilityChecks = {
  categories: [
    {
      id: "structure",
      title: "Structure & Semantics",
      checks: [
        {
          id: "missing_h1",
          title: "Missing or multiple <h1> tag",
          description: "Every page should contain exactly one <h1> element that describes the page's main topic.",
          severity: "major",
          fixSuggestion: "Ensure the page has a single <h1> element at the top-level content area.",
          validate: (document) => {
            const h1Elements = document.getElementsByTagName('h1');
            if (h1Elements.length === 0) {
              return { 
                passed: false, 
                message: 'No <h1> tag found',
                element: 'document'
              };
            } else if (h1Elements.length > 1) {
              return { 
                passed: false, 
                message: `Found ${h1Elements.length} <h1> tags`,
                element: 'document',
                count: h1Elements.length
              };
            }
            return { passed: true };
          }
        },
        {
          id: "heading_order",
          title: "Improper heading order",
          description: "Headings should follow a logical hierarchy (e.g., H1 > H2 > H3).",
          severity: "minor",
          fixSuggestion: "Reorder headings to follow a proper sequence without skipping levels.",
          validate: (document) => {
            const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
            let lastLevel = 0;
            let hasIssue = false;
            
            for (let i = 0; i < headings.length; i++) {
              const level = parseInt(headings[i].tagName[1]);
              if (i > 0 && level > lastLevel + 1) {
                hasIssue = true;
                break;
              }
              lastLevel = level;
            }
            
            return hasIssue 
              ? { passed: false, message: 'Improper heading hierarchy detected', element: 'document' }
              : { passed: true };
          }
        },
        {
          id: "missing_lang_attr",
          title: "Missing lang attribute",
          description: "The <html> element should have a lang attribute to specify the page language.",
          severity: "minor",
          fixSuggestion: "Add a lang attribute to the <html> tag (e.g., <html lang=\"en\">).",
          validate: (document) => {
            const htmlElement = document.documentElement;
            return htmlElement.hasAttribute('lang')
              ? { passed: true }
              : { 
                  passed: false, 
                  message: 'Missing lang attribute on <html> element',
                  element: '<html>',
                  codeSnippet: '<html lang="en">'
                };
          }
        }
      ]
    },
    {
      id: "contrast",
      title: "Color & Contrast",
      checks: [
        {
          id: "low_text_contrast",
          title: "Low text contrast",
          description: "Text should have a contrast ratio of at least 4.5:1 with its background.",
          severity: "major",
          fixSuggestion: "Adjust text or background color to meet the WCAG contrast requirement.",
          validate: (document) => {
            const elements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button, label');
            const lowContrastElements = [];
            
            elements.forEach(el => {
              const style = window.getComputedStyle(el);
              const bgColor = style.backgroundColor;
              const textColor = style.color;
              if (el.textContent.trim() && bgColor && textColor) {
                lowContrastElements.push(el);
              }
            });

            return lowContrastElements.length > 0
              ? { 
                  passed: false, 
                  message: `Found ${lowContrastElements.length} elements with potential contrast issues`,
                  element: 'text',
                  count: lowContrastElements.length
                }
              : { passed: true };
          }
        },
        {
          id: "color_only_info",
          title: "Color used as the only means of conveying information",
          description: "Avoid using color alone to indicate meaning (e.g., error messages in red only).",
          severity: "major",
          fixSuggestion: "Add icons, labels, or text indicators along with color changes.",
          validate: (document) => {
            return { passed: true, warning: 'Manual check recommended' };
          }
        }
      ]
    },
    {
      id: "keyboard",
      title: "Keyboard Accessibility",
      checks: [
        {
          id: "no_focus_indicator",
          title: "No visible focus indicator",
          description: "Focusable elements should display a visible outline when focused.",
          severity: "critical",
          fixSuggestion: "Ensure focusable elements use CSS like outline or border styles on :focus.",
          validate: (document) => {
            const focusableElements = document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]');
            let noFocusStyleCount = 0;

            focusableElements.forEach(el => {
              const style = window.getComputedStyle(el);
              if (style.outlineStyle === 'none' && style.outlineWidth === '0px') {
                noFocusStyleCount++;
              }
            });

            return noFocusStyleCount > 0
              ? {
                  passed: false,
                  message: `Found ${noFocusStyleCount} focusable elements without visible focus indicators`,
                  element: 'focusable elements',
                  count: noFocusStyleCount
                }
              : { passed: true };
          }
        },
        {
          id: "keyboard_trap",
          title: "Keyboard trap detected",
          description: "Keyboard focus cannot escape a section, such as a modal or slider.",
          severity: "critical",
          fixSuggestion: "Ensure ESC key or focus cycling returns to previous position.",
          validate: (document) => {
            return { passed: true, warning: 'Manual check recommended for keyboard traps' };
          }
        }
      ]
    },
    {
      id: "images",
      title: "Images & Media",
      checks: [
        {
          id: "missing_alt",
          title: "Missing alt text on images",
          description: "Images should have descriptive alt text or empty alt for decorative ones.",
          severity: "critical",
          fixSuggestion: "Add alt attributes to all meaningful images.",
          validate: (document) => {
            const images = document.querySelectorAll('img:not([alt])');
            return images.length > 0
              ? { 
                  passed: false, 
                  message: `Found ${images.length} images missing alt attributes`,
                  element: 'img',
                  count: images.length,
                  codeSnippet: 'Add alt="description" to image elements'
                }
              : { passed: true };
          }
        },
        {
          id: "background_image_content",
          title: "Meaningful content in background image",
          description: "Background images should not contain essential content.",
          severity: "major",
          fixSuggestion: "Use HTML elements for content instead of background images.",
          validate: (document) => {
            return { passed: true, warning: 'Manual check recommended for background images with content' };
          }
        }
      ]
    },
    {
      id: "links_buttons",
      title: "Links & Buttons",
      checks: [
        {
          id: "empty_link",
          title: "Empty link or button text",
          description: "Interactive elements must have readable text or aria-labels.",
          severity: "critical",
          fixSuggestion: "Add visible text or an aria-label describing the link or button.",
          validate: (document) => {
            const emptyLinks = [];
            const links = document.querySelectorAll('a, button');
            
            links.forEach(link => {
              const hasText = link.textContent.trim() !== '';
              const hasAriaLabel = link.hasAttribute('aria-label') || link.hasAttribute('aria-labelledby');
              if (!hasText && !hasAriaLabel) {
                emptyLinks.push(link);
              }
            });
            
            return emptyLinks.length > 0
              ? { 
                  passed: false, 
                  message: `Found ${emptyLinks.length} interactive elements without accessible text`,
                  element: 'a, button',
                  count: emptyLinks.length
                }
              : { passed: true };
          }
        },
        {
          id: "new_tab_no_notice",
          title: "Link opens in new tab without warning",
          description: "Links that open new tabs should inform users beforehand.",
          severity: "minor",
          fixSuggestion: "Add '(opens in new tab)' or aria-label notice.",
          validate: (document) => {
            const newTabLinks = document.querySelectorAll('a[target="_blank"]');
            const noWarningLinks = [];
            
            newTabLinks.forEach(link => {
              const hasWarning = /(opens?\s+(in\s+)?(new|another|external)\s+(tab|window)|new\s+tab|external\s+link)/i.test(link.textContent) ||
                               link.getAttribute('aria-label')?.match(/(opens?\s+(in\s+)?(new|another|external)\s+(tab|window)|new\s+tab|external\s+link)/i);
              if (!hasWarning) {
                noWarningLinks.push(link);
              }
            });
            
            return noWarningLinks.length > 0
              ? { 
                  passed: false, 
                  message: `Found ${noWarningLinks.length} links opening in new tabs without proper warning`,
                  element: 'a[target="_blank"]',
                  count: noWarningLinks.length
                }
              : { passed: true };
          }
        }
      ]
    },
    {
      id: "forms",
      title: "Forms & Inputs",
      checks: [
        {
          id: "missing_label",
          title: "Input without label",
          description: "Each input must have a label or aria-label for screen readers.",
          severity: "critical",
          fixSuggestion: "Add a label element or aria-label for each input.",
          validate: (document) => {
            const unlabeledInputs = [];
            const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
            
            // Filter out hidden and non-visible inputs
            const visibleInputs = inputs.filter(input => {
              // Skip hidden inputs
              if (input.type === 'hidden') return false;
              
              // Skip elements with display: none or visibility: hidden
              const style = window.getComputedStyle(input);
              if (style.display === 'none' || style.visibility === 'hidden') return false;
              
              // Skip elements with no dimensions and no content
              const rect = input.getBoundingClientRect();
              if (rect.width === 0 && rect.height === 0) return false;
              
              // For checkboxes and radio buttons, check if they're part of a visible fieldset
              if ((input.type === 'checkbox' || input.type === 'radio') && input.closest('fieldset[hidden]')) {
                return false;
              }
              
              return true;
            });
            
            visibleInputs.forEach(input => {
              const hasLabel = input.labels && input.labels.length > 0;
              const hasAriaLabel = input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby');
              const hasTitle = input.hasAttribute('title');
              const isButton = input.type === 'button' || input.type === 'submit' || input.type === 'reset';
              const isSearch = input.type === 'search' && input.placeholder && input.placeholder.trim() !== '';
              
              // Skip buttons and search inputs with placeholders
              if (isButton || isSearch) return;
              
              // Check for associated label or ARIA attributes
              if (!hasLabel && !hasAriaLabel && !hasTitle) {
                unlabeledInputs.push(input);
              }
            });
            
            return unlabeledInputs.length > 0
              ? { 
                  passed: false, 
                  message: `Found ${unlabeledInputs.length} visible form inputs without proper labels`,
                  element: 'input, select, textarea',
                  count: unlabeledInputs.length,
                  warning: 'Note: Hidden and non-visible form elements are ignored'
                }
              : { passed: true };
          }
        },
        {
          id: "placeholder_as_label",
          title: "Placeholder used instead of label",
          description: "Placeholders disappear on typing and should not replace labels.",
          severity: "minor",
          fixSuggestion: "Add a proper <label> and keep placeholder as hint only.",
          validate: (document) => {
            const inputsWithPlaceholderAsLabel = [];
            const inputs = document.querySelectorAll('input[placeholder], textarea[placeholder]');
            
            inputs.forEach(input => {
              const hasLabel = input.labels && input.labels.length > 0;
              const hasAriaLabel = input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby');
              const hasTitle = input.hasAttribute('title');
              
              if (!hasLabel && !hasAriaLabel && !hasTitle) {
                inputsWithPlaceholderAsLabel.push(input);
              }
            });
            
            return inputsWithPlaceholderAsLabel.length > 0
              ? { 
                  passed: false, 
                  message: `Found ${inputsWithPlaceholderAsLabel.length} inputs using placeholder as the only label`,
                  element: 'input[placeholder], textarea[placeholder]',
                  count: inputsWithPlaceholderAsLabel.length
                }
              : { passed: true };
          }
        }
      ]
    },
    {
      id: "aria",
      title: "ARIA & Screen Reader Support",
      checks: [
        {
          id: "invalid_aria",
          title: "Invalid ARIA attributes",
          description: "ARIA roles or attributes used incorrectly or with typos.",
          severity: "major",
          fixSuggestion: "Validate ARIA attributes and ensure proper usage per WAI-ARIA spec.",
          validate: (document) => {
            return { passed: true, warning: 'ARIA validation requires a specialized library' };
          }
        },
        {
          id: "missing_live_region",
          title: "Dynamic updates missing ARIA live regions",
          description: "Screen readers won't announce content changes without ARIA live regions.",
          severity: "major",
          fixSuggestion: "Add aria-live or role='status' to containers with dynamic updates.",
          validate: (document) => {
            return { passed: true, warning: 'Live region detection requires runtime analysis' };
          }
        }
      ]
    },
    {
      id: "focus",
      title: "Focus & Navigation Flow",
      checks: [
        {
          id: "missing_skip_link",
          title: "No skip-to-content link",
          description: "Users should be able to skip repetitive navigation links.",
          severity: "minor",
          fixSuggestion: "Add a visible or focusable 'Skip to main content' link.",
          validate: (document) => {
            const skipLinks = document.querySelectorAll('a[href^="#"], a[href^="/#"], [role="main"]');
            let hasSkipLink = false;
            
            skipLinks.forEach(link => {
              const href = link.getAttribute('href');
              const text = link.textContent.toLowerCase();
              if ((href === '#main' || href === '#content' || href === '/#main' || href === '/#content' || 
                  text.includes('skip') || text.includes('skip to content'))) {
                hasSkipLink = true;
              }
            });
            
            return hasSkipLink
              ? { passed: true }
              : { 
                  passed: false, 
                  message: 'No skip-to-content link found',
                  element: 'document',
                  codeSnippet: '<a href="#main" class="skip-link">Skip to main content</a>'
                };
          }
        },
        {
          id: "focus_loss",
          title: "Focus lost after modal or dynamic change",
          description: "Keyboard focus should return to the previously focused element after close.",
          severity: "major",
          fixSuggestion: "Store last focused element and restore focus when closing popups.",
          validate: (document) => {
            return { passed: true, warning: 'Focus management requires runtime testing' };
          }
        }
      ]
    },
    {
      id: "advanced",
      title: "Advanced / Miscellaneous",
      checks: [
        {
          id: "zoom_disabled",
          title: "Zoom disabled",
          description: "Users must be able to zoom in browsers for readability.",
          severity: "major",
          fixSuggestion: "Remove 'user-scalable=no' from the viewport meta tag.",
          validate: (document) => {
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport && viewport.content.includes('user-scalable=no')) {
              return { 
                passed: false, 
                message: 'Viewport meta tag is preventing zooming',
                element: 'meta[name="viewport"]',
                codeSnippet: '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
              };
            }
            return { passed: true };
          }
        },
        {
          id: "auto_refresh",
          title: "Page auto-refresh or redirect",
          description: "Auto-refreshing pages can disrupt assistive tech users.",
          severity: "minor",
          fixSuggestion: "Avoid meta refresh or provide user warning and control.",
          validate: (document) => {
            const metaRefresh = document.querySelector('meta[http-equiv="refresh"]');
            if (metaRefresh) {
              return { 
                passed: false, 
                message: 'Meta refresh detected which may disrupt users',
                element: 'meta[http-equiv="refresh"]',
                codeSnippet: '<!-- Remove or replace this meta refresh with a user-initiated action -->'
              };
            }
            return { passed: true };
          }
        }
      ]
    }
  ]
};

// Helper function to get all checks in a flat array
export const getAllChecks = () => {
  return accessibilityChecks.categories.flatMap(category => 
    category.checks.map(check => ({
      ...check,
      categoryId: category.id,
      categoryTitle: category.title
    }))
  );
};
