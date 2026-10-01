import clsx from "clsx";
import { useMemo, useRef, useState, useCallback, useLayoutEffect } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { InfoCircleOutlined } from "@ant-design/icons";
import { getFeatureCategories, getFeatureStateIndex } from "../utils/feature-categories";
import { normalizeItemLayout } from "../utils/item-layout";
import { announce } from "../utils/feature-handlers";

/** Single-line label + ellipsis; full text scrolls on hover when overflow (see _accessibility-profiles.scss pattern) */
function WidgetFeatureItem({
	feature,
	attributes,
	layout,
	tooltipPosition,
	featureColumnWidth,
	currentSettings,
	handleFeatureClick,
}) {
	const { WapCol, WapTooltip } = window?.wapComponents || {};
	const key = feature.key;
	const setting = currentSettings?.[key] || {};
	const currentStep = setting.currentStep || 0;
	const currentAttribute = setting.currentAttribute;
	const allAttributes = feature.attributes || [];
	// A feature an add-on marks unavailable (it cannot work in this browser or on
	// this page) is listed but cannot be switched on; the reason is its tooltip.
	const unavailable = typeof feature?.unavailable === "string" ? feature.unavailable : "";
	const isActive = !unavailable && currentStep > 0;
	const showSteps = currentStep > 0 && allAttributes[0]?.value !== "enable";
	const totalSteps = allAttributes.length;

	const labelWrapRef = useRef(null);
	const [labelShift, setLabelShift] = useState("0px");

	// A toggle may describe its switched-on state separately (e.g. Pause Animations
	// becomes "Play Animations"): the tile then offers what a click does next.
	const displayLabel =
		isActive && showSteps && currentAttribute
			? currentAttribute?.name ?? ""
			: (isActive && feature?.activeLabel) || (feature?.label ?? "");
	const displayIcon = (isActive && feature?.activeIcon) || feature.icon;
	const displayDescription = unavailable || (isActive && feature?.activeDescription) || feature?.description;

	useLayoutEffect(() => {
		setLabelShift("0px");
	}, [displayLabel]);

	const measureLabelOverflow = useCallback(() => {
		const wrap = labelWrapRef.current;
		if (!wrap) return;
		const inner = wrap.querySelector(".wap-widget-features__feature-label-text");
		if (!inner) return;
		const extra = inner.scrollWidth - wrap.clientWidth;
		setLabelShift(extra > 0 ? `${extra}px` : "0px");
	}, []);

	const clearLabelOverflow = useCallback(() => setLabelShift("0px"), []);

	return (
		<WapCol
			className={clsx(
				`wap-feature-${key}`,
				`wap-widget-features__item-wrap`,
				`wap-widget-features__item-wrap--${layout}`,
				{
					"wap-feature--active": isActive,
				}
			)}
			xs={24}
			sm={12}
			md={24}
			lg={24}
			xl={24}
			flex={`0 0 ${featureColumnWidth}`}
			style={{ maxWidth: featureColumnWidth }}
		>
			{displayDescription && (
				<WapTooltip
					title={displayDescription}
					placement="top"
					autoAdjustOverflow={false}
					getPopupContainer={() => document.body}
					mouseEnterDelay={0}
					styles={{
						root: { zIndex: 9999999999 },
					}}
				>
					<InfoCircleOutlined
						className={clsx(
							"wap-widget-features__feature-tooltip",
							`wap-widget-features__feature-tooltip--${tooltipPosition}`
						)}
					/>
				</WapTooltip>
			)}

			<div
				className={clsx("wap-widget-features__feature-btn", {
					"wap-widget-features__feature-btn--active": isActive,
					"wap-widget-features__feature-btn--unavailable": !!unavailable,
				})}
				onClick={() => handleFeatureClick(feature)}
				onMouseEnter={measureLabelOverflow}
				onMouseLeave={clearLabelOverflow}
				style={{ cursor: unavailable ? "not-allowed" : "pointer" }}
				aria-label={unavailable
					? `${feature?.label || ""}: ${unavailable}`
					: (isActive && feature?.activeDescription) || currentAttribute?.description || feature?.description}
				aria-disabled={unavailable ? "true" : undefined}
				role="button"
				tabIndex={0}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						handleFeatureClick(feature);
					}
				}}
			>
				{!attributes?.hideItemIcons && (
					<span className="wap-widget-features__feature-icon">{displayIcon}</span>
				)}
				{!attributes?.hideItemLabels && displayLabel !== "" && (
					<div
						ref={labelWrapRef}
						className={clsx(
							"wap-widget-features__feature-label",
							`wap-widget-features__feature-label--${layout}`,
							{
								"wap-widget-features__feature-label--can-scroll": labelShift !== "0px",
							}
						)}
						style={{ "--wap-label-shift": labelShift }}
					>
						<span className="wap-widget-features__feature-label-text" title={displayLabel}>
							{displayLabel}
						</span>
					</div>
				)}
			</div>

			{showSteps && isActive && currentAttribute && (
				<span className="wap-widget-features-bottom-indicator wap-widget-features-bottom-indicator--active">
					<span className="wap-widget-features-bottom-indicator__step">
						{[...Array(totalSteps).keys()].map((step) => (
							<span
								key={step}
								className={clsx("wap-widget-features-bottom-indicator__step-item", {
									"wap-widget-features-bottom-indicator__step-item--active": step + 1 === currentStep,
								})}
							/>
						))}
					</span>
				</span>
			)}
		</WapCol>
	);
}

