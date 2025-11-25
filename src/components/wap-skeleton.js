import { Skeleton } from "antd";

const WapSkeleton = () => {
    return (
        <Skeleton />
    );
};

WapSkeleton.Node = Skeleton.Node;
WapSkeleton.Input = Skeleton.Input;

export default WapSkeleton;