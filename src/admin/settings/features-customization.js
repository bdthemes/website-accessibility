import { useState } from "@wordpress/element";
import { List, Switch, Badge } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { __ } from "@wordpress/i18n";
import WapCard from "../../components/wap-card";
import WapInput from "../../components/wap-input";

const FeaturesCustomization = ({ attributes, updateAttr }) => {
    const features = window?.wapHelpers?.features || [];
    const [searchTerm, setSearchTerm] = useState("");

    // Filter features based on search term
    const filteredFeatures = features.filter(feature =>
        feature?.label?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <WapCard className="wap-features-customization">
            <WapInput
                placeholder={__("Search features...", "website-accessibility")}
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ marginBottom: 16 }}
                allowClear
            />
            <List
                dataSource={filteredFeatures}
                itemLayout="horizontal"
                renderItem={(feature) => {
                    const currentItem = attributes?.widgets?.find(item => item[feature?.key]);
                    const isCurrentActive = currentItem ? currentItem[feature?.key]?.active : true;
                    const isDummy = feature?.isDummy;
                    return (
                        <List.Item
                            key={feature?.key}
                            actions={[
                                <>
                                    {
                                        !isDummy ? (
                                            <Switch
                                                checked={isCurrentActive}
                                                onChange={(checked) => {
                                                    if (currentItem) {
                                                        updateAttr({
                                                            widgets: attributes.widgets.map(item => {
                                                                if (item[feature?.key]) {
                                                                    return {
                                                                        ...item,
                                                                        [feature?.key]: {
                                                                            ...item[feature?.key],
                                                                            active: checked
                                                                        }
                                                                    };
                                                                }
                                                                return item;
                                                            })
                                                        });
                                                    } else {
                                                        updateAttr({
                                                            widgets: [
                                                                ...attributes?.widgets || [],
                                                                {
                                                                    [feature?.key]: {
                                                                        active: checked
                                                                    }
                                                                }
                                                            ]
                                                        });
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <Badge color="gold" count={__('PRO', 'website-accessibility')} />
                                        )
                                    }
                                </>
                            ]}
                        >
                            <List.Item.Meta
                                avatar={feature?.icon}
                                title={feature?.label}
                            />
                        </List.Item>
                    );
                }}
            />
        </WapCard>
    );
};

export default FeaturesCustomization;
