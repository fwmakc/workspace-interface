var App = {
    input: document.getElementById('cmdInput'),
    MAX_HISTORY: 50,
    history: [],
    historyIndex: -1,
    currentDraft: '',
    currentPlaceholder: ''
};

try {
    App.history = JSON.parse(localStorage.getItem('cmdHistory')) || [];
} catch (e) {
    App.history = [];
}


