import { useState, useEffect } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";
import { applyWhiteLabelClientPatch } from "../../utils/websacData";

const ImagePickRow = ({ label, description, hint, imageUrl, onPick, onRemove, previewClassName }) => {
  const { WapButton, WapTypography } = window?.wapComponents || {};
  const { Text } = WapTypography || {};

  return (
    <div className="wap-white-label__image-row">
      <div className="wap-white-label__image-preview-wrap">
        <div className={`wap-white-label__image-preview ${previewClassName || ""}`}>
          {imageUrl ? (
            <img src={imageUrl} alt="" className="wap-white-label__image-thumb" />
          ) : (
            <span className="wap-white-label__image-placeholder" aria-hidden="true" />
          )}
        </div>
        <div className="wap-white-label__image-text">
          <span className="wap-white-label__image-label">{label}</span>
          <Text type="secondary" className="wap-white-label__image-desc">
            {description}
          </Text>
          {hint ? (
            <Text type="secondary" className="wap-white-label__image-hint">
              {hint}
            </Text>
          ) : null}
        </div>
      </div>
      <div className="wap-white-label__image-actions">
        <WapButton onClick={onPick}>{imageUrl ? __("Change", "website-accessibility") : __("Choose", "website-accessibility")}</WapButton>
        {imageUrl ? (
          <WapButton danger onClick={onRemove}>
            {__("Remove", "website-accessibility")}
          </WapButton>
        ) : null}
      </div>
    </div>
  );
};

function openWpImagePicker({ title, onSelect }) {
  const { WapMessage } = window?.wapComponents || {};
  if (typeof window === "undefined" || !window.wp?.media) {
    if (WapMessage?.error) {
      WapMessage.error(__("WordPress media library is not available", "website-accessibility"));
    }
    return;
  }

  const frame = window.wp.media({
    title,
    button: { text: __("Use image", "website-accessibility") },
    library: { type: "image" },
    multiple: false,
  });

  frame.off("select");
  frame.on("select", () => {
    const attachment = frame.state().get("selection").first();
    if (!attachment) {
      return;
    }
    onSelect(attachment.toJSON());
  });

  frame.open();
}

