import {
  EditOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Card, Row, Col, Drawer } from "antd";
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

const PresetPanelLeftSidebar = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const timerRef = useRef(null);

  const { presetsFormData } = useSelect((select) => select(STORE_NAME).getPresetsFormData());
  const { setPresetsFormData } = useDispatch(STORE_NAME);

  const items = presetsFormData?.panel?.items || [];

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
        {items.map((item) => (
          <Card key={item.id} className="wap-panel-left-sidebar__row">
            <Row justify="space-between" align="middle">
              <Col>
                {
                  !item?.disableDrag && (
                    <MenuOutlined className="wap-panel-left-sidebar__drag-handle" />
                  )
                }
                <span>{item.title}</span>
              </Col>
              <Col className="wap-panel-left-sidebar__actions">
                <EditOutlined
                  className="wap-panel-left-sidebar__icon-action"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(item);
                  }}
                />
                {item.active ? (
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
              </Col>
            </Row>
          </Card>
        ))}
      </ReactSortable>

      <Drawer
        title={`Edit ${selectedItem?.title || 'Item'}`}
        placement="left"
        onClose={handleDrawerClose}
        open={drawerVisible}
        width={400}
        mask={false}
        rootStyle={{ top: 30, left: 160 }}
      >
        {selectedItem?.slug === 'header' && (
          <HeaderSettings
            item={selectedItem}
          />
        )}
        {selectedItem?.slug === 'language' && (
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

      </Drawer>
    </div>
  );
};

export default PresetPanelLeftSidebar;
