import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';
import { __, _x, sprintf } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { useLicense } from '../context/LicenseContext';
import { DeleteOutlined, DownOutlined, DownloadOutlined, InboxOutlined } from '@ant-design/icons';

/**
 * Minimal copy for beginners: one short explanation per saved issue code.
 */
const BEGINNER_ISSUE_META = {
  missing_alt: {
    summary: __('An image needed a short description people can hear in a screen reader.', 'website-accessibility'),
    spotHint: __('image', 'website-accessibility'),
  },
  empty_alt: {
    summary: __("An image’s description was blank, even though it's not purely decorative.", 'website-accessibility'),
    spotHint: __('image', 'website-accessibility'),
  },
  empty_link: {
    summary: __("A link had no readable name, so visitors couldn't tell where it leads.", 'website-accessibility'),
    spotHint: __('link', 'website-accessibility'),
  },
  link_with_only_image: {
    summary: __('A link contained only an image, with no wording for visitors using assistive tech.', 'website-accessibility'),
    spotHint: __('image link', 'website-accessibility'),
  },
  missing_label: {
    summary: __("A form field didn’t announce what it asked for.", 'website-accessibility'),
    spotHint: __('form field', 'website-accessibility'),
  },
  missing_button_name: {
    summary: __('A button showed no usable name for screen readers (often an icon button).', 'website-accessibility'),
    spotHint: __('button', 'website-accessibility'),
  },
  new_tab_no_notice: {
    summary: __("A link opened a new browser tab without mentioning it first.", 'website-accessibility'),
    spotHint: __('link', 'website-accessibility'),
  },
  low_text_contrast: {
    summary: __("Text colour was adjusted so there's better contrast.", 'website-accessibility'),
    spotHint: __('text', 'website-accessibility'),
  },
  missing_skip_link: {
    summary: __('A “skip to content” shortcut was missing for keyboard visitors.', 'website-accessibility'),
    spotHint: __('whole page layout', 'website-accessibility'),
  },
  radio_missing_name: {
    summary: __("Radio buttons weren’t grouped for assistive tech to understand.", 'website-accessibility'),
    spotHint: __('form choices', 'website-accessibility'),
  },
  checkbox_missing_name: {
    summary: __("A checkbox lacked a usable name.", 'website-accessibility'),
    spotHint: __('form field', 'website-accessibility'),
  },
  missing_lang_attr: {
    summary: __('The whole page lacked a declared language.', 'website-accessibility'),
    spotHint: __('whole page', 'website-accessibility'),
  },
};

function getIssueBeginnerSummary(issueId, catalogDescription) {
  if (BEGINNER_ISSUE_META[issueId]?.summary) {
    return BEGINNER_ISSUE_META[issueId].summary;
  }
  return catalogDescription || '';
}

/** Page name for display: prefers theme title from the server when available */
function displayPageTitle(entry) {
  const t = (entry?.page_title || '').trim();
  if (t) return t;
  return formatPageIdentifier(entry?.page_identifier);
}

/** Base64 XPath for ?websac_xpath (UTF-8 safe). Empty if too large. */
function xpathToHighlightParam(xpathRaw) {
  try {
    const raw = typeof xpathRaw === 'string' ? xpathRaw.trim() : '';
    if (!raw || raw.length > 6200) {
      return '';
    }
    const encoded = encodeURIComponent(
      window.btoa(unescape(encodeURIComponent(raw)))
    );

    return encoded.length <= 9600 ? encoded : '';
  } catch (e) {
    return '';
  }
}

/** Build front-end URL that scrolls to & outlines that element (logged-in admins only). */
function buildFixHighlightPageUrl(pageUrl, xpathRaw) {
  try {
    if (!pageUrl || !xpathRaw) {
      return '';
    }
    const qp = xpathToHighlightParam(xpathRaw);
    if (!qp) {
      return '';
    }
    const u = new URL(
      pageUrl,
      typeof window !== 'undefined' ? window.location.origin : undefined,
    );
    u.searchParams.set('websac_highlight', '1');
    u.searchParams.set('websac_xpath', qp);
    return u.toString();
  } catch (e) {
    return '';
  }
}

