import { Button } from 'antd';
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
  return (
    <Button
      type={type}
      size={size}
      icon={icon}
      onClick={onClick}
      disabled={disabled}
      className={`wap-preview-button ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        ...style
      }}
      aria-label="Preview accessibility features"
      {...props}
    >
      {text}
    </Button>
  );
};

export default PreviewButton;