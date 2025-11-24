// cursor.js
class Cursor {
    static instance = null;

    constructor() {
        if (Cursor.instance) return Cursor.instance;
        Cursor.instance = this;
    }

    static getInstance() {
        if (!Cursor.instance) Cursor.instance = new Cursor();
        return Cursor.instance;
    }

    apply(key, attribute) {
        if (!attribute || 'big-cursor' === attribute.value) return;

        if ('mask' === attribute.value) {
            this.applyCursorMask();
        }

        if ('guideline' === attribute.value) {
            this.applyCursorGuideline();
        }
    }

    remove() {
        // Remove cursor mask and outline
        const mask = document.getElementById('wap-cursor-mask');
        const outline = document.getElementById('wap-cursor-outline');
        if (mask) mask.remove();
        if (outline) outline.remove();

        // Remove cursor guideline
        const guideline = document.getElementById('wap-cursor-guideline');
        if (guideline) guideline.remove();

        // Remove event listeners
        document.removeEventListener('mousemove', this.updateMaskCursor);
        document.removeEventListener('mousemove', this.updateGuidelineCursor);

        // Clear references
        this.maskOutlineElement = null;
        this.maskHalfHeight = null;
    }

    applyCursorMask() {
        if (document.getElementById('wap-cursor-mask')) return;

        const mask = document.createElement('div');
        mask.id = 'wap-cursor-mask';

        // Set mask height variable here (easy to update later)
        const maskHeight = 300; // <- Change this value to any height (px)
        const halfHeight = maskHeight / 2;

        mask.style.setProperty('--mask-height', `${maskHeight}px`);
        mask.style.setProperty('--half-mask-height', `${halfHeight}px`);

        Object.assign(mask.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            maskImage: `linear-gradient(to bottom,
            black 0,
            black calc(var(--y, 50%) - var(--half-mask-height)),
            transparent calc(var(--y, 50%) - var(--half-mask-height)),
            transparent calc(var(--y, 50%) + var(--half-mask-height)),
            black calc(var(--y, 50%) + var(--half-mask-height)),
            black 100%)`,
            WebkitMaskImage: `linear-gradient(to bottom,
            black 0,
            black calc(var(--y, 50%) - var(--half-mask-height)),
            transparent calc(var(--y, 50%) - var(--half-mask-height)),
            transparent calc(var(--y, 50%) + var(--half-mask-height)),
            black calc(var(--y, 50%) + var(--half-mask-height)),
            black 100%)`,
            zIndex: '999999'
        });

        // Add a visible outline
        const outline = document.createElement('div');
        outline.id = 'wap-cursor-outline';
        Object.assign(outline.style, {
            position: 'fixed',
            left: '0',
            width: '100vw',
            height: `${maskHeight}px`,
            pointerEvents: 'none',
            borderTop: '3px solid yellow',
            borderBottom: '3px solid yellow',
            boxSizing: 'border-box',
            zIndex: '999999'
        });

        document.body.appendChild(mask);
        document.body.appendChild(outline);

        // Save for reuse
        this.maskOutlineElement = outline;
        this.maskHalfHeight = halfHeight;

        document.addEventListener('mousemove', this.updateMaskCursor);
    }

    updateMaskCursor = (e) => {
        const mask = document.getElementById('wap-cursor-mask');
        const outline = this.maskOutlineElement;
        const halfHeight = this.maskHalfHeight;

        if (mask) {
            mask.style.setProperty('--y', `${e.clientY}px`);
        }

        if (outline) {
            const top = Math.max(0, Math.min(window.innerHeight - (halfHeight * 2), e.clientY - halfHeight));
            outline.style.top = `${top}px`;
        }
    }

    applyCursorGuideline() {
        if (document.getElementById('wap-cursor-guideline')) return;

        const bar = document.createElement('div');
        bar.id = 'wap-cursor-guideline';

        Object.assign(bar.style, {
            position: 'fixed',
            left: '0',
            top: '0',
            width: '45vw',                // Adjustable width (40–50vw)
            height: '10px',                // Line thickness
            backgroundColor: '#000',
            outline: '2px solid yellow',   // Yellow outline
            borderRadius: '2px',
            pointerEvents: 'none',
            zIndex: '999999',
            transition: 'top 0.02s linear, left 0.02s linear'
        });

        document.body.appendChild(bar);
        document.addEventListener('mousemove', this.updateGuidelineCursor);
    }

    updateGuidelineCursor = (e) => {
        const bar = document.getElementById('wap-cursor-guideline');
        if (!bar) return;

        const barWidth = bar.offsetWidth;
        const viewportWidth = window.innerWidth;

        // Calculate the ideal left position to center the bar
        let left = e.clientX - barWidth / 2;

        // Adjust if it would overflow left
        if (left < 0) {
            left = 0;
        }

        // Adjust if it would overflow right
        if (left + barWidth > viewportWidth) {
            left = viewportWidth - barWidth;
        }

        // Position the bar 5px above the cursor
        const top = e.clientY - 15;
        bar.style.left = `${left}px`;
        bar.style.top = `${top}px`;
    };
}

// export singleton
const cursor = () => Cursor.getInstance();
export default cursor;