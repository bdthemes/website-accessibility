import { Card, Input, Row, Col, Select, Switch, Space, Typography } from 'antd';
import { __ } from '@wordpress/i18n';
import ControlWrapper from './control-wrapper';

const { TextArea } = Input;
const { Text } = Typography;

// Widget features with their control options
const widgetFeatures = [
    {
        key: 'contrast',
        label: 'Contrast +',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="">
                <circle cx="12" cy="12" r="10" stroke="#1a4cd8" strokeWidth="2" />
                <path d="M12 2v20" stroke="#1a4cd8" strokeWidth="2" />
            </svg>
        ),
        control: 'select',
        options: [
            { value: '', label: 'None' },
            { value: 'invert', label: 'Invert' },
            { value: 'dark', label: 'Dark' },
            { value: 'light', label: 'Light' },
        ],
    },
    {
        key: 'screenReader',
        label: 'Screen Reader',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="">
                <circle cx="12" cy="12" r="10" stroke="#1a4cd8" strokeWidth="2" />
                <path d="M8 12h8" stroke="#1a4cd8" strokeWidth="2" />
                <path d="M12 8v8" stroke="#1a4cd8" strokeWidth="2" />
            </svg>
        ),
        control: 'select',
        options: [
            { value: '', label: 'None' },
            { value: 'normal', label: 'Normal' },
            { value: 'slow', label: 'Slow' },
            { value: 'fast', label: 'Fast' },
        ],
    },
    {
        key: 'smartContrast',
        label: 'Smart Contrast',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="">
                <rect x="4" y="4" width="16" height="16" rx="8" stroke="#1a4cd8" strokeWidth="2" />
                <path d="M4 12h16" stroke="#1a4cd8" strokeWidth="2" />
            </svg>
        ),
        control: 'switch',
    },
    {
        key: 'highlightLinks',
        label: 'Highlight Links',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="">
                <rect x="4" y="11" width="16" height="2" fill="#1a4cd8" />
                <rect x="4" y="17" width="16" height="2" fill="#1a4cd8" />
            </svg>
        ),
        control: 'switch',
    },
    {
        key: 'biggerText',
        label: 'Bigger Text',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="">
                <text x="12" y="18" textAnchor="middle" fontSize="16" fill="#1a4cd8" fontWeight="bold">A</text>
            </svg>
        ),
        control: 'select',
        options: [
            { value: '', label: 'None' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
            { value: 'extra-large', label: 'Extra Large' },
            { value: 'huge', label: 'Huge' },
        ],
    },
    {
        key: 'textSpacing',
        label: 'Text Spacing',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="">
                <rect x="4" y="8" width="16" height="2" fill="#1a4cd8" />
                <rect x="4" y="14" width="16" height="2" fill="#1a4cd8" />
            </svg>
        ),
        control: 'select',
        options: [
            { value: '', label: 'None' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
            { value: 'extra-large', label: 'Extra Large' },
        ],
    },
    {
        key: 'pauseAnimations',
        label: 'Pause Animations',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="">
                <rect x="6" y="4" width="4" height="16" rx="2" fill="#1a4cd8" />
                <rect x="14" y="4" width="4" height="16" rx="2" fill="#1a4cd8" />
            </svg>
        ),
        control: 'switch',
    },
    {
        key: 'hideImages',
        label: 'Hide Images',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="">
                <rect x="4" y="4" width="16" height="16" rx="4" stroke="#1a4cd8" strokeWidth="2" />
                <path d="M4 4l16 16" stroke="#1a4cd8" strokeWidth="2" />
            </svg>
        ),
        control: 'switch',
    },
    {
        key: 'dyslexiaFriendly',
        label: 'Dyslexia Friendly',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="">
                <text x="12" y="18" textAnchor="middle" fontSize="16" fill="#1a4cd8" fontWeight="bold">Df</text>
            </svg>
        ),
        control: 'switch',
    },
    {
        key: 'cursor',
        label: 'Cursor',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="">
                <polygon points="4,4 20,12 13,13 12,20" stroke="#1a4cd8" strokeWidth="2" fill="" />
            </svg>
        ),
        control: 'select',
        options: [
            { value: '', label: 'None' },
            { value: 'big-cursor', label: 'Big Cursor' },
            { value: 'mask', label: 'Mask' },
            { value: 'guideline', label: 'Guideline' },
        ],
    },
    {
        key: 'tooltips',
        label: 'Tooltips',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="">
                <circle cx="12" cy="12" r="10" stroke="#1a4cd8" strokeWidth="2" />
                <text x="12" y="16" textAnchor="middle" fontSize="14" fill="#1a4cd8">i</text>
            </svg>
        ),
        control: 'switch',
    },
    {
        key: 'lineHeight',
        label: 'Line Height',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="">
                <rect x="4" y="4" width="16" height="16" rx="4" stroke="#1a4cd8" strokeWidth="2" />
            </svg>
        ),
        control: 'select',
        options: [
            { value: '', label: 'None' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
            { value: 'extra-large', label: 'Extra Large' },
        ],
    },
    {
        key: 'textAlign',
        label: 'Text Alignment',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="">
                <rect x="4" y="4" width="16" height="16" rx="4" stroke="#1a4cd8" strokeWidth="2" />
            </svg>
        ),
        control: 'select',
        options: [
            { value: '', label: 'None' },
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
            { value: 'justify', label: 'Justify' },
        ],
    },
    {
        key: 'saturation',
        label: 'Saturation',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="">
                <rect x="4" y="4" width="16" height="16" rx="4" stroke="#1a4cd8" strokeWidth="2" />
            </svg>
        ),
        control: 'select',
        options: [
            { value: '', label: 'None' },
            { value: 'low', label: 'Low' },
            { value: 'high', label: 'High' },
            { value: 'desaturate', label: 'Desaturate' },
        ],
    },
    {
        key: 'dictionary',
        label: 'Dictionary',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="">
                <rect x="4" y="4" width="16" height="16" rx="4" stroke="#1a4cd8" strokeWidth="2" />
            </svg>
        ),
        control: 'switch',
    }
];

