import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';
import { getDefaultProfilesFormData, STORE_NAME } from '../store';
import { useHistory } from '../router';
import ProfileForm from '../components/profile-form';
import ProfileEditorPreview from '../components/profile-editor-preview';


const CreateProfiles = () => {
    const { WapCard, WapButton, WapSpace, WapTypography } = window?.wapComponents;
    const { Title, Text } = WapTypography;
    const { profilesFormData } = useSelect((select) => select(STORE_NAME).getProfilesFormData());
    const { setProfilesFormData, createProfile } = useDispatch(STORE_NAME);
    const history = useHistory();

    useEffect(() => {
        setProfilesFormData(getDefaultProfilesFormData());
    }, []);

    const handleBack = () => {
        setProfilesFormData(getDefaultProfilesFormData());
        history.push({
            page: 'website-accessibilityfiles'
        });
    };

    const purifyFormData = (data) => {
        let purifiedFeatures = {};
        for (const key in data?.features) {
            const feature = data?.features[key];

            if (feature && typeof feature === 'string' && feature.trim().length > 0) {
                purifiedFeatures[key] = feature;
            }
        }

        return {
            ...data,
            features: purifiedFeatures
        };
    }

    const handleSave = async () => {
        try {
            await createProfile(purifyFormData(profilesFormData));
            setProfilesFormData(getDefaultProfilesFormData());
            history.push({
                page: 'website-accessibilityfiles'
            });
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="wap-create-profiles">
            <WapCard className='wap-header-card'>
                <div className='wap-header-card-content'>
                    <Title level={2} className='wap-header-card-title'>
                        {__('Create New Profile', 'website-accessibility')}
                    </Title>
                    <Text type="secondary" className='wap-header-card-description'>
                        {__('Create a custom accessibility profile with specific settings for different user needs.', 'website-accessibility')}
                    </Text>
                </div>
                <WapButton
                    type="primary"
                    size="large"
                    onClick={handleBack}
                >
                    <WapSpace>
                        <span className='dashicons dashicons-arrow-left-alt' />
                        {__('Back to Profiles', 'website-accessibility')}
                    </WapSpace>
                </WapButton>
            </WapCard>

            <div className="wap-profile-editor-content">
                <ProfileForm
                    formData={profilesFormData}
                    onFormChange={setProfilesFormData}
                />
            </div>
            <ProfileEditorPreview
                formData={profilesFormData}
            />

            <div className="wap-profile-form-actions" style={{ marginTop: 24, textAlign: 'right' }}>
                <WapSpace>
                    <WapButton size="large" onClick={handleBack}>
                        <WapSpace>
                            <span className='dashicons dashicons-dismiss' />
                            {__('Cancel', 'website-accessibility')}
                        </WapSpace>
                    </WapButton>
                    <WapButton
                        type="primary"
                        size="large"
                        onClick={handleSave}
                        disabled={!profilesFormData.name?.trim()}
                    >
                        <WapSpace>
                            {__('Create Profile', 'website-accessibility')}
                            <span className='dashicons dashicons-arrow-right-alt' />
                        </WapSpace>
                    </WapButton>
                </WapSpace>
            </div>
        </div>
    );
};

export default CreateProfiles;
