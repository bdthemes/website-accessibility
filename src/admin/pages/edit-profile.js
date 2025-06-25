import { useEffect } from '@wordpress/element';
import { Card, Button, Typography, Space, message, Spin } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';
import { DEFAULT_STATE, STORE_NAME } from '../store';
import { useHistory, useLocation } from '../router';
import ProfileForm from '../components/profile-form';

const { Title, Text } = Typography;

const EditProfile = () => {
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
        try {
            const updatedProfile = {
                title: profilesFormData.name,
                description: profilesFormData.description,
                features: profilesFormData.features,
                icon: profilesFormData?.icon,
            }
            await updateProfile(id, updatedProfile);
            await saveEditedProfile(id);
            message.success(__('Profile updated successfully!', 'website-accessibility'));
            history.push({ page: 'website-accessibilityfiles' });
        } catch (error) {
            console.error('Failed to update profile:', error);
        }
    };

    const handleBack = () => {
        history.push({ page: 'website-accessibilityfiles' });
    };

    if (!profile) return null;

    console.log(profilesFormData);

    return (
        <div className="wap-edit-profile">
            <Card>
                <div style={{ marginBottom: 24 }}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={handleBack}
                        style={{ marginBottom: 16 }}
                    >
                        {__('Back to Profiles', 'website-accessibility')}
                    </Button>

                    <Title level={2}>
                        {__('Edit Profile', 'website-accessibility')}
                    </Title>
                    <Text type="secondary">
                        {__('Update the details of this accessibility profile.', 'website-accessibility')}
                    </Text>
                </div>

                <ProfileForm
                    formData={profilesFormData}
                    onFormChange={setProfilesFormData}
                />

                <div style={{ marginTop: 24, textAlign: 'right' }}>
                    <Space>
                        <Button onClick={handleBack}>
                            {__('Cancel', 'website-accessibility')}
                        </Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={handleUpdate}
                            disabled={!profilesFormData?.name?.trim()}
                        >
                            {__('Update Profile', 'website-accessibility')}
                        </Button>
                    </Space>
                </div>
            </Card>
        </div>
    );
};

export default EditProfile;
