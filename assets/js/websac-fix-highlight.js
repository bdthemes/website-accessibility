/**
 * Scroll to highlight a saved fix: skips scroll when already in view when appropriate (top/hero vs footer reveal).
 * Same animated underline-style cue plus a pulsing focus glow (box-shadow ring) on every highlighted element.
 * Runs only when `websacFixHighlight` global is localized by PHP after capability checks.
 *
 * Mirrors resolve logic similar to Accessibility Checker utils (direct evaluate + body-index fallback).
 *
 * @package website-accessibility
 */
(function () {
  'use strict';

  /** @returns {Element|null} */
  function evaluateXPath(trimmed) {
    if (
      !trimmed ||
      (!trimmed.startsWith('/') &&
        !trimmed.startsWith('.//') &&
        !trimmed.startsWith('//'))
    ) {
      return null;
    }
    try {
      var direct = document.evaluate(
        trimmed,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;
      if (direct && direct.nodeType === Node.ELEMENT_NODE) {
        return /** @type {Element} */ (direct);
      }
      if (
        direct &&
        direct.nodeType === Node.ATTRIBUTE_NODE &&
        /** @type {Attr} */ (direct).ownerElement
      ) {
        return /** @type {Attr} */ (direct).ownerElement;
      }
    } catch (e) {
      /* fallback */
    }

    var bodyShiftMatch = trimmed.match(/^\/html\/body\/([a-z0-9_-]+)(?:\[(\d+)\])?(\/.+)$/i);
    if (!bodyShiftMatch) {
      return null;
    }

    var rootTag = (bodyShiftMatch[1] || '').toLowerCase();
    var rootIndex = Number.parseInt(bodyShiftMatch[2] || '1', 10);
    var tailPath = bodyShiftMatch[3];
    var body = document.body;
    if (!body || !rootTag || !tailPath) {
      return null;
    }

    var candidates = Array.prototype.filter.call(body.children || [], function (el) {
      return (
        String(el.tagName || '').toLowerCase() === rootTag && el.id !== 'wpadminbar'
      );
    });
    if (candidates.length === 0) {
      return null;
    }

    var preferredIndexes = [];
    var directIndex = Number.isFinite(rootIndex) ? rootIndex - 1 : 0;
    if (directIndex >= 0) preferredIndexes.push(directIndex);
    if (directIndex - 1 >= 0) preferredIndexes.push(directIndex - 1);
    if (directIndex + 1 < candidates.length)
      preferredIndexes.push(directIndex + 1);

    for (var i = 0; i < candidates.length; i++) {
      if (preferredIndexes.indexOf(i) === -1) {
        preferredIndexes.push(i);
      }
    }

    for (var p = 0; p < preferredIndexes.length; p++) {
      var idx = preferredIndexes[p];
      var base = candidates[idx];
      if (!base) continue;
      try {
        var node = document.evaluate(
          '.' + tailPath,
          base,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;
        if (node && node.nodeType === Node.ELEMENT_NODE) {
          return /** @type {Element} */ (node);
        }
        if (
          node &&
          node.nodeType === Node.ATTRIBUTE_NODE &&
          /** @type {Attr} */ (node).ownerElement
        ) {
          return /** @type {Attr} */ (node).ownerElement;
        }
      } catch (err2) {
        continue;
      }
    }

    return null;
  }

  function getViewportPadTop() {
    var bar = typeof document !== 'undefined' ? document.getElementById('wpadminbar') : null;
    return (bar && bar.offsetHeight ? bar.offsetHeight : 0) + 12;
  }

  /**
   * Target is already unobstructed in the viewport under the admin band — avoid extra scroll.
   */
  function isFixedTargetAlreadyWellPlaced(el) {
    var pad = getViewportPadTop();
    var vh = window.innerHeight || document.documentElement.clientHeight || 0;
    if (vh <= 0 || !(el instanceof HTMLElement)) {
      return false;
    }
    var r = el.getBoundingClientRect();
    if (!(r.height > 0)) {
      return false;
    }
    if (r.top < pad - 12) {
      return false;
    }
    if (r.bottom > vh - 24) {
      return false;
    }

    return true;
  }

  /** Long downward trip or element well below viewport → animate from doc top then down. */
  function shouldUseRevealFromDocTop(el) {
    var pad = getViewportPadTop();
    var vh = window.innerHeight || 0;
    if (vh <= 0) {
      return false;
    }
    var r = el.getBoundingClientRect();
    var y0 =
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    var estimatedScroll = Math.max(0, r.top + y0 - pad);

    return r.bottom > vh + 60 || estimatedScroll > vh * 0.92;
  }

  /** Don’t jerk top-region fixes away; footer-style fixes keep the-from-top reveal. */
  function scrollIntoFixedIssue(el) {
    if (isFixedTargetAlreadyWellPlaced(el)) {
      return;
    }
    if (shouldUseRevealFromDocTop(el)) {
      scrollFromTopThenSmoothToFixedTarget(el);
    } else {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          scrollWindowElementToTopAligned(el, 'smooth');
        });
      });
    }
  }

  /**
   * Smoothly scroll the window so the element’s top sits below the viewport top (WP admin bar, etc.).
   */
  function scrollWindowElementToTopAligned(el, behavior) {
    var beh = behavior === 'auto' ? 'auto' : 'smooth';
    var pad = getViewportPadTop();
    var rect = el.getBoundingClientRect();
    var y0 =
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    var targetTop = Math.max(0, rect.top + y0 - pad);
    try {
      window.scrollTo({
        top: targetTop,
        left: 0,
        behavior: beh,
      });
    } catch (e) {
      window.scrollTo(0, targetTop);
    }
  }

  /** Instant window top, then one smooth downward scroll (full page scroll from top to the fix). */
  function scrollFromTopThenSmoothToFixedTarget(el) {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch (e) {
      window.scrollTo(0, 0);
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        scrollWindowElementToTopAligned(el, 'smooth');
      });
    });
  }

  function runHighlight() {
    var cfg =
      typeof window.websacFixHighlight === 'object' &&
      window.websacFixHighlight &&
      typeof window.websacFixHighlight.xpath === 'string'
        ? window.websacFixHighlight
        : null;
    if (!cfg || !cfg.xpath) {
      return;
    }

    var el =
      evaluateXPath(cfg.xpath.trim()) ||
      evaluateXPath(cfg.xpath.trim().replace(/^\/\/+/, '//'));

    if (!el || !(el instanceof HTMLElement)) {
      console.warn('[One Accessibility] Could not locate the fixed element from the saved path.');
      return;
    }

    scrollIntoFixedIssue(el);

    window.setTimeout(function () {
      if (isFixedTargetAlreadyWellPlaced(el)) {
        return;
      }
      var rect = el.getBoundingClientRect();
      var bar = document.getElementById('wpadminbar');
      var pad = bar && bar.offsetHeight ? bar.offsetHeight + 12 : 12;
      var vh = window.innerHeight || 0;
      if (vh <= 0) {
        return;
      }
      if (rect.top < pad || rect.bottom > vh - 24) {
        try {
          el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        } catch (e5) {
          scrollWindowElementToTopAligned(el, 'smooth');
        }
      }
    }, 320);

    var onLoadScroll = function () {
      scrollIntoFixedIssue(el);
    };
    if (document.readyState === 'complete') {
      window.setTimeout(onLoadScroll, 0);
    } else {
      window.addEventListener('load', onLoadScroll, { once: true });
    }

    var markerCss = [
      '.websac-fix-highlight-marker{',
      'box-sizing:border-box;',
      'position:relative;',
      'z-index:1;',
      'outline:none;',
      'background-repeat:no-repeat;',
      'background-image:linear-gradient(90deg,#93c5fd 0%,#60a5fa 45%,#3b82f6 95%);',
      'background-size:0 3px;',
      'background-position:left bottom;',
      'padding-bottom:8px;',
      'animation:',
      'websacHlUnderline 1.05s cubic-bezier(.2,.65,.35,1) .12s forwards,',
      'websacHlUnderlinePulse 2.2s ease-in-out 1s 6,',
      'websacHlGlowPulse 2.35s ease-in-out .08s 8;',
      '-webkit-box-decoration-break:clone;',
      'box-decoration-break:clone;',
      '}@keyframes websacHlUnderline{to{background-size:100% 3px;}}',
      '@keyframes websacHlUnderlinePulse{',
      '0%,100%{filter:brightness(1);}',
      '50%{filter:brightness(1.08);}',
      '}',
      '@keyframes websacHlGlowPulse{',
      '0%,100%{',
      'box-shadow:',
      '0 0 0 1px rgba(96,165,250,.42),',
      '0 1px 2px rgba(15,23,42,.06),',
      '0 10px 36px rgba(59,130,246,.38),',
      '0 24px 60px rgba(37,99,235,.26),',
      'inset 0 0 0 1px rgba(255,255,255,.96);',
      '}',
      '50%{',
      'box-shadow:',
      '0 0 0 2px rgba(96,165,250,.62),',
      '0 1px 3px rgba(15,23,42,.06),',
      '0 16px 52px rgba(59,130,246,.5),',
      '0 32px 74px rgba(37,99,235,.38),',
      'inset 0 0 0 1px rgba(255,255,255,.96);',
      '}',
      '}',
      '@media(prefers-reduced-motion:reduce){',
      '.websac-fix-highlight-marker{',
      'animation:none!important;',
      'background:none!important;',
      'padding-bottom:4px;',
      'margin-bottom:0;',
      'border-bottom:2px solid rgba(96,165,250,.92);',
      '-webkit-text-decoration:none;',
      'text-decoration:none;',
      'outline:none;',
      'box-shadow:',
      '0 0 0 1px rgba(96,165,250,.5),',
      '0 10px 40px rgba(59,130,246,.42),',
      '0 22px 56px rgba(37,99,235,.35),',
      'inset 0 0 0 1px rgba(255,255,255,.96);',
      '}',
      '}',
    ].join('');

    /** Defer marker until smooth scroll mostly finished (shows motion first, then cue). */
    var markerDelay = typeof cfg.markerDelayMs === 'number' ? cfg.markerDelayMs : 820;

    var styleInjected =
      /** @type {HTMLElement | null} */ (document.getElementById(
        'websac-fix-highlight-style'
      ));
    if (!styleInjected) {
      styleInjected = document.createElement('style');
      styleInjected.id = 'websac-fix-highlight-style';
      document.head.appendChild(styleInjected);
    }
    styleInjected.textContent = markerCss;

    var clearMarkerClasses = function (marked) {
      marked.classList.remove('websac-fix-highlight-marker');
    };

    /** @returns {HTMLElement} */
    function pickUnderlineTarget(markerEl) {
      var t = (markerEl.tagName || '').toLowerCase();
      if (t !== 'svg' || !markerEl.parentElement) return markerEl;
      var wrap = markerEl.closest('span, div, figure, nav, footer, header, section, ul, ol, li');
      if (
        wrap instanceof HTMLElement &&
        wrap.querySelector(':scope svg') &&
        wrap.textContent.trim() === ''
      ) {
        return wrap;
      }
      return markerEl;
    }

    window.setTimeout(function () {
      el.setAttribute('data-websac-fix-highlight', '1');
      try {
        if (
          typeof el.focus === 'function' &&
          (el.tabIndex !== -1 || el.closest('button, a, input, select, textarea, [tabindex]'))
        ) {
          el.focus({ preventScroll: true });
        }
      } catch (eFocus) {}

      /** Same animated underline cue for links, paragraphs, buttons, images, SVG, etc. */
      function applyMarker(markerEl) {
        markerEl.classList.remove('websac-fix-highlight-marker');
        markerEl.classList.add('websac-fix-highlight-marker');
        return markerEl;
      }

      var shown = pickUnderlineTarget(el);
      shown = applyMarker(shown);

      window.setTimeout(function () {
        try {
          var u = new URL(window.location.href);
          ['websac_highlight', 'websac_xpath'].forEach(function (k) {
            u.searchParams.delete(k);
          });
          window.history.replaceState({}, '', u.toString());
        } catch (eRepl) {}
      }, 400);

      var removeTimer = typeof cfg.fadeMs === 'number' ? cfg.fadeMs : 14000;

      window.setTimeout(function () {
        clearMarkerClasses(el);
        if (el !== shown) clearMarkerClasses(shown);
        el.removeAttribute('data-websac-fix-highlight');
      }, removeTimer);

      console.info('[One Accessibility] Fixed-issue highlight:', el.tagName.toLowerCase());
    }, markerDelay);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runHighlight);
  } else {
    runHighlight();
  }
})();
