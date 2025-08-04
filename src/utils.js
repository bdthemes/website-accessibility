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

export const isScreenReaderActive = (setttings) => {
    return setttings?.screenReader?.currentStep > 0;
}

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
        title: { rendered: 'Motor Impaired', raw: 'Motor Impaired' },
        slug: 'motor',
        icon: <MotorIcon />,
        features: {
            highlightLinks: 'enable',
            biggerText: 'medium',
            cursor: 'mask',
            pauseAnimations: 'enable',
            tooltips: 'enable',
            textAlign: 'left',
            smartContrast: 'enable',
            textSpacing: 'medium',
            lineHeight: 'medium'
        }
    },
    {
        id: 'blind',
        title: { rendered: 'Blind', raw: 'Blind' },
        slug: 'blind',
        icon: <BlindIcon />,
        features: {
            screenReader: 'normal',
            biggerText: 'large',
            contrast: 'invert',
            smartContrast: 'enable',
            tooltips: 'disable',
            highlightLinks: 'disable',
            pauseAnimations: 'enable',
            textSpacing: 'large',
            lineHeight: 'large',
            textAlign: 'left'
        }
    },
    {
        id: 'color-blind',
        title: { rendered: 'Color Blind', raw: 'Color Blind' },
        slug: 'color-blind',
        icon: <ColorBlindIcon />,
        features: {
            contrast: 'dark',
            smartContrast: 'enable',
            saturation: 'desaturate',
            highlightLinks: 'enable',
            dictionary: 'enable',
            textAlign: 'left'
        }
    },
    {
        id: 'dyslexia',
        title: { rendered: 'Dyslexia', raw: 'Dyslexia' },
        slug: 'dyslexia',
        icon: <DyslexiaIcon />,
        features: {
            dyslexiaFriendly: 'dyslexia',
            biggerText: 'large',
            lineHeight: 'large',
            textSpacing: 'large',
            highlightLinks: 'enable',
            dictionary: 'enable',
            tooltips: 'enable',
            textAlign: 'left'
        }
    },
    {
        id: 'low-vision',
        title: { rendered: 'Low vision', raw: 'Low vision' },
        slug: 'low-vision',
        icon: <LowVisionIcon />,
        features: {
            contrast: 'light',
            biggerText: 'huge',
            lineHeight: 'extra-large',
            textSpacing: 'extra-large',
            highlightLinks: 'enable',
            saturation: 'high',
            tooltips: 'enable',
            dictionary: 'enable',
            pauseAnimations: 'enable',
            textAlign: 'left'
        }
    },
    {
        id: 'cognitive',
        title: { rendered: 'Cognitive & Learning', raw: 'Cognitive & Learning' },
        slug: 'cognitive',
        icon: <CognitiveIcon />,
        features: {
            screenReader: 'slow',
            contrast: 'light',
            biggerText: 'large',
            lineHeight: 'large',
            textSpacing: 'large',
            tooltips: 'enable',
            dictionary: 'enable',
            pauseAnimations: 'enable',
            textAlign: 'left'
        }
    },
    {
        id: 'seizure',
        title: { rendered: 'Seizure & Epileptic', raw: 'Seizure & Epileptic' },
        slug: 'seizure',
        icon: <SeizureIcon />,
        features: {
            contrast: 'light',
            pauseAnimations: 'enable',
            hideImages: 'enable',
            saturation: 'desaturate',
            screenReader: 'disable',
            highlightLinks: 'disable',
            tooltips: 'disable',
            dictionary: 'disable',
            textAlign: 'left'
        }
    },
    {
        id: 'adhd',
        title: { rendered: 'ADHD', raw: 'ADHD' },
        slug: 'adhd',
        icon: <ADHDIcon />,
        features: {
            pauseAnimations: 'enable',
            contrast: 'light',
            biggerText: 'large',
            lineHeight: 'large',
            textSpacing: 'large',
            screenReader: 'slow',
            dictionary: 'enable',
            tooltips: 'enable',
            textAlign: 'left'
        }
    }
];


