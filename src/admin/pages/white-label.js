import { useState, useEffect } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";
import { applyWhiteLabelClientPatch } from "../../utils/websacData";
import { openWhiteLabelImagePicker } from "../../utils/whiteLabelMedia";
import SettingsItem from "../components/settings-item";

const PageHeader = ({ title, description }) => {
	const { WapCard, WapTypography } = window?.wapComponents || {};
	const { Title, Text } = WapTypography || {};

	return (
		<WapCard className="wap-settings-row wap-header-card wap-white-label-header">
			<div className="wap-header-card-content">
				<Title level={4} className="wap-header-card-title">
					{title}
				</Title>
				<Text type="secondary" className="wap-header-card-description">
					{description}
				</Text>
			</div>
		</WapCard>
	);
};

const WhiteLabelRow = ({ title, description, hint, children, rowClassName = "" }) => {
	const { WapTypography } = window?.wapComponents || {};
	const { Title, Text } = WapTypography || {};

	return (
		<div className={`wap-white-label-settings__row${rowClassName ? ` ${rowClassName}` : ""}`}>
			<div className="wap-white-label-settings__row-text">
				<Title level={5} style={{ margin: 0 }}>
					{title}
				</Title>
				{description ? <Text type="secondary">{description}</Text> : null}
				{hint ? (
					<Text type="secondary" className="wap-white-label-settings__hint">
						{hint}
					</Text>
				) : null}
			</div>
			<div className="wap-white-label-settings__control">{children}</div>
		</div>
	);
};

const ImagePickRow = ({
	label,
	description,
	hint,
	imageUrl,
	pickTitle,
	onSelect,
	onRemove,
	previewClassName,
	disabled,
}) => {
	const { WapButton, WapSpace, WapTypography } = window?.wapComponents || {};
	const { Title, Text } = WapTypography || {};

	const chooseLabel = imageUrl
		? __("Change", "website-accessibility")
		: __("Choose", "website-accessibility");

	return (
		<div className="wap-white-label-settings__row wap-white-label-settings__row--media">
			<div className="wap-white-label-settings__row-text">
				<Title level={5} style={{ margin: 0 }}>
					{label}
				</Title>
				<Text type="secondary">{description}</Text>
				{hint ? <Text type="secondary">{hint}</Text> : null}
			</div>
			<div className="wap-white-label-settings__control wap-white-label-settings__media-control">
				<div className={`wap-white-label-settings__image-preview ${previewClassName || ""}`}>
					{imageUrl ? (
						<img src={imageUrl} alt="" className="wap-white-label-settings__image-thumb" />
					) : (
						<span className="wap-white-label-settings__image-placeholder" aria-hidden="true" />
					)}
				</div>
				<WapSpace size="small" wrap>
					<WapButton
						disabled={disabled}
						onClick={() => openWhiteLabelImagePicker({ title: pickTitle, onSelect })}
					>
						{chooseLabel}
					</WapButton>
					{imageUrl ? (
						<WapButton danger onClick={onRemove} disabled={disabled}>
							{__("Remove", "website-accessibility")}
						</WapButton>
					) : null}
				</WapSpace>
			</div>
		</div>
	);
};

