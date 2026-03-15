import { __ } from "@wordpress/i18n";

export const DEFAULT_FEATURE_CATEGORY_DEFINITIONS = [
    {
        slug: "text",
        title: __("Text", "website-accessibility"),
        keys: ["biggerText", "textSpacing", "lineHeight", "textAlign", "dyslexiaFriendly", "dictionary"],
    },
    {
        slug: "color",
        title: __("Color & Contrast", "website-accessibility"),
        keys: ["contrast", "smartContrast", "brightness", "grayscale", "saturation", "highlightLinks", "hideImages"],
    },
    {
        slug: "orientation",
        title: __("Orientation", "website-accessibility"),
        keys: ["cursor", "tooltips"],
    },
    {
        slug: "behavior",
        title: __("Behavior", "website-accessibility"),
        keys: ["pauseAnimations", "muteSounds", "screenReader"],
    },
];

const normalizeWidgetConfig = (value) => {
    if (value && typeof value === "object") {
        return {
            ...value,
            active: value.active !== undefined ? !!value.active : true,
        };
    }

    return { active: !!value };
};

const getKeysFromWidgetEntries = (widgetEntries = []) => {
    const keys = [];

    widgetEntries.forEach((entry) => {
        if (!entry || typeof entry !== "object") return;
        const key = Object.keys(entry)[0];
        if (!key) return;
        keys.push(key);
    });

    return keys;
};

const normalizeCategoryTemplate = (attributes = {}) => {
    const categories = attributes?.widgetCategories;

    if (Array.isArray(categories) && categories.length > 0) {
        const mapped = categories
            .map((category) => {
                const keys = getKeysFromWidgetEntries(category?.widgets);
                if (!keys.length) return null;

                return {
                    slug: category?.slug || "custom",
                    title: category?.title || __("Category", "website-accessibility"),
                    keys,
                };
            })
            .filter(Boolean);

        if (mapped.length) return mapped;
    }

    return DEFAULT_FEATURE_CATEGORY_DEFINITIONS;
};

export const getFeatureStateIndex = (attributes = {}, features = []) => {
    const state = {};

    const fromWidgets = Array.isArray(attributes?.widgets) ? attributes.widgets : [];
    fromWidgets.forEach((entry) => {
        const key = Object.keys(entry || {})[0];
        if (!key) return;
        state[key] = normalizeWidgetConfig(entry[key]);
    });

    if (!Object.keys(state).length && Array.isArray(attributes?.widgetCategories)) {
        attributes.widgetCategories.forEach((category) => {
            (category?.widgets || []).forEach((entry) => {
                const key = Object.keys(entry || {})[0];
                if (!key) return;
                state[key] = normalizeWidgetConfig(entry[key]);
            });
        });
    }

    // Default missing values to active.
    features.forEach((feature) => {
        if (!feature?.key) return;
        if (!state[feature.key]) {
            state[feature.key] = { active: true };
        }
    });

    return state;
};

export const getFeatureCategories = (attributes = {}, features = []) => {
    if (!Array.isArray(features) || !features.length) return [];

    const featureByKey = features.reduce((acc, feature) => {
        if (feature?.key) acc[feature.key] = feature;
        return acc;
    }, {});

    const template = normalizeCategoryTemplate(attributes);
    const used = new Set();
    const categories = [];

    template.forEach((category) => {
        const categoryFeatures = category.keys
            .map((key) => featureByKey[key])
            .filter(Boolean);

        categoryFeatures.forEach((feature) => used.add(feature.key));

        if (categoryFeatures.length) {
            categories.push({
                slug: category.slug,
                title: category.title,
                features: categoryFeatures,
            });
        }
    });

    const uncategorized = features.filter((feature) => !used.has(feature.key));
    if (uncategorized.length) {
        categories.push({
            slug: "other",
            title: __("Other", "website-accessibility"),
            features: uncategorized,
        });
    }

    return categories;
};

export const buildFeatureWidgetPayload = (attributes = {}, features = [], nextState = {}) => {
    const featureKeys = features.map((feature) => feature.key).filter(Boolean);
    const normalizedState = {};

    featureKeys.forEach((key) => {
        normalizedState[key] = normalizeWidgetConfig(nextState[key] || { active: true });
    });

    const widgets = featureKeys.map((key) => ({
        [key]: normalizedState[key],
    }));

    const template = normalizeCategoryTemplate(attributes);
    const used = new Set();
    const widgetCategories = [];

    template.forEach((category) => {
        const keys = category.keys.filter((key) => featureKeys.includes(key));
        if (!keys.length) return;

        keys.forEach((key) => used.add(key));
        widgetCategories.push({
            slug: category.slug,
            title: category.title,
            widgets: keys.map((key) => ({ [key]: normalizedState[key] })),
        });
    });

    const remaining = featureKeys.filter((key) => !used.has(key));
    if (remaining.length) {
        widgetCategories.push({
            slug: "other",
            title: __("Other", "website-accessibility"),
            widgets: remaining.map((key) => ({ [key]: normalizedState[key] })),
        });
    }

    return {
        widgets,
        widgetCategories,
        widgetSchemaVersion: 2,
    };
};
