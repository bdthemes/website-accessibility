import accessibilityManager from "../../accessibilty-manager";
import { getSiteLanguage } from "../../utils";

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
        dyslexiaFriendly: {
            currentStep: 0,
            currentAttribute: null,
            isMultiStep: true
        },
        cursor: {
            currentStep: 0,
            currentAttribute: null,
            isMultiStep: true // if there are multiple cursor types
        },
        saturation: {
            currentStep: 0,
            currentAttribute: null,
            isMultiStep: true
        },
        textAlign: {
            currentStep: 0,
            currentAttribute: null,
            isMultiStep: true
        },
        lineHeight: {
            currentStep: 0,
            currentAttribute: null,
            isMultiStep: true
        }
    },
    isLoading: false,
    isOverSized: false,
    localStorageKeyPrefix: 'websiteAccessibilityLocalPreferences',
    selectedLanguage: null,
    languageSearchInput: '',
    siteLanguage: getSiteLanguage(),
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
            accessibilityManager().removeAllFeatures();
            return {
                ...initialState,
            };
        case 'RESET_PROFILE_SETTINGS':
            accessibilityManager().removeAllFeatures();
            return {
                ...state,
                currentProfile: null,
                currentSettings: initialState.currentSettings,
            };
        case 'SET_SELECTED_LANGUAGE':
            return {
                ...state,
                selectedLanguage: action.payload,
            };
        case 'SET_LANGUAGE_SEARCH_INPUT':
            return {
                ...state,
                languageSearchInput: action.payload,
            };
        default:
            return state;
    }
}