export const features = [
    {
        key: 'contrast',
        label: __('Contrast +', 'website-accessibility'),
        styleMethod: 'inline',
        disableAnnouncement: __('The contrast setting has been disabled.', 'website-accessibility'),
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#1a4cd8" strokeWidth="2" />
                <path d="M12 2v20" stroke="#1a4cd8" strokeWidth="2" />
            </svg>
        ),
        attributes: [
            {
                name: __('Invert', 'website-accessibility'),
                value: 'invert',
                enableAnnouncement: __('Enable Contrast Mode, set to Invert.', 'website-accessibility'),
                css: [
                    {
                        selector: 'html',
                        properties: {
                            filter: 'invert(1)'
                        }
                    },
                    {
                        selector: '.wap-preset__preview-drawer ',
                        properties: {
                            filter: 'invert(1)'
                        }
                    }
                ]
            },
            {
                name: __('Dark', 'website-accessibility'),
                value: 'dark',
                enableAnnouncement: __('Contrast Mode, set to Dark.', 'website-accessibility'),
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
                name: __('Light', 'website-accessibility'),
                value: 'light',
                enableAnnouncement: __('Contrast Mode, set to Light.', 'website-accessibility'),
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
            }
        ]
    },
    {
        key: 'screenReader',
        label: __('Screen Reader', 'website-accessibility'),
        styleMethod: 'styleTag',
        disableAnnouncement: __('The screen reader setting has been disabled.', 'website-accessibility'),
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#1a4cd8" strokeWidth="2" />
                <path d="M8 12h8" stroke="#1a4cd8" strokeWidth="2" />
                <path d="M12 8v8" stroke="#1a4cd8" strokeWidth="2" />
            </svg>
        ),
        attributes: [
            {
                name: __('Normal', 'website-accessibility'),
                value: 'normal',
                rate: 1,
                pitch: 1,
                lang: 'en-US',
                voiceURI: 'Google US English', // optional
                css: [],
                enableAnnouncement: __('Enable Screen Reader, set to Normal.', 'website-accessibility')
            },
            {
                name: __('Slow', 'website-accessibility'),
                value: 'slow',
                rate: 0.8,
                pitch: 1,
                lang: 'en-US',
                voiceURI: 'Google US English', // optional
                css: [],
                enableAnnouncement: __('Screen Reader, set to Slow.', 'website-accessibility')
            },
            {
                name: __('Fast', 'website-accessibility'),
                value: 'fast',
                rate: 1.2,
                pitch: 1,
                lang: 'en-US',
                voiceURI: 'Google US English', // optional
                css: [],
                enableAnnouncement: __('Screen Reader, set to Fast', 'website-accessibility')
            }
        ]
    },
    {
        key: 'smartContrast',
        label: __('Smart Contrast', 'website-accessibility'),
        styleMethod: 'rootClass',
        disableAnnouncement: __('The smart contrast setting has been disabled.', 'website-accessibility'),
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="16" height="16" rx="8" stroke="#1a4cd8" strokeWidth="2" />
                <path d="M4 12h16" stroke="#1a4cd8" strokeWidth="2" />
            </svg>
        ),
        attributes: [
            {
                name: __('Enable', 'website-accessibility'),
                value: 'enable',
                css: [],
                enableAnnouncement: __('Smart Contrast Mode Enable.', 'website-accessibility')
            },
            {
                name: __('Disable', 'website-accessibility'),
                value: 'disable',
                css: []
            }
        ]
    },
    {
        key: 'highlightLinks',
        label: __('Highlight Links', 'website-accessibility'),
        styleMethod: 'inline',
        disableAnnouncement: __('The highlight links setting has been disabled.', 'website-accessibility'),
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="11" width="16" height="2" fill="#1a4cd8" />
                <rect x="4" y="17" width="16" height="2" fill="#1a4cd8" />
            </svg>
        ),
        attributes: [
            {
                name: __('Enable', 'website-accessibility'),
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
                ],
                enableAnnouncement: __('Highlight Links Enable.', 'website-accessibility')
            },
            {
                name: __('Disable', 'website-accessibility'),
                value: 'disable',
                css: []
            }
        ]
    },
    {
        key: 'biggerText',
        label: __('Bigger Text', 'website-accessibility'),
        styleMethod: 'styleTag',
        disableAnnouncement: __('The bigger text setting has been disabled.', 'website-accessibility'),
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <text x="12" y="18" textAnchor="middle" fontSize="16" fill="#1a4cd8" fontWeight="bold">A</text>
            </svg>
        ),
        attributes: [
            {
                name: __('Medium', 'website-accessibility'),
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
                ],
                enableAnnouncement: __('Bigger Text, set to Medium.', 'website-accessibility')
            },
            {
                name: __('Large', 'website-accessibility'),
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
                ],
                enableAnnouncement: __('Bigger Text, set to Large.', 'website-accessibility')
            },
            {
                name: __('Extra Large', 'website-accessibility'),
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
                ],
                enableAnnouncement: __('Bigger Text, set to Extra Large.', 'website-accessibility')
            },
            {
                name: __('Huge', 'website-accessibility'),
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
                ],
                enableAnnouncement: __('Bigger Text, set to Huge.', 'website-accessibility')
            }
        ]
    },
    {
        key: 'textSpacing',
        label: __('Text Spacing', 'website-accessibility'),
        styleMethod: 'styleTag',
        disableAnnouncement: __('The text spacing setting has been disabled.', 'website-accessibility'),
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="8" width="16" height="2" fill="#1a4cd8" />
                <rect x="4" y="14" width="16" height="2" fill="#1a4cd8" />
            </svg>
        ),
        attributes: [
            {
                name: __('Medium', 'website-accessibility'),
                value: 'medium',
                css: [
                    {
                        selector: 'body, p, div, span, li, td, th, h1, h2, h3, h4, h5, h6',
                        properties: {
                            letterSpacing: '0.5px',
                            wordSpacing: '2px'
                        }
                    }
                ],
                enableAnnouncement: __('Text Spacing, set to Medium.', 'website-accessibility')
            },
            {
                name: __('Large', 'website-accessibility'),
                value: 'large',
                css: [
                    {
                        selector: 'body, p, div, span, li, td, th, h1, h2, h3, h4, h5, h6',
                        properties: {
                            letterSpacing: '1px',
                            wordSpacing: '4px'
                        }
                    }
                ],
                enableAnnouncement: __('Text Spacing, set to Large.', 'website-accessibility')
            },
            {
                name: __('Extra Large', 'website-accessibility'),
                value: 'extra-large',
                css: [
                    {
                        selector: 'body, p, div, span, li, td, th, h1, h2, h3, h4, h5, h6',
                        properties: {
                            letterSpacing: '2px',
                            wordSpacing: '8px'
                        }
                    }
                ],
                enableAnnouncement: __('Text Spacing, set to Extra Large.', 'website-accessibility')
            }
        ]
    },
    {
        key: 'pauseAnimations',
        label: __('Pause Animations', 'website-accessibility'),
        styleMethod: 'styleTag',
        disableAnnouncement: __('The pause animations setting has been disabled.', 'website-accessibility'),
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="4" width="4" height="16" rx="2" fill="#1a4cd8" />
                <rect x="14" y="4" width="4" height="16" rx="2" fill="#1a4cd8" />
            </svg>
        ),
        attributes: [
            {
                name: __('Enable', 'website-accessibility'),
                value: 'enable',
                css: [
                    {
                        selector: '*',
                        properties: {
                            animation: 'none',
                            transition: 'none'
                        }
                    }
                ],
                enableAnnouncement: __('Pause Animations Enable.', 'website-accessibility')
            },
            {
                name: __('Disable', 'website-accessibility'),
                value: 'disable',
                css: []
            }
        ]
    },
    {
        key: 'hideImages',
        label: __('Hide Images', 'website-accessibility'),
        styleMethod: 'inline',
        disableAnnouncement: __('The hide images setting has been disabled.', 'website-accessibility'),
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="16" height="16" rx="4" stroke="#1a4cd8" strokeWidth="2" />
                <path d="M4 4l16 16" stroke="#1a4cd8" strokeWidth="2" />
            </svg>
        ),
        attributes: [
            {
                name: __('Enable', 'website-accessibility'),
                value: 'enable',
                css: [
                    {
                        selector: 'img',
                        properties: {
                            display: 'none'
                        }
                    }
                ],
                enableAnnouncement: __('Hide Images Enable.', 'website-accessibility')
            },
            {
                name: __('Disable', 'website-accessibility'),
                value: 'disable',
                css: []
            }
        ]
    },
    {
        key: 'dyslexiaFriendly',
        label: __('Dyslexia Friendly', 'website-accessibility'),
        styleMethod: 'styleTag',
        disableAnnouncement: __('The dyslexia friendly setting has been disabled.', 'website-accessibility'),
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <text x="12" y="18" textAnchor="middle" fontSize="16" fill="#1a4cd8" fontWeight="bold">Df</text>
            </svg>
        ),
        attributes: [
            {
                name: __('Enable', 'website-accessibility'),
                value: 'enable',
                css: [
                    {
                        selector: 'body, p, div, span, li, td, th, h1, h2, h3, h4, h5, h6',
                        properties: {
                            fontFamily: 'OpenDyslexic, Arial, sans-serif',
                            lineHeight: '1.8',
                            letterSpacing: '1px'
                        }
                    }
                ],
                enableAnnouncement: __('Dyslexia Friendly Enable.', 'website-accessibility')
            },
            {
                name: __('Disable', 'website-accessibility'),
                value: 'disable',
                css: []
            }
        ]
    },
    {
        key: 'cursor',
        label: __('Cursor', 'website-accessibility'),
        styleMethod: 'styleTag',
        disableAnnouncement: __('The cursor setting has been disabled.', 'website-accessibility'),
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <polygon points="4,4 20,12 13,13 12,20" stroke="#1a4cd8" strokeWidth="2" fill="none" />
            </svg>
        ),
        attributes: [
            {
                name: __('Mask', 'website-accessibility'),
                value: 'mask',
                css: [
                    {
                        selector: '*',
                        properties: {
                            cursor: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'><circle cx=\'16\' cy=\'16\' r=\'12\' fill=\'%23000\' stroke=\'%23fff\' stroke-width=\'2\'/></svg>") 16 16, auto'
                        }
                    }
                ],
                enableAnnouncement: __('Cursor Mask Enable.', 'website-accessibility')
            },
            {
                name: __('Guideline', 'website-accessibility'),
                value: 'guideline',
                css: [
                    {
                        selector: '*',
                        properties: {
                            cursor: 'crosshair'
                        }
                    }
                ],
                enableAnnouncement: __('Cursor Guideline Enable.', 'website-accessibility')
            }
        ]
    },
    {
        key: 'tooltips',
        label: __('Tooltips', 'website-accessibility'),
        styleMethod: 'rootClass',
        disableAnnouncement: __('The tooltips setting has been disabled.', 'website-accessibility'),
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#1a4cd8" strokeWidth="2" />
                <text x="12" y="16" textAnchor="middle" fontSize="14" fill="#1a4cd8">i</text>
            </svg>
        ),
        attributes: [
            {
                name: __('Enable', 'website-accessibility'),
                value: 'enable',
                css: [],
                enableAnnouncement: __('Tooltips Enable.', 'website-accessibility')
            },
            {
                name: __('Disable', 'website-accessibility'),
                value: 'disable',
                css: []
            }
        ]
    },
    {
        key: 'lineHeight',
        label: __('Line Height', 'website-accessibility'),
        styleMethod: 'styleTag',
        disableAnnouncement: __('The line height setting has been disabled.', 'website-accessibility'),
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="16" height="16" rx="4" stroke="#1a4cd8" strokeWidth="2" />
            </svg>
        ),
        attributes: [
            {
                name: __('Medium', 'website-accessibility'),
                value: 'medium',
                css: [
                    {
                        selector: 'p, div, li, td, th',
                        properties: {
                            lineHeight: '1.6'
                        }
                    }
                ],
                enableAnnouncement: __('Line Height, set to Medium.', 'website-accessibility')
            },
            {
                name: __('Large', 'website-accessibility'),
                value: 'large',
                css: [
                    {
                        selector: 'p, div, li, td, th',
                        properties: {
                            lineHeight: '1.8'
                        }
                    }
                ],
                enableAnnouncement: __('Line Height, set to Large.', 'website-accessibility')
            },
            {
                name: __('Extra Large', 'website-accessibility'),
                value: 'extra-large',
                css: [
                    {
                        selector: 'p, div, li, td, th',
                        properties: {
                            lineHeight: '2.2'
                        }
                    }
                ],
                enableAnnouncement: __('Line Height, set to Extra Large.', 'website-accessibility')
            }
        ]
    },
    {
        key: 'textAlign',
        label: __('Text Alignment', 'website-accessibility'),
        styleMethod: 'styleTag',
        disableAnnouncement: __('The text alignment setting has been disabled.', 'website-accessibility'),
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="16" height="16" rx="4" stroke="#1a4cd8" strokeWidth="2" />
            </svg>
        ),
        attributes: [
            {
                name: __('Left', 'website-accessibility'),
                value: 'left',
                css: [
                    {
                        selector: 'body, p, div, h1, h2, h3, h4, h5, h6',
                        properties: {
                            textAlign: 'left'
                        }
                    }
                ],
                enableAnnouncement: __('Text Alignment, set to Left.', 'website-accessibility')
            },
            {
                name: __('Center', 'website-accessibility'),
                value: 'center',
                css: [
                    {
                        selector: 'body, p, div, h1, h2, h3, h4, h5, h6',
                        properties: {
                            textAlign: 'center'
                        }
                    }
                ],
                enableAnnouncement: __('Text Alignment, set to Center.', 'website-accessibility')
            },
            {
                name: __('Right', 'website-accessibility'),
                value: 'right',
                css: [
                    {
                        selector: 'body, p, div, h1, h2, h3, h4, h5, h6',
                        properties: {
                            textAlign: 'right'
                        }
                    }
                ],
                enableAnnouncement: __('Text Alignment, set to Right.', 'website-accessibility')
            },
            {
                name: __('Justify', 'website-accessibility'),
                value: 'justify',
                css: [
                    {
                        selector: 'body, p, div, h1, h2, h3, h4, h5, h6',
                        properties: {
                            textAlign: 'justify'
                        }
                    }
                ],
                enableAnnouncement: __('Text Alignment, set to Justify.', 'website-accessibility')
            }
        ]
    },
    {
        key: 'saturation',
        label: __('Saturation', 'website-accessibility'),
        styleMethod: 'inline',
        disableAnnouncement: __('The saturation setting has been disabled.', 'website-accessibility'),
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="16" height="16" rx="4" stroke="#1a4cd8" strokeWidth="2" />
            </svg>
        ),
        attributes: [
            {
                name: __('Low', 'website-accessibility'),
                value: 'low',
                css: [
                    {
                        selector: 'img, video',
                        properties: {
                            filter: 'saturate(0.5)'
                        }
                    }
                ],
                enableAnnouncement: __('Saturation, set to Low.', 'website-accessibility')
            },
            {
                name: __('High', 'website-accessibility'),
                value: 'high',
                css: [
                    {
                        selector: 'img, video',
                        properties: {
                            filter: 'saturate(1.5)'
                        }
                    }
                ],
                enableAnnouncement: __('Saturation, set to High.', 'website-accessibility')
            },
            {
                name: __('Desaturate', 'website-accessibility'),
                value: 'desaturate',
                css: [
                    {
                        selector: 'img, video',
                        properties: {
                            filter: 'saturate(0)'
                        }
                    }
                ],
                enableAnnouncement: __('Saturation, set to Desaturate.', 'website-accessibility')
            }
        ]
    },
    {
        key: 'dictionary',
        label: __('Dictionary', 'website-accessibility'),
        styleMethod: 'rootClass',
        disableAnnouncement: __('The dictionary setting has been disabled.', 'website-accessibility'),
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="16" height="16" rx="4" stroke="#1a4cd8" strokeWidth="2" />
            </svg>
        ),
        attributes: [
            {
                name: __('Enable', 'website-accessibility'),
                value: 'enable',
                css: [],
                enableAnnouncement: __('Dictionary Enable.', 'website-accessibility')
            },
            {
                name: __('Disable', 'website-accessibility'),
                value: 'disable',
                css: [],
                enableAnnouncement: __('Dictionary Disable.', 'website-accessibility')
            }
        ]
    }
];