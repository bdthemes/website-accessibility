import { useLocation } from '../router';
import { useMemo, useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import clsx from 'clsx';
import Dashboard from './dashboard';
import CreatePreset from './create-preset';
import Presets from './presets';
import EditPreset from './edit-preset';
import CssOverrides from './css-overrides';
import Settings from './settings';
import AboutInfo from './about-info';
import GetPro from './get-pro';
import UsageStatistics from '../components/usage-statistics';
import Disclaimer from '../components/disclaimer';
import { ProfilesUpsell, ToolsUpsell } from '../components/pro-upsell-page';
import { getAdminExtensions } from '../../utils/admin-extensions';

const Pages = () => {
    const location = useLocation();
    const page = location?.params?.page;
    const [settings, setSettings] = useState();
    const API_NAMESPACE = "/websac/v1/settings";
    const extensions = getAdminExtensions();

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
        // Screens contributed by add-ons (registered before this bundle loads).
        const ExtensionPage = page ? extensions.pages[page] : null;
        if (ExtensionPage) {
            return <ExtensionPage />;
        }

        switch (page) {
            case 'website-accessibilityfiles':
                return <ProfilesUpsell />;
            case 'website-accessibility-presets-edit':
                return <EditPreset />;
            case 'website-accessibility-presets':
                return <Presets />;
            case 'website-accessibility-presets-create':
                return <CreatePreset />;
            case 'website-accessibility-css-overrides':
                return <CssOverrides />;
            case 'website-accessibility-settings':
                return <Settings />;
            case 'website-accessibility-tools':
                return <ToolsUpsell />;
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

                {page === 'website-accessibility' && settings && settings?.show_usage_statistics && (
                    <>
                        <div className="wap-admin-usage-statistics" style={{ marginBottom: '20px' }}>
                            <UsageStatistics />
                        </div>
                      
                    </>
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
