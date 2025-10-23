import { __ } from "@wordpress/i18n";
const features = [
    {
        key: "contrast",
        label: __("Contrast +", "website-accessibility"),
        styleMethod: "inline",
        disableAnnouncement: __(
            "The contrast setting has been disabled.",
            "website-accessibility",
        ),
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.25 12C20.25 7.44365 16.5563 3.75 12 3.75C7.44365 3.75 3.75 7.44365 3.75 12C3.75 16.5563 7.44365 20.25 12 20.25C16.5563 20.25 20.25 16.5563 20.25 12ZM21.75 12C21.75 17.3848 17.3848 21.75 12 21.75C6.61522 21.75 2.25 17.3848 2.25 12C2.25 6.61522 6.61522 2.25 12 2.25C17.3848 2.25 21.75 6.61522 21.75 12Z" fill="black" />
                <path d="M12.75 3.5V20.5H11.25V3.5H12.75Z" fill="black" />
                <path d="M11.5 15.25V16.75H4V15.25H11.5ZM11.5 11.25V12.75H3V11.25H11.5ZM11.5 7.25V8.75H4V7.25H11.5Z" fill="black" />
            </svg>
        ),
        attributes: [
            {
                name: __("Invert", "website-accessibility"),
                value: "invert",
                enableAnnouncement: __(
                    "Enable Contrast Mode, set to Invert.",
                    "website-accessibility",
                ),
                css: [
                    {
                        selector: "html",
                        properties: {
                            filter: "invert(1)",
                        },
                    },
                    {
                        selector: ".wap-preset__preview-drawer ",
                        properties: {
                            filter: "invert(1)",
                        },
                    },
                ],
            },
            {
                name: __("Dark", "website-accessibility"),
                value: "dark",
                enableAnnouncement: __(
                    "Contrast Mode, set to Dark.",
                    "website-accessibility",
                ),
                css: [
                    {
                        selector: "body, main, section, article, nav, aside, div",
                        properties: {
                            background: "#111",
                            color: "#e0e0e0",
                        },
                    },
                    {
                        selector: "h1, h2, h3, h4, h5, h6",
                        properties: {
                            color: "#fff",
                        },
                    },
                    {
                        selector: "a",
                        properties: {
                            color: "#4fd1c5",
                        },
                    },
                    {
                        selector: "input, textarea, select, button",
                        properties: {
                            background: "#222",
                            color: "#e0e0e0",
                            borderColor: "#444",
                        },
                    },
                ],
            },
            {
                name: __("Light", "website-accessibility"),
                value: "light",
                enableAnnouncement: __(
                    "Contrast Mode, set to Light.",
                    "website-accessibility",
                ),
                css: [
                    {
                        selector:
                            "body, main, section, article, nav, aside, div",
                        properties: {
                            background: "#fff",
                            color: "#222",
                        },
                    },
                    {
                        selector: "h1, h2, h3, h4, h5, h6",
                        properties: {
                            color: "#111",
                        },
                    },
                    {
                        selector: "a",
                        properties: {
                            color: "#1a4cd8",
                        },
                    },
                    {
                        selector: "input, textarea, select, button",
                        properties: {
                            background: "#f5f7fa",
                            color: "#222",
                            borderColor: "#ccc",
                        },
                    },
                ],
            },
        ],
    },
    {
        key: "highlightLinks",
        label: __("Highlight Links", "website-accessibility"),
        styleMethod: "inline",
        disableAnnouncement: __(
            "The highlight links setting has been disabled.",
            "website-accessibility",
        ),
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.25 12C1.25 9.37665 3.37665 7.25 6 7.25H10.333C10.7472 7.25 11.083 7.58579 11.083 8C11.083 8.41421 10.7472 8.75 10.333 8.75H6C4.20507 8.75 2.75 10.2051 2.75 12C2.75 13.7949 4.20508 15.25 6 15.25H10.333C10.7472 15.25 11.083 15.5858 11.083 16C11.083 16.4142 10.7472 16.75 10.333 16.75H6C3.37665 16.75 1.25 14.6234 1.25 12Z" fill="black" />
                <path d="M22.75 12C22.75 9.37665 20.6234 7.25 18 7.25H13.667C13.2528 7.25 12.917 7.58579 12.917 8C12.917 8.41421 13.2528 8.75 13.667 8.75H18C19.7949 8.75 21.25 10.2051 21.25 12C21.25 13.7949 19.7949 15.25 18 15.25H13.667C13.2528 15.25 12.917 15.5858 12.917 16C12.917 16.4142 13.2528 16.75 13.667 16.75H18C20.6234 16.75 22.75 14.6234 22.75 12Z" fill="black" />
                <path d="M15.75 11.25C16.1642 11.25 16.5 11.5858 16.5 12C16.5 12.4142 16.1642 12.75 15.75 12.75H8.25C7.83579 12.75 7.5 12.4142 7.5 12C7.5 11.5858 7.83579 11.25 8.25 11.25H15.75Z" fill="black" />
            </svg>
        ),
        attributes: [
            {
                name: __("Enable", "website-accessibility"),
                value: "enable",
                css: [
                    {
                        selector: "a",
                        properties: {
                            backgroundColor: "#ffff00",
                            color: "#000",
                        },
                    },
                ],
                enableAnnouncement: __(
                    "Highlight Links Enable.",
                    "website-accessibility",
                ),
            },
            {
                name: __("Disable", "website-accessibility"),
                value: "disable",
                css: [],
            },
        ],
    },
    {
        key: "biggerText",
        label: __("Bigger Text", "website-accessibility"),
        styleMethod: "styleTag",
        disableAnnouncement: __(
            "The bigger text setting has been disabled.",
            "website-accessibility",
        ),
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.2503 7.31055V4.75H17.1946V19.25H19.7776C20.1919 19.25 20.5276 19.5858 20.5276 20C20.5276 20.4142 20.1919 20.75 19.7776 20.75H13.1107C12.6966 20.7498 12.3607 20.4141 12.3607 20C12.3607 19.5859 12.6966 19.2502 13.1107 19.25H15.6946V4.75H11.0833V7.31055C11.0832 7.72467 10.7475 8.06055 10.3333 8.06055C9.91917 8.06055 9.58342 7.72467 9.58331 7.31055V4C9.58331 3.58579 9.9191 3.25 10.3333 3.25H22.0003C22.4144 3.25018 22.7503 3.58589 22.7503 4V7.31055C22.7502 7.72456 22.4143 8.06037 22.0003 8.06055C21.5862 8.06055 21.2504 7.72467 21.2503 7.31055Z" fill="black" />
                <path d="M7.91699 12.1237V10.819H6.24219V19.2496H7.39648C7.81058 19.2496 8.14629 19.5856 8.14648 19.9996C8.14648 20.4138 7.8107 20.7496 7.39648 20.7496H3.58691C3.17288 20.7494 2.83691 20.4137 2.83691 19.9996C2.83711 19.5857 3.173 19.2498 3.58691 19.2496H4.74219V10.819H2.75V12.1237C2.75 12.5379 2.41421 12.8737 2 12.8737C1.58579 12.8737 1.25 12.5379 1.25 12.1237V10.069C1.25 9.65476 1.58579 9.31897 2 9.31897H8.66699C9.08106 9.31915 9.41699 9.65486 9.41699 10.069V12.1237C9.41699 12.5378 9.08106 12.8735 8.66699 12.8737C8.25278 12.8737 7.91699 12.5379 7.91699 12.1237Z" fill="black" />
            </svg>
        ),
        attributes: [
            {
                name: __("Medium", "website-accessibility"),
                value: "medium",
                properties: ['font-size'],
                percent: 20,
                enableAnnouncement: __(
                    "Bigger Text, set to Medium.",
                    "website-accessibility",
                ),
            },
            {
                name: __("Large", "website-accessibility"),
                value: "large",
                properties: ['font-size'],
                percent: 40,
                enableAnnouncement: __(
                    "Bigger Text, set to Large.",
                    "website-accessibility",
                ),
            },
            {
                name: __("Extra Large", "website-accessibility"),
                value: "extra-large",
                properties: ['font-size'],
                percent: 60,
                enableAnnouncement: __(
                    "Bigger Text, set to Extra Large.",
                    "website-accessibility",
                ),
            },
            {
                name: __("Huge", "website-accessibility"),
                value: "huge",
                properties: ['font-size'],
                percent: 80,
                enableAnnouncement: __(
                    "Bigger Text, set to Huge.",
                    "website-accessibility",
                ),
            },
        ],
    },
    {
        key: "textSpacing",
        label: __("Text Spacing", "website-accessibility"),
        styleMethod: "styleTag",
        disableAnnouncement: __(
            "The text spacing setting has been disabled.",
            "website-accessibility",
        ),
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.54199 6.50194C5.81714 6.1924 6.29099 6.16438 6.60058 6.43944C6.91013 6.7146 6.93817 7.18845 6.66308 7.49803L3.66992 10.8652H5.07715C5.49121 10.8653 5.82706 11.2012 5.82715 11.6152C5.82715 12.0294 5.49125 12.3651 5.07715 12.3652H3.66992L6.66308 15.7324C6.93827 16.042 6.91016 16.5158 6.60058 16.791C6.29108 17.0661 5.81721 17.0388 5.54199 16.7295L1.43945 12.1133C1.18705 11.8291 1.18695 11.4013 1.43945 11.1172L5.54199 6.50194ZM13.7949 10.8652C14.2091 10.8652 14.5448 11.2011 14.5449 11.6152C14.5449 12.0294 14.2091 12.3652 13.7949 12.3652H9.69238C9.27817 12.3652 8.94238 12.0294 8.94238 11.6152C8.94246 11.2011 9.27822 10.8652 9.69238 10.8652H13.7949Z" fill="black" />
                <path d="M18.458 6.50194C18.1829 6.1924 17.709 6.16438 17.3994 6.43944C17.0899 6.7146 17.0618 7.18845 17.3369 7.49803L20.3301 10.8652H18.9228C18.5088 10.8653 18.1729 11.2012 18.1728 11.6152C18.1728 12.0294 18.5087 12.3651 18.9228 12.3652H20.3301L17.3369 15.7324C17.0617 16.042 17.0898 16.5158 17.3994 16.791C17.7089 17.0661 18.1828 17.0388 18.458 16.7295L22.5605 12.1133C22.8129 11.8291 22.813 11.4013 22.5605 11.1172L18.458 6.50194Z" fill="black" />
            </svg>
        ),
        attributes: [
            {
                name: __("Medium", "website-accessibility"),
                value: "medium",
                css: [
                    {
                        selector: "body, p, div, span, li, td, th, h1, h2, h3, h4, h5, h6",
                        properties: {
                            letterSpacing: "0.5px",
                            wordSpacing: "2px",
                        },
                    },
                ],
                enableAnnouncement: __(
                    "Text Spacing, set to Medium.",
                    "website-accessibility",
                ),
            },
            {
                name: __("Large", "website-accessibility"),
                value: "large",
                css: [
                    {
                        selector: "body, p, div, span, li, td, th, h1, h2, h3, h4, h5, h6",
                        properties: {
                            letterSpacing: "1px",
                            wordSpacing: "4px",
                        },
                    },
                ],
                enableAnnouncement: __(
                    "Text Spacing, set to Large.",
                    "website-accessibility",
                ),
            },
            {
                name: __("Extra Large", "website-accessibility"),
                value: "extra-large",
                css: [
                    {
                        selector: "body, p, div, span, li, td, th, h1, h2, h3, h4, h5, h6",
                        properties: {
                            letterSpacing: "2px",
                            wordSpacing: "8px",
                        },
                    },
                ],
                enableAnnouncement: __(
                    "Text Spacing, set to Extra Large.",
                    "website-accessibility",
                ),
            },
        ],
    },
    {
        key: "pauseAnimations",
        label: __("Pause Animations", "website-accessibility"),
        styleMethod: "styleTag",
        disableAnnouncement: __(
            "The pause animations setting has been disabled.",
            "website-accessibility",
        ),
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.66699 12.75L3 12.75C2.58579 12.75 2.25 12.4142 2.25 12C2.25 11.5858 2.58579 11.25 3 11.25L4.66699 11.25C5.08106 11.2502 5.41699 11.5859 5.41699 12C5.41699 12.4141 5.08106 12.7498 4.66699 12.75Z" fill="black" />
                <path d="M4.66699 12.75L3 12.75C2.58579 12.75 2.25 12.4142 2.25 12C2.25 11.5858 2.58579 11.25 3 11.25L4.66699 11.25C5.08106 11.2502 5.41699 11.5859 5.41699 12C5.41699 12.4141 5.08106 12.7498 4.66699 12.75Z" fill="black" />
                <path d="M4.66699 12.75L3 12.75C2.58579 12.75 2.25 12.4142 2.25 12C2.25 11.5858 2.58579 11.25 3 11.25L4.66699 11.25C5.08106 11.2502 5.41699 11.5859 5.41699 12C5.41699 12.4141 5.08106 12.7498 4.66699 12.75Z" fill="black" />
                <path d="M17.9772 7.69022L19.4209 6.85672C19.7796 6.64961 20.2383 6.77252 20.4454 7.13124C20.6525 7.48996 20.5296 7.94865 20.1709 8.15576L18.7272 8.98925C18.3686 9.19613 17.9098 9.07336 17.7027 8.71474C17.4957 8.35611 17.6187 7.8974 17.9772 7.69022Z" fill="black" />
                <path d="M7.68687 6.0261L6.85337 4.58244C6.64626 4.22372 6.76917 3.76503 7.12789 3.55792C7.48661 3.35082 7.9453 3.47372 8.15241 3.83244L8.9859 5.2761C9.19278 5.63478 9.07001 6.09357 8.71139 6.30062C8.35276 6.50767 7.89405 6.3846 7.68687 6.0261Z" fill="black" />
                <path d="M5.27609 8.98346L3.83244 8.14996C3.47372 7.94286 3.35081 7.48416 3.55792 7.12544C3.76503 6.76672 4.22372 6.64382 4.58244 6.85093L6.02609 7.68442C6.3846 7.89161 6.50767 8.35032 6.30061 8.70894C6.09356 9.06757 5.63477 9.19034 5.27609 8.98346Z" fill="black" />
                <path d="M8.98302 18.7256L8.14952 20.1692C7.94241 20.528 7.48372 20.6509 7.125 20.4438C6.76628 20.2366 6.64338 19.778 6.85048 19.4192L7.68398 17.9756C7.89116 17.6171 8.34987 17.494 8.7085 17.7011C9.06712 17.9081 9.1899 18.3669 8.98302 18.7256Z" fill="black" />
                <path d="M12.75 19.333L12.75 21C12.75 21.4142 12.4142 21.75 12 21.75C11.5858 21.75 11.25 21.4142 11.25 21L11.25 19.333C11.2502 18.9189 11.5859 18.583 12 18.583C12.4141 18.583 12.7498 18.9189 12.75 19.333Z" fill="black" />
                <path d="M21.0003 12.75L19.3333 12.75C18.9191 12.75 18.5833 12.4142 18.5833 12C18.5833 11.5858 18.9191 11.25 19.3333 11.25L21.0003 11.25C21.4144 11.2502 21.7503 11.5859 21.7503 12C21.7503 12.4141 21.4144 12.7498 21.0003 12.75Z" fill="black" />
                <path d="M21.0003 12.75L19.3333 12.75C18.9191 12.75 18.5833 12.4142 18.5833 12C18.5833 11.5858 18.9191 11.25 19.3333 11.25L21.0003 11.25C21.4144 11.2502 21.7503 11.5859 21.7503 12C21.7503 12.4141 21.4144 12.7498 21.0003 12.75Z" fill="black" />
                <path d="M21.0003 12.75L19.3333 12.75C18.9191 12.75 18.5833 12.4142 18.5833 12C18.5833 11.5858 18.9191 11.25 19.3333 11.25L21.0003 11.25C21.4144 11.2502 21.7503 11.5859 21.7503 12C21.7503 12.4141 21.4144 12.7498 21.0003 12.75Z" fill="black" />
                <path d="M3.83216 15.8569L5.27582 15.0234C5.63454 14.8163 6.09323 14.9392 6.30033 15.2979C6.50744 15.6566 6.38454 16.1153 6.02582 16.3224L4.58216 17.1559C4.22348 17.3628 3.76469 17.24 3.55764 16.8814C3.35059 16.5228 3.47366 16.0641 3.83216 15.8569Z" fill="black" />
                <path d="M15.8535 20.1712L15.02 18.7275C14.8129 18.3688 14.9358 17.9101 15.2946 17.703C15.6533 17.4959 16.112 17.6188 16.3191 17.9775L17.1526 19.4212C17.3594 19.7799 17.2367 20.2386 16.878 20.4457C16.5194 20.6528 16.0607 20.5297 15.8535 20.1712Z" fill="black" />
                <path d="M19.4212 17.1501L17.9775 16.3167C17.6188 16.1095 17.4959 15.6509 17.703 15.2921C17.9101 14.9334 18.3688 14.8105 18.7275 15.0176L20.1712 15.8511C20.5297 16.0583 20.6528 16.517 20.4457 16.8756C20.2386 17.2343 19.7799 17.357 19.4212 17.1501Z" fill="black" />
                <path d="M17.1497 4.5805L16.3162 6.02416C16.1091 6.38288 15.6504 6.50578 15.2917 6.29868C14.9329 6.09157 14.81 5.63288 15.0171 5.27416L15.8506 3.8305C16.0578 3.472 16.5165 3.34893 16.8752 3.55598C17.2338 3.76303 17.3566 4.22182 17.1497 4.5805Z" fill="black" />
                <path d="M12.75 2.99969L12.75 4.66669C12.75 5.0809 12.4142 5.41669 12 5.41669C11.5858 5.41669 11.25 5.0809 11.25 4.66669L11.25 2.99969C11.2502 2.58563 11.5859 2.24969 12 2.24969C12.4141 2.24969 12.7498 2.58563 12.75 2.99969Z" fill="black" />
                <path d="M9.57678 14.3325V9.33249C9.57678 8.91828 9.91257 8.58249 10.3268 8.58249C10.741 8.58249 11.0768 8.91828 11.0768 9.33249V14.3325C11.0768 14.7467 10.741 15.0825 10.3268 15.0825C9.91257 15.0825 9.57678 14.7467 9.57678 14.3325ZM12.9098 14.3325V9.33249C12.9098 8.91838 13.2457 8.58266 13.6598 8.58249C14.074 8.58249 14.4098 8.91828 14.4098 9.33249V14.3325C14.4098 14.7467 14.074 15.0825 13.6598 15.0825C13.2457 15.0823 12.9098 14.7466 12.9098 14.3325Z" fill="black" />
            </svg>

        ),
        attributes: [
            {
                name: __("Enable", "website-accessibility"),
                value: "enable",
                css: [
                    {
                        selector: "*",
                        properties: {
                            animation: "none",
                            transition: "none",
                        },
                    },
                ],
                enableAnnouncement: __(
                    "Pause Animations Enable.",
                    "website-accessibility",
                ),
            },
            {
                name: __("Disable", "website-accessibility"),
                value: "disable",
                css: [],
            },
        ],
    },
    {
        key: "hideImages",
        label: __("Hide Images", "website-accessibility"),
        styleMethod: "inline",
        disableAnnouncement: __(
            "The hide images setting has been disabled.",
            "website-accessibility",
        ),
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.1973 15.5303C20.0881 15.4961 19.9839 15.44 19.8965 15.3545L18.3154 13.8066L15.4404 16.6201L19.1328 20.2344C19.7351 20.1447 20.1973 19.6272 20.1973 19V15.5303ZM21.4697 3.46973C21.7626 3.17684 22.2374 3.17684 22.5303 3.46973C22.8232 3.76262 22.8232 4.23738 22.5303 4.53028L20.5605 6.5L22.5303 8.46973C22.8232 8.76262 22.8232 9.23738 22.5303 9.53028C22.2374 9.82317 21.7626 9.82317 21.4697 9.53028L19.5 7.56055L17.5303 9.53028C17.2374 9.82317 16.7626 9.82317 16.4697 9.53028C16.1768 9.23738 16.1768 8.76262 16.4697 8.46973L18.4395 6.5L16.4697 4.53028C16.1768 4.23738 16.1768 3.76262 16.4697 3.46973C16.7626 3.17684 17.2374 3.17684 17.5303 3.46973L19.5 5.43946L21.4697 3.46973ZM2.75 19C2.75 19.6904 3.30964 20.25 4 20.25H17.0029L7.2627 10.7168L2.75 15.1328V19ZM21.6973 19C21.6973 20.5188 20.466 21.75 18.9473 21.75H4C2.48122 21.75 1.25 20.5188 1.25 19V6.51563C1.25 4.99685 2.48122 3.76563 4 3.76563H14.6318C15.0459 3.76577 15.3818 4.1015 15.3818 4.51563C15.3816 4.92954 15.0458 5.26549 14.6318 5.26563H4C3.30964 5.26563 2.75 5.82527 2.75 6.51563V13.0342L6.73828 9.13086L6.85547 9.03711C7.14398 8.84988 7.533 8.88119 7.78809 9.13086L14.3682 15.5713L17.791 12.2217L17.9082 12.1279C18.1967 11.9408 18.5858 11.972 18.8408 12.2217L20.1973 13.5488V10.6973C20.1973 10.2831 20.5331 9.94733 20.9473 9.94727C21.3615 9.94727 21.6973 10.2831 21.6973 10.6973V19Z" fill="black" />
            </svg>
        ),
        attributes: [
            {
                name: __("Enable", "website-accessibility"),
                value: "enable",
                css: [
                    {
                        selector: "img",
                        properties: {
                            display: "none",
                        },
                    },
                ],
                enableAnnouncement: __("Hide Images Enable.", "website-accessibility"),
            },
            {
                name: __("Disable", "website-accessibility"),
                value: "disable",
                css: [],
            },
        ],
    },
    {
        key: "cursor",
        label: __("Cursor", "website-accessibility"),
        styleMethod: "styleTag",
        disableAnnouncement: __(
            "The cursor setting has been disabled.",
            "website-accessibility",
        ),
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.55566 5.31348C3.29033 4.25165 4.25165 3.29034 5.31348 3.55566L17.9922 6.72461C19.2639 7.04268 19.4937 8.75105 18.3516 9.39453L15.0059 11.2793L20.0137 16.2861C20.5972 16.8698 20.5761 17.8221 19.9678 18.3799L18.1016 20.0908C17.5211 20.6229 16.6218 20.5941 16.0762 20.0264L11.2686 15.0244L9.39453 18.3516C8.75105 19.4938 7.04268 19.2639 6.72461 17.9922L3.55566 5.31348ZM8.14941 17.5068L9.99512 14.2295C10.4424 13.4359 11.4891 13.2573 12.1729 13.8154L12.3047 13.9365L17.124 18.9512L18.915 17.3086L13.8994 12.2939C13.2208 11.6153 13.3769 10.476 14.2129 10.0049L17.5068 8.14941L5.03027 5.03027L8.14941 17.5068Z" fill="black" />
            </svg>
        ),
        attributes: [
            {
                name: __("Big Cursor", "website-accessibility"),
                value: "big-cursor",
                css: [
                    {
                        selector: "body, a, button, input, select, textarea, div",
                        properties: {
                            cursor:
                                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><path d='M2 2 L50 30 L32 34 L30 62 Z' fill='white' stroke='black' stroke-width='3'/></svg>\") 2 2, auto",
                        },
                    },
                ],
                enableAnnouncement: __("Big Cursor Enable.", "website-accessibility"),
            },
            {
                name: __("Mask", "website-accessibility"),
                value: "mask",
                css: [],
                enableAnnouncement: __("Cursor Mask Enable.", "website-accessibility"),
            },
            {
                name: __("Guideline", "website-accessibility"),
                value: "guideline",
                css: [],
                enableAnnouncement: __(
                    "Cursor Guideline Enable.",
                    "website-accessibility",
                ),
            },
        ],
    },
    {
        key: "tooltips",
        label: __("Tooltips", "website-accessibility"),
        styleMethod: "rootClass",
        disableAnnouncement: __(
            "The tooltips setting has been disabled.",
            "website-accessibility",
        ),
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.25 5C20.25 3.75736 19.2426 2.75 18 2.75H6C4.75736 2.75 3.75 3.75736 3.75 5V20.1924L6.2207 17.7295C6.92365 17.0285 7.87643 16.6348 8.86914 16.6348H18C19.2426 16.6348 20.2499 15.6273 20.25 14.3848V5ZM11.5068 14V8.5C11.5068 8.08589 11.8428 7.75017 12.2568 7.75C12.671 7.75 13.0068 8.08579 13.0068 8.5V14C13.0068 14.4142 12.671 14.75 12.2568 14.75C11.8428 14.7498 11.5068 14.4141 11.5068 14ZM11.5068 6V5.5C11.5068 5.08589 11.8428 4.75017 12.2568 4.75C12.671 4.75 13.0068 5.08579 13.0068 5.5V6C13.0068 6.41421 12.671 6.75 12.2568 6.75C11.8428 6.74983 11.5068 6.41411 11.5068 6ZM21.75 14.3848C21.7499 16.4558 20.071 18.1348 18 18.1348H8.86914C8.27366 18.1348 7.70201 18.3706 7.28027 18.791L3.5293 22.5312C3.31469 22.7451 2.99273 22.8084 2.71289 22.6924C2.4329 22.5762 2.25 22.3031 2.25 22V5C2.25 2.92893 3.92893 1.25 6 1.25H18C20.0711 1.25 21.75 2.92893 21.75 5V14.3848Z" fill="black" />
            </svg>
        ),
        attributes: [
            {
                name: __("Enable", "website-accessibility"),
                value: "enable",
                css: [],
                enableAnnouncement: __("Tooltips Enable.", "website-accessibility"),
            },
            {
                name: __("Disable", "website-accessibility"),
                value: "disable",
                css: [],
            },
        ],
    },
    {
        key: "lineHeight",
        label: __("Line Height", "website-accessibility"),
        styleMethod: "styleTag",
        disableAnnouncement: __(
            "The line height setting has been disabled.",
            "website-accessibility",
        ),
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.2726 16.4167C18.6868 16.4167 19.0226 16.7525 19.0226 17.1667C19.0226 17.5809 18.6868 17.9167 18.2726 17.9167H10.0909C9.6767 17.9167 9.34091 17.5809 9.34091 17.1667C9.34091 16.7525 9.6767 16.4167 10.0909 16.4167H18.2726ZM21.0001 12.7497C21.4142 12.7497 21.7499 13.0857 21.7501 13.4997C21.7501 13.9139 21.4143 14.2496 21.0001 14.2497H10.0909C9.6767 14.2497 9.34091 13.9139 9.34091 13.4997C9.34109 13.0856 9.67681 12.7497 10.0909 12.7497H21.0001ZM21.0001 9.08368C21.4143 9.08373 21.7501 9.4195 21.7501 9.83368C21.7499 10.2477 21.4142 10.5836 21.0001 10.5837H10.0909C9.67681 10.5837 9.34109 10.2477 9.34091 9.83368C9.34091 9.41947 9.6767 9.08368 10.0909 9.08368H21.0001ZM21.0001 5.41669C21.4143 5.41673 21.7501 5.7525 21.7501 6.16669C21.7501 6.58087 21.4143 6.91664 21.0001 6.91669H10.0909C9.6767 6.91669 9.34091 6.5809 9.34091 6.16669C9.34091 5.75247 9.6767 5.41669 10.0909 5.41669H21.0001Z" fill="black" />
                <path d="M3.90626 4.71875C4.3113 4.32535 4.96113 4.32544 5.36622 4.71875L5.44923 4.80859L6.85353 6.52539C7.11539 6.84583 7.06814 7.31781 6.74806 7.58008C6.42748 7.84237 5.95469 7.79519 5.69239 7.47461L4.63575 6.18359L3.58009 7.47461C3.31779 7.79519 2.84599 7.84237 2.5254 7.58008C2.20482 7.31778 2.15764 6.84597 2.41993 6.52539L3.82325 4.80859L3.90626 4.71875Z" fill="black" />
                <path d="M5.36649 19.2812C4.96145 19.6746 4.31162 19.6746 3.90653 19.2812L3.82352 19.1914L2.41922 17.4746C2.15736 17.1542 2.20461 16.6822 2.52469 16.4199C2.84528 16.1576 3.31806 16.2048 3.58036 16.5254L4.637 17.8164L5.69266 16.5254C5.95496 16.2048 6.42676 16.1576 6.74735 16.4199C7.06793 16.6822 7.11511 17.154 6.85282 17.4746L5.4495 19.1914L5.36649 19.2812Z" fill="black" />
                <path d="M3.88637 18.1667V5.66669C3.88637 5.25247 4.22215 4.91669 4.63637 4.91669C5.05058 4.91669 5.38637 5.25247 5.38637 5.66669V18.1667C5.38637 18.5809 5.05058 18.9167 4.63637 18.9167C4.22215 18.9167 3.88637 18.5809 3.88637 18.1667Z" fill="black" />
            </svg>
        ),
        attributes: [
            {
                name: __("Medium", "website-accessibility"),
                value: "medium",
                css: [
                    {
                        selector: "p, div, li, td, th",
                        properties: {
                            lineHeight: "1.6",
                        },
                    },
                ],
                enableAnnouncement: __(
                    "Line Height, set to Medium.",
                    "website-accessibility",
                ),
            },
            {
                name: __("Large", "website-accessibility"),
                value: "large",
                css: [
                    {
                        selector: "p, div, li, td, th",
                        properties: {
                            lineHeight: "1.8",
                        },
                    },
                ],
                enableAnnouncement: __(
                    "Line Height, set to Large.",
                    "website-accessibility",
                ),
            },
            {
                name: __("Extra Large", "website-accessibility"),
                value: "extra-large",
                css: [
                    {
                        selector: "p, div, li, td, th",
                        properties: {
                            lineHeight: "2.2",
                        },
                    },
                ],
                enableAnnouncement: __(
                    "Line Height, set to Extra Large.",
                    "website-accessibility",
                ),
            },
        ],
    },
    {
        key: "textAlign",
        label: __("Text Alignment", "website-accessibility"),
        styleMethod: "styleTag",
        disableAnnouncement: __(
            "The text alignment setting has been disabled.",
            "website-accessibility",
        ),
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.5 18.25C16.9142 18.25 17.25 18.5858 17.25 19C17.25 19.4142 16.9142 19.75 16.5 19.75H3C2.58579 19.75 2.25 19.4142 2.25 19C2.25 18.5858 2.58579 18.25 3 18.25H16.5ZM21 13.583C21.4141 13.583 21.7498 13.9189 21.75 14.333C21.75 14.7472 21.4142 15.083 21 15.083H3C2.58579 15.083 2.25 14.7472 2.25 14.333C2.25018 13.9189 2.58589 13.583 3 13.583H21ZM16.5 8.91699C16.9142 8.91699 17.25 9.25278 17.25 9.66699C17.2498 10.0811 16.9141 10.417 16.5 10.417H3C2.5859 10.417 2.25018 10.0811 2.25 9.66699C2.25 9.25278 2.58579 8.91699 3 8.91699H16.5ZM21 4.25C21.4142 4.25 21.75 4.58579 21.75 5C21.75 5.41421 21.4142 5.75 21 5.75H3C2.58579 5.75 2.25 5.41421 2.25 5C2.25 4.58579 2.58579 4.25 3 4.25H21Z" fill="black" />
            </svg>
        ),
        attributes: [
            {
                name: __("Left", "website-accessibility"),
                value: "left",
                css: [
                    {
                        selector: "body, p, div, h1, h2, h3, h4, h5, h6",
                        properties: {
                            textAlign: "left",
                        },
                    },
                ],
                enableAnnouncement: __(
                    "Text Alignment, set to Left.",
                    "website-accessibility",
                ),
            },
            {
                name: __("Center", "website-accessibility"),
                value: "center",
                css: [
                    {
                        selector: "body, p, div, h1, h2, h3, h4, h5, h6",
                        properties: {
                            textAlign: "center",
                        },
                    },
                ],
                enableAnnouncement: __(
                    "Text Alignment, set to Center.",
                    "website-accessibility",
                ),
            },
            {
                name: __("Right", "website-accessibility"),
                value: "right",
                css: [
                    {
                        selector: "body, p, div, h1, h2, h3, h4, h5, h6",
                        properties: {
                            textAlign: "right",
                        },
                    },
                ],
                enableAnnouncement: __(
                    "Text Alignment, set to Right.",
                    "website-accessibility",
                ),
            },
            {
                name: __("Justify", "website-accessibility"),
                value: "justify",
                css: [
                    {
                        selector: "body, p, div, h1, h2, h3, h4, h5, h6",
                        properties: {
                            textAlign: "justify",
                        },
                    },
                ],
                enableAnnouncement: __(
                    "Text Alignment, set to Justify.",
                    "website-accessibility",
                ),
            },
        ],
    },
    {
        key: "saturation",
        label: __("Saturation", "website-accessibility"),
        styleMethod: "inline",
        disableAnnouncement: __(
            "The saturation setting has been disabled.",
            "website-accessibility",
        ),
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.9121 2.39746C11.361 1.60559 12.4592 1.55626 12.9893 2.24903L13.0879 2.39746L18.0928 11.2305C19.1381 13.0752 20.0147 15.463 19.1006 17.7227C17.9156 20.6513 15.2061 22.75 12 22.75C8.79393 22.75 6.08436 20.6513 4.89941 17.7227C3.98526 15.463 4.86187 13.0752 5.90723 11.2305L10.9121 2.39746ZM7.21191 11.9707C6.21274 13.7341 5.64793 15.5753 6.28906 17.1602C7.27675 19.6015 9.48617 21.25 12 21.25C14.5138 21.25 16.7232 19.6015 17.7109 17.1602C18.3521 15.5753 17.7873 13.7341 16.7881 11.9707L12 3.52149L7.21191 11.9707Z" fill="black" />
                <path d="M12.75 3V21.5H11.25V3H12.75Z" fill="black" />
                <path d="M19.252 16.7061L12.252 19.2061L11.748 17.7939L18.748 15.2939L19.252 16.7061Z" fill="black" />
                <path d="M17.7559 13.2051L12.2559 15.2051L11.7441 13.7949L17.2441 11.7949L17.7559 13.2051Z" fill="black" />
                <path d="M16.2637 9.70215L12.2637 11.2021L11.7363 9.79785L15.7363 8.29785L16.2637 9.70215Z" fill="black" />
            </svg>
        ),
        attributes: [
            {
                name: __("Low", "website-accessibility"),
                value: "low",
                css: [
                    {
                        selector: "img, video",
                        properties: {
                            filter: "saturate(0.5)",
                        },
                    },
                ],
                enableAnnouncement: __(
                    "Saturation, set to Low.",
                    "website-accessibility",
                ),
            },
            {
                name: __("High", "website-accessibility"),
                value: "high",
                css: [
                    {
                        selector: "img, video",
                        properties: {
                            filter: "saturate(1.5)",
                        },
                    },
                ],
                enableAnnouncement: __(
                    "Saturation, set to High.",
                    "website-accessibility",
                ),
            },
            {
                name: __("Desaturate", "website-accessibility"),
                value: "desaturate",
                css: [
                    {
                        selector: "img, video",
                        properties: {
                            filter: "saturate(0)",
                        },
                    },
                ],
                enableAnnouncement: __(
                    "Saturation, set to Desaturate.",
                    "website-accessibility",
                ),
            },
        ],
    },
    {
        key: "dictionary",
        label: __("Dictionary", "website-accessibility"),
        styleMethod: "rootClass",
        disableAnnouncement: __(
            "The dictionary setting has been disabled.",
            "website-accessibility",
        ),
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_366_186)">
                    <path d="M18.7656 4C18.7656 3.86209 18.6535 3.75026 18.5156 3.75H6C5.30964 3.75 4.75 4.30964 4.75 5V16.25H18.5156C18.6535 16.2497 18.7656 16.1379 18.7656 16V4ZM20.2656 16C20.2656 16.9663 19.4819 17.7497 18.5156 17.75H4.75V19C4.75 19.6904 5.30964 20.25 6 20.25H20C20.4142 20.25 20.75 20.5858 20.75 21C20.75 21.4142 20.4142 21.75 20 21.75H6C4.48122 21.75 3.25 20.5188 3.25 19V5C3.25 3.48122 4.48122 2.25 6 2.25H18.5156C19.4819 2.25026 20.2656 3.03366 20.2656 4V16Z" fill="black" />
                    <path d="M8.62878 3V17H7.12878V3H8.62878Z" fill="black" />
                    <path d="M12.8743 5.59569C13.2312 4.96467 14.1629 4.96462 14.5198 5.59569L14.5872 5.74022L16.8235 11.7383C16.9681 12.1263 16.7711 12.5584 16.3831 12.7031C15.9951 12.8476 15.5629 12.6497 15.4182 12.2617L13.6966 7.6455L11.9759 12.2617C11.8312 12.6497 11.399 12.8475 11.011 12.7031C10.6231 12.5584 10.4252 12.1263 10.5696 11.7383L12.8069 5.74022L12.8743 5.59569Z" fill="black" />
                    <path d="M15.1516 9.75C15.5658 9.75005 15.9016 10.0858 15.9016 10.5C15.9016 10.9142 15.5658 11.25 15.1516 11.25H12.2424C11.8282 11.25 11.4924 10.9142 11.4924 10.5C11.4924 10.0858 11.8282 9.75 12.2424 9.75H15.1516Z" fill="black" />
                </g>
                <defs>
                    <clipPath id="clip0_366_186">
                        <rect width="24" height="24" fill="white" />
                    </clipPath>
                </defs>
            </svg>
        ),
        attributes: [
            {
                name: __("Enable", "website-accessibility"),
                value: "enable",
                css: [],
                enableAnnouncement: __("Dictionary Enable.", "website-accessibility"),
            },
            {
                name: __("Disable", "website-accessibility"),
                value: "disable",
                css: [],
                enableAnnouncement: __("Dictionary Disable.", "website-accessibility"),
            },
        ],
    },
];

export default features;