const WhiteLabelPage = () => {
  const { WapCard, WapButton, WapSwitch, WapModal, WapSpin, WapTypography, WapMessage, WapSpace } =
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
          style: { marginBlockStart: 20, maxWidth: "min(90vw, 560px)", whiteSpace: "normal", wordBreak: "break-all" },
          duration: 12,
        });
      }
      if (res?.email_sent === false && form.hide_admin && form.enabled) {
        WapMessage?.warning?.({
          content: __("Recovery email could not be sent. Check localhost preview or site mail settings.", "website-accessibility"),
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

  const brandingDisabled = !form.enabled;

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
        <WapCard className="wap-settings-row wap-header-card">
          <Title level={4}>{__("White Label", "website-accessibility")}</Title>
          <Text type="secondary">
            {__(
              "Available on Agency, Extended, Developer, or special WL Pro licenses. Install One Accessibility Pro and activate an eligible license to rebrand the plugin for client delivery.",
              "website-accessibility"
            )}
          </Text>
        </WapCard>
      </div>
    );
  }

  return (
    <div className="wap-settings wap-white-label">
      <WapCard className="wap-settings-row wap-header-card">
        <Title level={4}>{__("White Label", "website-accessibility")}</Title>
        <Text type="secondary">
          {__(
            "Rebrand the wp-admin menu and settings header for client delivery. Hide license and admin menus when needed.",
            "website-accessibility"
          )}
        </Text>
      </WapCard>

      <WapCard className="wap-settings-row">
        <WapSpace direction="vertical" size="middle" style={{ width: "100%" }}>
          <WapSpace align="center" style={{ width: "100%", justifyContent: "space-between" }}>
            <WapSpace direction="vertical" size={0}>
              <Title level={5} style={{ margin: 0 }}>
                {__("Enable White Label", "website-accessibility")}
              </Title>
              <Text type="secondary">
                {__("Applies a custom title on the admin menu and optional icon.", "website-accessibility")}
              </Text>
            </WapSpace>
            <WapSwitch checked={form.enabled} onChange={(v) => updateField("enabled", v)} />
          </WapSpace>

          <div className={brandingDisabled ? "wap-white-label--disabled" : ""}>
            <WapSpace align="center" style={{ width: "100%", justifyContent: "space-between" }} wrap>
              <WapSpace direction="vertical" size={0}>
                <Text strong>{__("Client Facing Title", "website-accessibility")}</Text>
                <Text type="secondary">
                  {__("Shown on the wp-admin menu and in this settings header.", "website-accessibility")}
                </Text>
              </WapSpace>
              <input
                type="text"
                className="wap-white-label__text-input"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder={__("e.g. Client Accessibility Hub", "website-accessibility")}
              />
            </WapSpace>

            <ImagePickRow
              label={__("Menu Icon", "website-accessibility")}
              description={__("Optional icon for the top-level wp-admin menu.", "website-accessibility")}
              hint={__("Square PNG or SVG around 20×20 works best.", "website-accessibility")}
              previewClassName="wap-white-label__image-preview--icon"
              imageUrl={form.icon}
              onPick={() =>
                openWpImagePicker({
                  title: __("Select menu icon", "website-accessibility"),
                  onSelect: (att) =>
                    setForm((p) => ({ ...p, icon: att.url || "", icon_id: att.id || 0 })),
                })
              }
              onRemove={() => setForm((p) => ({ ...p, icon: "", icon_id: 0 }))}
            />

            <ImagePickRow
              label={__("Settings Header Logo", "website-accessibility")}
              description={__("Optional logo in the admin settings header.", "website-accessibility")}
              previewClassName="wap-white-label__image-preview--logo"
              imageUrl={form.logo}
              onPick={() =>
                openWpImagePicker({
                  title: __("Select settings header logo", "website-accessibility"),
                  onSelect: (att) =>
                    setForm((p) => ({ ...p, logo: att.url || "", logo_id: att.id || 0 })),
                })
              }
              onRemove={() => setForm((p) => ({ ...p, logo: "", logo_id: 0 }))}
            />
          </div>
        </WapSpace>
      </WapCard>

      <WapCard className="wap-settings-row">
        <Title level={5} style={{ marginTop: 0 }}>
          {__("Visibility & Access", "website-accessibility")}
        </Title>
        <div className={brandingDisabled ? "wap-white-label--disabled" : ""}>
          <WapSpace direction="vertical" size="large" style={{ width: "100%" }}>
            <WapSpace align="center" style={{ width: "100%", justifyContent: "space-between" }}>
              <WapSpace direction="vertical" size={0}>
                <Text strong>{__("Hide License Menu", "website-accessibility")}</Text>
                <Text type="secondary">
                  {__("Removes the License entry from the plugin sidebar.", "website-accessibility")}
                </Text>
              </WapSpace>
              <WapSwitch checked={form.hide_license} onChange={(v) => updateField("hide_license", v)} />
            </WapSpace>

            <WapSpace align="center" style={{ width: "100%", justifyContent: "space-between" }}>
              <WapSpace direction="vertical" size={0}>
                <Text strong>{__("Hide Admin Menu", "website-accessibility")}</Text>
                <Text type="secondary">
                  {__(
                    "Removes the entire One Accessibility menu from wp-admin until you open the emailed recovery link.",
                    "website-accessibility"
                  )}
                </Text>
              </WapSpace>
              <WapSwitch checked={form.hide_admin} onChange={requestHideAdminChange} />
            </WapSpace>

            {form.hide_admin && form.enabled ? (
              <div className="wap-white-label__notice">
                {__(
                  "When you save with hide admin enabled, an email is sent to your license address with a signed recovery URL.",
                  "website-accessibility"
                )}
              </div>
            ) : null}

            {payload?.has_access_token ? (
              <WapButton onClick={handleRevoke} loading={revoking}>
                {__("Revoke recovery token", "website-accessibility")}
              </WapButton>
            ) : null}
          </WapSpace>
        </div>
      </WapCard>

      <div className="wap-white-label__save-row">
        <WapButton type="primary" onClick={handleSave} loading={saving}>
          {__("Save white label", "website-accessibility")}
        </WapButton>
      </div>

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
        okText={pendingHideAdmin?.nextValue ? __("Hide Admin Menu", "website-accessibility") : __("Yes, Disable", "website-accessibility")}
        cancelText={__("Cancel", "website-accessibility")}
      >
        <p>{pendingHideAdmin?.message}</p>
      </WapModal>
    </div>
  );
};

export default WhiteLabelPage;
