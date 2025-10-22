/**
 * WordPress dependencies
 */
import { render } from '@wordpress/element';
import AdminView from './components/admin-view';

// Initialize the admin view
const initAdminView = () => {
    // Create and append the container if it doesn't exist
    let container = document.getElementById('website-accessibility-admin-view');
    if (!container) {
        container = document.createElement('div');
        container.id = 'website-accessibility-admin-view';
        document.body.appendChild(container);
    }
    
    // Render the AdminView component
    render(<AdminView />, container);
};

// Wait for the DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminView);
} else {
    // If the document is already loaded, initialize immediately
    initAdminView();
}
