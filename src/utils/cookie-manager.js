export const getCookie = (name) => {
    return document.cookie.split("; ").reduce((r, v) => {
        const parts = v.split("=");
        if (parts[0] !== name) return r;
        // A malformed value (stray "%") must not throw out of the toolbar.
        try {
            return decodeURIComponent(parts[1]);
        } catch (e) {
            return "";
        }
    }, "");
};

export const setCookie = (name, value, days = 365) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
};

export function removeCookie(name) {
    // Set the cookie's expiration date to a past date
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}