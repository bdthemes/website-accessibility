import { useEffect, useState } from '@wordpress/element';

function useBrowserKey() {
  const [browserKey, setBrowserKey] = useState(null);

  useEffect(() => {
    const setCookie = window?.wapHelpers?.setCookie;
    const getCookie = window?.wapHelpers?.getCookie;

    if (!setCookie || !getCookie) return;

    // 1.5.0: cookie renamed to the websac_ prefix; carry over a legacy value if present.
    let key = getCookie('websac_browser_key') || getCookie('one_accessibility_browser_key');

    if (!key) {
      key = 'bx-' + Math.random().toString(36).substring(2, 12);
    }
    if (!getCookie('websac_browser_key')) {
      setCookie('websac_browser_key', key, 365); // 1 year
    }

    setBrowserKey(key);
  }, []);

  return browserKey;
}

export default useBrowserKey;
