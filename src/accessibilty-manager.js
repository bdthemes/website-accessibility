import { features } from "./utils";

class AccessibilityManager {
    constructor() {
        this.props = {}; // { contrast: [ { element, property, originalValue } ] }
        this.previousFeatureValues = {}; // Track previous values
    }

    init(key, value) {
        const feature = features.find(f => f.key === key);
        if (!feature) return;

        const prevValue = this.previousFeatureValues[key];

        // Skip if same value is already active
        if (prevValue === value) return;

        // Remove previous feature if exists
        this.removeFeature(key);

        this.previousFeatureValues[key] = value; // Store latest value

        switch (key) {
            case 'contrast':
                this.applyContrast(feature, value);
                break;
            case 'highlightLinks':
                this.applyHighlightLinks(feature, value);
                break;
            case 'biggerText':
                this.applyBiggerText(feature, value);
                break;
            case 'textSpacing':
                this.applyTextSpacing(feature, value);
                break;
            case 'pauseAnimations':
                this.applyPauseAnimations(feature, value);
                break;
            case 'hideImages':
                this.applyHideImages(feature, value);
                break;
            case 'dyslexiaFriendly':
                this.applyDyslexiaFriendly(feature, value);
                break;
            case 'cursor':
                this.applyCursor(feature, value);
                break;
            case 'lineHeight':
                this.applyLineHeight(feature, value);
                break;
            case 'textAlign':
                this.applyTextAlign(feature, value);
                break;
            case 'saturation':
                this.applySaturation(feature, value);
                break;
        }
    }

    // Helper method to check if element is inside preview drawer
    isInsidePreviewDrawer(element) {
        return element.closest('.wap-preset__preview-drawer') !== null;
    }

