import { __ } from "@wordpress/i18n";
import ControlWrapper from "../components/control-wrapper";
import { useSelect, useDispatch } from "@wordpress/data";
import { STORE_NAME } from "../store";
import ColorPicker from "../controls/color-picker";
import WapCollapse from "../../components/wap-collapse";
import WapInput from "../../components/wap-input";
import WapTabs from "../../components/wap-tabs";
import WapSwitch from "../../components/wap-switch";
import WapSelect from "../../components/wap-select";

const ContentTab = ({ presetsFormData, setPresetsFormData }) => {
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
        <>
            <ControlWrapper label={__("Header Text", "website-accessibility")}>
                <WapInput
                    value={attributes.text || ""}
                    onChange={(e) => updateAttr({ text: e.target.value })}
                    placeholder={__(
                        "Accessibility Menu (CTRL+U)",
                        "website-accessibility",
                    )}
                />
            </ControlWrapper>

            <ControlWrapper label={__("Show Close Button", "website-accessibility")}>
                <WapSwitch
                    checked={attributes.showClose !== false}
                    onChange={(checked) => updateAttr({ showClose: checked })}
                />
            </ControlWrapper>
        </>
    );
};

const StyleTab = ({ presetsFormData, setPresetsFormData }) => {
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

    const collapseItems = [
        {
            key: "1",
            label: __("Header", "website-accessibility"),
            children: (
                <>
                    <ControlWrapper label={__("Background", "website-accessibility")}>
                        <ColorPicker
                            value={attributes.background}
                            onChange={(value) => updateAttr({ background: value })}
                        />
                    </ControlWrapper>

                    <ControlWrapper label={__("Border", "website-accessibility")}>
                        <WapInput
                            value={attributes.border}
                            onChange={(e) => updateAttr({ border: e.target.value })}
                            placeholder="1px solid #2e6cf6"
                        />
                    </ControlWrapper>

                    <ControlWrapper label={__("Border Radius", "website-accessibility")}>
                        <WapInput
                            value={attributes.borderRadius}
                            onChange={(e) => updateAttr({ borderRadius: e.target.value })}
                            placeholder="6px"
                        />
                    </ControlWrapper>

                    <ControlWrapper label={__("Box Shadow", "website-accessibility")}>
                        <WapInput
                            value={attributes.boxShadow}
                            onChange={(e) => updateAttr({ boxShadow: e.target.value })}
                            placeholder="0 4px 24px rgba(0,0,0,0.08)"
                        />
                    </ControlWrapper>

                    <ControlWrapper label={__("Padding", "website-accessibility")}>
                        <WapInput
                            value={attributes.padding}
                            onChange={(e) => updateAttr({ padding: e.target.value })}
                            placeholder="10px 20px"
                        />
                    </ControlWrapper>

                    <ControlWrapper label={__("Text Color", "website-accessibility")}>
                        <ColorPicker
                            value={attributes.color}
                            onChange={(value) => updateAttr({ color: value })}
                        />
                    </ControlWrapper>

                    <ControlWrapper label={__("Font Size", "website-accessibility")}>
                        <WapInput
                            value={attributes.fontSize}
                            onChange={(e) => updateAttr({ fontSize: e.target.value })}
                            placeholder="16px"
                        />
                    </ControlWrapper>

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
                </>
            )
        },
        {
            key: "2",
            label: __("Close Button", "website-accessibility"),
            children: (
                <>
                    <ControlWrapper label={__("Background", "website-accessibility")}>
                        <ColorPicker
                            value={attributes.closeButtonBackground}
                            onChange={(value) => updateAttr({ closeButtonBackground: value })}
                        />
                    </ControlWrapper>

                    <ControlWrapper label={__("Color", "website-accessibility")}>
                        <ColorPicker
                            value={attributes.closeButtonColor}
                            onChange={(value) => updateAttr({ closeButtonColor: value })}
                        />
                    </ControlWrapper>

                    <ControlWrapper label={__("Size", "website-accessibility")}>
                        <WapInput
                            value={attributes?.closeButtonSize}
                            onChange={(e) => updateAttr({ closeButtonSize: e.target.value })}
                            placeholder="24px"
                        />
                    </ControlWrapper>

                    <ControlWrapper label={__("Border", "website-accessibility")}>
                        <WapInput
                            value={attributes?.closeButtonBorder}
                            onChange={(e) => updateAttr({ closeButtonBorder: e.target.value })}
                            placeholder="1px solid #ff0000"
                        />
                    </ControlWrapper>

                    <ControlWrapper label={__("Border Radius", "website-accessibility")}>
                        <WapInput
                            value={attributes.closeButtonBorderRadius}
                            onChange={(e) =>
                                updateAttr({ closeButtonBorderRadius: e.target.value })
                            }
                            placeholder="6px"
                        />
                    </ControlWrapper>

                    <ControlWrapper label={__("Top", "website-accessibility")}>
                        <WapInput
                            value={attributes.closeButtonTop}
                            onChange={(e) => updateAttr({ closeButtonTop: e.target.value })}
                            placeholder="10px"
                        />
                    </ControlWrapper>

                    <ControlWrapper label={__("Right", "website-accessibility")}>
                        <WapInput
                            value={attributes.closeButtonRight}
                            onChange={(e) => updateAttr({ closeButtonRight: e.target.value })}
                            placeholder="10px"
                        />
                    </ControlWrapper>
                </>
            )
        }
    ];

    return (
        <WapCollapse accordion items={collapseItems} />
    );
};

const HeaderSettings = () => {
    const { presetsFormData } = useSelect((select) =>
        select(STORE_NAME).getPresetsFormData(),
    );
    const { setPresetsFormData } = useDispatch(STORE_NAME);

    const tabItems = [
        {
            key: "content",
            label: __("Content", "website-accessibility"),
            children: (
                <ContentTab
                    presetsFormData={presetsFormData}
                    setPresetsFormData={setPresetsFormData}
                />
            ),
        },
        {
            key: "style",
            label: __("Style", "website-accessibility"),
            children: (
                <StyleTab
                    presetsFormData={presetsFormData}
                    setPresetsFormData={setPresetsFormData}
                />
            ),
        },
    ];

    return (
        <div className="wap-header-settings">
            <WapTabs
                items={tabItems}
                defaultActiveKey="content"
                className="wap-header-settings__tabs"
            />
        </div>
    );
};

export default HeaderSettings;