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
                        selector: "h1, h2, h3, h4, h5, h6, h1 span, h2 span, h3 span, h4 span, h5 span, h6 span",
                        properties: {
                            color: "#fff",
                        },
                    },
                    {
                        selector: "a, a span",
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
                    {
                        selector: "button span",
                        properties: {
                            color: "#e0e0e0",
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
                        selector: "h1, h2, h3, h4, h5, h6, h1 *, h2 *, h3 *, h4 *, h5 *, h6 *",
                        properties: {
                            color: "#111",
                        },
                    },
                    {
                        selector: "a, a *",
                        properties: {
                            color: "#1a4cd8",
                        },
                    },
                    {
                        selector: "input, textarea, select, button, button *",
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
    {
        key: "screenReader",
        label: __("Screen Reader", "website-accessibility-pro"),
        disableAnnouncement: __(
            "The screen reader setting has been disabled.",
            "website-accessibility-pro",
        ),
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.0918 9.9248C18.0918 9.61234 17.8388 9.35843 17.5264 9.3584C17.2139 9.3584 16.9609 9.61233 16.9609 9.9248V15.3818C16.9609 16.3773 16.1536 17.1844 15.1582 17.1846C14.1626 17.1846 13.3555 16.3774 13.3555 15.3818V7.31543C13.3553 7.00312 13.1014 6.75 12.7891 6.75C12.4769 6.75022 12.2238 7.00326 12.2236 7.31543V16.9473C12.2236 17.9428 11.4165 18.75 10.4209 18.75C9.4254 18.7499 8.61816 17.9428 8.61816 16.9473V10.1875C8.61809 9.72975 8.24683 9.3584 7.78906 9.3584C7.33148 9.35862 6.96102 9.72989 6.96094 10.1875V12.7822C6.96094 13.1963 6.62496 13.532 6.21094 13.5322H2C1.58579 13.5322 1.25 13.1964 1.25 12.7822C1.25021 12.3682 1.58591 12.0322 2 12.0322H5.46094V10.1875C5.46102 8.90146 6.50306 7.85862 7.78906 7.8584C9.07526 7.8584 10.1181 8.90132 10.1182 10.1875V16.9473C10.1182 17.1144 10.2538 17.2499 10.4209 17.25C10.588 17.25 10.7236 17.1144 10.7236 16.9473V7.31543C10.7238 6.17483 11.6485 5.25022 12.7891 5.25C13.9298 5.25 14.8553 6.17469 14.8555 7.31543V15.3818C14.8555 15.549 14.9911 15.6846 15.1582 15.6846C15.3252 15.6844 15.4609 15.5489 15.4609 15.3818V9.9248C15.4609 8.7839 16.3855 7.8584 17.5264 7.8584C18.6672 7.85843 19.5918 8.78392 19.5918 9.9248V12.0322H22C22.4141 12.0322 22.7498 12.3682 22.75 12.7822C22.75 13.1964 22.4142 13.5322 22 13.5322H18.8418C18.4277 13.5321 18.0918 13.1963 18.0918 12.7822V9.9248Z" fill="black" />
            </svg>
        ),
        isDummy: true
    },
    {
        key: "smartContrast",
        label: __("Smart Contrast", "website-accessibility-pro"),
        disableAnnouncement: __(
            "The smart contrast setting has been disabled.",
            "website-accessibility-pro",
        ),
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.6338 13.2266L17.6318 13.2256C17.5679 13.4833 17.3845 13.7224 17.1045 13.832L17.1055 13.833C17.1036 13.8338 17.1015 13.8342 17.0996 13.835C17.0905 13.8385 17.0816 13.8435 17.0723 13.8467L17.0713 13.8447C16.8035 13.9463 16.5144 13.907 16.292 13.7764L16.2881 13.7734L15.6523 13.3916L15.4014 13.6436L15.7822 14.2852L15.7861 14.292C15.92 14.5249 15.9609 14.8235 15.8428 15.1045C15.728 15.3772 15.498 15.5627 15.2295 15.6357L15.2197 15.6377L14.5 15.8174V16.1816L15.209 16.3594C15.4581 16.4167 15.6712 16.5813 15.7949 16.7988L15.8428 16.8955L15.8799 17.001C15.9495 17.2498 15.9033 17.5041 15.7861 17.708L15.7822 17.7148L15.4014 18.3555L15.6523 18.6074L16.2881 18.2266L16.292 18.2236L16.3828 18.1777C16.5692 18.0945 16.7892 18.0698 17.001 18.1299L17.1055 18.167L17.1982 18.2129C17.3772 18.3146 17.5151 18.4721 17.5938 18.6582L17.6279 18.7529L17.6309 18.7637L17.6338 18.7734L17.8184 19.5H18.1816L18.3662 18.7734C18.4327 18.506 18.6295 18.2563 18.9277 18.1533C19.1607 18.0647 19.4097 18.0851 19.6172 18.1777L19.708 18.2236L19.7119 18.2266L20.3467 18.6074L20.5977 18.3555L20.2178 17.7148L20.2139 17.708C20.08 17.4751 20.0391 17.1765 20.1572 16.8955L20.2061 16.7969C20.3306 16.5779 20.5356 16.4281 20.7705 16.3643L20.7803 16.3623L21.5 16.1816V15.8301L21.3398 15.7949V15.7705L20.7803 15.6309C20.4827 15.5606 20.2631 15.3493 20.1572 15.0977C20.0406 14.8204 20.0756 14.5159 20.2207 14.2793L20.5977 13.6436L20.3467 13.3916L19.7119 13.7734L19.708 13.7764C19.4763 13.9124 19.1714 13.9515 18.8945 13.833C18.6585 13.732 18.4403 13.5208 18.3672 13.2256L18.3662 13.2266L18.1816 12.5H17.8184L17.6338 13.2266ZM18.8379 15.9932C18.8379 15.527 18.4631 15.1553 18.0068 15.1553C17.5507 15.1555 17.1768 15.5271 17.1768 15.9932C17.1769 16.4591 17.5508 16.8308 18.0068 16.8311C18.463 16.8311 18.8377 16.4592 18.8379 15.9932ZM19.8379 15.9932C19.8377 17.0073 19.0195 17.8311 18.0068 17.8311C16.9943 17.8308 16.1769 17.0071 16.1768 15.9932C16.1768 14.9791 16.9942 14.1555 18.0068 14.1553C19.0196 14.1553 19.8379 14.9789 19.8379 15.9932ZM22.5 16.4131C22.4999 16.7316 22.2811 17.018 21.9609 17.0957L21.9619 17.0967L21.1357 17.3037L21.5713 18.0361L21.625 18.1465C21.7262 18.4079 21.6592 18.6924 21.4805 18.8867L21.4736 18.8936L21.4668 18.9014L20.8926 19.4775L20.8877 19.4814C20.6641 19.7003 20.3069 19.7507 20.0264 19.5801V19.582L19.3027 19.1465L19.0957 19.9658L19.0879 19.9932C19.0004 20.2715 18.7429 20.5 18.4072 20.5H17.5928C17.2862 20.5 16.9858 20.2961 16.9043 19.9648L16.6963 19.1465L15.9736 19.582L15.9727 19.5801C15.7214 19.7323 15.3559 19.7308 15.1084 19.4756L15.1074 19.4775L14.5332 18.9014L14.5264 18.8936L14.5195 18.8867C14.3153 18.6646 14.2568 18.3248 14.4287 18.0361L14.8633 17.3037L14.0381 17.0967L14.0273 17.0947L14.0156 17.0908C13.725 17.0032 13.5 16.7336 13.5 16.4053V15.5869C13.5001 15.2686 13.7183 14.9813 14.0381 14.9033L14.8633 14.6953L14.4287 13.9639C14.2568 13.6752 14.3153 13.3354 14.5195 13.1133L14.5264 13.1064L14.5332 13.0986L15.1074 12.5225L15.1123 12.5186C15.3356 12.3 15.6923 12.2491 15.9727 12.4189L15.9736 12.418L16.6963 12.8525L16.9043 12.0342C16.9861 11.7035 17.2865 11.5 17.5928 11.5H18.4072C18.7311 11.5 19.0153 11.7133 19.0947 12.0342L19.3027 12.8525L20.0264 12.418C20.2773 12.2658 20.6431 12.2691 20.8906 12.5234L20.8926 12.5225L21.4668 13.0986L21.4736 13.1064L21.4805 13.1133C21.6592 13.3076 21.7262 13.5921 21.625 13.8535L21.5713 13.9639L21.1396 14.6895L22.3398 14.9902V15.1484C22.4411 15.2722 22.5 15.4295 22.5 15.5947V16.4131Z" fill="black" />
                <path d="M1.25 12C1.25 6.61522 5.61522 2.25 11 2.25C15.4461 2.25 19.1956 5.2253 20.3691 9.29199C20.4839 9.68989 20.2543 10.1058 19.8564 10.2207C19.4585 10.3355 19.0426 10.1059 18.9277 9.70801C17.9345 6.26613 14.7601 3.75 11 3.75C6.44365 3.75 2.75 7.44365 2.75 12C2.75 16.5563 6.44365 20.25 11 20.25C11.7964 20.25 12.5652 20.1375 13.292 19.9277C13.69 19.8129 14.1059 20.0425 14.2207 20.4404C14.3354 20.8384 14.1059 21.2543 13.708 21.3691C12.8474 21.6175 11.9385 21.75 11 21.75C5.61522 21.75 1.25 17.3848 1.25 12Z" fill="black" />
                <path d="M11.75 3.5V20.5H10.25V3.5H11.75Z" fill="black" />
                <path d="M10.5 15.25V16.75H3V15.25H10.5ZM10.5 11.25V12.75H2V11.25H10.5ZM10.5 7.25V8.75H3V7.25H10.5Z" fill="black" />
            </svg>
        ),
        isDummy: true
    },
    {
        key: "dyslexiaFriendly",
        label: __("Dyslexia Friendly", "website-accessibility-pro"),
        disableAnnouncement: __(
            "The dyslexia friendly setting has been disabled.",
            "website-accessibility-pro",
        ),
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.5205 12.5C10.5205 10.4803 9.85788 9.3191 9.125 8.65625C8.36852 7.97214 7.46081 7.75 6.8916 7.75H3.75V16.75H6.40527C7.00326 16.75 8.05851 16.5352 8.94434 15.8926C9.79181 15.2777 10.5205 14.2498 10.5205 12.5ZM12.0205 12.5C12.0205 14.7502 11.0453 16.2223 9.8252 17.1074C8.64356 17.9645 7.26663 18.25 6.40527 18.25H3C2.58579 18.25 2.25 17.9142 2.25 17.5V7C2.25 6.58579 2.58579 6.25 3 6.25H6.8916C7.78181 6.25 9.06402 6.57817 10.1318 7.54395C11.2231 8.53112 12.0205 10.1199 12.0205 12.5Z" fill="black" />
                <path d="M14.4122 18V7C14.4122 6.58579 14.748 6.25 15.1622 6.25H21.0001C21.4143 6.25003 21.7501 6.5858 21.7501 7C21.7501 7.4142 21.4143 7.74997 21.0001 7.75H15.9122V11.25H19.5401C19.9543 11.25 20.2901 11.5858 20.2901 12C20.2901 12.4142 19.9543 12.75 19.5401 12.75H15.9122V18C15.9122 18.4142 15.5764 18.75 15.1622 18.75C14.748 18.75 14.4122 18.4142 14.4122 18Z" fill="black" />
            </svg>
        ),
        isDummy: true
    },
    {
        key: "grayscale",
        label: __("Grayscale", "website-accessibility-pro"),
        disableAnnouncement: __(
            "The grayscale setting has been disabled.",
            "website-accessibility-pro",
        ),
        icon: (
            <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M9.37988 1C12.9297 1 15.9696 3.22065 17.1885 6.34473C20.2949 7.57215 22.4998 10.6026 22.5 14.1396C22.5 18.7596 18.7401 22.5195 14.1201 22.5195C10.5745 22.5195 7.53719 20.3048 6.31543 17.1865C3.20687 15.96 1 12.9283 1 9.38965C1.00019 4.76985 4.76005 1.00006 9.37988 1ZM17.6807 8.24609C17.7311 8.61708 17.7598 8.99531 17.7598 9.37988C17.7598 13.9999 13.9999 17.7598 9.37988 17.7598V17.7695C8.99161 17.7695 8.60976 17.7409 8.23535 17.6895C9.44363 19.6777 11.6312 21.0098 14.1201 21.0098C17.9101 21.0097 21 17.9198 21 14.1299C21 11.6416 19.6682 9.45451 17.6807 8.24609ZM7.56152 12.0479C7.35251 12.705 7.24025 13.4047 7.24023 14.1299C7.24023 14.7763 7.33108 15.4022 7.49902 15.9961C8.09733 16.1668 8.728 16.2598 9.37988 16.2598C10.1179 16.2598 10.8288 16.1405 11.4961 15.9238L7.56152 12.0479ZM9.37988 2.5C5.57998 2.50006 2.50006 5.58998 2.5 9.37988C2.5 11.8673 3.8311 14.053 5.81738 15.2617C5.76802 14.8946 5.74023 14.52 5.74023 14.1396C5.74043 9.51981 9.50024 5.75977 14.1201 5.75977C14.5121 5.75977 14.8976 5.78846 15.2754 5.84082C14.0696 3.84171 11.8769 2.5 9.37988 2.5ZM11.0352 7.98145C9.86843 8.56893 8.89101 9.47784 8.2207 10.5918L12.9531 15.2549C14.0526 14.5831 14.9491 13.6113 15.5303 12.4551L11.0352 7.98145ZM14.1201 7.25C13.5969 7.25 13.0874 7.30996 12.5977 7.4209L16.0889 10.8955C16.1993 10.4075 16.2598 9.90051 16.2598 9.37988C16.2598 8.73329 16.168 8.10765 16 7.51367C15.402 7.34317 14.7717 7.25001 14.1201 7.25Z"
                    fill="black"
                />
            </svg>
        ),
        isDummy: true
    },
    {
        key: "brightness",
        label: __("Brightness", "website-accessibility-pro"),
        disableAnnouncement: __(
            "The brightness setting has been disabled.",
            "website-accessibility-pro",
        ),
        icon: (
            <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g clipPath="url(#clip0_1533_365)">
                    <rect width={24} height={24} fill="white" />
                    <path
                        d="M11.5605 18.4404C11.9703 18.4407 12.3105 18.7806 12.3105 19.1904V22.3799C12.3105 22.7897 11.9703 23.1296 11.5605 23.1299C11.1505 23.1299 10.8105 22.7899 10.8105 22.3799V19.1904C10.8105 18.7804 11.1505 18.4404 11.5605 18.4404ZM5.63965 16.4199C5.92963 16.1299 6.41019 16.13 6.7002 16.4199C6.9902 16.7099 6.9902 17.1905 6.7002 17.4805L4.44043 19.7402C4.29045 19.8902 4.10014 19.9599 3.91016 19.96C3.72016 19.96 3.52988 19.8902 3.37988 19.7402C3.08994 19.4502 3.0899 18.9697 3.37988 18.6797L5.63965 16.4199ZM16.4199 16.4199C16.7099 16.1299 17.1905 16.1299 17.4805 16.4199L19.7402 18.6797C20.0302 18.9697 20.0302 19.4502 19.7402 19.7402C19.5902 19.8902 19.4 19.96 19.21 19.96C19.02 19.9599 18.8296 19.8902 18.6797 19.7402L16.4199 17.4805C16.1299 17.1905 16.1299 16.7099 16.4199 16.4199ZM11.5596 6.91016C14.1296 6.91016 16.2295 9.00031 16.2295 11.5703C16.2294 14.1402 14.1395 16.2305 11.5596 16.2305C8.98977 16.2303 6.90048 14.1401 6.90039 11.5703C6.90039 9.00042 8.98972 6.91034 11.5596 6.91016ZM11.5596 8.40039C9.80972 8.40057 8.40039 9.82066 8.40039 11.5605C8.4006 13.3003 9.81985 14.7195 11.5596 14.7197C13.2994 14.7197 14.7293 13.3004 14.7295 11.5605C14.7295 9.82055 13.3096 8.40039 11.5596 8.40039ZM3.94043 10.8203C4.35024 10.8205 4.69043 11.1605 4.69043 11.5703C4.69043 11.9802 4.35024 12.3201 3.94043 12.3203H0.75C0.34 12.3203 0 11.9803 0 11.5703C0 11.1603 0.34 10.8203 0.75 10.8203H3.94043ZM22.3701 10.8203C22.7801 10.8203 23.1201 11.1603 23.1201 11.5703C23.1201 11.9803 22.7801 12.3203 22.3701 12.3203H19.1807C18.7707 12.3203 18.4307 11.9803 18.4307 11.5703C18.4307 11.1603 18.7707 10.8203 19.1807 10.8203H22.3701ZM3.37988 3.38965C3.66988 3.09965 4.15043 3.09965 4.44043 3.38965L6.7002 5.64941C6.9902 5.93941 6.9902 6.41996 6.7002 6.70996C6.5502 6.85996 6.35992 6.92969 6.16992 6.92969C5.97998 6.92964 5.7896 6.85991 5.63965 6.70996L3.37988 4.4502C3.08988 4.1602 3.08988 3.67965 3.37988 3.38965ZM18.6797 3.38965C18.9697 3.09967 19.4502 3.09971 19.7402 3.38965C20.0302 3.67965 20.0302 4.1602 19.7402 4.4502L17.4805 6.70996C17.3305 6.85995 17.1402 6.92967 16.9502 6.92969C16.7602 6.92969 16.5699 6.85996 16.4199 6.70996C16.13 6.41995 16.1299 5.93939 16.4199 5.64941L18.6797 3.38965ZM11.5605 0C11.9703 0.000269813 12.3105 0.340163 12.3105 0.75V3.94043C12.3103 4.35008 11.9702 4.69016 11.5605 4.69043C11.1507 4.69043 10.8108 4.35024 10.8105 3.94043V0.75C10.8105 0.34 11.1505 0 11.5605 0Z"
                        fill="black"
                    />
                </g>
                <defs>
                    <clipPath id="clip0_1533_365">
                        <rect width={24} height={24} fill="white" />
                    </clipPath>
                </defs>
            </svg>
        ),
        isDummy: true
    },
    {
        key: "muteSounds",
        label: __("Mute Sounds", "website-accessibility-pro"),
        disableAnnouncement: __(
            "The mute sounds setting has been disabled.",
            "website-accessibility-pro",
        ),
        icon: (
            <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <rect width={24} height={24} fill="white" />
                <path
                    d="M10.6201 4.35461C11.1901 3.94468 11.9403 3.88424 12.5703 4.20422C13.2002 4.52419 13.5897 5.16451 13.5898 5.86438V17.7042C13.5898 18.4242 13.19 19.0649 12.54 19.3849C12.2801 19.5149 11.9899 19.5743 11.71 19.5743V19.5851C11.31 19.5851 10.9103 19.4544 10.5703 19.1945L6.55957 16.0948C6.49961 16.0449 6.41997 16.0148 6.33008 16.0148H2.87012C1.84012 16.0148 1 15.1747 1 14.1447V9.47473C1 8.44473 1.84012 7.60461 2.87012 7.60461H6.00977C6.08977 7.60461 6.16047 7.5843 6.23047 7.5343L10.6201 4.35461ZM11.8799 5.54504C11.8199 5.51505 11.6599 5.45449 11.5 5.57434L7.11035 8.755C6.79035 8.985 6.40977 9.10461 6.00977 9.10461H2.87012C2.67012 9.10461 2.5 9.27473 2.5 9.47473V14.1447C2.5 14.3447 2.67012 14.5148 2.87012 14.5148H6.33008C6.73993 14.5148 7.14979 14.6546 7.46973 14.9044L11.4805 18.005C11.6403 18.1345 11.8101 18.075 11.8701 18.045C11.9301 18.0151 12.0799 17.9247 12.0801 17.715V5.87512C12.0801 5.67518 11.9399 5.57508 11.8799 5.54504ZM15.3203 8.48449C15.6103 8.1948 16.08 8.18476 16.3799 8.48449L18.6494 10.7335L20.9199 8.48449C21.2098 8.1948 21.6895 8.19494 21.9795 8.48449C22.2695 8.77449 22.2695 9.25504 21.9795 9.54504L19.7148 11.7892L21.9805 14.0343C22.2704 14.3242 22.2803 14.8048 21.9805 15.0948C21.8305 15.2448 21.6401 15.3145 21.4502 15.3146C21.2602 15.3146 21.0699 15.2448 20.9199 15.0948L18.6494 12.8448L16.3799 15.0948C16.2299 15.2448 16.0396 15.3146 15.8496 15.3146C15.6598 15.3145 15.4602 15.2446 15.3203 15.0948C15.0303 14.8049 15.0303 14.3253 15.3203 14.0353L17.585 11.7892L15.3203 9.54504C15.0303 9.25504 15.0203 8.77449 15.3203 8.48449Z"
                    fill="black"
                />
            </svg>
        ),
        isDummy: true
    },
    {
        key: "keyboardNavigation",
        label: __("Keyboard Navigation", "website-accessibility-pro"),
        disableAnnouncement: __(
            "The keyboard navigation setting has been disabled.",
            "website-accessibility-pro",
        ),
        icon: (
            <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <defs>
                    <style>{`.cls-1{fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round}`}</style>
                </defs>
                <path d="M8.14 14.94v4.53h4.53v-4.53Zm6.8 0v4.53h4.53v-4.53Zm6.79 0v4.53h4.54v-4.53Zm6.8 0v4.53h4.53v-4.53Zm6.8 0v4.53h4.53v-4.53ZM8.14 21.73v4.54h4.53v-4.54Zm6.8 0v4.54h4.53v-4.54Zm6.79 0v4.54h4.54v-4.54Zm6.8 0v4.54h4.53v-4.54Zm6.8 0v4.54h4.53v-4.54Zm-27.19 6.8v4.53h4.53v-4.53Zm6.8 0v4.53h18.12v-4.53Zm20.39 0v4.53h4.53v-4.53Z" className="cls-1"/>
                <path d="M43.5 35.5v-23a2 2 0 0 0-2-2h-35a2 2 0 0 0-2 2v23a2 2 0 0 0 2 2h35a2 2 0 0 0 2-2Z" className="cls-1"/>
            </svg>
        ),
        isDummy: true
    },
];

export default features;