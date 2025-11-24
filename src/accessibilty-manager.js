import cursor from "./classes/cursor";
import dictionary from "./classes/dictionary";
import fontManipulator from "./classes/font-manupulator";
import tooltips from "./classes/tooltips";

const { screenReader = () => null, smartContrast = () => null, muteSounds = () => null, filterFeatures = () => null, keyboardNavigation = () => null } = window.wapHelpers;
class AccessibilityManager {
    static instance = null;
    constructor() {
        if (AccessibilityManager.instance) return AccessibilityManager.instance;
        this.props = {}; // { contrast: [ { element, property, originalValue } ] }
        this.previousFeatureValues = {}; // Track previous values

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
                case 'screenReader':
                    this.applyScreenReader(key, attributes);
                    break;
                case 'smartContrast':
                    this.applySmartContrast(key, attributes);
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
                case 'muteSounds':
                    this.applyMuteSounds(key, attributes);
                    break;
                case 'grayscale':
                    filterFeatures()?.applyGrayScale(attributes);
                    break;
                case 'brightness':
                    filterFeatures()?.applyBrightness(attributes);
                    break;
                case 'biggerText':
                    this.applyBiggerText(key, attributes);
                    break;
                case 'keyboardNavigation':
                    keyboardNavigation()?.apply();
                    break;
                case 'saturation':
                    this.applySaturation(key, attributes);
                    break;
                case 'contrast':
                case 'highlightLinks':
                case 'textSpacing':
                case 'pauseAnimations':
                case 'hideImages':
                case 'dyslexiaFriendly':
                case 'lineHeight':
                case 'textAlign':
                    this.applyCSSFeature(key, attributes);
                    break;
            
            }

        }
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

    applyMuteSounds(key, attribute) {
        if (!attribute || !muteSounds) return;
        muteSounds()?.apply();
    }

    removeMuteSounds() {
        muteSounds()?.remove();
        delete this.props['muteSounds'];
    }

    applyScreenReader(key, attribute) {
        if (!attribute || !screenReader) return;
        screenReader()?.apply(key, attribute);
    }

    removeScreenReader() {
        if(screenReader){
            screenReader()?.destroy();
        }
        delete this.props['screenReader'];
    }

    applySmartContrast(key, attribute) {
        if (!attribute || !smartContrast) return;
        smartContrast()?.apply();
    }

    removeSmartContrast() {
        smartContrast()?.remove();
        delete this.props['smartContrast'];
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

        const previewButton = document.querySelector('.wap-preset__preview-button');
        let skipOriginal = false;

        attr.css.forEach(css => {
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

                    // 🔥 Check if original already stored
                    const alreadyStored = this.props[key].some(
                        item => item.element === element && item.property === property
                    );

                    if (!alreadyStored) {
                        this.props[key].push({
                            element,
                            property,
                            originalValue: skipOriginal
                                ? null
                                : (inlineOriginal ? inlineOriginal : null)
                        });
                    }

                    // Apply new CSS
                    element.style[property] = css.properties[property];
                }
            });
        });
    }


    removeCSSFeature(key) {
        const cssProps = this.props[key];
        if (!cssProps) return;

        cssProps.forEach(item => {
            item.element.style[item.property] = item.originalValue;
        });

        delete this.props[key];
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
        // Remove the feature
        if (key === 'screenReader') {
            this.removeScreenReader();
        } else if (key === 'contrast') {
            this.removeContrast();
        }else if (key === 'smartContrast') {
            this.removeSmartContrast();
        } else if (key === 'cursor') {
            this.removeCursor();
        } else if (key === 'tooltips') {
            this.removeTooltip();
        } else if (key === 'dictionary') {
            this.removeDictionary(key);
        }else if (key === 'muteSounds') {
            this.removeMuteSounds(key);
        }else if (key === 'grayscale') {
            filterFeatures()?.removeGrayScale();
            delete this.props['grayscale'];
        }else if (key === 'brightness') {
            filterFeatures()?.removeBrightness();
            delete this.props['brightness'];
        }else if (key === 'biggerText') {
            this.removeBiggerText(key);
        }else if (key === 'keyboardNavigation') {
            keyboardNavigation()?.remove();
            delete this.props['keyboardNavigation'];
        }else if (key === 'saturation') {
            this.removeSaturation();
        }else if (
            key === 'highlightLinks' ||
            key === 'textSpacing' ||
            key === 'pauseAnimations' ||
            key === 'hideImages' ||
            key === 'dyslexiaFriendly' ||
            key === 'lineHeight' ||
            key === 'textAlign'
        ) {
            this.removeCSSFeature(key);
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
