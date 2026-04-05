import clsx from "clsx";
import { useMemo } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { InfoCircleOutlined } from "@ant-design/icons";
import { getFeatureCategories, getFeatureStateIndex } from "../utils/feature-categories";

const WidgetFeatures = ({
	value,
	accessibilityContext,
	accessibilityDispatch,
	onFeatureInteraction = () => {},
}) => {
	const { WapCard, WapRow, WapCol, WapBadge, WapTooltip, WapNotification } = window?.wapComponents;
	const isProActive = window?.websacPro?.isProActive || false;
	const { items } = value;
	const featureItem = items.find((item) => item.slug === "features");
	const attributes = featureItem?.attributes || {};
	const layout = isProActive && attributes?.layout === "inline" ? "inline" : "default";
	const tooltipPosition = isProActive ? (attributes?.tooltipPosition || "topLeft") : "topLeft";
	const featureColumns = Math.min(6, Math.max(1, Number(attributes?.columns) || 2));
	const featureColumnWidth = `${100 / featureColumns}%`;
	// Check if we're in frontend context
	const isFrontend = !!accessibilityContext && !!accessibilityDispatch;
	const { currentSettings } = accessibilityContext || {};

	const features = useMemo(() => {
		let allFeatures = window.wapHelpers?.features || [];
		if (isFrontend) {
			allFeatures = allFeatures.filter((feature) => {
				if (!feature?.isDummy) return feature;
			})
		}

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
		const { isScreenReaderActive = (() => false), screenReader = () => null } = window?.wapHelpers;
		const allAttributes = feature.attributes || [];
		const key = feature?.key;
		const notify = (content) => {
			const text = content || `${feature?.label || __("Feature", "website-accessibility")} ${__("updated", "website-accessibility")}`;
			WapNotification?.open?.({
				key: "wap-feature-notification",
				message: text,
				placement: "topLeft",
				duration: 1.8,
			});
		};

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

			if (isScreenReaderActive(currentSettings)) {
				const enableAnnouncement = currentAttribute?.enableAnnouncement;
				const disableAnnouncement = feature?.disableAnnouncement;
				notify(currentAttribute ? enableAnnouncement : disableAnnouncement);
				if (currentAttribute) {
					screenReader()?.speak(enableAnnouncement);
				} else {
					screenReader()?.speak(disableAnnouncement);
				}
			} else {
				notify(currentAttribute?.enableAnnouncement || feature?.disableAnnouncement);
			}

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

		if (isScreenReaderActive(currentSettings)) {
			const enableAnnouncement =
				allAttributes[nextStep - 1]?.enableAnnouncement;
			const disableAnnouncement = feature?.disableAnnouncement;
			notify(allAttributes[nextStep - 1] ? enableAnnouncement : disableAnnouncement);
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
			notify(enableAnnouncement);
			screenReader().screenReaderConfig = {
				rate: allAttributes[0]?.rate || 1,
				pitch: allAttributes[0]?.pitch || 1,
				lang: allAttributes[0]?.lang || "en-US",
				voiceURI: allAttributes[0]?.voiceURI || null,
			};
			screenReader()?.speak(enableAnnouncement);
		} else {
			const enableAnnouncement = allAttributes[nextStep - 1]?.enableAnnouncement;
			const disableAnnouncement = feature?.disableAnnouncement;
			notify(allAttributes[nextStep - 1] ? enableAnnouncement : disableAnnouncement);
		}
	};

	return (
		<WapCard className="wap-widget-features">
			{categorizedFeatures.map((category) => (
				<div className="wap-widget-features__category" key={category.slug}>
					<div className="wap-widget-features__category-header">
						<span className="wap-widget-features__category-title">{category.title}</span>
					</div>
					<WapRow gutter={[10, 10]} className="wap-widget-features__grid">
						{category.features.map((feature) => {
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
									{isDummy && !isProActive && (
										<WapBadge count={__("PRO", "website-accessibility")} color="gold" className="wap-widget-features-dummy" />
									)}

									{feature?.description && (
										<WapTooltip
											title={feature?.description}
											placement="top"
											autoAdjustOverflow={false}
											getPopupContainer={() => document.body}
											mouseEnterDelay={0}
											styles={{
												root: { zIndex: 9999999999 }
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
												{
													(!isActive || !showSteps)  && feature?.label
												}
												{
													isActive && currentAttribute && showSteps && currentAttribute?.name
												}
											</span>
										)}
									</div>

									{showSteps && isActive && currentAttribute && (
										<span className="wap-widget-features-bottom-indicator wap-widget-features-bottom-indicator--active">
											<span className="wap-widget-features-bottom-indicator__step">
												{
													[
														...Array(totalSteps).keys(),
													].map((step) => {
														return (
															<span
																key={step}
																className={clsx(
																	"wap-widget-features-bottom-indicator__step-item",
																	{
																		"wap-widget-features-bottom-indicator__step-item--active":
																			(step + 1) === currentStep,
																	}
																)}
															/>
														);
													})
												}
											</span>
										</span>
									)}
								</WapCol>
							);
						})}
					</WapRow>
				</div>
			))}
		</WapCard>
	);
};

export default WidgetFeatures;
