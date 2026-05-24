App.modes = (function() {
    var activeMode = null;
    var activeBtn = null;
    var picker = null;
    var modes = [];
    var modeMap = {};
    var activeIndex = -1;

    function switchTo(modeId) {
        var cfg = modeMap[modeId];
        if (!cfg) return;

        activeMode = modeId;
        activeIndex = modes.indexOf(cfg);
        activeBtn.title = cfg.name;
        activeBtn.innerHTML = cfg.icon;
        picker.classList.remove('open');

        var input = App.input;
        if (input.value.trim() === '') {
            input.placeholder = cfg.placeholder || '';
            App.currentPlaceholder = cfg.placeholder || '';
        }

        console.log('Режим:', cfg.name);
    }

    function cycle() {
        var next = (activeIndex + 1) % modes.length;
        switchTo(modes[next].id);
    }

    function getActive() {
        return activeMode;
    }

    function init() {
        modes = MODES_CONFIG.modes;
        for (var i = 0; i < modes.length; i++) {
            modeMap[modes[i].id] = modes[i];
        }
        var container = document.getElementById('barModes');

        picker = document.createElement('div');
        picker.className = 'mode-picker';
        picker.id = 'modePicker';

        activeBtn = document.createElement('button');
        activeBtn.className = 'icon-btn';
        activeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            picker.classList.toggle('open');
        });

        modes.forEach(function(mode) {
            var item = document.createElement('button');
            item.className = 'mode-picker-item';
            item.title = mode.name;
            item.innerHTML = mode.icon + '<span>' + mode.name + '</span>';

            if (mode.hotkey) {
                var hint = document.createElement('span');
                hint.className = 'mode-picker-hint';
                var label = mode.hotkey.modifiers ? mode.hotkey.modifiers.join('+') + '+' : '';
                label += mode.hotkey.key.replace('Digit', '');
                hint.textContent = label;
                item.appendChild(hint);
            }

            item.addEventListener('click', function(e) {
                e.preventDefault();
                switchTo(mode.id);
                App.input.focus();
            });

            picker.appendChild(item);
        });

        container.appendChild(picker);
        container.appendChild(activeBtn);

        App.utils.createOverlay(activeBtn, picker);

        switchTo(modes[0].id);
    }

    return { init: init, switchTo: switchTo, cycle: cycle, getActive: getActive };
})();
