import PreviewContent from "../components/preview-content";
import { useSelect } from "@wordpress/data";
import { STORE_NAME } from "../store";
import { useLocation } from "../router";
import PreviewButton from "../components/preview-button";
import clsx from "clsx";
import Icon from "../components/icon";
import { useState } from '@wordpress/element';
import { Drawer } from 'antd';

const PreviewPreset = () => {
  const location = useLocation();
  const id = location?.params?.id;
  const [isOpen, setIsOpen] = useState(false);
  const { panel, button } = useSelect((select) => {
    const { getPreset } = select(STORE_NAME);
    const preset = getPreset(id);
    const content = preset?.content || {};
    try {
      const parsedContent = JSON.parse(content);
      return {
        panel: parsedContent?.panel || {},
        button: parsedContent?.button || {},
      };
    } catch (error) {
      return {
        panel: {},
        button: {},
      };
    }
  }, [id]);
  const allProfiles = useSelect((select) => {
    const { getProfiles } = select(STORE_NAME);
    const profiles = getProfiles(true);
    return profiles || [];
  }, []);

  return (
    <>
      <div className="wap-button-style-preset__preview-wrapper-bg ">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className="wap-panel-customization__panel-wrapper">
        <PreviewButton
          type="default"
          text={button?.text}
          icon={button?.showIcon ? <Icon name={button?.icon} /> : null}
          className={clsx('wap-button-style-preset__preview-btn', button?.position)}
          style={{
            '--button-color': button?.color,
            '--button-bg': button?.bgColor,
            '--button-padding': button?.padding,
            '--button-radius': button?.borderRadius,
            '--button-offset-x': button?.offsetX,
            '--button-offset-y': button?.offsetY,
          }}
          onClick={() => setIsOpen(true)}
        />
        <Drawer
          open={isOpen}
          onClose={() => setIsOpen(false)}
          width={600}
        >
          <PreviewContent panel={panel} allProfiles={allProfiles} />
        </Drawer>
      </div>
    </>
  )
};

export default PreviewPreset;