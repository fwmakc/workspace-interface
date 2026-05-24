App.commands = (function() {
    function evaluateCalc(expr) {
        expr = expr.replace(/,/g, '.').trim();
        expr = expr.replace(/(\d+(\.\d+)?)%/g, '($1/100)');
        try {
            var result = new Function('return (' + expr + ')')();
            return String(result);
        } catch (e) {
            return 'Ошибка вычисления';
        }
    }

    function processTerminal(command) {
        var cmd = command.trim();
        if (cmd.charAt(0) === '$') {
            cmd = cmd.substring(1).trim();
        }
        var lines = cmd.split('\n');
        var merged = [];
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            while (line.charAt(line.length - 1) === '\\' && i + 1 < lines.length) {
                line = line.slice(0, -1).trim() + ' ' + lines[i + 1].trim();
                i++;
            }
            merged.push(line);
        }
        return merged.join('\n');
    }

    function execute(command, mode) {
        if (mode === 'calc') {
            var result = evaluateCalc(command);
            App.chat.addMessage(result, 'ai');
            return;
        }
        if (mode === 'terminal' || command.trim().charAt(0) === '$') {
            var processed = processTerminal(command);
            App.chat.addMessage(processed, 'ai');
            return;
        }
        console.log('Отправлена команда:', command);
    }

    return { execute: execute, evaluateCalc: evaluateCalc, processTerminal: processTerminal };
})();
