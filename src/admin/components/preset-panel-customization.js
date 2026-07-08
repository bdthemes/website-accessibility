import { __ } from "@wordpress/i18n";
import { useDispatch, useSelect } from "@wordpress/data";
import { STORE_NAME } from "../store";
import { useLicense } from "../context/LicenseContext";
import GetStartedPreset from "./preset-get-started";
import PresetButtonStyle from "./preset-button-style";
import PresetPanelRightSidebar from "./preset-panel-right-sidebar";
import PresetPanelProfilesFeaturesSidebar from "./preset-panel-profiles-features-sidebar";
import HeaderSettings from "../settings/header-settings";
import ProfilesSettings from "../settings/profiles-settings";
import FeatureSettings from "../settings/feature-settings";
import FooterSettings from "../settings/footer-settings";

const PanelSectionTab = ({ item, component, hideExpandIcon }) => {
    const { WapCollapse, WapSwitch } = window?.wapComponents;
    const { presetsFormData } = useSelect((select) =>
        select(STORE_NAME).getPresetsFormData(),
    );
    const { setPresetsFormData } = useDispatch(STORE_NAME);
    const { isProActive } = useLicense();

    const handleVisibilityToggle = (checked) => {
        const updatedItems = (presetsFormData?.panel?.items || []).map((currentItem) =>
            currentItem.slug === item.slug ? { ...currentItem, active: checked } : currentItem,
        );

        setPresetsFormData({
            ...presetsFormData,
            panel: {
                ...presetsFormData.panel,
                items: updatedItems,
            },
        });
    };

    const isDisabled = item.active === false;

    return (
        <div className="wap-preset-sections__content">
            <WapCollapse
                activeKey={isDisabled ? [] : ["settings"]}
                bordered={false}
                ghost
                className={
                    hideExpandIcon
                        ? "wap-preset-sections__collapse wap-preset-sections__collapse--no-expand-icon"
                        : "wap-preset-sections__collapse"
                }
                expandIcon={hideExpandIcon ? () => null : undefined}
                items={[
                    {
                        key: "settings",
                        label: (
                            <div className={`wap-preset-sections__collapse-label${isDisabled ? " wap-preset-sections__collapse-label--disabled" : ""}`}>
                                <span>{item.title}</span>
                                {item?.isPro && !isProActive ? (
                                    <span className="wap-preset-sections__pro">
                                        {__("PRO", "website-accessibility")}
                                    </span>
                                ) : (
                                    <WapSwitch
                                        checked={!isDisabled}
                                        onChange={handleVisibilityToggle}
                                        onClick={(event) => event.stopPropagation()}
                                    />
                                )}
                            </div>
                        ),
                        children: <div data-control-category={item.title}>{component}</div>,
                        collapsible: item?.isPro && !isProActive ? "disabled" : undefined,
                    },
                ]}
            />
        </div>
    );
};

