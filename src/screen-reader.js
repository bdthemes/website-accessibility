class ScreenReader {
    static instance = null;
    constructor() {
        if (ScreenReader.instance) return ScreenReader.instance;

        this.screenReaderConfig = {
            rate: 1,
            pitch: 1,
            lang: 'en-US',
            voiceURI: 'Google US English',
        };
        this.screenReaderClickHandler = null;
        this.screenReaderFocusHandler = null;
        this.currentHighlightedElement = null;
        this.previousStyle = null;

        ScreenReader.instance = this;
    }

    static getInstance() {
        if (!ScreenReader.instance) {
            ScreenReader.instance = new ScreenReader();
        }
        return ScreenReader.instance;
    }

    apply(key, attribute) {
        const {
            rate = 1,
            pitch = 1,
            lang = 'en-US',
            voiceURI = null,
        } = attribute;

        this.screenReaderConfig = { rate, pitch, lang, voiceURI };

        this.destroy(); // Remove any existing listeners

        // Handle clicks
        this.screenReaderClickHandler = (e) => {
            const target = e.target;

            if (this.isInsidePreviewDrawer(target) || this.isAccessibilityButton(target)) return;

            if (this.hasReadableContent(target)) {
                const text = this.getElementRolePrefix(target) + this.getElementDescription(target);
                this.speak(text, target);
            } else if (this.isContainer(target)) {
                const entries = this.getReadableTextFromChildren(target);
                this.speakSequentially(entries);
            }
        };

        // Handle tab navigation (focus)
        this.screenReaderFocusHandler = (e) => {
            const target = e.target;
            if (this.isInsidePreviewDrawer(target) || this.isAccessibilityButton(target)) return;
            if (this.hasReadableContent(target)) {
                const text = this.getElementRolePrefix(target) + this.getElementDescription(target);
                this.speak(text, target);
            }
        };

        document.addEventListener('click', this.screenReaderClickHandler);
        document.addEventListener('focusin', this.screenReaderFocusHandler);
    }

    speak(text, targetElement = null) {
        if (!text) return;

        if (this.currentHighlightedElement && this.previousStyle) {
            const el = this.currentHighlightedElement;
            Object.assign(el.style, this.previousStyle);
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const { rate, pitch, lang, voiceURI } = this.screenReaderConfig || {};

        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.lang = lang;

        const voices = window.speechSynthesis.getVoices();
        if (voiceURI) {
            utterance.voice = voices.find(v => v.voiceURI === voiceURI) || null;
        } else {
            utterance.voice = voices.find(v => v.lang.startsWith(lang)) || null;
        }

        this.currentHighlightedElement = targetElement || null;
        this.previousStyle = null;

        utterance.onstart = () => {
            if (targetElement) {
                this.previousStyle = {
                    backgroundColor: targetElement.style.backgroundColor,
                    color: targetElement.style.color,
                    outline: targetElement.style.outline,
                };
                Object.assign(targetElement.style, {
                    backgroundColor: '#fffae6',
                    color: '#000',
                    outline: '2px dashed #f0c040'
                });
            }
        };

        utterance.onend = () => {
            if (targetElement && this.previousStyle) {
                Object.assign(targetElement.style, this.previousStyle);
            }
            this.currentHighlightedElement = null;
            this.previousStyle = null;
        };
        console.log(utterance);
        
        window.speechSynthesis.speak(utterance);
    }

    speakSequentially(entries) {
        if (!Array.isArray(entries) || entries.length === 0) return;
        console.log(entries);

        window.speechSynthesis.cancel();

        let index = 0;

        const speakNext = () => {
            if (index >= entries.length) return;

            const { text, element } = entries[index];

            // Sanity check
            if (!element || !element.isConnected) {
                console.warn('Skipped invalid element:', element);
                index++;
                speakNext();
                return;
            }

            const fullText = this.getElementRolePrefix(element) + text;
            const utterance = new SpeechSynthesisUtterance(fullText);
            const { rate, pitch, lang, voiceURI } = this.screenReaderConfig || {};

            utterance.rate = rate;
            utterance.pitch = pitch;
            utterance.lang = lang;

            const voices = window.speechSynthesis.getVoices();
            if (voiceURI) {
                utterance.voice = voices.find(v => v.voiceURI === voiceURI) || null;
            } else {
                utterance.voice = voices.find(v => v.lang.startsWith(lang)) || null;
            }

            utterance.onstart = () => {
                console.log(`[ScreenReader] Speaking (${index + 1}/${entries.length}):`, fullText);

                // Remove previous highlight
                if (this.currentHighlightedElement && this.previousStyle) {
                    Object.assign(this.currentHighlightedElement.style, this.previousStyle);
                }

                // Apply highlight to current element
                if (element?.style) {
                    this.previousStyle = {
                        backgroundColor: element.style.backgroundColor,
                        color: element.style.color,
                        outline: element.style.outline,
                    };

                    Object.assign(element.style, {
                        backgroundColor: '#fffae6',
                        color: '#000',
                        outline: '2px dashed #f0c040',
                    });

                    this.currentHighlightedElement = element;
                }
            };

            utterance.onend = () => {
                // Remove highlight
                if (this.currentHighlightedElement && this.previousStyle) {
                    Object.assign(this.currentHighlightedElement.style, this.previousStyle);
                }

                this.currentHighlightedElement = null;
                this.previousStyle = null;

                index++;
                speakNext(); // Continue to next
            };

            window.speechSynthesis.speak(utterance);
        };

        speakNext();
    }



    getElementDescription(el) {
        if (el.hasAttribute('aria-label')) return el.getAttribute('aria-label');
        if (el.hasAttribute('aria-labelledby')) {
            const ref = document.getElementById(el.getAttribute('aria-labelledby'));
            if (ref) return ref.innerText.trim();
        }
        if (el.hasAttribute('aria-describedby')) {
            const ref = document.getElementById(el.getAttribute('aria-describedby'));
            if (ref) return ref.innerText.trim();
        }

        const tag = el.tagName;

        if (tag === 'IMG' && el.alt) return el.alt;

        if (tag === 'INPUT' && el.type !== 'hidden') {
            const label = this.getLabelTextForInput(el);
            if (label) return `Input label: ${label}`;
            if (el.placeholder) return `Input placeholder: ${el.placeholder}`;
            return 'Input field';
        }

        return el.innerText?.trim() || '';
    }



    getElementRolePrefix(el) {
        const role = el.getAttribute('role')?.toLowerCase();
        const tag = el.tagName;

        const knownRoles = {
            // Widget roles
            button: 'Button',
            link: 'Link',
            heading: 'Heading',
            checkbox: 'Checkbox',
            switch: 'Switch',
            dialog: 'Dialog',
            tab: 'Tab',
            tabpanel: 'Tab Panel',
            slider: 'Slider',
            combobox: 'Combo Box',
            listbox: 'List Box',
            option: 'Option',
            img: 'Image',

            // Menu-related roles
            menu: 'Menu',
            menubar: 'Menu Bar',
            menuitem: 'Menu Item',
            menuitemcheckbox: 'Menu Checkbox',
            menuitemradio: 'Menu Radio Item',

            // Landmark roles
            navigation: 'Navigation Region',
            main: 'Main Content',
            banner: 'Banner',
            contentinfo: 'Footer Content',
            complementary: 'Complementary Section',
            form: 'Form Area',
            region: 'Region',
            search: 'Search Section'
        };

        if (role) {
            if (knownRoles[role]) {
                return `${knownRoles[role]}: `;
            } else {
                // Handle unknown or custom roles
                return `Role ${role}: `;
            }
        }

        // Fallback to semantic tags
        if (tag === 'BUTTON') return 'Button: ';
        if (tag === 'A') return 'Link: ';
        if (/H[1-6]/.test(tag)) return 'Heading: ';
        if (tag === 'INPUT') return 'Input: ';
        if (tag === 'IMG') return 'Image: ';

        return '';
    }

    hasReadableContent(el) {
        if (!el) return false;

        const tag = el.tagName;

        // Attributes that define accessibility descriptions
        if (
            el.hasAttribute('aria-label') ||
            el.hasAttribute('aria-labelledby') ||
            el.hasAttribute('aria-describedby')
        ) {
            return true;
        }

        // IMG with alt
        if (tag === 'IMG' && el.alt?.trim()) return true;

        // INPUT (not hidden)
        if (tag === 'INPUT' && el.type !== 'hidden') {
            // Has a label element?
            if (this.getLabelTextForInput(el)) return true;

            // Has placeholder as fallback
            if (el.placeholder?.trim()) return true;

            return true; // Fallback: input still deserves to be read
        }

        // BUTTON with visible or screen-reader-only text
        if (tag === 'BUTTON') {
            if (el.innerText?.trim()) return true;
            if (el.querySelector('[aria-hidden="false"], .sr-only')) return true;
        }

        // A tag with visible text
        if (tag === 'A' && el.innerText?.trim()) return true;

        // Text content
        for (let node of el.childNodes) {
            if (
                node.nodeType === Node.TEXT_NODE &&
                node.textContent.trim().length > 0
            ) {
                return true;
            }
        }

        return false;
    }



    isContainer(el) {
        return ['DIV', 'SECTION', 'MAIN', 'ARTICLE'].includes(el.tagName);
    }

    getReadableTextFromChildren(parent) {
        const entries = [];
        const walker = document.createTreeWalker(parent, NodeFilter.SHOW_ELEMENT, null, false);

        let node;
        while ((node = walker.nextNode())) {
            if (this.hasReadableContent(node)) {
                const desc = this.getElementDescription(node);
                if (desc) {
                    entries.push({ text: desc, element: node });
                }
            }
        }

        return entries;
    }

    getLabelTextForInput(inputEl) {
        if (!inputEl.id) return '';

        const label = document.querySelector(`label[for="${inputEl.id}"]`);
        return label?.innerText.trim() || '';
    }



    isInsidePreviewDrawer(element) {
        const wrapper = document.querySelector('.wap-preset__preview-drawer');
        return wrapper?.contains(element) || false;
    }

    isAccessibilityButton(element) {
        return element.classList.contains('wap-preview-button') || element.closest('.wap-preview-button');
    }

    destroy() {
        if (this.screenReaderClickHandler) {
            document.removeEventListener('click', this.screenReaderClickHandler);
            this.screenReaderClickHandler = null;
        }

        if (this.screenReaderFocusHandler) {
            document.removeEventListener('focusin', this.screenReaderFocusHandler);
            this.screenReaderFocusHandler = null;
        }

        if (this.currentHighlightedElement && this.previousStyle) {
            Object.assign(this.currentHighlightedElement.style, this.previousStyle);
        }

        this.currentHighlightedElement = null;
        this.previousStyle = null;

        window.speechSynthesis.cancel();
    }
}

const screenReader = () => ScreenReader.getInstance();
export default screenReader;
