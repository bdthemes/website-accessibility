import { useState, useRef } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

const API_NAMESPACE = '/websac/v1';
const DOCS_URL = 'https://bdthemes.com/knowledge-base/one-accessibility/';

const ToolsBackup = () => {
	const { WapButton, WapMessage, WapCard, WapTypography } = window?.wapComponents;
	const { Title, Text } = WapTypography;
	const [exportLoading, setExportLoading] = useState(false);
	const [importLoading, setImportLoading] = useState(false);
	const fileInputRef = useRef(null);

	const handleExport = async () => {
		setExportLoading(true);
		try {
			const response = await apiFetch({ path: `${API_NAMESPACE}/export` });
			if (response.success) {
				const dataStr = JSON.stringify(response.data, null, 2);
				const date = new Date().toISOString().split('T')[0];
				const filename = `website-accessibility-export-${date}.json`;
				const element = document.createElement('a');
				element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(dataStr));
				element.setAttribute('download', filename);
				element.style.display = 'none';
				document.body.appendChild(element);
				element.click();
				document.body.removeChild(element);
				WapMessage.success({
					content: __("Settings exported successfully!", "website-accessibility"),
					style: { marginBlockStart: 20 },
				});
			}
		} catch (error) {
			console.error("Export failed:", error);
			WapMessage.error({
				content: __("Failed to export settings. Please try again.", "website-accessibility"),
				style: { marginBlockStart: 20 },
			});
		} finally {
			setExportLoading(false);
		}
	};

	const handleImport = async (event) => {
		const file = event.target.files?.[0];
		if (!file) return;
		if (!file.name.endsWith('.json')) {
			WapMessage.error({
				content: __("Please select a valid JSON file.", "website-accessibility"),
				style: { marginBlockStart: 20 },
			});
			return;
		}
		setImportLoading(true);
		try {
			const fileContent = await file.text();
			const importData = JSON.parse(fileContent);
			if (!importData.metadata || !importData.settings) {
				throw new Error("Invalid import file format");
			}
			const response = await apiFetch({
				path: `${API_NAMESPACE}/import`,
				method: "POST",
				data: importData,
			});
			if (response.success) {
				WapMessage.success({
					content: response.message || __("Settings imported successfully!", "website-accessibility"),
					style: { marginBlockStart: 20 },
					duration: 5,
				});
				setTimeout(() => window.location.reload(), 2000);
			}
		} catch (error) {
			console.error("Import failed:", error);
			WapMessage.error({
				content: error.message || __("Failed to import settings. Please check the file and try again.", "website-accessibility"),
				style: { marginBlockStart: 20 },
			});
		} finally {
			setImportLoading(false);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	return (
		<div className="wap-settings wap-tools-backup">
			<WapCard className="wap-settings-row wap-header-card wap-tools-header">
				<div className="wap-tools-header__inner">
					<div className="wap-header-card-content">
						<Title level={4} className="wap-header-card-title">
							{__("Tools & Backup", "website-accessibility")}
						</Title>
						<Text type="secondary" className="wap-header-card-description">
							{__("Export or import your settings configuration.", "website-accessibility")}
						</Text>
						<Text type="secondary" className="wap-tools-header__subdesc">
							{__("Use exports before big changes, when cloning to staging, or to keep an off-site record of your accessibility setup.", "website-accessibility")}
						</Text>
					</div>
				</div>
			</WapCard>

			<div className="wap-tools-backup__cards">
				<WapCard className="wap-settings-row wap-tools-card wap-tools-card--export">
					<div className="wap-tools-card__icon wap-tools-card__icon--export" aria-hidden="true">
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="7 10 12 15 17 10" />
							<line x1="12" y1="15" x2="12" y2="3" />
						</svg>
					</div>
					<Title level={5} className="wap-tools-card__title">{__("Export Settings", "website-accessibility")}</Title>
					<Text type="secondary" className="wap-tools-card__desc">
						{__("Download your current settings as a JSON file for backup.", "website-accessibility")}
					</Text>
					<WapButton type="primary" onClick={handleExport} loading={exportLoading} disabled={importLoading} className="wap-tools-card__btn">
						{__("Export Settings", "website-accessibility")}
					</WapButton>
				</WapCard>

				<WapCard className="wap-settings-row wap-tools-card wap-tools-card--import">
					<div className="wap-tools-card__icon wap-tools-card__icon--import" aria-hidden="true">
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="17 8 12 3 7 8" />
							<line x1="12" y1="3" x2="12" y2="15" />
						</svg>
					</div>
					<Title level={5} className="wap-tools-card__title">{__("Import Settings", "website-accessibility")}</Title>
					<Text type="secondary" className="wap-tools-card__desc">
						{__("Restore settings from a previously exported JSON file.", "website-accessibility")}
					</Text>
					<WapButton
						type="default"
						className="wap-tools-card__btn wap-tools-card__btn--import"
						onClick={() => fileInputRef.current?.click()}
						loading={importLoading}
						disabled={exportLoading}
					>
						{__("Import Settings", "website-accessibility")}
					</WapButton>
					<input
						ref={fileInputRef}
						type="file"
						accept=".json"
						onChange={handleImport}
						style={{ display: 'none' }}
					/>
				</WapCard>
			</div>

			<div className="wap-tools-backup__info">
				<WapCard className="wap-settings-row wap-tools-info-card">
					<Title level={5} className="wap-tools-info-card__title">
						{__("What’s included in the backup file?", "website-accessibility")}
					</Title>
					<Text type="secondary" className="wap-tools-info-card__lead">
						{__("Each export is a single JSON document you can store offline or send to staging.", "website-accessibility")}
					</Text>
					<ul className="wap-tools-backup__list">
						<li>
							<strong>{__("Settings", "website-accessibility")}</strong>
							{' — '}
							{__("Toolbar options and plugin preferences saved in WordPress.", "website-accessibility")}
						</li>
						<li>
							<strong>{__("Presets", "website-accessibility")}</strong>
							{' — '}
							{__("Published presets with layout, conditions, and related metadata.", "website-accessibility")}
						</li>
						<li>
							<strong>{__("Custom profiles", "website-accessibility")}</strong>
							{' — '}
							{__("Accessibility profiles associated with those presets.", "website-accessibility")}
						</li>
						<li>
							<strong>{__("File details", "website-accessibility")}</strong>
							{' — '}
							{__("Export date and site URL so you know where the snapshot came from.", "website-accessibility")}
						</li>
					</ul>
				</WapCard>
				<WapCard className="wap-settings-row wap-tools-info-card">
					<Title level={5} className="wap-tools-info-card__title">
						{__("Before you import", "website-accessibility")}
					</Title>
					<Text type="secondary" className="wap-tools-info-card__lead">
						{__("Imports apply immediately and refresh this screen when finished.", "website-accessibility")}
					</Text>
					<ul className="wap-tools-backup__list">
						<li>{__("Use JSON files exported from One Accessibility — other formats cannot be restored here.", "website-accessibility")}</li>
						<li>{__("Presets and profiles with the same title as your site will be updated; new titles are added as new items.", "website-accessibility")}</li>
						<li>{__("Run an export first if you might need to undo changes on this site.", "website-accessibility")}</li>
						<li>{__("Test large imports on a staging copy when possible.", "website-accessibility")}</li>
					</ul>
				</WapCard>
			</div>

			<WapCard className="wap-settings-row wap-tools-backup__help-card">
				<Title level={5} className="wap-tools-backup__help-title">
					{__("Help & migration", "website-accessibility")}
				</Title>
				<Text type="secondary">
					{__("Moving between environments or onboarding a teammate? Combine a fresh export with our guides for presets, licensing, and support.", "website-accessibility")}
				</Text>
				<div className="wap-tools-backup__help-links">
					<a className="wap-tools-backup__help-link" href={DOCS_URL} target="_blank" rel="noopener noreferrer">
						{__("Browse the knowledge base", "website-accessibility")}
					</a>
				</div>
			</WapCard>
		</div>
	);
};

export default ToolsBackup;
