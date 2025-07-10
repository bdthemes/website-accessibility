import { __ } from '@wordpress/i18n';
import GetStartedPreset from './admin/components/preset-get-started';
import ButtonStylePreset from './admin/components/preset-button-style';
import PanelCustomizationPreset from './admin/components/preset-panel-customization';
import {
    MotorIcon,
    BlindIcon,
    ColorBlindIcon,
    DyslexiaIcon,
    LowVisionIcon,
    CognitiveIcon,
    SeizureIcon,
    ADHDIcon
} from './assets/profiles-icons';

export const locationOptions = [
    {
        label: __('Entire Site', 'website-accessibility'),
        value: 'entire_site',
        description: __('Apply to all pages of your website', 'website-accessibility')
    },
    {
        label: __('Singular', 'website-accessibility'),
        value: 'singular',
        description: __('Apply to individual posts and pages', 'website-accessibility')
    },
    {
        label: __('Archive', 'website-accessibility'),
        value: 'archive',
        description: __('Apply to archive pages and listings', 'website-accessibility')
    }
];

export const steps = [
    {
        title: __('Get Started', 'website-accessibility'),
        fields: ['title', 'condition', 'active'],
        content: GetStartedPreset
    },
    {
        title: __('Button Style', 'website-accessibility'),
        fields: [],
        content: ButtonStylePreset
    },
    {
        title: __('Panel Customization', 'website-accessibility'),
        fields: [],
        content: PanelCustomizationPreset
    },
];

export const defaultProfiles = [
    {
        id: 'motor',
        title: {
            rendered: 'Motor Impaired',
            raw: 'Motor Impaired'
        },
        slug: 'motor',
        icon: <MotorIcon />
    },
    {
        id: 'blind',
        title: {
            rendered: 'Blind',
            raw: 'Blind'
        },
        slug: 'blind',
        icon: <BlindIcon />
    },
    {
        id: 'color-blind',
        title: {
            rendered: 'Color Blind',
            raw: 'Color Blind'
        },
        slug: 'color-blind',
        icon: <ColorBlindIcon />
    },
    {
        id: 'dyslexia',
        title: {
            rendered: 'Dyslexia',
            raw: 'Dyslexia'
        },
        slug: 'dyslexia',
        icon: <DyslexiaIcon />
    },
    {
        id: 'low-vision',
        title: {
            rendered: 'Low vision',
            raw: 'Low vision'
        },
        slug: 'low-vision',
        icon: <LowVisionIcon />
    },
    {
        id: 'cognitive',
        title: {
            rendered: 'Cognitive & Learning',
            raw: 'Cognitive & Learning'
        },
        slug: 'cognitive',
        icon: <CognitiveIcon />
    },
    {
        id: 'seizure',
        title: {
            rendered: 'Seizure & Epileptic',
            raw: 'Seizure & Epileptic'
        },
        slug: 'seizure',
        icon: <SeizureIcon />
    },
    {
        id: 'adhd',
        title: {
            rendered: 'ADHD',
            raw: 'ADHD'
        },
        slug: 'adhd',
        icon: <ADHDIcon />
    }
];

