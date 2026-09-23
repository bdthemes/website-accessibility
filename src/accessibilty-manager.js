import cursor from "./classes/cursor";
import dictionary from "./classes/dictionary";
import fontManipulator from "./classes/font-manupulator";
import tooltips from "./classes/tooltips";
import { getFeatureHandler } from "./utils/feature-handlers";

class AccessibilityManager {
    static instance = null;
    constructor() {
        if (AccessibilityManager.instance) return AccessibilityManager.instance;
        this.props = {}; // { contrast: [ { element, property, originalValue } ] }
        this.previousFeatureValues = {}; // Track previous values
        this.backgroundObservers = {}; // feature key → MutationObserver watching for new CSS background photos

        AccessibilityManager.instance = this;
    }

    static getInstance() {
        if (!AccessibilityManager.instance) {
            AccessibilityManager.instance = new AccessibilityManager();
        }
        return AccessibilityManager.instance;
    }

    init(settings) {
        if (!settings || Object.keys(settings).length === 0) return;
        for (const key in settings) {
            const setting = settings[key];
            const attributes = setting.currentAttribute || {};
            
            // If the feature is not enabled, remove it
            if (!setting.currentStep) {
                this.removeFeature(key);
                continue;
            }

            // If the feature is already applied, remove it
            if (this.previousFeatureValues[key]) {
                this.removeFeature(key);
            }

            // Store the previous value for comparison
            if (!this.previousFeatureValues[key]) {
                this.previousFeatureValues[key] = setting.currentAttribute?.value || null;
            }

            this.props[key] = [];

            switch (key) {
                case 'contrast':
                    this.applyContrast(key, attributes);
                    break;
                case 'cursor':
                    this.applyCursor(key, attributes);
                    break;
                case 'tooltips':
                    this.applyTooltip(key, attributes);
                    break;
                case 'dictionary':
                    this.applyDictionary(key, attributes);
                    break;
                case 'biggerText':
                    this.applyBiggerText(key, attributes);
                    break;
                case 'saturation':
                    this.applySaturation(key, attributes);
                    break;
                default:
                    this.applyExtensionFeature(key, attributes);
                    break;
            }

        }
    }

    /**
     * Any feature this class has no dedicated implementation for is either
     * handled by a registered add-on handler (see utils/feature-handlers.js)
     * or, when its step carries a `css` list, applied as a plain CSS feature.
     */
    applyExtensionFeature(key, attribute) {
        const handler = getFeatureHandler(key);
        if (handler && typeof handler.apply === 'function') {
            handler.apply(attribute, key);
            return;
        }
        this.applyCSSFeature(key, attribute);
    }

    removeExtensionFeature(key) {
        const handler = getFeatureHandler(key);
        if (handler && typeof handler.remove === 'function') {
            handler.remove(key);
            delete this.props[key];
            return;
        }
        this.removeCSSFeature(key);
    }

    // Helper method to check if element is inside preview drawer
    isInsidePreviewDrawer(element) {
        const wrapper = document.querySelector('.wap-preset__preview-drawer-root');
        if (!wrapper) return false;
        return wrapper.contains(element);
    }

    applyContrast(key, attr) {
        if (!attr) return;
        switch (attr.value) {
            case 'invert':
                document.documentElement.style.setProperty('--wap-invert', '100%');
                break;
            case 'dark':
                this.applyCSSFeature(key, attr);
                break;
            case 'light':
                this.applyCSSFeature(key, attr);
                break;
        }
    }

    removeContrast() {
        document.documentElement.style.removeProperty('--wap-invert');
        this.removeCSSFeature('contrast');

        delete this.props['contrast'];
    }

    applySaturation(key, attribute) {
        if (!attribute || key !== 'saturation') return;
        switch (attribute.value) {
            case 'low':
                document.documentElement.style.setProperty('--wap-saturation', '0.5');
                break;
            case 'high':
                document.documentElement.style.setProperty('--wap-saturation', '3');
                break;
            case 'desaturate':
                document.documentElement.style.setProperty('--wap-saturation', '0');
                break;
        }
    }

    removeSaturation() {
        document.documentElement.style.removeProperty('--wap-saturation');
        delete this.props['saturation'];
    }


    applyCursor(key, attribute) {
        if (!attribute || !cursor) return;
        if ('big-cursor' === attribute.value) {
            this.applyCSSFeature(key, attribute);
        }else {
            cursor()?.apply(key, attribute);
        }
    }

    removeCursor() {
        cursor()?.remove();
        this.removeCSSFeature('cursor');
        delete this.props['cursor'];
    }

    applyTooltip() {
        tooltips()?.apply();
    }

    removeTooltip() {
        tooltips()?.remove();
        delete this.props['tooltips'];
    }

    applyDictionary(key, attr) {
        if (!attr) return;
        dictionary().apply();
    }

    removeDictionary(key) {
        dictionary().remove();
    }

