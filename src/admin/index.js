/**
 * WordPress dependencies
 */
import { createRoot } from '@wordpress/element';
import { RouterProvider } from './router';
import "./styles/index.scss";
import Pages from './pages';
import { register } from '@wordpress/data';
import store from './store';

register(store);
/**
 * Initialize the app
 */
const App = () => {
    return (
        <RouterProvider>
            <Pages />
        </RouterProvider>
    );
};

// Initialize only on our plugin's admin pages
const appContainer = document.getElementById('website-accessibility-app');
if (appContainer) {
    createRoot(appContainer).render(<App />);
}
