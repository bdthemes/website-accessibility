import { features } from "./utils";

class AccessibilityManager {
    constructor() {
        this.props = {}; // { contrast: [ { element, property, originalValue } ] }
        this.currentContrastValue = null;
        this.previousFeatureValues = {}; // Track previous values
        this.restoreFeatures();
    }

    init(key, value) {
        const feature = features.find(f => f.key === key);
        if (!feature) return;

        const prevValue = this.previousFeatureValues[key];

        // Skip if same value is already active
        if (prevValue === value) return;

        // Remove previous feature if exists
        if (key === 'contrast' && this.currentContrastValue) {
            this.removeContrast();
        }

        this.setActiveFeature(key, value);
        this.previousFeatureValues[key] = value; // Store latest value

        switch (key) {
            case 'contrast':
                this.applyContrast(feature, value);
                break;
        }
    }

    applyContrast(feature, value) {
        const attr = feature.attributes.find(attr => attr.value === value);
        if (!attr) return;

        this.props['contrast'] = [];
        this.currentContrastValue = value;

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
        this.removeActiveFeature('contrast');
        delete this.previousFeatureValues['contrast']; // Clear previous
        this.currentContrastValue = null;
    }

    removeFeature(key) {
        if (key === 'contrast') {
            this.removeContrast();
        }
    }

    removeAllFeatures() {
        const active = this.getActiveFeatures();
        for (const key in active) {
            this.removeFeature(key);
        }
    }

    restoreFeatures() {
        const active = this.getActiveFeatures();
        for (const key in active) {
            this.init(key, active[key]);
        }
    }

    // ========== Local Storage Helpers ==========

    setActiveFeature(key, value) {
        const active = this.getActiveFeatures();
        active[key] = value;
        localStorage.setItem('a11y_active_features', JSON.stringify(active));
    }

    removeActiveFeature(key) {
        const active = this.getActiveFeatures();
        delete active[key];
        localStorage.setItem('a11y_active_features', JSON.stringify(active));
    }

    getActiveFeatures() {
        try {
            return JSON.parse(localStorage.getItem('a11y_active_features')) || {};
        } catch (e) {
            return {};
        }
    }
}

export default AccessibilityManager;
