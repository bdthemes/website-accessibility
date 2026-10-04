/**
 * Toolbar launcher for visitors.
 *
 * The page shows the toolbar's button straight away (printed by PHP, see
 * View\Frontend::print_launcher()) while the toolbar itself — React, its
 * components and add-ons, about 250 KB compressed — waits as inert
 * `<script type="text/plain" data-websac-lazy>` tags. They run, in order, when
 * the visitor reaches for the button (pointer, focus, touch, Ctrl+U), or at
 * once when the visitor already has toolbar settings switched on.
 *
 * No imports: this file must stay tiny and must not need React.
 */
const ROOT_ID = 'website-accessibility-app';
const PLACEHOLDER = '.wap-launcher-placeholder';
const REAL_BUTTON = '.wap-button-style-preset__preview-btn:not(.wap-launcher-placeholder)';
const PREFERENCES_KEY = 'websiteAccessibilityLocalPreferences';

let loading = null;

/** Run one inert script tag as a real one; resolves when it has run. */
const run = (stub) =>
	new Promise((resolve) => {
		const script = document.createElement('script');
		Array.from(stub.attributes).forEach(({ name, value }) => {
			if (name === 'type' || name === 'async' || name === 'defer' || name.indexOf('data-websac-') === 0) return;
			script.setAttribute(name, value);
		});
		const src = stub.getAttribute('data-websac-src');
		if (src) {
			script.async = false;
			script.onload = () => resolve();
			script.onerror = () => {
				// eslint-disable-next-line no-console
				console.error('One Accessibility: could not load', src);
				resolve();
			};
			script.src = src;
		} else {
			script.text = stub.textContent;
		}
		stub.parentNode.replaceChild(script, stub);
		if (!src) resolve();
	});

/** Load the toolbar (once). */
const load = () => {
	if (!loading) {
		const stubs = Array.from(document.querySelectorAll('script[type="text/plain"][data-websac-lazy]'));
		loading = stubs.reduce((chain, stub) => chain.then(() => run(stub)), Promise.resolve());
	}
	return loading;
};

/** Whether the visitor already has the toolbar doing something on this page. */
const isInUse = () => {
	const data = window.websiteAccessibility || {};
	if (/(?:^|;\s*)googtrans=/.test(document.cookie)) return true;
	if (/[?&]websac_open=(?:1|true|yes)(?:&|$)/i.test(window.location.search)) return true;
	let saved = null;
	try {
		saved = JSON.parse(window.localStorage.getItem(`${PREFERENCES_KEY}-${data.currentPresetId}`) || 'null');
	} catch (e) {
		saved = null;
	}
	if (!saved || typeof saved !== 'object') return false;
	if ((saved.profile && saved.profile.id) || saved.oversized) return true;
	if (saved.settings && Object.keys(saved.settings).some((key) => saved.settings[key] && saved.settings[key].currentStep)) {
		return true;
	}
	const siteLanguage = String(data.siteLanguage || 'en').split('-')[0];
	const forceTranslate = !!(data.settings && data.settings.force_translate_site_language);
	return !!saved.selectedLanguage && (saved.selectedLanguage !== siteLanguage || forceTranslate);
};

/** Load the toolbar and open it, keeping keyboard focus on the launcher. */
const open = (keepFocus) => {
	window.websacOpenOnStart = true;
	const placeholder = document.querySelector(PLACEHOLDER);
	if (placeholder) {
		placeholder.setAttribute('aria-busy', 'true');
	}
	load().then(() => {
		if (!keepFocus) return;
		// The toolbar replaces the placeholder with its own button: give it the focus.
		let tries = 0;
		const focusReal = () => {
			const button = document.querySelector(`#${ROOT_ID} ${REAL_BUTTON}`);
			if (button) {
				button.focus({ preventScroll: true });
			} else if (tries++ < 120) {
				window.requestAnimationFrame(focusReal);
			}
		};
		focusReal();
	});
};

const start = () => {
	const placeholder = document.querySelector(PLACEHOLDER);
	if (!placeholder) {
		load();
		return;
	}
	if (isInUse()) {
		load();
		return;
	}

	const warmUp = () => load();
	['pointerenter', 'focus', 'touchstart'].forEach((type) => placeholder.addEventListener(type, warmUp, { once: true, passive: true }));
	placeholder.addEventListener('click', () => open(document.activeElement === placeholder));

	// The toolbar's shortcut (Ctrl+U) works before it has loaded too; once the
	// toolbar runs, its own handler takes over.
	const onKey = (event) => {
		if (!event.ctrlKey || (event.key !== 'u' && event.key !== 'U')) return;
		if (document.querySelector(`#${ROOT_ID} ${REAL_BUTTON}`)) {
			window.removeEventListener('keydown', onKey);
			return;
		}
		event.preventDefault();
		open(true);
	};
	window.addEventListener('keydown', onKey);
};

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', start);
} else {
	start();
}
