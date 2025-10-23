import {
    MotorIcon,
    ColorBlindIcon,
    LowVisionIcon,
    CognitiveIcon,
    SeizureIcon,
    ADHDIcon,
} from "../../assets/profiles-icons";
import { __ } from "@wordpress/i18n";

const defaultProfiles = [
    {
        id: "motor",
        title: { rendered: __("Motor Impaired", "website-accessibility"), raw: __("Motor Impaired", "website-accessibility") },
        slug: "motor",
        icon: <MotorIcon />,
        features: {
            tooltips: "enable",
        },
    },
    {
        id: "color-blind",
        title: { rendered: __("Color Blind", "website-accessibility"), raw: __("Color Blind", "website-accessibility") },
        slug: "color-blind",
        icon: <ColorBlindIcon />,
        features: {
            smartContrast: "enable",
            saturation: "high",
        },
    },
    {
        id: "low-vision",
        title: { rendered: __("Low Vision", "website-accessibility"), raw: __("Low Vision", "website-accessibility") },
        slug: "low-vision",
        icon: <LowVisionIcon />,
        features: {
            biggerText: "medium",
            cursor: "big-cursor",
            tooltips: "enable",
            saturation: "high",
        },
    },
    {
        id: "cognitive",
        title: { rendered: __("Cognitive & Learning", "website-accessibility"), raw: __("Cognitive & Learning", "website-accessibility") },
        slug: "cognitive",
        icon: <CognitiveIcon />,
        features: {
            smartContrast: "enable",
            biggerText: "medium",
            cursor: "guideline",
            tooltips: "enable"
        },
    },
    {
        id: "seizure",
        title: { rendered: __("Seizure & Epileptic", "website-accessibility"), raw: __("Seizure & Epileptic", "website-accessibility") },
        slug: "seizure",
        icon: <SeizureIcon />,
        features: {
            saturation: "low",
        },
    },
    {
        id: "adhd",
        title: { rendered: __("ADHD", "website-accessibility"), raw: __("ADHD", "website-accessibility") },
        slug: "adhd",
        icon: <ADHDIcon />,
        features: {
            cursor: "mask",
            saturation: "low",
        },
    },
];

export default defaultProfiles;