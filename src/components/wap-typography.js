import { Typography } from "antd";

const { Text, Title, Paragraph, Link } = Typography;

const WapTypography = ({ children, ...props }) => {
    return (
        <Typography {...props}>{children}</Typography>
    );
};

WapTypography.Text = ({ children, ...props }) => <Text {...props}>{children}</Text>;
WapTypography.Title = ({ children, ...props }) => <Title {...props}>{children}</Title>;
WapTypography.Link = ({ children, ...props }) => <Link {...props}>{children}</Link>;
WapTypography.Paragraph = ({ children, ...props }) => <Paragraph {...props}>{children}</Paragraph>;

export default WapTypography;