const PanelCustomizationPreset = () => {
    const { WapCollapse, WapSwitch } = window?.wapComponents;
    const { presetsFormData } = useSelect((select) =>
        select(STORE_NAME).getPresetsFormData(),
    );
    const { setPresetsFormData } = useDispatch(STORE_NAME);

    const sectionItems = (presetsFormData?.panel?.items || []).filter(
        (item) => item.slug !== "language",
    );

    // Re-order sections:
    // - Header, then panel layout only
    // - Profiles & Features as their own sections (unchanged structure)
    // - profiles/features = Groups/Tiles styling only, placed directly above Button
    const headerItem = sectionItems.find((item) => item.slug === "header");
    const featuresItem = sectionItems.find((item) => item.slug === "features");
    const footerItem = sectionItems.find((item) => item.slug === "footer");
    const otherSectionItems = sectionItems.filter(
        (item) => !["header", "features", "footer"].includes(item.slug),
    );

    const sectionComponents = {
        header: <HeaderSettings />,
        profiles: <ProfilesSettings />,
        features: <FeatureSettings />,
        footer: <FooterSettings />,
    };

    const topLevelCollapseItems = [
        {
            key: "preset",
            label: (
                <div className="wap-preset-collapse-header">
                    <span>{__("Preset", "website-accessibility")}</span>
                    <div
                        className="wap-preset-collapse-header__switch"
                        onClick={(event) => event.stopPropagation()}
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <WapSwitch
                            checked={!!presetsFormData?.preset?.active}
                            onChange={(checked) =>
                                setPresetsFormData({
                                    ...presetsFormData,
                                    preset: {
                                        ...presetsFormData?.preset,
                                        active: checked,
                                    },
                                })
                            }
                        />
                    </div>
                </div>
            ),
            children: <div data-control-category={__("Preset", "website-accessibility")}><GetStartedPreset /></div>
        },
    ];
    return (
        <div className="wap-panel-customization-card" data-tour="wap-tour-preset-editor">
            <div className="wap-panel-customization">
                {topLevelCollapseItems.map((collapseItem) => (
                    <WapCollapse
                        key={collapseItem.key}
                        defaultActiveKey={[collapseItem.key]}
                        bordered={false}
                        className="wap-panel-customization__collapse"
                        items={[collapseItem]}
                    />
                ))}

                {/* Header should be above Panel Wrapper */}
                {headerItem && (
                    <PanelSectionTab
                        key={headerItem.slug}
                        item={headerItem}
                        component={sectionComponents[headerItem.slug] || null}
                        hideExpandIcon
                    />
                )}

                {/* Panel: layout only (size, position, main background) */}
                <WapCollapse
                    style={{ marginTop: "20px" }}
                    key="panel"
                    defaultActiveKey={["panel"]}
                    bordered={false}
                    className="wap-panel-customization__collapse"
                    items={[
                        {
                            key: "panel",
                            label: __("Panel", "website-accessibility"),
                            children: <PresetPanelRightSidebar />,
                        },
                    ]}
                />

                {/* Profiles and any other middle items (not features/footer) */}
                {otherSectionItems.map((item) => (
                    <PanelSectionTab
                        key={item.slug}
                        item={item}
                        component={sectionComponents[item.slug] || null}
                        hideExpandIcon={item.slug === "profiles"}
                    />
                ))}

                {/* Features */}
                {featuresItem && (
                    <PanelSectionTab
                        key={featuresItem.slug}
                        item={featuresItem}
                        component={sectionComponents[featuresItem.slug] || null}
                        hideExpandIcon
                    />
                )}

                {/* Groups/Tiles styling only — directly above Button */}
                <WapCollapse
                    style={{ marginTop: 20 }}
                    key="profiles-features-style"
                    defaultActiveKey={["profiles-features-style"]}
                    bordered={false}
                    className="wap-panel-customization__collapse"
                    items={[
                        {
                            key: "profiles-features-style",
                            label: __("Profiles & Features Styling", "website-accessibility"),
                            children: (
                                <div data-control-category={__("Profiles/Features", "website-accessibility")}>
                                    <PresetPanelProfilesFeaturesSidebar />
                                </div>
                            ),
                        },
                    ]}
                />

                {/* Button */}
                <WapCollapse style={{ marginTop: 20 }}
                    key="button"
                    defaultActiveKey={["button"]}
                    bordered={false}
                    className="wap-panel-customization__collapse"
                    items={[
                        {
                            key: "button",
                            label: __("Button", "website-accessibility"),
                            children: <PresetButtonStyle />,
                        },
                    ]}
                />

                {/* Footer */}
                {footerItem && (
                    <PanelSectionTab
                        key={footerItem.slug}
                        item={footerItem}
                        component={sectionComponents[footerItem.slug] || null}
                        hideExpandIcon
                    />
                )}
            </div>
        </div>
    );
};

export default PanelCustomizationPreset;
