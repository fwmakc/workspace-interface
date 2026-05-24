App.chat = (function() {
    var container = null;
    var isActive = false;
    var focusedIndex = -1;
    var anchorIndex = -1;
    var pageSize = 5;

    function getMessages() {
        if (!container) return [];
        return container.querySelectorAll('.chat-message');
    }

    function updateSelection() {
        var messages = getMessages();
        for (var i = 0; i < messages.length; i++) {
            messages[i].classList.remove('selected');
        }
        if (anchorIndex === -1 || focusedIndex === -1) return;
        var start = Math.min(anchorIndex, focusedIndex);
        var end = Math.max(anchorIndex, focusedIndex);
        for (var j = start; j <= end; j++) {
            if (messages[j]) messages[j].classList.add('selected');
        }
        if (messages[focusedIndex]) {
            messages[focusedIndex].scrollIntoView({ block: 'nearest' });
        }
    }

    function navigate(delta, extend) {
        var messages = getMessages();
        if (messages.length === 0) return;
        if (focusedIndex === -1) {
            focusedIndex = delta < 0 ? messages.length - 1 : 0;
        } else {
            focusedIndex += delta;
        }
        if (focusedIndex < 0) focusedIndex = 0;
        if (focusedIndex >= messages.length) focusedIndex = messages.length - 1;
        if (!extend) anchorIndex = focusedIndex;
        updateSelection();
    }

    function jump(to, extend) {
        var messages = getMessages();
        if (messages.length === 0) return;
        focusedIndex = to;
        if (focusedIndex < 0) focusedIndex = 0;
        if (focusedIndex >= messages.length) focusedIndex = messages.length - 1;
        if (!extend) anchorIndex = focusedIndex;
        updateSelection();
    }

    function init() {
        container = document.getElementById('chatContainer');
        var spacer = document.createElement('div');
        spacer.className = 'chat-spacer';
        container.appendChild(spacer);

        document.addEventListener('click', function(e) {
            if (!e.target.closest('.chat-message')) {
                clearSelection();
            }
        });

        document.addEventListener('copy', function(e) {
            var selected = container.querySelectorAll('.chat-message.selected');
            if (selected.length === 0) return;
            var texts = [];
            for (var i = 0; i < selected.length; i++) {
                var textSpan = selected[i].querySelector('.msg-text');
                if (textSpan) texts.push(textSpan.textContent);
            }
            e.clipboardData.setData('text/plain', texts.join('\n\n'));
            e.preventDefault();
        });

        document.addEventListener('keydown', function(e) {
            if (!document.body.classList.contains('chat-active')) return;
            if (!e.altKey) return;
            var messages = getMessages();
            if (messages.length === 0) return;

            var extend = e.shiftKey;
            var handled = true;

            if (e.key === 'ArrowUp') {
                navigate(-1, extend);
            } else if (e.key === 'ArrowDown') {
                navigate(1, extend);
            } else if (e.key === 'PageUp') {
                navigate(-pageSize, extend);
            } else if (e.key === 'PageDown') {
                navigate(pageSize, extend);
            } else if (e.key === 'Home') {
                jump(0, extend);
            } else if (e.key === 'End') {
                jump(messages.length - 1, extend);
            } else {
                handled = false;
            }

            if (handled) {
                e.preventDefault();
            }
        });
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

        msg.addEventListener('click', function(e) {
            if (e.target.closest('.msg-actions')) return;
            var messages = getMessages();
            for (var i = 0; i < messages.length; i++) {
                if (messages[i] === msg) {
                    focusedIndex = i;
                    anchorIndex = i;
                    break;
                }
            }
            msg.classList.toggle('selected');
        });

        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
    }

    function clearSelection() {
        if (!container) return;
        var selected = container.querySelectorAll('.chat-message.selected');
        for (var i = 0; i < selected.length; i++) {
            selected[i].classList.remove('selected');
        }
        focusedIndex = -1;
        anchorIndex = -1;
    }

    function clear() {
        if (!container) return;
        container.innerHTML = '';
        var spacer = document.createElement('div');
        spacer.className = 'chat-spacer';
        container.appendChild(spacer);
        focusedIndex = -1;
        anchorIndex = -1;
    }

    return { init: init, activate: activate, addMessage: addMessage, clear: clear, clearSelection: clearSelection };
})();
