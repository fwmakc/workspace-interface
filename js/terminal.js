App.terminal = (function() {
    var cwd = '/home/user';
    var fs = {};

    function init() {
        mkdir('/');
        mkdir('/home');
        mkdir('/home/user');
        mkdir('/home/user/docs');
        writeFile('/home/user/readme.txt', 'Добро пожаловать в виртуальный терминал!\n\nДоступные команды:\n  pwd, ls, cd, mkdir, touch, cat, echo, rm, clear, help');
        writeFile('/home/user/docs/notes.txt', 'Заметки:\n- Изучить JS\n- Написать свой терминал');
    }

    function resolve(path) {
        if (!path) return cwd;
        if (path.charAt(0) === '/') return normalize(path);
        return normalize(cwd + '/' + path);
    }

    function normalize(path) {
        var parts = path.split('/').filter(function(p) { return p && p !== '.'; });
        var stack = [];
        for (var i = 0; i < parts.length; i++) {
            if (parts[i] === '..') {
                stack.pop();
            } else {
                stack.push(parts[i]);
            }
        }
        return '/' + stack.join('/');
    }

    function exists(path) {
        return !!fs[normalize(path)];
    }

    function isDir(path) {
        var node = fs[normalize(path)];
        return node && node.type === 'dir';
    }

    function isFile(path) {
        var node = fs[normalize(path)];
        return node && node.type === 'file';
    }

    function mkdir(path) {
        fs[normalize(path)] = { type: 'dir' };
    }

    function writeFile(path, content) {
        fs[normalize(path)] = { type: 'file', content: content };
    }

    function readFile(path) {
        var node = fs[normalize(path)];
        return node ? node.content : null;
    }

    function remove(path) {
        delete fs[normalize(path)];
    }

    function ls(path) {
        var dir = normalize(path);
        if (!isDir(dir)) return null;
        var prefix = dir === '/' ? '/' : dir + '/';
        var items = [];
        for (var key in fs) {
            if (key.indexOf(prefix) === 0) {
                var rest = key.slice(prefix.length);
                if (rest.indexOf('/') === -1 && rest !== '') {
                    items.push(rest);
                }
            }
        }
        return items.sort();
    }

    function execute(input) {
        var lines = input.split('\n');
        var output = [];
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (!line) continue;
            var result = executeLine(line);
            if (result === '__CLEAR__') return '__CLEAR__';
            if (result !== '') output.push(result);
        }
        return output.join('\n');
    }

    function executeLine(line) {
        var tokens = line.match(/"[^"]+"|'[^']+'|\S+/g) || [];
        tokens = tokens.map(function(t) {
            if ((t.charAt(0) === '"' && t.charAt(t.length - 1) === '"') ||
                (t.charAt(0) === "'" && t.charAt(t.length - 1) === "'")) {
                return t.slice(1, -1);
            }
            return t;
        });
        var cmd = tokens[0];
        var args = tokens.slice(1);

        switch (cmd) {
            case 'pwd':
                return cwd;
            case 'ls':
                var target = args[0] ? resolve(args[0]) : cwd;
                if (!exists(target)) return 'ls: ' + (args[0] || '') + ': нет такого файла или каталога';
                if (isFile(target)) return target.split('/').pop();
                var items = ls(target);
                return items.join('  ');
            case 'cd':
                if (!args[0]) { cwd = '/home/user'; return ''; }
                var dest = resolve(args[0]);
                if (!isDir(dest)) return 'cd: ' + args[0] + ': не каталог';
                cwd = dest;
                return '';
            case 'mkdir':
                if (!args[0]) return 'mkdir: нужен аргумент';
                var newDir = resolve(args[0]);
                if (exists(newDir)) return 'mkdir: ' + args[0] + ': уже существует';
                mkdir(newDir);
                return '';
            case 'touch':
                if (!args[0]) return 'touch: нужен аргумент';
                var newFile = resolve(args[0]);
                if (!exists(newFile)) writeFile(newFile, '');
                return '';
            case 'cat':
                if (!args[0]) return 'cat: нужен аргумент';
                var file = resolve(args[0]);
                if (!isFile(file)) return 'cat: ' + args[0] + ': не файл';
                return readFile(file);
            case 'echo':
                var text = line.slice(4).trim();
                var gt = text.indexOf('>');
                if (gt !== -1) {
                    var content = text.slice(0, gt).trim();
                    var outFile = text.slice(gt + 1).trim();
                    writeFile(resolve(outFile), content);
                    return '';
                }
                return text;
            case 'rm':
                if (!args[0]) return 'rm: нужен аргумент';
                var rmPath = resolve(args[0]);
                if (!exists(rmPath)) return 'rm: ' + args[0] + ': нет такого файла';
                remove(rmPath);
                return '';
            case 'clear':
                return '__CLEAR__';
            case 'help':
                return 'Доступные команды: pwd, ls, cd, mkdir, touch, cat, echo, rm, clear, help';
            default:
                return cmd + ': команда не найдена';
        }
    }

    return { init: init, execute: execute };
})();
