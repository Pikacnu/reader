# Light Mode Toggle & i18n Implementation

This document describes the light/dark mode toggle and internationalization (i18n) features added to the reader app.

## Features Added

### 1. Light/Dark Mode Toggle
- **Location**: Settings panel in the top-right corner of the navigation bar
- **Features**:
  - Toggle between light and dark modes
  - Persistent theme preference (saved in localStorage)
  - Smooth transitions between themes
  - Applied globally across the entire application

### 2. Internationalization (i18n)
- **Supported Languages**:
  - 繁體中文 (zh-TW) - Traditional Chinese (Default)
  - 简体中文 (zh-CN) - Simplified Chinese
  - English (en)

- **Features**:
  - Language selector in the settings panel
  - Persistent language preference (saved in cookies)
  - Automatic language detection based on browser settings
  - Server-side rendering support

## Usage

### For Users

1. **Changing Theme**:
   - Click the settings icon (⚙️) in the top-right corner
   - Toggle the switch to change between light and dark mode
   - Your preference is automatically saved

2. **Changing Language**:
   - Click the settings icon (⚙️) in the top-right corner
   - Select your preferred language from the dropdown
   - The page will update immediately with the new language

### For Developers

#### Adding New Translations

1. Add translations to the appropriate locale files:
   - `public/locales/en/common.json`
   - `public/locales/zh-TW/common.json`
   - `public/locales/zh-CN/common.json`

2. Use translations in components:
```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return <h1>{t('your.translation.key')}</h1>;
}
```

#### Using Light Mode Context

```tsx
import { useLightMode } from '~/context/light_toggle_context';

function MyComponent() {
  const { isLightMode, toggleLightMode } = useLightMode();
  
  return (
    <button onClick={toggleLightMode}>
      {isLightMode ? 'Switch to Dark' : 'Switch to Light'}
    </button>
  );
}
```

#### Styling for Dark Mode

Use Tailwind's dark mode classes:
```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content
</div>
```

## Technical Details

### Dependencies Added
- `i18next` - Core i18n framework
- `react-i18next` - React bindings for i18next
- `remix-i18next` - Remix integration for i18next
- `i18next-browser-languagedetector` - Browser language detection
- `i18next-fs-backend` - File system backend for server-side rendering

### Configuration Files
- `app/i18n.ts` - i18n configuration
- `app/i18n.server.ts` - Server-side i18n setup
- `app/context/light_toggle_context.tsx` - Light mode context provider
- `tailwind.config.ts` - Updated with `darkMode: 'class'`

### Modified Files
- `app/root.tsx` - Added i18n loader and updated HTML structure
- `app/entry.client.tsx` - Client-side i18n initialization
- `app/entry.server.tsx` - Server-side i18n rendering
- `app/routes/_app.tsx` - Added settings panel and i18n support
- `app/routes/_app.home.tsx` - Translated content
- `app/compoents/navbar.tsx` - Translated navigation items

### New Components
- `app/compoents/settings.tsx` - Settings panel with theme toggle and language selector

## Browser Support

- All modern browsers with localStorage support
- Server-side rendering ensures proper initial theme and language

## Future Improvements

- Add more languages
- Add user preferences sync across devices (requires backend support)
- Add system theme detection (prefers-color-scheme)
- Animate theme transitions