    applyContrast(feature, value) {
        const attr = feature.attributes.find(attr => attr.value === value);
        if (!attr) return;

        this.props['contrast'] = [];

        if (value === 'invert') {
            const html = document.querySelector('html');
            this.props['contrast'].push({
                element: html,
                property: 'filter',
                originalValue: html.style.filter || ''
            });
            html.style.filter = 'invert(1)';
            return;
        }

        attr.css.forEach(css => {
            const elements = document.querySelectorAll(css.selector);
            elements.forEach(element => {
                // Skip if element is inside preview drawer
                if (this.isInsidePreviewDrawer(element)) {
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

    // Highlight Links
    applyHighlightLinks(feature, value) {
        const attr = feature.attributes.find(attr => attr.value === value);
        if (!attr) return;

        this.props['highlightLinks'] = [];

        if (value === 'enable') {
            attr.css.forEach(css => {
                const elements = document.querySelectorAll(css.selector);
                elements.forEach(element => {
                    // Skip if element is inside preview drawer
                    if (this.isInsidePreviewDrawer(element)) {
                        return;
                    }

                    for (const property in css.properties) {
                        this.props['highlightLinks'].push({
                            element,
                            property,
                            originalValue: element.style[property] || ''
                        });
                        element.style[property] = css.properties[property];
                    }
                });
            });
        }
    }

    removeHighlightLinks() {
        const highlightProps = this.props['highlightLinks'];
        if (!highlightProps) return;

        highlightProps.forEach(item => {
            item.element.style[item.property] = item.originalValue;
        });

        delete this.props['highlightLinks'];
    }

    // Bigger Text
    applyBiggerText(feature, value) {
        const attr = feature.attributes.find(attr => attr.value === value);
        if (!attr) return;

        this.props['biggerText'] = [];

        attr.css.forEach(css => {
            const elements = document.querySelectorAll(css.selector);
            elements.forEach(element => {
                // Skip if element is inside preview drawer
                if (this.isInsidePreviewDrawer(element)) {
                    return;
                }

                for (const property in css.properties) {
                    this.props['biggerText'].push({
                        element,
                        property,
                        originalValue: element.style[property] || ''
                    });
                    element.style[property] = css.properties[property];
                }
            });
        });
    }

    removeBiggerText() {
        const biggerTextProps = this.props['biggerText'];
        if (!biggerTextProps) return;

        biggerTextProps.forEach(item => {
            item.element.style[item.property] = item.originalValue;
        });

        delete this.props['biggerText'];
    }

    // Text Spacing
    applyTextSpacing(feature, value) {
        const attr = feature.attributes.find(attr => attr.value === value);
        if (!attr) return;

        this.props['textSpacing'] = [];

        attr.css.forEach(css => {
            const elements = document.querySelectorAll(css.selector);
            elements.forEach(element => {
                // Skip if element is inside preview drawer
                if (this.isInsidePreviewDrawer(element)) {
                    return;
                }

                for (const property in css.properties) {
                    this.props['textSpacing'].push({
                        element,
                        property,
                        originalValue: element.style[property] || ''
                    });
                    element.style[property] = css.properties[property];
                }
            });
        });
    }

    removeTextSpacing() {
        const textSpacingProps = this.props['textSpacing'];
        if (!textSpacingProps) return;

        textSpacingProps.forEach(item => {
            item.element.style[item.property] = item.originalValue;
        });

        delete this.props['textSpacing'];
    }

    // Pause Animations
    applyPauseAnimations(feature, value) {
        const attr = feature.attributes.find(attr => attr.value === value);
        if (!attr) return;

        this.props['pauseAnimations'] = [];

        if (value === 'enable') {
            attr.css.forEach(css => {
                const elements = document.querySelectorAll(css.selector);
                elements.forEach(element => {
                    // Skip if element is inside preview drawer
                    if (this.isInsidePreviewDrawer(element)) {
                        return;
                    }

                    for (const property in css.properties) {
                        this.props['pauseAnimations'].push({
                            element,
                            property,
                            originalValue: element.style[property] || ''
                        });
                        element.style[property] = css.properties[property];
                    }
                });
            });
        }
    }

    removePauseAnimations() {
        const pauseAnimationsProps = this.props['pauseAnimations'];
        if (!pauseAnimationsProps) return;

        pauseAnimationsProps.forEach(item => {
            item.element.style[item.property] = item.originalValue;
        });

        delete this.props['pauseAnimations'];
    }

    // Hide Images
    applyHideImages(feature, value) {
        const attr = feature.attributes.find(attr => attr.value === value);
        if (!attr) return;

        this.props['hideImages'] = [];

        if (value === 'enable') {
            attr.css.forEach(css => {
                const elements = document.querySelectorAll(css.selector);
                elements.forEach(element => {
                    // Skip if element is inside preview drawer
                    if (this.isInsidePreviewDrawer(element)) {
                        return;
                    }

                    for (const property in css.properties) {
                        this.props['hideImages'].push({
                            element,
                            property,
                            originalValue: element.style[property] || ''
                        });
                        element.style[property] = css.properties[property];
                    }
                });
            });
        }
    }

    removeHideImages() {
        const hideImagesProps = this.props['hideImages'];
        if (!hideImagesProps) return;

        hideImagesProps.forEach(item => {
            item.element.style[item.property] = item.originalValue;
        });

        delete this.props['hideImages'];
    }

    // Dyslexia Friendly
    applyDyslexiaFriendly(feature, value) {
        const attr = feature.attributes.find(attr => attr.value === value);
        if (!attr) return;

        this.props['dyslexiaFriendly'] = [];

        attr.css.forEach(css => {
            const elements = document.querySelectorAll(css.selector);
            elements.forEach(element => {
                // Skip if element is inside preview drawer
                if (this.isInsidePreviewDrawer(element)) {
                    return;
                }

                for (const property in css.properties) {
                    this.props['dyslexiaFriendly'].push({
                        element,
                        property,
                        originalValue: element.style[property] || ''
                    });
                    element.style[property] = css.properties[property];
                }
            });
        });
    }

    removeDyslexiaFriendly() {
        const dyslexiaFriendlyProps = this.props['dyslexiaFriendly'];
        if (!dyslexiaFriendlyProps) return;

        dyslexiaFriendlyProps.forEach(item => {
            item.element.style[item.property] = item.originalValue;
        });

        delete this.props['dyslexiaFriendly'];
    }

    // Cursor
    applyCursor(feature, value) {
        const attr = feature.attributes.find(attr => attr.value === value);
        if (!attr) return;

        this.props['cursor'] = [];

        attr.css.forEach(css => {
            const elements = document.querySelectorAll(css.selector);
            elements.forEach(element => {
                // Skip if element is inside preview drawer
                if (this.isInsidePreviewDrawer(element)) {
                    return;
                }

                for (const property in css.properties) {
                    this.props['cursor'].push({
                        element,
                        property,
                        originalValue: element.style[property] || ''
                    });
                    element.style[property] = css.properties[property];
                }
            });
        });
    }

    removeCursor() {
        const cursorProps = this.props['cursor'];
        if (!cursorProps) return;

        cursorProps.forEach(item => {
            item.element.style[item.property] = item.originalValue;
        });

        delete this.props['cursor'];
    }

    // Line Height
    applyLineHeight(feature, value) {
        const attr = feature.attributes.find(attr => attr.value === value);
        if (!attr) return;

        this.props['lineHeight'] = [];

        attr.css.forEach(css => {
            const elements = document.querySelectorAll(css.selector);
            elements.forEach(element => {
                // Skip if element is inside preview drawer
                if (this.isInsidePreviewDrawer(element)) {
                    return;
                }

                for (const property in css.properties) {
                    this.props['lineHeight'].push({
                        element,
                        property,
                        originalValue: element.style[property] || ''
                    });
                    element.style[property] = css.properties[property];
                }
            });
        });
    }

    removeLineHeight() {
        const lineHeightProps = this.props['lineHeight'];
        if (!lineHeightProps) return;

        lineHeightProps.forEach(item => {
            item.element.style[item.property] = item.originalValue;
        });

        delete this.props['lineHeight'];
    }

    // Text Alignment
    applyTextAlign(feature, value) {
        const attr = feature.attributes.find(attr => attr.value === value);
        if (!attr) return;

        this.props['textAlign'] = [];

        attr.css.forEach(css => {
            const elements = document.querySelectorAll(css.selector);
            elements.forEach(element => {
                // Skip if element is inside preview drawer
                if (this.isInsidePreviewDrawer(element)) {
                    return;
                }

                for (const property in css.properties) {
                    this.props['textAlign'].push({
                        element,
                        property,
                        originalValue: element.style[property] || ''
                    });
                    element.style[property] = css.properties[property];
                }
            });
        });
    }

    removeTextAlign() {
        const textAlignProps = this.props['textAlign'];
        if (!textAlignProps) return;

        textAlignProps.forEach(item => {
            item.element.style[item.property] = item.originalValue;
        });

        delete this.props['textAlign'];
    }

    // Saturation
    applySaturation(feature, value) {
        const attr = feature.attributes.find(attr => attr.value === value);
        if (!attr) return;

        this.props['saturation'] = [];

        attr.css.forEach(css => {
            const elements = document.querySelectorAll(css.selector);
            elements.forEach(element => {
                // Skip if element is inside preview drawer
                if (this.isInsidePreviewDrawer(element)) {
                    return;
                }

                for (const property in css.properties) {
                    this.props['saturation'].push({
                        element,
                        property,
                        originalValue: element.style[property] || ''
                    });
                    element.style[property] = css.properties[property];
                }
            });
        });
    }

    removeSaturation() {
        const saturationProps = this.props['saturation'];
        if (!saturationProps) return;

        saturationProps.forEach(item => {
            item.element.style[item.property] = item.originalValue;
        });

        delete this.props['saturation'];
    }

    removeFeature(key) {
        if (key === 'contrast') {
            this.removeContrast();
        }
        if (key === 'highlightLinks') {
            this.removeHighlightLinks();
        }
        if (key === 'biggerText') {
            this.removeBiggerText();
        }
        if (key === 'textSpacing') {
            this.removeTextSpacing();
        }
        if (key === 'pauseAnimations') {
            this.removePauseAnimations();
        }
        if (key === 'hideImages') {
            this.removeHideImages();
        }
        if (key === 'dyslexiaFriendly') {
            this.removeDyslexiaFriendly();
        }
        if (key === 'cursor') {
            this.removeCursor();
        }
        if (key === 'lineHeight') {
            this.removeLineHeight();
        }
        if (key === 'textAlign') {
            this.removeTextAlign();
        }
        if (key === 'saturation') {
            this.removeSaturation();
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

export default AccessibilityManager;
