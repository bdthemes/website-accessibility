import { __ } from '@wordpress/i18n';
import PostTable from '../components/post-table';
import { useHistory } from '../router';
import { useSelect, useDispatch } from "@wordpress/data";
import { STORE_NAME } from "../store";
import { useMemo } from '@wordpress/element';


const columns = [
  { title: __('Name', 'website-accessibility'), dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
  { title: __('Created', 'website-accessibility'), dataIndex: 'created', key: 'created', sorter: (a, b) => new Date(a.created) - new Date(b.created) },
  { title: __('Condition', 'website-accessibility'), dataIndex: 'condition', key: 'condition' },
  { title: __('Status', 'website-accessibility'), dataIndex: 'status', key: 'status' },
];

const Presets = () => {
  const { WapCard, WapButton, WapSpace, WapTag, WapTypography } = window?.wapComponents;
  const { Title, Text } = WapTypography;
  const history = useHistory();
  const { setPresetFilters, deletePreset } = useDispatch(STORE_NAME);
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

  const handleEdit = (record) => {
    history.push({
      page: 'website-accessibility-presets-edit',
      id: record?.id,
    });
  };

  return (
    <div className="wap-settings wap-presets">
      <WapCard className="wap-settings-row wap-header-card wap-presets-header">
        <div className="wap-presets-header__inner">
          <div className="wap-header-card-content" data-tour="wap-tour-tour-preview">
            <Title level={4} className="wap-header-card-title">
              {__('Presets', 'website-accessibility')}
            </Title>
            <Text type="secondary" className="wap-header-card-description">
              {__('Manage accessibility presets and where they apply across your site.', 'website-accessibility')}
            </Text>
          </div>
          <div className="wap-presets-header__actions">
            <span data-tour="wap-tour-presets-add-new" style={{ display: 'inline-flex' }}>
              <WapButton type="primary" onClick={() => navigate('website-accessibility-presets-create')}>
                <WapSpace size="small">
                  <span className="dashicons dashicons-plus-alt2" />
                  {__('Add New Preset', 'website-accessibility')}
                </WapSpace>
              </WapButton>
            </span>
          </div>
        </div>
      </WapCard>

      <WapCard className="wap-settings-row wap-presets-table-card">
        <div>
          <PostTable
            columns={columns}
            data={data}
            firstRowEditDataTour="wap-tour-presets-edit-first"
            onSearch={(value) => {
              setPresetFilters({
                search: value,
              });
            }}
            loading={isResolving || isDeleting}
            rowActions={[
              {
                key: 'edit',
                label: 'Edit',
                onClick: handleEdit,
              },
              {
                key: 'trash',
                label: 'Trash',
                onClick: (record) => deletePreset(record.id),
              },
            ]}
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
    </div>
  );
};

export default Presets; 
