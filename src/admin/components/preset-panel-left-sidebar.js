import {
  EditOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Card, Row, Col, Drawer, Badge } from "antd";
import { ReactSortable } from "react-sortablejs";
import { useState, useRef, useEffect } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { useSelect, useDispatch } from "@wordpress/data";
import { STORE_NAME } from "../store";
import HeaderSettings from "../settings/header-settings";
import ProfilesSettings from "../settings/profiles-settings";
import FeatureSettings from "../settings/feature-settings";
import LanguageSelectorSettings from "../settings/language-selector-settings";
import FooterSettings from "../settings/footer-settings";
import WapCard from "../../components/wap-card";
import WapRow from "../../components/wap-row";
import WapCol from "../../components/wap-col";
import WapDrawer from "../../components/wap-drawer";

const PresetPanelLeftSidebar = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const isProActive = window?.websacPro?.isProActive || false;
  const timerRef = useRef(null);

  const { presetsFormData } = useSelect((select) => select(STORE_NAME).getPresetsFormData());
  const { setPresetsFormData } = useDispatch(STORE_NAME);

  let items = presetsFormData?.panel?.items || [];

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
      <ReactSortable
        list={items}
        setList={(newItems) => {
          // Keep first and last items in place
          const fixedFirst = items[0];
          const fixedLast = items[items.length - 1];

          const middleItems = newItems.filter(
            (item) => item.id !== fixedFirst.id && item.id !== fixedLast.id
          );

          setPresetsFormData({
            ...presetsFormData,
            panel: {
              ...presetsFormData.panel,
              items: [fixedFirst, ...middleItems, fixedLast],
            }
          });
        }}
        handle=".wap-panel-left-sidebar__drag-handle"
        animation={150}
        ghostClass="wap-panel-left-sidebar__ghost"
      >
        {items.map((item) => {
          return (
            <WapCard key={item.id} className="wap-panel-left-sidebar__row">
              <WapRow justify="space-between" align="middle">
                <WapCol>
                  {
                    !item?.disableDrag && (
                      <MenuOutlined className="wap-panel-left-sidebar__drag-handle" />
                    )
                  }
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
                    <Badge
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
      </ReactSortable>

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
        {selectedItem?.slug === 'language' && isProActive && (
          <LanguageSelectorSettings
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
