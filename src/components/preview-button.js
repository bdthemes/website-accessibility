import { EyeOutlined } from '@ant-design/icons';
import WapButton from './wap-button';

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
  return (
    <WapButton
      type={type}
      size={size}
      icon={icon}
      onClick={onClick}
      disabled={disabled}
      className={`wap-preview-button ${className}`}
      style={style}
      {...props}
    >
      {text}
    </WapButton>
  );
};

export default PreviewButton;