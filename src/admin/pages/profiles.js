import { Card, Button, Typography, Dropdown , Space} from 'antd';
import { __ } from '@wordpress/i18n';
import PostTable from '../components/post-table';
import { useHistory } from '../router';
import { useSelect, useDispatch } from '@wordpress/data';
import { STORE_NAME } from '../store';
import ProfilesFallback from '../components/profiles-fallback';
import WapCard from '../../components/wap-card';
import WapButton from '../../components/wap-button';
import WapSpace from '../../components/wap-space';

const { Title } = Typography;

const Profiles = () => {
  const isProActive = window?.websacPro?.isProActive || false;
  const history = useHistory();
  const profiles = useSelect((select) => select(STORE_NAME).getProfiles());
  const { deleteProfile } = useDispatch(STORE_NAME);

  const handleCreateProfile = () => {
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
        <Dropdown
          menu={{
            items: [
              { key: 'edit', label: 'Edit', onClick: () => handleRowAction('edit', record) },
              { key: 'trash', label: 'Trash', onClick: () => handleRowAction('trash', record) },
            ]
          }}
          trigger={['click']}
        >
          <WapButton icon={<span className="dashicons dashicons-ellipsis" />} />
        </Dropdown>
      ),
    }
  ];

  if (!isProActive) {
    return (
      <ProfilesFallback />
    )
  }

  return (
    <div className="wap-profiles">
      <WapCard className='wap-header-card'>
          <Title level={2} className='wap-header-card-title'>
            {__('User Accessibility Profiles', 'website-accessibility')}
          </Title>
          <WapButton 
                type="primary" 
                onClick={handleCreateProfile}
                size='large'
              >
                <WapSpace>
                  <span className="dashicons dashicons-plus-alt2"/>
                  {__('Add New Profile', 'website-accessibility')}
                </WapSpace>
              </WapButton>
      </WapCard>
      <WapCard >
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