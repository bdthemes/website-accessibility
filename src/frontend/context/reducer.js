export const initialState = {
    currentProfile: null,
    currentSettings: {},
    isLoading: false,
    isOverSized: false,
    localStorageKey: 'websiteAccessibilityLocalPreferences',
};

export const accessibilityReducer = (state, action) => {
    switch (action.type) {
        case 'SET_CURRENT_PROFILE':
            return {
                ...state,
                currentProfile: action.payload,
            };
        case 'SET_CURRENT_SETTINGS':
            return {
                ...state,
                currentSettings: action.payload,
            };
        case 'SET_LOADING':
            return {
                ...state,
                isLoading: action.payload,
            };
        case 'SET_OVERSIZED':
            return {
                ...state,
                isOverSized: action.payload,
            };
        case 'RESET_ACCESSIBILITY':
            return {
                ...initialState, 
            };
        default:
            return state;
    }
}