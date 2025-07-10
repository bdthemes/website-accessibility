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
      style={style}
      {...props}
    >
      {text}
    </Button>
  );
};

export default PreviewButton;