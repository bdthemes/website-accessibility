import { __ } from "@wordpress/i18n";
import { useDispatch, useSelect } from "@wordpress/data";
import { STORE_NAME } from "../store";
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
    const isProActive = window?.websacPro?.isProActive || false;

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
                        children: component,
                        collapsible: item?.isPro && !isProActive ? "disabled" : undefined,
                    },
                ]}
            />
        </div>
    );
};

const PanelCustomizationPreset = () => {
    const { WapCard, WapTabs } = window?.wapComponents;
    const isProActive = window?.websacPro?.isProActive || false;
    const { presetsFormData } = useSelect((select) =>
        select(STORE_NAME).getPresetsFormData(),
    );

    const sectionItems = (presetsFormData?.panel?.items || []).filter(
        (item) => item.slug !== "language",
    );

    const sectionComponents = {
        header: <HeaderSettings />,
        profiles: <ProfilesSettings />,
        features: <FeatureSettings />,
        footer: <FooterSettings />,
    };

    const tabItems = [
        {
            key: "button",
            label: __("Button", "website-accessibility"),
            children: <PresetButtonStyle />,
        },
        {
            key: "panel",
            label: __("Panel Wrapper", "website-accessibility"),
            children: <PresetPanelRightSidebar />,
        },
        ...sectionItems.map((item) => ({
            key: item.slug,
            label: (
                <div className={`wap-preset-sections__tab-label${item.active === false ? " wap-preset-sections__tab-label--disabled" : ""}`}>
                    <span>{item.title}</span>
                    {item?.isPro && !isProActive ? (
                        <span className="wap-preset-sections__pro">
                            {__("PRO", "website-accessibility")}
                        </span>
                    ) : null}
                </div>
            ),
            children: (
                <PanelSectionTab
                    item={item}
                    component={sectionComponents[item.slug] || null}
                />
            ),
        })),
    ];

    return (
        <WapCard className="wap-panel-customization-card">
            <div className="wap-panel-customization">
                <WapTabs
                    defaultActiveKey="button"
                    tabPosition="left"
                    items={tabItems}
                    className="wap-panel-customization__tabs"
                />
            </div>
        </WapCard>
    );
};

export default PanelCustomizationPreset;
