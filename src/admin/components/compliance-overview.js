import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { useHistory } from '../router';

const ISSUE_TITLES = {
	missing_alt: __('Missing image alt text', 'website-accessibility'),
	empty_alt: __('Empty image alt text', 'website-accessibility'),
	empty_link: __('Empty link', 'website-accessibility'),
	link_with_only_image: __('Image-only link without label', 'website-accessibility'),
	missing_label: __('Form input without a label', 'website-accessibility'),
	missing_button_name: __('Button without an accessible name', 'website-accessibility'),
	new_tab_no_notice: __('Link opens in a new tab without notice', 'website-accessibility'),
	low_text_contrast: __('Low text contrast', 'website-accessibility'),
	missing_skip_link: __('Missing skip-to-content link', 'website-accessibility'),
	radio_missing_name: __('Radio group missing a name', 'website-accessibility'),
	checkbox_missing_name: __('Checkbox missing a name', 'website-accessibility'),
	missing_lang_attr: __('Page language not set', 'website-accessibility'),
};

function humanizeIssueId(id) {
	if (!id) {
		return __('Accessibility issue', 'website-accessibility');
	}
	return String(id)
		.replace(/[_-]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

function getIssueTitle(issueId) {
	return ISSUE_TITLES[issueId] || humanizeIssueId(issueId);
}

function formatPageLabel(page) {
	const title = (page?.page_title || '').trim();
	if (title) {
		return title;
	}
	const id = (page?.page_identifier || '').trim();
	return id || __('Unknown page', 'website-accessibility');
}

/**
 * Append checker_open=true so the frontend Accessibility Checker opens with issues.
 *
 * @param {string} rawUrl
 * @return {string}
 */
function withCheckerOpen(rawUrl) {
	const href = (rawUrl || '').trim();
	if (!href) {
		return '';
	}
	try {
		const url = new URL(href, window.location.origin);
		url.searchParams.set('checker_open', 'true');
		return url.toString();
	} catch (e) {
		const joiner = href.includes('?') ? '&' : '?';
		return `${href}${joiner}checker_open=true`;
	}
}

function PageNameCell({ page }) {
	const label = formatPageLabel(page);
	const href = withCheckerOpen(page?.page_view_url || '');

	if (!href) {
		return <span className="wap-compliance-overview__page-name">{label}</span>;
	}

	return (
		<a
			className="wap-compliance-overview__page-link"
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			title={__('Open page with Accessibility Checker', 'website-accessibility')}
		>
			<span className="wap-compliance-overview__page-name">{label}</span>
			<span className="wap-compliance-overview__page-link-icon" aria-hidden="true">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					width="12"
					height="12"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
					<polyline points="15 3 21 3 21 9" />
					<line x1="10" y1="14" x2="21" y2="3" />
				</svg>
			</span>
		</a>
	);
}

function formatRelativeActivity(iso) {
	if (!iso) {
		return __('Not yet', 'website-accessibility');
	}
	const ts = Date.parse(iso);
	if (Number.isNaN(ts)) {
		return __('Not yet', 'website-accessibility');
	}
	const diffMs = Date.now() - ts;
	const mins = Math.floor(diffMs / 60000);
	if (mins < 1) {
		return __('Just now', 'website-accessibility');
	}
	if (mins < 60) {
		return sprintf(__('%d min ago', 'website-accessibility'), mins);
	}
	const hours = Math.floor(mins / 60);
	if (hours < 24) {
		return sprintf(__('%d hr ago', 'website-accessibility'), hours);
	}
	const days = Math.floor(hours / 24);
	if (days < 30) {
		return sprintf(__('%d days ago', 'website-accessibility'), days);
	}
	try {
		return new Date(ts).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	} catch (e) {
		return __('Recently', 'website-accessibility');
	}
}

function formatTrendCopy(trend) {
	const direction = trend?.direction || 'flat';
	const delta = Number(trend?.delta_score) || 0;
	const label = trend?.label || 'insufficient';

	if (label === 'insufficient') {
		return {
			value: __('Scan again', 'website-accessibility'),
			hint: __('Need one more scan to compare', 'website-accessibility'),
			tone: 'flat',
		};
	}
	if (direction === 'up') {
		return {
			value: sprintf(__('Getting better (+%d)', 'website-accessibility'), Math.abs(delta)),
			hint: __('Compared with your previous scan', 'website-accessibility'),
			tone: 'up',
		};
	}
	if (direction === 'down') {
		return {
			value: sprintf(__('Got worse (−%d)', 'website-accessibility'), Math.abs(delta)),
			hint: __('Compared with your previous scan', 'website-accessibility'),
			tone: 'down',
		};
	}
	return {
		value: __('No change', 'website-accessibility'),
		hint: __('Same as your previous scan', 'website-accessibility'),
		tone: 'flat',
	};
}

function scoreTone(score) {
	if (score === null || score === undefined) {
		return 'neutral';
	}
	if (score >= 90) {
		return 'good';
	}
	if (score >= 70) {
		return 'ok';
	}
	return 'bad';
}

const emptySummary = {
	total_fixed: 0,
	pages_count: 0,
	top_issues: [],
	recent: [],
	last_updated: '',
	overall_score: null,
	open_issues: 0,
	open_instances: 0,
	by_severity: { critical: 0, major: 0, minor: 0 },
	pages_scanned: 0,
	last_scan: '',
	trend: { direction: 'flat', delta_score: 0, label: 'insufficient' },
	worst_pages: [],
	top_open_issues: [],
	has_scan_data: false,
	empty: true,
	history: [],
	unscanned_pages: [],
	settings: {
		wcag_level: 'all',
	},
	wcag_filter: 'all',
};

function downloadCsv(summary) {
	const rows = [
		['Section', 'Label', 'Value'],
		['Overview', 'Site score', summary.overall_score ?? ''],
		['Overview', 'Open issues', summary.open_issues ?? 0],
		['Overview', 'Critical', summary.by_severity?.critical ?? 0],
		['Overview', 'Major', summary.by_severity?.major ?? 0],
		['Overview', 'Minor', summary.by_severity?.minor ?? 0],
		['Overview', 'Pages scanned', summary.pages_scanned ?? 0],
		['Overview', 'Last scan', summary.last_scan ?? ''],
		['Overview', 'Fixed issues', summary.total_fixed ?? 0],
		['Overview', 'WCAG filter', summary.wcag_filter || summary.settings?.wcag_level || 'all'],
	];
	(summary.worst_pages || []).forEach((page) => {
		rows.push([
			'Pages',
			page.page_title || page.page_identifier || '',
			`score=${page.score ?? ''}; open=${page.total_open ?? 0}`,
		]);
	});
	(summary.top_open_issues || []).forEach((issue) => {
		rows.push([
			'Issues',
			getIssueTitle(issue.issue_id),
			`count=${issue.count ?? 0}; severity=${issue.severity || ''}; wcag=${issue.wcag_level || ''}`,
		]);
	});
	(summary.unscanned_pages || []).forEach((page) => {
		rows.push(['Unscanned', page.page_title || '', page.page_view_url || '']);
	});
	(summary.history || []).forEach((row) => {
		rows.push([
			'History',
			row.recorded_at || '',
			`score=${row.score ?? ''}; open=${row.open_issues ?? 0}; critical=${row.critical ?? 0}`,
		]);
	});

	const csv = rows
		.map((row) =>
			row
				.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`)
				.join(',')
		)
		.join('\n');
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `compliance-report-${new Date().toISOString().slice(0, 10)}.csv`;
	a.click();
	URL.revokeObjectURL(url);
}

const ComplianceOverview = () => {
	const { WapCard, WapButton, WapRow, WapCol, WapTypography, WapEmpty, WapSpin, WapProgress, WapSelect } =
		window?.wapComponents || {};
	const { Title, Text } = WapTypography || {};
	const history = useHistory();
	const [summary, setSummary] = useState(emptySummary);
	const [loading, setLoading] = useState(true);
	const [wcag, setWcag] = useState('all');

	const fetchSummary = async (wcagLevel) => {
		setLoading(true);
		try {
			const level = wcagLevel || 'all';
			const response = await apiFetch({
				path: `/one-accessibility/v1/compliance-summary?wcag=${encodeURIComponent(level)}`,
			});
			if (response?.success && response?.data) {
				const next = { ...emptySummary, ...response.data };
				setSummary(next);
				setWcag(next.wcag_filter || next.settings?.wcag_level || level);
			}
		} catch (error) {
			console.error('Failed to fetch compliance summary:', error);
			setSummary(emptySummary);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchSummary('all');
	}, []);

	const navigateToFixedIssues = () => {
		history.push({ page: 'website-accessibility-fixed-issues' });
	};

	const navigateToSettings = () => {
		history.push({ page: 'website-accessibility-settings' });
	};

	if (!WapCard || !WapRow || !Title) {
		return null;
	}

	const scoreValue =
		summary.overall_score === null || summary.overall_score === undefined
			? '—'
			: `${summary.overall_score}`;
	const scoreClass = `is-${scoreTone(summary.overall_score)}`;
	const trend = formatTrendCopy(summary.trend);

	const openIssuesList =
		Array.isArray(summary.top_open_issues) && summary.top_open_issues.length > 0
			? summary.top_open_issues
			: Array.isArray(summary.top_issues)
				? summary.top_issues
				: [];
	const showingOpenIssues =
		Array.isArray(summary.top_open_issues) && summary.top_open_issues.length > 0;

	const hasLists =
		!loading &&
		((Array.isArray(summary.worst_pages) && summary.worst_pages.length > 0) ||
			openIssuesList.length > 0);

	const critical = summary.by_severity?.critical || 0;
	const major = summary.by_severity?.major || 0;
	const minor = summary.by_severity?.minor || 0;
	const unscanned = Array.isArray(summary.unscanned_pages) ? summary.unscanned_pages : [];

	return (
		<div className="wap-compliance-overview" data-tour="wap-tour-compliance-overview">
			<header className="wap-compliance-overview__hero">
				<div className="wap-compliance-overview__hero-copy">
					<h1 className="wap-compliance-overview__hero-title">
						{__('Compliance Monitoring', 'website-accessibility')}
					</h1>
					<p className="wap-compliance-overview__hero-desc">
						{__('Site health from your Accessibility Checker scans.', 'website-accessibility')}
						{' '}
						<button
							type="button"
							className="wap-compliance-overview__settings-link"
							onClick={navigateToSettings}
						>
							{__('Settings', 'website-accessibility')}
						</button>
					</p>
				</div>
				{!loading && !summary.empty ? (
					<div className="wap-compliance-overview__hero-actions">
						{WapSelect ? (
							<WapSelect
								className="wap-compliance-overview__wcag-select"
								size="middle"
								value={wcag || 'all'}
								onChange={(value) => {
									const next = value || 'all';
									setWcag(next);
									fetchSummary(next);
								}}
								options={[
									{ value: 'all', label: __('WCAG: All', 'website-accessibility') },
									{ value: 'a', label: 'WCAG A' },
									{ value: 'aa', label: 'WCAG AA' },
									{ value: 'aaa', label: 'WCAG AAA' },
								]}
							/>
						) : null}
						<div className="wap-compliance-overview__export-group">
							<WapButton type="primary" onClick={() => downloadCsv(summary)}>
								{__('Export CSV', 'website-accessibility')}
							</WapButton>
						</div>
					</div>
				) : null}
			</header>

			{loading ? (
				<div className="wap-compliance-overview__loading">
					{WapSpin ? <WapSpin size="small" /> : <Text>{__('Loading…', 'website-accessibility')}</Text>}
				</div>
			) : null}

			{!loading && summary.empty ? (
				<div className="wap-compliance-overview__empty">
					{WapEmpty ? (
						<WapEmpty
							description={__(
								'Nothing here yet. Open any page on your site, click Accessibility Checker, run a scan, then return to this page.',
								'website-accessibility'
							)}
						/>
					) : (
						<Text type="secondary">
							{__(
								'Nothing here yet. Open any page on your site, click Accessibility Checker, run a scan, then return to this page.',
								'website-accessibility'
							)}
						</Text>
					)}
				</div>
			) : null}

			{!loading && !summary.empty ? (
				<>
					<WapCard className="wap-settings-row wap-compliance-overview__summary" size="small">
						<div className="wap-compliance-overview__summary-grid">
							<div className={`wap-compliance-overview__score-block ${scoreClass}`}>
								<span className="wap-compliance-overview__score-label">
									{__('Your site score', 'website-accessibility')}
								</span>
								<div className="wap-compliance-overview__score-row">
									<span className="wap-compliance-overview__score-value" aria-live="polite">
										{scoreValue}
									</span>
									<span className="wap-compliance-overview__score-max">
										{__('/ 100', 'website-accessibility')}
									</span>
								</div>
								{WapProgress && summary.overall_score !== null ? (
									<WapProgress
										percent={summary.overall_score}
										size="small"
										showInfo={false}
										status="normal"
										className="wap-compliance-overview__score-bar"
									/>
								) : null}
								<span className="wap-compliance-overview__score-hint">
									{__('Higher is better. Based on pages you scanned.', 'website-accessibility')}
								</span>
							</div>

							<div className="wap-compliance-overview__kpi-grid">
								<div className="wap-compliance-overview__kpi">
									<span className="wap-compliance-overview__kpi-label">
										{__('Problems left', 'website-accessibility')}
									</span>
									<span className="wap-compliance-overview__kpi-value">{summary.open_issues}</span>
									<div className="wap-compliance-overview__severity" aria-label={__('By severity', 'website-accessibility')}>
										<span className="wap-compliance-overview__sev is-critical">
											{sprintf(__('Critical %d', 'website-accessibility'), critical)}
										</span>
										<span className="wap-compliance-overview__sev is-major">
											{sprintf(__('Major %d', 'website-accessibility'), major)}
										</span>
										<span className="wap-compliance-overview__sev is-minor">
											{sprintf(__('Minor %d', 'website-accessibility'), minor)}
										</span>
									</div>
								</div>

								<div className="wap-compliance-overview__kpi">
									<span className="wap-compliance-overview__kpi-label">
										{__('Progress', 'website-accessibility')}
									</span>
									<span className={`wap-compliance-overview__kpi-value is-${trend.tone}`}>
										{trend.value}
									</span>
									<span className="wap-compliance-overview__kpi-hint">{trend.hint}</span>
								</div>

								<div className="wap-compliance-overview__kpi">
									<span className="wap-compliance-overview__kpi-label">
										{__('Last checked', 'website-accessibility')}
									</span>
									<span className="wap-compliance-overview__kpi-value">
										{formatRelativeActivity(summary.last_scan)}
									</span>
									<span className="wap-compliance-overview__kpi-hint">
										{sprintf(
											__('%d page(s) checked so far', 'website-accessibility'),
											summary.pages_scanned || 0
										)}
									</span>
								</div>
							</div>
						</div>
					</WapCard>

					{hasLists ? (
						<WapRow gutter={[12, 12]} className="wap-compliance-overview__lists">
							{Array.isArray(summary.worst_pages) && summary.worst_pages.length > 0 ? (
								<WapCol xs={24} md={12}>
									<WapCard className="wap-settings-row wap-compliance-overview__panel" size="small">
										<div className="wap-compliance-overview__panel-head">
											<Title level={5} className="wap-compliance-overview__list-title">
												{__('Which pages need work?', 'website-accessibility')}
											</Title>
											<Text type="secondary" className="wap-compliance-overview__panel-hint">
												{__(
													'Lower score = more problems. Click a page name to open Accessibility Checker there.',
													'website-accessibility'
												)}
											</Text>
										</div>
										<ul className="wap-compliance-overview__list">
											{summary.worst_pages.map((page) => (
												<li
													key={page.page_identifier}
													className="wap-compliance-overview__list-item"
												>
													<span className="wap-compliance-overview__list-label">
														<PageNameCell page={page} />
														<span className="wap-compliance-overview__list-meta">
															{sprintf(
																__('%d problem(s) left', 'website-accessibility'),
																page.total_open || 0
															)}
														</span>
													</span>
													<span
														className={`wap-compliance-overview__list-count is-${scoreTone(page.score)}`}
														title={__('Page score', 'website-accessibility')}
													>
														<span className="wap-compliance-overview__list-count-label">
															{__('Score', 'website-accessibility')}
														</span>
														{page.score ?? '—'}
													</span>
												</li>
											))}
										</ul>
									</WapCard>
								</WapCol>
							) : null}

							{openIssuesList.length > 0 ? (
								<WapCol xs={24} md={12}>
									<WapCard className="wap-settings-row wap-compliance-overview__panel" size="small">
										<div className="wap-compliance-overview__panel-head">
											<Title level={5} className="wap-compliance-overview__list-title">
												{showingOpenIssues
													? __('What comes up most?', 'website-accessibility')
													: __('What did you fix most?', 'website-accessibility')}
											</Title>
											<Text type="secondary" className="wap-compliance-overview__panel-hint">
												{showingOpenIssues
													? __('Fixing a common problem can help many places at once.', 'website-accessibility')
													: __('These are the fixes you saved most often.', 'website-accessibility')}
											</Text>
										</div>
										<ul className="wap-compliance-overview__list">
											{openIssuesList.map((item) => (
												<li key={item.issue_id} className="wap-compliance-overview__list-item">
													<span className="wap-compliance-overview__list-label">
														{getIssueTitle(item.issue_id)}
														{item.wcag_level ? (
															<span className="wap-compliance-overview__list-meta">
																{sprintf(__('WCAG %s', 'website-accessibility'), String(item.wcag_level).toUpperCase())}
															</span>
														) : null}
													</span>
													<span className="wap-compliance-overview__list-count">
														<span className="wap-compliance-overview__list-count-label">
															{__('Found', 'website-accessibility')}
														</span>
														{item.count}
													</span>
												</li>
											))}
										</ul>
									</WapCard>
								</WapCol>
							) : null}
						</WapRow>
					) : null}

					{unscanned.length > 0 ? (
						<WapCard className="wap-settings-row wap-compliance-overview__panel" size="small">
							<div className="wap-compliance-overview__panel-head">
								<Title level={5} className="wap-compliance-overview__list-title">
									{__('Not scanned yet', 'website-accessibility')}
								</Title>
								<Text type="secondary" className="wap-compliance-overview__panel-hint">
									{__('Published pages/posts with no scan yet — click to open the page.', 'website-accessibility')}
								</Text>
							</div>
							<ul className="wap-compliance-overview__list">
								{unscanned.map((page) => (
									<li key={page.page_identifier} className="wap-compliance-overview__list-item">
										<span className="wap-compliance-overview__list-label">
											<PageNameCell page={page} />
											<span className="wap-compliance-overview__list-meta">
												{page.post_type === 'page'
													? __('Page', 'website-accessibility')
													: __('Post', 'website-accessibility')}
											</span>
										</span>
									</li>
								))}
							</ul>
						</WapCard>
					) : null}

					{summary.total_fixed > 0 ? (
						<div className="wap-compliance-overview__footer">
							<Text type="secondary">
								{sprintf(
									__('You already fixed %1$d problem(s) on %2$d page(s).', 'website-accessibility'),
									summary.total_fixed,
									summary.pages_count || 0
								)}
							</Text>
							<WapButton
								type="link"
								size="small"
								onClick={navigateToFixedIssues}
								className="wap-compliance-overview__footer-link"
							>
								{__('See what was fixed', 'website-accessibility')}
							</WapButton>
						</div>
					) : null}

					<div className="wap-compliance-overview__footer wap-compliance-overview__footer--settings">
						<Text type="secondary">
							{__('Email alerts and auto-scan options.', 'website-accessibility')}
						</Text>
						<WapButton
							type="link"
							size="small"
							onClick={navigateToSettings}
							className="wap-compliance-overview__footer-link"
						>
							{__('Compliance settings', 'website-accessibility')}
						</WapButton>
					</div>

					<p className="wap-compliance-overview__note">
						{__(
							'This is a progress tracker from your scans — not a legal accessibility certificate.',
							'website-accessibility'
						)}
					</p>
				</>
			) : null}
		</div>
	);
};

export default ComplianceOverview;
