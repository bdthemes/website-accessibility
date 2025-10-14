import { useState } from "@wordpress/element";
import SettingsItem from "../components/settings-item";
import { Card, Typography } from "antd";
import { __ } from "@wordpress/i18n";
import StatementSetting from "../components/statement-setting";
const { Title } = Typography;

const Settings = () => {
    const [autoContrast, setAutoContrast] = useState(true);
    const [screenReader, setScreenReader] = useState(false);
    const [dictionary, setDictionary] = useState(true);

    return (
        <div className="wap-settings">
            <Card
                className="wap-settings-card wap-header-card"
            >
                <div className="wap-settings-card-content">
                    <Title level={2} className='wap-header-card-title'>
                        {__('Website Accessibility Settings', 'website-accessibility')}
                    </Title>
                </div>
            </Card>
            <StatementSetting />
        </div>
    );
};

export default Settings;
