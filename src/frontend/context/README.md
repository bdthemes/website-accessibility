# Accessibility Context API

This Context API provides a comprehensive solution for managing accessibility settings in the frontend. It handles state management, DOM manipulation, and persistence of user preferences.

## Features

- **State Management**: Centralized state for all accessibility settings
- **DOM Manipulation**: Automatic application of accessibility changes to the page
- **Persistence**: Save and load user preferences in localStorage
- **Profile Support**: Apply predefined accessibility profiles
- **Real-time Updates**: Immediate visual feedback when settings change
- **Reset Functionality**: Reset all settings to default values

## Architecture

```
context/
├── index.js                 # Main exports
├── AccessibilityContext.js  # Main context and provider
├── accessibilityReducer.js  # State management reducer
├── accessibilityUtils.js    # DOM manipulation utilities
├── useAccessibility.js      # Custom hooks
└── AccessibilityProvider.js # Provider wrapper
```

## Usage

### 1. Wrap your app with the provider

```jsx
import { AccessibilityProvider } from './context';

function App() {
  return (
    <AccessibilityProvider>
      <YourApp />
    </AccessibilityProvider>
  );
}
```

### 2. Use the context in components

```jsx
import { useAccessibility, useAccessibilityActions } from './context';

function MyComponent() {
  // Access state
  const { currentProfile, settings, isLoading } = useAccessibility();
  
  // Access actions
  const { setProfile, updateSetting, resetAll, savePreferences } = useAccessibilityActions();
  
  // Update a setting
  const handleFontSizeChange = (size) => {
    updateSetting('fontSize', size);
  };
  
  // Apply a profile
  const handleProfileSelect = (profile) => {
    setProfile(profile);
  };
  
  return (
    <div>
      <p>Current font size: {settings.fontSize}</p>
      <button onClick={() => handleFontSizeChange('large')}>
        Increase Font Size
      </button>
      <button onClick={resetAll}>Reset All</button>
      <button onClick={savePreferences}>Save Preferences</button>
    </div>
  );
}
```

### 3. Use specific hooks for targeted access

```jsx
import { 
  useAccessibilitySetting, 
  useAccessibilityProfile, 
  useAccessibilityPreferences 
} from './context';

function SettingsPanel() {
  // Access specific setting
  const [fontSize, setFontSize] = useAccessibilitySetting('fontSize');
  
  // Access profile management
  const { currentProfile, setProfile, resetAll } = useAccessibilityProfile();
  
  // Access preferences
  const { savedPreferences, savePreferences, loadPreferences } = useAccessibilityPreferences();
  
  return (
    <div>
      <select value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
        <option value="small">Small</option>
        <option value="medium">Medium</option>
        <option value="large">Large</option>
      </select>
    </div>
  );
}
```

## Available Settings

The context supports the following accessibility settings:

### Text Settings
- `fontSize`: 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge'
- `lineHeight`: 'tight' | 'normal' | 'relaxed' | 'loose'
- `letterSpacing`: 'tight' | 'normal' | 'wide' | 'wider'
- `wordSpacing`: 'tight' | 'normal' | 'wide' | 'wider'
- `dyslexicFont`: boolean

### Visual Settings
- `contrast`: 'normal' | 'high' | 'very_high'
- `saturation`: 'grayscale' | 'low' | 'normal' | 'high'
- `brightness`: 'dark' | 'normal' | 'bright' | 'very_bright'
- `highContrast`: boolean

### Interaction Settings
- `cursorSize`: 'small' | 'normal' | 'large' | 'xlarge'
- `focusIndicator`: 'default' | 'thick' | 'dotted' | 'glow'
- `reducedMotion`: boolean
- `spacing`: 'tight' | 'normal' | 'wide' | 'wider'

## State Structure

```javascript
{
  currentProfile: Profile | null,
  settings: {
    fontSize: 'medium',
    lineHeight: 'normal',
    // ... other settings
  },
  isLoading: false,
  error: null,
  isInitialized: false,
  savedPreferences: Preferences | null,
  appliedSettings: {}
}
```

## Actions

### State Management
- `setProfile(profile)`: Apply a complete accessibility profile
- `updateSetting(key, value)`: Update a single setting
- `resetAll()`: Reset all settings to default
- `setLoading(loading)`: Set loading state
- `setError(error)`: Set error state

### Persistence
- `savePreferences()`: Save current settings to localStorage
- `loadPreferences()`: Load saved preferences from localStorage

## DOM Manipulation

The context automatically applies accessibility changes to the DOM:

- **Font changes**: Applied to all text elements
- **Contrast/Brightness**: Applied to images and media
- **Focus indicators**: Injected as CSS styles
- **Reduced motion**: Disables animations and transitions
- **High contrast**: Applies high contrast color scheme
- **Dyslexic font**: Loads and applies OpenDyslexic font

## Best Practices

1. **Always wrap your app** with `AccessibilityProvider`
2. **Use specific hooks** when you only need certain parts of the context
3. **Handle loading states** when applying profiles
4. **Save preferences** when users make changes
5. **Reset settings** when needed (e.g., logout)
6. **Test with screen readers** and other assistive technologies

## Error Handling

The context includes error handling for:
- Failed localStorage operations
- Invalid setting values
- DOM manipulation errors
- Profile loading errors

## Performance Considerations

- Settings are applied immediately to the DOM
- Large DOM manipulations are optimized
- Preferences are cached in localStorage
- Unnecessary re-renders are minimized

## Browser Support

- Modern browsers with ES6+ support
- localStorage for persistence
- CSS custom properties for styling
- Intersection Observer for performance

## Accessibility Compliance

- WCAG 2.1 AA compliant
- Supports screen readers
- Keyboard navigation friendly
- High contrast mode support
- Reduced motion support 