import { Collapse, Input, List } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { useState } from 'react';

const languages = [
  { code: 'US', name: 'English (USA)' },
  { code: 'AZ', name: 'Azerbaijani (Azeri)' },
  { code: 'ID', name: 'Bahasa Indonesia (Indonesian)' },
  { code: 'EU', name: 'Basque (Basque)' },
  { code: 'CA', name: 'Català (Catalan)' },
  { code: 'CE', name: 'Cebuano (Filipino)' },
  // ...add more as needed
];

const LangBadge = ({ code, active }) => (
  <span className={`wap-language-selector__badge ${active ? 'wap-language-selector__badge--active' : ''}`}>
    {code}
  </span>
);

const LanguageSelector = () => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState('US');

  const filtered = languages.filter(lang =>
    lang.name.toLowerCase().includes(search.toLowerCase())
  );

  const collapseItems = [
    {
      key: '1',
      label: (
        <div className="wap-language-selector__header">
          <LangBadge code={selected} active={true} />
          <span className="wap-language-selector__header-label">
            {languages.find(l => l.code === selected)?.name || ''}
          </span>
        </div>
      ),
      children: (
        <>
          <Input
            placeholder="Search language"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="wap-language-selector__search"
            allowClear
          />
          <div className="wap-language-selector__list-wrapper">
            <List
              itemLayout="horizontal"
              dataSource={filtered}
              split={false}
              renderItem={item => {
                const active = selected === item.code;
                return (
                  <List.Item
                    className={`wap-language-selector__item ${active ? 'wap-language-selector__item--active' : ''}`}
                    onClick={() => setSelected(item.code)}
                  >
                    <LangBadge code={item.code} active={active} />
                    <span className="wap-language-selector__item-label">
                      {item.name}
                    </span>
                    {active && (
                      <CheckOutlined className="wap-language-selector__check" />
                    )}
                  </List.Item>
                );
              }}
            />
          </div>
        </>
      ),
      className: 'wap-language-selector__panel'
    }
  ];

  return (
    <div className="wap-language-selector">
      <Collapse
        defaultActiveKey={[]}
        bordered={false}
        expandIconPosition="end"
        className="wap-language-selector__collapse"
        items={collapseItems}
      />
    </div>
  );
};

export default LanguageSelector; 