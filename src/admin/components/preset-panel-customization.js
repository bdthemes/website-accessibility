import { Card } from "antd";
import PresetPanelLeftSidebar from "./preset-panel-left-sidebar";
import PresetPanelRightSidebar from "./preset-panel-right-sidebar";
import PreviewContent from "./preview-content";

const PanelCustomizationPreset = () => {
    return (
        <Card>
            <div className="wap-panel-customization">
                <div className="wap-panel-customization__left">
                    <PresetPanelLeftSidebar />
                </div>
                <div className="wap-panel-customization__center-row">
                    <div className="wap-panel-customization__side-spacer" />
                    <div className="wap-panel-customization__center">
                        <PreviewContent />
                    </div>
                    <div className="wap-panel-customization__side-spacer" />
                </div>
                <div className="wap-panel-customization__left">
                    <PresetPanelRightSidebar />
                </div>
            </div>
        </Card>
    )
}

export default PanelCustomizationPreset;