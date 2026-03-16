import { EyeOutlined } from '@ant-design/icons';

const PreviewButton = ({
  text = 'Preview Accessibility',
  size = 'middle',
  type = 'default',
  disabled = false,
  onClick,
  icon = <EyeOutlined />,
  className = '',
  style = {},
  ...props
}) => {
  const { WapButton } = window?.wapComponents;
  return (
    <WapButton
      type={type}
      size={size}
      icon={icon}
      onClick={onClick}
      disabled={disabled}
      className={`wap-preview-button notranslate ${className}`}
      translate="no"
      style={style}
      {...props}
    >
      {text}
    </WapButton>
  );
};

export default PreviewButton;
