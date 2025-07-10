// Action Types
export const ACCESSIBILITY_ACTIONS = {
  SET_PROFILE: 'SET_PROFILE',
  UPDATE_SETTING: 'UPDATE_SETTING',
  RESET_ALL: 'RESET_ALL',
  APPLY_SETTINGS: 'APPLY_SETTINGS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  INITIALIZE_SETTINGS: 'INITIALIZE_SETTINGS',
  SAVE_PREFERENCES: 'SAVE_PREFERENCES',
  LOAD_PREFERENCES: 'LOAD_PREFERENCES'
};

// Initial State
export const initialState = {
  currentProfile: null,
  settings: {},
  isLoading: false,
  error: null,
  isInitialized: false,
  savedPreferences: null,
  appliedSettings: {}
};

// Reducer
const accessibilityReducer = (state, action) => {
  switch (action.type) {
    case ACCESSIBILITY_ACTIONS.SET_PROFILE:
      return {
        ...state,
        currentProfile: action.payload,
        settings: action.payload?.settings || {},
        appliedSettings: {}
      };

    case ACCESSIBILITY_ACTIONS.UPDATE_SETTING:
      return {
        ...state,
        settings: {
          ...state.settings,
          [action.payload.key]: action.payload.value
        }
      };

    case ACCESSIBILITY_ACTIONS.RESET_ALL:
      return {
        ...state,
        currentProfile: null,
        settings: {},
        appliedSettings: {}
      };

    case ACCESSIBILITY_ACTIONS.APPLY_SETTINGS:
      return {
        ...state,
        appliedSettings: {
          ...state.appliedSettings,
          ...action.payload
        }
      };

    case ACCESSIBILITY_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case ACCESSIBILITY_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case ACCESSIBILITY_ACTIONS.INITIALIZE_SETTINGS:
      return {
        ...state,
        isInitialized: true,
        settings: action.payload.settings || {},
        currentProfile: action.payload.profile || null
      };

    case ACCESSIBILITY_ACTIONS.SAVE_PREFERENCES:
      return {
        ...state,
        savedPreferences: action.payload
      };

    case ACCESSIBILITY_ACTIONS.LOAD_PREFERENCES:
      return {
        ...state,
        savedPreferences: action.payload,
        settings: action.payload?.settings || state.settings
      };

    default:
      return state;
  }
};

export default accessibilityReducer; 