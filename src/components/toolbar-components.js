/**
 * The components the front-end toolbar (and add-ons' front-end parts) use.
 *
 * Visitors get only these (build/frontend-components); the admin screens get
 * them plus the rest of the Wap* controls (build/components). Front-end code
 * may use nothing else from `window.wapComponents` unless it asks for the full
 * set with the `websac_frontend_full_components` filter.
 */
import Icon from './icon';
import AccessibilityProfiles from './accessibility-profiles';
import PanelFooter from './panel-footer';
import PanelHeader from './panel-header';
import PreviewButton from './preview-button';
import PreviewContent from './preview-content';
import WidgetFeatures from './widget-features';
import WapFlex from './wap-flex';
import WapCard from './wap-card';
import WapButton from './wap-button';
import WapRow from './wap-row';
import WapCol from './wap-col';
import WapInput from './wap-input';
import WapDrawer from './wap-drawer';
import WapSpace from './wap-space';
import WapTooltip from './wap-tooltip';
import WapTypography from './wap-typography';
import WapMessage from './wap-message';
import WapNotification from './wap-notification';
import './styles/main.scss';

import { helpers } from '../utils/helpers';
import { getAdminExtensions } from '../utils/admin-extensions';

export const toolbarComponents = {
    AccessibilityProfiles,
    Icon,
    PanelFooter,
    PanelHeader,
    PreviewButton,
    PreviewContent,
    WidgetFeatures,
    WapFlex,
    WapCard,
    WapButton,
    WapCol,
    WapRow,
    WapInput,
    WapDrawer,
    WapSpace,
    WapTooltip,
    WapTypography,
    WapMessage,
    WapNotification,
};

/** Publish the components and helpers for the other bundles (and add-ons) to read. */
export const publishComponents = (components) => {
    // Create the admin extension registry early so add-on bundles can register into it.
    getAdminExtensions();

    window.wapComponents = components;

    window.wapHelpers = {
        ...(window.wapHelpers || {}),
        ...helpers,
        // The toolbar understands `unavailable` on a feature definition (a reason the
        // feature cannot work here): the tile stays listed but cannot be switched on.
        supportsUnavailableFeatures: true,
    };
};
