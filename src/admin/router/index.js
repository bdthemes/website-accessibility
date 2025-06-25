import { createContext, useState, useEffect, useContext } from '@wordpress/element';
import history from './history';

const RoutesContext = createContext();
const HistoryContext = createContext();

// Custom hooks to access the location and history
export function useLocation() {
    return useContext(RoutesContext);
}

export function useHistory() {
    return useContext(HistoryContext);
}

function getLocationWithParams(location) {
    const searchParams = new URLSearchParams(location.search);
    return {
        ...location,
        params: Object.fromEntries(searchParams.entries()),
    };
}

// The RouterProvider component for WordPress admin pages
export function RouterProvider({ children }) {
    const [location, setLocation] = useState(() =>
        getLocationWithParams(history.location)
    );

    useEffect(() => {
        return history.listen(({ location: updatedLocation }) => {
            setLocation(getLocationWithParams(updatedLocation));
        });
    }, []);

    return (
        <HistoryContext.Provider value={history}>
            <RoutesContext.Provider value={location}>
                {children}
            </RoutesContext.Provider>
        </HistoryContext.Provider>
    );
}
