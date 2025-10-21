class FontManipulator {
    static instance = null;

    constructor(options = {}) {
        if (FontManipulator.instance) return FontManipulator.instance;

        this.dataAttribute = 'data-font-manipulator';
        this.validProperties = [
            'font-size',
            'line-height',
            'letter-spacing',
            'word-spacing'
        ]; // ✅ validators

        this.userPercent = options.percent || 20;
        this.userProperties = options.properties || ['font-size'];

        FontManipulator.instance = this;
    }

    static getInstance(options) {
        if (!FontManipulator.instance) {
            FontManipulator.instance = new FontManipulator(options);
        }
        return FontManipulator.instance;
    }

    /**
     * Apply user-defined font manipulations
     */
    apply(root = document.body, percent = this.userPercent, properties = this.userProperties) {
        const textElements = this.collectTextElements(root);
        const validProps = properties.filter(p => this.validProperties.includes(p));

        for (let el of textElements) {
            const computed = window.getComputedStyle(el);
            const stored = {};

            validProps.forEach(prop => {
                const originalValue = computed.getPropertyValue(prop);
                if (!originalValue) return;

                const numeric = parseFloat(originalValue);
                const unit = originalValue.replace(/[0-9.\s]/g, '') || 'px';

                const newValue = numeric * (1 + percent / 100);
                stored[prop] = originalValue;

                el.style.setProperty(prop, `${newValue}${unit}`);
            });

            // Store original values as JSON
            if (Object.keys(stored).length > 0) {
                el.setAttribute(this.dataAttribute, JSON.stringify(stored));
            }
        }
    }

    /**
     * Remove previously applied font manipulations
     */
    remove(root = document.body) {
        const elements = Array.from(root.querySelectorAll(`[${this.dataAttribute}]`));

        for (let el of elements) {
            const storedData = el.getAttribute(this.dataAttribute);
            if (!storedData) continue;

            try {
                const original = JSON.parse(storedData);
                Object.entries(original).forEach(([prop, value]) => {
                    el.style.setProperty(prop, value);
                });
            } catch (e) {
                console.warn('Invalid font-manipulator data:', e);
            }

            el.removeAttribute(this.dataAttribute);
        }
    }

    /**
     * Collect visible text elements (based on SmartContrast logic)
     */
    collectTextElements(root = document.body) {
        const allElements = Array.from(root.querySelectorAll('*'));
        const textElements = [];
        const skipSelectors = ['#wpadminbar', '.ant-drawer-content-wrapper', 'link', 'script', 'style'];

        const skippedRoots = skipSelectors
            .map(sel => Array.from(document.querySelectorAll(sel)))
            .flat();

        for (let el of allElements) {
            if (el === document.body) continue;
            if (skippedRoots.some(rootEl => rootEl.contains(el))) continue;

            const hasVisibleText = Array.from(el.childNodes).some(node =>
                node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0
            );
            if (!hasVisibleText) continue;

            const style = window.getComputedStyle(el);
            if (
                style.display === 'none' ||
                style.visibility === 'hidden' ||
                parseFloat(style.opacity) === 0
            ) continue;

            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) continue;

            if (style.color === 'rgba(0, 0, 0, 0)') continue;

            textElements.push(el);
        }

        return textElements;
    }
}

// Singleton helper
const fontManipulator = (options) => FontManipulator.getInstance(options);
export default fontManipulator;