export const features = [
    {
        key: 'contrast',
        label: 'Contrast +',
        styleMethod: 'inline',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#1a4cd8" strokeWidth="2" />
                <path d="M12 2v20" stroke="#1a4cd8" strokeWidth="2" />
            </svg>
        ),
        attributes: [
            {
                name: 'Dark',
                value: 'dark',
                css: [
                    {
                        selector: 'body, main, section, article, nav, aside',
                        properties: {
                            background: '#111',
                            color: '#e0e0e0'
                        }
                    },
                    {
                        selector: 'h1, h2, h3, h4, h5, h6',
                        properties: {
                            color: '#fff'
                        }
                    },
                    {
                        selector: 'a',
                        properties: {
                            color: '#4fd1c5'
                        }
                    },
                    {
                        selector: 'input, textarea, select, button',
                        properties: {
                            background: '#222',
                            color: '#e0e0e0',
                            borderColor: '#444'
                        }
                    }
                ]
            },
            {
                name: 'Light',
                value: 'light',
                css: [
                    {
                        selector: 'body, main, section, article, nav, aside, .wp-block, .site, .content, .container',
                        properties: {
                            background: '#fff',
                            color: '#222'
                        }
                    },
                    {
                        selector: 'h1, h2, h3, h4, h5, h6',
                        properties: {
                            color: '#111'
                        }
                    },
                    {
                        selector: 'a',
                        properties: {
                            color: '#1a4cd8'
                        }
                    },
                    {
                        selector: 'input, textarea, select, button',
                        properties: {
                            background: '#f5f7fa',
                            color: '#222',
                            borderColor: '#ccc'
                        }
                    }
                ]
            },
            {
                name: 'Invert',
                value: 'invert',
                css: [
                    {
                        selector: 'html',
                        properties: {
                            filter: 'invert(1) hue-rotate(180deg)'
                        }
                    }
                ]
            }
        ]
    },
    {
        key: 'screenReader',
        label: 'Screen Reader',
        styleMethod: 'styleTag',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#1a4cd8" strokeWidth="2" />
                <path d="M8 12h8" stroke="#1a4cd8" strokeWidth="2" />
                <path d="M12 8v8" stroke="#1a4cd8" strokeWidth="2" />
            </svg>
        ),
        attributes: [
            {
                name: 'Normal',
                value: 'normal',
                css: []
            },
            {
                name: 'Fast',
                value: 'fast',
                css: []
            },
            {
                name: 'Slow',
                value: 'slow',
                css: []
            }
        ]
    },
    {
        key: 'smartContrast',
        label: 'Smart Contrast',
        styleMethod: 'rootClass',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="16" height="16" rx="8" stroke="#1a4cd8" strokeWidth="2" />
                <path d="M4 12h16" stroke="#1a4cd8" strokeWidth="2" />
            </svg>
        ),
        attributes: [
            {
                name: 'Enable',
                value: 'enable',
                css: []
            },
            {
                name: 'Disable',
                value: 'disable',
                css: []
            }
        ]
    },
    {
        key: 'highlightLinks',
        label: 'Highlight Links',
        styleMethod: 'inline',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="11" width="16" height="2" fill="#1a4cd8" />
                <rect x="4" y="17" width="16" height="2" fill="#1a4cd8" />
            </svg>
        ),
        attributes: [
            {
                name: 'Enable',
                value: 'enable',
                css: [
                    {
                        selector: 'a',
                        properties: {
                            backgroundColor: '#ffff00',
                            color: '#000',
                            textDecoration: 'underline'
                        }
                    }
                ]
            },
            {
                name: 'Disable',
                value: 'disable',
                css: []
            }
        ]
    },
    {
        key: 'biggerText',
        label: 'Bigger Text',
        styleMethod: 'styleTag',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <text x="12" y="18" textAnchor="middle" fontSize="16" fill="#1a4cd8" fontWeight="bold">A</text>
            </svg>
        ),
        attributes: [
            {
                name: 'Medium',
                value: 'medium',
                css: [
                    {
                        selector: 'body, p, div, span, li, td, th',
                        properties: {
                            fontSize: '18px'
                        }
                    },
                    {
                        selector: 'h1',
                        properties: {
                            fontSize: '36px'
                        }
                    },
                    {
                        selector: 'h2',
                        properties: {
                            fontSize: '32px'
                        }
                    },
                    {
                        selector: 'h3',
                        properties: {
                            fontSize: '28px'
                        }
                    }
                ]
            },
            {
                name: 'Large',
                value: 'large',
                css: [
                    {
                        selector: 'body, p, div, span, li, td, th',
                        properties: {
                            fontSize: '20px'
                        }
                    },
                    {
                        selector: 'h1',
                        properties: {
                            fontSize: '40px'
                        }
                    },
                    {
                        selector: 'h2',
                        properties: {
                            fontSize: '36px'
                        }
                    },
                    {
                        selector: 'h3',
                        properties: {
                            fontSize: '32px'
                        }
                    }
                ]
            },
            {
                name: 'Extra Large',
                value: 'extra-large',
                css: [
                    {
                        selector: 'body, p, div, span, li, td, th',
                        properties: {
                            fontSize: '22px'
                        }
                    },
                    {
                        selector: 'h1',
                        properties: {
                            fontSize: '44px'
                        }
                    },
                    {
                        selector: 'h2',
                        properties: {
                            fontSize: '40px'
                        }
                    },
                    {
                        selector: 'h3',
                        properties: {
                            fontSize: '36px'
                        }
                    }
                ]
            },
            {
                name: 'Huge',
                value: 'huge',
                css: [
                    {
                        selector: 'body, p, div, span, li, td, th',
                        properties: {
                            fontSize: '24px'
                        }
                    },
                    {
                        selector: 'h1',
                        properties: {
                            fontSize: '48px'
                        }
                    },
                    {
                        selector: 'h2',
                        properties: {
                            fontSize: '44px'
                        }
                    },
                    {
                        selector: 'h3',
                        properties: {
                            fontSize: '40px'
                        }
                    }
                ]
            }
        ]
    },
    {
        key: 'textSpacing',
        label: 'Text Spacing',
        styleMethod: 'styleTag',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="8" width="16" height="2" fill="#1a4cd8" />
                <rect x="4" y="14" width="16" height="2" fill="#1a4cd8" />
            </svg>
        ),
        attributes: [
            {
                name: 'Medium',
                value: 'medium',
                css: [
                    {
                        selector: 'body, p, div, span, li, td, th, h1, h2, h3, h4, h5, h6',
                        properties: {
                            letterSpacing: '0.5px',
                            wordSpacing: '2px'
                        }
                    }
                ]
            },
            {
                name: 'Large',
                value: 'large',
                css: [
                    {
                        selector: 'body, p, div, span, li, td, th, h1, h2, h3, h4, h5, h6',
                        properties: {
                            letterSpacing: '1px',
                            wordSpacing: '4px'
                        }
                    }
                ]
            },
            {
                name: 'Extra Large',
                value: 'extra-large',
                css: [
                    {
                        selector: 'body, p, div, span, li, td, th, h1, h2, h3, h4, h5, h6',
                        properties: {
                            letterSpacing: '2px',
                            wordSpacing: '8px'
                        }
                    }
                ]
            }
        ]
    },
    {
        key: 'pauseAnimations',
        label: 'Pause Animations',
        styleMethod: 'styleTag',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="4" width="4" height="16" rx="2" fill="#1a4cd8" />
                <rect x="14" y="4" width="4" height="16" rx="2" fill="#1a4cd8" />
            </svg>
        ),
        attributes: [
            {
                name: 'Enable',
                value: 'enable',
                css: [
                    {
                        selector: '*',
                        properties: {
                            animation: 'none',
                            transition: 'none'
                        }
                    }
                ]
            },
            {
                name: 'Disable',
                value: 'disable',
                css: []
            }
        ]
    },
    {
        key: 'hideImages',
        label: 'Hide Images',
        styleMethod: 'inline',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="16" height="16" rx="4" stroke="#1a4cd8" strokeWidth="2" />
                <path d="M4 4l16 16" stroke="#1a4cd8" strokeWidth="2" />
            </svg>
        ),
        attributes: [
            {
                name: 'Enable',
                value: 'enable',
                css: [
                    {
                        selector: 'img',
                        properties: {
                            display: 'none'
                        }
                    }
                ]
            },
            {
                name: 'Disable',
                value: 'disable',
                css: []
            }
        ]
    },
    {
        key: 'dyslexiaFriendly',
        label: 'Dyslexia Friendly',
        styleMethod: 'styleTag',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <text x="12" y="18" textAnchor="middle" fontSize="16" fill="#1a4cd8" fontWeight="bold">Df</text>
            </svg>
        ),
        attributes: [
            {
                name: 'Dyslexia',
                value: 'dyslexia',
                css: [
                    {
                        selector: 'body, p, div, span, li, td, th, h1, h2, h3, h4, h5, h6',
                        properties: {
                            fontFamily: 'OpenDyslexic, Arial, sans-serif',
                            lineHeight: '1.8',
                            letterSpacing: '1px'
                        }
                    }
                ]
            },
            {
                name: 'Legible',
                value: 'legible',
                css: [
                    {
                        selector: 'body, p, div, span, li, td, th, h1, h2, h3, h4, h5, h6',
                        properties: {
                            fontFamily: 'Arial, sans-serif',
                            lineHeight: '1.6',
                            letterSpacing: '0.5px'
                        }
                    }
                ]
            }
        ]
    },
    {
        key: 'cursor',
        label: 'Cursor',
        styleMethod: 'styleTag',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <polygon points="4,4 20,12 13,13 12,20" stroke="#1a4cd8" strokeWidth="2" fill="none" />
            </svg>
        ),
        attributes: [
            {
                name: 'Mask',
                value: 'mask',
                css: [
                    {
                        selector: '*',
                        properties: {
                            cursor: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'><circle cx=\'16\' cy=\'16\' r=\'12\' fill=\'%23000\' stroke=\'%23fff\' stroke-width=\'2\'/></svg>") 16 16, auto'
                        }
                    }
                ]
            },
            {
                name: 'Guideline',
                value: 'guideline',
                css: [
                    {
                        selector: '*',
                        properties: {
                            cursor: 'crosshair'
                        }
                    }
                ]
            }
        ]
    },
    {
        key: 'tooltips',
        label: 'Tooltips',
        styleMethod: 'rootClass',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#1a4cd8" strokeWidth="2" />
                <text x="12" y="16" textAnchor="middle" fontSize="14" fill="#1a4cd8">i</text>
            </svg>
        ),
        attributes: [
            {
                name: 'Enable',
                value: 'enable',
                css: []
            },
            {
                name: 'Disable',
                value: 'disable',
                css: []
            }
        ]
    },
    {
        key: 'lineHeight',
        label: 'Line Height',
        styleMethod: 'styleTag',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="16" height="16" rx="4" stroke="#1a4cd8" strokeWidth="2" />
            </svg>
        ),
        attributes: [
            {
                name: 'Medium',
                value: 'medium',
                css: [
                    {
                        selector: 'p, div, li, td, th',
                        properties: {
                            lineHeight: '1.6'
                        }
                    }
                ]
            },
            {
                name: 'Large',
                value: 'large',
                css: [
                    {
                        selector: 'p, div, li, td, th',
                        properties: {
                            lineHeight: '1.8'
                        }
                    }
                ]
            },
            {
                name: 'Extra Large',
                value: 'extra-large',
                css: [
                    {
                        selector: 'p, div, li, td, th',
                        properties: {
                            lineHeight: '2.2'
                        }
                    }
                ]
            }
        ]
    },
    {
        key: 'textAlign',
        label: 'Text Alignment',
        styleMethod: 'styleTag',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="16" height="16" rx="4" stroke="#1a4cd8" strokeWidth="2" />
            </svg>
        ),
        attributes: [
            {
                name: 'Left',
                value: 'left',
                css: [
                    {
                        selector: 'body, p, div, h1, h2, h3, h4, h5, h6',
                        properties: {
                            textAlign: 'left'
                        }
                    }
                ]
            },
            {
                name: 'Center',
                value: 'center',
                css: [
                    {
                        selector: 'body, p, div, h1, h2, h3, h4, h5, h6',
                        properties: {
                            textAlign: 'center'
                        }
                    }
                ]
            },
            {
                name: 'Right',
                value: 'right',
                css: [
                    {
                        selector: 'body, p, div, h1, h2, h3, h4, h5, h6',
                        properties: {
                            textAlign: 'right'
                        }
                    }
                ]
            },
            {
                name: 'Justify',
                value: 'justify',
                css: [
                    {
                        selector: 'body, p, div, h1, h2, h3, h4, h5, h6',
                        properties: {
                            textAlign: 'justify'
                        }
                    }
                ]
            }
        ]
    },
    {
        key: 'saturation',
        label: 'Saturation',
        styleMethod: 'inline',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="16" height="16" rx="4" stroke="#1a4cd8" strokeWidth="2" />
            </svg>
        ),
        attributes: [
            {
                name: 'Low',
                value: 'low',
                css: [
                    {
                        selector: 'img, video',
                        properties: {
                            filter: 'saturate(0.5)'
                        }
                    }
                ]
            },
            {
                name: 'High',
                value: 'high',
                css: [
                    {
                        selector: 'img, video',
                        properties: {
                            filter: 'saturate(1.5)'
                        }
                    }
                ]
            },
            {
                name: 'Desaturate',
                value: 'desaturate',
                css: [
                    {
                        selector: 'img, video',
                        properties: {
                            filter: 'saturate(0)'
                        }
                    }
                ]
            }
        ]
    },
    {
        key: 'dictionary',
        label: 'Dictionary',
        styleMethod: 'rootClass',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="16" height="16" rx="4" stroke="#1a4cd8" strokeWidth="2" />
            </svg>
        ),
        attributes: [
            {
                name: 'Enable',
                value: 'enable',
                css: []
            },
            {
                name: 'Disable',
                value: 'disable',
                css: []
            }
        ]
    }
];