App.clock = (function() {
    function pad(n) {
        return n < 10 ? '0' + n : n;
    }

    function update() {
        var now = new Date();
        var day = pad(now.getDate());
        var month = pad(now.getMonth() + 1);
        var year = now.getFullYear();
        var hours = pad(now.getHours());
        var minutes = pad(now.getMinutes());
        var seconds = pad(now.getSeconds());

        var el = document.getElementById('clock');
        if (el) el.innerHTML = '<div class="clock-time">' + hours + ':' + minutes + '</div><div class="clock-date">' + day + '.' + month + '.' + year + '</div>';
    }

    function init() {
        update();
        setInterval(update, 1000);
    }

    return { init: init };
})();
