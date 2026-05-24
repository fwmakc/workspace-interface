App.appsMenu = (function() {
    var menu, icon, grid, searchInput, bottomBar, columns;
    var focusedItem = null;
    var cachedVisibleItems = [];
    var navPos = null;
    var searchDebounceTimer = null;

    function getAppsOrder() {
        try {
            return JSON.parse(localStorage.getItem('cbui_appsOrder')) || [];
        } catch (e) {
            return [];
        }
    }

    function setAppsOrder(order) {
        localStorage.setItem('cbui_appsOrder', JSON.stringify(order));
    }

    function sortApps(apps) {
        var order = getAppsOrder();
        if (order.length === 0) return apps;
        var map = {};
        for (var i = 0; i < apps.length; i++) {
            map[apps[i].id] = apps[i];
        }
        var sorted = [];
        for (var j = 0; j < order.length; j++) {
            if (map[order[j]]) {
                sorted.push(map[order[j]]);
                delete map[order[j]];
            }
        }
        for (var k = 0; k < apps.length; k++) {
            if (map[apps[k].id]) sorted.push(apps[k]);
        }
        return sorted;
    }

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
        if (searchInput) {
            rows.push([searchInput]);
        }
        var visible = cachedVisibleItems;
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
        navPos = null;
    }

    function setFocus(item, r, c) {
        clearFocus();
        if (item) {
            item.classList.add('focused');
            focusedItem = item;
            item.scrollIntoView({ block: 'nearest' });
            if (typeof r === 'number' && typeof c === 'number') {
                navPos = { row: r, col: c };
            }
        }
    }

    function resetFilter() {
        searchInput.value = '';
        searchInput.blur();
        var allItems = grid.querySelectorAll('.apps-menu-item');
        cachedVisibleItems = [];
        for (var i = 0; i < allItems.length; i++) {
            allItems[i].style.display = '';
            cachedVisibleItems.push(allItems[i]);
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

        menu.style.background = cfg.background || '';

        var topBar = document.createElement('div');
        topBar.className = 'apps-menu-top-bar';

        searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'apps-menu-search';
        searchInput.placeholder = 'Поиск приложений...';
        topBar.appendChild(searchInput);



        menu.appendChild(topBar);

        var gridContainer = document.createElement('div');
        gridContainer.className = 'apps-menu-grid';
        gridContainer.style.gridTemplateColumns = 'repeat(' + columns + ', 1fr)';
        menu.appendChild(gridContainer);
        grid = gridContainer;

        var sortedApps = sortApps(cfg.apps);
        sortedApps.forEach(function(app) {
            var item = document.createElement('div');
            item.className = 'apps-menu-item';
            item.setAttribute('data-id', app.id);
            item.setAttribute('role', 'button');
            item.setAttribute('tabindex', '0');
            item.setAttribute('aria-label', app.name);
            item.innerHTML = app.icon + '<span>' + app.name + '</span>';
            item.setAttribute('data-name', app.name || '');
            item.setAttribute('data-description', app.description || '');
            item.setAttribute('data-tags', (app.tags || []).join(' '));
            item.setAttribute('draggable', 'true');
            item.addEventListener('click', function() {
                console.log('Открыто приложение:', app.id);
                closeMenu();
            });
            item.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('text/plain', app.id);
                e.dataTransfer.effectAllowed = 'copy';
                item.classList.add('dragging');
            });
            item.addEventListener('dragend', function() {
                item.classList.remove('dragging');
            });

            item.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                App.dock.showMenu(e.clientX, e.clientY, [
                    { label: 'Добавить в док', action: function() { App.dock.pin(app.id); } }
                ]);
            });

            App.utils.makeLongPress(item, function(x, y) {
                App.dock.showMenu(x, y, [
                    { label: 'Добавить в док', action: function() { App.dock.pin(app.id); } }
                ]);
            });

            grid.appendChild(item);
            cachedVisibleItems.push(item);
        });

        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchDebounceTimer);
            searchDebounceTimer = setTimeout(function() {
                var query = e.target.value.toLowerCase().trim();
                var allItems = grid.querySelectorAll('.apps-menu-item');
                cachedVisibleItems = [];
                for (var i = 0; i < allItems.length; i++) {
                    var item = allItems[i];
                    if (!query) {
                        item.style.display = '';
                        cachedVisibleItems.push(item);
                        continue;
                    }
                    var name = (item.getAttribute('data-name') || '').toLowerCase();
                    var description = (item.getAttribute('data-description') || '').toLowerCase();
                    var tags = (item.getAttribute('data-tags') || '').toLowerCase();
                    var match = name.indexOf(query) !== -1 ||
                                description.indexOf(query) !== -1 ||
                                tags.indexOf(query) !== -1;
                    item.style.display = match ? '' : 'none';
                    if (match) cachedVisibleItems.push(item);
                }
                var rows = getRows();
                var pos = focusedItem ? findPosition(rows, focusedItem) : null;
                if (!pos) {
                    setFocus(rows.length > 0 ? rows[0][0] : null, 0, 0);
                } else {
                    navPos = pos;
                }
            }, 50);
        });

        grid.addEventListener('dragenter', function(e) {
            var targetItem = e.target.closest('.apps-menu-item');
            if (!targetItem) return;
            var draggingItem = grid.querySelector('.apps-menu-item.dragging');
            if (!draggingItem || targetItem === draggingItem) return;
            grid.insertBefore(draggingItem, targetItem);
        });

        grid.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var order = [];
            var items = grid.querySelectorAll('.apps-menu-item');
            for (var i = 0; i < items.length; i++) {
                order.push(items[i].getAttribute('data-id'));
            }
            setAppsOrder(order);
        });

        bottomBar = document.createElement('div');
        bottomBar.className = 'apps-menu-bottom-bar';

        var actions = cfg.actions || [];

        actions.forEach(function(action) {
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

        document.addEventListener('dragover', function(e) {
            if (!menu.classList.contains('open')) return;
            var rect = menu.getBoundingClientRect();
            if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
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
                    if (rows.length > 1 && rows[1].length > 0) {
                        rows[1][0].click();
                        event.preventDefault();
                    }
                    return;
                }
                if (event.key === 'ArrowDown') {
                    searchInput.blur();
                    var rows = getRows();
                    setFocus(rows.length > 1 ? rows[1][0] : null, 1, 0);
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

            var pos = navPos || (focusedItem ? findPosition(rows, focusedItem) : null);
            if (!pos) {
                if (event.key === 'ArrowUp') {
                    var lastRow = rows[rows.length - 1];
                    setFocus(lastRow.length > 0 ? lastRow[lastRow.length - 1] : null, rows.length - 1, lastRow.length - 1);
                } else {
                    setFocus(rows.length > 1 ? rows[1][0] : null, 1, 0);
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

            setFocus(rows[nextR][nextC], nextR, nextC);
        });
    }

    return { init: init, close: closeMenu };
})();
