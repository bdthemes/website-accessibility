import { useLocation } from '../router';
import { useMemo, useEffect } from '@wordpress/element';
import Dashboard from './dashboard';
import Presets from './presets';
import Profiles from './profiles';
import clsx from 'clsx';
import CreatePreset from './create-preset';
import EditPreset from './edit-preset';
import PreviewPreset from './preview-preset';
import CreateProfiles from './create-profiles';
import EditProfile from './edit-profile';

const Pages = () => {
    const location = useLocation();
    const page = location?.params?.page;

    const RouteElement = useMemo(() => {
        switch (page) {
            case 'website-accessibility-presets':
                return <Presets />;
            case 'website-accessibilityfiles':
                return <Profiles />;
            case 'website-accessibility-presets-create':
                return <CreatePreset />;
            case 'website-accessibility-presets-edit':
                return <EditPreset />;
            case 'website-accessibility-presets-preview':
                return <PreviewPreset />;
            case 'website-accessibilityfiles-create':
                return <CreateProfiles />;
            case 'website-accessibilityfiles-edit':
                return <EditProfile />;
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
        <div className="website-accessibility-app">
            <div className={clsx('website-accessibility-page', { [page]: page })}>
                {RouteElement}
            </div>
        </div>
    );
};

export default Pages;