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
import WapTypography from './wap-typography';
import WapEmpty from './wap-empty';
import WapInputNumber from './wap-input-number';
import WapMessage from './wap-message';
import WapNotification from './wap-notification';
import WapSwitch from './wap-switch';
import WapTabs from './wap-tabs';
import WapUpload from './wap-upload';
import './styles/main.scss';

import { helpers } from '../utils';

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
    WapTypography,
    WapEmpty,
    WapInputNumber,
    WapMessage,
    WapNotification,
    WapSwitch,
    WapTabs,
    WapUpload
}

window.wapHelpers = {
    ...(window.wapHelpers || {}),
    ...helpers,
}
