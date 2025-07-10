import { useContext } from '@wordpress/element';
import AccessibilityContext from './AccessibilityContext';

// Custom hook to use the accessibility context
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

// Hook for accessing only state (read-only)
export const useAccessibilityState = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibilityState must be used within an AccessibilityProvider');
  }
  
  const { 
    currentProfile, 
    settings, 
    isLoading, 
    error, 
    isInitialized, 
    savedPreferences, 
    appliedSettings 
  } = context;
  
  return {
    currentProfile,
    settings,
    isLoading,
    error,
    isInitialized,
    savedPreferences,
    appliedSettings
  };
};

// Hook for accessing only actions
export const useAccessibilityActions = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibilityActions must be used within an AccessibilityProvider');
  }
  
  const { 
    setProfile, 
    updateSetting, 
    resetAll, 
    savePreferences, 
    loadPreferences, 
    setLoading, 
    setError 
  } = context;
  
  return {
    setProfile,
    updateSetting,
    resetAll,
    savePreferences,
    loadPreferences,
    setLoading,
    setError
  };
};

// Hook for specific setting access
export const useAccessibilitySetting = (settingKey) => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibilitySetting must be used within an AccessibilityProvider');
  }
  
  const value = context.settings[settingKey];
  const updateSetting = (newValue) => context.updateSetting(settingKey, newValue);
  
  return [value, updateSetting];
};

// Hook for profile management
export const useAccessibilityProfile = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibilityProfile must be used within an AccessibilityProvider');
  }
  
  return {
    currentProfile: context.currentProfile,
    setProfile: context.setProfile,
    resetAll: context.resetAll
  };
};

// Hook for preferences management
export const useAccessibilityPreferences = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibilityPreferences must be used within an AccessibilityProvider');
  }
  
  return {
    savedPreferences: context.savedPreferences,
    savePreferences: context.savePreferences,
    loadPreferences: context.loadPreferences
  };
}; 