import { __ } from "@wordpress/i18n";
import ControlWrapper from "../components/control-wrapper";
import { useSelect, useDispatch } from "@wordpress/data";
import { STORE_NAME } from "../store";
import ColorPicker from "../controls/color-picker";
import { useLicense } from "../context/LicenseContext";

const HeaderSettings = () => {
    const { WapInput, WapSwitch, WapBadge, WapSelect, WapCard, WapRow, WapCol } = window?.wapComponents;
    const { presetsFormData } = useSelect((select) =>
        select(STORE_NAME).getPresetsFormData(),
    );
    const { setPresetsFormData } = useDispatch(STORE_NAME);
    const { isProActive } = useLicense();
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
            <WapCard bordered={false} className="wap-panel-right-sidebar__card">
                <ControlWrapper label={__("Show Translator", "website-accessibility")} inline>
                    {isProActive ? (
                        <WapSwitch
                            checked={attributes.showTranslator !== false}
                            onChange={(checked) => updateAttr({ showTranslator: checked })}
                        />
                    ) : (
                        <WapBadge color="gold" count={__("PRO", "website-accessibility")} />
                    )}
                </ControlWrapper>
            </WapCard>

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


                    <ControlWrapper label={__("Padding", "website-accessibility")}>
                        <WapInput
                            value={attributes.padding}
                            onChange={(e) => updateAttr({ padding: e.target.value })}
                            placeholder="10px 20px"
                        />
                    </ControlWrapper>
                </div>
            </WapCard>
        </div>
    );
};

export default HeaderSettings;
