import { __ } from '@wordpress/i18n';

/**
 * The single loading state for every admin screen.
 *
 * Each screen used to invent its own wait: a centred spinner, an animated
 * progress bar, a line of "Loading…" text, a table overlay. The chrome, the
 * shimmer and the spacing below are identical whatever `variant` is asked for,
 * so moving between screens no longer changes what waiting looks like — only
 * the block layout follows the page the skeleton stands in.
 *
 * Styles live with the admin bundle (`_page-skeleton.scss`), not with the rest
 * of the shared components, because nothing on the front end renders this.
 *
 * @param {Object}  props
 * @param {string}  props.variant   'page' (stacked rows), 'stats' (tile grid) or 'table'.
 * @param {boolean} props.header    Render the title/description card above the content.
 * @param {number}  props.rows      Content rows ('page'), table rows ('table'), list rows ('stats').
 * @param {number}  props.tiles     Tiles in the 'stats' grid.
 * @param {number}  props.columns   Cells per row in the 'table' variant.
 * @param {string}  props.className Extra class on the root element.
 */

// Fixed cycles rather than random widths: a skeleton that reshuffles on every
// re-render reads as flicker, not as loading.
const VALUE_WIDTHS = [48, 62, 40, 56];
const LABEL_WIDTHS = [96, 132, 112, 120];
const ROW_WIDTHS = [168, 144, 188, 156];
const DESC_WIDTHS = [264, 232, 288, 248];
const CELL_WIDTHS = [148, 96, 116, 72];

const pick = (list, index) => list[index % list.length];

const Bar = ({ width, height = 12, round = 6, className = '' }) => (
	<span
		className={`wap-page-skeleton__bar${className ? ` ${className}` : ''}`}
		style={{ width, height, borderRadius: round }}
	/>
);

const HeaderCard = () => (
	<div className="wap-page-skeleton__card wap-page-skeleton__card--header">
		<div className="wap-page-skeleton__stack">
			<Bar width={196} height={18} />
			<Bar width={312} height={12} />
		</div>
		<Bar width={128} height={36} round={8} />
	</div>
);

const Tiles = ({ tiles }) => (
	<div className="wap-page-skeleton__tiles" style={{ '--wap-skeleton-tiles': tiles }}>
		{Array.from({ length: tiles }, (_, index) => (
			<div className="wap-page-skeleton__tile" key={index}>
				<div className="wap-page-skeleton__tile-top">
					<Bar width={36} height={36} round={10} />
					<Bar width={pick(VALUE_WIDTHS, index)} height={20} />
				</div>
				<Bar width={pick(LABEL_WIDTHS, index)} height={12} />
			</div>
		))}
	</div>
);

const ListRows = ({ rows }) => (
	<div className="wap-page-skeleton__list">
		{Array.from({ length: rows }, (_, index) => (
			<div className="wap-page-skeleton__list-row" key={index}>
				<Bar width={28} height={28} round={8} />
				<Bar width={pick(LABEL_WIDTHS, index)} height={12} />
				<Bar width={32} height={12} className="wap-page-skeleton__bar--end" />
			</div>
		))}
	</div>
);

const Rows = ({ rows }) => (
	<div className="wap-page-skeleton__rows">
		{Array.from({ length: rows }, (_, index) => (
			<div className="wap-page-skeleton__card wap-page-skeleton__row" key={index}>
				<div className="wap-page-skeleton__stack">
					<Bar width={pick(ROW_WIDTHS, index)} height={14} />
					<Bar width={pick(DESC_WIDTHS, index)} height={11} />
				</div>
				<Bar width={44} height={24} round={12} />
			</div>
		))}
	</div>
);

const TableCard = ({ rows, columns }) => (
	<div
		className="wap-page-skeleton__card wap-page-skeleton__card--table"
		style={{ '--wap-skeleton-columns': columns }}
	>
		<div className="wap-page-skeleton__toolbar">
			<Bar width={240} height={36} round={8} />
			<Bar width={112} height={36} round={8} />
		</div>
		<div className="wap-page-skeleton__table-head">
			{Array.from({ length: columns }, (_, index) => (
				<Bar width={pick(CELL_WIDTHS, index)} height={12} key={index} />
			))}
		</div>
		{Array.from({ length: rows }, (_, rowIndex) => (
			<div className="wap-page-skeleton__table-row" key={rowIndex}>
				{Array.from({ length: columns }, (_, cellIndex) => (
					<Bar
						width={pick(CELL_WIDTHS, rowIndex + cellIndex)}
						height={12}
						key={cellIndex}
					/>
				))}
			</div>
		))}
	</div>
);

const WapPageSkeleton = ({
	variant = 'page',
	header = true,
	rows = 3,
	tiles = 4,
	columns = 4,
	className = '',
}) => (
	<div
		className={`wap-page-skeleton wap-page-skeleton--${variant}${className ? ` ${className}` : ''}`}
		// Announced once instead of per block, so a screen reader says "loading"
		// rather than reading out dozens of empty placeholders.
		role="status"
		aria-busy="true"
		aria-live="polite"
	>
		<span className="screen-reader-text">{__('Loading…', 'website-accessibility')}</span>

		{header && <HeaderCard />}

		{variant === 'stats' && (
			<div className="wap-page-skeleton__card">
				{tiles > 0 && <Tiles tiles={tiles} />}
				{rows > 0 && <ListRows rows={rows} />}
			</div>
		)}

		{variant === 'table' && <TableCard rows={rows} columns={columns} />}

		{variant === 'page' && rows > 0 && <Rows rows={rows} />}
	</div>
);

export default WapPageSkeleton;
