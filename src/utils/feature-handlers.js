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

/**
 * Announcement hook. Add-ons may publish `window.wapHelpers.announce(text, context)`
 * (e.g. a text-to-speech feature); it must return `true` when it handled the
 * announcement so callers can skip their own visual fallback.
 */
export const announce = (text, context = {}) => {
    const fn = typeof window !== 'undefined' ? window?.wapHelpers?.announce : null;
    if (typeof fn !== 'function') return false;
    try {
        return fn(text, context) === true;
    } catch (e) {
        return false;
    }
};
