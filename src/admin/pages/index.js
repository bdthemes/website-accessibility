import { useLocation } from '../router';
import { useMemo, useEffect } from '@wordpress/element';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { REST_PATHS, restQuery } from '../data/queries';
import Dashboard from './dashboard';
import CreatePreset from './create-preset';
import Presets from './presets';
import EditPreset from './edit-preset';
import Settings from './settings';
import AboutInfo from './about-info';
import GetPro from './get-pro';
import UsageStatistics from '../components/usage-statistics';
import Disclaimer from '../components/disclaimer';
import { getAdminExtensions } from '../../utils/admin-extensions';

const Pages = () => {
    const location = useLocation();
    const page = location?.params?.page;
    // The page comes with the flag, so the settings are only fetched where it was
    // not localized (an older build of the plugin's PHP side). wp_localize_script()
    // turns top-level booleans into strings ("1" / ""), so it is never a boolean
    // here: checking for one made every screen fetch the settings, and the
    // statistics card appear only once they arrived. Once the Settings screen has
    // loaded or changed them in this visit, its cached copy is newer.
    const localizedUsageStats = window?.websacAdmin?.showUsageStatistics;
    const hasLocalizedFlag = localizedUsageStats !== undefined && localizedUsageStats !== null;
    const { data: settingsResponse } = useQuery(
        restQuery(REST_PATHS.settings, { enabled: !hasLocalizedFlag })
    );
    const cachedSettings = settingsResponse?.data;
    const showUsageStatistics = cachedSettings && 'show_usage_statistics' in cachedSettings
        ? !!cachedSettings.show_usage_statistics
        : !!localizedUsageStats && localizedUsageStats !== '0';
    const extensions = getAdminExtensions();

    const RouteElement = useMemo(() => {
        // Screens contributed by add-ons (registered before this bundle loads).
        const ExtensionPage = page ? extensions.pages[page] : null;
        if (ExtensionPage) {
            return <ExtensionPage />;
        }

        switch (page) {
            case 'website-accessibility-presets-edit':
                return <EditPreset />;
            case 'website-accessibility-presets':
                return <Presets />;
            case 'website-accessibility-presets-create':
                return <CreatePreset />;
            case 'website-accessibility-settings':
                return <Settings />;
            case 'website-accessibility-about':
                return <AboutInfo />;
            case 'website-accessibility-get-pro':
                return <GetPro />;
            default:
                return <Dashboard />;
        }
    }, [page]);

    useEffect(() => {
        const subMenuItems = document.querySelectorAll('.toplevel_page_website-accessibility ul li');
        subMenuItems.forEach((item) => {
            const link = item.querySelector('a');
            if (link) {
                const href = link.getAttribute('href');
                const isCurrent = href === `admin.php?page=${page}`;
                if (isCurrent) {
                    item.classList.add('current');
                    link.classList.add('current');
                } else {
                    item.classList.remove('current');
                    link.classList.remove('current');
                }
            }
        });
    }, [page]);
    return (
        <>
            <div className="wap-admin-pages">

                {page === 'website-accessibility' && showUsageStatistics && (
                    <div className="wap-admin-usage-statistics" style={{ marginBottom: '20px' }}>
                        <UsageStatistics />
                    </div>
                )}
                 <div className={clsx('wap-admin-page', { [page]: page })}>
                    {RouteElement}
                </div>
                {
                    page === 'website-accessibility' && (
                        <Disclaimer />
                    )
                }
            </div>

        </>
    );
};

export default Pages;
