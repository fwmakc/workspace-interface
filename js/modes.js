App.modes = (function() {
    var activeMode = null;
    var activeBtn = null;
    var picker = null;
    var modes = [];
    var modeMap = {};
    var activeIndex = -1;

    var terminalCmds = ['ls','cd','pwd','mkdir','rm','cp','mv','cat','echo','grep','find','chmod','chown','touch','nano','vim','git','npm','node','python','pip','docker','kubectl','curl','wget','ssh','scp','tar','zip','unzip','apt','yum','brew','make','gcc','go','rustc','cargo'];

    function detect(text) {
        text = text.trim();
        if (!text) return 'auto';

        if (text.charAt(0) === '$') return 'terminal';

        if (/^(https?:\/\/|www\.)/i.test(text)) return 'url';
        if (/^[a-z0-9\-]+(\.[a-z0-9\-]+)+(\:[0-9]+)?(\/[^\s]*)?$/i.test(text) && !/\s/.test(text)) return 'url';

        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(text)) return 'contacts';
        if (/^@/.test(text)) return 'contacts';

        var firstWord = text.split(/\s+/)[0].toLowerCase();
        if (terminalCmds.indexOf(firstWord) !== -1) return 'terminal';

        if (/^[\d\s\.\,\+\-\*\/\(\)\%]+$/.test(text) && /[\+\-\*\/\%]/.test(text)) return 'calc';

        // Заметки: списки и чекбоксы
        if (/^[-+*]\s+[a-zA-Zа-яА-ЯёЁ]/.test(text)) return 'notes';
        if (/^\[[^\]]*\]\s+[a-zA-Zа-яА-ЯёЁ]/.test(text)) return 'notes';
        if (/^[☑✅☐☒]\s+[a-zA-Zа-яА-ЯёЁ]/.test(text)) return 'notes';

        return 'project';
    }

    function switchTo(modeId) {
        var cfg = modeMap[modeId];
        if (!cfg) return;

        activeMode = modeId;
        activeIndex = modes.indexOf(cfg);
        activeBtn.title = cfg.name;
        activeBtn.innerHTML = cfg.icon;
        picker.classList.remove('open');

        var input = App.input;
        if (modeId === 'terminal') {
            input.classList.add('terminal-mode');
        } else {
            input.classList.remove('terminal-mode');
        }
        if (input.value.trim() === '') {
            input.placeholder = cfg.placeholder || App.currentPlaceholder || '';
        }

        console.log('Режим:', cfg.name);
    }

    function autoSwitch(text) {
        if (activeMode !== 'auto') return;
        var detected = detect(text);
        var cfg = modeMap[detected] || modeMap['auto'];
        activeBtn.title = cfg.name;
        activeBtn.innerHTML = cfg.icon;
        var input = App.input;
        if (detected === 'terminal') {
            input.classList.add('terminal-mode');
        } else {
            input.classList.remove('terminal-mode');
        }
        input.placeholder = cfg.placeholder || App.currentPlaceholder || '';
    }

    function resetAuto() {
        if (activeMode !== 'auto') return;
        autoSwitch('');
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

        App.input.addEventListener('input', function() {
            autoSwitch(App.input.value);
        });

        switchTo(modes[0].id);
    }

    return { init: init, switchTo: switchTo, cycle: cycle, getActive: getActive, detect: detect, autoSwitch: autoSwitch, resetAuto: resetAuto };
})();
