/**
 * WordPress dependencies
 */
import { createRoot } from '@wordpress/element';
import { RouterProvider } from './router';
import "./styles/main.scss";
import Pages from './pages';
import AdminLayout from './components/admin-layout';
import { register } from '@wordpress/data';
import store from './store';

register(store);
/**
 * Initialize the app
 */
const Admin = () => {
    return (
        <RouterProvider>
            <AdminLayout>
                <Pages />
            </AdminLayout>
        </RouterProvider>
    );
};

// Initialize only on our plugin's admin pages
const appContainer = document.getElementById('website-accessibility-admin');
if (appContainer && !appContainer.classList.contains('websac-lic-admin')) {
    createRoot(appContainer).render(<Admin />);
}
