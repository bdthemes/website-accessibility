import { forwardRef } from '@wordpress/element';
import { Menu } from 'antd';

/**
 * antd's Menu for the admin screens (the sidebar navigation). Published here so
 * the admin bundle does not ship a second copy of antd.
 */
const WapMenu = forwardRef((props, ref) => <Menu ref={ref} {...props} />);

WapMenu.displayName = 'WapMenu';

export default WapMenu;
