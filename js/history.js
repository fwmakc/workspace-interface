App.historyManager = (function() {
    function save(command) {
        command = command.trim();
        if (!command) return;
        if (App.history.length > 0 && App.history[App.history.length - 1] === command) return;
        App.history.push(command);
        if (App.history.length > App.MAX_HISTORY) App.history.shift();
        localStorage.setItem('cbui_cmdHistory', JSON.stringify(App.history));
    }

    return { save: save };
})();
