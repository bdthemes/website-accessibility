import { useEffect, useState } from '@wordpress/element';

/**
 * Anonymous per-browser key used only to de-duplicate on-site usage statistics.
 * The cookie is only written while the site owner has usage statistics enabled;
 * when disabled it is removed again.
 *
 * @param {boolean} enabled Whether usage statistics are enabled for this site.
 */
function useBrowserKey(enabled = true) {
  const [browserKey, setBrowserKey] = useState(null);

  useEffect(() => {
    const setCookie = window?.wapHelpers?.setCookie;
    const getCookie = window?.wapHelpers?.getCookie;
    const removeCookie = window?.wapHelpers?.removeCookie;

    if (!setCookie || !getCookie) return;

    if (!enabled) {
      if (typeof removeCookie === 'function') {
        removeCookie('websac_browser_key');
        removeCookie('one_accessibility_browser_key');
      }
      setBrowserKey(null);
      return;
    }

    // 1.5.0: cookie renamed to the websac_ prefix; carry over a legacy value if present.
    let key = getCookie('websac_browser_key') || getCookie('one_accessibility_browser_key');

    if (!key || !/^[A-Za-z0-9_-]{1,64}$/.test(key)) {
      key = 'bx-' + Math.random().toString(36).substring(2, 12);
    }
    if (getCookie('websac_browser_key') !== key) {
      setCookie('websac_browser_key', key, 365); // 1 year
    }
    if (getCookie('one_accessibility_browser_key') && typeof removeCookie === 'function') {
      removeCookie('one_accessibility_browser_key');
    }

    setBrowserKey(key);
  }, [enabled]);

  return browserKey;

}

export default useBrowserKey;
