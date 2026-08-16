import { useMemo, useRef, useState } from "@wordpress/element";
import clsx from "clsx";
import { __ } from "@wordpress/i18n";
import { normalizeItemLayout } from "../utils/item-layout";

/* -------------------- 🔹 ProfileItem Component -------------------- */
const ProfileItem = ({ profile, isActive, handleClick, hideItemIcons, hideItemLabels, layout }) => {
	const labelWrapRef = useRef(null);
	const [labelShift, setLabelShift] = useState("0px");

	const measureLabelOverflow = () => {
		const wrap = labelWrapRef.current;
		if (!wrap) return;
		const inner = wrap.querySelector(".wap-accessibility-profiles__item-label-text");
		if (!inner) return;
		const extra = inner.scrollWidth - wrap.clientWidth;
		setLabelShift(extra > 0 ? `${extra}px` : "0px");
	};

	const clearLabelOverflow = () => setLabelShift("0px");

	return (
		<div
			className={clsx("wap-accessibility-profiles__item", `wap-accessibility-profiles__item--${layout}`, {
				"wap-accessibility-profiles__item--active": isActive,
			})}
			onClick={() => handleClick(profile)}
			onMouseEnter={measureLabelOverflow}
			onMouseLeave={clearLabelOverflow}
			style={{ cursor: "pointer", position: "relative" }}
		>
			{!hideItemIcons && profile.icon && (
				<span className="wap-accessibility-profiles__item-icon">
					{profile.icon}
				</span>
			)}
			{!hideItemLabels && (
				<div
					ref={labelWrapRef}
					className={clsx("wap-accessibility-profiles__item-label", `wap-accessibility-profiles__item-label--${layout}`, {
						"wap-accessibility-profiles__item-label--can-scroll": labelShift !== "0px",
					})}
					style={{ "--wap-label-shift": labelShift }}
				>
					<span className="wap-accessibility-profiles__item-label-text" title={profile.name}>
						{profile.name}
					</span>
				</div>
			)}
		</div>
	);
};

/* -------------------- 🔹 ProfilesGrid Component -------------------- */
const ProfilesGrid = ({
	profiles,
	currentProfile,
	handleClick,
	hideItemIcons,
	hideItemLabels,
	layout,
	profileColumnWidth,
}) => {
	const { WapRow, WapCol } = window?.wapComponents;
	return (
		<WapRow gutter={[10, 10]} className="wap-accessibility-profiles__grid">
			{profiles.map((profile) => {
				const isActive = String(currentProfile?.id) === String(profile.id);
				return (
					<WapCol
						key={profile.id}
						xs={24}
						sm={12}
						md={24}
						lg={24}
						xl={24}
						flex={`0 0 ${profileColumnWidth}`}
						style={{ maxWidth: profileColumnWidth }}
					>
						<ProfileItem
							profile={profile}
							isActive={isActive}
							handleClick={handleClick}
							hideItemIcons={hideItemIcons}
							hideItemLabels={hideItemLabels}
							layout={layout}
						/>
					</WapCol>
				);
			})}
		</WapRow>
	);
};

