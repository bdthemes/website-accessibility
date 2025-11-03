import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';
import { DEFAULT_STATE, STORE_NAME } from '../store';
import { useHistory, useLocation } from '../router';
import ProfileForm from '../components/profile-form';


const { WapCard, WapButton, WapSpace, WapTypography, WapMessage } = window?.wapComponents;

const { Title, Text } = WapTypography;

const EditProfile = () => {
    const { WapCard, WapButton, WapSpace, WapTypography } = window?.wapComponents;
    const history = useHistory();
    const location = useLocation();
    const id = location?.params?.id;
    const page = location?.params?.page;

    useEffect(() => {
        if (!id || !page) {
            history.push({
                page: 'website-accessibilityfiles',
            });
        }
    }, [location]);

    const { setProfilesFormData, updateProfile, saveEditedProfile } = useDispatch(STORE_NAME);
    const profile = useSelect((select) => select(STORE_NAME).getProfile(id), [id]);
    const { profilesFormData } = useSelect((select) => select(STORE_NAME).getProfilesFormData(), []);

    useEffect(() => {
        try {
            if (profile?.content) {
                const content = JSON.parse(profile?.content);
                const profileData = {
                    name: profile?.title,
                    ...content,
                };
                setProfilesFormData(profileData);
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
        }
    }, [profile]);

    const handleUpdate = async () => {
        const { WapMessage } = window?.wapComponents;
        try {
            const updatedProfile = {
                name: profilesFormData.name,
                description: profilesFormData.description,
                features: profilesFormData.features,
                icon: profilesFormData?.icon,
            }
            await updateProfile(id, updatedProfile);
            await saveEditedProfile(id);
            WapMessage.success({
                content: __('Profile updated successfully!', 'website-accessibility'),
                style: { marginBlockStart: 30 },
            });
            history.push({ page: 'website-accessibilityfiles' });
        } catch (error) {
            console.error('Failed to update profile:', error);
        }
    };

    const handleBack = () => {
        history.push({ page: 'website-accessibilityfiles' });
        setProfilesFormData(DEFAULT_STATE.profilesFormData);
    };

    if (!profile) return null;

    return (
        <div className="wap-edit-profile">
                <WapCard className='wap-header-card'>
                    <div className='wap-header-card-content'>
                        <Title level={2} className='wap-header-card-title'>
                            {__('Edit Profile', 'website-accessibility')}
                        </Title>
                        <Text type="secondary" className='wap-header-card-description'>
                            {__('Update the details of this accessibility profile.', 'website-accessibility')}
                        </Text>
                    </div>

                    <WapButton
                        type="primary"
                        onClick={handleBack}
                        size='large'
                    >
                        <WapSpace>
                            <span className="dashicons dashicons-arrow-left-alt"/>
                            {__('Back to Profiles', 'website-accessibility')}
                        </WapSpace>
                    </WapButton>
                </WapCard>

                <ProfileForm
                    formData={profilesFormData}
                    onFormChange={setProfilesFormData}
                />

                <div style={{ marginTop: 24, textAlign: 'right' }}>
                    <WapSpace>
                        <WapButton onClick={handleBack} size='large'>
                            <WapSpace>
                                <span className='dashicons dashicons-dismiss' />
                                {__('Cancel', 'website-accessibility')}
                            </WapSpace>
                        </WapButton>
                        <WapButton
                            type="primary"
                            onClick={handleUpdate}
                            disabled={!profilesFormData?.name?.trim()}
                            size='large'
                        >
                            <WapSpace>
                                {__('Update Profile', 'website-accessibility')}
                                <span className='dashicons dashicons-arrow-right-alt' />
                            </WapSpace>
                        </WapButton>
                    </WapSpace>
                </div>
        </div>
    );
};

export default EditProfile;
