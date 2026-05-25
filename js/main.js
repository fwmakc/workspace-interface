var App = {
    input: document.getElementById('cmdInput'),
    MAX_HISTORY: 50,
    history: [],
    historyIndex: -1,
    currentDraft: '',
    currentPlaceholder: ''
};

try {
    App.history = JSON.parse(localStorage.getItem('cbui_cmdHistory')) || [];
} catch (e) {
    App.history = [];
}

App.setMdTheme = function(themeName) {
    var themes = ['theme-light', 'theme-dracula'];
    for (var i = 0; i < themes.length; i++) {
        document.body.classList.remove(themes[i]);
    }
    if (themeName && themeName !== 'dark') {
        document.body.classList.add('theme-' + themeName);
    }
    localStorage.setItem('cbui_mdTheme', themeName || 'dark');
};

App.getMdTheme = function() {
    try {
        return localStorage.getItem('cbui_mdTheme') || 'dark';
    } catch (e) {
        return 'dark';
    }
};

App.setMdTheme(App.getMdTheme());


