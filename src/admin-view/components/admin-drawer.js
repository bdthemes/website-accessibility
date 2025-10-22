import { Drawer } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const AdminDrawer = ({ visible, onClose }) => {
    const [isVisible, setIsVisible] = useState(visible);

    useEffect(() => {
        setIsVisible(visible);
    }, [visible]);

    const onCloseDrawer = () => {
        setIsVisible(false);
        onClose();
    };

    return (
        <Drawer
            title={
                <div className="admin-drawer-header">
                    <span>Admin</span>
                    <button 
                        type="button" 
                        onClick={onCloseDrawer} 
                        className="close-btn"
                    >
                        <CloseOutlined />
                    </button>
                </div>
            }
            placement="right"
            onClose={onCloseDrawer}
            open={isVisible}
            width={400}
            className="website-accessibility-admin-drawer"
            closable={false}
            bodyStyle={{ 
                padding: 0, 
                margin: 0,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <div className="admin-content">
                {/* Content will go here */}
            </div>
        </Drawer>
    );
};

export default AdminDrawer;
