/**
 * Data the admin screens read from REST routes, cached across screens.
 *
 * The admin SPA switches screens without reloading the page, and each screen
 * used to fetch its data again every time it was shown. Here every answer is
 * kept (TanStack Query): a screen shown again renders at once and refreshes
 * in the background when its data is older than `staleTime`, and two parts of
 * a screen asking for the same path share one request.
 *
 * On a full page load the first answer for each path comes with the page
 * (Admin\Enqueue::preload_rest_requests() and apiFetch's preloading
 * middleware), so no screen waits for the network to render.
 */
import { QueryClient } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// Statistics move while visitors use the toolbar; one minute is fresh enough.
			staleTime: 60 * 1000,
			gcTime: 30 * 60 * 1000,
			refetchOnWindowFocus: false,
			retry: 1,
		},
	},
});

/** Paths as the screens request them; Admin\Enqueue::preload_paths() mirrors these. */
export const REST_PATHS = {
	settings: '/websac/v1/settings',
	preferenceStats: '/websac/v1/preference?stats=true',
	usageStatistics: (range) => `/websac/v1/usage-statistics?range=${range}`,
	systemInfo: '/websac/v1/system-info',
	statementPage:
		'/wp/v2/pages?slug=one-accessibility-statement-page&status=any&_fields=id,title,link,status,slug&per_page=1',
};

/**
 * Cache key of a REST GET path.
 *
 * @param {string} path REST path.
 * @return {Array} Query key.
 */
export const restQueryKey = (path) => ['websac-rest', path];

/**
 * useQuery() options for a REST GET path.
 *
 * @param {string} path    REST path, e.g. REST_PATHS.settings.
 * @param {Object} options Extra useQuery() options (staleTime, enabled…).
 * @return {Object} Options for useQuery().
 */
export const restQuery = (path, options = {}) => ({
	queryKey: restQueryKey(path),
	queryFn: () => apiFetch({ path }),
	...options,
});

/**
 * Mark every cached answer of paths starting with `prefix` stale, so a screen
 * that shows it fetches it again (e.g. all statistics ranges after a reset).
 *
 * @param {string} prefix Path prefix.
 * @return {Promise} Resolves once active queries have refetched.
 */
export const invalidateRestPrefix = (prefix) =>
	queryClient.invalidateQueries({
		predicate: (query) =>
			query.queryKey[0] === 'websac-rest' && String(query.queryKey[1]).startsWith(prefix),
	});
