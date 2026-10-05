import clsx from "clsx";
import { createPortal, useEffect, useRef, useState } from "@wordpress/element";
import { __, sprintf } from "@wordpress/i18n";

// The tile keeps the grid's single cell: it shows this many colours, and a "+"
// button opens a panel with all of them (and a custom colour, when allowed).
export const SWATCH_LIMIT = 4;
export const CUSTOM_SWATCH = "custom";

// The panel floats over the page without dimming it, so a pick shows at once; it
// stays open until closed and can be dragged by its header. It opens where a panel
// was last left — or, with another one already open, a step down and right of the
// front one, so each new panel shows.
const PANEL_WIDTH = 340;
const EDGE = 8;
const CASCADE = 32;
const Z_BASE = 2147483000;
let lastPosition = null;
const preventSelection = (event) => event.preventDefault();

// Open panels, back to front, and where each one is; every panel re-renders when
// the order changes.
let stack = [];
const positions = new Map();
const listeners = new Set();
const emit = () => listeners.forEach((listener) => listener());
const raise = (key) => {
	if (stack[stack.length - 1] === key) return;
	stack = [...stack.filter((item) => item !== key), key];
	emit();
};
const drop = (key) => {
	if (!stack.includes(key)) return;
	stack = stack.filter((item) => item !== key);
	positions.delete(key);
	emit();
};

// Dark tick on light colours, white on dark ones.
const tickColor = (hex) => {
	const match = /^#?([0-9a-f]{6})$/i.exec(hex || "");
	if (!match) return "#fff";
	const value = parseInt(match[1], 16);
	const [r, g, b] = [value >> 16, (value >> 8) & 255, value & 255];
	return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? "#111" : "#fff";
};

const clampPosition = ({ x, y }, panel) => {
	const width = panel?.offsetWidth || PANEL_WIDTH;
	const height = panel?.offsetHeight || 320;
	return {
		x: Math.min(Math.max(EDGE, x), Math.max(EDGE, window.innerWidth - width - EDGE)),
		y: Math.min(Math.max(EDGE, y), Math.max(EDGE, window.innerHeight - height - EDGE)),
	};
};

const Swatch = ({ attribute, active, onClick, showTick = false }) => (
	<button
		type="button"
		className={clsx("wap-widget-features__swatch", {
			"wap-widget-features__swatch--active": active,
		})}
		style={{ "--wap-swatch": attribute?.swatch || attribute?.value }}
		title={attribute?.name}
		aria-label={attribute?.name}
		aria-pressed={active}
		onClick={onClick}
	>
		{showTick && active && (
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
				<path d="m5 12.5 4.5 4.5L19 7.5" stroke={tickColor(attribute?.swatch)} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		)}
	</button>
);

/**
 * Body of a `display: "swatches"` feature tile (see widget-features.js).
 * `onPick(step, customAttribute)`: a step number (0 resets), or the step after the
 * last one with the custom colour's attribute.
 */
