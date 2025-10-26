import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button, Drawer, Collapse, Tag, List, Skeleton, Alert, Spin } from 'antd';
import { runAccessibilityScan } from '../utils/accessibilityScanner';

const { Panel } = Collapse;

const severityColors = {
    critical: 'red',
    major: 'orange',
    minor: 'blue',
};

const accessibilityData = {
  "categories": [
    {
      "id": "structure",
      "title": "Structure & Semantics",
      "checks": [
        {
          "id": "missing_h1",
          "title": "Missing or multiple <h1> tag",
          "description": "Every page should contain exactly one <h1> element that describes the page's main topic.",
          "severity": "major",
          "fixSuggestion": "Ensure the page has a single <h1> element at the top-level content area."
        },
        {
          "id": "heading_order",
          "title": "Improper heading order",
          "description": "Headings should follow a logical hierarchy (e.g., H1 > H2 > H3).",
          "severity": "minor",
          "fixSuggestion": "Reorder headings to follow a proper sequence without skipping levels."
        },
        {
          "id": "missing_lang_attr",
          "title": "Missing lang attribute",
          "description": "The <html> element should have a lang attribute to specify the page language.",
          "severity": "minor",
          "fixSuggestion": "Add a lang attribute to the <html> tag (e.g., <html lang=\"en\">)."
        }
      ]
    },
    {
      "id": "contrast",
      "title": "Color & Contrast",
      "checks": [
        {
          "id": "low_text_contrast",
          "title": "Low text contrast",
          "description": "Text should have a contrast ratio of at least 4.5:1 with its background.",
          "severity": "major",
          "fixSuggestion": "Adjust text or background color to meet the WCAG contrast requirement."
        },
        {
          "id": "color_only_info",
          "title": "Color used as the only means of conveying information",
          "description": "Avoid using color alone to indicate meaning (e.g., error messages in red only).",
          "severity": "major",
          "fixSuggestion": "Add icons, labels, or text indicators along with color changes."
        }
      ]
    },
    {
      "id": "keyboard",
      "title": "Keyboard Accessibility",
      "checks": [
        {
          "id": "no_focus_indicator",
          "title": "No visible focus indicator",
          "description": "Focusable elements should display a visible outline when focused.",
          "severity": "critical",
          "fixSuggestion": "Ensure focusable elements use CSS like outline or border styles on :focus."
        },
        {
          "id": "keyboard_trap",
          "title": "Keyboard trap detected",
          "description": "Keyboard focus cannot escape a section, such as a modal or slider.",
          "severity": "critical",
          "fixSuggestion": "Ensure ESC key or focus cycling returns to previous position."
        }
      ]
    },
    {
      "id": "images",
      "title": "Images & Media",
      "checks": [
        {
          "id": "missing_alt",
          "title": "Missing alt text on images",
          "description": "Images should have descriptive alt text or empty alt for decorative ones.",
          "severity": "critical",
          "fixSuggestion": "Add alt attributes to all meaningful images."
        },
        {
          "id": "background_image_content",
          "title": "Meaningful content in background image",
          "description": "Background images should not contain essential content.",
          "severity": "major",
          "fixSuggestion": "Use HTML elements for content instead of background images."
        }
      ]
    },
    {
      "id": "links_buttons",
      "title": "Links & Buttons",
      "checks": [
        {
          "id": "empty_link",
          "title": "Empty link or button text",
          "description": "Interactive elements must have readable text or aria-labels.",
          "severity": "critical",
          "fixSuggestion": "Add visible text or an aria-label describing the link or button."
        },
        {
          "id": "new_tab_no_notice",
          "title": "Link opens in new tab without warning",
          "description": "Links that open new tabs should inform users beforehand.",
          "severity": "minor",
          "fixSuggestion": "Add '(opens in new tab)' or aria-label notice."
        }
      ]
    },
    {
      "id": "forms",
      "title": "Forms & Inputs",
      "checks": [
        {
          "id": "missing_label",
          "title": "Input without label",
          "description": "Each input must have a label or aria-label for screen readers.",
          "severity": "critical",
          "fixSuggestion": "Add a label element or aria-label for each input."
        },
        {
          "id": "placeholder_as_label",
          "title": "Placeholder used instead of label",
          "description": "Placeholders disappear on typing and should not replace labels.",
          "severity": "minor",
          "fixSuggestion": "Add a proper <label> and keep placeholder as hint only."
        }
      ]
    },
    {
      "id": "aria",
      "title": "ARIA & Screen Reader Support",
      "checks": [
        {
          "id": "invalid_aria",
          "title": "Invalid ARIA attributes",
          "description": "ARIA roles or attributes used incorrectly or with typos.",
          "severity": "major",
          "fixSuggestion": "Validate ARIA attributes and ensure proper usage per WAI-ARIA spec."
        },
        {
          "id": "missing_live_region",
          "title": "Dynamic updates missing ARIA live regions",
          "description": "Screen readers won't announce content changes without ARIA live regions.",
          "severity": "major",
          "fixSuggestion": "Add aria-live or role='status' to containers with dynamic updates."
        }
      ]
    },
    {
      "id": "focus",
      "title": "Focus & Navigation Flow",
      "checks": [
        {
          "id": "missing_skip_link",
          "title": "No skip-to-content link",
          "description": "Users should be able to skip repetitive navigation links.",
          "severity": "minor",
          "fixSuggestion": "Add a visible or focusable 'Skip to main content' link."
        },
        {
          "id": "focus_loss",
          "title": "Focus lost after modal or dynamic change",
          "description": "Keyboard focus should return to the previously focused element after close.",
          "severity": "major",
          "fixSuggestion": "Store last focused element and restore focus when closing popups."
        }
      ]
    },
    {
      "id": "advanced",
      "title": "Advanced / Miscellaneous",
      "checks": [
        {
          "id": "zoom_disabled",
          "title": "Zoom disabled",
          "description": "Users must be able to zoom in browsers for readability.",
          "severity": "major",
          "fixSuggestion": "Remove 'user-scalable=no' from the viewport meta tag."
        },
        {
          "id": "auto_refresh",
          "title": "Page auto-refresh or redirect",
          "description": "Auto-refreshing pages can disrupt assistive tech users.",
          "severity": "minor",
          "fixSuggestion": "Avoid meta refresh or provide user warning and control."
        }
      ]
    }
  ]
};

