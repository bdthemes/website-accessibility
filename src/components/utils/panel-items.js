const panelItems = [
    {
        id: 'header',
        title: 'Header',
        slug: 'header',
        active: true,
        disableDrag: true,
        attributes: {
            text: 'Accessibility Menu (CTRL+U)',
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
        attributes: {
            text: 'Language',
            showClose: true,
            flipContent: false,
            background: '#ffffff',
            border: '1px solid #e0e0e0',
        }
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
        }
    },
    {
        id: 'features',
        title: 'Features',
        slug: 'features',
        active: true,
        close: true,
        attributes: {
            text: 'Features',
            showClose: true,
            flipContent: false,
            background: '#ffffff',
            border: '1px solid #e0e0e0',
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