import { useMemo, useState } from "@wordpress/element";
import { SearchOutlined } from "@ant-design/icons";
import { __ } from "@wordpress/i18n";
import { buildFeatureWidgetPayload, getFeatureCategories, getFeatureStateIndex } from "../../utils/feature-categories";


const FeaturesCustomization = ({ attributes, updateAttr }) => {
    const { WapCard, WapInput, WapList, WapSwitch, WapBadge } = window?.wapComponents;
    const features = window?.wapHelpers?.features || [];
    const [searchTerm, setSearchTerm] = useState("");

    const featureStateIndex = useMemo(() => {
        return getFeatureStateIndex(attributes, features);
    }, [attributes, features]);

    const categorizedFeatures = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();
        const categories = getFeatureCategories(attributes, features);

        return categories
            .map((category) => {
                const filtered = category.features.filter((feature) => {
                    if (!keyword) return true;
                    return feature?.label?.toLowerCase().includes(keyword);
                });

                return {
                    ...category,
                    features: filtered,
                };
            })
            .filter((category) => category.features.length > 0);
    }, [attributes, features, searchTerm]);

    const updateFeatureState = (featureKey, checked) => {
        const nextState = {
            ...featureStateIndex,
            [featureKey]: {
                ...(featureStateIndex?.[featureKey] || {}),
                active: checked,
            },
        };

        updateAttr(buildFeatureWidgetPayload(attributes, features, nextState));
    };

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
            <div className="wap-features-customization__categories">
                {categorizedFeatures.map((category) => (
                    <div key={category.slug} className="wap-features-customization__category">
                        <div className="wap-features-customization__category-header">
                            <h4 className="wap-features-customization__category-title">{category.title}</h4>
                            <span className="wap-features-customization__category-count">{category.features.length}</span>
                        </div>
                        <WapList
                            dataSource={category.features}
                            itemLayout="horizontal"
                            renderItem={(feature) => {
                                const isCurrentActive = featureStateIndex?.[feature?.key]?.active ?? true;
                                const isDummy = feature?.isDummy;

                                return (
                                    <WapList.Item
                                        key={feature?.key}
                                        actions={[
                                            !isDummy ? (
                                                <WapSwitch
                                                    checked={isCurrentActive}
                                                    onChange={(checked) => updateFeatureState(feature?.key, checked)}
                                                />
                                            ) : (
                                                <WapBadge color="gold" count={__('PRO', 'website-accessibility')} />
                                            ),
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
                    </div>
                ))}
            </div>
        </WapCard>
    );
};

export default FeaturesCustomization;
