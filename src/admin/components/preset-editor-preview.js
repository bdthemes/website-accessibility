import clsx from "clsx";
import { useEffect, useState } from "@wordpress/element";
import { useSelect } from "@wordpress/data";
import { STORE_NAME } from "../store";
import PreviewContent from "../../components/preview-content";
import { initialState } from "../../frontend/context/reducer";

const PresetEditorPreview = () => {
    const { PreviewButton, Icon, WapDrawer } = window?.wapComponents || {};
    const [isOpen, setIsOpen] = useState(true);
    const { presetsFormData } = useSelect((select) =>
        select(STORE_NAME).getPresetsFormData(),
    );
    const allProfiles = useSelect((select) => {
        const { getProfiles } = select(STORE_NAME);
        return getProfiles(true) || [];
    }, []);

    const button = presetsFormData?.button;
    const panel = presetsFormData?.panel;
    const panelPosition = panel?.wrapper?.position || "right";
    const panelWidth = Number(panel?.wrapper?.width) || 400;

    useEffect(() => {
        const editor = document.querySelector(".wap-preset-editor");
        const editorContent = editor?.querySelector(".wap-preset-editor-content");
        const adminContainer = document.getElementById("website-accessibility-admin");
        if (!editor) return undefined;

        const syncOverlapState = () => {
            if (!editorContent || !isOpen) {
                editor.classList.remove("wap-preset-editor--preview-overlap");
                editor.style.setProperty("--wap-preview-overlap-right-pad", "0px");
                editor.style.setProperty("--wap-preview-overlap-left-pad", "0px");
                return;
            }

            const adminRect = (adminContainer || editor).getBoundingClientRect();
            const contentRect = editorContent.getBoundingClientRect();
            const requiredDrawerSpace = Math.min(panelWidth, window.innerWidth * 0.4) + 24;
            const rightGap = Math.max(0, adminRect.right - contentRect.right);
            const leftGap = Math.max(0, contentRect.left - adminRect.left);
            const extraRightPad = Math.max(0, requiredDrawerSpace - rightGap);
            const extraLeftPad = Math.max(0, requiredDrawerSpace - leftGap);

            const hasOverlap = panelPosition === "right" ? extraRightPad > 0 : extraLeftPad > 0;

            editor.style.setProperty("--wap-preview-overlap-right-pad", `${extraRightPad}px`);
            editor.style.setProperty("--wap-preview-overlap-left-pad", `${extraLeftPad}px`);

            editor.classList.toggle("wap-preset-editor--preview-overlap", hasOverlap);
        };

        editor.classList.toggle("wap-preset-editor--preview-open", isOpen);
        editor.classList.toggle(
            "wap-preset-editor--preview-right",
            isOpen && panelPosition === "right",
        );
        editor.classList.toggle(
            "wap-preset-editor--preview-left",
            isOpen && panelPosition === "left",
        );
        editor.style.setProperty("--wap-preview-drawer-width", `${panelWidth}px`);
        syncOverlapState();

        const resizeObserver = typeof ResizeObserver !== "undefined" && editorContent
            ? new ResizeObserver(() => syncOverlapState())
            : null;

        resizeObserver?.observe(editorContent);
        window.addEventListener("resize", syncOverlapState);

        return () => {
            editor.classList.remove("wap-preset-editor--preview-open");
            editor.classList.remove("wap-preset-editor--preview-right");
            editor.classList.remove("wap-preset-editor--preview-left");
            editor.classList.remove("wap-preset-editor--preview-overlap");
            editor.style.removeProperty("--wap-preview-drawer-width");
            editor.style.removeProperty("--wap-preview-overlap-right-pad");
            editor.style.removeProperty("--wap-preview-overlap-left-pad");
            resizeObserver?.disconnect();
            window.removeEventListener("resize", syncOverlapState);
        };
    }, [isOpen, panelPosition, panelWidth]);

    if (!PreviewButton || !WapDrawer || !button || !panel) return null;

    return (
        <div className="wap-preset-editor__floating-preview">
            <PreviewButton
                type="default"
                text={button?.buttonType !== "icon" ? button?.text : null}
                icon={button?.buttonType !== "text" ? <Icon name={button?.icon} /> : null}
                className={clsx(
                    "wap-button-style-preset__preview-btn",
                    button?.position || "bottom-right",
                    button?.buttonType && `wap-button-style-preset__preview-btn--${button?.buttonType}`,
                )}
                style={{
                    "--button-font-size": button?.fontSize,
                    "--button-icon-size": button?.iconSize,
                    "--button-color": button?.color,
                    "--button-bg": button?.bgColor,
                    "--button-padding": button?.padding,
                    "--button-radius": button?.borderRadius,
                    "--button-offset-x": button?.offsetX ? `${button?.offsetX}px` : "",
                    "--button-offset-y": button?.offsetY ? `${button?.offsetY}px` : "",
                }}
                onClick={() => setIsOpen(!isOpen)}
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
                    "wap-preset-editor__preview-drawer",
                )}
                rootClassName={clsx(
                    "wap-preset__preview-drawer-root",
                    "notranslate",
                    `wap-preset__preview-drawer-root--${panelPosition}`,
                    "wap-preset-editor__preview-drawer-root",
                )}
                width={panelWidth}
                mask={false}
                closable={false}
                keyboard
                maskClosable={false}
            >
                <PreviewContent
                    panel={panel}
                    allProfiles={allProfiles}
                    setIsOpen={setIsOpen}
                    isOpen={isOpen}
                    accessibilityContext={initialState}
                    accessibilityDispatch={() => null}
                    isEditorPreview
                />
            </WapDrawer>
        </div>
    );
};

export default PresetEditorPreview;
