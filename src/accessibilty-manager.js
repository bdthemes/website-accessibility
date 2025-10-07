import dictionary from "./dictionary";
const { screenReader = () => null, smartContrast = () => null, muteSounds = () => null } = window.wapHelpers;
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
                case 'contrast':
                case 'highlightLinks':
                case 'biggerText':
                case 'textSpacing':
                case 'pauseAnimations':
                case 'hideImages':
                case 'dyslexiaFriendly':
                case 'lineHeight':
                case 'textAlign':
                case 'saturation':
                case 'grayscale':
                case 'brightness':
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

    applyCursor(key, attribute) {
        if (!attribute) return;
        if ('big-cursor' === attribute.value) {
            this.applyCSSFeature(key, attribute);
        }

        if ('mask' === attribute.value) {
            this.applyCursorMask();
        }

        if ('guideline' === attribute.value) {
            this.applyCursorGuideline();
        }
    }

    applyCursorMask() {
        if (document.getElementById('wap-cursor-mask')) return;

        const mask = document.createElement('div');
        mask.id = 'wap-cursor-mask';

        // Set mask height variable here (easy to update later)
        const maskHeight = 300; // <- Change this value to any height (px)
        const halfHeight = maskHeight / 2;

        mask.style.setProperty('--mask-height', `${maskHeight}px`);
        mask.style.setProperty('--half-mask-height', `${halfHeight}px`);

        Object.assign(mask.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            maskImage: `linear-gradient(to bottom,
            black 0,
            black calc(var(--y, 50%) - var(--half-mask-height)),
            transparent calc(var(--y, 50%) - var(--half-mask-height)),
            transparent calc(var(--y, 50%) + var(--half-mask-height)),
            black calc(var(--y, 50%) + var(--half-mask-height)),
            black 100%)`,
            WebkitMaskImage: `linear-gradient(to bottom,
            black 0,
            black calc(var(--y, 50%) - var(--half-mask-height)),
            transparent calc(var(--y, 50%) - var(--half-mask-height)),
            transparent calc(var(--y, 50%) + var(--half-mask-height)),
            black calc(var(--y, 50%) + var(--half-mask-height)),
            black 100%)`,
            zIndex: '999999'
        });

        // Add a visible outline
        const outline = document.createElement('div');
        outline.id = 'wap-cursor-outline';
        Object.assign(outline.style, {
            position: 'fixed',
            left: '0',
            width: '100vw',
            height: `${maskHeight}px`,
            pointerEvents: 'none',
            borderTop: '3px solid yellow',
            borderBottom: '3px solid yellow',
            boxSizing: 'border-box',
            zIndex: '999999'
        });

        document.body.appendChild(mask);
        document.body.appendChild(outline);

        // Save for reuse
        this.maskOutlineElement = outline;
        this.maskHalfHeight = halfHeight;

        document.addEventListener('mousemove', this.updateMaskCursor);
    }


    updateMaskCursor = (e) => {
        const mask = document.getElementById('wap-cursor-mask');
        const outline = this.maskOutlineElement;
        const halfHeight = this.maskHalfHeight;

        if (mask) {
            mask.style.setProperty('--y', `${e.clientY}px`);
        }

        if (outline) {
            const top = Math.max(0, Math.min(window.innerHeight - (halfHeight * 2), e.clientY - halfHeight));
            outline.style.top = `${top}px`;
        }
    }

    applyCursorGuideline() {
        if (document.getElementById('wap-cursor-guideline')) return;

        const bar = document.createElement('div');
        bar.id = 'wap-cursor-guideline';

        Object.assign(bar.style, {
            position: 'fixed',
            left: '0',
            top: '0',
            width: '45vw',                // Adjustable width (40–50vw)
            height: '10px',                // Line thickness
            backgroundColor: '#000',
            outline: '2px solid yellow',   // Yellow outline
            borderRadius: '2px',
            pointerEvents: 'none',
            zIndex: '999999',
            transition: 'top 0.02s linear, left 0.02s linear'
        });

        document.body.appendChild(bar);
        document.addEventListener('mousemove', this.updateGuidelineCursor);
    }

    updateGuidelineCursor = (e) => {
        const bar = document.getElementById('wap-cursor-guideline');
        if (!bar) return;

        const barWidth = bar.offsetWidth;
        const viewportWidth = window.innerWidth;

        // Calculate the ideal left position to center the bar
        let left = e.clientX - barWidth / 2;

        // Adjust if it would overflow left
        if (left < 0) {
            left = 0;
        }

        // Adjust if it would overflow right
        if (left + barWidth > viewportWidth) {
            left = viewportWidth - barWidth;
        }

        // Position the bar 5px above the cursor
        const top = e.clientY - 15;
        bar.style.left = `${left}px`;
        bar.style.top = `${top}px`;
    };

    removeCursor() {
        // Remove cursor mask and outline
        const mask = document.getElementById('wap-cursor-mask');
        const outline = document.getElementById('wap-cursor-outline');
        if (mask) mask.remove();
        if (outline) outline.remove();

        // Remove cursor guideline
        const guideline = document.getElementById('wap-cursor-guideline');
        if (guideline) guideline.remove();

        // Remove event listeners
        document.removeEventListener('mousemove', this.updateMaskCursor);
        document.removeEventListener('mousemove', this.updateGuidelineCursor);

        // Clear references
        this.maskOutlineElement = null;
        this.maskHalfHeight = null;

        // Remove props
        this.removeCSSFeature('cursor');

        // Clean up props
        delete this.props['cursor'];
    }

    applyTooltip() {
        if (this.tooltipInitialized) return;
        this.tooltipInitialized = true;

        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.id = 'wap-accessibility-tooltip';

        Object.assign(tooltip.style, {
            position: 'fixed',
            padding: '8px 12px',
            background: 'rgba(0, 0, 0, 0.85)',
            color: '#fff',
            fontSize: '14px',
            borderRadius: '4px',
            zIndex: '999999',
            pointerEvents: 'none',
            whiteSpace: 'normal',
            wordWrap: 'break-word',
            maxWidth: '250px',
            opacity: '0',
            transition: 'opacity 0.2s ease',
            boxSizing: 'border-box',
        });

        // Arrow
        const arrow = document.createElement('div');
        arrow.id = 'wap-tooltip-arrow';
        Object.assign(arrow.style, {
            position: 'absolute',
            width: '0',
            height: '0',
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            zIndex: '999999',
        });

        tooltip.appendChild(arrow);
        document.body.appendChild(tooltip);

        let mouseMoveHandler = null;

        const showTooltip = (e) => {
            let el = e.target;
            let label = el.getAttribute('aria-label') || (el.tagName === 'IMG' ? el.alt : null);

            // Traverse max 2 parents up
            for (let i = 0; i < 2 && !label && el?.parentElement; i++) {
                el = el.parentElement;
                label = el.getAttribute('aria-label') || (el.tagName === 'IMG' ? el.alt : null);
            }

            if (label) {
                tooltip.textContent = label;
                tooltip.appendChild(arrow); // re-append arrow

                tooltip.style.opacity = '1';

                mouseMoveHandler = (e) => {
                    const mouseX = e.clientX;
                    const mouseY = e.clientY;

                    // Temporarily show tooltip offscreen to get size
                    tooltip.style.left = '-9999px';
                    tooltip.style.top = '-9999px';
                    tooltip.style.display = 'block';
                    const tooltipRect = tooltip.getBoundingClientRect();
                    const arrowHeight = 6;

                    let top, arrowTop, arrowBorder, transformArrow;
                    let showAbove = mouseY > tooltipRect.height + 20;

                    if (showAbove) {
                        top = mouseY - tooltipRect.height - 12;
                        arrowTop = tooltipRect.height;
                        arrowBorder = '6px solid rgba(0, 0, 0, 0.85)';
                        transformArrow = 'rotate(180deg)';
                    } else {
                        top = mouseY + 20;
                        arrowTop = -6;
                        arrowBorder = '6px solid rgba(0, 0, 0, 0.85)';
                        transformArrow = 'none';
                    }

                    const left = Math.min(
                        Math.max(mouseX - tooltipRect.width / 2, 10),
                        window.innerWidth - tooltipRect.width - 10
                    );

                    Object.assign(tooltip.style, {
                        left: `${left}px`,
                        top: `${top}px`
                    });

                    Object.assign(arrow.style, {
                        top: `${arrowTop}px`,
                        left: '50%',
                        transform: `translateX(-50%) ${transformArrow}`,
                        borderTop: showAbove ? 'none' : arrowBorder,
                        borderBottom: showAbove ? arrowBorder : 'none',
                    });
                };

                document.addEventListener('mousemove', mouseMoveHandler);
            }
        };

        const hideTooltip = () => {
            tooltip.style.opacity = '0';
            if (mouseMoveHandler) {
                document.removeEventListener('mousemove', mouseMoveHandler);
                mouseMoveHandler = null;
            }
        };

        document.addEventListener('mouseover', showTooltip);
        document.addEventListener('mouseout', hideTooltip);

        this.tooltipCleanup = () => {
            document.removeEventListener('mouseover', showTooltip);
            document.removeEventListener('mouseout', hideTooltip);
            if (mouseMoveHandler) document.removeEventListener('mousemove', mouseMoveHandler);
            tooltip.remove();
            this.tooltipInitialized = false;
        };
    }

    removeTooltip() {
        if (this.tooltipCleanup) {
            this.tooltipCleanup();
            delete this.tooltipCleanup;
        }
    }

    applyDictionary(key, attr) {
        if (!attr) return;
        dictionary().apply();
    }

    removeDictionary(key) {
        dictionary().remove();
    }

    applyCSSFeature(key, attr) {
        if (!attr?.css || attr?.css?.length == 0) return;
        const previewButton = document.querySelector('.wap-preset__preview-button');
        let skipOriginal = false;
        attr.css.forEach(css => {
            const elements = document.querySelectorAll(css.selector);
            elements.forEach(element => {
                // Skip if element is inside preview drawer
                if (this.isInsidePreviewDrawer(element) || element === previewButton || previewButton?.contains(element)) {
                    return;
                }

                if (key == 'highlightLinks' && this.props['contrast']?.length > 0) {
                    skipOriginal = true;
                }

                for (const property in css.properties) {
                    this.props[key].push({
                        element,
                        property,
                        originalValue: skipOriginal ? null : element.style[property] || ''
                    });
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


    removeFeature(key) {
        // Remove the feature
        if (key === 'screenReader') {
            screenReader ? screenReader()?.destroy() : null;
        } else if (key === 'smartContrast') {
            smartContrast()?.remove();
        } else if (key === 'cursor') {
            this.removeCursor();
        } else if (key === 'tooltips') {
            this.removeTooltip();
        } else if (key === 'dictionary') {
            this.removeDictionary(key);
        }else if (key === 'muteSounds') {
            this.removeMuteSounds(key);
        }else if (
            key === 'contrast' ||
            key === 'highlightLinks' ||
            key === 'biggerText' ||
            key === 'textSpacing' ||
            key === 'pauseAnimations' ||
            key === 'hideImages' ||
            key === 'dyslexiaFriendly' ||
            key === 'lineHeight' ||
            key === 'textAlign' ||
            key === 'saturation' ||
            key === 'grayscale' ||
            key === 'brightness'
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
