import { Card, Input, Select, Switch } from "antd";
import { __ } from "@wordpress/i18n";
import { locationOptions } from "../utils";
import { useSelect, useDispatch } from "@wordpress/data";
import { STORE_NAME } from "../store";
import ControlWrapper from "./control-wrapper";

const GetStartedPreset = () => {
    const { presetsFormData } = useSelect((select) => select(STORE_NAME).getPresetsFormData());
    const { setPresetsFormData } = useDispatch(STORE_NAME);

    return (
        <Card className="wap-get-started-preset-card">
            <ControlWrapper label={__('Preset Name', 'website-accessibility')} required>
                <Input 
                    onChange={(e) => setPresetsFormData({ ...presetsFormData, title: e.target.value })} 
                    value={presetsFormData?.title} 
                />
            </ControlWrapper>
            <ControlWrapper label={__('Condition', 'website-accessibility')} required>
                <Select 
                    options={locationOptions} 
                    onChange={(value) => setPresetsFormData({ ...presetsFormData, preset: { ...presetsFormData.preset, condition: value } })} 
                    value={presetsFormData?.preset?.condition} 
                />
            </ControlWrapper>
            <ControlWrapper label={__('Active', 'website-accessibility')} required>
                <Switch 
                    checked={presetsFormData?.preset?.active} 
                    onChange={(value) => setPresetsFormData({ ...presetsFormData, preset: { ...presetsFormData.preset, active: value } })} 
                    value={presetsFormData?.preset?.active} />
            </ControlWrapper>
        </Card>
    )
};

export default GetStartedPreset;