function summarizeAppliedFix(issueId, valueRaw) {
  const value = String(valueRaw || '').trim();

  const looksLikeUrl = /^https?:\/\//i.test(value) || /^\/[^/]|^#[\w-]+/i.test(value);
  const hexColor = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);

  if (!value) {
    if (issueId === 'missing_lang_attr') {
      return __('Declared the page language for assistive tech.', 'website-accessibility');
    }
    if (issueId === 'missing_skip_link') {
      return __("Added or updated a shortcut to skip to the main content.", 'website-accessibility');
    }
    return __('Improvement saved.', 'website-accessibility');
  }

  if (hexColor || issueId === 'low_text_contrast') {
    return sprintf(__('Text colour adjusted to "%s"', 'website-accessibility'), value);
  }

  const esc = `"${value}"`;

  switch (issueId) {
    case 'missing_alt':
    case 'empty_alt':
      return sprintf(__('Alternate text saved as %s for the image.', 'website-accessibility'), esc);
    case 'empty_link':
    case 'link_with_only_image':
    case 'missing_button_name':
    case 'missing_label':
      if (looksLikeUrl) {
        return sprintf(__('Address or wording saved as %s.', 'website-accessibility'), esc);
      }
      return sprintf(__('Visible / spoken name saved as %s.', 'website-accessibility'), esc);
    case 'new_tab_no_notice':
      return sprintf(__('Visitors are told before opening new tabs: added %s.', 'website-accessibility'), esc);
    case 'missing_lang_attr':
      return sprintf(__('Page language declared as %s.', 'website-accessibility'), esc);
    case 'radio_missing_name':
    case 'checkbox_missing_name':
      return sprintf(__('Field grouping name saved as %s.', 'website-accessibility'), esc);
    case 'missing_skip_link':
      return sprintf(__('Skip link wording saved as %s.', 'website-accessibility'), esc);
    default:
      return sprintf(__('Saved detail: %s', 'website-accessibility'), esc);
  }
}
const ISSUE_CATALOG = {
  missing_alt: {
    title: __('Missing image alt text', 'website-accessibility'),
    description: __('Image had no alt attribute, so screen readers could not describe it.', 'website-accessibility'),
    severity: 'critical',
    valueLabel: __('Alt text', 'website-accessibility'),
  },
  empty_alt: {
    title: __('Empty image alt text', 'website-accessibility'),
    description: __('Image had a blank alt attribute even though it conveys meaning.', 'website-accessibility'),
    severity: 'minor',
    valueLabel: __('Alt text', 'website-accessibility'),
  },
  empty_link: {
    title: __('Empty link', 'website-accessibility'),
    description: __('Link had no readable text for screen readers.', 'website-accessibility'),
    severity: 'critical',
    valueLabel: __('Link label', 'website-accessibility'),
  },
  link_with_only_image: {
    title: __('Image-only link without label', 'website-accessibility'),
    description: __('Link contained only an image with no alt text or label.', 'website-accessibility'),
    severity: 'critical',
    valueLabel: __('Link label', 'website-accessibility'),
  },
  missing_label: {
    title: __('Form input without a label', 'website-accessibility'),
    description: __('Form field had no label that assistive tech can announce.', 'website-accessibility'),
    severity: 'critical',
    valueLabel: __('Accessible label', 'website-accessibility'),
  },
  missing_button_name: {
    title: __('Button without an accessible name', 'website-accessibility'),
    description: __('Button had no readable name (e.g. icon-only button).', 'website-accessibility'),
    severity: 'critical',
    valueLabel: __('Button name', 'website-accessibility'),
  },
  new_tab_no_notice: {
    title: __('Link opens in a new tab without notice', 'website-accessibility'),
    description: __('Link opened in a new tab without warning the user beforehand.', 'website-accessibility'),
    severity: 'minor',
    valueLabel: __('New tab notice', 'website-accessibility'),
  },
  low_text_contrast: {
    title: __('Low text contrast', 'website-accessibility'),
    description: __('Text color did not have enough contrast against its background.', 'website-accessibility'),
    severity: 'major',
    valueLabel: __('Text color', 'website-accessibility'),
  },
  missing_skip_link: {
    title: __('Missing skip-to-content link', 'website-accessibility'),
    description: __('Keyboard users could not skip past repeated navigation.', 'website-accessibility'),
    severity: 'minor',
    valueLabel: __('Skip link text', 'website-accessibility'),
  },
  radio_missing_name: {
    title: __('Radio group missing a name', 'website-accessibility'),
    description: __('Radio buttons did not share a name, so they were not grouped for screen readers.', 'website-accessibility'),
    severity: 'critical',
    valueLabel: __('Group name', 'website-accessibility'),
  },
  checkbox_missing_name: {
    title: __('Checkbox missing a name', 'website-accessibility'),
    description: __('Checkbox had no name attribute, so its purpose was unclear.', 'website-accessibility'),
    severity: 'major',
    valueLabel: __('Field name', 'website-accessibility'),
  },
  missing_lang_attr: {
    title: __('Page language not set', 'website-accessibility'),
    description: __('The page did not declare a language for screen readers.', 'website-accessibility'),
    severity: 'minor',
    valueLabel: __('Page language', 'website-accessibility'),
  },
};

