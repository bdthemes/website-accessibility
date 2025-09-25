# Sigmally Website Accessibility

A comprehensive WordPress plugin that enhances website accessibility and ensures WCAG compliance with customizable accessibility toolbars, preset conditions, and user profiles.

## 🎯 Overview

**Sigmally Website Accessibility** is a modern, flexible WordPress plugin that helps your website meet WCAG, ADA, and other accessibility standards effortlessly. Create multiple accessibility presets and assign them conditionally to different areas of your site—Entire Site, Singular (posts/pages), or Archives (categories, tags).

The plugin includes a built-in mini editor to customize the accessibility toolbar layout and controls, giving users an intuitive experience tailored to different needs. It works independently of any page builder like Gutenberg or Elementor, ensuring compatibility with all WordPress themes.

## ✨ Key Features

- **Multiple Accessibility Presets** - Create unlimited presets with conditional assignment (Entire Site, Singular, Archives)
- **Built-in Mini Editor** - Customize toolbar layout using an intuitive drag-and-drop interface
- **User-Specific Profiles** - Create and manage accessibility profiles for different needs (vision impairment, ADHD, dyslexia, etc.)
- **Theme Independent** - Compatible with all WordPress themes and page builders
- **Comprehensive Tools** - Screen reader, contrast tools, animation controls, dictionary tooltips, Google Translate integration
- **Lightweight & Fast** - Optimized performance with minimal impact on site speed

## 📋 Requirements

### Runtime Requirements
- **WordPress**: 6.1 or higher
- **PHP**: 7.4 or higher
- **MySQL**: 5.6 or higher

### Development Requirements
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Composer**: 2.x or higher
- **PHP**: 7.4 or higher (with extensions: json, mysqli, curl)

## 🚀 Installation for Users

1. Upload the plugin to `/wp-content/plugins/website-accessibility` or install via WordPress plugin directory
2. Activate the plugin through the 'Plugins' screen in WordPress
3. Configure accessibility presets and profiles from the plugin settings
4. Assign presets conditionally to Entire Site, Singular, or Archive pages
5. Use the mini editor to customize the toolbar layout

## 🛠 Development Setup

### Prerequisites

Ensure you have the following installed on your development machine:

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Composer](https://getcomposer.org/)
- [WordPress Development Environment](https://developer.wordpress.org/block-editor/getting-started/devenv/) (Local by Flywheel, XAMPP, WAMP, etc.)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone [your-repo-url] website-accessibility
   cd website-accessibility
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install Node.js dependencies**
   ```bash
   npm install
   ```

4. **Start development server**
   ```bash
   npm run start
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run start` | Start development server with hot reload |
| `npm run build` | Build production assets |
| `npm run packages-update` | Update WordPress packages |
| `npm run make-pot` | Generate translation files |
| `npm run plugin-zip` | Create distributable plugin zip |
| `npm run publish` | Build, generate translations, and create zip |

### Development Workflow

1. **Start the development server**:
   ```bash
   npm run start
   ```
   This will watch for file changes and automatically rebuild assets.

2. **Make your changes** in the appropriate directories:
   - PHP backend code: `includes/`
   - React components: `src/`
   - Styles: `src/*/styles/`

3. **Test your changes** in your WordPress development environment

4. **Build for production** when ready:
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
website-accessibility/
├── assets/                     # Static assets (fonts, images)
├── includes/                   # PHP backend code
│   ├── Admin/                  # WordPress admin functionality
│   ├── Core/                   # Core plugin classes
│   ├── Traits/                 # PHP traits
│   └── View/                   # Frontend rendering
├── src/                        # Frontend JavaScript/React code
│   ├── admin/                  # Admin dashboard components
│   ├── components/             # Reusable React components
│   ├── frontend/               # Frontend accessibility features
│   └── assets/                 # Frontend assets
├── languages/                  # Translation files
├── vendor/                     # Composer dependencies
├── build/                      # Built assets (auto-generated)
├── composer.json              # PHP dependencies
├── package.json               # Node.js dependencies
└── website-accessibility.php  # Main plugin file
```

### Key Directories

- **`includes/`** - Contains all PHP backend code with PSR-4 autoloading
- **`src/admin/`** - React-based admin interface components
- **`src/components/`** - Reusable frontend accessibility components
- **`src/frontend/`** - Frontend functionality and context providers

## 🔧 Architecture

### Backend (PHP)
- **Namespace**: `bdthemes\websiteaccessibility`
- **Pattern**: Singleton pattern for main classes
- **Autoloading**: PSR-4 via Composer
- **Post Types**: Custom post types for presets and profiles

### Frontend (React)
- **Build Tool**: WordPress Scripts (Webpack-based)
- **UI Framework**: Ant Design (antd)
- **State Management**: React Context API
- **Styling**: SCSS with component-based architecture

## 🧪 Testing

### Manual Testing
1. Activate the plugin in your WordPress development environment
2. Create accessibility presets via the admin interface
3. Test conditional assignment (Entire Site, Singular, Archives)
4. Verify frontend accessibility toolbar functionality
5. Test with different themes and page builders

### Code Quality
- **PHP**: Follow WordPress Coding Standards
- **JavaScript**: ESLint configuration included via @wordpress/scripts
- **Styles**: SCSS linting and formatting

## 🌐 Translation

The plugin is translation-ready. To generate translation files:

```bash
npm run make-pot
```

Translation files are stored in the `languages/` directory.

## 📦 Building for Production

To create a distribution-ready plugin:

```bash
npm run publish
```

This will:
1. Build optimized production assets
2. Generate translation files
3. Create a plugin zip file

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards
- Follow WordPress PHP Coding Standards
- Use meaningful commit messages
- Ensure all code is properly documented
- Test thoroughly before submitting PRs

## 📄 License

This plugin is licensed under the GPL-2.0-or-later license. See the [LICENSE](https://www.gnu.org/licenses/gpl-2.0.html) file for details.

## 🆘 Support

- **Documentation**: [WordPress.org Plugin Page](https://wordpress.org/plugins/website-accessibility/)
- **Issues**: [WordPress.org Support Forum](https://wordpress.org/support/plugin/website-accessibility/)
- **Email**: support@bdthemes.com

## 🏢 About BDThemes

Sigmally Website Accessibility is developed by [BDThemes](https://bdthemes.com), a leading WordPress theme and plugin development company.

---

**Made with ❤️ for a more accessible web**
