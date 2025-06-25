import { useState } from '@wordpress/element';
import { Table, Input, Button, Space, Dropdown } from 'antd';

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
}) => {
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

  const extendedColumns = hasActionsColumn
    ? columns
    : [
      ...columns,
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'edit',
                  label: 'Edit',
                  onClick: () => onRowAction && onRowAction('edit', record),
                },
                {
                  key: 'quick_edit',
                  label: 'Quick Edit',
                  onClick: () => onRowAction && onRowAction('quick_edit', record),
                },
                {
                  key: 'trash',
                  label: 'Trash',
                  onClick: () => onRowAction && onRowAction('trash', record),
                },
                {
                  key: 'view',
                  label: 'View',
                  onClick: () => onRowAction && onRowAction('view', record),
                },
              ],
            }}
            trigger={['click']}
          >
            <Button icon={<span className="dashicons dashicons-ellipsis" />} />
          </Dropdown>
        ),
      },
    ];


  return (
    <div>
      <Space className="wap-post-table__searchbar">
        <Input
          placeholder="Search posts"
          value={searchText}
          onChange={handleSearch}
          prefix={<span className="dashicons dashicons-search" />}
          allowClear
        />
        {selectedRowKeys.length > 0 && (
          <Dropdown
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
            <Button type="primary">
              Bulk Actions <span className="dashicons dashicons-arrow-down-alt2" />
            </Button>
          </Dropdown>
        )}
      </Space>
      <Table
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