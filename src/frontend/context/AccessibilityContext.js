import { createContext, useContext, useReducer, useEffect } from '@wordpress/element';
import AccessibilityManager from '../../accessibilty-manager';

const AccessibilityContext = createContext();

const initialState = {
  settings: {},
  currentProfile: null,
  isInitialized: false
};

const ACCESSIBILITY_ACTIONS = {
  UPDATE_SETTING: 'UPDATE_SETTING',
  RESET_ALL: 'RESET_ALL',
  INITIALIZE_SETTINGS: 'INITIALIZE_SETTINGS',
};

const accessibilityReducer = (state, action) => {
  switch (action.type) {
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
        settings: {}
      };
    case ACCESSIBILITY_ACTIONS.INITIALIZE_SETTINGS:
      return {
        ...state,
        settings: action.payload.settings || {},
        isInitialized: true
      };
    default:
      return state;
  }
};

export const AccessibilityProvider = ({ children }) => {
  const [state, dispatch] = useReducer(accessibilityReducer, initialState);

  useEffect(() => {
    // On mount, initialize settings (could load from localStorage if needed)
    dispatch({
      type: ACCESSIBILITY_ACTIONS.INITIALIZE_SETTINGS,
      payload: { settings: {} }
    });
  }, []);

  const updateSetting = (key, value) => {
    // Update state
    dispatch({
      type: ACCESSIBILITY_ACTIONS.UPDATE_SETTING,
      payload: { key, value }
    });
    
    const accessibilityManager = new AccessibilityManager();
    // Apply or remove feature using the AccessibilityManager
    if (value) {
      accessibilityManager.init(key, value);
    } else {
      accessibilityManager.removeFeature(key);
    }
  };

  const resetAll = () => {
    dispatch({ type: ACCESSIBILITY_ACTIONS.RESET_ALL });
    const accessibilityManager = new AccessibilityManager();
    accessibilityManager.removeAllFeatures();
  };

  const value = {
    ...state,
    updateSetting,
    resetAll
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export default AccessibilityContext; 