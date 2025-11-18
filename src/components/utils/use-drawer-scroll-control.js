import { useEffect } from "@wordpress/element";

export default function useDrawerScrollLock(contentRef, isOpen) {
    useEffect(() => {
        if (!isOpen) {
            document.body.style.overflow = "";
            return;
        }

        const content = contentRef.current;
        if (!content) return;

        const onWheel = (e) => {
            const { scrollTop, scrollHeight, clientHeight } = content;

            const isDown = e.deltaY > 0;
            const atBottom = scrollTop + clientHeight >= scrollHeight;
            const atTop = scrollTop === 0;

            // If user tries to scroll outside content → stop it
            if ((isDown && atBottom) || (!isDown && atTop)) {
                e.preventDefault();
            }

            e.stopPropagation();
        };

        const handleEnter = () => {
            document.body.style.overflow = "hidden";
            content.addEventListener("wheel", onWheel, { passive: false });
        };

        const handleLeave = () => {
            document.body.style.overflow = "";
            content.removeEventListener("wheel", onWheel);
        };

        content.addEventListener("mouseenter", handleEnter);
        content.addEventListener("mouseleave", handleLeave);

        return () => {
            document.body.style.overflow = "";
            content.removeEventListener("mouseenter", handleEnter);
            content.removeEventListener("mouseleave", handleLeave);
            content.removeEventListener("wheel", onWheel);
        };
    }, [isOpen]);
}
