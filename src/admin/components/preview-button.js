import { Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

/**
 * PreviewButton - A button component for triggering accessibility preview modal
 * 
 * @param {Object} props
 * @param {string} props.text - Button text (defaults to "Preview Accessibility")
 * @param {string} props.size - Button size ('small' | 'middle' | 'large')
 * @param {string} props.type - Button type ('primary' | 'default' | 'dashed' | 'text' | 'link')
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {function} props.onClick - Click handler to open preview modal
 * @param {React.ReactNode} props.icon - Custom icon component
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Additional inline styles
 */
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