import { Card, Row, Col, Switch, Badge } from "antd";
import clsx from "clsx";
import { useMemo } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import WapCard from "./wap-card";
import WapRow from "./wap-row";
import WapCol from "./wap-col";
import WapSwitch from "./wap-switch";
import WapBadge from "./wap-badge";

const WidgetFeatures = ({
	value,
	accessibilityContext,
	accessibilityDispatch,
}) => {
	const { items } = value;
	const featureItem = items.find((item) => item.slug === "features");
	const attributes = featureItem?.attributes || {};
	// Check if we're in frontend context
	const isFrontend = !!accessibilityContext && !!accessibilityDispatch;
	const { currentSettings, isOverSized } = accessibilityContext || {};

	const features = useMemo(() => {
		let allFeatures = window.wapHelpers?.features || [];
		if (isFrontend) [
			allFeatures = allFeatures.filter((feature) => {
				if (!feature?.isDummy) return feature;
			})
		]

		return allFeatures.filter((feature) => {
			const currentItem = attributes?.widgets?.find(item => item[feature?.key]);
			const isCurrentActive = currentItem ? currentItem[feature?.key]?.active : true;
			if (isCurrentActive) return feature;
		})
	}, [attributes?.widgets]);

	// Calculate column span based on items per row
	const itemsPerRow = parseInt(attributes?.itemsPerRow) || 2;
	const colSpan = 24 / itemsPerRow;
	// Handle feature click
	const handleFeatureClick = (feature) => {
		if (!isFrontend) return;
		const { isScreenReaderActive = (() => false), screenReader = () => null } = window?.wapHelpers;
		const allAttributes = feature.attributes || [];
		const key = feature?.key;

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

			accessibilityDispatch({
				type: "SET_CURRENT_SETTINGS",
				payload: {
					...currentSettings,
					[key]: {
						currentStep: nextStep,
						currentAttribute,
						isMultiStep: false,
					},
				},
			});

			if (isScreenReaderActive(currentSettings)) {
				const enableAnnouncement = currentAttribute?.enableAnnouncement;
				const disableAnnouncement = feature?.disableAnnouncement;
				if (currentAttribute) {
					screenReader()?.speak(enableAnnouncement);
				} else {
					screenReader()?.speak(disableAnnouncement);
				}
			}

			return;
		}

		// For multi-step attributes
		const nextStep = prevStep >= allAttributes.length ? 0 : prevStep + 1;

		accessibilityDispatch({
			type: "SET_CURRENT_SETTINGS",
			payload: {
				...currentSettings,
				[key]: {
					currentStep: nextStep,
					currentAttribute: nextStep === 0 ? null : allAttributes[nextStep - 1],
					isMultiStep: allAttributes.length > 1,
				},
			},
		});

		if (isScreenReaderActive(currentSettings)) {
			const enableAnnouncement =
				allAttributes[nextStep - 1]?.enableAnnouncement;
			const disableAnnouncement = feature?.disableAnnouncement;
			if (allAttributes[nextStep - 1]) {
				if (key === "screenReader") {
					screenReader().screenReaderConfig = {
						rate: allAttributes[nextStep - 1]?.rate || 1,
						pitch: allAttributes[nextStep - 1]?.pitch || 1,
						lang: allAttributes[nextStep - 1]?.lang || "en-US",
						voiceURI: allAttributes[nextStep - 1]?.voiceURI || null,
					};
				}
				screenReader()?.speak(enableAnnouncement);
			} else {
				screenReader()?.speak(disableAnnouncement);
			}
		} else if (key === "screenReader") {
			const enableAnnouncement = allAttributes[0]?.enableAnnouncement;
			screenReader().screenReaderConfig = {
				rate: allAttributes[0]?.rate || 1,
				pitch: allAttributes[0]?.pitch || 1,
				lang: allAttributes[0]?.lang || "en-US",
				voiceURI: allAttributes[0]?.voiceURI || null,
			};
			screenReader()?.speak(enableAnnouncement);
		}
	};

	// Handle oversized toggle
	const handleOversizedToggle = (checked) => {
		if (!isFrontend) return;

		accessibilityDispatch({
			type: "SET_OVERSIZED",
			payload: checked,
		});
	};

	return (
		<WapCard className="wap-widget-features">
			{!attributes?.hideOversizedWidget && (
				<WapRow
					align="middle"
					className="wap-widget-features__row wap-widget-features__row--oversized"
				>
					<WapCol span={18}>
						{!attributes?.hideHeaderIcon && (
							<span className="wap-widget-features__badge">XL</span>
						)}
						{!attributes?.hideHeaderTitle && (
							<span className="wap-widget-features__label">
								{attributes?.oversizedTitle || "Oversized Widget"}
							</span>
						)}
					</WapCol>
					<WapCol span={6} style={{ textAlign: "right" }}>
						<WapSwitch checked={isOverSized} onChange={handleOversizedToggle} />
					</WapCol>
				</WapRow>
			)}

			<WapRow gutter={[10, 10]} className="wap-widget-features__grid">
				{features.map((feature) => {
					const key = feature.key;
					const setting = currentSettings?.[key] || {};
					const currentStep = setting.currentStep || 0;
					const currentAttribute = setting.currentAttribute;
					const allAttributes = feature.attributes || [];
					const isActive = currentStep > 0;
					const showSteps = currentStep > 0 && allAttributes[0]?.value !== "enable";
					const totalSteps = allAttributes.length;
					const isDummy = feature?.isDummy || false;

					return (
						<WapCol
							key={key}
							className={clsx(`wap-feature-${key}`, {
								"wap-feature--active": isActive,
							})}
							xs={24}
							sm={12}
							md={colSpan}
							lg={colSpan}
							xl={colSpan}
						>
							{/* Top active checkmark */}
							{isActive && (
								<span className="wap-widget-features-top-indicator wap-widget-features-top-indicator--active">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
										<path
											d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
											fill="currentColor"
										/>
									</svg>
								</span>
							)}

							{
								isDummy && (
									<WapBadge count={__("PRO", "website-accessibility")} color="gold" className="wap-widget-features-dummy"/>
								)
							}

							{/* Feature button */}
							<div
								className={clsx("wap-widget-features__feature-btn", {
									"wap-widget-features__feature-btn--active": isActive,
								})}
								onClick={() => handleFeatureClick(feature)}
								style={{ cursor: "pointer" }}
								aria-label={
									currentAttribute?.description || feature?.description
								}
								role="button"
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										handleFeatureClick(feature);
									}
								}}
							>
								{!attributes?.hideItemIcons && (
									<span className="wap-widget-features__feature-icon">
										{feature.icon}
									</span>
								)}
								{!attributes?.hideItemLabels && (
									<span className="wap-widget-features__feature-label">
										{feature.label}
									</span>
								)}
							</div>

							{/* Bottom step indicator */}
							{showSteps && isActive && currentAttribute && (
								<span className="wap-widget-features-bottom-indicator wap-widget-features-bottom-indicator--active">
									<span className="wap-widget-features-bottom-indicator__text">
										{currentAttribute.name}
										<span className="wap-widget-features-bottom-indicator__step">
											({currentStep}/{totalSteps})
										</span>
									</span>
								</span>
							)}
						</WapCol>
					);
				})}
			</WapRow>
		</WapCard>
	);
};

export default WidgetFeatures;
