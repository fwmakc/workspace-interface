App.keyboard = (function() {
    var modifierProps = {
        ctrl: 'ctrlKey',
        shift: 'shiftKey',
        alt: 'altKey',
        meta: 'metaKey'
    };

    function matchHotkey(event, binding) {
        if (event.code !== binding.key) return false;
        var mods = binding.modifiers || [];
        for (var m in modifierProps) {
            var required = mods.indexOf(m) !== -1;
            var active = event[modifierProps[m]];
            if (required !== active) return false;
        }
        return true;
    }

    function hasModifier(event) {
        return event.ctrlKey || event.metaKey || event.altKey || event.shiftKey;
    }

    function init() {
        var input = App.input;
        var appsMenu = document.getElementById('appsMenu');

        document.addEventListener('keydown', function(event) {
            var appsOpen = appsMenu.classList.contains('open');

            if (APPS_CONFIG.hotkey && matchHotkey(event, APPS_CONFIG.hotkey)) {
                appsMenu.classList.toggle('open');
                event.preventDefault();
                return;
            }

            if (MODES_CONFIG.cycleHotkey && matchHotkey(event, MODES_CONFIG.cycleHotkey)) {
                App.modes.cycle();
                App.input.focus();
                event.preventDefault();
                return;
            }

            if (appsOpen) {
                if (event.key === 'Escape') {
                    var activeElem = document.activeElement;
                    if (activeElem && (activeElem.tagName === 'INPUT' || activeElem.tagName === 'TEXTAREA' || activeElem.isContentEditable)) {
                        activeElem.blur();
                    }
                    if (App.appsMenu.close) App.appsMenu.close();
                    event.preventDefault();
                    return;
                }
                return;
            }

            if (event.key === 'Escape') {
                input.value = '';
                App.attach.clear();
                App.historyIndex = -1;
                App.currentDraft = '';
                App.modes.resetAuto();
                input.blur();
                event.preventDefault();
                return;
            }

            var isFocused = document.activeElement === input;

            if (event.key === 'Enter' && isFocused && !event.shiftKey) {
                var command = input.value;
                var hasFiles = App.attach.getFiles().length > 0;
                if (command.trim() !== '' || hasFiles) {
                    App.historyManager.save(command);
                    if (command.trim() !== '') {
                        App.chat.activate();
                        App.chat.addMessage(command, 'user');
                        var detectedMode = App.modes.getActive();
                        if (detectedMode === 'auto') {
                            detectedMode = App.modes.detect(command);
                        }
                        App.commands.execute(command, detectedMode);
                    }
                    if (hasFiles) {
                        var names = App.attach.getFiles().map(function(f) { return f.name; });
                        console.log('Прикреплены файлы:', names.join(', '));
                    }
                    input.value = '';
                    App.attach.clear();
                    App.historyIndex = -1;
                    App.currentDraft = '';
                    App.modes.resetAuto();
                    if (!document.body.classList.contains('chat-active')) {
                        input.blur();
                    }
                }
                event.preventDefault();
                return;
            }

            if (event.key === 'ArrowUp' && isFocused && event.ctrlKey) {
                if (App.history.length === 0) return;
                if (App.historyIndex === -1) {
                    App.currentDraft = input.value;
                    App.historyIndex = App.history.length - 1;
                } else if (App.historyIndex > 0) {
                    App.historyIndex--;
                }
                input.value = App.history[App.historyIndex];
                setTimeout(function() { input.setSelectionRange(input.value.length, input.value.length); }, 0);
                event.preventDefault();
                return;
            }

            if (event.key === 'ArrowDown' && isFocused && event.ctrlKey) {
                if (App.historyIndex === -1) return;
                if (App.historyIndex < App.history.length - 1) {
                    App.historyIndex++;
                    input.value = App.history[App.historyIndex];
                } else {
                    App.historyIndex = -1;
                    input.value = '';
                }
                setTimeout(function() { input.setSelectionRange(input.value.length, input.value.length); }, 0);
                event.preventDefault();
                return;
            }

            var activeElem = document.activeElement;
            if (activeElem && (activeElem.tagName === 'INPUT' || activeElem.tagName === 'TEXTAREA' || activeElem.isContentEditable)) return;

            if ((event.ctrlKey && event.code === 'KeyV') || (event.shiftKey && event.key === 'Insert')) {
                input.focus();
                return;
            }

            if (hasModifier(event)) return;
            if (event.key.length !== 1 && event.key !== 'Backspace') return;

            input.focus();
            var length = input.value.length;
            input.setSelectionRange(length, length);
        });
    }

    return { init: init };
})();
