import { useState, useRef } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import { useLicense } from '../context/LicenseContext';

const API_NAMESPACE = '/sigmally/v1';

const ToolsBackup = () => {
	const { WapButton, WapMessage, WapCard, WapTypography } = window?.wapComponents;
	const { Title, Text } = WapTypography;
	const { isProActive } = useLicense();
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

	if (!isProActive) {
		return (
			<div className="wap-settings wap-tools-backup">
				<WapCard className="wap-settings-row wap-tools-backup__pro-required">
					<Title level={4}>{__("Tools & Backup", "website-accessibility")}</Title>
					<Text type="secondary">
						{__("Export and import settings are available in the Pro version.", "website-accessibility")}
					</Text>
				</WapCard>
			</div>
		);
	}

	return (
		<div className="wap-settings wap-tools-backup">
			<WapCard className="wap-settings-row wap-header-card wap-tools-header">
				<div className="wap-tools-header__inner">
					<div className="wap-header-card-content">
						<Title level={4} className="wap-header-card-title">
							{__("Tools & Backup", "website-accessibility")}
						</Title>
						<Text type="secondary" className="wap-header-card-description">
							{__("Export or import your settings configuration", "website-accessibility")}
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
		</div>
	);
};

export default ToolsBackup;
