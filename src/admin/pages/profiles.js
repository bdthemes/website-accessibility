import { __ } from '@wordpress/i18n';
import PostTable from '../components/post-table';
import { useHistory } from '../router';
import { useSelect, useDispatch } from '@wordpress/data';
import { getDefaultProfilesFormData, STORE_NAME } from '../store';
import ProfilesFallback from '../components/profiles-fallback';
import { useLicense } from '../context/LicenseContext';


const Profiles = () => {
  const { WapCard, WapButton, WapSpace, WapDropdown, WapTypography } = window?.wapComponents;
  const { Title, Text } = WapTypography;
  const { isProActive } = useLicense();
  const history = useHistory();
  const profiles = useSelect((select) => select(STORE_NAME).getProfiles());
  const { deleteProfile, setProfilesFormData } = useDispatch(STORE_NAME);

  const handleCreateProfile = () => {
    setProfilesFormData(getDefaultProfilesFormData());
    history.push({
      page: 'website-accessibilityfiles-create'
    });
  };

  const handleRowAction = async (action, record) => {
    switch (action) {
      case 'edit':
        history.push({
          page: 'website-accessibilityfiles-edit',
          id: record?.id,
        });
        break;
      case 'trash':
        try {
          await deleteProfile(record.id);
        } catch (error) {
          console.error('Failed to delete profile:', error);
        }
        break;
      default:
        break;
    }
  };

  const handleBulkAction = async (action, selectedIds) => {
    switch (action) {
      case 'trash':
        try {
          for (const id of selectedIds) {
            await deleteProfile(id);
          }
        } catch (error) {
          console.error('Failed to delete profiles:', error);
        }
        break;
      default:
        break;
    }
  };

  // Transform profiles data for the table
  const tableData = profiles?.map(profile => ({
    id: profile.id,
    name: profile.title?.rendered || profile.title || 'Untitled Profile',
    created: profile.date ? new Date(profile.date).toLocaleDateString() : 'N/A',
  })) || [];

  const columns = [
    {
      title: __('Name', 'website-accessibility'),
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.description && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              {record.description.replace(/<[^>]*>/g, '').substring(0, 100)}
              {record.description.length > 100 ? '...' : ''}
            </div>
          )}
        </div>
      )
    },
    {
      title: __('Created', 'website-accessibility'),
      dataIndex: 'created',
      key: 'created'
    },
    {
      title: __('Actions', 'website-accessibility'),
      key: 'actions',
      render: (_, record) => (
        <WapDropdown
          menu={{
            items: [
              { key: 'edit', label: 'Edit', onClick: () => handleRowAction('edit', record) },
              { key: 'trash', label: 'Trash', onClick: () => handleRowAction('trash', record) },
            ]
          }}
          trigger={['click']}
        >
          <WapButton icon={<span className="dashicons dashicons-ellipsis" />} />
        </WapDropdown>
      ),
    }
  ];

  if (!isProActive) {
    return (
      <ProfilesFallback />
    )
  }

  return (
    <div className="wap-settings wap-profiles">
      <WapCard className="wap-settings-row wap-header-card wap-profiles-header">
        <div className="wap-profiles-header__inner">
          <div className="wap-header-card-content">
            <Title level={4} className="wap-header-card-title">
              {__('Custom Profiles', 'website-accessibility')}
            </Title>
            <Text type="secondary" className="wap-header-card-description">
              {__('Create and manage accessibility profiles for different user needs.', 'website-accessibility')}
            </Text>
          </div>
          <div className="wap-profiles-header__actions">
            <WapButton type="primary" onClick={handleCreateProfile}>
              <WapSpace size="small">
                <span className="dashicons dashicons-plus-alt2" />
                {__('Add New Profile', 'website-accessibility')}
              </WapSpace>
            </WapButton>
          </div>
        </div>
      </WapCard>

      <WapCard className="wap-settings-row wap-profiles-table-card">
        <div>
          <PostTable
            columns={columns}
            data={tableData}
            onRowAction={handleRowAction}
            onBulkAction={handleBulkAction}
            loading={!profiles}
          />
        </div>
      </WapCard>
    </div>
  );
};

export default Profiles;
