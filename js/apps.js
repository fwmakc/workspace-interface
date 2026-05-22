App.appsMenu = (function() {
    function init() {
        var cfg = APPS_CONFIG;
        var menu = document.getElementById('appsMenu');
        var icon = document.getElementById('appsIcon');
        var columns = cfg.columns || 4;

        menu.style.gridTemplateColumns = 'repeat(' + columns + ', 1fr)';
        menu.style.background = cfg.background || 'rgba(32,33,36,0.95)';

        var closeBtn = document.createElement('button');
        closeBtn.className = 'apps-menu-close';
        closeBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
        closeBtn.addEventListener('click', function() {
            menu.classList.remove('open');
        });
        menu.appendChild(closeBtn);

        cfg.apps.forEach(function(app) {
            var item = document.createElement('div');
            item.className = 'apps-menu-item';
            item.innerHTML = app.icon + '<span>' + app.name + '</span>';
            item.addEventListener('click', function() {
                console.log('Открыто приложение:', app.id);
                menu.classList.remove('open');
            });
            menu.appendChild(item);
        });

        icon.addEventListener('click', function() {
            menu.classList.toggle('open');
        });
    }

    return { init: init };
})();