const AdminView = () => {
    const [open, setOpen] = useState(false);
    const [initLoading, setInitLoading] = useState(true);
    const [adminBarHeight, setAdminBarHeight] = useState(32); // Default height
    const [activePanels, setActivePanels] = useState(['structure']);
    const [loading, setLoading] = useState(false);
    const [scanResults, setScanResults] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [lastScanTime, setLastScanTime] = useState(null);

    useEffect(() => {
        // Get the WordPress admin bar height
        const adminBar = document.getElementById('wpadminbar');
        if (adminBar) {
            setAdminBarHeight(adminBar.offsetHeight);
        }
    }, []);

    const runAccessibilityCheck = () => {
        setIsScanning(true);
        try {
            const results = runAccessibilityScan();
            setScanResults(results);
            setActivePanels(results.categories.map(cat => cat.id));
            setLastScanTime(new Date().toLocaleString());
            setOpen(true);
        } catch (error) {
            console.error('Error running accessibility scan:', error);
        } finally {
            setIsScanning(false);
        }
    };

    const showLoading = () => {
        setOpen(true);
        setLoading(true);
        // Simulate loading data
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    };

    // Add necessary styles for the toggle button
    const buttonStyle = {
        position: 'fixed',
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 9999,
        borderRadius: '4px 0 0 4px',
        boxShadow: '-2px 0 5px rgba(0,0,0,0.2)',
    };

    // Calculate drawer header style based on admin bar height
    const drawerHeaderStyle = {
        padding: '16px 24px',
        borderBottom: '1px solid #f0f0f0',
        margin: 0,
        borderRadius: 0,
        position: 'sticky',
        top: 0,
        background: '#2E6CF6',
        zIndex: 1
    };

    return (
        <>
            {!open && (
                <Button
                    type="primary"
                    onClick={showLoading}
                    style={buttonStyle}
                >
                    {__('Admin', 'website-accessibility')}
                </Button>
            )}

            <Drawer
                title={
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%'
                    }}>
                        <span style={{
                            fontSize: '16px',
                            fontWeight: 500,
                            color: '#fff'
                        }}>
                            {__('Admin Panel', 'website-accessibility')}
                        </span>
                    </div>
                }
                placement="right"
                onClose={() => setOpen(false)}
                open={open}
                loading={loading}
                destroyOnClose
                width={400}
                styles={{
                    header: drawerHeaderStyle,
                    body: {
                        padding: 24,
                        margin: 0,
                        flex: 1,
                        overflow: 'auto',
                        paddingTop: 0
                    },
                    content: {
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        padding: 0
                    },
                    wrapper: {
                        paddingTop: `${adminBarHeight}px`
                    }
                }}
                style={{
                    overflow: 'hidden'
                }}
            >
                <div className="accessibility-checks" style={{ marginTop: '16px' }}>
                    {!scanResults && !isScanning && (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <p>Run an accessibility scan to check for WCAG 2.1 AA compliance issues.</p>
                            <Button 
                                type="primary" 
                                onClick={runAccessibilityCheck}
                                loading={isScanning}
                                style={{ marginTop: '16px' }}
                            >
                                {isScanning ? 'Scanning...' : 'Scan Page for Accessibility Issues'}
                            </Button>
                        </div>
                    )}

                    {isScanning && (
                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <Spin size="large" />
                            <p style={{ marginTop: '16px' }}>Scanning page for accessibility issues...</p>
                        </div>
                    )}

                    {scanResults && (
                        <>
                            <div style={{ marginBottom: '16px' }}>
                                <Alert
                                    message={
                                        <>
                                            <strong>Accessibility Scan Results</strong>
                                            {lastScanTime && (
                                                <span style={{ marginLeft: '10px', fontSize: '0.9em', color: '#666' }}>
                                                    Last scanned: {lastScanTime}
                                                </span>
                                            )}
                                        </>
                                    }
                                    description={
                                        scanResults.totalIssues === 0 
                                            ? 'No accessibility issues found! Your page meets WCAG 2.1 AA standards.'
                                            : `Found ${scanResults.totalIssues} potential accessibility issue${scanResults.totalIssues !== 1 ? 's' : ''} across ${scanResults.categories.length} categories.`
                                    }
                                    type={scanResults.totalIssues === 0 ? 'success' : 'warning'}
                                    showIcon
                                    style={{ marginBottom: '16px' }}
                                />
                                <Button 
                                    onClick={runAccessibilityCheck}
                                    loading={isScanning}
                                    style={{ marginRight: '8px' }}
                                >
                                    {isScanning ? 'Scanning...' : 'Rescan Page'}
                                </Button>
                                <Button 
                                    onClick={() => setScanResults(null)}
                                    disabled={isScanning}
                                >
                                    Clear Results
                                </Button>
                            </div>

                            <Collapse 
                                items={scanResults.categories.map(category => ({
                                    key: category.id,
                                    label: (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>{category.title}</span>
                                            <Tag color={category.checks.length > 0 ? 'red' : 'green'}>
                                                {category.checks.length} {category.checks.length === 1 ? 'issue' : 'issues'}
                                            </Tag>
                                        </div>
                                    ),
                                    children: (
                                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                            {category.checks.length === 0 ? (
                                                <div style={{ padding: '12px', color: '#52c41a' }}>
                                                    No issues found in this category.
                                                </div>
                                            ) : (
                                                category.checks.map((check) => (
                                                    <div 
                                                        key={check.id}
                                                        style={{
                                                            padding: '12px',
                                                            marginBottom: '12px',
                                                            borderLeft: `3px solid ${severityColors[check.severity] || '#d9d9d9'}`,
                                                            background: '#fafafa',
                                                            borderRadius: '4px',
                                                            display: 'block',
                                                            width: '100%'
                                                        }}
                                                    >
                                                        <div style={{ 
                                                            display: 'flex', 
                                                            justifyContent: 'space-between',
                                                            marginBottom: '8px',
                                                            alignItems: 'center'
                                                        }}>
                                                            <h4 style={{ margin: 0 }}>{check.title}</h4>
                                                            <Tag color={severityColors[check.severity] || 'default'}>
                                                                {check.severity.charAt(0).toUpperCase() + check.severity.slice(1)}
                                                            </Tag>
                                                        </div>
                                                        <p style={{ margin: '8px 0', color: '#666' }}>{check.description}</p>
                                                        {check.count > 1 && (
                                                            <div style={{ margin: '8px 0' }}>
                                                                <Tag color="orange">Found {check.count} instances</Tag>
                                                            </div>
                                                        )}
                                                        <div style={{ 
                                                            padding: '8px', 
                                                            background: '#fff', 
                                                            borderRadius: '4px',
                                                            borderLeft: '2px solid #1890ff',
                                                            marginTop: '8px'
                                                        }}>
                                                            <strong>How to fix:</strong>
                                                            <p style={{ margin: '4px 0 0 0' }}>{check.fixSuggestion}</p>
                                                            {check.codeSnippet && (
                                                                <pre style={{
                                                                    background: '#f5f5f5',
                                                                    padding: '8px',
                                                                    borderRadius: '4px',
                                                                    overflowX: 'auto',
                                                                    margin: '8px 0 0 0',
                                                                    fontSize: '0.85em'
                                                                }}>
                                                                    <code>{check.codeSnippet}</code>
                                                                </pre>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    ),
                                    style: {
                                        background: '#fff',
                                        borderRadius: '8px',
                                        marginBottom: '16px',
                                        border: '1px solid #f0f0f0',
                                        overflow: 'hidden'
                                    }
                                }))}
                                activeKey={activePanels}
                                onChange={(keys) => setActivePanels(keys)}
                                expandIconPosition="end"
                                ghost
                            />
                        </>
                    )}
                </div>
            </Drawer>
        </>
    );
};

export default AdminView;
