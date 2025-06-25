import { createBrowserHistory } from 'history';

/**
 * WordPress dependencies
 */
import { addQueryArgs, getQueryArgs, removeQueryArgs } from '@wordpress/url';

// Create a browser history object
const history = createBrowserHistory();

// Custom push and replace functions to manage WordPress admin URL structure
const originalHistoryPush = history.push;
const originalHistoryReplace = history.replace;

function push(params, state) {
    const currentArgs = getQueryArgs(window.location.href);
    const currentUrlWithoutArgs = removeQueryArgs(window.location.href, ...Object.keys(currentArgs));
    const newUrl = addQueryArgs(currentUrlWithoutArgs, params);
    return originalHistoryPush.call(history, newUrl, state);
}

function replace(params, state) {
    const currentArgs = getQueryArgs(window.location.href);
    const currentUrlWithoutArgs = removeQueryArgs(window.location.href, ...Object.keys(currentArgs));
    const newUrl = addQueryArgs(currentUrlWithoutArgs, params);
    return originalHistoryReplace.call(history, newUrl, state);
}

history.push = push;
history.replace = replace;

export default history;
