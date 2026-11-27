import { Layout } from 'antd';

/**
 * antd's Layout, with its Header, Sider, Content and Footer, for the admin
 * screens. Published here so the admin bundle does not ship a second copy of
 * antd: it reads every antd component from this bundle (window.wapComponents).
 */
const WapLayout = Layout;

export default WapLayout;
