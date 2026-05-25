App.attach = (function() {
    var files = [];

    function render() {
        var list = document.getElementById('fileList');
        list.innerHTML = '';

        files.forEach(function(file, index) {
            var chip = document.createElement('div');
            chip.className = 'file-chip';

            var name = document.createElement('span');
            name.className = 'file-chip-name';
            name.textContent = file.name;
            name.title = file.name;

            var remove = document.createElement('button');
            remove.className = 'file-chip-remove';
            remove.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
            remove.addEventListener('click', function() {
                files.splice(index, 1);
                render();
            });

            chip.appendChild(name);
            chip.appendChild(remove);
            list.appendChild(chip);
        });
    }

    function getFiles() {
        return files;
    }

    function clear() {
        files = [];
        render();
    }

    function traverseDirectory(entry, onFile, onDone) {
        if (entry.isFile) {
            entry.file(function(file) {
                onFile(file);
                if (onDone) onDone();
            });
        } else if (entry.isDirectory) {
            var reader = entry.createReader();
            var allEntries = [];

            function readBatch() {
                reader.readEntries(function(entries) {
                    if (entries.length === 0) {
                        var pending = allEntries.length;
                        if (pending === 0) {
                            if (onDone) onDone();
                            return;
                        }
                        allEntries.forEach(function(e) {
                            traverseDirectory(e, onFile, function() {
                                pending--;
                                if (pending <= 0 && onDone) onDone();
                            });
                        });
                    } else {
                        allEntries = allEntries.concat(entries);
                        readBatch();
                    }
                });
            }

            readBatch();
        } else {
            if (onDone) onDone();
        }
    }

    function init() {
        var btn = document.getElementById('attachBtn');
        var fileInput = document.getElementById('fileInput');
        var bar = document.querySelector('.command-bar');

        btn.addEventListener('click', function(e) {
            e.preventDefault();
            fileInput.click();
        });

        fileInput.addEventListener('change', function() {
            for (var i = 0; i < fileInput.files.length; i++) {
                files.push(fileInput.files[i]);
            }
            render();
            fileInput.value = '';
        });

        bar.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            bar.classList.add('drag-over');
        });
        bar.addEventListener('dragleave', function(e) {
            bar.classList.remove('drag-over');
        });
        bar.addEventListener('drop', function(e) {
            e.preventDefault();
            bar.classList.remove('drag-over');
            var items = e.dataTransfer.items;
            var pending = items.length;

            function checkDone() {
                pending--;
                if (pending <= 0) render();
            }

            for (var i = 0; i < items.length; i++) {
                var entry = items[i].webkitGetAsEntry ? items[i].webkitGetAsEntry() : null;
                if (entry) {
                    traverseDirectory(entry, function(file) {
                        files.push(file);
                    }, checkDone);
                } else {
                    var droppedFile = items[i].getAsFile();
                    if (droppedFile) files.push(droppedFile);
                    checkDone();
                }
            }
        });
    }

    return { init: init, getFiles: getFiles, clear: clear };
})();
