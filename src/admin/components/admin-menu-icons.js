/**
 * Sidebar menu SVG icons — stroke based, currentColor for active/hover states
 */
const baseProps = {
	width: 18,
	height: 18,
	viewBox: '0 0 24 24',
	fill: 'none',
	stroke: 'currentColor',
	strokeWidth: 1.75,
	strokeLinecap: 'round',
	strokeLinejoin: 'round',
	'aria-hidden': true,
};

const wrap = (svg) => (
	<span className="wap-admin-menu-icon">{svg}</span>
);

/** General / Dashboard — grid */
export const IconGeneral = () =>
	wrap(
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={24}
			height={24}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			className="lucide lucide-layout-dashboard-icon lucide-layout-dashboard"
		>
			<rect width={7} height={9} x={3} y={3} rx={1} />
			<rect width={7} height={5} x={14} y={3} rx={1} />
			<rect width={7} height={9} x={14} y={12} rx={1} />
			<rect width={7} height={5} x={3} y={16} rx={1} />
		</svg>

	);

/** Presets — layers / stack */
export const IconPresets = () =>
	wrap(
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={24}
			height={24}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			className="lucide lucide-layers-icon lucide-layers"
		>
			<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
			<path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
			<path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
		</svg>
	);

/** Custom Profiles — users */
export const IconProfiles = () =>
	wrap(
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={24}
			height={24}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			className="lucide lucide-users-icon lucide-users"
		>
			<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
			<path d="M16 3.128a4 4 0 0 1 0 7.744" />
			<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
			<circle cx={9} cy={7} r={4} />
		</svg>

	);



/** CSS overrides — code / stylesheet */
export const IconCssOverrides = () =>
	wrap(
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={24}
			height={24}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			className="lucide lucide-file-code-icon lucide-file-code"
		>
			<path d="M10 12.5 8 15l2 2.5M14 12.5l2 2.5-2 2.5" />
			<path d="M14 2v4a2 2 0 0 0 2 2h4" />
			<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
		</svg>
	);

/** Settings — sliders */
export const IconSettings = () =>
	wrap(
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={24}
			height={24}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			className="lucide lucide-sliders-vertical-icon lucide-sliders-vertical"
		>
			<path d="M10 8h4" />
			<path d="M12 21v-9" />
			<path d="M12 8V3" />
			<path d="M17 16h4" />
			<path d="M19 12V3" />
			<path d="M19 21v-5" />
			<path d="M3 14h4" />
			<path d="M5 10V3" />
			<path d="M5 21v-7" />
		</svg>


	);

/** License — key / shield */
export const IconLicense = () =>
	wrap(
		<svg
		xmlns="http://www.w3.org/2000/svg"
		width={24}
		height={24}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round"
		className="lucide lucide-key-round-icon lucide-key-round"
		>
		<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
		<circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
		</svg>

	);

/** White Label — tag / badge */
export const IconWhiteLabel = () =>
	wrap(
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={24}
			height={24}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M12 2 2 7v10l10 5 10-5V7z" />
			<path d="M2 7l10 5 10-5" />
			<path d="M12 22V12" />
		</svg>
	);

/** Tools & Backup — download/upload / toolbox */
export const IconTools = () =>
	wrap(
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={24}
			height={24}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			className="lucide lucide-wrench-icon lucide-wrench"
		>
			<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z" />
		</svg>

	);

/** About & Info — info circle */
export const IconInfo = () =>
	wrap(
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={24}
			height={24}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			className="lucide lucide-info-icon lucide-info"
		>
			<circle cx={12} cy={12} r={10} />
			<path d="M12 16v-4" />
			<path d="M12 8h.01" />
		</svg>

	);

/** Get Pro — sparkles */
export const IconPro = () =>
	wrap(
		<svg
			xmlns="http://www.w3.org/2000/svg"
			{...baseProps}
			className="lucide lucide-sparkles-icon lucide-sparkles"
		>
			<path d="M12 2l1.4 4.6L18 8l-4.6 1.4L12 14l-1.4-4.6L6 8l4.6-1.4L12 2z" />
			<path d="M5 13l.9 2.9L9 17l-3.1 1.1L5 21l-.9-2.9L1 17l3.1-1.1L5 13z" />
			<path d="M19 13l.9 2.9L23 17l-3.1 1.1L19 21l-.9-2.9L15 17l3.1-1.1L19 13z" />
		</svg>
	);

/** Fixed Issues — target / crosshair (checker) */
export const IconFixedIssues = () =>
	wrap(
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={24}
			height={24}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<circle cx={12} cy={12} r={10} />
			<circle cx={12} cy={12} r={3} />
			<line x1={12} y1={2} x2={12} y2={5} />
			<line x1={12} y1={19} x2={12} y2={22} />
			<line x1={2} y1={12} x2={5} y2={12} />
			<line x1={19} y1={12} x2={22} y2={12} />
		</svg>
	);

/** Help & Support — life ring */
export const IconHelp = () =>
	wrap(
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={24}
			height={24}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			className="lucide lucide-life-buoy-icon lucide-life-buoy"
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="10" />
			<path d="m4.93 4.93 4.24 4.24" />
			<path d="m14.83 9.17 4.24-4.24" />
			<path d="m14.83 14.83 4.24 4.24" />
			<path d="m9.17 14.83-4.24 4.24" />
			<circle cx="12" cy="12" r="4" />
		</svg>
	);
