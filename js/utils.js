App.utils = (function() {
    function makeLongPress(el, callback, threshold) {
        threshold = threshold || 600;
        var timer;
        var startX, startY;

        function onTouchStart(e) {
            if (e.touches.length !== 1) return;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            timer = setTimeout(function() {
                callback(startX, startY);
            }, threshold);
        }

        function onTouchEnd() {
            clearTimeout(timer);
        }

        function onTouchMove(e) {
            if (e.touches.length !== 1) {
                clearTimeout(timer);
                return;
            }
            var dx = Math.abs(e.touches[0].clientX - startX);
            var dy = Math.abs(e.touches[0].clientY - startY);
            if (dx > 10 || dy > 10) {
                clearTimeout(timer);
            }
        }

        el.addEventListener('touchstart', onTouchStart);
        el.addEventListener('touchend', onTouchEnd);
        el.addEventListener('touchmove', onTouchMove);
    }

    function createOverlay(toggleBtn, overlayEl) {
        document.addEventListener('click', function(e) {
            if (!overlayEl.contains(e.target) && e.target !== toggleBtn && !toggleBtn.contains(e.target)) {
                overlayEl.classList.remove('open');
            }
        });
    }

    return { makeLongPress: makeLongPress, createOverlay: createOverlay };
})();
