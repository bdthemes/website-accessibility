import { __ } from '@wordpress/i18n';
import GetStartedPreset from './components/preset-get-started';
import ButtonStylePreset from './components/preset-button-style';
import PanelCustomizationPreset from './components/preset-panel-customization';
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
        label: `${__('Singular', 'website-accessibility')} (Only PRO)`,
        value: 'singular',
        disabled: true,
        description: __('Apply to individual posts and pages', 'website-accessibility')
    },
    {
        label: `${__('Archive', 'website-accessibility')} (Only PRO)`,
        value: 'archive',
        disabled: true,
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
        label: 'Contrast +', icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#1a4cd8" strokeWidth="2" /><path d="M12 2v20" stroke="#1a4cd8" strokeWidth="2" /></svg>
        )
    },
    {
        label: 'Screen Reader', icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#1a4cd8" strokeWidth="2" /><path d="M8 12h8" stroke="#1a4cd8" strokeWidth="2" /><path d="M12 8v8" stroke="#1a4cd8" strokeWidth="2" /></svg>
        )
    },
    {
        label: 'Smart Contrast', icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="8" stroke="#1a4cd8" strokeWidth="2" /><path d="M4 12h16" stroke="#1a4cd8" strokeWidth="2" /></svg>
        )
    },
    {
        label: 'Highlight Links', icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="11" width="16" height="2" fill="#1a4cd8" /><rect x="4" y="17" width="16" height="2" fill="#1a4cd8" /></svg>
        )
    },
    {
        label: 'Bigger Text', icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><text x="12" y="18" textAnchor="middle" fontSize="16" fill="#1a4cd8" fontWeight="bold">A</text></svg>
        )
    },
    {
        label: 'Text Spacing', icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="8" width="16" height="2" fill="#1a4cd8" /><rect x="4" y="14" width="16" height="2" fill="#1a4cd8" /></svg>
        )
    },
    {
        label: 'Pause Animations', icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="6" y="4" width="4" height="16" rx="2" fill="#1a4cd8" /><rect x="14" y="4" width="4" height="16" rx="2" fill="#1a4cd8" /></svg>
        )
    },
    {
        label: 'Hide Images', icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="4" stroke="#1a4cd8" strokeWidth="2" /><path d="M4 4l16 16" stroke="#1a4cd8" strokeWidth="2" /></svg>
        )
    },
    {
        label: 'Dyslexia Friendly', icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><text x="12" y="18" textAnchor="middle" fontSize="16" fill="#1a4cd8" fontWeight="bold">Df</text></svg>
        )
    },
    {
        label: 'Cursor', icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><polygon points="4,4 20,12 13,13 12,20" stroke="#1a4cd8" strokeWidth="2" fill="none" /></svg>
        )
    },
    {
        label: 'Tooltips', icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#1a4cd8" strokeWidth="2" /><text x="12" y="16" textAnchor="middle" fontSize="14" fill="#1a4cd8">i</text></svg>
        )
    },
    {
        label: 'Page Structure', icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="4" stroke="#1a4cd8" strokeWidth="2" /><rect x="8" y="8" width="8" height="8" rx="2" stroke="#1a4cd8" strokeWidth="2" /></svg>
        )
    },
    {
        label: 'Line Height', icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4" stroke="#1a4cd8" strokeWidth="2" /></svg>
        )
    },
    {
        label: 'Text Align', icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="6" width="16" height="2" fill="#1a4cd8" /><rect x="4" y="11" width="10" height="2" fill="#1a4cd8" /><rect x="4" y="16" width="16" height="2" fill="#1a4cd8" /></svg>
        )
    },
    {
        label: 'Saturation', icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="12" rx="8" ry="10" stroke="#1a4cd8" strokeWidth="2" /><ellipse cx="12" cy="12" rx="4" ry="5" fill="#1a4cd8" /></svg>
        )
    },
];

export const getBorder = (value, prefix) => {
    let border = {};
    
    // If no value provided, return empty object
    if (!value) {
        return border;
    }
    
    // Handle unified border (all sides same)
    if (value?.width && value?.color) {
        const borderValue = `${value.width} ${value.style || 'solid'} ${value.color}`;
        border[`${prefix}-left`] = borderValue;
        border[`${prefix}-right`] = borderValue;
        border[`${prefix}-top`] = borderValue;
        border[`${prefix}-bottom`] = borderValue;
    } else {
        // Handle individual side borders
        const sides = ['left', 'right', 'top', 'bottom'];
        
        sides.forEach(side => {
            const sideValue = value[side];
            if (sideValue?.width && sideValue?.color) {
                border[`${prefix}-${side}`] = `${sideValue.width} ${sideValue.style || 'solid'} ${sideValue.color}`;
            }
        });
    }
    
    return border;
};

