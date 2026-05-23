App.appsMenu = (function() {
    var menu, icon, grid, searchInput, closeBtn, bottomBar, columns;
    var focusedItem = null;

    function getVisibleItems() {
        var all = grid.querySelectorAll('.apps-menu-item');
        var visible = [];
        for (var i = 0; i < all.length; i++) {
            if (all[i].style.display !== 'none') visible.push(all[i]);
        }
        return visible;
    }

    function getRows() {
        var rows = [];
        if (searchInput && closeBtn) {
            rows.push([searchInput, closeBtn]);
        }
        var visible = getVisibleItems();
        for (var i = 0; i < visible.length; i += columns) {
            var row = [];
            for (var j = i; j < Math.min(i + columns, visible.length); j++) {
                row.push(visible[j]);
            }
            rows.push(row);
        }
        var bottomItems = bottomBar.querySelectorAll('.apps-menu-bottom-btn');
        if (bottomItems.length > 0) {
            rows.push(Array.prototype.slice.call(bottomItems));
        }
        return rows;
    }

    function findPosition(rows, item) {
        for (var r = 0; r < rows.length; r++) {
            for (var c = 0; c < rows[r].length; c++) {
                if (rows[r][c] === item) return { row: r, col: c };
            }
        }
        return null;
    }

    function clearFocus() {
        if (focusedItem) {
            focusedItem.classList.remove('focused');
            focusedItem = null;
        }
    }

    function setFocus(item) {
        clearFocus();
        if (item) {
            item.classList.add('focused');
            focusedItem = item;
            item.scrollIntoView({ block: 'nearest' });
        }
    }

    function resetFilter() {
        searchInput.value = '';
        searchInput.blur();
        var allItems = grid.querySelectorAll('.apps-menu-item');
        for (var i = 0; i < allItems.length; i++) {
            allItems[i].style.display = '';
        }
    }

    function closeMenu() {
        clearFocus();
        if (searchInput) searchInput.blur();
        menu.classList.remove('open');
        resetFilter();
    }

    function init() {
        var cfg = APPS_CONFIG;
        menu = document.getElementById('appsMenu');
        icon = document.getElementById('appsIcon');
        columns = cfg.columns || 4;

        menu.style.background = cfg.background || 'rgba(32,33,36,0.95)';

        var topBar = document.createElement('div');
        topBar.className = 'apps-menu-top-bar';

        searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'apps-menu-search';
        searchInput.placeholder = 'Поиск приложений...';
        topBar.appendChild(searchInput);

        closeBtn = document.createElement('button');
        closeBtn.className = 'apps-menu-close';
        closeBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
        closeBtn.addEventListener('click', function() {
            resetFilter();
            clearFocus();
        });
        topBar.appendChild(closeBtn);

        menu.appendChild(topBar);

        var gridContainer = document.createElement('div');
        gridContainer.className = 'apps-menu-grid';
        gridContainer.style.gridTemplateColumns = 'repeat(' + columns + ', 1fr)';
        menu.appendChild(gridContainer);
        grid = gridContainer;

        cfg.apps.forEach(function(app) {
            var item = document.createElement('div');
            item.className = 'apps-menu-item';
            item.innerHTML = app.icon + '<span>' + app.name + '</span>';
            item.setAttribute('data-name', app.name || '');
            item.setAttribute('data-description', app.description || '');
            item.setAttribute('data-tags', (app.tags || []).join(' '));
            item.addEventListener('click', function() {
                console.log('Открыто приложение:', app.id);
                closeMenu();
            });
            grid.appendChild(item);
        });

        searchInput.addEventListener('input', function(e) {
            var query = e.target.value.toLowerCase().trim();
            var allItems = grid.querySelectorAll('.apps-menu-item');
            for (var i = 0; i < allItems.length; i++) {
                var item = allItems[i];
                if (!query) {
                    item.style.display = '';
                    continue;
                }
                var name = (item.getAttribute('data-name') || '').toLowerCase();
                var description = (item.getAttribute('data-description') || '').toLowerCase();
                var tags = (item.getAttribute('data-tags') || '').toLowerCase();
                var match = name.indexOf(query) !== -1 ||
                            description.indexOf(query) !== -1 ||
                            tags.indexOf(query) !== -1;
                item.style.display = match ? '' : 'none';
            }
            var rows = getRows();
            var pos = focusedItem ? findPosition(rows, focusedItem) : null;
            if (!pos) {
                setFocus(rows.length > 0 ? rows[0][0] : null);
            }
        });

        bottomBar = document.createElement('div');
        bottomBar.className = 'apps-menu-bottom-bar';

        var bottomActions = [
            {
                id: 'profile',
                title: 'Профиль',
                icon: '<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'
            },
            {
                id: 'settings',
                title: 'Настройки',
                icon: '<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"/></svg>'
            },
            {
                id: 'logout',
                title: 'Выход',
                icon: '<svg viewBox="0 0 24 24"><path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>'
            },
            {
                id: 'restart',
                title: 'Перезагрузка',
                icon: '<svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.76L13 11h7V4l-2.35 2.35z"/></svg>'
            },
            {
                id: 'shutdown',
                title: 'Выключение',
                icon: '<svg viewBox="0 0 24 24"><path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/></svg>'
            }
        ];

        bottomActions.forEach(function(action) {
            var btn = document.createElement('button');
            btn.className = 'apps-menu-bottom-btn';
            btn.title = action.title;
            btn.innerHTML = action.icon;
            btn.addEventListener('click', function() {
                console.log('Действие:', action.id);
                closeMenu();
            });
            bottomBar.appendChild(btn);
        });

        menu.appendChild(bottomBar);

        icon.addEventListener('click', function() {
            var wasOpen = menu.classList.contains('open');
            if (wasOpen) {
                closeMenu();
            } else {
                menu.classList.add('open');
                resetFilter();
                clearFocus();
            }
        });

        document.addEventListener('click', function(e) {
            if (menu.classList.contains('open') && !menu.contains(e.target) && !icon.contains(e.target)) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', function(event) {
            if (!menu.classList.contains('open')) return;

            var activeElem = document.activeElement;
            var isInputFocused = activeElem && activeElem.tagName === 'INPUT';

            if (isInputFocused) {
                if (event.key === 'Enter') {
                    var rows = getRows();
                    if (rows.length > 0 && rows[0].length > 0) {
                        rows[0][0].click();
                        event.preventDefault();
                    }
                    return;
                }
                if (event.key === 'ArrowDown') {
                    searchInput.blur();
                    var rows = getRows();
                    setFocus(rows.length > 0 ? rows[0][0] : null);
                    event.preventDefault();
                    return;
                }
                if (event.key === 'ArrowUp') {
                    searchInput.blur();
                    var rows = getRows();
                    if (rows.length > 0) {
                        var lastRow = rows[rows.length - 1];
                        setFocus(lastRow.length > 0 ? lastRow[lastRow.length - 1] : null);
                    }
                    event.preventDefault();
                    return;
                }
                return;
            }

            var isChar = event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey;
            if (isChar || event.key === 'Backspace') {
                searchInput.focus();
                if (event.key === 'Backspace') {
                    searchInput.value = searchInput.value.slice(0, -1);
                } else {
                    searchInput.value += event.key;
                }
                searchInput.dispatchEvent(new Event('input'));
                event.preventDefault();
                return;
            }

            if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Enter'].indexOf(event.key) === -1) {
                return;
            }

            event.preventDefault();

            var rows = getRows();
            if (rows.length === 0) return;

            var pos = findPosition(rows, focusedItem);
            if (!pos) {
                if (event.key === 'ArrowUp') {
                    var lastRow = rows[rows.length - 1];
                    setFocus(lastRow.length > 0 ? lastRow[lastRow.length - 1] : null);
                } else {
                    setFocus(rows[0][0]);
                }
                return;
            }

            var r = pos.row;
            var c = pos.col;
            var nextR = r;
            var nextC = c;

            if (event.key === 'Enter') {
                rows[r][c].click();
                return;
            }

            if (event.key === 'ArrowRight') {
                if (c + 1 < rows[r].length) {
                    nextC = c + 1;
                } else if (r + 1 < rows.length) {
                    nextR = r + 1;
                    nextC = 0;
                } else {
                    nextR = 0;
                    nextC = 0;
                }
            } else if (event.key === 'ArrowLeft') {
                if (c - 1 >= 0) {
                    nextC = c - 1;
                } else if (r - 1 >= 0) {
                    nextR = r - 1;
                    nextC = rows[nextR].length - 1;
                } else {
                    nextR = rows.length - 1;
                    nextC = rows[nextR].length - 1;
                }
            } else if (event.key === 'ArrowDown') {
                nextR = (r + 1) % rows.length;
                nextC = Math.min(c, rows[nextR].length - 1);
            } else if (event.key === 'ArrowUp') {
                nextR = (r - 1 + rows.length) % rows.length;
                if (nextR === 0) {
                    nextC = 0;
                } else {
                    nextC = Math.min(c, rows[nextR].length - 1);
                }
            }

            setFocus(rows[nextR][nextC]);
        });
    }

    return { init: init, close: closeMenu };
})();
