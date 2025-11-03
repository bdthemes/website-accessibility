import { __ } from '@wordpress/i18n';
import PostTable from '../components/post-table';
import PresetQuickEdit from '../components/preset-quick-edit';
import { useHistory } from '../router';
import { useSelect, useDispatch } from "@wordpress/data";
import { STORE_NAME } from "../store";
import { useMemo, useState } from '@wordpress/element';


const columns = [
  { title: __('Name', 'website-accessibility'), dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
  { title: __('Created', 'website-accessibility'), dataIndex: 'created', key: 'created', sorter: (a, b) => new Date(a.created) - new Date(b.created) },
  { title: __('Condition', 'website-accessibility'), dataIndex: 'condition', key: 'condition' },
  { title: __('Status', 'website-accessibility'), dataIndex: 'status', key: 'status' },
];

const Presets = () => {
  const { WapCard, WapButton, WapSpace, WapTypography, WapTag } = window?.wapComponents;
  const { Title } = WapTypography;
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
    return select('core').isResolving('getEntityRecords', ['postType', 'websac_preset', filters || {}]);
  }, [filters]);

  const isDeleting = useSelect((select) => {
    return select('core').isResolving('deleteEntityRecord', ['postType', 'websac_preset', filters || {}]);
  }, [filters]);

  const navigate = (path) => {
    history.push({
      page: path,
    });
  };

  const data = presets?.map((preset) => {
    const content = JSON.parse(preset?.content?.raw);
    const presetData = content?.preset;

    let conditionText = '';

    if (presetData?.condition === 'archive') {
      conditionText = __('Archive', 'website-accessibility');

      if (presetData?.specificArchive?.length) {
        conditionText += ` (${presetData?.specificArchive?.length})`;
      }
    } else if (presetData?.condition === 'singular') {
      conditionText = __('Singular', 'website-accessibility');

      if (presetData?.specificPosts?.length) {
        conditionText += ` (${presetData?.specificPosts?.length})`;
      }
    } else {
      conditionText = __('Entire Site', 'website-accessibility');
    }

    return {
      id: preset.id,
      name: preset?.title?.rendered,
      created: new Date(preset?.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      condition: conditionText,
      status: presetData?.active ? <WapTag color="green">Active</WapTag> : <WapTag color="red">Inactive</WapTag>,
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
      <WapCard className='wap-header-card'>
        <Title level={2} className='wap-header-card-title'>
          {__('Accessibility Presets', 'website-accessibility')}
        </Title>
        <WapButton type="primary" size='large' onClick={() => navigate('website-accessibility-presets-create')}>
          <WapSpace>
            <span className="dashicons dashicons-plus-alt2" />
            {__('Add New Preset', 'website-accessibility')}
          </WapSpace>

        </WapButton>
      </WapCard>
      <WapCard>
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
              switch (action) {
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
              switch (action) {
                case 'trash':
                  selectedRowKeys.forEach((id) => {
                    deletePreset(id);
                  });
                  break;
              }
            }}
          />
        </div>
      </WapCard>

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