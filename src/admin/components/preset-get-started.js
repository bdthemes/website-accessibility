import { __ } from "@wordpress/i18n";
import { useState, useEffect } from "@wordpress/element";
import { useSelect, useDispatch } from "@wordpress/data";
import { STORE_NAME } from "../store";
import ControlWrapper from "./control-wrapper";
import { archivePages, locationOptions } from "../../utils";
import apiFetch from "@wordpress/api-fetch";
import { addQueryArgs } from "@wordpress/url";

const GetStartedPreset = () => {
    const { WapCard, WapInput, WapSwitch, WapSelect } = window?.wapComponents;   
    const [posts, setPosts] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const { presetsFormData } = useSelect((select) => select(STORE_NAME).getPresetsFormData());
    const { setPresetsFormData } = useDispatch(STORE_NAME);

    const getSelectedPosts = (selectedIds = []) => {
        if (!Array.isArray(selectedIds) || !selectedIds.length > 0) {
            return [];
        }

        const url = addQueryArgs('/wp/v2/search', {
            include: selectedIds?.length ? selectedIds.join(',') : undefined,
            per_page: selectedIds?.length
        });

        return apiFetch({ path: url });
    };

    useEffect(() => {
        (async () => {
            try {
                const selectedPosts = await getSelectedPosts(presetsFormData?.preset?.specificPosts) || [];

                const url = addQueryArgs('/wp/v2/search', {
                    search: searchInput,
                    per_page: 10
                });

                const response = await apiFetch({ path: url });

                // Merge and remove duplicates
                const posts = [...response, ...selectedPosts].filter(
                    (post, index, self) => index === self.findIndex(p => p.id === post.id)
                );

                const postOptions = posts.map((post) => ({
                    label: post.title,
                    value: post.id
                }));

                setPosts(postOptions);
            } catch (error) {
                console.error(error);
            }
        })();
    }, [searchInput, presetsFormData?.preset?.specificPosts]);



    return (
        <WapCard className="wap-get-started-preset-card">
            <ControlWrapper label={__('Preset Name', 'website-accessibility')} required>
                <WapInput
                    onChange={(e) => setPresetsFormData({ ...presetsFormData, title: e.target.value })}
                    value={presetsFormData?.title}
                />
            </ControlWrapper>
            <ControlWrapper label={__('Condition', 'website-accessibility')} required>
                <WapSelect
                    options={locationOptions}
                    onChange={(value) => setPresetsFormData({ ...presetsFormData, preset: { ...presetsFormData.preset, condition: value } })}
                    value={presetsFormData?.preset?.condition}
                />
            </ControlWrapper>
            {
                presetsFormData?.preset?.condition === 'archive' && (
                    <ControlWrapper label={__('Specific Archive Page', 'website-accessibility')} required>
                        <WapSelect
                            options={archivePages}
                            onChange={(value) => setPresetsFormData({ ...presetsFormData, preset: { ...presetsFormData.preset, specificArchive: value } })}
                            value={presetsFormData?.preset?.specificArchive}
                            placeholder={__('keep blank for all archive pages', 'website-accessibility')}
                            mode="multiple"
                        />
                    </ControlWrapper>
                )
            }

            {
                presetsFormData?.preset?.condition === 'singular' && (
                    <>
                        <ControlWrapper label={__('Specific Posts', 'website-accessibility')} required>
                            <WapSelect
                                options={posts}
                                onChange={(value) => setPresetsFormData({ ...presetsFormData, preset: { ...presetsFormData.preset, specificPosts: value } })}
                                value={presetsFormData?.preset?.specificPosts}
                                mode="multiple"
                                showSearch
                                filterOption={(input, option) => option?.label.toLowerCase().includes(input.toLowerCase())}
                                onSearch={(value) => setSearchInput(value)}
                                placeholder={__('keep blank for all', 'website-accessibility')}
                            />
                        </ControlWrapper>
                    </>
                )
            }
            <ControlWrapper label={__('Active', 'website-accessibility')}>
                <WapSwitch
                    checked={presetsFormData?.preset?.active}
                    onChange={(value) => setPresetsFormData({ ...presetsFormData, preset: { ...presetsFormData.preset, active: value } })}
                    value={presetsFormData?.preset?.active} />
            </ControlWrapper>
        </WapCard>
    )
};

export default GetStartedPreset;