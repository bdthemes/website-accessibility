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
            // This is a simplified check - in a real implementation, you'd use a library like axe-core
            const elements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button, label');
            const lowContrastElements = [];
            
            elements.forEach(el => {
              const style = window.getComputedStyle(el);
              const bgColor = style.backgroundColor;
              const textColor = style.color;
              if (el.textContent.trim() && bgColor && textColor) {
                // In a real implementation, you would calculate the contrast ratio here
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
            // This would need a more sophisticated check in a real implementation
            return { passed: true, warning: 'Manual check recommended' };
          }
        }
      ]
    },
    // Additional categories would follow the same pattern
    // ...
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
