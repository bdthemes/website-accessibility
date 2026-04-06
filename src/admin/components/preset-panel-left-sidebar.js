import {
  EditOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from "@ant-design/icons";
import { useState, useRef, useEffect } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { useSelect, useDispatch } from "@wordpress/data";
import { STORE_NAME } from "../store";
import { useLicense } from "../context/LicenseContext";
import HeaderSettings from "../settings/header-settings";
import ProfilesSettings from "../settings/profiles-settings";
import FeatureSettings from "../settings/feature-settings";
import FooterSettings from "../settings/footer-settings";

const PresetPanelLeftSidebar = () => {
  const { WapCard, WapRow, WapCol, WapDrawer, WapBadge } = window?.wapComponents;
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const { isProActive } = useLicense();
  const timerRef = useRef(null);

  const { presetsFormData } = useSelect((select) => select(STORE_NAME).getPresetsFormData());
  const { setPresetsFormData } = useDispatch(STORE_NAME);

  let items = (presetsFormData?.panel?.items || []).filter((item) => item.slug !== 'language');


  const handleVisibilityToggle = (slug) => {
    const updatedItems = items.map((item) =>
      item.slug === slug ? { ...item, active: !item.active } : item
    );

    setPresetsFormData({
      ...presetsFormData,
      panel: {
        ...presetsFormData.panel,
        items: updatedItems,
      }
    });
  };

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setDrawerVisible(true);
  };

  const handleDrawerClose = () => {
    setDrawerVisible(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setSelectedItem(null);
    }, 400);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (drawerVisible) {
      document.body.classList.add('wap-panel-left-sidebar-open');
    } else {
      document.body.classList.remove('wap-panel-left-sidebar-open');
    }
  }, [drawerVisible]);

  return (
    <div className="wap-panel-left-sidebar">
      {items.map((item) => {
        return (
          <WapCard key={item.id} className="wap-panel-left-sidebar__row">
            <WapRow justify="space-between" align="middle">
              <WapCol>
                <span>{item.title}</span>
              </WapCol>
              <WapCol className="wap-panel-left-sidebar__actions">
                {(!item?.isPro || isProActive) && (
                  <EditOutlined
                    className="wap-panel-left-sidebar__icon-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(item);
                    }}
                  />
                )}
                {item?.isPro && !isProActive ? (
                  <WapBadge
                    count="Pro"
                    style={{
                      backgroundColor: '#f5222d',
                      fontSize: '12px',
                      padding: '0 6px',
                    }}
                  />
                ) : item.active ? (
                  <EyeOutlined
                    className="wap-panel-left-sidebar__icon-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVisibilityToggle(item.slug);
                    }}
                  />
                ) : (
                  <EyeInvisibleOutlined
                    className="wap-panel-left-sidebar__icon-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVisibilityToggle(item.slug);
                    }}
                  />
                )}

              </WapCol>
            </WapRow>
          </WapCard>
        )
      })}

      <WapDrawer
        title={`Edit ${selectedItem?.title || 'Item'}`}
        placement="left"
        onClose={handleDrawerClose}
        open={drawerVisible}
        width={'27vw'}
        rootStyle={{ top: 30, left: 160 }}
        rootClassName="wap-panel-left-sidebar__drawer"
      >
        {selectedItem?.slug === 'header' && (
          <HeaderSettings
            item={selectedItem}
          />
        )}
        {selectedItem?.slug === 'profiles' && (
          <ProfilesSettings
            item={selectedItem}
          />
        )}
        {selectedItem?.slug === 'features' && (
          <FeatureSettings
            item={selectedItem}
          />
        )}

        {selectedItem?.slug === 'footer' && (
          <FooterSettings
            item={selectedItem}
          />
        )}

      </WapDrawer>
    </div>
  );
};

export default PresetPanelLeftSidebar;