const WhiteLabelPage = () => {
	const { WapCard, WapButton, WapModal, WapSpin, WapMessage, WapSwitch, WapTypography, WapInput } =
		window?.wapComponents || {};
	const { Title, Text } = WapTypography || {};

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [revoking, setRevoking] = useState(false);
	const [eligible, setEligible] = useState(() => !!window.websacAdmin?.whiteLabelEligible);
	const [payload, setPayload] = useState(null);
	const [pendingHideAdmin, setPendingHideAdmin] = useState(null);

	const [form, setForm] = useState({
		enabled: false,
		hide_license: false,
		hide_admin: false,
		title: "",
		icon: "",
		icon_id: 0,
		logo: "",
		logo_id: 0,
		panel_header_icon: "",
		panel_header_icon_id: 0,
		panel_footer_icon: "",
		panel_footer_icon_id: 0,
	});

	const fetchWhiteLabel = async ({ silent = false } = {}) => {
		if (!silent) {
			setLoading(true);
		}
		try {
			const res = await apiFetch({ path: "/sigmally/v1/white-label" });
			const data = res?.data && typeof res.data === "object" ? res.data : res;
			setPayload(data);
			setEligible(data?.eligible === true);
			setForm({
				enabled: !!data?.enabled,
				hide_license: !!data?.hide_license,
				hide_admin: !!data?.hide_admin,
				title: data?.title || "",
				icon: data?.icon || "",
				icon_id: data?.icon_id || 0,
				logo: data?.logo || "",
				logo_id: data?.logo_id || 0,
				panel_header_icon: data?.panel_header_icon || "",
				panel_header_icon_id: data?.panel_header_icon_id || 0,
				panel_footer_icon: data?.panel_footer_icon || "",
				panel_footer_icon_id: data?.panel_footer_icon_id || 0,
			});
			return data;
		} catch (error) {
			console.error(error);
			WapMessage?.error?.(__("Failed to load white label settings.", "website-accessibility"));
			return null;
		} finally {
			if (!silent) {
				setLoading(false);
			}
		}
	};

	useEffect(() => {
		fetchWhiteLabel();
	}, []);

	const updateField = (key, value) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			const res = await apiFetch({
				path: "/sigmally/v1/white-label",
				method: "POST",
				data: form,
			});
			const savedSettings =
				res?.settings && typeof res.settings === "object" ? res.settings : {};
			const wl = {
				...savedSettings,
				enabled: savedSettings.enabled ?? form.enabled,
				hide_license: savedSettings.hide_license ?? form.hide_license,
				hide_admin: savedSettings.hide_admin ?? form.hide_admin,
				title: savedSettings.title ?? form.title,
				icon: savedSettings.icon ?? form.icon,
				logo: savedSettings.logo ?? form.logo,
				panel_header_icon: savedSettings.panel_header_icon ?? form.panel_header_icon,
				panel_footer_icon: savedSettings.panel_footer_icon ?? form.panel_footer_icon,
			};

			applyWhiteLabelClientPatch(wl);
			setPayload(wl);

			WapMessage?.success?.({
				content: res?.message || __("White label settings saved.", "website-accessibility"),
				style: { marginBlockStart: 20 },
			});

			const refreshed = await fetchWhiteLabel({ silent: true });
			if (refreshed && typeof refreshed === "object") {
				applyWhiteLabelClientPatch(refreshed);
			}

			const preview = res?.settings?.localhost_preview ?? wl?.localhost_preview;
			if (preview?.access_url) {
				WapMessage?.success?.({
					content: `${preview.message || __("Recovery URL", "website-accessibility")}: ${preview.access_url}`,
					style: {
						marginBlockStart: 20,
						maxWidth: "min(90vw, 560px)",
						whiteSpace: "normal",
						wordBreak: "break-all",
					},
					duration: 12,
				});
			}
			if (res?.email_sent === false && form.hide_admin && form.enabled) {
				WapMessage?.warning?.({
					content: __(
						"Recovery email could not be sent. Check localhost preview or site mail settings.",
						"website-accessibility"
					),
					style: { marginBlockStart: 20 },
				});
			}
		} catch (error) {
			WapMessage?.error?.(error?.message || __("Save failed.", "website-accessibility"));
		} finally {
			setSaving(false);
		}
	};

	const handleRevoke = async () => {
		setRevoking(true);
		try {
			const res = await apiFetch({
				path: "/sigmally/v1/white-label/revoke-token",
				method: "POST",
			});
			WapMessage?.success?.(res?.message || __("Recovery token revoked.", "website-accessibility"));
			await fetchWhiteLabel();
		} catch (error) {
			WapMessage?.error?.(error?.message || __("Revoke failed.", "website-accessibility"));
		} finally {
			setRevoking(false);
		}
	};

	const requestHideAdminChange = (checked) => {
		if (checked === form.hide_admin) {
			return;
		}
		setPendingHideAdmin({
			nextValue: checked,
			title: checked
				? __("Configure Email First", "website-accessibility")
				: __("Disable Hide Admin Menu?", "website-accessibility"),
			message: checked
				? __(
						"Enabling this sends a signed recovery link to your license email when you save. Configure site mail (SMTP) before enabling.",
						"website-accessibility"
					)
				: __(
						"The One Accessibility admin menu will remain visible after you save until you re-enable hide admin.",
						"website-accessibility"
					),
		});
	};

	if (loading && !payload) {
		return (
			<div className="wap-settings wap-white-label wap-white-label--loading">
				<WapSpin size="large" />
			</div>
		);
	}

	if (!eligible) {
		return (
			<div className="wap-settings wap-white-label">
				<PageHeader
					title={__("White Label", "website-accessibility")}
					description={__(
						"Available on Agency, Extended, Developer, or special WL Pro licenses. Install One Accessibility Pro and activate an eligible license to rebrand the plugin for client delivery.",
						"website-accessibility"
					)}
				/>
			</div>
		);
	}

	return (
		<div className="wap-settings wap-white-label">
			<PageHeader
				title={__("White Label", "website-accessibility")}
				description={__(
					"Rebrand the wp-admin menu and settings header for client delivery. Hide license and admin menus when needed.",
					"website-accessibility"
				)}
			/>

			<SettingsItem
				title={__("Enable White Label", "website-accessibility")}
				description={__(
					"Applies a custom title on the admin menu and optional icon.",
					"website-accessibility"
				)}
				checked={form.enabled}
				onChange={(v) => updateField("enabled", v)}
			/>

			{form.enabled ? (
				<WapCard className="wap-settings-row wap-white-label-settings">
					<div className="wap-white-label-settings__intro">
						<Title level={5} style={{ margin: 0 }}>
							{__("Branding & menus", "website-accessibility")}
						</Title>
						<Text type="secondary">
							{__(
								"Customize the client-facing title, icons, and which admin menus stay visible.",
								"website-accessibility"
							)}
						</Text>
					</div>

					<WhiteLabelRow
						title={__("Brand Name", "website-accessibility")}
						description={__(
							"Shown on the wp-admin menu and in the settings header.",
							"website-accessibility"
						)}
					>
						<WapInput
							className="wap-white-label-settings__input"
							value={form.title}
							onChange={(e) => updateField("title", e?.target?.value ?? "")}
							placeholder={__("e.g. Client Accessibility Hub", "website-accessibility")}
						/>
					</WhiteLabelRow>

					<ImagePickRow
						label={__("Menu Icon", "website-accessibility")}
						description={__(
							"Optional icon for the top-level wp-admin menu.",
							"website-accessibility"
						)}
						hint={__(
							"Square PNG or SVG around 20×20 works best.",
							"website-accessibility"
						)}
						previewClassName="wap-white-label-settings__image-preview--icon"
						imageUrl={form.icon}
						pickTitle={__("Select menu icon", "website-accessibility")}
						onSelect={({ url, id }) =>
							setForm((p) => ({ ...p, icon: url || "", icon_id: id || 0 }))
						}
						onRemove={() => setForm((p) => ({ ...p, icon: "", icon_id: 0 }))}
					/>

					<ImagePickRow
						label={__("Settings Header Logo", "website-accessibility")}
						description={__(
							"Optional logo in the admin settings header.",
							"website-accessibility"
						)}
						previewClassName="wap-white-label-settings__image-preview--icon"
						imageUrl={form.logo}
						pickTitle={__("Select settings header logo", "website-accessibility")}
						onSelect={({ url, id }) =>
							setForm((p) => ({ ...p, logo: url || "", logo_id: id || 0 }))
						}
						onRemove={() => setForm((p) => ({ ...p, logo: "", logo_id: 0 }))}
					/>

					<ImagePickRow
						label={__("Panel Header Icon", "website-accessibility")}
						description={__(
							"Replaces the default icon in the accessibility panel header.",
							"website-accessibility"
						)}
						hint={__(
							"PNG or SVG · Recommended: square, around 28×28px",
							"website-accessibility"
						)}
						previewClassName="wap-white-label-settings__image-preview--icon"
						imageUrl={form.panel_header_icon}
						pickTitle={__("Select panel header icon", "website-accessibility")}
						onSelect={({ url, id }) =>
							setForm((p) => ({
								...p,
								panel_header_icon: url || "",
								panel_header_icon_id: id || 0,
							}))
						}
						onRemove={() =>
							setForm((p) => ({
								...p,
								panel_header_icon: "",
								panel_header_icon_id: 0,
							}))
						}
					/>

					<ImagePickRow
						label={__("Panel Footer Icon", "website-accessibility")}
						description={__(
							"Replaces the default icon beside “Powered by” in the panel footer.",
							"website-accessibility"
						)}
						hint={__(
							"PNG or SVG · Recommended: square, around 20×20px",
							"website-accessibility"
						)}
						previewClassName="wap-white-label-settings__image-preview--icon"
						imageUrl={form.panel_footer_icon}
						pickTitle={__("Select panel footer icon", "website-accessibility")}
						onSelect={({ url, id }) =>
							setForm((p) => ({
								...p,
								panel_footer_icon: url || "",
								panel_footer_icon_id: id || 0,
							}))
						}
						onRemove={() =>
							setForm((p) => ({
								...p,
								panel_footer_icon: "",
								panel_footer_icon_id: 0,
							}))
						}
					/>

					<WhiteLabelRow
						title={__("Hide License Menu", "website-accessibility")}
						description={__(
							"Removes the License entry from the plugin sidebar.",
							"website-accessibility"
						)}
					>
						<WapSwitch checked={form.hide_license} onChange={(v) => updateField("hide_license", v)} />
					</WhiteLabelRow>

					<WhiteLabelRow
						title={__("Hide Admin Menu", "website-accessibility")}
						description={__(
							"Removes the entire One Accessibility menu from wp-admin until you open the emailed recovery link.",
							"website-accessibility"
						)}
					>
						<WapSwitch checked={form.hide_admin} onChange={requestHideAdminChange} />
					</WhiteLabelRow>

					{form.hide_admin ? (
						<div className="wap-white-label-settings__row wap-white-label-settings__row--notice">
							<p className="wap-white-label-settings__notice">
								{__(
									"When you save with hide admin enabled, an email is sent to your license address with a signed recovery URL.",
									"website-accessibility"
								)}
							</p>
						</div>
					) : null}

					{payload?.has_access_token ? (
						<WhiteLabelRow
							title={__("Recovery access", "website-accessibility")}
							description={__(
								"Revoke the signed recovery link sent to your license email.",
								"website-accessibility"
							)}
							rowClassName="wap-white-label-settings__row--revoke"
						>
							<WapButton onClick={handleRevoke} loading={revoking}>
								{__("Revoke recovery token", "website-accessibility")}
							</WapButton>
						</WhiteLabelRow>
					) : null}

					<div className="wap-white-label-settings__row wap-white-label-settings__row--actions">
						<div className="wap-white-label-settings__row-text">
							<Title level={5} style={{ margin: 0 }}>
								{__("Save settings", "website-accessibility")}
							</Title>
							<Text type="secondary">
								{__(
									"Apply white label branding and menu visibility options.",
									"website-accessibility"
								)}
							</Text>
						</div>
						<div className="wap-white-label-settings__actions">
							<WapButton type="primary" onClick={handleSave} loading={saving}>
								{__("Save white label", "website-accessibility")}
							</WapButton>
						</div>
					</div>
				</WapCard>
			) : (
				<div className="wap-white-label__save-actions">
					<WapButton type="primary" onClick={handleSave} loading={saving}>
						{__("Save white label", "website-accessibility")}
					</WapButton>
				</div>
			)}

			<WapModal
				open={!!pendingHideAdmin}
				title={pendingHideAdmin?.title}
				onOk={() => {
					if (pendingHideAdmin) {
						updateField("hide_admin", pendingHideAdmin.nextValue);
					}
					setPendingHideAdmin(null);
				}}
				onCancel={() => setPendingHideAdmin(null)}
				okText={
					pendingHideAdmin?.nextValue
						? __("Hide Admin Menu", "website-accessibility")
						: __("Yes, Disable", "website-accessibility")
				}
				cancelText={__("Cancel", "website-accessibility")}
			>
				<p>{pendingHideAdmin?.message}</p>
			</WapModal>
		</div>
	);
};

export default WhiteLabelPage;
