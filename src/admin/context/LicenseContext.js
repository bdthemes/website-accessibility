import { createContext, useContext, useState, useEffect } from '@wordpress/element';

const LicenseContext = createContext(null);

export const LicenseProvider = ({ children }) => {
	const [isProActive, setIsProActive] = useState(() => {
		return !!(window?.websacPro?.isProActive);
	});

	const isProPluginActive = !!(window?.websacAdmin?.isProPluginActive);

	useEffect(() => {
		const handleLicenseChange = (e) => {
			const active = !!e.detail?.isLicenseValid;
			setIsProActive(active);

			// Sync window global so non-context consumers read the latest value
			if (!window.websacPro) {
				window.websacPro = {};
			}
			window.websacPro.isProActive = active;
		};

		window.addEventListener('websac-license-changed', handleLicenseChange);
		return () => window.removeEventListener('websac-license-changed', handleLicenseChange);
	}, []);

	return (
		<LicenseContext.Provider value={{ isProActive, isProPluginActive }}>
			{children}
		</LicenseContext.Provider>
	);
};

/**
 * Hook to access license status.
 * Inside admin (with LicenseProvider): returns reactive context value.
 * Outside admin (frontend): falls back to static window globals.
 */
export const useLicense = () => {
	const context = useContext(LicenseContext);
	if (!context) {
		return {
			isProActive: !!(window?.websacPro?.isProActive),
			isProPluginActive: !!(window?.websacAdmin?.isProPluginActive),
		};
	}
	return context;
};

export default LicenseContext;
