import { useSelect } from "@wordpress/data";
import { STORE_NAME } from "../store";
import { useLocation } from "../router";
import clsx from "clsx";
import { useState, useMemo } from '@wordpress/element';
import { Drawer } from 'antd';

const PreviewPreset = () => {
  const { Icon, PreviewButton, PreviewContent } = window?.wapComponents;
  const location = useLocation();
  const id = location?.params?.id;
  const [isOpen, setIsOpen] = useState(false);
  const preset = useSelect((select) => {
    return select(STORE_NAME).getPreset(id);
  }, [id]);

  const parsedContent = useMemo(() => {
    try {
      return preset?.content ? JSON.parse(preset.content) : null;
    } catch (e) {
      console.error("Failed to parse preset content:", e);
      return null;
    }
  }, [preset?.content]);

  const panel = parsedContent?.panel ?? null;
  const button = parsedContent?.button ?? null;

  const allProfiles = useSelect((select) => {
    const { getProfiles } = select(STORE_NAME);
    const profiles = getProfiles(true);
    return profiles || [];
  }, []);

  return (
    <>
      <div className="wap-os-style-wrapper">
        <span className="wap-os-style"></span>
        <span className="wap-os-style"></span>
        <span className="wap-os-style"></span>
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
          width={Number(panel?.wrapper?.width || 400)}
          className="wap-preset__preview-drawer"
          rootClassName="wap-preset__preview-drawer-root"
        >
          <PreviewContent panel={panel} allProfiles={allProfiles} setIsOpen={setIsOpen} />
        </Drawer>
      </div>
    </>
  )
};

export default PreviewPreset;