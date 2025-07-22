import { useContext } from '@wordpress/element';
import { accessibilityContext } from './index';
const useFrontendAccessibility = () => {
    const context = useContext(accessibilityContext);
    if (!context) {
        throw new Error('useFrontendAccessibility must be used within an AccessibilityProvider');
    }

    return context;
}

export default useFrontendAccessibility;