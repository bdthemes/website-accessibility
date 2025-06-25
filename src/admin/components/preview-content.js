import PanelHeader from "./panel-header";
import LanguageSelector from "./language-selector";
import AccessibilityProfiles from "./accessibility-profiles";
import WidgetFeatures from "./widget-features";
import PanelFooter from "./panel-footer";
import { useSelect } from "@wordpress/data";
import { STORE_NAME } from "../store";

const PreviewContent = () => {
    const { presetsFormData } = useSelect((select) => select(STORE_NAME).getPresetsFormData());
    const panel = presetsFormData?.panel || {};

    const itemComponents = {
        language: <LanguageSelector value={panel} />,
        profiles: <AccessibilityProfiles value={panel} />,
        features: <WidgetFeatures value={panel} />,
    }

    return (
        <div 
            className="wap-panel-customization__panel"
            style={{
                '--panel-width': panel?.wrapper?.width && `${panel.wrapper.width}px`,
                '--panel-background': panel?.wrapper?.background,
                '--panel-border': panel?.wrapper?.border,
                '--panel-padding': panel?.wrapper?.padding,
                '--panel-border-radius': panel?.wrapper?.borderRadius,
                '--panel-box-shadow': panel?.wrapper?.boxShadow,
            }}
        >
            {
                panel?.items?.find((item) => item.slug === 'header')?.active && (
                    <PanelHeader value={panel} />
                )
            }
            <div className="wap-panel-customization__info">
                {
                    panel?.items?.map((item) => {
                        if (itemComponents[item.slug] && item.active) {
                            return itemComponents[item.slug];
                        }
                        return null;
                    })
                }
            </div>
            {
                panel?.items?.find((item) => item.slug === 'footer')?.active && (
                    <PanelFooter value={panel} />
                )
            }
        </div>
    )
}

export default PreviewContent; 