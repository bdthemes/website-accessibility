class Tooltips {
    static instance = null;

    constructor() {
        if (Tooltips.instance) return Tooltips.instance;

        this._enabled = false;

        // Options
        this.skipSelectors = ['.wap-preset__preview-drawer-root'];

        this._tooltip = null;
        this._arrow = null;
        this._currentLabel = null;

        // Pre-bind
        this._boundMouseOver = this._handleMouseOver.bind(this);
        this._boundMouseOut = this._handleMouseOut.bind(this);
        this._boundMouseMove = this._handleMouseMove.bind(this);

        Tooltips.instance = this;
    }

    static getInstance() {
        if (!Tooltips.instance) {
            Tooltips.instance = new Tooltips();
        }
        return Tooltips.instance;
    }

    apply() {
        if (this._enabled) return;
        this._enabled = true;

        this._createTooltip();

        document.addEventListener("mouseover", this._boundMouseOver, true);
        document.addEventListener("mouseout", this._boundMouseOut, true);
        document.addEventListener("mousemove", this._boundMouseMove, true);
    }

    remove() {
        if (!this._enabled) return;
        this._enabled = false;

        document.removeEventListener("mouseover", this._boundMouseOver, true);
        document.removeEventListener("mouseout", this._boundMouseOut, true);
        document.removeEventListener("mousemove", this._boundMouseMove, true);

        if (this._tooltip) this._tooltip.remove();
        this._tooltip = null;
        this._arrow = null;
    }

    _createTooltip() {
        this._tooltip = document.createElement("div");
        this._tooltip.className = "wap-accessibility-tooltip";
        this._arrow = document.createElement("span");
        this._arrow.className = "wap-accessibility-tooltip-arrow";

        this._tooltip.appendChild(this._arrow);
        document.body.appendChild(this._tooltip);
    }

    _shouldSkip(el) {
        if (!el) return false;

        const selectorList = document.querySelectorAll(this.skipSelectors);
        for (let i = 0; i < selectorList.length; i++) {
            if (selectorList[i].contains(el)) return true;
        }
        return false;
    }

    _getTooltipText(el) {
        if (!el || this._shouldSkip(el)) {
            this._handleMouseOut();
            return null;
        }

        let label = el.getAttribute("aria-label")
            || (el.tagName === "IMG" ? el.alt : null);

        // Check up to 2 parent levels for aria-label/alt
        let parent = el;
        for (let i = 0; i < 2 && !label && parent?.parentElement; i++) {
            parent = parent.parentElement;
            if (this._shouldSkip(parent)) return null;

            label = parent.getAttribute("aria-label")
                || (parent.tagName === "IMG" ? parent.alt : null);
        }

        // Fallback ONLY for button or anchor
        if (!label && (el.tagName === "BUTTON" || el.tagName === "A")) {
            const text = el.textContent?.trim();
            if (text) return text;
        }

        return label || null;
    }


    _handleMouseOver(ev) {
        if (!this._enabled) return;

        const label = this._getTooltipText(ev.target);
        if (!label) return;

        this._tooltip.textContent = label;
        this._tooltip.appendChild(this._arrow);

        this._tooltip.classList.add("visible");
    }

    _handleMouseOut() {
        if (!this._enabled) return;

        this._tooltip.classList.remove("visible");
    }

    _handleMouseMove(ev) {
        if (!this._enabled || (!this._tooltip.classList.contains("visible"))) return;

        const tooltip = this._tooltip;
        const arrow = this._arrow;

        // Reset to measure
        tooltip.style.left = "-9999px";
        tooltip.style.top = "-9999px";

        const rect = tooltip.getBoundingClientRect();
        const mx = ev.clientX;
        const my = ev.clientY;

        const margin = 12;
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        // Default: top
        let top = my - rect.height - margin;
        let left = mx - rect.width / 2;
        let direction = "top";

        // Flip vertically if not enough space
        if (top < 0) {
            top = my + margin;
            direction = "bottom";
        }

        // Ensure tooltip doesn’t go below screen
        if (top + rect.height > screenH) {
            top = Math.max(margin, my - rect.height - margin);
            direction = "top";
        }

        // Shift horizontally if tooltip overflows screen
        if (left < 0) left = margin;
        if (left + rect.width > screenW) left = screenW - rect.width - margin;

        // Apply final position
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;

        // Only up or down arrow
        this._applyArrow(direction);
    }


    _applyArrow(direction) {
        const arrow = this._arrow;
        arrow.classList.remove("top", "bottom");
        arrow.classList.add(direction);
    }
}

// Singleton helper
const tooltips = () => Tooltips.getInstance();
export default tooltips;
