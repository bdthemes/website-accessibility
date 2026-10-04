/**
 * The full set of shared components, for the admin screens (and front-end
 * tools that ask for it, see the `websac_frontend_full_components` filter).
 * Visitors get the smaller set in build/frontend-components.
 */
import { toolbarComponents, publishComponents } from './toolbar-components';
import WapCollapse from './wap-collapse';
import WapAlert from './wap-alert';
import WapRadio from './wap-radio';
import WapSelect from './wap-select';
import WapSkeleton from './wap-skeleton';
import WapPageSkeleton from './wap-page-skeleton';
import WapBadge from './wap-badge';
import WapAvatar from './wap-avatar';
import WapSpin from './wap-spin';
import WapTag from './wap-tag';
import WapProgress from './wap-progress';
import WapModal from './wap-modal';
import WapDropdown from './wap-dropdown';
import WapList from './wap-list';
import WapSteps from './wap-steps';
import WapTable from './wap-table';
import WapEmpty from './wap-empty';
import WapInputNumber from './wap-input-number';
import WapSwitch from './wap-switch';
import WapTabs from './wap-tabs';
import WapUpload from './wap-upload';

publishComponents({
    ...toolbarComponents,
    WapCollapse,
    WapAlert,
    WapRadio,
    WapSelect,
    WapSkeleton,
    WapPageSkeleton,
    WapAvatar,
    WapSpin,
    WapBadge,
    WapTag,
    WapProgress,
    WapModal,
    WapDropdown,
    WapList,
    WapSteps,
    WapTable,
    WapEmpty,
    WapInputNumber,
    WapSwitch,
    WapTabs,
    WapUpload,
});
