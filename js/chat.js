App.chat = (function() {
    var container = null;
    var isActive = false;

    function init() {
        container = document.getElementById('chatContainer');
        var spacer = document.createElement('div');
        spacer.className = 'chat-spacer';
        container.appendChild(spacer);
    }

    function activate() {
        if (isActive) return;
        isActive = true;
        document.body.classList.add('chat-active');
    }

    function addMessage(text, sender) {
        if (!container) return;
        var msg = document.createElement('div');
        msg.className = 'chat-message ' + sender;
        msg.textContent = text;
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
    }

    function clear() {
        if (!container) return;
        container.innerHTML = '';
        var spacer = document.createElement('div');
        spacer.className = 'chat-spacer';
        container.appendChild(spacer);
    }

    return { init: init, activate: activate, addMessage: addMessage, clear: clear };
})();
