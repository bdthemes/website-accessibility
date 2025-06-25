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
