/**
 * Inline SVGs for Fixed Issues (avoid @ant-design/icons font/icons).
 */
import { createElement } from '@wordpress/element';

const strokeSvg = {
	xmlns: 'http://www.w3.org/2000/svg',
	fill: 'none',
	stroke: 'currentColor',
	strokeWidth: 2,
	strokeLinecap: 'round',
	strokeLinejoin: 'round',
	'aria-hidden': 'true',
	focusable: 'false',
};

export function FixedIssuesIconDownload({ size = 16 }) {
	return createElement(
		'svg',
		{ ...strokeSvg, width: size, height: size, viewBox: '0 0 24 24' },
		createElement('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
		createElement('polyline', { points: '7 10 12 15 17 10' }),
		createElement('line', { x1: 12, y1: 15, x2: 12, y2: 3 })
	);
}

export function FixedIssuesIconTrash({ size = 16 }) {
	return createElement(
		'svg',
		{ ...strokeSvg, width: size, height: size, viewBox: '0 0 24 24' },
		createElement('path', { d: 'M3 6h18' }),
		createElement('path', { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' }),
		createElement('path', { d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' }),
		createElement('line', { x1: 10, y1: 11, x2: 10, y2: 17 }),
		createElement('line', { x1: 14, y1: 11, x2: 14, y2: 17 })
	);
}

/** Menu / dropdown caret (matches stroke tone of toolbar icons). */
export function FixedIssuesIconChevronDown({ size = 14 }) {
	return createElement(
		'svg',
		{ ...strokeSvg, width: size, height: size, viewBox: '0 0 24 24' },
		createElement('path', { d: 'm6 9 6 6 6-6' }),
	);
}

export function FixedIssuesIconInbox({ size = 28 }) {
	return createElement(
		'svg',
		{ ...strokeSvg, width: size, height: size, viewBox: '0 0 24 24' },
		createElement('polyline', { points: '22 12 16 12 14 15 10 15 8 12 2 12' }),
		createElement('path', {
			d: 'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
		})
	);
}

/** External / “open in new tab” — up-right arrow */
export function FixedIssuesIconExternalLink({ size = 12 }) {
	return createElement(
		'svg',
		{ ...strokeSvg, width: size, height: size, viewBox: '0 0 24 24' },
		createElement('path', { d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' }),
		createElement('polyline', { points: '15 3 21 3 21 9' }),
		createElement('line', { x1: 10, y1: 14, x2: 21, y2: 3 })
	);
}

export function FixedIssuesIconSearch({ size = 14 }) {
	return createElement(
		'svg',
		{ ...strokeSvg, width: size, height: size, viewBox: '0 0 24 24' },
		createElement('circle', { cx: 11, cy: 11, r: 8 }),
		createElement('path', { d: 'm21 21-4.3-4.3' })
	);
}