const ProfileForm = ({ formData, onFormChange }) => {
    
    const handleFeatureChange = (featureKey, value) => {
        onFormChange({
            ...formData,
            features: {
                ...formData.features,
                [featureKey]: value,
            },
        });
    };

    const handleFieldChange = (field, value) => {
        onFormChange({
            ...formData,
            [field]: value,
        });
    };

    const renderFeatureControl = (feature) => {
        const value = formData?.features?.[feature.key];
    
        switch (feature.control) {
            case 'select':
                return (
                    <Select
                        key={feature.key}
                        value={value || ''}
                        onChange={(val) => handleFeatureChange(feature.key, val)}
                        options={feature?.options}
                        style={{ width: '100%' }}
                    />
                );
            case 'switch':
                return (
                    <Switch
                        key={feature.key}
                        checked={value == 'enable' || false}
                        onChange={(checked) => {
                            let newValue = checked ? 'enable' : 'disable';
                            handleFeatureChange(feature.key, newValue);
                        }}
                    />
                );
            default:
                return null;
        }
    };
    
    return (
        <Row gutter={[24, 24]}>
            <Col xs={24} lg={6}>
                <Card className='wap-profile-form-left-card' title={__('Profile Information', 'website-accessibility')}>
                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                        <ControlWrapper
                            label={__('Profile Name', 'website-accessibility')}
                            required
                        >
                            <Input
                                value={formData?.name || ''}
                                onChange={(e) => handleFieldChange('name', e.target.value)}
                                placeholder={__('Enter profile name', 'website-accessibility')}
                            />
                        </ControlWrapper>
                        
                        <ControlWrapper
                            label={__('Description', 'website-accessibility')}
                        >
                            <TextArea
                                value={formData?.description || ''}
                                onChange={(e) => handleFieldChange('description', e.target.value)}
                                placeholder={__('Enter profile description', 'website-accessibility')}
                                rows={4}
                            />
                        </ControlWrapper>
                        <ControlWrapper
                            label={__('Profile Icon (SVG)', 'website-accessibility')}
                            tooltip={__('Paste your SVG markup here. Optional.','website-accessibility')}
                        >
                            <TextArea
                                value={formData?.icon || ''}
                                onChange={e => handleFieldChange('icon', e.target.value)}
                                placeholder={__('Paste SVG markup here','website-accessibility')}
                                rows={3}
                            />
                            {formData?.icon && (
                                <div style={{ marginTop: 8 }}>
                                    <Text type="secondary">{__('Preview:', 'website-accessibility')}</Text>
                                    <div style={{ border: '1px solid #eee', padding: 8, marginTop: 4, minHeight: 32 }}
                                        dangerouslySetInnerHTML={{ __html: formData.icon }}
                                    />
                                </div>
                            )}
                        </ControlWrapper>
                    </Space>
                </Card>
            </Col>

            <Col xs={24} lg={18}>
                <Card title={__('Accessibility Features', 'website-accessibility')}>
                    <Row gutter={[16, 16]}>
                        {widgetFeatures.map(feature => (
                            <Col xs={24} sm={12} md={8} key={feature.key}>
                                <div className="wap-feature-item">
                                    <div className="wap-feature-header">
                                        <span className="wap-feature-icon">
                                            {feature.icon}
                                        </span>
                                        <span className="wap-feature-label">
                                            {feature.label}
                                        </span>
                                    </div>
                                    <div className="wap-feature-control">
                                        {renderFeatureControl(feature)}
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Card>
            </Col>
        </Row>
    );
};

export { widgetFeatures };
export default ProfileForm; 