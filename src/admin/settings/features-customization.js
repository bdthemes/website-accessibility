import { useState } from "react";
import { Card, List, Input, Switch } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { __ } from "@wordpress/i18n";

const FeaturesCustomization = ({ attributes, updateAttr }) => {
    const features = window?.wapHelpers?.features || [];
    const [searchTerm, setSearchTerm] = useState("");

    // Filter features based on search term
    const filteredFeatures = features.filter(feature =>
        feature?.label?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card className="wap-features-customization">
            <Input
                placeholder="Search features..."
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

                    return (
                        <List.Item
                            key={feature?.key}
                            actions={[
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
                                        }else {
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
        </Card>
    );
};

export default FeaturesCustomization;
