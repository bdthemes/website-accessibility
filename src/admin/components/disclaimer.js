import { Alert } from "antd";
import { useState, useEffect } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

const Description = () => {
    return (
        <div className="wap-disclaimer-description">
            <p>
                {__("Website Accessibility by BdThemes is designed to help make your WordPress website more accessible to all users. While the plugin provides tools to adjust your website to users’ needs, some pages or sections may still not be fully accessible, may require manual action to resolve certain issues, or may be in the process of becoming fully accessible.", "website-accessibility")}
            </p>
            <p>
                {__("Website Accessibility by BdThemes is continually being improved, with updates, new features, and adoption of new technologies, as part of our commitment to achieve optimal accessibility standards.", "website-accessibility")}
            </p>
            <p>
                {
                    __("Feedback & Contact: If you encounter any accessibility barriers while using your website or our plugin, we welcome your feedback and suggestions. Please contact us at: https://bdthemes.com/supportor email [support@bdthemes.com].", "website-accessibility")
                }
            </p>
        </div>
    );
};

const Disclaimer = () => {
    const [visible, setVisible] = useState(true);

    // Optional: Persist dismissal in localStorage
    useEffect(() => {
        const dismissed = localStorage.getItem("accessibilityDisclaimerDismissed");
        if (dismissed === "true") setVisible(false);
    }, []);

    const handleClose = () => {
        setVisible(false);
        localStorage.setItem("accessibilityDisclaimerDismissed", "true");
    };

    return visible ? (
        <div className="wap-disclaimer">
            <Alert
                message={__("Disclaimer for Site Administrators", "website-accessibility")}
                description={ <Description /> }
                type="info"
                closable
                onClose={handleClose}
                showIcon
                style={{ marginBottom: 20 }}
            />
        </div>
    ) : null;
};

export default Disclaimer;
