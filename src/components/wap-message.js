import { message } from 'antd';

// Push messages below the WordPress admin bar so they aren't clipped.
// WP admin bar is 32px on desktop and 46px on screens <= 782px.
const getAdminBarOffset = () => {
    if (typeof window === 'undefined') {
        return 56;
    }
    const isMobile = window.matchMedia && window.matchMedia('(max-width: 782px)').matches;
    return (isMobile ? 46 : 32) + 16;
};

message.config({
    top: getAdminBarOffset(),
    duration: 3,
    maxCount: 3,
});

if (typeof window !== 'undefined' && window.matchMedia) {
    const mql = window.matchMedia('(max-width: 782px)');
    const handleChange = () => {
        message.config({ top: getAdminBarOffset() });
    };
    if (typeof mql.addEventListener === 'function') {
        mql.addEventListener('change', handleChange);
    } else if (typeof mql.addListener === 'function') {
        mql.addListener(handleChange);
    }
}

const WapMessage = message;

export default WapMessage;