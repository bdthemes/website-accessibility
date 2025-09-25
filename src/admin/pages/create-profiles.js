import { Card, Button, Typography, Space } from 'antd';
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
            history.push({
                page: 'website-accessibilityfiles'
            });
            setProfilesFormData(DEFAULT_STATE.profilesFormData);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="wap-create-profiles">

                 <Card className='wap-header-card'>
                    <div className='wap-header-card-content'>
                        <Title level={2} className='wap-header-card-title'>
                            {__('Create New Profile', 'website-accessibility')}
                        </Title>
                        <Text type="secondary" className='wap-header-card-description'>
                            {__('Create a custom accessibility profile with specific settings for different user needs.', 'website-accessibility')}
                        </Text>
                    </div>
                    <Button 
                        type="primary"
                        onClick={handleBack}
                    >
                        <Space>
                            <span className='dashicons dashicons-arrow-left-alt' />
                            {__('Back to Profiles', 'website-accessibility')}
                        </Space>
                    </Button>
                </Card>

                <ProfileForm 
                    formData={profilesFormData}
                    onFormChange={setProfilesFormData}
                />

                <div style={{ marginTop: 24, textAlign: 'right' }}>
                    <Space>
                        <Button onClick={handleBack}>
                            <Space>
                                <span className='dashicons dashicons-dismiss' />
                                {__('Cancel', 'website-accessibility')}
                            </Space>
                        </Button>
                        <Button 
                            type="primary" 
                            onClick={handleSave}
                            disabled={!profilesFormData.name?.trim()}
                        >
                            <Space> 
                                {__('Create Profile', 'website-accessibility')}
                                <span className='dashicons dashicons-arrow-right-alt' />
                            </Space>
                        </Button>
                    </Space>
                </div>
        </div>
    );
};

export default CreateProfiles;