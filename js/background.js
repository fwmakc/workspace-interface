App.background = (function() {
    var filterMap = {
        blur: 'blur',
        brightness: 'brightness',
        contrast: 'contrast',
        grayscale: 'grayscale',
        hueRotate: 'hue-rotate',
        invert: 'invert',
        opacity: 'opacity',
        saturate: 'saturate',
        sepia: 'sepia'
    };

    function buildFilter(filters) {
        var parts = [];
        for (var key in filterMap) {
            if (filters[key] != null) {
                parts.push(filterMap[key] + '(' + filters[key] + ')');
            }
        }
        return parts.length ? parts.join(' ') : 'none';
    }

    function init() {
        var cfg = BG_CONFIG;
        var body = document.body;

        body.style.backgroundImage = 'url(' + cfg.image + ')';
        body.style.backgroundSize = cfg.size;
        body.style.backgroundPosition = cfg.position;
        body.style.backgroundRepeat = cfg.repeat;
        body.style.backgroundBlendMode = cfg.blendMode;

        var filterValue = buildFilter(cfg.filters);
        var style = document.createElement('style');
        style.textContent = 'body::before { background-color: ' + cfg.overlayColor + '; backdrop-filter: ' + filterValue + '; -webkit-backdrop-filter: ' + filterValue + '; }';
        document.head.appendChild(style);
    }

    return { init: init };
})();
