import { useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { useLicense } from '../context/LicenseContext';
import { DeleteOutlined, InboxOutlined } from '@ant-design/icons';

const FixedAccessibilityIssues = () => {
  const {
    WapCard,
    WapTypography,
    WapAlert,
    WapButton,
    WapInput,
    WapMessage,
    WapSelect,
    WapSpin,
  } = window?.wapComponents || {};
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

  if (!isProPluginActive || !isProActive) {
    return (
      <div className="wap-settings wap-fixed-issues">
        <WapCard className="wap-settings-row wap-fixed-issues__locked">
          <Title level={4} className="wap-header-card-title">
            {__('Fixed Issues', 'website-accessibility')}
          </Title>
          <Text type="secondary" className="wap-header-card-description">
            {__('This page is available in Pro with an active license.', 'website-accessibility')}
          </Text>
        </WapCard>
      </div>
    );
  }

  return (
    <div className="wap-settings wap-fixed-issues">
      <WapCard className="wap-settings-row wap-header-card wap-fixed-issues-header">
        <div className="wap-fixed-issues-header__inner">
          <div className="wap-header-card-content">
            <Title level={4} className="wap-header-card-title">
              {__('Fixed Issues', 'website-accessibility')}
            </Title>
            <Text type="secondary" className="wap-header-card-description">
              {__('Recently saved fixes from Accessibility Checker.', 'website-accessibility')}
            </Text>
          </div>
        </div>
      </WapCard>

      <WapCard className="wap-settings-row wap-fixed-issues-list-card">
        {error ? (
          <WapAlert
            type="error"
            showIcon
            message={__('Could not load fixed issues.', 'website-accessibility')}
            description={error}
            className="wap-fixed-issues__alert"
          />
        ) : null}

        <div className="wap-fixed-issues__toolbar">
          <div className="wap-fixed-issues__toolbar-start">
            <WapInput
              className="wap-fixed-issues__search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={__('Search issue, value, xpath, page...', 'website-accessibility')}
              allowClear
            />
            <WapSelect
              className="wap-fixed-issues__filter"
              value={issueFilter}
              onChange={(value) => setIssueFilter(value || 'all')}
            >
              <WapSelect.Option value="all">{__('All issues', 'website-accessibility')}</WapSelect.Option>
              {issueOptions.map((issueId) => (
                <WapSelect.Option key={issueId} value={issueId}>{issueId}</WapSelect.Option>
              ))}
            </WapSelect>
            <label className="wap-fixed-issues__select-all">
              <input
                type="checkbox"
                checked={isAllCurrentPageSelected}
                onChange={toggleSelectAllCurrentPage}
                disabled={pagedItems.length === 0 || saving}
              />
              <span>{__('Select page', 'website-accessibility')}</span>
            </label>
            {selectedCount > 0 ? (
              <span className="wap-fixed-issues__selected-pill">
                {selectedCount} {__('selected', 'website-accessibility')}
              </span>
            ) : null}
          </div>
          <div className="wap-fixed-issues__toolbar-end">
            <div className="wap-fixed-issues__page-size-wrap">
              <span className="wap-fixed-issues__per-page-label">{__('Per page', 'website-accessibility')}</span>
              <WapSelect
                className="wap-fixed-issues__page-size"
                value={String(pageSize)}
                aria-label={__('Items per page', 'website-accessibility')}
                onChange={(value) => {
                  setPageSize(Number(value) || 6);
                  setCurrentPage(1);
                }}
              >
                <WapSelect.Option value="6">6</WapSelect.Option>
                <WapSelect.Option value="10">10</WapSelect.Option>
                <WapSelect.Option value="20">20</WapSelect.Option>
                <WapSelect.Option value="30">30</WapSelect.Option>
                <WapSelect.Option value="40">40</WapSelect.Option>
                <WapSelect.Option value="50">50</WapSelect.Option>
              </WapSelect>
            </div>
            <WapButton
              type="default"
              danger
              className="wap-fixed-issues__bulk-delete"
              disabled={selectedCount === 0 || saving}
              onClick={deleteSelected}
              icon={<DeleteOutlined />}
            >
              {__('Delete Selected', 'website-accessibility')}
            </WapButton>
          </div>
        </div>

        {loading ? (
          <div className="wap-fixed-issues__loading">
            <WapSpin size="large" />
          </div>
        ) : null}

        {!loading && !error && sortedItems.length === 0 ? (
          <div className="wap-fixed-issues__empty" role="status">
            <div className="wap-fixed-issues__empty-visual" aria-hidden="true">
              <InboxOutlined />
            </div>
            <Title level={5} className="wap-fixed-issues__empty-title">
              {__('No fixed accessibility issues yet', 'website-accessibility')}
            </Title>
            <Text type="secondary" className="wap-fixed-issues__empty-text">
              {__(
                'Saved fixes from the Accessibility Checker will appear here so you can review or remove them.',
                'website-accessibility',
              )}
            </Text>
          </div>
        ) : null}

        {!loading && sortedItems.length > 0 ? (
          <>
            <ul className="wap-fixed-issues__list">
              {pagedItems.map((entry, index) => {
                const key = entry?.id || `${entry?.issue_id || 'issue'}-${index}`;
                const isEditing = editingId === entry?.id;
                const updatedAt = entry?.updated_at || entry?.created_at || '';
                const isSelected = selectedIds.includes(entry?.id);
                return (
                  <li key={key} className="wap-fixed-issues__item">
                    <div className="wap-fixed-issues__item-top">
                      <label className="wap-fixed-issues__check">
                        <input
                          type="checkbox"
                          checked={!!isSelected}
                          onChange={() => toggleSelectItem(entry?.id)}
                          disabled={saving}
                        />
                      </label>
                      <div className="wap-fixed-issues__item-head">
                        <code className="wap-fixed-issues__issue-id">{entry?.issue_id || __('N/A', 'website-accessibility')}</code>
                        {updatedAt ? (
                          <time className="wap-fixed-issues__time" dateTime={updatedAt}>{updatedAt}</time>
                        ) : null}
                      </div>
                    </div>

                    <dl className="wap-fixed-issues__meta">
                      <div className="wap-fixed-issues__meta-row">
                        <dt>{__('XPath', 'website-accessibility')}</dt>
                        <dd title={entry?.xpath || ''}>{entry?.xpath || '—'}</dd>
                      </div>
                      <div className="wap-fixed-issues__meta-row">
                        <dt>{__('Page ID', 'website-accessibility')}</dt>
                        <dd>{entry?.page_identifier || '—'}</dd>
                      </div>
                    </dl>

                    {isEditing ? (
                      <WapInput.TextArea
                        className="wap-fixed-issues__textarea"
                        rows={2}
                        value={editForm.value}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, value: e.target.value }))}
                        placeholder={__('Value', 'website-accessibility')}
                      />
                    ) : (
                      <div className="wap-fixed-issues__value-block">
                        <span className="wap-fixed-issues__value-label">{__('Value', 'website-accessibility')}</span>
                        <span className="wap-fixed-issues__value-text">{entry?.value || '—'}</span>
                      </div>
                    )}

                    <div className="wap-fixed-issues__item-actions">
                      {isEditing ? (
                        <>
                          <WapButton
                            type="primary"
                            className="wap-fixed-issues__btn-save"
                            loading={saving}
                            onClick={() => saveEdit(entry)}
                          >
                            {__('Save', 'website-accessibility')}
                          </WapButton>
                          <WapButton
                            type="default"
                            className="wap-fixed-issues__btn-secondary"
                            disabled={saving}
                            onClick={cancelEdit}
                          >
                            {__('Cancel', 'website-accessibility')}
                          </WapButton>
                        </>
                      ) : (
                        <WapButton
                          type="default"
                          className="wap-fixed-issues__btn-secondary"
                          disabled={saving}
                          onClick={() => startEdit(entry)}
                        >
                          {__('Edit', 'website-accessibility')}
                        </WapButton>
                      )}
                      <WapButton
                        danger
                        type="default"
                        className="wap-fixed-issues__btn-delete"
                        icon={<DeleteOutlined />}
                        loading={saving}
                        onClick={() => deleteItem(entry)}
                        aria-label={__('Delete', 'website-accessibility')}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>

            {sortedItems.length > pageSize ? (
              <div className="wap-fixed-issues__pagination">
                <WapButton
                  type="default"
                  className="wap-fixed-issues__page-btn"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  {__('Previous', 'website-accessibility')}
                </WapButton>
                <Text className="wap-fixed-issues__page-indicator">
                  {__('Page', 'website-accessibility')} {currentPage} {__('of', 'website-accessibility')} {totalPages}
                </Text>
                <WapButton
                  type="default"
                  className="wap-fixed-issues__page-btn"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  {__('Next', 'website-accessibility')}
                </WapButton>
              </div>
            ) : null}
          </>
        ) : null}
      </WapCard>
    </div>
  );
};

export default FixedAccessibilityIssues;
