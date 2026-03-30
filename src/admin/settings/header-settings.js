import { __ } from "@wordpress/i18n";
import ControlWrapper from "../components/control-wrapper";
import { useSelect, useDispatch } from "@wordpress/data";
import { STORE_NAME } from "../store";
import ColorPicker from "../controls/color-picker";

const HeaderSettings = () => {
    const { WapInput, WapSwitch, WapBadge, WapSelect, WapCard, WapRow, WapCol } = window?.wapComponents;
    const { presetsFormData } = useSelect((select) =>
        select(STORE_NAME).getPresetsFormData(),
    );
    const { setPresetsFormData } = useDispatch(STORE_NAME);
    const isProActive = window?.websacPro?.isProActive || false;
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
            <WapCard className="wap-panel-right-sidebar__card" title={__("Content", "website-accessibility")}>
                <WapRow gutter={[16, 16]}>
                    <WapCol xs={24} md={12}>
                        <ControlWrapper label={__("Header Text", "website-accessibility")}>
                            <WapInput
                                value={attributes.text || ""}
                                onChange={(e) => updateAttr({ text: e.target.value })}
                                placeholder={__("Accessibility", "website-accessibility")}
                            />
                        </ControlWrapper>
                    </WapCol>
                    <WapCol xs={24} md={12}>
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
                    </WapCol>
                </WapRow>
            </WapCard>

            <WapCard className="wap-panel-right-sidebar__card" title={__("Style", "website-accessibility")}>
                <WapRow gutter={[16, 16]}>
                    <WapCol xs={24} md={12}>
                        <ControlWrapper label={__("Background", "website-accessibility")}>
                            <ColorPicker
                                value={attributes.background}
                                onChange={(value) => updateAttr({ background: value })}
                            />
                        </ControlWrapper>
                    </WapCol>
                    <WapCol xs={24} md={12}>
                        <ControlWrapper label={__("Text Color", "website-accessibility")}>
                            <ColorPicker
                                value={attributes.color}
                                onChange={(value) => updateAttr({ color: value })}
                            />
                        </ControlWrapper>
                    </WapCol>
                    <WapCol xs={24} md={12}>
                        <ControlWrapper label={__("Border", "website-accessibility")}>
                            <WapInput
                                value={attributes.border}
                                onChange={(e) => updateAttr({ border: e.target.value })}
                                placeholder="1px solid #2e6cf6"
                            />
                        </ControlWrapper>
                    </WapCol>
                    <WapCol xs={24} md={12}>
                        <ControlWrapper label={__("Border Radius", "website-accessibility")}>
                            <WapInput
                                value={attributes.borderRadius}
                                onChange={(e) => updateAttr({ borderRadius: e.target.value })}
                                placeholder="6px"
                            />
                        </ControlWrapper>
                    </WapCol>
                    <WapCol xs={24} md={12}>
                        <ControlWrapper label={__("Padding", "website-accessibility")}>
                            <WapInput
                                value={attributes.padding}
                                onChange={(e) => updateAttr({ padding: e.target.value })}
                                placeholder="10px 20px"
                            />
                        </ControlWrapper>
                    </WapCol>
                    <WapCol xs={24} md={12}>
                        <ControlWrapper label={__("Font Size", "website-accessibility")}>
                            <WapInput
                                value={attributes.fontSize}
                                onChange={(e) => updateAttr({ fontSize: e.target.value })}
                                placeholder="16px"
                            />
                        </ControlWrapper>
                    </WapCol>
                    <WapCol xs={24} md={12}>
                        <ControlWrapper label={__("Font Weight", "website-accessibility")}>
                            <WapSelect
                                value={attributes.fontWeight || "600"}
                                onChange={(value) => updateAttr({ fontWeight: value })}
                                options={[
                                    { value: "400", label: "Normal (400)" },
                                    { value: "500", label: "Medium (500)" },
                                    { value: "600", label: "Semi Bold (600)" },
                                    { value: "700", label: "Bold (700)" },
                                    { value: "800", label: "Extra Bold (800)" },
                                    { value: "900", label: "Black (900)" },
                                ]}
                            />
                        </ControlWrapper>
                    </WapCol>
                    <WapCol xs={24} md={12}>
                        <ControlWrapper label={__("Text Decoration", "website-accessibility")}>
                            <WapSelect
                                value={attributes?.textDecoration || "none"}
                                onChange={(value) => updateAttr({ textDecoration: value })}
                                options={[
                                    { value: "none", label: "None" },
                                    { value: "underline", label: "Underline" },
                                    { value: "line-through", label: "Line Through" },
                                    { value: "overline", label: "Overline" },
                                ]}
                            />
                        </ControlWrapper>
                    </WapCol>
                    <WapCol xs={24}>
                        <ControlWrapper label={__("Box Shadow", "website-accessibility")}>
                            <WapInput
                                value={attributes.boxShadow}
                                onChange={(e) => updateAttr({ boxShadow: e.target.value })}
                                placeholder="0 4px 24px rgba(0,0,0,0.08)"
                            />
                        </ControlWrapper>
                    </WapCol>
                </WapRow>
            </WapCard>
        </div>
    );
};

export default HeaderSettings;
