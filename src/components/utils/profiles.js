import {
    MotorIcon,
    ColorBlindIcon,
    LowVisionIcon,
    CognitiveIcon,
    SeizureIcon,
    ADHDIcon,
} from "../../assets/profiles-icons";

const defaultProfiles = [
    {
        id: "motor",
        title: { rendered: "Motor Impaired", raw: "Motor Impaired" },
        slug: "motor",
        icon: <MotorIcon />,
        features: {
            tooltips: "enable",
        },
    },
    {
        id: "color-blind",
        title: { rendered: "Color Blind", raw: "Color Blind" },
        slug: "color-blind",
        icon: <ColorBlindIcon />,
        features: {
            smartContrast: "enable",
            saturation: "high",
        },
    },
    {
        id: "low-vision",
        title: { rendered: "Low vision", raw: "Low vision" },
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
        title: { rendered: "Cognitive & Learning", raw: "Cognitive & Learning" },
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
        title: { rendered: "Seizure & Epileptic", raw: "Seizure & Epileptic" },
        slug: "seizure",
        icon: <SeizureIcon />,
        features: {
            saturation: "low",
        },
    },
    {
        id: "adhd",
        title: { rendered: "ADHD", raw: "ADHD" },
        slug: "adhd",
        icon: <ADHDIcon />,
        features: {
            cursor: "mask",
            saturation: "low",
        },
    },
];

export default defaultProfiles;