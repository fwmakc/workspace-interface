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

    function addMessage(text, sender, extraClass) {
        if (!container) return;
        var msg = document.createElement('div');
        msg.className = 'chat-message ' + sender + (extraClass ? ' ' + extraClass : '');

        var textSpan = document.createElement('span');
        textSpan.className = 'msg-text';
        textSpan.textContent = text;
        msg.appendChild(textSpan);

        var actions = document.createElement('div');
        actions.className = 'msg-actions';

        var copyBtn = document.createElement('button');
        copyBtn.className = 'msg-action-btn';
        copyBtn.title = 'Копировать';
        copyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/></svg>';
        copyBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            navigator.clipboard.writeText(text);
        });

        var delBtn = document.createElement('button');
        delBtn.className = 'msg-action-btn';
        delBtn.title = 'Удалить';
        delBtn.innerHTML = '&times;';
        delBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            msg.remove();
        });

        actions.appendChild(copyBtn);
        actions.appendChild(delBtn);
        msg.appendChild(actions);

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
