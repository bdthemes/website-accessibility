import { useState } from '@wordpress/element';

/**
 * PostTable - WordPress-style post table with Ant Design
 *
 * @param {Array} columns - Column definitions (will be extended with selection/actions)
 * @param {Array} data - Array of post objects
 * @param {boolean} loading - Show loading spinner
 * @param {function} onBulkAction - Handler for bulk actions
 * @param {function} onRowAction - Handler for row actions (edit, delete, etc.)
 * @param {object} pagination - Optional pagination config
 * @param {function} onSearch - Optional search handler
 * @param {object} rowSelectionProps - Optional row selection props
 * @param {object} statusMap - Optional status color/label map
 * @param {React.ReactNode} extra - Optional node on the right of the toolbar (e.g. Add button)
 * @param {Array} rowActions - Optional custom row actions for the default actions menu
 */

const PostTable = ({
  columns,
  data,
  loading = false,
  onBulkAction,
  onRowAction,
  pagination = { pageSize: 10 },
  onSearch,
  rowSelectionProps = {},
  extra = null,
  rowActions = null,
}) => {
  const { WapInput, WapTable, WapButton, WapDropdown, WapSpace } = window?.wapComponents;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState('');

  // Bulk selection
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    ...rowSelectionProps,
  };

  // Search/filter
  const handleSearch = e => {
    setSearchText(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  // Add status and actions columns if not present
  const hasActionsColumn = columns.some(col => col.key === 'actions');
  const defaultRowActions = [
    {
      key: 'edit',
      label: 'Edit',
      onClick: record => onRowAction && onRowAction('edit', record),
    },
    {
      key: 'trash',
      label: 'Trash',
      onClick: record => onRowAction && onRowAction('trash', record),
    },
  ];

  const extendedColumns = hasActionsColumn
    ? columns
    : [
      ...columns,
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => {
          const actionItems = (rowActions || defaultRowActions).map(action => ({
            ...action,
            onClick: () => action.onClick(record),
          }));

          return (
            <div className="wap-post-table__row-actions">
              {actionItems.map((action) => (
                <WapButton
                  key={action.key}
                  size="small"
                  type={action.key === 'trash' ? 'default' : 'primary'}
                  ghost={action.key === 'edit'}
                  danger={action.key === 'trash'}
                  onClick={action.onClick}
                >
                  {action.label}
                </WapButton>
              ))}
            </div>
          );
        },
      },
    ];


  return (
    <div>
      <div className="wap-post-table__toolbar">
        <div className="wap-post-table__search-wrap">
        <WapSpace className="wap-post-table__searchbar" size="middle" wrap>
        <WapInput
          placeholder="Search posts"
          value={searchText}
          onChange={handleSearch}
          prefix={<span className="dashicons dashicons-search" />}
          allowClear
        />
        {selectedRowKeys.length > 0 && (
          <WapDropdown
            menu={{
              items: [
                {
                  key: 'trash',
                  label: 'Trash',
                  onClick: () => {
                    onBulkAction && onBulkAction('trash', selectedRowKeys);
                    setSelectedRowKeys([]);
                  }
                },
              ]
            }}
            trigger={['click']}
          >
            <WapButton type="primary">
              Bulk Actions <span className="dashicons dashicons-arrow-down-alt2" />
            </WapButton>
          </WapDropdown>
        )}
      </WapSpace>
        </div>
        {extra ? <div className="wap-post-table__extra">{extra}</div> : null}
      </div>
      <WapTable
        rowSelection={rowSelection}
        columns={extendedColumns}
        dataSource={data}
        loading={loading}
        rowKey={record => record.id || record.key}
        pagination={pagination}
        scroll={{ x: true }}
        sticky={true}
      />
    </div>
  );
};

export default PostTable; 
