/**
 * WordPress dependencies
 */
import { createRoot } from '@wordpress/element';
import { RouterProvider, useHistory, useLocation } from './router';
import "./styles/main.scss";
import Pages from './pages';
import AdminLayout from './components/admin-layout';
import { DashboardTourProvider } from './context/dashboard-tour-context';
import { register } from '@wordpress/data';
import store, { STORE_NAME, generateUniqueTitle } from './store';
import { getAdminExtensions } from '../utils/admin-extensions';
import PostTable from './components/post-table';
import ControlWrapper from './components/control-wrapper';
import SettingsItem from './components/settings-item';
import IconPicker from './components/icon-picker';
import ColorPicker from './controls/color-picker';
import * as adminMenuIcons from './components/admin-menu-icons';
import { getBrandDisplayName, useBrandDisplayName, useWhiteLabelBrandingEnabled } from '../utils/brand';

register(store);

/**
 * Building blocks of the admin SPA that add-on screens (registered through
 * window.websacAdminExtensions) may reuse so they look and behave like core
 * screens. Read lazily at render time — this bundle loads after add-on bundles.
 */
window.wapAdmin = {
    ...(window.wapAdmin || {}),
    useHistory,
    useLocation,
    STORE_NAME,
    generateUniqueTitle,
    PostTable,
    ControlWrapper,
    SettingsItem,
    IconPicker,
    ColorPicker,
    icons: adminMenuIcons,
    getBrandDisplayName,
    useBrandDisplayName,
    useWhiteLabelBrandingEnabled,
};

/**
 * Initialize the app
 */
const Admin = () => {
    const extensions = getAdminExtensions();
    let content = (
        <AdminLayout>
            <Pages />
        </AdminLayout>
    );

    // Add-on providers (e.g. guided tours for add-on screens) wrap the app.
    extensions.providers.forEach((Provider) => {
        content = <Provider>{content}</Provider>;
    });

    return (
        <RouterProvider>
            <DashboardTourProvider>
                {content}
            </DashboardTourProvider>
        </RouterProvider>
    );
};

// Initialize only on our plugin's admin pages (wait for shared components bundle).
const mountAdminApp = () => {
    const appContainer = document.getElementById('website-accessibility-admin');
    if (!appContainer || appContainer.classList.contains('websac-lic-admin')) {
        return;
    }

    if (!window.wapComponents) {
        window.requestAnimationFrame(mountAdminApp);
        return;
    }

    createRoot(appContainer).render(<Admin />);
};

mountAdminApp();
