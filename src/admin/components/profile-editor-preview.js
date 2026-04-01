import { useEffect, useMemo } from "@wordpress/element";
import clsx from "clsx";
import PreviewContent from "../../components/preview-content";
import panelItems from "../../utils/panel-items";

const PREVIEW_PROFILE_ID = "__wap_preview_profile__";

const ProfileEditorPreview = ({ formData, profileId = null }) => {
    const { WapDrawer } = window?.wapComponents || {};
    const { defaultProfiles = [], features = [] } = window?.wapHelpers || {};

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
            settings[key] = {
                currentStep: isMultiStep ? currentIndex + 1 : 1,
                currentAttribute: isMultiStep ? feature.attributes[currentIndex] : feature.attributes[0],
                isMultiStep,
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
            wrapper: {
                width: 420,
                background: "#ffffff",
                border: "none",
                borderRadius: "12px",
                padding: "0",
                boxShadow: "0 16px 48px rgba(15, 23, 42, 0.12)",
            },
            items: clonedItems,
        };
    }, [previewProfile.id]);

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

    useEffect(() => {
        const editor = document.querySelector(".wap-create-profiles, .wap-edit-profile");
        const editorContent = editor?.querySelector(".wap-profile-editor-content");
        const adminContainer = document.getElementById("website-accessibility-admin");
        const panelWidth = 420;

        if (!editor) return undefined;

        const syncOverlapState = () => {
            if (!editorContent) {
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
    }, []);

    if (!WapDrawer) return null;

    return (
        <div className="wap-profile-editor__floating-preview">
            <WapDrawer
                open
                onClose={() => null}
                placement="right"
                className={clsx(
                    "wap-preset__preview-drawer",
                    "notranslate",
                    "wap-preset__preview-drawer--right",
                    "wap-profile-editor__preview-drawer",
                )}
                rootClassName={clsx(
                    "wap-preset__preview-drawer-root",
                    "notranslate",
                    "wap-preset__preview-drawer-root--right",
                    "wap-profile-editor__preview-drawer-root",
                )}
                width={420}
                mask={false}
                closable={false}
                keyboard={false}
                maskClosable={false}
            >
                <PreviewContent
                    panel={previewPanelWithProfiles}
                    allProfiles={allProfiles}
                    setIsOpen={() => null}
                    isOpen
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
