import { Skeleton } from "antd";

// Props were being dropped, which is why callers reached for a bare spinner
// whenever they needed a shape other than the default paragraph.
const WapSkeleton = (props) => {
    return (
        <Skeleton active {...props} />
    );
};

WapSkeleton.Node = Skeleton.Node;
WapSkeleton.Input = Skeleton.Input;
WapSkeleton.Button = Skeleton.Button;
WapSkeleton.Avatar = Skeleton.Avatar;
WapSkeleton.Image = Skeleton.Image;

export default WapSkeleton;