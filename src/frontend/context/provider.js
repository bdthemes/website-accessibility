import { accessibilityContext as AccessibilityContext } from "./index";
import { accessibilityReducer, initialState } from "./reducer";
import { useReducer } from "@wordpress/element";

const AccessibilityContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(accessibilityReducer, initialState);
    return (
        <AccessibilityContext.Provider value={{ ...state, dispatch }}>
            {children}
        </AccessibilityContext.Provider>
    );
}

export default AccessibilityContextProvider;