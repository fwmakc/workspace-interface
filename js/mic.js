App.mic = (function() {
    var active = false;

    var iconOn = '<svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm4.3-3c0 2.38-1.93 4.3-4.3 4.3S7.7 13.38 7.7 11H6c0 3.03 2.25 5.54 5.25 5.93V20h1.5v-3.07C15.75 16.54 18 14.03 18 11h-1.7z"/></svg>';
    var iconOff = '<svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/><line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

    function init() {
        var btn = document.getElementById('micBtn');

        btn.addEventListener('click', function() {
            active = !active;
            btn.classList.toggle('active', active);
            btn.innerHTML = active ? iconOn : iconOff;
            console.log('Микрофон:', active ? 'включен' : 'выключен');
        });
    }

    function isActive() {
        return active;
    }

    return { init: init, isActive: isActive };
})();
