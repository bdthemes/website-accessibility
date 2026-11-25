import { __ } from "@wordpress/i18n";

/**
 * Built-in category titles: English source (what migrations store in presets)
 * and a lookup in the language currently loaded.
 */
const DEFAULT_CATEGORY_TITLES = {
    text: { source: "Text", translate: () => __("Text", "website-accessibility") },
    color: { source: "Color & Contrast", translate: () => __("Color & Contrast", "website-accessibility") },
    orientation: { source: "Orientation", translate: () => __("Orientation", "website-accessibility") },
    behavior: { source: "Behavior", translate: () => __("Behavior", "website-accessibility") },
};

// The titles as they read when the page loaded (site language): a preset saved
// from the editor holds these.
const INITIAL_CATEGORY_TITLES = Object.keys(DEFAULT_CATEGORY_TITLES).reduce((acc, slug) => {
    acc[slug] = DEFAULT_CATEGORY_TITLES[slug].translate();
    return acc;
}, {});

/**
 * Title to show for a category. A built-in category whose saved title is still
 * the default one (English, or the site language's) follows the language now
 * loaded; a title the site owner typed is shown as typed.
 */
export const localizeCategoryTitle = (slug, title) => {
    const known = DEFAULT_CATEGORY_TITLES[slug];
    if (!known) return title;
    if (!title || title === known.source || title === INITIAL_CATEGORY_TITLES[slug]) {
        return known.translate();
    }
    return title;
};

export const DEFAULT_FEATURE_CATEGORY_DEFINITIONS = [
    {
        slug: "text",
        get title() { return DEFAULT_CATEGORY_TITLES.text.translate(); },
        keys: ["biggerText", "textSpacing", "lineHeight", "textAlign", "dictionary"],
    },
    {
        slug: "color",
        get title() { return DEFAULT_CATEGORY_TITLES.color.translate(); },
        keys: ["contrast", "saturation", "highlightLinks", "hideImages"],
    },
    {
        slug: "orientation",
        get title() { return DEFAULT_CATEGORY_TITLES.orientation.translate(); },
        keys: ["cursor", "tooltips"],
    },
    {
        slug: "behavior",
        get title() { return DEFAULT_CATEGORY_TITLES.behavior.translate(); },
        keys: ["pauseAnimations"],
    },
];

/**
 * Category definitions currently in effect. Add-ons can extend the defaults
 * (extra keys per category, or extra categories) by publishing a merged list on
 * `window.wapHelpers.featureCategoryDefinitions`; it is read lazily so the
 * add-on bundle may load after this one.
 */
export const getFeatureCategoryDefinitions = () => {
    const published = typeof window !== "undefined" ? window?.wapHelpers?.featureCategoryDefinitions : null;
    return Array.isArray(published) && published.length > 0 ? published : DEFAULT_FEATURE_CATEGORY_DEFINITIONS;
};

const normalizeWidgetConfig = (value) => {
    if (value && typeof value === "object") {
        return {
            ...value,
            active: value.active !== undefined ? !!value.active : true,
        };
    }

    return { active: !!value };
};

/**
 * Keep known features in their default categories even when saved
 * widgetCategories were created before those keys existed (they would land in "Other").
 */
const ensureDefaultFeaturePlacement = (template = []) => {
    const next = (Array.isArray(template) ? template : []).map((category) => ({
        slug: category?.slug || "custom",
        title: category?.title || __("Category", "website-accessibility"),
        keys: [...(category?.keys || [])],
    }));

    const keyToSlug = new Map();
    getFeatureCategoryDefinitions().forEach((definition) => {
        definition.keys.forEach((key) => {
            keyToSlug.set(key, definition.slug);
        });
    });

    // Move known keys out of the wrong category (commonly "other").
    next.forEach((category) => {
        category.keys = category.keys.filter((key) => {
            const rightfulSlug = keyToSlug.get(key);
            if (!rightfulSlug) {
                return true;
            }
            return rightfulSlug === category.slug;
        });
    });

    const placed = new Set();
    next.forEach((category) => {
        category.keys.forEach((key) => placed.add(key));
    });

    getFeatureCategoryDefinitions().forEach((definition) => {
        definition.keys.forEach((key) => {
            if (placed.has(key)) {
                return;
            }

            let target = next.find((category) => category.slug === definition.slug);
            if (!target) {
                target = {
                    slug: definition.slug,
                    title: definition.title,
                    keys: [],
                };
                next.push(target);
            }

            target.keys.push(key);
            placed.add(key);
        });
    });

    return next.filter((category) => category.keys.length > 0);
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

        if (mapped.length) {
            return ensureDefaultFeaturePlacement(mapped);
        }
    }

    return getFeatureCategoryDefinitions();
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
