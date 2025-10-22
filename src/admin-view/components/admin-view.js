import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button, Drawer } from 'antd';

const AdminView = () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [adminBarHeight, setAdminBarHeight] = useState(32); // Default height

    useEffect(() => {
        // Get the WordPress admin bar height
        const adminBar = document.getElementById('wpadminbar');
        if (adminBar) {
            setAdminBarHeight(adminBar.offsetHeight);
        }
    }, []);

    const showLoading = () => {
        setOpen(true);
        setLoading(true);
        // Simulate loading data
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    };

    // Add necessary styles for the toggle button
    const buttonStyle = {
        position: 'fixed',
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 9999,
        borderRadius: '4px 0 0 4px',
        boxShadow: '-2px 0 5px rgba(0,0,0,0.2)'
    };

    // Calculate drawer header style based on admin bar height
    const drawerHeaderStyle = {
        padding: '16px 24px',
        borderBottom: '1px solid #f0f0f0',
        margin: 0,
        borderRadius: 0,
        position: 'sticky',
        top: 0,
        background: '#2E6CF6',
        zIndex: 1
    };

    return (
        <>
            {!open && (
                <Button
                    type="primary"
                    onClick={showLoading}
                    style={buttonStyle}
                >
                    {__('Admin', 'website-accessibility')}
                </Button>
            )}

            <Drawer
                title={
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%'
                    }}>
                        <span style={{
                            fontSize: '16px',
                            fontWeight: 500,
                            color: '#fff'
                        }}>
                            {__('Admin Panel', 'website-accessibility')}
                        </span>
                    </div>
                }
                placement="right"
                onClose={() => setOpen(false)}
                open={open}
                loading={loading}
                destroyOnClose
                width={400}
                styles={{
                    header: drawerHeaderStyle,
                    body: {
                        padding: 24,
                        margin: 0,
                        flex: 1,
                        overflow: 'auto',
                        paddingTop: 0
                    },
                    content: {
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        padding: 0
                    },
                    wrapper: {
                        paddingTop: `${adminBarHeight}px`
                    }
                }}
                style={{
                    overflow: 'hidden'
                }}
            >
                <p>{__('Admin content will go here', 'website-accessibility')}</p>
                <p>{__('Some contents...', 'website-accessibility')}</p>
                <p>{__('Some contents...', 'website-accessibility')}</p>
                <p>{__('Some contents...', 'website-accessibility')}</p>
            </Drawer>
        </>
    );
};

export default AdminView;
