import { useSelect, useDispatch } from '@wordpress/data';
import { STORE_NAME } from '../store';
import ControlWrapper from '../components/control-wrapper';
import { __ } from '@wordpress/i18n';


const { WapCollapse, WapRadio, WapSwitch } = window?.wapComponents;

const LanguageSelectorSettings = () => {
  const { presetsFormData } = useSelect((select) => select(STORE_NAME).getPresetsFormData());
  const { setPresetsFormData } = useDispatch(STORE_NAME);
  const languageItem = presetsFormData.panel.items.find(item => item.slug === 'language');
  const attributes = languageItem?.attributes || {};

  const updateAttr = (updates) => {
    const updatedItems = presetsFormData.panel.items.map((item) =>
      item.slug === 'language'
        ? { ...item, attributes: { ...attributes, ...updates } }
        : item
    );

    setPresetsFormData({
      ...presetsFormData,
      panel: {
        ...presetsFormData.panel,
        items: updatedItems
      }
    });
  };

  const collapseItems = [
    {
      key: '1',
      label: __('General', 'website-accessibility'),
      children: (
          <ControlWrapper label={__('Layout', 'website-accessibility')}>
            <WapRadio.Group
              value={attributes.layout || 'collapse'}
              onChange={(e) => updateAttr({ layout: e.target.value })}
            >
              <WapRadio value="collapse">{__('With Collapse', 'website-accessibility')}</WapRadio>
              <WapRadio value="list">{__('Simple List', 'website-accessibility')}</WapRadio>
            </WapRadio.Group>
          </ControlWrapper>
      )
    },
    {
      key: '2',
      label: __('Header', 'website-accessibility'),
      children: (
        <>
          <ControlWrapper label={__('Hide Flag', 'website-accessibility')}>
            <WapSwitch
              checked={attributes.hideHeaderFlag}
              onChange={(checked) => updateAttr({ hideHeaderFlag: checked })}
            />
          </ControlWrapper>
          <ControlWrapper label={__('Hide Language Code badge', 'website-accessibility')}>
            <WapSwitch
              checked={attributes.hideHeaderLanguageCode}
              onChange={(checked) => updateAttr({ hideHeaderLanguageCode: checked })}
            />
          </ControlWrapper>
        </>
      )
    },
    {
      key: '3',
      label: __('Body', 'website-accessibility'),
      children: (
        <>
          <ControlWrapper label={__('Hide Flag', 'website-accessibility')}>
            <WapSwitch
              checked={attributes.hideBodyFlag}
              onChange={(checked) => updateAttr({ hideBodyFlag: checked })}
            />
          </ControlWrapper>
          <ControlWrapper label={__('Hide Language Code badge', 'website-accessibility')}>
            <WapSwitch
              checked={attributes.hideBodyLanguageCode}
              onChange={(checked) => updateAttr({ hideBodyLanguageCode: checked })}
            />
          </ControlWrapper>
        </>
      )
    }
  ];

  return <WapCollapse items={collapseItems} />;
};

export default LanguageSelectorSettings;
