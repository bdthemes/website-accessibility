import { __ } from "@wordpress/i18n";
import ControlWrapper from "../components/control-wrapper";
import { useSelect, useDispatch } from "@wordpress/data";
import { STORE_NAME } from "../store";
import ColorPicker from "../controls/color-picker";
import SpacingInput from "../controls/spacing-input";
import ExtensionControl, { hasExtensionControl } from "../components/extension-control";

const HeaderSettings = () => {
    const { WapCard } = window?.wapComponents;
    const { presetsFormData } = useSelect((select) =>
        select(STORE_NAME).getPresetsFormData(),
    );
    const { setPresetsFormData } = useDispatch(STORE_NAME);
    const { items } = presetsFormData?.panel || {};
    const headerItem = items?.find((item) => item.slug === "header");
    const attributes = headerItem?.attributes || {};

    const updateAttr = (updates) => {
        const updatedItems = items.map((item) =>
            item.slug === "header"
                ? { ...item, attributes: { ...attributes, ...updates } }
                : item,
        );

        setPresetsFormData({
            ...presetsFormData,
            panel: {
                ...presetsFormData.panel,
                items: updatedItems,
            },
        });
    };

    return (
        <div className="wap-header-settings">
            {hasExtensionControl("headerShowTranslator") ? (
                <WapCard bordered={false} className="wap-panel-right-sidebar__card">
                    <ExtensionControl slot="headerShowTranslator" label={__("Show Translator", "website-accessibility")} attributes={attributes} updateAttr={updateAttr} />
                </WapCard>
            ) : null}

            <WapCard bordered={false} className="wap-panel-right-sidebar__card" title={__("Style", "website-accessibility")}>
                <div className="wap-header-style-grid">

                            

                    <ControlWrapper label={__("Background", "website-accessibility")}>
                        <ColorPicker
                            value={attributes.background}
                            onChange={(value) => updateAttr({ background: value })}
                        />
                    </ControlWrapper>

                    <ControlWrapper label={__("Text Color", "website-accessibility")}>
                        <ColorPicker
                            value={attributes.color}
                            onChange={(value) => updateAttr({ color: value })}
                        />
                    </ControlWrapper>

                    <ControlWrapper label={__("Icon color", "website-accessibility")}>
                        <ColorPicker
                            value={attributes.iconColor}
                            onChange={(value) => updateAttr({ iconColor: value })}
                        />
                    </ControlWrapper>

                    <ControlWrapper
                        className="wap-control-wrapper--full"
                        label={__("Padding", "website-accessibility")}
                        description={__(
                            "First value sets top and bottom spacing; second sets left and right.",
                            "website-accessibility",
                        )}
                    >
                        <SpacingInput
                            mode="axis"
                            value={attributes.padding}
                            onChange={(nextValue) => updateAttr({ padding: nextValue })}
                        />
                    </ControlWrapper>
                </div>
            </WapCard>
        </div>
    );
};

export default HeaderSettings;