/* -------------------- 🔹 AccessibilityProfiles (Main) -------------------- */
const AccessibilityProfiles = ({
	value,
	allProfiles,
	accessibilityContext,
	accessibilityDispatch,
}) => {
	const features = window.wapHelpers?.features || [];
	const { items } = value;
	const profileItem = items.find((item) => item.slug === "profiles");
	const attributes = profileItem?.attributes || {};
	const profiles = attributes.profiles || [];
	const hideItemIcons = attributes?.hideItemIcons ?? attributes?.hideBodyAvatar ?? false;
	const hideItemLabels = attributes?.hideItemLabels ?? attributes?.hideBodyProfileName ?? false;
	const layout = normalizeItemLayout(attributes?.layout, "inline");
	const profileColumns = Math.min(6, Math.max(1, Number(attributes?.columns) || 2));
	const profileColumnWidth = `${100 / profileColumns}%`;
	const collapseTitle = __("Accessibility Profiles", "website-accessibility");
	const { isScreenReaderActive = (() => false), screenReader = () => null } = window?.wapHelpers;

	const isFrontend = !!accessibilityContext && !!accessibilityDispatch;
	const { currentProfile, currentSettings } = accessibilityContext || {};
	const reader = isScreenReaderActive(currentSettings) ? screenReader() : null;

	const processedProfiles = useMemo(() => {
		if (!allProfiles || allProfiles.length === 0) return [];

		return allProfiles.map((profile) => {
			let content = profile?.content?.raw || profile?.post_content || "";
			if (content) {
				try {
					content = JSON.parse(content);
				} catch (e) {
					content = {};
				}
			}

			let iconElement = null;
			if (profile.icon) {
				iconElement = profile.icon;
			} else if (
				content?.icon &&
				typeof content.icon === "string" &&
				content.icon.trim()
			) {
				iconElement = (
					<span
						dangerouslySetInnerHTML={{ __html: content.icon }}
						style={{
							display: "inline-flex",
							width: "20px",
							height: "20px",
						}}
					/>
				);
			} else {
				iconElement = null;
			}

			return {
				id: profile?.id || profile?.ID,
				name: profile?.title?.rendered || profile?.title || profile?.post_title,
				icon: iconElement,
				settings: content?.features || profile?.features || {},
			};
		});
	}, [allProfiles]);

	const selectedProfiles = useMemo(() => {
		return processedProfiles.filter((profile) => profiles.includes(profile.id));
	}, [processedProfiles, profiles]);

	const handleProfileClick = (profile) => {
		if (!isFrontend) return;

		const profileSettings = profile.settings || {};
		let updatedSettings = {};
		for (const key in profileSettings) {
			const setting = profileSettings[key];
			const feature = features.find((f) => f.key === key);
			if (feature && !feature?.isDummy) {
				const currentIndex = feature.attributes.findIndex(
					(attr) => attr.value == setting,
				);
				const isMultiStep =
					feature.attributes.length !== 2 &&
					feature.attributes[0]?.value !== "enable";

				if (isMultiStep) {
					updatedSettings[key] = {
						currentStep: currentIndex + 1,
						currentAttribute: feature.attributes[currentIndex],
						isMultiStep: true,
					};
					continue;
				}

				const isEnabled = setting === "enable";
				updatedSettings[key] = {
					currentStep: isEnabled ? 1 : 0,
					currentAttribute: isEnabled ? feature.attributes[0] : null,
					isMultiStep: false,
				};
			}
		}

		accessibilityDispatch({
			type: "RESET_PROFILE_SETTINGS",
		});

		setTimeout(() => {
			accessibilityDispatch({
				type: "SET_CURRENT_PROFILE",
				payload: currentProfile?.id === profile.id ? null : profile,
			});

			if (currentProfile?.id !== profile.id) {
				reader?.speak(`Switched to ${profile.name} accessibility profile.`);
				accessibilityDispatch({
					type: "SET_CURRENT_SETTINGS",
					payload: updatedSettings,
				});
			} else {
				reader?.speak(`Accessibility profile reset.`);
				accessibilityDispatch({
					type: "RESET_PROFILE_SETTINGS",
				});
			}
		}, 200);
	};

	return (
		<div className='wap-accessibility-profiles'>
			<div className="wap-accessibility-profiles__header">
				{!attributes.hideHeaderProfileName && (
					<span className="wap-accessibility-profiles__header-label">
						{collapseTitle}
					</span>
				)}
			</div>
			<ProfilesGrid
				profiles={selectedProfiles}
				currentProfile={currentProfile}
				handleClick={handleProfileClick}
				hideItemIcons={hideItemIcons}
				hideItemLabels={hideItemLabels}
				layout={layout}
				profileColumnWidth={profileColumnWidth}
			/>
		</div>
	);
};

export default AccessibilityProfiles;
