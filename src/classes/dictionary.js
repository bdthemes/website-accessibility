class Dictionary {
    constructor() {
        this.popup = null;
        this.currentWord = '';
        this.clickHandler = this.handleOutsideClick.bind(this);
        this.dblClickHandler = this.handleDoubleClick.bind(this);
    }
    handleDoubleClick(e) {
        const popups = document.querySelectorAll('.wap-dictionary-popup');
        const drawerRoot = document.querySelector('.wap-preset__preview-drawer-root');
        if (popups.length) {
            popups.forEach((popup) => popup.remove());
        }

        if (drawerRoot?.contains(e.target)) {
            return;
        }
        
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (selectedText && selectedText.split(/\s+/).length === 1) {
            this.currentWord = selectedText;
            const rect = selection.getRangeAt(0).getBoundingClientRect();
            this.showPopup(rect.left + window.scrollX, rect.top + window.scrollY - 25);
        }
    }
    apply() {
        document.addEventListener('dblclick', this.dblClickHandler);
    }

    remove() {
        this.removePopup();
        document.removeEventListener('dblclick', this.dblClickHandler);
    }


    async showPopup(x, y) {
        const meaning = await this.getMeaning(this.currentWord);
        this.removePopup();

        this.popup = document.createElement('div');
        this.popup.className = 'wap-dictionary-popup';

        // Build the popup with the DOM API and set API-derived text via
        // textContent. The word/partOfSpeech/definition come from a third-party
        // dictionary service; inserting them with innerHTML would allow HTML/JS
        // injection (DOM XSS) if that response is ever malicious or MITM'd.
        const arrow = document.createElement('div');
        arrow.className = 'wap-tooltip-arrow';

        const content = document.createElement('div');
        content.className = 'wap-tooltip-content';

        const header = document.createElement('div');
        header.className = 'wap-tooltip-header';

        const wordEl = document.createElement('strong');
        wordEl.textContent = meaning.word;

        const posEl = document.createElement('em');
        posEl.textContent = `(${meaning.partOfSpeech})`;

        const btnWrap = document.createElement('div');
        btnWrap.style.marginTop = '5px';

        const pronounceBtn = document.createElement('button');
        pronounceBtn.className = 'wap-pronounce-btn';
        pronounceBtn.textContent = '🔊';

        const spellBtn = document.createElement('button');
        spellBtn.className = 'wap-spell-btn';
        spellBtn.textContent = '📖 Spell';

        btnWrap.appendChild(pronounceBtn);
        btnWrap.appendChild(spellBtn);
        header.appendChild(wordEl);
        header.appendChild(posEl);
        header.appendChild(btnWrap);

        const definitionEl = document.createElement('div');
        definitionEl.className = 'wap-tooltip-definition';
        definitionEl.textContent = meaning.definition;

        content.appendChild(header);
        content.appendChild(definitionEl);
        this.popup.appendChild(arrow);
        this.popup.appendChild(content);

        Object.assign(this.popup.style, {
            position: 'absolute',
            maxWidth: '250px',
            background: '#222',
            color: '#fff',
            padding: '12px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            fontSize: '14px',
            lineHeight: '1.5',
            overflowWrap: 'break-word',
            zIndex: '999999'
        });

        document.body.appendChild(this.popup);

        // Wait for the popup to render to get height
        requestAnimationFrame(() => {
            const popupHeight = this.popup.offsetHeight;
            const arrow = this.popup.querySelector('.wap-tooltip-arrow');
            const topSpace = y - popupHeight - 16;

            const finalTop = topSpace > 0 ? (y - popupHeight - 12) : (y + 20); // 12px padding or fallback below
            const arrowDirection = topSpace > 0 ? 'down' : 'up';

            Object.assign(this.popup.style, {
                top: `${finalTop}px`,
                left: `${x - 100}px`,
            });

            if (arrow) {
                if (arrowDirection === 'down') {
                    Object.assign(arrow.style, {
                        position: 'absolute',
                        bottom: '-6px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '0',
                        height: '0',
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderTop: '6px solid #222'
                    });
                } else {
                    Object.assign(arrow.style, {
                        position: 'absolute',
                        top: '-6px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '0',
                        height: '0',
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderBottom: '6px solid #222'
                    });
                }
            }
        });

        document.addEventListener('click', this.clickHandler);

        this.popup.querySelector('.wap-pronounce-btn')?.addEventListener('click', () => {
            this.pronounceWord(meaning.word);
        });

        this.popup.querySelector('.wap-spell-btn')?.addEventListener('click', () => {
            this.spellWord(meaning.word);
        });
    }


    removePopup() {
        if (this.popup) {
            this.popup.remove();
            this.popup = null;
        }
        document.removeEventListener('click', this.clickHandler);
    }

    handleOutsideClick(e) {
        if (this.popup && !this.popup.contains(e.target)) {
            this.removePopup();
        }
    }

    async getMeaning(word) {
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            const data = await response.json();
            const firstEntry = data[0];
            return {
                word: firstEntry.word,
                partOfSpeech: firstEntry.meanings[0]?.partOfSpeech || '',
                definition: firstEntry.meanings[0]?.definitions[0]?.definition || 'No definition found.'
            };
        } catch (err) {
            return {
                word,
                partOfSpeech: '',
                definition: 'Definition not available.'
            };
        }
    }

    pronounceWord(word) {
        const utterance = new SpeechSynthesisUtterance(word);
        window.speechSynthesis.speak(utterance);
    }

    spellWord(word) {
        const letters = word.split('');
        let delay = 0;
        letters.forEach((char) => {
            const utter = new SpeechSynthesisUtterance(char);
            utter.rate = 0.6;
            utter.pitch = 1;
            window.speechSynthesis.speak(utter);
            delay += 400;
        });
    }
}

const dictionary = () => new Dictionary();
export default dictionary;
