/**
 * WordPress dependencies
 */
import { createRoot } from '@wordpress/element';
import { RouterProvider } from './router';
import "./styles/main.scss";
import Pages from './pages';
import AdminLayout from './components/admin-layout';
import { DashboardTourProvider } from './context/dashboard-tour-context';
import { ProSettingsTourProvider } from './context/pro-settings-tour-context';
import { ProfileTourProvider } from './context/profile-tour-context';
import { register } from '@wordpress/data';
import store from './store';
import { LicenseProvider } from './context/LicenseContext';
import { bootWhiteLabelAdminChrome } from '../utils/websacData';

register(store);

bootWhiteLabelAdminChrome();
/**
 * Initialize the app
 */
const Admin = () => {
    return (
        <LicenseProvider>
            <RouterProvider>
                <DashboardTourProvider>
                    <ProSettingsTourProvider>
                        <ProfileTourProvider>
                            <AdminLayout>
                                <Pages />
                            </AdminLayout>
                        </ProfileTourProvider>
                    </ProSettingsTourProvider>
                </DashboardTourProvider>
            </RouterProvider>
        </LicenseProvider>
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