const SEVERITY_TONE = {
  critical: { color: 'red', label: __('Critical', 'website-accessibility') },
  major: { color: 'orange', label: __('Major', 'website-accessibility') },
  minor: { color: 'gold', label: __('Minor', 'website-accessibility') },
};

function humanizeIssueId(id) {
  if (!id) return __('Accessibility fix', 'website-accessibility');
  return String(id)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getIssueInfo(issueId) {
  const fallback = {
    title: humanizeIssueId(issueId),
    description: '',
    severity: '',
    valueLabel: __('Fixed value', 'website-accessibility'),
  };
  return ISSUE_CATALOG[issueId] ? { ...fallback, ...ISSUE_CATALOG[issueId] } : fallback;
}

function formatPageIdentifier(identifier) {
  if (!identifier) return __('Unknown page', 'website-accessibility');
  const postMatch = String(identifier).match(/^post_(\d+)$/i);
  if (postMatch) {
    return __('Post #', 'website-accessibility') + postMatch[1];
  }
  const pageMatch = String(identifier).match(/^page_(\d+)$/i);
  if (pageMatch) {
    return __('Page #', 'website-accessibility') + pageMatch[1];
  }
  return identifier;
}

function formatFixedAt(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch (e) {
    return date.toLocaleString();
  }
}

/** Row fields for Fixed Issues cards (highlight link + summary line). */
function buildFixedIssueRowModel(entry) {
  const info = getIssueInfo(entry?.issue_id);
  const beginnerSummary = getIssueBeginnerSummary(entry?.issue_id, info.description);
  const appliedLine = summarizeAppliedFix(entry?.issue_id || '', entry?.value);
  const cardSummary = (beginnerSummary || info?.description || '').trim();
  const primaryLine = (cardSummary || appliedLine || '').trim();
  const highlightUrl =
    entry?.page_view_url && entry?.xpath
      ? buildFixHighlightPageUrl(entry.page_view_url, entry.xpath)
      : '';
  const issueTitle = (info?.title || '').trim();
  return { highlightUrl, primaryLine, issueTitle };
}

/** Compact export row: short human-readable report (no edit URLs or duplicate page columns). */
function getFixedIssueExportFields(row) {
  const info = getIssueInfo(row?.issue_id);
  const rowModel = buildFixedIssueRowModel(row);
  const severityLabel = info.severity ? (SEVERITY_TONE[info.severity]?.label || info.severity) : '';
  const shownName = displayPageTitle(row);
  const idLabel = formatPageIdentifier(row?.page_identifier);
  const pageLine =
    idLabel && idLabel !== shownName ? `${shownName} — ${idLabel}` : shownName;

  return {
    issue: info.title,
    severity: severityLabel,
    page: pageLine,
    live_page_url: row?.page_view_url || '',
    summary: rowModel.primaryLine || '',
    saved_at: formatFixedAt(row?.updated_at || row?.created_at),
    issue_code: row?.issue_id || '',
  };
}

/** Escape a cell for RFC-style CSV (Excel-safe with BOM on file). */
function escapeCsvField(value) {
  if (value == null || value === '') {
    return '';
  }
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function buildFixedIssuesCsv(rows) {
  const headers = [
    { key: 'issue', label: 'Issue' },
    { key: 'severity', label: 'Severity' },
    { key: 'page', label: 'Page' },
    { key: 'live_page_url', label: 'Live URL' },
    { key: 'summary', label: 'Summary' },
    { key: 'saved_at', label: 'Saved' },
    { key: 'issue_code', label: 'Issue code' },
  ];
  const lines = [headers.map((h) => escapeCsvField(h.label)).join(',')];
  for (const row of rows) {
    const ex = getFixedIssueExportFields(row);
    lines.push(headers.map((h) => escapeCsvField(ex[h.key])).join(','));
  }
  return lines.join('\r\n');
}

function triggerDownload(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function reportFilenameStem() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

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
    WapDropdown,
  } = window?.wapComponents || {};
  const { Title, Text } = WapTypography || {};
  const { isProPluginActive, isProActive } = useLicense();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
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
      const viewUrl = (item?.page_view_url || '').toLowerCase();

      const titleSearch = ((item?.page_title || '') + '').toLowerCase();
      const issueTitleSearch = (getIssueInfo(item?.issue_id).title || '').toLowerCase();

      const issueMatch = issueFilter === 'all' ? true : item?.issue_id === issueFilter;
      const textMatch = q === '' ? true : (
        issueId.includes(q) ||
        value.includes(q) ||
        xpath.includes(q) ||
        pageIdentifier.includes(q) ||
        viewUrl.includes(q) ||
        titleSearch.includes(q) ||
        issueTitleSearch.includes(q)
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

  const downloadReportCsv = useCallback(() => {
    if (!sortedItems.length) {
      return;
    }
    const csvBody = buildFixedIssuesCsv(sortedItems);
    const bom = '\uFEFF';
    const stem = reportFilenameStem();
    triggerDownload(
      bom + csvBody,
      `fixed-issues-report-${stem}.csv`,
      'text/csv;charset=utf-8;'
    );
    WapMessage?.success?.({
      content: __('Report downloaded (CSV).', 'website-accessibility'),
      style: { marginBlockStart: 20 },
    });
  }, [sortedItems]);

  const downloadReportJson = useCallback(() => {
    if (!sortedItems.length) {
      return;
    }
    const rows = sortedItems.map((row) => {
      const ex = getFixedIssueExportFields(row);
      return {
        issue: ex.issue,
        severity: ex.severity || null,
        page: ex.page,
        live_page_url: ex.live_page_url || null,
        summary: ex.summary || null,
        saved_at: ex.saved_at,
        issue_code: ex.issue_code,
      };
    });
    const payload = {
      exported_from: 'website_accessibility_fixed_issues',
      format_version: 3,
      generated_at: new Date().toISOString(),
      site_url: typeof window !== 'undefined' ? window.websacAdmin?.homeUrl || '' : '',
      filter_note: __(
        'Rows match the current search and filter on the Fixed Issues page.',
        'website-accessibility',
      ),
      row_count: rows.length,
      rows,
    };
    triggerDownload(
      `${JSON.stringify(payload, null, 2)}\n`,
      `fixed-issues-report-${reportFilenameStem()}.json`,
      'application/json;charset=utf-8;'
    );
    WapMessage?.success?.({
      content: __('Report downloaded (JSON).', 'website-accessibility'),
      style: { marginBlockStart: 20 },
    });
  }, [sortedItems]);

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
          <div className="wap-fixed-issues-header__text">
            <div className="wap-header-card-content">
              <Title level={4} className="wap-header-card-title">
                {__('Fixed Issues', 'website-accessibility')}
              </Title>
              <Text type="secondary" className="wap-header-card-description">
                {__('A simple list of what was improved — which page it was on, and what visitors now get.', 'website-accessibility')}
              </Text>
            </div>
          </div>
          <div className="wap-fixed-issues-header__actions">
            <WapDropdown
              trigger={['click']}
              disabled={sortedItems.length === 0 || loading || saving}
              menu={{
                items: [
                  {
                    key: 'csv',
                    label: __('CSV (Excel, Sheets)', 'website-accessibility'),
                  },
                  {
                    key: 'json',
                    label: __('JSON (backup / developers)', 'website-accessibility'),
                  },
                ],
                onClick: ({ key }) => {
                  if (key === 'csv') {
                    downloadReportCsv();
                  } else if (key === 'json') {
                    downloadReportJson();
                  }
                },
              }}
            >
              <WapButton
                type="default"
                className="wap-fixed-issues__download"
                icon={<DownloadOutlined />}
                disabled={sortedItems.length === 0 || loading || saving}
              >
                {__('Download report', 'website-accessibility')}
                <DownOutlined className="wap-fixed-issues__download-caret" />
              </WapButton>
            </WapDropdown>
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
              placeholder={__('Search page title, issue name, fix, link…', 'website-accessibility')}
              allowClear
            />
            <WapSelect
              className="wap-fixed-issues__filter"
              value={issueFilter}
              onChange={(value) => setIssueFilter(value || 'all')}
            >
              <WapSelect.Option value="all">{__('All fixes', 'website-accessibility')}</WapSelect.Option>
              {issueOptions.map((optId) => (
                <WapSelect.Option key={optId} value={optId}>{getIssueInfo(optId).title}</WapSelect.Option>
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
                const row = buildFixedIssueRowModel(entry);
                const fixedAtRaw = entry?.updated_at || entry?.created_at || '';
                const fixedAtLabel = formatFixedAt(fixedAtRaw);
                const isSelected = selectedIds.includes(entry?.id);

                return (
                  <li key={key} className="wap-fixed-issues__item wap-fixed-issues__item--minimal">
                    <div className="wap-fixed-issues__minimal-head">
                      <label className="wap-fixed-issues__check">
                        <input
                          type="checkbox"
                          checked={!!isSelected}
                          onChange={() => toggleSelectItem(entry?.id)}
                          disabled={saving}
                        />
                      </label>
                      {row.issueTitle ? (
                        <p className="wap-fixed-issues__minimal-issue-name wap-fixed-issues__minimal-issue-name--head">
                          {row.issueTitle}
                        </p>
                      ) : (
                        <span className="wap-fixed-issues__minimal-head-gap" aria-hidden="true" />
                      )}
                      <WapButton
                        danger
                        type="text"
                        className="wap-fixed-issues__minimal-delete-btn"
                        icon={<DeleteOutlined />}
                        loading={saving}
                        onClick={() => deleteItem(entry)}
                        aria-label={__('Remove this saved fix', 'website-accessibility')}
                      />
                    </div>

                    <div className="wap-fixed-issues__minimal-body">
                      <div className="wap-fixed-issues__minimal-page-block">
                        <div className="wap-fixed-issues__minimal-page-line">
                          <span className="wap-fixed-issues__minimal-field-label">
                            {_x('Page:', 'Label before the WordPress page/post title in fixed issues card', 'website-accessibility')}
                          </span>
                          {entry?.page_view_url ? (
                            <a
                              href={entry.page_view_url}
                              className="wap-fixed-issues__beginner-page-link"
                              target="_blank"
                              rel="noopener noreferrer"
                              title={__('Open this page on your site.', 'website-accessibility')}
                            >
                              {displayPageTitle(entry)}
                              <span aria-hidden="true" className="wap-fixed-issues__page-link-external">{'\u2197'}</span>
                            </a>
                          ) : (
                            <span className="wap-fixed-issues__minimal-page-title">{displayPageTitle(entry)}</span>
                          )}
                        </div>
                      </div>

                      {row.primaryLine ? (
                        <div className="wap-fixed-issues__minimal-detail">
                          <p className="wap-fixed-issues__minimal-lead">{row.primaryLine}</p>
                        </div>
                      ) : null}

                      {entry?.page_view_url && entry?.xpath && !row.highlightUrl ? (
                        <Text type="secondary" className="wap-fixed-issues__minimal-highlight-fallback">
                          {__(
                            'Use “Open page” — this path can’t highlight the exact spot from here.',
                            'website-accessibility',
                          )}
                        </Text>
                      ) : null}

                      {fixedAtLabel || row.highlightUrl ? (
                        <div className="wap-fixed-issues__minimal-meta">
                          {fixedAtLabel ? (
                            <time
                              className="wap-fixed-issues__minimal-date wap-fixed-issues__minimal-date--meta"
                              dateTime={fixedAtRaw}
                            >
                              {sprintf(__('Saved %s', 'website-accessibility'), fixedAtLabel)}
                            </time>
                          ) : null}
                          {row.highlightUrl ? (
                            <a
                              href={row.highlightUrl}
                              className="wap-fixed-issues__minimal-highlight-inline"
                              target="_blank"
                              rel="noopener noreferrer"
                              title={__(
                                'Opens your live page and scrolls to where this fix was applied. Stay logged in as an administrator.',
                                'website-accessibility',
                              )}
                            >
                              {__('Locate on page', 'website-accessibility')}
                              <span aria-hidden="true" className="wap-fixed-issues__page-link-external">{'\u2197'}</span>
                            </a>
                          ) : null}
                        </div>
                      ) : null}
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
