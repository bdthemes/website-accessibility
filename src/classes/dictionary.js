/**
 * Only plain words are looked up: letters, apostrophes and hyphens, max 64 chars.
 * Anything else (numbers, punctuation, non-Latin scripts) is ignored so nothing
 * unexpected is ever sent to the dictionary service.
 */
const WORD_PATTERN = /^[A-Za-z][A-Za-z'’-]{0,63}$/;
const DICTIONARY_ENDPOINT = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

/**
 * How long to wait for the dictionary service before giving up.
 *
 * A service can hang rather than fail: it completes the TLS handshake and then
 * stays silent, and a browser's own network timeout is minutes away. Applied per
 * source, and kept short deliberately -- a dead primary spends this whole budget
 * before the fallback is even tried, so it sets the worst-case wait the visitor
 * sees. Sources are tried in order rather than at once, so a working primary
 * means the second service is never contacted at all.
 */
const REQUEST_TIMEOUT_MS = 3500;

/**
 * Fallback source. The primary service is a small community project that does go
 * down -- it completes the TLS handshake and then stays silent -- which left the
 * feature answering "Definition not available." for every word. Wiktionary's REST
 * API is run by the Wikimedia Foundation, needs no key and sends
 * `Access-Control-Allow-Origin: *`, so it can be read straight from the page.
 */
const WIKTIONARY_ENDPOINT = 'https://en.wiktionary.org/api/rest_v1/page/definition/';

const LOOKING_UP_TEXT = 'Looking up\u2026';
const NOT_AVAILABLE_TEXT = 'Definition not available.';

/**
 * How many senses the pager will offer.
 *
 * Wiktionary lists every sense a word has ever had: "post" comes back with 45,
 * tailing off into "Post-production." and duplicates of earlier entries. Nobody
 * clicks through that, and the useful senses are always at the front.
 */
const MAX_ENTRIES = 10;
const READ_LABEL = 'Read';
const PAUSE_LABEL = 'Pause';

class Dictionary {
    constructor() {
        this.popup = null;
        this.popupAnchor = null;
        this.currentWord = '';
        this.entries = [];
        this.entryIndex = 0;
        this.pendingSpeakTimer = null;
        this.keepAliveTimer = null;
        this.isReading = false;
        this.isActive = false;
        this.clickHandler = this.handleOutsideClick.bind(this);
        this.dblClickHandler = this.handleDoubleClick.bind(this);
    }
    handleDoubleClick(e) {
        // A double-click inside the popup is the visitor selecting part of the
        // definition they are reading. Tearing that popup down and looking the
        // selection up again wiped what they were in the middle of; leave it be.
        if (e.target instanceof Node && this.popup?.contains(e.target)) {
            return;
        }

        const drawerRoot = document.querySelector('.wap-preset__preview-drawer-root');
        if (drawerRoot?.contains(e.target)) {
            return;
        }

        // removePopup() rather than remove(): it also detaches the outside-click
        // listener and stops anything still being spoken.
        this.removePopup();
        document.querySelectorAll('.wap-dictionary-popup').forEach((popup) => popup.remove());

        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (selectedText && WORD_PATTERN.test(selectedText)) {
            this.currentWord = selectedText;
            const rect = selection.getRangeAt(0).getBoundingClientRect();
            this.showPopup(rect.left + window.scrollX, rect.top + window.scrollY - 25);
        }
    }
    apply() {
        if (this.isActive) return;
        this.isActive = true;
        document.addEventListener('dblclick', this.dblClickHandler);
    }

    remove() {
        this.isActive = false;
        this.removePopup();
        document.removeEventListener('dblclick', this.dblClickHandler);
    }


    showPopup(x, y) {
        this.removePopup();

        const word = this.currentWord;
        this.popupAnchor = { x, y };
        this.entries = [];
        this.entryIndex = 0;

        this.popup = document.createElement('div');
        this.popup.className = 'wap-dictionary-popup';

        // Built with the DOM API, and every value coming from a dictionary
        // service is set with textContent. Those responses are third-party (and
        // Wiktionary's carry real markup), so innerHTML here would be a DOM XSS
        // hole the moment one of them served something hostile.
        const card = document.createElement('div');
        card.className = 'wap-dictionary-card';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'wap-dictionary-close';
        closeBtn.type = 'button';
        closeBtn.setAttribute('aria-label', 'Close');
        closeBtn.appendChild(this.icon('close'));

        // Search box, so any word can be looked up and not only the one that
        // happened to be double-clicked.
        const form = document.createElement('form');
        form.className = 'wap-dictionary-search';

        const input = document.createElement('input');
        input.className = 'wap-dictionary-input';
        input.type = 'text';
        input.value = word;
        input.setAttribute('aria-label', 'Look up a word');

        const searchBtn = document.createElement('button');
        searchBtn.className = 'wap-dictionary-search-btn';
        searchBtn.type = 'submit';
        searchBtn.setAttribute('aria-label', 'Search');
        searchBtn.appendChild(this.icon('search'));

        form.appendChild(input);
        form.appendChild(searchBtn);

        // The definition reads as one sentence -- "word (noun): meaning" -- so the
        // term and its part of speech are spans inside the paragraph rather than a
        // separate header block.
        const body = document.createElement('p');
        body.className = 'wap-dictionary-body';

        const termEl = document.createElement('strong');
        termEl.className = 'wap-dictionary-term';

        const textEl = document.createElement('span');
        textEl.className = 'wap-dictionary-text';
        textEl.textContent = LOOKING_UP_TEXT;

        body.appendChild(termEl);
        body.appendChild(textEl);

        const actions = document.createElement('div');
        actions.className = 'wap-dictionary-actions';

        const readBtn = this.actionButton('read', 'Read');
        const spellBtn = this.actionButton('spell', 'Spell');

        // Services return several senses for most words; without a pager only the
        // first was ever reachable.
        const pager = document.createElement('div');
        pager.className = 'wap-dictionary-pager';

        const prevBtn = document.createElement('button');
        prevBtn.className = 'wap-dictionary-prev';
        prevBtn.type = 'button';
        prevBtn.setAttribute('aria-label', 'Previous definition');
        prevBtn.appendChild(this.icon('prev'));

        const countEl = document.createElement('span');
        countEl.className = 'wap-dictionary-count';

        const nextBtn = document.createElement('button');
        nextBtn.className = 'wap-dictionary-next';
        nextBtn.type = 'button';
        nextBtn.setAttribute('aria-label', 'Next definition');
        nextBtn.appendChild(this.icon('next'));

        pager.appendChild(prevBtn);
        pager.appendChild(countEl);
        pager.appendChild(nextBtn);

        actions.appendChild(readBtn);
        actions.appendChild(spellBtn);
        actions.appendChild(pager);

        card.appendChild(form);
        card.appendChild(body);
        card.appendChild(actions);

        this.popup.appendChild(closeBtn);
        this.popup.appendChild(card);
        document.body.appendChild(this.popup);

        closeBtn.addEventListener('click', () => this.removePopup());
        readBtn.addEventListener('click', () => this.toggleRead());
        spellBtn.addEventListener('click', () => this.spellWord(this.currentWord));
        prevBtn.addEventListener('click', () => this.showEntry(this.entryIndex - 1));
        nextBtn.addEventListener('click', () => this.showEntry(this.entryIndex + 1));
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const next = input.value.trim();
            if (next) this.loadDefinition(next);
        });

        this.renderPager();
        this.positionPopup();
        document.addEventListener('click', this.clickHandler);

        this.loadDefinition(word);
    }

    /**
     * Inline SVG so the popup carries no icon-font or image dependency.
     *
     * @param {string} name
     * @return {SVGElement}
     */
    icon(name) {
        const NS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');

        const paths = {
            close: ['M6 6l12 12M18 6L6 18'],
            search: ['M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z', 'M20 20l-4.2-4.2'],
            prev: ['M15 5l-7 7 7 7'],
            next: ['M9 5l7 7-7 7'],
            // A small audio waveform, used for both speech actions.
            wave: ['M4 11v2', 'M8 8v8', 'M12 5v14', 'M16 8v8', 'M20 11v2'],
        };

        for (const d of paths[name] || []) {
            const path = document.createElementNS(NS, 'path');
            path.setAttribute('d', d);
            svg.appendChild(path);
        }

        return svg;
    }

    actionButton(kind, label) {
        const button = document.createElement('button');
        button.className = `wap-dictionary-action wap-dictionary-${kind}`;
        button.type = 'button';

        const badge = document.createElement('span');
        badge.className = 'wap-dictionary-action-icon';
        badge.appendChild(this.icon('wave'));

        const text = document.createElement('span');
        text.className = 'wap-dictionary-action-label';
        text.textContent = label;

        button.appendChild(badge);
        button.appendChild(text);
        return button;
    }

    /**
     * Fill in (or replace) the definitions inside an already-visible popup.
     *
     * The popup is rendered before this runs. Previously it was built only after
     * the request settled, so a service that accepted the connection and never
     * answered meant no popup and no message at all -- the visitor double-clicked
     * a word and nothing whatsoever happened.
     */
    async loadDefinition(word) {
        if (!this.popup) return;

        this.currentWord = word;
        this.entries = [];
        this.entryIndex = 0;

        const input = this.popup.querySelector('.wap-dictionary-input');
        const termEl = this.popup.querySelector('.wap-dictionary-term');
        const textEl = this.popup.querySelector('.wap-dictionary-text');

        if (input && input.value.trim() !== word) input.value = word;
        if (termEl) termEl.textContent = '';
        if (textEl) textEl.textContent = LOOKING_UP_TEXT;
        this.renderPager();

        const entries = await this.getMeaning(word);

        // The popup may have been closed, or a different word requested, while
        // the request was still in flight.
        if (!this.popup || this.currentWord !== word) return;

        this.entries = entries;
        this.showEntry(0);
        this.positionPopup();
    }

    /**
     * Show one sense, wrapping at neither end (the arrows simply stop).
     *
     * @param {number} index
     */
    showEntry(index) {
        if (!this.popup) return;

        const termEl = this.popup.querySelector('.wap-dictionary-term');
        const textEl = this.popup.querySelector('.wap-dictionary-text');

        if (!this.entries.length) {
            if (termEl) termEl.textContent = '';
            if (textEl) textEl.textContent = NOT_AVAILABLE_TEXT;
            this.renderPager();
            return;
        }

        // A different sense is different text, so anything mid-read is stale.
        if (this.isReading) this.stopReading();

        this.entryIndex = Math.min(Math.max(index, 0), this.entries.length - 1);
        const entry = this.entries[this.entryIndex];

        if (termEl) {
            termEl.textContent = entry.partOfSpeech
                ? `${this.currentWord} (${entry.partOfSpeech})`
                : this.currentWord;
        }
        if (textEl) textEl.textContent = `: ${entry.definition}`;

        this.renderPager();
    }

    renderPager() {
        if (!this.popup) return;

        const pager = this.popup.querySelector('.wap-dictionary-pager');
        const countEl = this.popup.querySelector('.wap-dictionary-count');
        const prevBtn = this.popup.querySelector('.wap-dictionary-prev');
        const nextBtn = this.popup.querySelector('.wap-dictionary-next');
        const total = this.entries.length;

        // Hidden rather than shown disabled when there is nothing to page through.
        if (pager) pager.hidden = total < 2;
        if (countEl) countEl.textContent = total ? `${this.entryIndex + 1} of ${total}` : '';
        if (prevBtn) prevBtn.disabled = this.entryIndex <= 0;
        if (nextBtn) nextBtn.disabled = this.entryIndex >= total - 1;
    }

    positionPopup() {
        if (!this.popup || !this.popupAnchor) return;

        const { x, y } = this.popupAnchor;
        const rect = this.popup.getBoundingClientRect();
        const margin = 12;

        // Prefer above the word; drop below when there is no room up there.
        const above = y - rect.height - margin;
        const top = above > window.scrollY ? above : y + 24;

        // Centre on the word, then keep the whole card on screen.
        const maxLeft = window.scrollX + document.documentElement.clientWidth - rect.width - margin;
        const left = Math.min(Math.max(x - rect.width / 2, window.scrollX + margin), Math.max(maxLeft, window.scrollX + margin));

        Object.assign(this.popup.style, { top: `${top}px`, left: `${left}px` });
    }

    removePopup() {
        if (this.popup) {
            this.popup.remove();
            this.popup = null;
        }
        document.removeEventListener('click', this.clickHandler);

        // Nothing should still be speaking, or queued to start, once the popup the
        // visitor was reading has gone.
        window.clearTimeout(this.pendingSpeakTimer);
        this.pendingSpeakTimer = null;
        this.stopKeepAlive();
        this.isReading = false;
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }

    handleOutsideClick(e) {
        if (this.popup && !this.popup.contains(e.target)) {
            this.removePopup();
        }
    }

    /**
     * Every sense a service offers, so the popup can page through them.
     *
     * @param {string} word
     * @return {Promise<Array<{partOfSpeech: string, definition: string}>>}
     */
    async getMeaning(word) {
        if (!WORD_PATTERN.test(word)) return [];

        // Primary first, Wiktionary second. Either can be down on its own, and a
        // single source meant the whole feature went with it.
        const primary = await this.fetchFromDictionaryApi(word);
        if (primary.length) return this.trimEntries(primary);

        return this.trimEntries(await this.fetchFromWiktionary(word));
    }

    /**
     * Drop repeats and keep the list short enough to page through.
     *
     * Sources repeat themselves -- Wiktionary returned "A post mortem..." twice
     * for "post" -- and the same text under two parts of speech is still the same
     * thing to read.
     *
     * @param {Array<{partOfSpeech: string, definition: string}>} entries
     * @return {Array<{partOfSpeech: string, definition: string}>}
     */
    trimEntries(entries) {
        const seen = new Set();
        const out = [];

        for (const entry of entries) {
            const key = entry.definition.trim().toLowerCase();
            if (!key || seen.has(key)) continue;

            seen.add(key);
            out.push(entry);
            if (out.length === MAX_ENTRIES) break;
        }

        return out;
    }

    async requestJson(url) {
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timer = controller ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS) : null;

        try {
            const response = await fetch(url, controller ? { signal: controller.signal } : undefined);
            if (!response.ok) return null;
            return await response.json();
        } catch (err) {
            // Covers the abort above as well as offline / DNS / CORS failures.
            return null;
        } finally {
            if (timer) clearTimeout(timer);
        }
    }

    async fetchFromDictionaryApi(word) {
        const data = await this.requestJson(DICTIONARY_ENDPOINT + encodeURIComponent(word));
        if (!Array.isArray(data)) return [];

        const out = [];
        for (const entry of data) {
            for (const meaning of entry.meanings || []) {
                for (const item of meaning.definitions || []) {
                    const definition = (item.definition || '').trim();
                    if (definition) {
                        out.push({ partOfSpeech: meaning.partOfSpeech || '', definition });
                    }
                }
            }
        }

        return out;
    }

    async fetchFromWiktionary(word) {
        // Wiktionary entries are wiki pages, so the lookup is case-sensitive.
        // A word double-clicked at the start of a sentence arrives capitalised and
        // matches the proper-noun page instead: "Welcome" answered "A surname."
        // Try it as written, then as lower case.
        const lower = word.toLowerCase();
        const candidates = lower === word ? [word] : [word, lower];

        for (const candidate of candidates) {
            const entries = await this.wiktionaryEntries(candidate);
            // Skip a name-only hit while a common-word page may still exist.
            const onlyNames = entries.length && entries.every(e => e.partOfSpeech === 'proper noun');
            if (entries.length && (candidate === lower || !onlyNames)) return entries;
        }

        return [];
    }

    async wiktionaryEntries(word) {
        const data = await this.requestJson(WIKTIONARY_ENDPOINT + encodeURIComponent(word));
        // Keyed by language; entries for other languages are ignored.
        const groups = data && Array.isArray(data.en) ? data.en : null;
        if (!groups) return [];

        const out = [];
        for (const group of groups) {
            for (const item of group.definitions || []) {
                const definition = this.toPlainText(item.definition);
                if (definition) {
                    out.push({ partOfSpeech: (group.partOfSpeech || '').toLowerCase(), definition });
                }
            }
        }

        return out;
    }

    toPlainText(html) {
        if (typeof html !== 'string' || html === '') return '';

        let text = html;
        if (typeof DOMParser !== 'undefined') {
            text = new DOMParser().parseFromString(html, 'text/html').body.textContent || '';
        } else {
            text = html.replace(/<[^>]*>/g, '');
        }

        // Wiki templates leak their own stylesheet into the text; cut it off.
        const styleAt = text.indexOf('.mw-parser-output');
        if (styleAt !== -1) text = text.slice(0, styleAt);

        return text.replace(/\s+/g, ' ').trim();
    }

    /**
     * The lookup endpoint is English-only and WORD_PATTERN admits Latin letters
     * only, so the word being spoken is always English -- even on a page that
     * declares another language. Left unset, the engine reads it with whatever
     * voice matches the page, which mangles the pronunciation.
     */
    speechLang() {
        return 'en-US';
    }

    /**
     * An English voice for the utterance.
     *
     * getVoices() is empty until the engine has loaded its list, so this returns
     * null on a first call and the utterance simply falls back to `lang`. By the
     * time anyone clicks the button the list has populated.
     */
    englishVoice() {
        const voices = window.speechSynthesis.getVoices() || [];
        if (!voices.length) return null;

        const english = voices.filter(v => /^en(-|$)/i.test(v.lang || ''));
        if (!english.length) return null;

        // Named engines first: picking the plain first match lands on whatever
        // the OS lists alphabetically, which on macOS is a novelty voice.
        const preferred = ['Google US English', 'Samantha', 'Microsoft', 'Google'];
        for (const name of preferred) {
            const match = english.find(v => (v.name || '').startsWith(name));
            if (match) return match;
        }

        return english.find(v => v.default) || english[0];
    }

    /**
     * Speak one utterance, replacing anything already queued.
     *
     * Without the cancel, repeated clicks stack up and the engine works through
     * the backlog long after the popup is gone.
     */
    /**
     * Queue utterances and start them in a way Chrome actually honours.
     *
     * Two traps, both of which silence this feature outright:
     *
     * - cancel() immediately followed by speak() wedges the engine and nothing is
     *   heard. Cancel only when something really is in flight, then let the engine
     *   go idle for a task before asking again.
     * - Chrome can leave the engine paused after a cancel, so resume() has to
     *   follow every speak().
     *
     * @param {SpeechSynthesisUtterance|SpeechSynthesisUtterance[]} utterances
     */
    dispatch(utterances) {
        const synth = window.speechSynthesis;
        const list = Array.isArray(utterances) ? utterances : [utterances];
        if (!list.length) return;

        const start = () => {
            list.forEach(u => synth.speak(u));
            synth.resume();
            this.keepAlive();
        };

        const last = list[list.length - 1];
        last.addEventListener('end', () => this.stopKeepAlive());
        last.addEventListener('error', () => this.stopKeepAlive());

        if (synth.speaking || synth.pending) {
            synth.cancel();
            window.clearTimeout(this.pendingSpeakTimer);
            this.pendingSpeakTimer = window.setTimeout(() => {
                this.pendingSpeakTimer = null;
                start();
            }, 60);
            return;
        }

        start();
    }

    /**
     * Chrome stops speaking after roughly fifteen seconds unless it is nudged,
     * and spelling a long word runs past that.
     */
    keepAlive() {
        this.stopKeepAlive();
        this.keepAliveTimer = window.setInterval(() => {
            const synth = window.speechSynthesis;
            if (!synth.speaking) {
                this.stopKeepAlive();
                return;
            }
            synth.pause();
            synth.resume();
        }, 10000);
    }

    stopKeepAlive() {
        if (this.keepAliveTimer) {
            window.clearInterval(this.keepAliveTimer);
            this.keepAliveTimer = null;
        }
    }

    /**
     * Build one utterance with a voice and a matching language.
     *
     * utterance.lang must agree with the voice: a mismatch silences some engines
     * outright rather than falling back.
     */
    buildUtterance(text, rate) {
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = this.englishVoice();

        if (voice) utterance.voice = voice;
        utterance.lang = voice?.lang || this.speechLang();
        utterance.rate = rate;
        utterance.pitch = 1;

        return utterance;
    }

    /**
     * The sense currently on screen, as it reads aloud.
     *
     * Speaking only the headword is close to useless -- the visitor can already
     * see it; the definition is the part they asked for.
     *
     * @return {string}
     */
    spokenText() {
        const entry = this.entries[this.entryIndex];
        if (!entry) return this.currentWord;

        const term = entry.partOfSpeech
            ? `${this.currentWord}, ${entry.partOfSpeech}`
            : this.currentWord;

        return `${term}. ${entry.definition}`;
    }

    /**
     * Start reading, or stop if it is already going.
     *
     * A definition takes long enough to read that the control has to double as a
     * stop; otherwise the only way out is closing the popup.
     */
    toggleRead() {
        if (!('speechSynthesis' in window)) return;

        if (this.isReading) {
            this.stopReading();
            return;
        }

        const text = this.spokenText();
        if (!text) return;

        const utterance = this.buildUtterance(text, 1);
        utterance.addEventListener('end', () => this.setReadingState(false));
        utterance.addEventListener('error', () => this.setReadingState(false));

        this.setReadingState(true);
        this.dispatch(utterance);
    }

    stopReading() {
        window.clearTimeout(this.pendingSpeakTimer);
        this.pendingSpeakTimer = null;
        this.stopKeepAlive();
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        this.setReadingState(false);
    }

    /**
     * @param {boolean} reading
     */
    setReadingState(reading) {
        this.isReading = reading;

        const label = this.popup?.querySelector('.wap-dictionary-read .wap-dictionary-action-label');
        if (label) label.textContent = reading ? PAUSE_LABEL : READ_LABEL;
    }

    pronounceWord(word) {
        if (!('speechSynthesis' in window) || !word) return;
        this.dispatch(this.buildUtterance(word, 1));
    }

    spellWord(word) {
        if (!('speechSynthesis' in window) || !word) return;

        // Spelling replaces whatever was being read, so the Read control must not
        // be left showing "Pause".
        this.setReadingState(false);

        // One utterance per letter; dispatch() queues them and the engine plays
        // them in order, so no timers are needed here.
        const letters = word.split('').filter(c => /[A-Za-z]/.test(c));
        if (!letters.length) return;

        this.dispatch(letters.map(c => this.buildUtterance(c, 0.6)));
    }
}

// One shared instance so remove() detaches the very listener apply() attached.
let instance = null;
const dictionary = () => {
    if (!instance) {
        instance = new Dictionary();
    }
    return instance;
};
export default dictionary;
