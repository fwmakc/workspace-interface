App.dock = (function() {
    var container = null;
    var contextMenu = null;
    var pinned = [];

    function load() {
        try {
            pinned = JSON.parse(localStorage.getItem('dockPinned')) || [];
        } catch (e) {
            pinned = [];
        }
    }

    function save() {
        localStorage.setItem('dockPinned', JSON.stringify(pinned));
    }

    function findApp(appId) {
        var apps = APPS_CONFIG.apps;
        for (var i = 0; i < apps.length; i++) {
            if (apps[i].id === appId) return apps[i];
        }
        return null;
    }

    function hideMenu() {
        if (contextMenu) contextMenu.style.display = 'none';
    }

    function showMenu(x, y, items) {
        if (!contextMenu) return;
        contextMenu.innerHTML = '';
        items.forEach(function(item) {
            var btn = document.createElement('button');
            btn.className = 'context-menu-item';
            btn.textContent = item.label;
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                item.action();
                hideMenu();
            });
            contextMenu.appendChild(btn);
        });
        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
        contextMenu.style.display = 'block';
    }

    function render() {
        container.innerHTML = '';
        pinned.forEach(function(appId) {
            var app = findApp(appId);
            if (!app) return;

            var item = document.createElement('div');
            item.className = 'dock-item';
            item.title = app.name;
            item.setAttribute('draggable', 'true');
            item.innerHTML = app.icon + '<span>' + app.name + '</span>';

            item.addEventListener('click', function() {
                console.log('Dock запуск:', app.id);
            });

            item.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                showMenu(e.clientX, e.clientY, [
                    { label: 'Убрать из дока', action: function() { unpin(appId); } }
                ]);
            });

            item.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('text/plain', appId);
                e.dataTransfer.effectAllowed = 'move';
            });

            var longPressTimer;
            var startX, startY;
            item.addEventListener('touchstart', function(e) {
                if (e.touches.length !== 1) return;
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                longPressTimer = setTimeout(function() {
                    showMenu(startX, startY, [
                        { label: 'Убрать из дока', action: function() { unpin(appId); } }
                    ]);
                }, 600);
            });
            item.addEventListener('touchend', function() {
                clearTimeout(longPressTimer);
            });
            item.addEventListener('touchmove', function(e) {
                if (e.touches.length !== 1) {
                    clearTimeout(longPressTimer);
                    return;
                }
                var dx = Math.abs(e.touches[0].clientX - startX);
                var dy = Math.abs(e.touches[0].clientY - startY);
                if (dx > 10 || dy > 10) {
                    clearTimeout(longPressTimer);
                }
            });

            container.appendChild(item);
        });
    }

    function pin(appId) {
        if (pinned.indexOf(appId) !== -1) return;
        pinned.push(appId);
        save();
        render();
    }

    function unpin(appId) {
        var idx = pinned.indexOf(appId);
        if (idx === -1) return;
        pinned.splice(idx, 1);
        save();
        render();
    }

    function init() {
        container = document.getElementById('dockBar');

        contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        document.body.appendChild(contextMenu);

        document.addEventListener('click', function(e) {
            if (contextMenu && !contextMenu.contains(e.target)) hideMenu();
        });

        container.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });
        container.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var appId = e.dataTransfer.getData('text/plain');
            if (!appId) return;
            var oldIdx = pinned.indexOf(appId);
            if (oldIdx === -1) {
                pin(appId);
            } else {
                var items = container.querySelectorAll('.dock-item');
                var newIdx = items.length;
                for (var i = 0; i < items.length; i++) {
                    var rect = items[i].getBoundingClientRect();
                    if (e.clientX < rect.left + rect.width / 2) {
                        newIdx = i;
                        break;
                    }
                }
                if (oldIdx < newIdx) newIdx--;
                pinned.splice(oldIdx, 1);
                pinned.splice(newIdx, 0, appId);
                save();
                render();
            }
        });

        document.body.addEventListener('dragover', function(e) {
            e.preventDefault();
        });
        document.body.addEventListener('drop', function(e) {
            e.preventDefault();
            var appId = e.dataTransfer.getData('text/plain');
            if (!appId) return;
            if (pinned.indexOf(appId) !== -1) {
                unpin(appId);
            } else {
                pin(appId);
            }
        });

        load();
        render();
    }

    return { init: init, pin: pin, unpin: unpin, showMenu: showMenu, hideMenu: hideMenu };
})();
