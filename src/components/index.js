import AccessibilityProfiles from './accessibility-profiles';
import PanelFooter from './panel-footer';
import PanelHeader from './panel-header';
import PreviewButton from './preview-button';
import PreviewContent from './preview-content';
import WidgetFeatures from './widget-features';
import Icon from './icon';
import './styles/main.scss';
import features from './utils/features';
import panelItems from './utils/panel-items';
import isScreenReaderActive from './utils/is-screenreader-active';
import defaultProfiles from './utils/profiles';
import { getCookie, removeCookie, setCookie } from './utils/cookie-manager';
import useBrowserKey from './utils/use-browser-key';

window.wapComponents = {
    AccessibilityProfiles,
    Icon,
    PanelFooter,
    PanelHeader,
    PreviewButton,
    PreviewContent,
    WidgetFeatures
}

window.wapHelpers = {
    features,
    panelItems,
    isScreenReaderActive,
    defaultProfiles,
    getCookie,
    setCookie,
    removeCookie,
    useBrowserKey
}