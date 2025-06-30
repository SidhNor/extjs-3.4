    /**
     * @cfg {String} ariaLabel
     * Optional text to apply as an `aria-label` attribute on the underlying
     * button element for screen readers when no visible text is provided.
     */
    ariaLabel : undefined,

        if (this.ariaLabel) {
            btnEl.dom.setAttribute('aria-label', this.ariaLabel);
        }
