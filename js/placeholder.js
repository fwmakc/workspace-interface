App.placeholder = (function() {
    function getGreeting(periods) {
        var hour = new Date().getHours();
        for (var i = 0; i < periods.length; i++) {
            var p = periods[i];
            if (p.from <= p.to) {
                if (hour >= p.from && hour < p.to) return p.greeting;
            } else {
                if (hour >= p.from || hour < p.to) return p.greeting;
            }
        }
        return periods[0].greeting;
    }

    function getFriendlyPlaceholder(config) {
        var greeting = getGreeting(config.periods);
        var prompts = config.prompts.map(function(p) {
            return p.replace('{greeting}', greeting);
        });

        var lastIndex = parseInt(localStorage.getItem('cbui_lastPlaceholderIndex'), 10);
        var newIndex;
        if (prompts.length > 1) {
            do {
                newIndex = Math.floor(Math.random() * prompts.length);
            } while (newIndex === lastIndex);
        } else {
            newIndex = 0;
        }

        localStorage.setItem('cbui_lastPlaceholderIndex', newIndex);
        return prompts[newIndex];
    }

    function init() {
        var input = App.input;
        App.currentPlaceholder = getFriendlyPlaceholder(GREETINGS_CONFIG);
        input.placeholder = App.currentPlaceholder;

        input.addEventListener('focus', function() { input.placeholder = ''; });
        input.addEventListener('blur', function() {
            if (input.value.trim() === '') input.placeholder = App.currentPlaceholder;
        });
    }

    return { init: init };
})();