    isActuallyVisible(el) {
        let node = el;
        while (node && node.nodeType === 1) {
            const style = window.getComputedStyle(node);
            if (style.display === "none" || style.visibility === "hidden" || parseFloat(style.opacity) === 0) {
                return false;
            }
            node = node.parentElement;
        }
        return true;
    }

    applyCSSFeature(key, attr) {
        if (!attr?.css || attr.css.length === 0) return;

        // `img { display: none }` cannot touch a photo painted as a CSS background,
        // so a feature that hides images has to ask for those separately.
        if (attr.hideBackgroundImages) {
            this.applyBackgroundImageHiding(key);
        }

        const previewButton = document.querySelector('.wap-preset__preview-button');
        let skipOriginal = false;

        // A rule-backed entry becomes a stylesheet rule instead of an inline style on
        // every element. Inline styles cannot reach ::before/::after at all, and they
        // only ever cover the elements that existed and were visible at the moment the
        // feature was switched on — so a paused page would still animate its
        // pseudo-elements, its carousel slides and anything rendered afterwards, and a
        // recoloured page would leave every late section in the theme's own colours.
        // A rule has none of those blind spots. They are emitted together, in order,
        // because a feature usually needs several of them.
        const ruleEntries = attr.css.filter(css => this.shouldUseStyleRule(css));
        if (ruleEntries.length > 0) {
            this.applyStyleRules(key, ruleEntries);
        }

        attr.css.forEach(css => {
            if (this.shouldUseStyleRule(css)) return;

            const elements = document.querySelectorAll(css.selector);

            elements.forEach(element => {
                if (
                    this.isInsidePreviewDrawer(element) ||
                    element === previewButton ||
                    previewButton?.contains(element)
                ) {
                    return;
                }

                if (!this.isActuallyVisible(element)) {
                    return;
                }

                if (key === 'highlightLinks' && this.props['contrast']?.length > 0) {
                    skipOriginal = true;
                }

                for (const property in css.properties) {
                    let inlineOriginal = element.style.getPropertyValue(property);
                    const originalPriority = element.style.getPropertyPriority(property);

                    // 🔥 Check if original already stored
                    const alreadyStored = this.props[key].some(
                        item => item.element === element && item.property === property
                    );

                    if (!alreadyStored) {
                        this.props[key].push({
                            element,
                            property,
                            originalPriority: skipOriginal ? '' : originalPriority,
                            originalValue: skipOriginal
                                ? null
                                : (inlineOriginal ? inlineOriginal : null)
                        });
                    }

                    // Apply new CSS. `important` is deliberate: the toolbar states a
                    // user's accessibility choice, so it has to beat theme rules that
                    // ship their own !important — WordPress core does exactly that for
                    // block font-size presets, and themes commonly do it for `img`.
                    // Without it the feature silently no-ops on those elements.
                    element.style.setProperty(
                        this.toCssProperty(property),
                        css.properties[property],
                        'important'
                    );
                }
            });
        });
    }



    /**
     * True for selectors that target the whole document, where a per-element pass
     * is both incomplete (no pseudo-elements, no late or hidden nodes) and wasteful.
     */
    isUniversalSelector(selector) {
        return String(selector).trim() === '*';
    }

    /**
     * Whether a css entry should become a stylesheet rule rather than inline styles.
     * A definition opts in with `rule: true`; the universal selector always does.
     */
    shouldUseStyleRule(css) {
        return css?.rule === true || this.isUniversalSelector(css?.selector);
    }

    /** DOM id of the stylesheet backing a rule-based feature. */
    styleRuleId(key) {
        return `websac-feature-${key}`;
    }

    /**
     * Back a feature with a single stylesheet rule covering every element and its
     * ::before/::after. The plugin's own preview drawer is excluded so the admin
     * preview keeps behaving normally, matching the per-element path.
     */
    /**
     * The plugin's own UI is never part of the page being adjusted: the toolbar has
     * to stay readable while a feature repaints everything behind it, and the admin
     * preview drawer has to keep showing the site as it really looks.
     */
    static get RULE_SCOPE() {
        return [
            '.wap-preset__preview-drawer-root',
            '.wap-accessibility-view',
            '.wap-preview-button',
        ].map(sel => `:not(${sel}):not(${sel} *)`).join('');
    }

    applyStyleRule(key, properties, selector = '*') {
        this.applyStyleRules(key, [{ properties, selector }]);
    }

    /**
     * Back a feature with one stylesheet holding every rule it asked for, in the
     * order given, so later entries can override earlier ones the way any
     * stylesheet does.
     */
    applyStyleRules(key, entries) {
        this.removeStyleRule(key);

        const scope = AccessibilityManager.RULE_SCOPE;
        const rules = [];

        entries.forEach(({ properties, selector = '*' }) => {
            const body = Object.entries(properties || {})
                .map(([prop, value]) => `${this.toCssProperty(prop)}: ${value} !important;`)
                .join(' ');
            if (!body) return;

            const parts = String(selector).split(',').map(part => part.trim()).filter(Boolean);
            if (parts.length === 0) return;

            // ::before/::after only matter for the whole-document case (pausing motion);
            // for a concrete element list like `img, video` they carry no content to hide.
            const universal = parts.length === 1 && this.isUniversalSelector(parts[0]);
            const selectors = parts.flatMap(part => universal
                ? [`${part}${scope}`, `${part}${scope}::before`, `${part}${scope}::after`]
                : [`${part}${scope}`]);

            rules.push(`${selectors.join(', ')} { ${body} }`);
        });

        if (rules.length === 0) return;

        const el = document.createElement('style');
        el.id = this.styleRuleId(key);
        el.textContent = rules.join('\n');
        document.head.appendChild(el);
    }

