/**
 * The shared components as visitors get them: only what the toolbar and
 * add-ons' front-end parts use (see src/components/toolbar-components.js).
 * Loaded under the same `websac-components` handle as the full set.
 */
import { toolbarComponents, publishComponents } from '../components/toolbar-components';

publishComponents(toolbarComponents);
