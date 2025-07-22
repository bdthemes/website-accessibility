=== Website Accessibility ===
Contributors:      bdthemes
Tags:              accessibility, a11y, compliance, toolbar, frontend
Requires at least: 6.1
Tested up to:      6.8
Requires PHP:      7.4
Stable tag:        1.0.0
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

Improve your website's accessibility and compliance with a fully customizable accessibility toolbar, preset conditions, and user profiles.

== Description ==

**Website Accessibility** is a modern and flexible accessibility plugin that helps you meet WCAG, ADA, and other accessibility standards effortlessly.

This plugin allows users to create multiple accessibility presets and assign them conditionally to different areas of your site: Entire Site, Singular (single posts/pages), or Archives (category, tag, archive pages).

Key features include a customizable mini editor for the accessibility panel layout and full control for creating and managing custom user profiles.

The plugin works independently of any page builder like Gutenberg, Elementor, or others, making it compatible with all themes and setups.

### 🔧 Key Features

- Create multiple accessibility presets with conditional display on Entire Site, Singular, or Archives
- Customizable mini editor for configuring the accessibility toolbar panel layout and controls
- Create and manage custom accessibility profiles for users with different needs (vision impairment, ADHD, dyslexia, etc.)
- Lightweight, performant, and easy to use
- Fully theme-agnostic — works with any WordPress theme without relying on page builders

Whether for client sites or your own, Website Accessibility provides a powerful, flexible solution to deliver an inclusive web experience.

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/website-accessibility` directory, or install via the WordPress plugin repository.
2. Activate the plugin through the "Plugins" screen in WordPress.
3. Create accessibility presets and profiles in the plugin settings.
4. Assign presets conditionally to Entire Site, Singular, or Archives.
5. Customize the toolbar panel using the mini editor as needed.

== Frequently Asked Questions ==

= Can I create multiple accessibility presets? =

Yes. You can create multiple presets and assign them conditionally across different site areas.

= Does the plugin depend on Gutenberg or any page builder? =

No. The plugin works independently of any page builder and is compatible with all themes.

= Can I create custom accessibility profiles? =

Yes. You can create and manage custom profiles tailored to different accessibility needs.

= What conditions are available to show presets? =

You can assign presets to Entire Site, Singular (single posts/pages), or Archives (categories, tags, etc.).

== Screenshots ==

1. Accessibility toolbar on frontend with customizable layout.
2. Preset management screen with conditional assignment.
3. Mini editor interface for toolbar customization.
4. Custom profile creation and management interface.

== Libraries and Credits ==

This plugin uses the following open-source libraries and tools. We are grateful to their developers for their contributions:

- **[React](https://reactjs.org/)** – A JavaScript library for building user interfaces (MIT License)
- **[Ant Design (antd)](https://ant.design/)** – A modern React UI library used for components (MIT License)
- **[clsx](https://github.com/lukeed/clsx)** – A utility for constructing className strings conditionally (MIT License)
- **[history](https://github.com/remix-run/history)** – A JavaScript library for managing session history (MIT License)
- **[SortableJS](https://sortablejs.github.io/Sortable/)** – A lightweight, touch-friendly drag-and-drop library (MIT License)
- **[React SortableJS](https://github.com/SortableJS/react-sortablejs)** – React bindings for SortableJS (MIT License)
- **[@wordpress/scripts](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-scripts/)** – Official build setup for modern WordPress plugin/block development (GPL-2.0-or-later)
- **[@wordpress/icons](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-icons/)** – WordPress icon package used in block UI (GPL-2.0-or-later)

== Changelog ==

= 1.0.0 =
* Initial release
* Multiple presets with conditional display (Entire Site, Singular, Archives)
* Customizable mini editor for toolbar panel layout
* Custom accessibility profiles
* Theme-agnostic and independent of page builders
