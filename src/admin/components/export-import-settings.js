import { useState, useRef } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import { __ } from "@wordpress/i18n";

const ExportImportSettings = () => {
    const { WapButton, WapSpace, WapMessage, WapCard, WapTypography } = window?.wapComponents;
    const { Title, Text } = WapTypography;
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef(null);

    const API_NAMESPACE = "/sigmally/v1";

    /**
     * Handle export - downloads settings as JSON file
     */
    const handleExport = async () => {
        setLoading(true);
        try {
            const response = await apiFetch({ path: `${API_NAMESPACE}/export` });
            
            if (response.success) {
                // Create JSON file and trigger download
                const dataStr = JSON.stringify(response.data, null, 2);
                
                // Generate filename with current date
                const date = new Date().toISOString().split('T')[0];
                const filename = `website-accessibility-export-${date}.json`;
                
                // Create download using a temporary anchor element
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
            setLoading(false);
        }
    };

    /**
     * Handle import - reads JSON file and sends to API
     */
    const handleImport = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.name.endsWith('.json')) {
            WapMessage.error({
                content: __("Please select a valid JSON file.", "website-accessibility"),
                style: { marginBlockStart: 20 },
            });
            return;
        }

        setImporting(true);
        
        try {
            // Read file content
            const fileContent = await file.text();
            const importData = JSON.parse(fileContent);

            // Validate import data
            if (!importData.metadata || !importData.settings) {
                throw new Error("Invalid import file format");
            }

            // Send to API
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
                
                // Reload page after 2 seconds to reflect changes
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        } catch (error) {
            console.error("Import failed:", error);
            WapMessage.error({
                content: error.message || __("Failed to import settings. Please check the file and try again.", "website-accessibility"),
                style: { marginBlockStart: 20 },
            });
        } finally {
            setImporting(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    /**
     * Trigger file input click
     */
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <WapCard className="wap-settings-card wap-export-import-card wap-settings-row">
            <div className="wap-export-import-card__inner">
                <div className="wap-export-import-card__text">
                    <Title level={4} style={{ margin: 0 }}>
                        {__("Export / Import Settings", "website-accessibility")}
                    </Title>
                    <Text type="secondary">
                        {__("Export your settings to backup or migrate to another site, or import settings from a previously exported file.", "website-accessibility")}
                    </Text>
                </div>
                <div className="wap-export-import-card__actions">
                    <WapSpace size="small">
                        <WapButton
                            type="primary"
                            onClick={handleExport}
                            loading={loading}
                            disabled={importing}
                        >
                            {__("Export Settings", "website-accessibility")}
                        </WapButton>
                        <WapButton
                            onClick={triggerFileInput}
                            loading={importing}
                            disabled={loading}
                        >
                            {__("Import Settings", "website-accessibility")}
                        </WapButton>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            style={{ display: "none" }}
                        />
                    </WapSpace>
                </div>
            </div>
        </WapCard>
    );
};

export default ExportImportSettings;
