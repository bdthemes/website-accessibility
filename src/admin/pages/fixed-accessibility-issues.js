import { useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { useLicense } from '../context/LicenseContext';
import { DeleteOutlined } from '@ant-design/icons';

const FixedAccessibilityIssues = () => {
  const { WapCard, WapTypography, WapAlert, WapSpace, WapButton, WapInput, WapMessage, WapSelect } = window?.wapComponents || {};
  const { Title, Text } = WapTypography || {};
  const { isProPluginActive, isProActive } = useLicense();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState('');
  const [editForm, setEditForm] = useState({ value: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [issueFilter, setIssueFilter] = useState('all');

  const fetchFixedIssues = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiFetch({
        path: '/one-accessibility/v1/checker-fix-rules?include_all=1',
      });
      setItems(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      setError(err?.message || __('Failed to load fixed issues.', 'website-accessibility'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFixedIssues();
  }, []);

  const issueOptions = useMemo(() => {
    const unique = Array.from(
      new Set(
        items
          .map((item) => (item?.issue_id || '').trim())
          .filter(Boolean)
      )
    );
    return unique.sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return items.filter((item) => {
      const issueId = (item?.issue_id || '').toLowerCase();
      const value = (item?.value || '').toLowerCase();
      const xpath = (item?.xpath || '').toLowerCase();
      const pageIdentifier = (item?.page_identifier || '').toLowerCase();

      const issueMatch = issueFilter === 'all' ? true : item?.issue_id === issueFilter;
      const textMatch = q === '' ? true : (
        issueId.includes(q) ||
        value.includes(q) ||
        xpath.includes(q) ||
        pageIdentifier.includes(q)
      );

      return issueMatch && textMatch;
    });
  }, [items, searchText, issueFilter]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const aTime = Date.parse(a?.updated_at || a?.created_at || 0);
      const bTime = Date.parse(b?.updated_at || b?.created_at || 0);
      return bTime - aTime;
    });
  }, [filteredItems]);
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedItems.slice(start, start + pageSize);
  }, [sortedItems, currentPage, pageSize]);
  const pageItemIds = useMemo(
    () => pagedItems.map((entry) => entry?.id).filter(Boolean),
    [pagedItems]
  );
  const selectedCount = selectedIds.length;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setSelectedIds([]);
  }, [currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [searchText, issueFilter]);

  const startEdit = (item) => {
    setEditingId(item?.id || '');
    setEditForm({
      value: item?.value || '',
    });
  };

  const cancelEdit = () => {
    setEditingId('');
    setEditForm({ value: '' });
  };

  const saveEdit = async (item) => {
    if (!item?.id) return;
    setSaving(true);
    try {
      const payload = {
        id: item.id,
        page_identifier: item.page_identifier || '',
        issue_id: item.issue_id || '',
        xpath: item.xpath || '',
        value: (editForm.value || '').trim(),
        inputs: item.inputs || {},
        causes: item.causes || [],
        fix_fields: item.fix_fields || [],
        action: item.action || item.issue_id || '',
      };

      await apiFetch({
        path: '/one-accessibility/v1/checker-fix-rules',
        method: 'POST',
        data: payload,
      });

      setItems((prev) => prev.map((entry) => (
        entry?.id === item.id
          ? { ...entry, value: payload.value, updated_at: new Date().toISOString() }
          : entry
      )));

      WapMessage?.success?.({
        content: __('Fixed issue updated successfully.', 'website-accessibility'),
        style: { marginBlockStart: 20 },
      });
      cancelEdit();
    } catch (err) {
      WapMessage?.error?.({
        content: err?.message || __('Failed to update fixed issue.', 'website-accessibility'),
        style: { marginBlockStart: 20 },
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (item) => {
    if (!item?.id || !item?.page_identifier) return;
    setSaving(true);
    try {
      await apiFetch({
        path: `/one-accessibility/v1/checker-fix-rules/${item.id}?page_identifier=${encodeURIComponent(item.page_identifier)}`,
        method: 'DELETE',
      });

      setItems((prev) => prev.filter((entry) => entry?.id !== item.id));
      setSelectedIds((prev) => prev.filter((id) => id !== item.id));
      setCurrentPage((prevPage) => {
        const remaining = Math.max(0, sortedItems.length - 1);
        const maxPage = Math.max(1, Math.ceil(remaining / pageSize));
        return Math.min(prevPage, maxPage);
      });
      if (editingId === item.id) {
        cancelEdit();
      }
      WapMessage?.success?.({
        content: __('Fixed issue deleted.', 'website-accessibility'),
        style: { marginBlockStart: 20 },
      });
    } catch (err) {
      WapMessage?.error?.({
        content: err?.message || __('Failed to delete fixed issue.', 'website-accessibility'),
        style: { marginBlockStart: 20 },
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleSelectItem = (id) => {
    if (!id) return;
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const isAllCurrentPageSelected = pageItemIds.length > 0 && pageItemIds.every((id) => selectedIds.includes(id));

  const toggleSelectAllCurrentPage = () => {
    if (isAllCurrentPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageItemIds.includes(id)));
      return;
    }
    setSelectedIds((prev) => Array.from(new Set([...prev, ...pageItemIds])));
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const selectedItems = sortedItems.filter((item) => selectedIds.includes(item?.id));
    if (selectedItems.length === 0) return;

    setSaving(true);
    try {
      const succeededIds = [];
      const failedIds = [];

      // Sequential delete is more reliable than firing many requests at once.
      for (const item of selectedItems) {
        const itemId = item?.id;
        if (!itemId || !item?.page_identifier) {
          if (itemId) failedIds.push(itemId);
          continue;
        }
        try {
          await apiFetch({
            path: `/one-accessibility/v1/checker-fix-rules/${item.id}?page_identifier=${encodeURIComponent(item.page_identifier)}`,
            method: 'DELETE',
          });
          succeededIds.push(itemId);
        } catch (e) {
          failedIds.push(itemId);
        }
      }

      if (succeededIds.length > 0) {
        setItems((prev) => prev.filter((item) => !succeededIds.includes(item?.id)));
      }

      // Keep failed ones selected so user can retry quickly.
      setSelectedIds(failedIds);

      if (failedIds.length === 0) {
        WapMessage?.success?.({
          content: __('Selected fixed issues deleted.', 'website-accessibility'),
          style: { marginBlockStart: 20 },
        });
      } else if (succeededIds.length > 0) {
        WapMessage?.warning?.({
          content: `${succeededIds.length} ${__('deleted,', 'website-accessibility')} ${failedIds.length} ${__('failed. Please retry.', 'website-accessibility')}`,
          style: { marginBlockStart: 20 },
        });
      } else {
        WapMessage?.error?.({
          content: __('Failed to delete selected items.', 'website-accessibility'),
          style: { marginBlockStart: 20 },
        });
      }
    } catch (err) {
      WapMessage?.error?.({
        content: err?.message || __('Failed to delete selected items.', 'website-accessibility'),
        style: { marginBlockStart: 20 },
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isProPluginActive || !isProActive) {
    return (
      <div className="wap-settings">
        <WapCard className="wap-settings-row">
          <Title level={4}>{__('Fixed Accessibility Issues', 'website-accessibility')}</Title>
          <Text type="secondary">
            {__('This page is available in Pro with an active license.', 'website-accessibility')}
          </Text>
        </WapCard>
      </div>
    );
  }

  return (
    <div className="wap-settings wap-fixed-issues">
      <WapCard className="wap-settings-row wap-header-card">
        <Title level={4} className="wap-header-card-title">
          {__('Fixed Accessibility Issues', 'website-accessibility')}
        </Title>
        <Text type="secondary" className="wap-header-card-description">
          {__('Recently saved fixes from Accessibility Checker.', 'website-accessibility')}
        </Text>
      </WapCard>

      <WapCard className="wap-settings-row">
        {error ? (
          <WapAlert
            type="error"
            showIcon
            message={__('Could not load fixed issues.', 'website-accessibility')}
            description={error}
          />
        ) : null}
        <div className="oachecker-recently-fixed">
          <div className="oachecker-recently-fixed__toolbar oachecker-recently-fixed__toolbar--primary">
            <div className="oachecker-recently-fixed__toolbar-left">
              <WapInput
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder={__('Search issue, value, xpath, page...', 'website-accessibility')}
                allowClear
                style={{ minWidth: 280 }}
              />
              <WapSelect
                value={issueFilter}
                onChange={(value) => setIssueFilter(value || 'all')}
                style={{ minWidth: 220 }}
              >
                <WapSelect.Option value="all">{__('All issues', 'website-accessibility')}</WapSelect.Option>
                {issueOptions.map((issueId) => (
                  <WapSelect.Option key={issueId} value={issueId}>{issueId}</WapSelect.Option>
                ))}
              </WapSelect>
              <label className="oachecker-recently-fixed__select-all">
                <input
                  type="checkbox"
                  checked={isAllCurrentPageSelected}
                  onChange={toggleSelectAllCurrentPage}
                  disabled={pagedItems.length === 0 || saving}
                />
                <span>{__('Select page', 'website-accessibility')}</span>
              </label>
              {selectedCount > 0 && (
                <Text>{selectedCount} {__('selected', 'website-accessibility')}</Text>
              )}
            </div>
            <div className="oachecker-recently-fixed__toolbar-right">
              <WapSelect
                value={String(pageSize)}
                onChange={(value) => {
                  setPageSize(Number(value) || 6);
                  setCurrentPage(1);
                }}
                style={{ minWidth: 120 }}
              >
                <WapSelect.Option value="6">6</WapSelect.Option>
                <WapSelect.Option value="10">10</WapSelect.Option>
                <WapSelect.Option value="20">20</WapSelect.Option>
                <WapSelect.Option value="30">30</WapSelect.Option>
                <WapSelect.Option value="40">40</WapSelect.Option>
                <WapSelect.Option value="50">50</WapSelect.Option>
                <WapSelect.Option value="60">60</WapSelect.Option>
                <WapSelect.Option value="70">70</WapSelect.Option>
                <WapSelect.Option value="80">80</WapSelect.Option>
                <WapSelect.Option value="90">90</WapSelect.Option>
                <WapSelect.Option value="100">100</WapSelect.Option>
              </WapSelect>
              <WapButton
                danger
                ghost
                disabled={selectedCount === 0 || saving}
                onClick={deleteSelected}
                icon={<DeleteOutlined />}
              >
                {__('Delete Selected', 'website-accessibility')}
              </WapButton>
            </div>
          </div>
        </div>
        {!loading && !error && sortedItems.length === 0 ? (
          <WapAlert
            type="info"
            showIcon
            message={__('No fixed accessibility issues found yet.', 'website-accessibility')}
          />
        ) : (
          <div className="oachecker-recently-fixed">
            <WapSpace direction="vertical" gap={10} style={{ width: '100%' }}>
              {pagedItems.map((entry, index) => {
                const key = entry?.id || `${entry?.issue_id || 'issue'}-${index}`;
                const isEditing = editingId === entry?.id;
                const updatedAt = entry?.updated_at || entry?.created_at || '';
                const isSelected = selectedIds.includes(entry?.id);
                return (
                  <WapCard key={key} size="small" className="oachecker-recently-fixed__card">
                    <div className="oachecker-recently-fixed__row">
                      <label className="oachecker-recently-fixed__select-one">
                        <input
                          type="checkbox"
                          checked={!!isSelected}
                          onChange={() => toggleSelectItem(entry?.id)}
                          disabled={saving}
                        />
                      </label>
                      <Text strong>{entry?.issue_id || __('N/A', 'website-accessibility')}</Text>
                    </div>

                    <Text className="oachecker-recently-fixed__meta">
                      {__('XPath:', 'website-accessibility')} {entry?.xpath || __('N/A', 'website-accessibility')}
                    </Text>
                    <Text className="oachecker-recently-fixed__meta">
                      {__('Page Identifier:', 'website-accessibility')} {entry?.page_identifier || __('N/A', 'website-accessibility')}
                    </Text>
                    <Text className="oachecker-recently-fixed__meta">
                      {__('Updated at:', 'website-accessibility')} {updatedAt || __('N/A', 'website-accessibility')}
                    </Text>

                    {isEditing ? (
                      <WapInput.TextArea
                        rows={3}
                        value={editForm.value}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, value: e.target.value }))}
                        placeholder={__('Value', 'website-accessibility')}
                      />
                    ) : (
                      <Text className="oachecker-recently-fixed__meta">
                        {__('Value:', 'website-accessibility')} {entry?.value || __('N/A', 'website-accessibility')}
                      </Text>
                    )}

                    <div className="oachecker-recently-fixed__actions">
                      {isEditing ? (
                        <>
                          <WapButton
                            size="middle"
                            type="primary"
                            className="oachecker-recently-fixed__action-save"
                            loading={saving}
                            onClick={() => saveEdit(entry)}
                          >
                            {__('Save', 'website-accessibility')}
                          </WapButton>
                          <WapButton
                            size="middle"
                            type="default"
                            className="oachecker-recently-fixed__action-edit"
                            disabled={saving}
                            onClick={cancelEdit}
                          >
                            {__('Cancel', 'website-accessibility')}
                          </WapButton>
                        </>
                      ) : (
                        <WapButton
                          size="middle"
                          type="default"
                          className="oachecker-recently-fixed__action-edit"
                          disabled={saving}
                          onClick={() => startEdit(entry)}
                        >
                          {__('Edit', 'website-accessibility')}
                        </WapButton>
                      )}
                      <WapButton
                        size="middle"
                        danger
                        type="default"
                        className="oachecker-recently-fixed__action-delete"
                        icon={<DeleteOutlined />}
                        loading={saving}
                        onClick={() => deleteItem(entry)}
                        aria-label={__('Delete', 'website-accessibility')}
                      />
                    </div>
                  </WapCard>
                );
              })}
            </WapSpace>
            {sortedItems.length > pageSize && (
              <div className="oachecker-recently-fixed__actions" style={{ justifyContent: 'space-between' }}>
                <WapButton
                  type="default"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  {__('Previous', 'website-accessibility')}
                </WapButton>
                <Text>
                  {__('Page', 'website-accessibility')} {currentPage} {__('of', 'website-accessibility')} {totalPages}
                </Text>
                <WapButton
                  type="default"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  {__('Next', 'website-accessibility')}
                </WapButton>
              </div>
            )}
          </div>
        )}
      </WapCard>
    </div>
  );
};

export default FixedAccessibilityIssues;
