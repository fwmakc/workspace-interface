App.emoji = (function() {
    var emojis = [
        '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😉',
        '😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲',
        '😋','😛','😜','🤪','😝','🤑','🤗','🤭','🫢','🤫',
        '🤔','🫡','🤐','🤨','😐','😑','😶','🫥','😏','😒',
        '🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒',
        '🤕','🤢','🤮','🥵','🥶','🥴','😵','🤯','🤠','🥳',
        '🥸','😎','🤓','🧐','😕','🫤','😟','🙁','😮','😯',
        '😲','😳','🥺','🥹','😦','😧','😨','😰','😥','😢',
        '😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤',
        '😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹',
        '👋','🤚','🖐️','✋','🖖','🫱','🫲','🫳','🫴','👌',
        '🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉',
        '👆','🖕','👇','☝️','🫵','👍','👎','✊','👊','🤛',
        '🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','💪','🦾',
        '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔',
        '❤️‍🔥','💕','💞','💓','💗','💖','💘','💝','⭐','🌟',
        '✨','⚡','🔥','💥','🎉','🎊','🎯','🏆','🥇','💯'
    ];

    function init() {
        var picker = document.getElementById('emojiPicker');
        var btn = document.getElementById('emojiBtn');
        var input = App.input;

        emojis.forEach(function(emoji) {
            var el = document.createElement('button');
            el.textContent = emoji;
            el.addEventListener('click', function(e) {
                e.preventDefault();
                var start = input.selectionStart;
                var end = input.selectionEnd;
                var val = input.value;
                input.value = val.slice(0, start) + emoji + val.slice(end);
                input.selectionStart = input.selectionEnd = start + emoji.length;
                input.focus();
            });
            picker.appendChild(el);
        });

        btn.addEventListener('click', function(e) {
            e.preventDefault();
            picker.classList.toggle('open');
        });

        document.addEventListener('click', function(e) {
            if (!picker.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
                picker.classList.remove('open');
            }
        });
    }

    return { init: init };
})();