const WidgetFeatures = ({
	value,
	accessibilityContext,
	accessibilityDispatch,
	onFeatureInteraction = () => {},
}) => {
	const { WapCard, WapRow, WapCol, WapTooltip, WapNotification } = window?.wapComponents;
	const { items } = value;
	const featureItem = items.find((item) => item.slug === "features");
	const attributes = featureItem?.attributes || {};
	const layout = normalizeItemLayout(attributes?.layout, "block");
	const tooltipPosition = attributes?.tooltipPosition || "topLeft";
	const featureColumns = Math.min(6, Math.max(1, Number(attributes?.columns) || 2));
	const featureColumnWidth = `${100 / featureColumns}%`;
	// Check if we're in frontend context
	const isFrontend = !!accessibilityContext && !!accessibilityDispatch;
	const { currentSettings } = accessibilityContext || {};

	const features = useMemo(() => {
		const allFeatures = window.wapHelpers?.features || [];
		const featureStateIndex = getFeatureStateIndex(attributes, allFeatures);

		return allFeatures.filter((feature) => {
			return featureStateIndex?.[feature?.key]?.active ?? true;
		});
	}, [attributes?.widgets, attributes?.widgetCategories, isFrontend]);

	const categorizedFeatures = useMemo(() => {
		return getFeatureCategories(attributes, features);
	}, [attributes?.widgets, attributes?.widgetCategories, features]);

	// Handle feature click
	const handleFeatureClick = (feature) => {
		if (!isFrontend) return;
		const allAttributes = feature.attributes || [];
		const key = feature?.key;
		const notify = (content) => {
			const text = content || `${feature?.label || __("Feature", "website-accessibility")} ${__("updated", "website-accessibility")}`;
			const isWpAdmin = !!document.body?.classList?.contains("wp-admin");
			const previewRoot = document.querySelector(".wap-preset__preview-drawer-root");

			WapNotification?.open?.({
				key: "wap-feature-notification",
				message: text,
				// Admin: topRight avoids covering the left WP sidebar (z-index clash).
				// Frontend: topLeft stays clear of the right-side accessibility panel.
				placement: isWpAdmin ? "topRight" : "topLeft",
				duration: 1.8,
				className: isWpAdmin
					? "wap-feature-notification wap-feature-notification--admin"
					: "wap-feature-notification wap-feature-notification--frontend",
				...(previewRoot ? { getContainer: () => previewRoot } : {}),
			});
		};

		// Not switchable here: say why instead.
		if (feature?.unavailable) {
			notify(feature.unavailable);
			return;
		}

		const prevState = currentSettings[key] || {};
		const prevStep = prevState?.currentStep || 0;

		accessibilityDispatch({
			type: "SET_CURRENT_PROFILE",
			payload: null, // Reset current profile on feature click
		});

		// For toggle-like features (enable/disable)
		if (allAttributes.length === 2 && allAttributes[0]?.value === "enable") {
			const nextStep = prevStep === 1 ? 0 : 1;
			const currentAttribute = allAttributes[nextStep - 1] || null;
			const nextSettings = {
				...currentSettings,
				[key]: {
					currentStep: nextStep,
					currentAttribute,
					isMultiStep: false,
				},
			};

			accessibilityDispatch({
				type: "SET_CURRENT_SETTINGS",
				payload: nextSettings,
			});
			onFeatureInteraction(nextSettings);

			const toggleAnnouncement = currentAttribute
				? currentAttribute?.enableAnnouncement
				: feature?.disableAnnouncement;
			notify(toggleAnnouncement);
			announce(toggleAnnouncement, { key, feature, attribute: currentAttribute, settings: currentSettings });

			return;
		}

		// For multi-step attributes
		const nextStep = prevStep >= allAttributes.length ? 0 : prevStep + 1;
		const nextSettings = {
			...currentSettings,
			[key]: {
				currentStep: nextStep,
				currentAttribute: nextStep === 0 ? null : allAttributes[nextStep - 1],
				isMultiStep: allAttributes.length > 1,
			},
		};

		accessibilityDispatch({
			type: "SET_CURRENT_SETTINGS",
			payload: nextSettings,
		});
		onFeatureInteraction(nextSettings);

		const nextAttribute = allAttributes[nextStep - 1] || null;
		const stepAnnouncement = nextAttribute
			? nextAttribute?.enableAnnouncement
			: feature?.disableAnnouncement;
		notify(stepAnnouncement);
		announce(stepAnnouncement, { key, feature, attribute: nextAttribute, settings: currentSettings });
	};

	return (
		<WapCard className="wap-widget-features">
			{categorizedFeatures.map((category) => (
				<div className="wap-widget-features__category" key={category.slug}>
					<div className="wap-widget-features__category-header">
						<span className="wap-widget-features__category-title">{category.title}</span>
					</div>
					<WapRow gutter={[10, 10]} className="wap-widget-features__grid">
						{category.features.map((feature) => (
							<WidgetFeatureItem
								key={feature.key}
								feature={feature}
								attributes={attributes}
								layout={layout}
								tooltipPosition={tooltipPosition}
								featureColumnWidth={featureColumnWidth}
								currentSettings={currentSettings}
								handleFeatureClick={handleFeatureClick}
							/>
						))}
					</WapRow>
				</div>
			))}
		</WapCard>
	);
};

export default WidgetFeatures;
