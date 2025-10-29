import {
	InfoCircleOutlined,
	CheckCircleFilled,
} from "@ant-design/icons";
import { useMemo } from "@wordpress/element";
import clsx from "clsx";
import WapRow from "./wap-row";
import WapCol from "./wap-col";
import WapCollapse from "./wap-collapse";

const FallbackIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 55 55"><path d="M55 27.5A27.5 27.5 0 1 0 9 47.8h-.1l.9.7.2.2a27.6 27.6 0 0 0 3.6 2.5l.3.2 2 1c2.1 1 4.4 1.7 6.7 2.2h.2l2.2.3h.3a27.2 27.2 0 0 0 4.4 0h.3l2.2-.3h.2c2.3-.5 4.5-1.1 6.5-2l.3-.2a27.6 27.6 0 0 0 3.8-2.2l.5-.4 1.3-1 .3-.2 1-.7H46c5.5-5.1 9-12.4 9-20.4zm-53 0a25.5 25.5 0 1 1 42.4 19l-.9-.5-8.4-4.2a2.2 2.2 0 0 1-1.3-2v-3l.6-.8c1.1-1.5 2-3.2 2.7-5.1 1.2-.6 2-1.9 2-3.3v-3.5c0-.9-.3-1.7-.9-2.4V17a8 8 0 0 0-1.8-5.8C34.5 9 31.5 8 27.5 8s-7 1-8.9 3.2a8 8 0 0 0-1.9 5.8v4.7c-.5.7-.8 1.5-.8 2.4v3.5c0 1.1.5 2.1 1.3 2.8.8 3.2 2.5 5.6 3.1 6.4v3c0 .7-.4 1.5-1.2 1.9L11.2 46l-.7.5a25.4 25.4 0 0 1-8.5-19zm40.5 20.6-1.1.8c-.2 0-.3.2-.5.3l-1.4.8-.4.2c-1.1.6-2.3 1-3.5 1.5l-2 .6-2 .4-1.9.2h-.3a24.8 24.8 0 0 1-3.8 0h-.3l-2-.2-3.9-1h-.1l-1.9-.8a26 26 0 0 1-1.7-.8l-.2-.1a25.7 25.7 0 0 1-3.3-2.1l-.1-.1 8-4.4a4.2 4.2 0 0 0 2.2-3.7v-3.6l-.2-.3s-2.2-2.6-3-6.2l-.1-.4-.4-.2c-.4-.3-.7-.8-.7-1.4v-3.5c0-.5.2-1 .5-1.3l.3-.3v-5.7a6 6 0 0 1 1.4-4.3c1.5-1.7 4-2.5 7.4-2.5 3.4 0 5.9.8 7.3 2.5 1.7 1.9 1.5 4.3 1.5 4.3v5.7l.3.3c.3.4.5.8.5 1.3v3.5c0 .7-.4 1.4-1.1 1.6l-.5.1-.2.5a18.5 18.5 0 0 1-3.2 6l-.3.3v3.7c0 1.6 1 3 2.4 3.8l8.4 4.2.2.1-.3.2z"/></svg>
)

/* -------------------- 🔹 ProfileItem Component -------------------- */
const ProfileItem = ({ profile, isActive, handleClick, attributes }) => {
	const profileIcon = profile.icon || <FallbackIcon />;
	return (
		<div
			className={clsx("wap-accessibility-profiles__item", {
				"wap-accessibility-profiles__item--active": isActive,
			})}
			onClick={() => handleClick(profile)}
			style={{ cursor: "pointer", position: "relative" }}
		>
			{!attributes?.hideBodyAvatar && (
				<span className="wap-accessibility-profiles__item-icon">
					{profileIcon}
				</span>
			)}
			{!attributes?.hideBodyProfileName && (
				<span className="wap-accessibility-profiles__item-label">
					{profile.name}
				</span>
			)}
			{isActive && (
				<div className="wap-accessibility-profiles__item-active-indicator">
					<CheckCircleFilled />
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
	attributes,
}) => {
	return (
		<WapRow gutter={[10, 10]} className="wap-accessibility-profiles__grid">
			{profiles.map((profile) => {
				const isActive = String(currentProfile?.id) === String(profile.id);
				return (
					<WapCol span={12} key={profile.id}>
						<ProfileItem
							profile={profile}
							isActive={isActive}
							handleClick={handleClick}
							attributes={attributes}
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
	const layout = attributes.layout || "collapse";
	const collapseTitle = attributes.collapseTitle || "Accessibility Profiles";
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
			if (feature) {
				const currentIndex = feature.attributes.findIndex(
					(attr) => attr.value == setting,
				);
				const isMultiStep =
					feature.attributes.length !== 2 &&
					feature.attributes[0]?.value !== "enable";
				const currentAttribute = isMultiStep
					? feature.attributes[currentIndex]
					: feature.attributes[0];
				updatedSettings[key] = {
					currentStep: isMultiStep ? currentIndex + 1 : 1,
					currentAttribute,
					isMultiStep,
				};
			}
		}

		accessibilityDispatch({
			type: "RESET_ACCESSIBILITY",
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
					type: "RESET_ACCESSIBILITY",
				});
			}
		}, 200);
	};
	const collapseItems = useMemo(
		() => [
			{
				key: "1",
				label: (
					<div className="wap-accessibility-profiles__header">
						{!attributes.hideHeaderAvatar && (
							<span className="wap-accessibility-profiles__header-icon">
								<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
									<circle
										cx="10"
										cy="10"
										r="8"
										stroke="#1a4cd8"
										strokeWidth="2"
									/>
									<circle cx="10" cy="10" r="3" fill="#1a4cd8" />
								</svg>
							</span>
						)}
						{!attributes.hideHeaderProfileName && (
							<span className="wap-accessibility-profiles__header-label">
								{collapseTitle}
							</span>
						)}
						<InfoCircleOutlined className="wap-accessibility-profiles__info-icon" />
					</div>
				),
				children: (
					<ProfilesGrid
						profiles={selectedProfiles}
						currentProfile={currentProfile}
						handleClick={handleProfileClick}
						attributes={attributes}
					/>
				),
				className: "wap-accessibility-profiles__panel",
			},
		],
		[selectedProfiles, currentProfile, attributes],
	);

	return (
		<div
			className={clsx("wap-accessibility-profiles", {
				[`wap-accessibility-profiles--${layout}`]: layout,
			})}
		>
			{layout === "collapse" ? (
				<WapCollapse
					defaultActiveKey={[]}
					bordered={false}
					expandIconPosition="end"
					className="wap-accessibility-profiles__collapse"
					items={collapseItems}
				/>
			) : (
				<div className="wap-accessibility-profiles__simple">
					<div className="wap-accessibility-profiles__header">
						{!attributes.hideHeaderAvatar && (
							<span className="wap-accessibility-profiles__header-icon">
								<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
									<circle
										cx="10"
										cy="10"
										r="8"
										stroke="#1a4cd8"
										strokeWidth="2"
									/>
									<circle cx="10" cy="10" r="3" fill="#1a4cd8" />
								</svg>
							</span>
						)}
						{!attributes.hideHeaderProfileName && (
							<span className="wap-accessibility-profiles__header-label">
								{collapseTitle}
							</span>
						)}
						<InfoCircleOutlined className="wap-accessibility-profiles__info-icon" />
					</div>
					<ProfilesGrid
						profiles={selectedProfiles}
						currentProfile={currentProfile}
						handleClick={handleProfileClick}
						attributes={attributes}
					/>
				</div>
			)}
		</div>
	);
};

export default AccessibilityProfiles;
