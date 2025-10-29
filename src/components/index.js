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
import WapFlex from './wap-flex';
import WapCard from './wap-card';
import WapButton from './wap-button';
import WapRow from './wap-row';
import WapCol from './wap-col';
import WapCollapse from './wap-collapse';
import WapInput from './wap-input';
import WapDrawer from './wap-drawer';
import WapAlert from './wap-alert';
import WapRadio from './wap-radio';
import WapSelect from './wap-select';
import WapSpace from './wap-space';
import WapSkeleton from './wap-skeleton';
import WapBadge from './wap-badge';
import WapAvatar from './wap-avatar';
import WapSpin from './wap-spin';
import WapTag from './wap-tag';
import WapProgress from './wap-progress';
import WapModal from './wap-modal';
import WapTooltip from './wap-tooltip';
import WapDropdown from './wap-dropdown';
import WapList from './wap-list';
import WapSteps from './wap-steps';
import WapTable from './wap-table';

window.wapComponents = {
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
    WapCollapse,
    WapInput,
    WapDrawer,
    WapAlert,
    WapRadio,
    WapSelect,
    WapSpace,
    WapSkeleton,
    WapAvatar,
    WapSpin,
    WapBadge,
    WapTag,
    WapProgress,
    WapModal,
    WapTooltip,
    WapDropdown,
    WapList,
    WapSteps,
    WapTable,
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