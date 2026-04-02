import { __ } from "@wordpress/i18n";
import { useDispatch, useSelect } from "@wordpress/data";
import { STORE_NAME } from "../store";
import { useLicense } from "../context/LicenseContext";
import GetStartedPreset from "./preset-get-started";
import PresetButtonStyle from "./preset-button-style";
import PresetPanelRightSidebar from "./preset-panel-right-sidebar";
import HeaderSettings from "../settings/header-settings";
import ProfilesSettings from "../settings/profiles-settings";
import FeatureSettings from "../settings/feature-settings";
import FooterSettings from "../settings/footer-settings";

const PanelSectionTab = ({ item, component }) => {
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
                className="wap-preset-sections__collapse"
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
        {
            key: "button",
            label: __("Button", "website-accessibility"),
            children: <div data-control-category={__("Button", "website-accessibility")}><PresetButtonStyle /></div>,
        },
        {
            key: "panel",
            label: __("Panel Wrapper", "website-accessibility"),
            children: <div data-control-category={__("Panel Wrapper", "website-accessibility")}><PresetPanelRightSidebar /></div>,
        },
    ];
    return (
        <div className="wap-panel-customization-card">
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
                {sectionItems.map((item) => (
                    <PanelSectionTab
                        key={item.slug}
                        item={item}
                        component={sectionComponents[item.slug] || null}
                    />
                ))}
            </div>
        </div>
    );
};

export default PanelCustomizationPreset;
