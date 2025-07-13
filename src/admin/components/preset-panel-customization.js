import { Card } from "antd";
import PresetPanelLeftSidebar from "./preset-panel-left-sidebar";
import PresetPanelRightSidebar from "./preset-panel-right-sidebar";
import PreviewContent from "../../components/preview-content";
import { useSelect } from "@wordpress/data";
import { STORE_NAME } from "../store";

const PanelCustomizationPreset = () => {
    const { presetsFormData } = useSelect((select) => select(STORE_NAME).getPresetsFormData());
    const allProfiles = useSelect((select) => {
        const { getProfiles } = select(STORE_NAME);
        const profiles = getProfiles(true);
        return profiles || [];
    }, []);
    const panel = presetsFormData?.panel || {};
    return (
        <Card className="wap-panel-customization-card">
            <div className="wap-panel-customization">
                <div className="wap-panel-customization__left">
                    <PresetPanelLeftSidebar />
                </div>
                <div className="wap-panel-customization__center-row" style={{ position: 'relative' }}>
                <div className="wap-os-style-wrapper">
        <span className="wap-os-style"></span>
        <span className="wap-os-style"></span>
        <span className="wap-os-style"></span>
      </div>
                    <div className="wap-panel-customization__center" style={{ marginTop: '40px' }}>
                        <PreviewContent panel={panel} allProfiles={allProfiles} />
                    </div>
                </div>
                <div className="wap-panel-customization__right">
                    <PresetPanelRightSidebar />
                </div>
            </div>
        </Card>
    )
}

export default PanelCustomizationPreset;