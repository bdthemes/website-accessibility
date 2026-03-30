import { useLocation } from '../router';
import { useMemo, useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import clsx from 'clsx';
import Dashboard from './dashboard';
import CreatePreset from './create-preset';
import Presets from './presets';
import EditPreset from './edit-preset';
import Profiles from './profiles';
import CreateProfiles from './create-profiles';
import EditProfile from './edit-profile';
import Settings from './settings';
import ToolsBackup from './tools-backup';
import AboutInfo from './about-info';
import UsageStatistics from '../components/usage-statistics';
import LicenseManager from '../components/License/LicenseManager';
import Disclaimer from '../components/disclaimer';

const Pages = () => {
    const location = useLocation();
    const page = location?.params?.page;
    const [settings, setSettings] = useState();
    const API_NAMESPACE = "/sigmally/v1/settings";
    const isProPluginActive = typeof window !== 'undefined' && !!window.websacAdmin?.isProPluginActive;

    const fetchSettings = async () => {
        try {
            const res = await apiFetch({ path: API_NAMESPACE });
            setSettings(res?.data || {});
        } catch (error) {
            console.error("Failed to load settings:", error);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const RouteElement = useMemo(() => {
        switch (page) {
            case 'website-accessibilityfiles':
                return <Profiles />;
            case 'website-accessibilityfiles-edit':
                return <EditProfile />;
            case 'website-accessibilityfiles-create':
                return <CreateProfiles />;
            case 'website-accessibility-presets-edit':
                return <EditPreset />;
            case 'website-accessibility-presets':
                return <Presets />;
            case 'website-accessibility-presets-create':
                return <CreatePreset />;
            case 'website-accessibility-settings':
                return <Settings />;
            case 'website-accessibility-tools':
                return <ToolsBackup />;
            case 'website-accessibility-about':
                return <AboutInfo />;
            case 'website-accessibility-license':
                return isProPluginActive ? <LicenseManager pluginName="One Accessibility" /> : <Dashboard />;
            default:
                return <Dashboard />;
        }
    }, [page, isProPluginActive]);

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
                <div className={clsx('wap-admin-page', { [page]: page })}>
                    {RouteElement}
                </div>
                {page === 'website-accessibility' && settings && settings?.show_usage_statistics && (
                    <>
                        <div className="wap-admin-usage-statistics">
                            <UsageStatistics />
                        </div>
                        <Disclaimer />
                    </>
                )}
            </div>

        </>
    );
};

export default Pages;