/**
 * WordPress dependencies
 */
import { createRoot } from '@wordpress/element';
import { RouterProvider } from './router';
import "./styles/main.scss";
import Pages from './pages';
import { register } from '@wordpress/data';
import store from './store';

register(store);
/**
 * Initialize the app
 */
const Admin = () => {
    return (
        <RouterProvider>
            <Pages />
        </RouterProvider>
    );
};

// Initialize only on our plugin's admin pages
const appContainer = document.getElementById('website-accessibility-admin');
if (appContainer && !appContainer.classList.contains('websac-lic-admin')) {
    createRoot(appContainer).render(<Admin />);
}
