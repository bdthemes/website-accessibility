export const initialState = {
    currentProfile: null,
    currentSettings: {
        contrast: {
            currentStep: 0,
            currentAttribute: null,
            isMultiStep: true
        },
        highlightLinks: {
            currentStep: 0,
            currentAttribute: null,
            isMultiStep: false
        },
        smartContrast: {
            currentStep: 0,
            currentAttribute: null,
            isMultiStep: false
        },
        screenReader: {
            currentStep: 0,
            currentAttribute: null,
            isMultiStep: true
        },
        tooltips: {
            currentStep: 0,
            currentAttribute: null,
            isMultiStep: false
        },
        textSpacing: {
            currentStep: 0,
            currentAttribute: null,
            isMultiStep: true
        },
        biggerText: {
            currentStep: 0,
            currentAttribute: null,
            isMultiStep: true
        },
        pauseAnimations: {
            currentStep: 0,
            currentAttribute: null,
            isMultiStep: false
        },
        hideImages: {
            currentStep: 0,
            currentAttribute: null,
            isMultiStep: false
        },
        dyslexiaFont: {
            currentStep: 0,
            currentAttribute: null,
            isMultiStep: true
        },
        cursor: {
            currentStep: 0,
            currentAttribute: null,
            isMultiStep: true // if there are multiple cursor types
        },
        dictionary: {
            currentStep: 0,
            currentAttribute: null,
            isMultiStep: false
        }
    },
    isLoading: false,
    isOverSized: false,
    localStorageKeyPrefix: 'websiteAccessibilityLocalPreferences',
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