export default function FeatureSwatches({ feature, isActive, currentStep, currentAttribute, onPick }) {
	const steps = feature?.attributes || [];
	const dialogRef = useRef(null);
	const moreRef = useRef(null);
	const rootRef = useRef(null);
	const dragRef = useRef(null);
	const [open, setOpen] = useState(false);
	const [position, setPosition] = useState(null);
	const [, setStackVersion] = useState(0);
	const panelKey = feature?.key || "";
	const isCustom = isActive && currentAttribute?.value === CUSTOM_SWATCH;
	const [customColor, setCustomColor] = useState("#1677ff");
	const allowCustom = !!feature?.allowCustomColor;
	const hasMore = steps.length > SWATCH_LIMIT || allowCustom;
	const dialogTitleId = `wap-swatch-dialog-${feature?.key}`;

	// The picked colour always shows on the tile, in the last place when it is one
	// the tile does not list.
	let tileSwatches = steps.slice(0, SWATCH_LIMIT).map((attribute, index) => ({ attribute, step: index + 1 }));
	if (isActive && (isCustom || currentStep > SWATCH_LIMIT)) {
		tileSwatches = [...tileSwatches.slice(0, SWATCH_LIMIT - 1), { attribute: currentAttribute, step: currentStep }];
	}

	const openDialog = () => {
		if (isCustom && /^#[0-9a-f]{6}$/i.test(currentAttribute?.swatch || "")) {
			setCustomColor(currentAttribute.swatch);
		}
		const front = [...stack].reverse().find((key) => key !== panelKey && positions.has(key));
		const start = front
			? { x: positions.get(front).x + CASCADE, y: positions.get(front).y + CASCADE }
			: lastPosition || {
				x: Math.round((window.innerWidth - PANEL_WIDTH) / 2),
				y: Math.round(window.innerHeight / 2 - 170),
			};
		setPosition(start);
		setOpen(true);
		raise(panelKey);
	};

	const closeDialog = () => {
		setOpen(false);
		drop(panelKey);
		moreRef.current?.focus();
	};

	// Follow the stack order (which panel is in front).
	useEffect(() => {
		const listener = () => setStackVersion((version) => version + 1);
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
			drop(panelKey);
		};
	}, [panelKey]);

	useEffect(() => {
		if (open && position) positions.set(panelKey, position);
	}, [open, position, panelKey]);

	// Opened: keep it on screen and move focus into it.
	useEffect(() => {
		if (!open) return;
		const panel = dialogRef.current;
		setPosition((current) => clampPosition(current || { x: EDGE, y: EDGE }, panel));
		panel?.querySelector(".wap-swatch-dialog__close")?.focus();
	}, [open]);

	// The toolbar closed (its drawer hides this tile): close the panel with it.
	useEffect(() => {
		const tile = rootRef.current?.closest(".wap-widget-features__item-wrap");
		if (!open || !tile || typeof ResizeObserver === "undefined") return undefined;
		const observer = new ResizeObserver(() => {
			if (!tile.offsetWidth) {
				setOpen(false);
				drop(panelKey);
			}
		});
		observer.observe(tile);
		return () => observer.disconnect();
	}, [open]);

	const startDrag = (event) => {
		if (event.button !== 0 || event.target.closest("button")) return;
		const panel = dialogRef.current;
		if (!panel) return;
		const box = panel.getBoundingClientRect();
		dragRef.current = { dx: event.clientX - box.left, dy: event.clientY - box.top };
		event.currentTarget.setPointerCapture?.(event.pointerId);
		event.preventDefault();
		// A drag would otherwise select the page's text on the way.
		document.addEventListener("selectstart", preventSelection);
	};

	const moveDrag = (event) => {
		if (!dragRef.current) return;
		const next = clampPosition(
			{ x: event.clientX - dragRef.current.dx, y: event.clientY - dragRef.current.dy },
			dialogRef.current
		);
		lastPosition = next;
		setPosition(next);
	};

	const endDrag = (event) => {
		dragRef.current = null;
		event.currentTarget.releasePointerCapture?.(event.pointerId);
		document.removeEventListener("selectstart", preventSelection);
	};

	// A custom colour applies as it is picked. The picker reports every step of a
	// drag, so the toolbar is only updated once it pauses.
	const customTimerRef = useRef(null);
	useEffect(() => () => clearTimeout(customTimerRef.current), []);

	const applyCustom = (color) => {
		const label = feature?.label || "";
		onPick(steps.length + 1, {
			/* translators: %s: colour code, e.g. #1677ff. */
			name: sprintf(__("Custom color %s", "website-accessibility"), color),
			value: CUSTOM_SWATCH,
			swatch: color,
			css: [],
			/* translators: %s: feature name, e.g. "Text Color". */
			enableAnnouncement: sprintf(__("%s set to a custom color.", "website-accessibility"), label),
		});
	};

	const changeCustom = (color) => {
		setCustomColor(color);
		clearTimeout(customTimerRef.current);
		customTimerRef.current = setTimeout(() => applyCustom(color), 150);
	};

	return (
		<>
			<div className="wap-widget-features__swatches" ref={rootRef}>
				{tileSwatches.map(({ attribute, step }) => (
					<Swatch
						key={`${attribute?.value}-${step}`}
						attribute={attribute}
						active={isActive && currentStep === step}
						onClick={() => (attribute?.value === CUSTOM_SWATCH ? openDialog() : onPick(step))}
					/>
				))}
				{hasMore && (
					<button
						ref={moreRef}
						type="button"
						className="wap-widget-features__swatch wap-widget-features__swatch--more"
						aria-haspopup="dialog"
						aria-expanded={open}
						aria-label={__("More colors", "website-accessibility")}
						title={__("More colors", "website-accessibility")}
						onClick={openDialog}
					>
						+
					</button>
				)}
			</div>
			<button
				type="button"
				className="wap-widget-features__swatch-reset"
				disabled={!isActive}
				onClick={() => onPick(0)}
			>
				{__("Reset", "website-accessibility")}
			</button>

			{hasMore && open && createPortal(
				<div
					ref={dialogRef}
					className={clsx("wap-swatch-dialog", "notranslate", {
						"wap-swatch-dialog--front": stack[stack.length - 1] === panelKey,
					})}
					translate="no"
					role="dialog"
					aria-modal="false"
					aria-labelledby={dialogTitleId}
					style={{
						zIndex: Z_BASE + Math.max(0, stack.indexOf(panelKey)),
						...(position ? { left: `${position.x}px`, top: `${position.y}px` } : {}),
					}}
					onPointerDownCapture={() => raise(panelKey)}
					onFocusCapture={() => raise(panelKey)}
					// Escape closes this panel only, not the toolbar behind it.
					onKeyDown={(event) => {
						if (event.key === "Escape") {
							event.stopPropagation();
							closeDialog();
						}
					}}
				>
					<div
						className="wap-swatch-dialog__header"
						onPointerDown={startDrag}
						onPointerMove={moveDrag}
						onPointerUp={endDrag}
						onPointerCancel={endDrag}
					>
						<span className="wap-swatch-dialog__grip" aria-hidden="true">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" focusable="false">
								<circle cx="9" cy="5" r="1.8" />
								<circle cx="15" cy="5" r="1.8" />
								<circle cx="9" cy="12" r="1.8" />
								<circle cx="15" cy="12" r="1.8" />
								<circle cx="9" cy="19" r="1.8" />
								<circle cx="15" cy="19" r="1.8" />
							</svg>
						</span>
						<span id={dialogTitleId} className="wap-swatch-dialog__title">
							{feature?.label}
						</span>
						<button
							type="button"
							className="wap-swatch-dialog__close"
							aria-label={__("Close", "website-accessibility")}
							onClick={closeDialog}
						>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
								<path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
							</svg>
						</button>
					</div>

					<div className="wap-swatch-dialog__body">
						<div className="wap-swatch-dialog__swatches">
							{steps.map((attribute, index) => (
								<div className="wap-swatch-dialog__choice" key={attribute?.value || index}>
									<Swatch
										attribute={attribute}
										active={isActive && currentStep === index + 1}
										onClick={() => onPick(index + 1)}
										showTick
									/>
									<span className="wap-swatch-dialog__choice-name" aria-hidden="true">
										{attribute?.name}
									</span>
								</div>
							))}
						</div>

						{allowCustom && (
							<div className="wap-swatch-dialog__custom">
								<label htmlFor={`${dialogTitleId}-custom`}>
									{__("Custom color", "website-accessibility")}
								</label>
								<span className="wap-swatch-dialog__custom-code">{customColor}</span>
								<input
									id={`${dialogTitleId}-custom`}
									type="color"
									value={customColor}
									onChange={(event) => changeCustom(event.target.value)}
								/>
							</div>
						)}
					</div>

					<div className="wap-swatch-dialog__footer">
						<span className="wap-swatch-dialog__current">
							{isActive && currentAttribute ? (
								<>
									<span
										className="wap-swatch-dialog__current-dot"
										style={{ "--wap-swatch": currentAttribute?.swatch }}
										aria-hidden="true"
									/>
									{currentAttribute?.value === CUSTOM_SWATCH
										? __("Custom color", "website-accessibility")
										: currentAttribute?.name}
								</>
							) : (
								__("Not set", "website-accessibility")
							)}
						</span>
						<button
							type="button"
							className="wap-swatch-dialog__reset"
							disabled={!isActive}
							onClick={() => onPick(0)}
						>
							{__("Reset", "website-accessibility")}
						</button>
					</div>
				</div>,
				document.body
			)}
		</>
	);
}
