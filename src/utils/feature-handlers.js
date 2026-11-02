/**
 * Feature handler registry (extension point).
 *
 * The accessibility manager applies the built-in, CSS-driven features itself.
 * Add-ons that ship additional toolbar features register a handler for their
 * feature key here; the manager delegates apply/remove for that key to it.
 *
 *   window.wapHelpers.registerFeatureHandler('myFeature', {
 *       apply(attribute, key) {},   // attribute = the selected step object
 *       remove(key) {},
 *   });
 *
 * The registry lives on `window` so it is shared by every bundle regardless of
 * load order, and it is read lazily at apply time.
 */

const REGISTRY_KEY = 'websacFeatureHandlers';

const getRegistry = () => {
    if (typeof window === 'undefined') return {};
    if (!window[REGISTRY_KEY]) {
        window[REGISTRY_KEY] = {};
    }
    return window[REGISTRY_KEY];
};

export const registerFeatureHandler = (key, handler) => {
    if (typeof key !== 'string' || !key || !handler || typeof handler !== 'object') return;
    getRegistry()[key] = handler;
};

export const getFeatureHandler = (key) => getRegistry()[key] || null;

const LIVE_REGION_ID = 'wap-live-region';

/**
 * Say `text` to screen readers (role="status", polite). The region sits inside the
 * toolbar's dialog while it is open, since content outside an aria-modal dialog
 * may not be read. Cleared first so the same message is announced again.
 */
export const liveAnnounce = (text) => {
    if (typeof document === 'undefined' || !text) return;
    const host = document.querySelector('.wap-preset__preview-drawer-root .ant-drawer-content[role="dialog"]') || document.body;
    let region = document.getElementById(LIVE_REGION_ID);
    if (!region) {
        region = document.createElement('div');
        region.id = LIVE_REGION_ID;
        region.className = 'wap-sr-only';
        region.setAttribute('role', 'status');
        region.setAttribute('aria-live', 'polite');
        region.setAttribute('aria-atomic', 'true');
    }
    if (region.parentNode !== host) host.appendChild(region);
    region.textContent = '';
    setTimeout(() => {
        region.textContent = String(text);
    }, 60);
};

/**
 * Announcement hook. Add-ons may publish `window.wapHelpers.announce(text, context)`
 * (e.g. a text-to-speech feature); it must return `true` when it handled the
 * announcement so callers can skip their own visual fallback.
 */
export const announce = (text, context = {}) => {
    // Screen readers hear it through a live region inside the open panel. Opening
    // and closing are left out: focus moving into the named dialog says that.
    if (!context?.event) liveAnnounce(text);
    const fn = typeof window !== 'undefined' ? window?.wapHelpers?.announce : null;
    if (typeof fn !== 'function') return false;
    try {
        return fn(text, context) === true;
    } catch (e) {
        return false;
    }
};
