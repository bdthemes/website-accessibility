import { Card, Button, Row, Col, Typography, Tag, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { __ } from '@wordpress/i18n';
import PostTable from '../components/post-table';
import PresetQuickEdit from '../components/preset-quick-edit';
import { useHistory } from '../router';
const { Title } = Typography;
import { useSelect, useDispatch } from "@wordpress/data";
import { STORE_NAME } from "../store";
import { useMemo, useState } from '@wordpress/element';

const columns = [
  { title: __('Name', 'website-accessibility'), dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
  { title: __('Created', 'website-accessibility'), dataIndex: 'created', key: 'created', sorter: (a, b) => new Date(a.created) - new Date(b.created) },
  { title: __('Condition', 'website-accessibility'), dataIndex: 'condition', key: 'condition'},
  { title: __('Status', 'website-accessibility'), dataIndex: 'status', key: 'status'},
];

const Presets = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const history = useHistory();
  const { setPresetFilters, deletePreset, updatePreset } = useDispatch(STORE_NAME);
  const { filters: rawFilters, presets } = useSelect((select) => {
    const store = select(STORE_NAME);
    const filters = store.getPresetFilters();
    return {
      filters,
      presets: store.getPresets(filters),
    };
  }, []);
  
  const filters = useMemo(() => rawFilters, [JSON.stringify(rawFilters)]);
  
  const isResolving = useSelect((select) => {
    return select('core').isResolving('getEntityRecords', ['postType', 'wap_preset', filters || {}]);
  }, [filters]);

  const isDeleting = useSelect((select) => {
    return select('core').isResolving('deleteEntityRecord', ['postType', 'wap_preset', filters || {}]);
  }, [filters]);

  const navigate = (path) => {
    history.push({
      page: path,
    });
  };

  const data = presets?.map((preset) => {
    const content = JSON.parse(preset?.content?.raw);
    const presetData = content?.preset;

    return {
      id: preset.id,
      name: preset?.title?.rendered,
      created: new Date(preset?.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      condition: presetData?.condition,
      status: presetData?.active ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>,
    };
  });

  const handleQuickEdit = (record) => {
    setSelectedPreset(record);
    setDrawerVisible(true);
  };

  const handleDrawerClose = () => {
    setDrawerVisible(false);
    setSelectedPreset(null);
  };

  const handleEdit = (record) => {
    history.push({
      page: 'website-accessibility-presets-edit',
      id: record?.id,
    });
  };

  const handlePreview = (record) => {
    history.push({
      page: 'website-accessibility-presets-preview',
      id: record?.id,
    });
  };

  return (
    <div className="wap-presets">
        <Card className='wap-header-card'>
              <Title level={2} className='wap-header-card-title'>
                {__('Accessibility Presets', 'website-accessibility')}
              </Title>
              <Button type="primary" onClick={() => navigate('website-accessibility-presets-create')}>
                <Space>
                  <span className="dashicons dashicons-plus-alt2"/>
                  {__('Add New Preset', 'website-accessibility')}
                </Space>
                  
              </Button>
        </Card>
        <Card>
          <div>
            <PostTable
              columns={columns}
              data={data}
              onSearch={(value) => {
                setPresetFilters({
                  search: value,
                });
              }}
              loading={isResolving || isDeleting}
              onRowAction={(action, record) => {
                switch(action){
                  case 'quick_edit':
                    handleQuickEdit(record);
                    break;
                  case 'trash':
                    deletePreset(record.id);
                    break;
                  case 'edit':
                    handleEdit(record);
                    break;
                  case 'view':
                    handlePreview(record);
                    break;
                }
              }}
              onBulkAction={(action, selectedRowKeys) => {
                switch(action){
                  case 'trash':
                    selectedRowKeys.forEach((id) => {
                      deletePreset(id);
                    });
                    break;
                }
              }}
            />
          </div>
        </Card>

      <PresetQuickEdit
        visible={drawerVisible}
        onClose={handleDrawerClose}
        preset={selectedPreset}
        onUpdate={updatePreset}
      />
    </div>
  );
};

export default Presets; 