import { useLocation } from '../router';
import { useMemo, useEffect, useState } from '@wordpress/element';
import clsx from 'clsx';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import Dashboard from './dashboard';
import CreatePreset from './create-preset';
import Presets from './presets';
import EditPreset from './edit-preset';
import PreviewPreset from './preview-preset';
import Profiles from './profiles';
import CreateProfiles from './create-profiles';
import EditProfile from './edit-profile';
import Settings from './settings';
import UsageStatisticsSection from '../components/UsageStatisticsSection';
import { Spin } from 'antd';

const useUsageStatisticsSetting = () => {
    const [isEnabled, setIsEnabled] = useState(null);

    useEffect(() => {
        const fetchSetting = async () => {
            try {
                const response = await apiFetch({
                    path: addQueryArgs('/sigmally/v1/settings')
                });
                const settingValue = response?.data?.enable_usage_statistics;
                setIsEnabled(settingValue !== false);
            } catch (error) {
                console.error('Failed to load usage statistics setting:', error);
                setIsEnabled(true);
            }
        };

        fetchSetting();
    }, []);

    return isEnabled;
};

const Pages = () => {
    const location = useLocation();
    const page = location?.params?.page;
    const isUsageStatsEnabled = useUsageStatisticsSetting();

    const RouteElement = useMemo(() => {
        switch (page) {

            case 'website-accessibilityfiles':
                return <Profiles />;
            case 'website-accessibilityfiles-edit':
                return <EditProfile />;
            case 'website-accessibilityfiles-create':
                return <CreateProfiles />;
            case 'website-accessibility-presets-preview':
                return <PreviewPreset />;
            case 'website-accessibility-presets-edit':
                return <EditPreset />;
            case 'website-accessibility-presets':
                return <Presets />;
            case 'website-accessibility-presets-create':
                return <CreatePreset />;
            case 'website-accessibility-settings':
                return <Settings />;
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
                <div className={clsx('wap-admin-page', { [page]: page })}>
                    {RouteElement}
                </div>
            </div>
            {page === 'website-accessibility' && (
                <UsageStatisticsSection />
            )}
        </>
    );
};

export default Pages;