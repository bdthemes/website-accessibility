import screenReader from "./screen-reader";
import smartContrast from "./smart-contrast";

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
                case 'highlightLinks':
                case 'biggerText':
                case 'textSpacing':
                case 'pauseAnimations':
                case 'hideImages':
                case 'dyslexiaFriendly':
                case 'cursor':
                case 'lineHeight':
                case 'textAlign':
                case 'saturation':
                    this.applyCSSFeature(key, attributes);
                    break;
            }

        }
    }

    // Helper method to check if element is inside preview drawer
    isInsidePreviewDrawer(element) {
        const wrapper = document.querySelector('.wap-preset__preview-drawer');
        if (!wrapper) return false;
        return wrapper.contains(element);
    }

    applyContrast(key, attribute) {
        if (!attribute) return;

        attribute.css.forEach(css => {
            const elements = document.querySelectorAll(css.selector);
            elements.forEach(element => {
                // Skip if element is inside preview drawer
                if (this.isInsidePreviewDrawer(element) && attribute?.value !== 'invert') {
                    return;
                }

                for (const property in css.properties) {
                    this.props['contrast'].push({
                        element,
                        property,
                        originalValue: element.style[property] || ''
                    });

                    element.style[property] = css.properties[property];
                }
            });
        });
    }

    removeContrast() {
        const contrastProps = this.props['contrast'];
        if (!contrastProps) return;

        contrastProps.forEach(item => {
            item.element.style[item.property] = item.originalValue;
        });

        delete this.props['contrast'];
    }

    applyScreenReader(key, attribute) {
        if (!attribute) return;
        screenReader().apply(key, attribute);
    }


    removeScreenReader() {
        screenReader().destroy();
        delete this.props['screenReader'];
    }

    applySmartContrast(key, attribute) {
        if (!attribute) return;
        smartContrast().apply();
    }

    removeSmartContrast() {
        smartContrast().remove();
        delete this.props['smartContrast'];
    }

    applyCSSFeature(key, attr) {
        if (!attr?.css || attr?.css?.length == 0) return;
        const previewButton = document.querySelector('.wap-preset__preview-button');

        attr.css.forEach(css => {
            const elements = document.querySelectorAll(css.selector);
            elements.forEach(element => {
                // Skip if element is inside preview drawer
                if (this.isInsidePreviewDrawer(element) || element === previewButton || previewButton?.contains(element)) {
                    return;
                }

                for (const property in css.properties) {
                    this.props[key].push({
                        element,
                        property,
                        originalValue: element.style[property] || ''
                    });
                    element.style[property] = css.properties[property];
                }
            });
        });
    }

    removeCSSFeature(key) {
        const saturationProps = this.props[key];
        if (!saturationProps) return;

        saturationProps.forEach(item => {
            item.element.style[item.property] = item.originalValue;
        });

        delete this.props[key];
    }


    removeFeature(key) {
        if (key === 'contrast') {
            this.removeContrast();
        } else if (key === 'screenReader') {
            screenReader().destroy();
        } else if (key === 'smartContrast') {
            smartContrast().remove();
        }else if (
            key === 'highlightLinks' ||
            key === 'biggerText' ||
            key === 'textSpacing' ||
            key === 'pauseAnimations' ||
            key === 'hideImages' ||
            key === 'dyslexiaFriendly' ||
            key === 'cursor' ||
            key === 'lineHeight' ||
            key === 'textAlign' ||
            key === 'saturation'
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
