import {
    MotorIcon,
    ColorBlindIcon,
    LowVisionIcon,
    CognitiveIcon,
    SeizureIcon,
    ADHDIcon,
} from "../assets/profiles-icons";
import { __ } from "@wordpress/i18n";

const defaultProfiles = [
    {
        id: "motor",
        title: { rendered: __("Motor Impaired", "website-accessibility"), raw: __("Motor Impaired", "website-accessibility") },
        slug: "motor",
        icon: <MotorIcon />,
        features: {
            cursor: "big-cursor",           // Easier to track pointer
            keyboardNavigation: "enable",   // Enables full keyboard control
            tooltips: "enable",             // Helps clarify actions
            pauseAnimations: "enable"       // Avoid distraction from moving elements
        },
    },
    {
        id: "color-blind",
        title: { rendered: __("Color Blind", "website-accessibility"), raw: __("Color Blind", "website-accessibility") },
        slug: "color-blind",
        icon: <ColorBlindIcon />,
        features: {
            smartContrast: "enable",        // Ensures text/background are distinguishable
            grayscale: "medium",            // Reduces reliance on color differentiation
            highlightLinks: "enable"        // Makes links easier to identify
        },
    },
    {
        id: "low-vision",
        title: { rendered: __("Low Vision", "website-accessibility"), raw: __("Low Vision", "website-accessibility") },
        slug: "low-vision",
        icon: <LowVisionIcon />,
        features: {
            biggerText: "extra-large",      // Easier to read
            cursor: "big-cursor",           // Easier to locate pointer
            tooltips: "enable",             // Clarifies elements
            brightness: "high",             // Better visibility
            saturation: "high",             // Better visibility
            lineHeight: "large"             // Easier to follow text
        },
    },
    {
        id: "cognitive",
        title: { rendered: __("Cognitive & Learning", "website-accessibility"), raw: __("Cognitive & Learning", "website-accessibility") },
        slug: "cognitive",
        icon: <CognitiveIcon />,
        features: {
            smartContrast: "enable",        // Helps distinguish content
            biggerText: "medium",           // Easier reading without overwhelming layout
            cursor: "guideline",            // Focus aid for reading text
            textSpacing: "medium",            // Improves readability and comprehension
            lineHeight: "medium"              // Makes text flow easier to follow
        },
    },
    {
        id: "seizure",
        title: { rendered: __("Seizure & Epileptic", "website-accessibility"), raw: __("Seizure & Epileptic", "website-accessibility") },
        slug: "seizure",
        icon: <SeizureIcon />,
        features: {
            smartContrast: "enable",        // Helps distinguish content
            pauseAnimations: "enable",      // Prevent flashing content
            saturation: "low",              // Reduces intense colors
            contrast: "light",              // Avoid high contrast triggers
            brightness: "medium"            // Comfortable viewing
        },
    },
    {
        id: "adhd",
        title: { rendered: __("ADHD", "website-accessibility"), raw: __("ADHD", "website-accessibility") },
        slug: "adhd",
        icon: <ADHDIcon />,
        features: {
            cursor: "mask",                 // Helps focus on the current area
            saturation: "low",              // Reduces visual overstimulation
            pauseAnimations: "enable",      // Reduces distraction
            highlightLinks: "enable",       // Easier navigation and focus
            textSpacing: "medium"           // Prevents text from feeling crowded
        },
    },
];

export default defaultProfiles;