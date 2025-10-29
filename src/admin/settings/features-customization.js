import { useState } from "@wordpress/element";
import { SearchOutlined } from "@ant-design/icons";
import { __ } from "@wordpress/i18n";
import WapList from "../../components/wap-list";
import WapCard from "../../components/wap-card";
import WapInput from "../../components/wap-input";
import WapSwitch from "../../components/wap-switch";
import WapBadge from "../../components/wap-badge";

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
            <WapList
                dataSource={filteredFeatures}
                itemLayout="horizontal"
                renderItem={(feature) => {
                    const currentItem = attributes?.widgets?.find(item => item[feature?.key]);
                    const isCurrentActive = currentItem ? currentItem[feature?.key]?.active : true;
                    const isDummy = feature?.isDummy;
                    return (
                        <WapList.Item
                            key={feature?.key}
                            actions={[
                                <>
                                    {
                                        !isDummy ? (
                                            <WapSwitch
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
                                            <WapBadge color="gold" count={__('PRO', 'website-accessibility')} />
                                        )
                                    }
                                </>
                            ]}
                        >
                            <WapList.Item.Meta
                                avatar={feature?.icon}
                                title={feature?.label}
                            />
                        </WapList.Item>
                    );
                }}
            />
        </WapCard>
    );
};

export default FeaturesCustomization;