    removeStyleRule(key) {
        document.getElementById(this.styleRuleId(key))?.remove();
    }

    /** Attribute marking an element whose CSS background photo is being hidden. */
    static get HIDDEN_BG_ATTR() {
        return 'data-websac-hidden-bg';
    }

    backgroundRuleId(key) {
        return `websac-feature-${key}-backgrounds`;
    }

    /**
     * Hide photos painted as CSS backgrounds.
     *
     * A stylesheet rule alone cannot do this: CSS has no way to ask whether a
     * background is a photo or a gradient, and blanking every background-image would
     * strip the gradients themselves — those are colour, not content, and removing
     * them flattens sections and wrecks their contrast. So JS marks the elements that
     * actually carry a url() and one rule hides those, which keeps the hiding alive
     * across re-renders and lets a MutationObserver pick up whatever loads later.
     */
    applyBackgroundImageHiding(key) {
        this.removeBackgroundImageHiding(key);

        const el = document.createElement('style');
        el.id = this.backgroundRuleId(key);
        el.textContent = `[${AccessibilityManager.HIDDEN_BG_ATTR}] { background-image: none !important; }`;
        document.head.appendChild(el);

        this.markBackgroundImages(document.body);

        this.backgroundObservers[key]?.disconnect();
        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1) this.markBackgroundImages(node);
                }
            }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
        this.backgroundObservers[key] = observer;
    }

    markBackgroundImages(root) {
        const mark = (element) => {
            if (this.isInsidePreviewDrawer(element)) return;
            const value = window.getComputedStyle(element).backgroundImage;
            if (value && value.includes('url(')) {
                element.setAttribute(AccessibilityManager.HIDDEN_BG_ATTR, '');
            }
        };

        if (root.nodeType === 1 && root !== document.body) mark(root);
        root.querySelectorAll?.('*').forEach(mark);
    }

    removeBackgroundImageHiding(key) {
        this.backgroundObservers[key]?.disconnect();
        delete this.backgroundObservers[key];

        document.getElementById(this.backgroundRuleId(key))?.remove();
        document
            .querySelectorAll(`[${AccessibilityManager.HIDDEN_BG_ATTR}]`)
            .forEach(element => element.removeAttribute(AccessibilityManager.HIDDEN_BG_ATTR));
    }

    removeCSSFeature(key) {
        this.removeStyleRule(key);
        this.removeBackgroundImageHiding(key);

        const cssProps = this.props[key];
        if (!cssProps) return;

        cssProps.forEach(item => {
            const property = this.toCssProperty(item.property);
            if (item.originalValue) {
                // Replay the author's own priority, not ours: apply() forces
                // `important`, so restoring without it would downgrade a declaration
                // the page had marked important.
                item.element.style.setProperty(property, item.originalValue, item.originalPriority || '');
            } else {
                item.element.style.removeProperty(property);
            }
        });

        delete this.props[key];
    }

    /**
     * Feature definitions may name a property in either CSS (`background-color`)
     * or camelCase (`backgroundColor`) form. setProperty()/removeProperty() only
     * accept the CSS form, so normalise before either is called.
     */
    toCssProperty(property) {
        return String(property).replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
    }

    applyBiggerText(key, attr) {
        if (!attr) return;
        fontManipulator()?.apply(document.body, attr.percent, attr.properties);
    }

    removeBiggerText(key) {
        fontManipulator()?.remove();
        delete this.props['biggerText'];
    }
    
    removeFeature(key) {
        switch (key) {
            case 'contrast':
                this.removeContrast();
                break;
            case 'cursor':
                this.removeCursor();
                break;
            case 'tooltips':
                this.removeTooltip();
                break;
            case 'dictionary':
                this.removeDictionary(key);
                break;
            case 'biggerText':
                this.removeBiggerText(key);
                break;
            case 'saturation':
                this.removeSaturation();
                break;
            default:
                this.removeExtensionFeature(key);
                break;
        }

        // Remove from previous values
        delete this.previousFeatureValues[key];
    }

    removeAllFeatures() {
        // Remove all features that are currently active
        Object.keys(this.previousFeatureValues).forEach(key => {
            this.removeFeature(key);
        });

        // Clear all stored data
        this.props = {};
        this.previousFeatureValues = {};
    }

    getActiveFeatures() {
        return { ...this.previousFeatureValues };
    }
}

const accessibilityManager = () => AccessibilityManager.getInstance();
export default accessibilityManager;
