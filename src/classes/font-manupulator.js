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

        // element → { prop: { originalValue, inlineValue, hasInline } }
        //
        // Kept in memory and never dropped: remove() and apply() run in the same
        // synchronous task, and getComputedStyle() right after removeProperty()
        // still reports the scaled value. Re-reading it as the "original" made
        // every toggle of any other feature multiply the size again
        // (16 → 19.2 → 23.04 → 27.6 …). The first measurement is the only one
        // that can be trusted, so it is the one we keep.
        this.originals = new WeakMap();

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
            const remembered = this.originals.get(el) || {};
            const computed = window.getComputedStyle(el);
            const record = { ...remembered };

            validProps.forEach(prop => {
                const known = remembered[prop];

                // Measure once; every later pass scales that same baseline.
                const baseValue = known
                    ? known.originalValue
                    : (computed.getPropertyValue(prop) || '').trim();
                if (!baseValue) return;

                const match = baseValue.match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
                if (!match) return;

                const numeric = parseFloat(match[1]);
                if (!Number.isFinite(numeric)) return;

                const unit = match[2] || '';
                const inlineValue = known ? known.inlineValue : el.style.getPropertyValue(prop);

                record[prop] = {
                    originalValue: baseValue,
                    inlineValue,
                    hasInline: known ? known.hasInline : inlineValue !== ''
                };

                el.style.setProperty(prop, `${numeric * (1 + percent / 100)}${unit}`);
            });

            if (Object.keys(record).length > 0) {
                this.originals.set(el, record);
                el.setAttribute(this.dataAttribute, JSON.stringify(record));
            }
        }
    }

    /**
     * Remove previously applied font manipulations
     */
    remove(root = document.body) {
        const elements = Array.from(root.querySelectorAll(`[${this.dataAttribute}]`));

        for (let el of elements) {
            const record = this.originals.get(el) || this.parseMarker(el);

            Object.entries(record).forEach(([prop, value]) => {
                if (value.hasInline) {
                    el.style.setProperty(prop, value.inlineValue || '');
                } else {
                    el.style.removeProperty(prop);
                }
            });

            // The marker goes, the remembered baseline stays: an element's real
            // font size does not change just because the feature was switched off,
            // and keeping it is what makes a later apply() idempotent.
            el.removeAttribute(this.dataAttribute);
        }
    }

    /**
     * Read a marker written on a previous page load, tolerating the older
     * formats (a bare string, or an object without `originalValue`).
     *
     * @param {Element} el
     * @return {Object}
     */
    parseMarker(el) {
        const raw = el.getAttribute(this.dataAttribute);
        if (!raw) return {};

        let parsed;
        try {
            parsed = JSON.parse(raw);
        } catch (e) {
            return {};
        }
        if (!parsed || typeof parsed !== 'object') return {};

        const out = {};
        Object.entries(parsed).forEach(([prop, value]) => {
            if (typeof value === 'string') {
                out[prop] = { originalValue: value, inlineValue: value, hasInline: value !== '' };
                return;
            }
            if (!value || typeof value !== 'object') return;

            out[prop] = {
                originalValue: value.originalValue || value.inlineValue || '',
                inlineValue: value.inlineValue || '',
                hasInline: !!value.hasInline
            };
        });

        return out;
    }

    /**
     * Collect visible text elements
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
