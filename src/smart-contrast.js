class SmartContrast {
    static instance = null;

    constructor(options = {}) {
        if (SmartContrast.instance) return SmartContrast.instance;

        this.minimumContrast = options.minimumContrast || 4.5;
        this.enabled = false;
        this.observer = null;
        this.excludedSelectors = options.excludedSelectors || [
            '#wpadminbar',
            '.wap-preview-button',
            '.wap-preset__preview-drawer',
        ];
        this.fallbackBgColor = options.fallbackBgColor || '#ffffff';
        this.useTextShadow = options.useTextShadow !== false;
        this.dataAttribute = 'data-smart-contrast';

        SmartContrast.instance = this;
    }

    static getInstance(options) {
        if (!SmartContrast.instance) {
            SmartContrast.instance = new SmartContrast(options);
        }
        return SmartContrast.instance;
    }

    apply(root = document.body) {
        if (this.enabled) return;
        this.enabled = true;

        this.processElements(root);

        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.processElements(node);
                        }
                    });
                } else if (mutation.type === 'attributes' && ['style', 'class'].includes(mutation.attributeName)) {
                    this.applyContrastIfNeeded(mutation.target);
                }
            });
        });

        this.observer.observe(root, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class'],
        });
    }

    remove() {
        if (!this.enabled) return;
        this.enabled = false;

        // Find all elements with the data-smart-contrast attribute
        const modifiedElements = document.querySelectorAll(`[${this.dataAttribute}]`);
        
        modifiedElements.forEach((el) => {
            // Parse the stored original styles from the data attribute
            const originalStyles = el.getAttribute(this.dataAttribute) 
                ? JSON.parse(el.getAttribute(this.dataAttribute)) 
                : {};

            // Restore or remove inline styles
            ['color', 'text-shadow'].forEach((prop) => {
                if (originalStyles[prop] === null) {
                    el.style.removeProperty(prop);
                } else if (originalStyles[prop] !== undefined) {
                    el.style[prop] = originalStyles[prop];
                }
            });

            // Remove the data attribute
            el.removeAttribute(this.dataAttribute);

            // If no inline styles remain, remove the style attribute entirely
            if (!el.style.length) {
                el.removeAttribute('style');
            }
        });

        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }

    shouldSkip(el) {
        const tag = el.tagName.toLowerCase();
        if (
            ['html', 'head', 'body', 'meta', 'script', 'style'].includes(tag) ||
            el.hasAttribute('aria-hidden') ||
            this.excludedSelectors.some((sel) => el.closest(sel))
        ) {
            return true;
        }

        const style = window.getComputedStyle(el);
        return (
            el.hidden ||
            el.offsetParent === null ||
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            !style.color ||
            !this.hasVisibleText(el)
        );
    }

    hasVisibleText(el) {
        const text = el.textContent?.trim();
        const hasPseudoContent =
            window.getComputedStyle(el, '::before').content !== 'none' ||
            window.getComputedStyle(el, '::after').content !== 'none';
        return !!text && text.length > 0 || hasPseudoContent;
    }

    processElements(root) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null, false);
        let node;
        while ((node = walker.nextNode())) {
            if (this.shouldSkip(node)) continue;
            this.applyContrastIfNeeded(node);
        }
    }

    async applyContrastIfNeeded(el) {
        const style = window.getComputedStyle(el);
        const textColor = this.parseColor(style.color, el, 'color');
        let bgColor = this.parseColor(style.backgroundColor, el, 'backgroundColor');

        const bgImage = style.backgroundImage;
        if (bgImage && bgImage !== 'none') {
            bgColor = await this.getDominantColorFromImage(el, bgImage);
        }

        if (!bgColor || !textColor) {
            if (this.useTextShadow) this.applyTextShadow(el);
            return;
        }

        const contrast = this.getContrastRatio(textColor, bgColor);

        if (contrast < this.minimumContrast) {
            const newColor = this.getAccessibleTextColor(bgColor, textColor);
            if (newColor !== style.color || (this.useTextShadow && bgImage !== 'none')) {
                // Store original inline styles in data attribute
                const originalStyles = {
                    color: el.style.color || null,
                    'text-shadow': el.style.textShadow || null,
                };
                el.setAttribute(this.dataAttribute, JSON.stringify(originalStyles));

                // Apply new styles
                el.style.color = newColor;
                if (this.useTextShadow && bgImage !== 'none') {
                    this.applyTextShadow(el);
                }
            }
        }
    }

    async getDominantColorFromImage(el, bgImage) {
        const urlMatch = bgImage.match(/url\(["']?([^"']+)["']?\)/);
        if (!urlMatch) return this.fallbackBgColor;

        const imgUrl = urlMatch[1];
        try {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = imgUrl;

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = () => reject(new Error('Image load failed'));
            });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);

            const rect = el.getBoundingClientRect();
            const sampleWidth = Math.min(rect.width, img.width);
            const sampleHeight = Math.min(rect.height, img.height);
            const imageData = context.getImageData(0, 0, sampleWidth, sampleHeight).data;

            let r = 0, g = 0, b = 0, count = 0;
            for (let i = 0; i < imageData.length; i += 4) {
                r += imageData[i];
                g += imageData[i + 1];
                b += imageData[i + 2];
                count++;
            }

            return this.rgbToHex(
                Math.round(r / count),
                Math.round(g / count),
                Math.round(b / count)
            );
        } catch (e) {
            console.warn('Failed to extract dominant color:', e);
            return this.fallbackBgColor;
        }
    }

    applyTextShadow(el) {
        el.style.textShadow = '0 0 3px rgba(0, 0, 0, 0.8), 0 0 5px rgba(0, 0, 0, 0.6)';
    }

    parseColor(colorStr, el, property) {
        if (!colorStr || colorStr === 'inherit' || colorStr === 'transparent' || colorStr.includes('rgba(0, 0, 0, 0)')) {
            return this.getParentColor(el, property);
        }

        const rgb = colorStr.match(/\d+/g);
        if (!rgb || rgb.length < 3) return null;

        return this.rgbToHex(
            parseInt(rgb[0], 10),
            parseInt(rgb[1], 10),
            parseInt(rgb[2], 10)
        );
    }

    getParentColor(el, property) {
        let current = el;
        while (current && current !== document.documentElement) {
            const style = window.getComputedStyle(current);
            const color = style[property];
            if (color && color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)') {
                return this.parseColor(color, current, property);
            }
            current = current.parentElement;
        }
        return property === 'backgroundColor' ? this.fallbackBgColor : '#000000';
    }

    getAccessibleTextColor(bgColor, currentTextColor) {
        const hsl = this.hexToHSL(currentTextColor);
        let adjustedHSL = { ...hsl };

        for (let l = 100; l >= 0; l -= 5) {
            adjustedHSL.l = l;
            const candidateColor = this.hslToHex(adjustedHSL);
            const contrast = this.getContrastRatio(candidateColor, bgColor);
            if (contrast >= this.minimumContrast) {
                return candidateColor;
            }
        }

        const light = '#ffffff';
        const dark = '#000000';
        const lightContrast = this.getContrastRatio(light, bgColor);
        const darkContrast = this.getContrastRatio(dark, bgColor);
        return lightContrast >= darkContrast ? light : dark;
    }

    getLuminance(hex) {
        const { r, g, b } = this.hexToRgb(hex);
        const a = [r, g, b].map((v) => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    }

    getContrastRatio(hex1, hex2) {
        const L1 = this.getLuminance(hex1);
        const L2 = this.getLuminance(hex2);
        const lighter = Math.max(L1, L2);
        const darker = Math.min(L1, L2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    hexToRgb(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) {
            hex = hex.split('').map((c) => c + c).join('');
        }
        const int = parseInt(hex, 16);
        return {
            r: (int >> 16) & 255,
            g: (int >> 8) & 255,
            b: int & 255,
        };
    }

    rgbToHex(r, g, b) {
        return (
            '#' +
            [r, g, b]
                .map((x) => {
                    const hex = x.toString(16);
                    return hex.length === 1 ? '0' + hex : hex;
                })
                .join('')
        );
    }

    hexToHSL(hex) {
        const { r, g, b } = this.hexToRgb(hex);
        const rNorm = r / 255;
        const gNorm = g / 255;
        const bNorm = b / 255;

        const max = Math.max(rNorm, gNorm, bNorm);
        const min = Math.min(rNorm, gNorm, bNorm);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case rNorm:
                    h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
                    break;
                case gNorm:
                    h = (bNorm - rNorm) / d + 2;
                    break;
                case bNorm:
                    h = (rNorm - gNorm) / d + 4;
                    break;
            }
            h /= 6;
        }

        return { h: h * 360, s: s * 100, l: l * 100 };
    }

    hslToHex({ h, s, l }) {
        l /= 100;
        const a = (s / 100) * Math.min(l, 1 - l);
        const f = (n) => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color)
                .toString(16)
                .padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }
}

const smartContrast = (options) => SmartContrast.getInstance(options);
export default smartContrast;