const panelItems = [
    {
        id: 'header',
        title: 'Header',
        slug: 'header',
        active: true,
        disableDrag: true,
        attributes: {
            text: 'Accessibility',
            showClose: true,
            background: '#2e6cf6',
            border: '1px solid #2e6cf6',
            borderRadius: '6px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            padding: '10px 20px',
        }
    },
    {
        id: 'language',
        title: 'Language',
        slug: 'language',
        active: true,
        close: true,
        isPro: true,
    },
    {
        id: 'profiles',
        title: 'Profiles',
        slug: 'profiles',
        active: true,
        attributes: {
            profiles: [
                "motor",
                "blind",
                "color-blind",
                "dyslexia",
                "low-vision",
                "cognitive",
                "seizure",
                "adhd"
            ],
            layout: 'inline',
            columns: 2,
        }
    },
    {
        id: 'features',
        title: 'Features',
        slug: 'features',
        active: true,
        close: true,
        attributes: {
            layout: 'block',
            tooltipPosition: 'topLeft',
            columns: 2,
            widgets: [
                {
                    contrast: {
                        active: true
                    }
                },
                {
                    highlightLinks: {
                        active: true
                    }
                },
                {
                    biggerText: {
                        active: true
                    }
                },
                {
                    textSpacing: {
                        active: true
                    }
                },
                {
                    pauseAnimations: {
                        active: true
                    }
                },
                {
                    hideImages: {
                        active: true
                    }
                },
                {
                    cursor: {
                        active: true
                    }
                },
                {
                    tooltips: {
                        active: true
                    }
                },
                {
                    lineHeight: {
                        active: true
                    }
                },
                {
                    textAlign: {
                        active: true
                    }
                },
                {
                    saturation: {
                        active: true
                    }
                },
                {
                    dictionary: {
                        active: true
                    }
                },
                {
                    screenReader: {
                        active: true,
                        isPro: true
                    }
                },
                {
                    smartContrast: {
                        active: true,
                        isPro: true
                    }
                },
                {
                    dyslexiaFriendly: {
                        active: true,
                        isPro: true
                    }
                },
                {
                    grayscale: {
                        active: true,
                        isPro: true
                    }
                },
                {
                    brightness: {
                        active: true,
                        isPro: true
                    }
                },
                {
                    muteSounds: {
                        active: true,
                        isPro: true
                    }
                },
                {
                    virtualKeyboard: {
                        active: true,
                        isPro: true
                    }
                },
                {
                    skipLinks: {
                        active: true,
                        isPro: true
                    }
                },
                {
                    focusIndicators: {
                        active: true,
                        isPro: true
                    }
                }
            ],
        }
    },
    {
        id: 'footer',
        title: 'Footer',
        slug: 'footer',
        active: true,
        close: true,
        disableDrag: true,
    }
]

export default panelItems;
