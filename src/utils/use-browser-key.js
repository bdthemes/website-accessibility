import { useEffect, useState } from '@wordpress/element';

function useBrowserKey() {
  const [browserKey, setBrowserKey] = useState(null);

  useEffect(() => {
    const setCookie = window?.wapHelpers?.setCookie;
    const getCookie = window?.wapHelpers?.getCookie;

    if (!setCookie || !getCookie) return;

    let key = getCookie('one_accessibility_browser_key');

    if (!key) {
      key = 'bx-' + Math.random().toString(36).substring(2, 12);
      setCookie('one_accessibility_browser_key', key, 365); // 1 year
    }

    setBrowserKey(key);
  }, []);

  return browserKey;
}

export default useBrowserKey;
