App.mediaViewer = (function() {
    var modal = null;

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

    function createPreview(file, onClick) {
        var type = getFileType(file);
        var url = URL.createObjectURL(file);
        var container = document.createElement('div');
        container.className = 'media-preview media-preview-' + type;

        if (type === 'image') {
            var img = document.createElement('img');
            img.src = url;
            img.alt = file.name;
            img.addEventListener('click', function() { onClick('image', url, file.name); });
            container.appendChild(img);
        } else if (type === 'video') {
            var video = document.createElement('video');
            video.src = url;
            video.preload = 'metadata';
            video.addEventListener('click', function() { onClick('video', url, file.name); });
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

    function openModal(type, src, title) {
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'media-modal';
            modal.innerHTML = '<div class="media-modal-backdrop"></div><div class="media-modal-content"></div><button class="media-modal-close">&times;</button>';
            document.body.appendChild(modal);

            modal.querySelector('.media-modal-backdrop').addEventListener('click', closeModal);
            modal.querySelector('.media-modal-close').addEventListener('click', closeModal);
        }

        var modalContent = modal.querySelector('.media-modal-content');
        modalContent.innerHTML = '';

        if (type === 'image') {
            var img = document.createElement('img');
            img.src = src;
            img.alt = title || '';
            modalContent.appendChild(img);
        } else if (type === 'video') {
            var video = document.createElement('video');
            video.src = src;
            video.controls = true;
            video.autoplay = true;
            modalContent.appendChild(video);
        }

        modal.classList.add('open');
    }

    function closeModal() {
        if (modal) {
            modal.classList.remove('open');
            var video = modal.querySelector('video');
            if (video) {
                video.pause();
                video.src = '';
            }
        }
    }

    return {
        getFileType: getFileType,
        createPreview: createPreview,
        openModal: openModal,
        closeModal: closeModal
    };
})();
