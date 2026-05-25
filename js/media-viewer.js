App.mediaViewer = (function() {
    var modal = null;
    var currentFiles = [];
    var currentIndex = 0;
    var isOpen = false;

    var imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    var videoExts = ['mp4', 'webm', 'ogg', 'mov'];
    var audioExts = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'];

    function getFileType(file) {
        if (file.type.indexOf('image/') === 0) return 'image';
        if (file.type.indexOf('video/') === 0) return 'video';
        if (file.type.indexOf('audio/') === 0) return 'audio';
        var ext = file.name.split('.').pop().toLowerCase();
        if (imageExts.indexOf(ext) !== -1) return 'image';
        if (videoExts.indexOf(ext) !== -1) return 'video';
        if (audioExts.indexOf(ext) !== -1) return 'audio';
        return 'file';
    }

    function createUrl(file) {
        return URL.createObjectURL(file);
    }

    function createPreview(file, files, index) {
        var type = getFileType(file);
        var url = createUrl(file);
        var container = document.createElement('div');
        container.className = 'media-preview media-preview-' + type;

        if (type === 'image') {
            var img = document.createElement('img');
            img.src = url;
            img.alt = file.name;
            img.draggable = false;
            img.addEventListener('click', function() { openModal(files, index); });
            container.appendChild(img);
        } else if (type === 'video') {
            var video = document.createElement('video');
            video.src = url;
            video.preload = 'metadata';
            video.draggable = false;
            video.addEventListener('click', function() { openModal(files, index); });
            container.appendChild(video);
        } else if (type === 'audio') {
            var audio = document.createElement('audio');
            audio.src = url;
            audio.controls = true;
            audio.title = file.name;
            container.appendChild(audio);
        } else {
            var span = document.createElement('span');
            span.className = 'media-file-name';
            span.textContent = file.name;
            container.appendChild(span);
        }

        return container;
    }

    function renderCurrent() {
        if (!modal || !currentFiles.length) return;
        var file = currentFiles[currentIndex];
        var type = getFileType(file);
        var url = createUrl(file);
        var modalContent = modal.querySelector('.media-modal-content');
        var counter = modal.querySelector('.media-modal-counter');
        modalContent.innerHTML = '';

        if (type === 'image') {
            var img = document.createElement('img');
            img.src = url;
            img.alt = file.name;
            modalContent.appendChild(img);
        } else if (type === 'video') {
            var video = document.createElement('video');
            video.src = url;
            video.controls = true;
            video.autoplay = true;
            modalContent.appendChild(video);
        } else if (type === 'audio') {
            var audio = document.createElement('audio');
            audio.src = url;
            audio.controls = true;
            audio.autoplay = true;
            modalContent.appendChild(audio);
        } else {
            var span = document.createElement('span');
            span.className = 'media-file-name';
            span.textContent = file.name;
            modalContent.appendChild(span);
        }

        counter.textContent = (currentIndex + 1) + ' / ' + currentFiles.length;

        var prevBtn = modal.querySelector('.media-modal-prev');
        var nextBtn = modal.querySelector('.media-modal-next');
        if (prevBtn) prevBtn.style.display = currentFiles.length > 1 ? '' : 'none';
        if (nextBtn) nextBtn.style.display = currentFiles.length > 1 ? '' : 'none';
    }

    function openModal(files, startIndex) {
        currentFiles = files || [];
        currentIndex = startIndex || 0;
        if (!currentFiles.length) return;

        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'media-modal';
            modal.innerHTML =
                '<div class="media-modal-backdrop"></div>' +
                '<button class="media-modal-prev">&#10094;</button>' +
                '<div class="media-modal-content"></div>' +
                '<button class="media-modal-next">&#10095;</button>' +
                '<div class="media-modal-counter"></div>' +
                '<button class="media-modal-close">&times;</button>';
            document.body.appendChild(modal);

            modal.querySelector('.media-modal-backdrop').addEventListener('click', closeModal);
            modal.querySelector('.media-modal-close').addEventListener('click', closeModal);
            modal.querySelector('.media-modal-prev').addEventListener('click', function(e) { e.stopPropagation(); prev(); });
            modal.querySelector('.media-modal-next').addEventListener('click', function(e) { e.stopPropagation(); next(); });

            document.addEventListener('keydown', function(e) {
                if (!isOpen) return;
                if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
                else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
                else if (e.key === 'Escape') { e.preventDefault(); closeModal(); }
            });
        }

        isOpen = true;
        modal.classList.add('open');
        renderCurrent();
    }

    function prev() {
        if (!currentFiles.length) return;
        currentIndex = (currentIndex - 1 + currentFiles.length) % currentFiles.length;
        renderCurrent();
    }

    function next() {
        if (!currentFiles.length) return;
        currentIndex = (currentIndex + 1) % currentFiles.length;
        renderCurrent();
    }

    function closeModal() {
        if (modal) {
            isOpen = false;
            modal.classList.remove('open');
            var video = modal.querySelector('video');
            var audio = modal.querySelector('audio');
            if (video) { video.pause(); video.src = ''; }
            if (audio) { audio.pause(); audio.src = ''; }
        }
    }

    return {
        getFileType: getFileType,
        createPreview: createPreview,
        openModal: openModal,
        closeModal: closeModal
    };
})();
