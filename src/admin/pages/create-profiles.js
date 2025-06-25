import { Card, Button, Typography, Space } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';
import { DEFAULT_STATE, STORE_NAME } from '../store';
import { useHistory } from '../router';
import ProfileForm from '../components/profile-form';

const { Title, Text } = Typography;

const CreateProfiles = () => {
    const { profilesFormData } = useSelect((select) => select(STORE_NAME).getProfilesFormData());
    const { setProfilesFormData, createProfile } = useDispatch(STORE_NAME);
    const history = useHistory();

    const handleBack = () => {
        setProfilesFormData(DEFAULT_STATE.profilesFormData);
        history.push({
            page: 'website-accessibilityfiles'
        });
    };

    const handleSave = async () => {
        try {
            await createProfile(profilesFormData);
            history.push({
                page: 'website-accessibilityfiles'
            });
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="wap-create-profiles">
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
                        {__('Create New Profile', 'website-accessibility')}
                    </Title>
                    <Text type="secondary">
                        {__('Create a custom accessibility profile with specific settings for different user needs.', 'website-accessibility')}
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
                            onClick={handleSave}
                            disabled={!profilesFormData.name?.trim()}
                        >
                            {__('Create Profile', 'website-accessibility')}
                        </Button>
                    </Space>
                </div>
            </Card>
        </div>
    );
};

export default CreateProfiles;