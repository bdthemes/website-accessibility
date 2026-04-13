import { useEffect, useMemo, useState } from "@wordpress/element";
import { useSelect } from "@wordpress/data";
import clsx from "clsx";
import PreviewContent from "../../components/preview-content";
import panelItems from "../../utils/panel-items";
import { STORE_NAME } from "../store";

const PREVIEW_PROFILE_ID = "__wap_preview_profile__";

const WRAPPER_DEFAULTS = {
    width: 420,
    background: "#F1F3F8",
    border: "none",
    borderRadius: "12px",
    padding: "16px",
    maxHeight: 80,
    position: "right",
    boxShadow: "0 16px 48px rgba(15, 23, 42, 0.12)",
};

const ProfileEditorPreview = ({ formData, profileId = null }) => {
    const { PreviewButton, Icon, WapDrawer } = window?.wapComponents || {};
    const { defaultProfiles = [], features = [] } = window?.wapHelpers || {};
    const [isOpen, setIsOpen] = useState(true);

    const presets = useSelect((select) => select(STORE_NAME).getPresets(), []);

    const activeWrapper = useMemo(() => {
        if (!presets?.length) return WRAPPER_DEFAULTS;

        for (const preset of presets) {
            try {
                const content = JSON.parse(preset?.content?.raw || preset?.content || "{}");
                if (!content?.preset?.active) continue;
                const w = content?.panel?.wrapper;
                if (w) return { ...WRAPPER_DEFAULTS, ...w };
            } catch { /* skip malformed */ }
        }

        return WRAPPER_DEFAULTS;
    }, [presets]);

    const previewProfile = useMemo(() => {
        const safeId = profileId || PREVIEW_PROFILE_ID;
        return {
            id: safeId,
            title: {
                rendered: formData?.name || "Current Profile",
            },
            content: {
                raw: JSON.stringify({
                    description: formData?.description || "",
                    features: formData?.features || {},
                    icon: formData?.icon || "",
                }),
            },
        };
    }, [formData, profileId]);

    const previewSettings = useMemo(() => {
        const settings = {};
        const profileFeatures = formData?.features || {};

        for (const key in profileFeatures) {
            const value = profileFeatures[key];
            if (!value) continue;

            const feature = features.find((item) => item.key === key);
            if (!feature || feature?.isDummy) continue;

            const currentIndex = feature.attributes.findIndex((attr) => attr.value == value);
            if (currentIndex < 0) continue;

            const isMultiStep = feature.attributes.length !== 2 && feature.attributes[0]?.value !== "enable";
            if (isMultiStep) {
                settings[key] = {
                    currentStep: currentIndex + 1,
                    currentAttribute: feature.attributes[currentIndex],
                    isMultiStep: true,
                };
                continue;
            }

            const isEnabled = value === "enable";
            settings[key] = {
                currentStep: isEnabled ? 1 : 0,
                currentAttribute: isEnabled ? feature.attributes[0] : null,
                isMultiStep: false,
            };
        }

        return settings;
    }, [formData?.features, features]);

    const previewPanel = useMemo(() => {
        const clonedItems = (panelItems || []).map((item) => {
            if (item.slug !== "profiles") return { ...item };

            return {
                ...item,
                attributes: {
                    ...(item.attributes || {}),
                    profiles: [previewProfile.id],
                },
            };
        });

        return {
            wrapper: { ...activeWrapper },
            items: clonedItems,
        };
    }, [previewProfile.id, activeWrapper]);

    const allProfiles = useMemo(() => {
        return [...(defaultProfiles || []), previewProfile];
    }, [defaultProfiles, previewProfile]);

    const showcaseProfileIds = useMemo(() => {
        const defaultIds = (defaultProfiles || [])
            .map((profile) => profile?.id || profile?.ID)
            .filter(Boolean);

        return [...defaultIds, previewProfile.id];
    }, [defaultProfiles, previewProfile.id]);

    const previewPanelWithProfiles = useMemo(() => {
        return {
            ...previewPanel,
            items: (previewPanel?.items || []).map((item) => {
                if (item.slug === "profiles") {
                    return {
                        ...item,
                        attributes: {
                            ...(item.attributes || {}),
                            profiles: showcaseProfileIds,
                        },
                    };
                }

                return item;
            }),
        };
    }, [previewPanel, showcaseProfileIds]);

    const panelWidth = Number(activeWrapper.width) || 420;
    const panelPosition = activeWrapper.position || "right";

    const maxHeightVh = useMemo(() => {
        const n = Number(activeWrapper.maxHeight);
        if (!Number.isFinite(n) || n <= 0 || n > 100) return 80;
        return n;
    }, [activeWrapper.maxHeight]);

    useEffect(() => {
        const editor = document.querySelector(".wap-create-profiles, .wap-edit-profile");
        const editorContent = editor?.querySelector(".wap-profile-editor-content");
        const adminContainer = document.getElementById("website-accessibility-admin");

        if (!editor) return undefined;

        const syncOverlapState = () => {
            if (!editorContent || !isOpen) {
                editor.classList.remove("wap-profile-editor--preview-overlap");
                editor.style.setProperty("--wap-profile-preview-overlap-right-pad", "0px");
                return;
            }

            const adminRect = (adminContainer || editor).getBoundingClientRect();
            const contentRect = editorContent.getBoundingClientRect();
            const requiredDrawerSpace = Math.min(panelWidth, window.innerWidth * 0.4) + 24;
            const rightGap = Math.max(0, adminRect.right - contentRect.right);
            const extraRightPad = Math.max(0, requiredDrawerSpace - rightGap);
            const hasOverlap = extraRightPad > 0;

            editor.style.setProperty("--wap-profile-preview-overlap-right-pad", `${extraRightPad}px`);
            editor.classList.toggle("wap-profile-editor--preview-overlap", hasOverlap);
        };

        syncOverlapState();

        const resizeObserver = typeof ResizeObserver !== "undefined" && editorContent
            ? new ResizeObserver(() => syncOverlapState())
            : null;

        resizeObserver?.observe(editorContent);
        window.addEventListener("resize", syncOverlapState);

        return () => {
            editor.classList.remove("wap-profile-editor--preview-overlap");
            editor.style.removeProperty("--wap-profile-preview-overlap-right-pad");
            resizeObserver?.disconnect();
            window.removeEventListener("resize", syncOverlapState);
        };
    }, [isOpen]);

    if (!PreviewButton || !WapDrawer) return null;

    return (
        <div className="wap-profile-editor__floating-preview">
            <PreviewButton
                type="default"
                text={null}
                icon={<Icon name="accessibility1" />}
                className={clsx(
                    "wap-button-style-preset__preview-btn",
                    "bottom-right",
                    "wap-button-style-preset__preview-btn--icon",
                )}
                style={{
                    "--button-color": "#ffffff",
                    "--button-bg": "#1677ff",
                    "--button-offset-x": "30px",
                    "--button-offset-y": "30px",
                }}
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
                aria-label="Accessibility Menu Preview"
            />
            <WapDrawer
                open={isOpen}
                onClose={() => setIsOpen(false)}
                placement={panelPosition}
                className={clsx(
                    "wap-preset__preview-drawer",
                    "notranslate",
                    `wap-preset__preview-drawer--${panelPosition}`,
                    "wap-profile-editor__preview-drawer",
                )}
                rootClassName={clsx(
                    "wap-preset__preview-drawer-root",
                    "notranslate",
                    `wap-preset__preview-drawer-root--${panelPosition}`,
                    "wap-profile-editor__preview-drawer-root",
                )}
                width={panelWidth}
                styles={{ wrapper: { maxHeight: `${maxHeightVh}vh` } }}
                mask={false}
                closable={false}
                keyboard
                maskClosable={false}
            >
                <PreviewContent
                    panel={previewPanelWithProfiles}
                    allProfiles={allProfiles}
                    setIsOpen={setIsOpen}
                    isOpen={isOpen}
                    accessibilityContext={{
                        currentProfile: previewProfile,
                        currentSettings: previewSettings,
                        isOverSized: false,
                    }}
                    isEditorPreview
                />
            </WapDrawer>
        </div>
    );
};

export default ProfileEditorPreview;
