App.markdown = (function() {
    function escapeHtml(text) {
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function highlightCode(code, lang) {
        code = escapeHtml(code);
        var tokens = [];
        var placeholder = '\0';

        function stash(regex, type) {
            code = code.replace(regex, function(match) {
                var idx = tokens.length;
                tokens.push({ type: type, text: match });
                return placeholder + idx + placeholder;
            });
        }

        // Строки (до комментариев, чтобы // внутри строк не считались комментариями)
        stash(/("(?:\\.|[^"\\])*")/g, 'string');
        stash(/('(?:\\.|[^'\\])*')/g, 'string');
        stash(/(`(?:\\.|[^`\\])*`)/g, 'string');

        // Комментарии
        stash(/(\/\/.*$)/gm, 'comment');
        stash(/(\/\*[\s\S]*?\*\/)/g, 'comment');

        // Числа
        stash(/\b(\d+(?:\.\d+)?)\b/g, 'number');

        // Ключевые слова (JS + общие)
        stash(/\b(function|var|let|const|if|else|for|while|return|class|extends|import|export|from|async|await|new|this|try|catch|throw|typeof|instanceof|in|of|void|delete|yield|default|switch|case|break|continue|debugger|with|do|goto|struct|union|enum|typedef|static|public|private|protected|interface|implements|package|namespace|module|using|def|lambda|pass|raise|except|finally|assert|del|global|nonlocal|yield|and|or|not|is|as|True|False|None|self|cls|int|float|bool|str|list|dict|tuple|set|bytes|print|input|len|range|enumerate|zip|map|filter|reduce|sum|min|max|abs|round|pow|divmod|chr|ord|bin|oct|hex|open|close|read|write|append|readline|readlines|seek|tell|flush|truncate|writelines|with|match|case)\b/g, 'keyword');

        // Встроенные объекты / типы
        stash(/\b(console|window|document|Math|JSON|Date|Array|Object|String|Number|Boolean|Promise|Set|Map|WeakMap|WeakSet|Symbol|BigInt|Error|RegExp|Date|ArrayBuffer|SharedArrayBuffer|DataView|Intl|Reflect|Proxy|Atomics|parseInt|parseFloat|isNaN|isFinite|decodeURI|decodeURIComponent|encodeURI|encodeURIComponent|eval|escape|unescape|require|exports|process|Buffer|__dirname|__filename|global|setTimeout|setInterval|clearTimeout|clearInterval|setImmediate|clearImmediate)\b/g, 'builtin');

        // Функции (имя перед скобкой)
        code = code.replace(/(\w+)(?=\()/g, function(match) {
            var idx = tokens.length;
            tokens.push({ type: 'function', text: match });
            return placeholder + idx + placeholder;
        });

        // Операторы
        stash(/(===|!==|==|!=|<=|>=|\+\+|--|=>|&&|\|\||<<|>>|>>>|[+\-*/%=<>!&|^~])/g, 'operator');

        // Восстанавливаем токены
        code = code.replace(new RegExp(placeholder + '(\\d+)' + placeholder, 'g'), function(match, idx) {
            var token = tokens[parseInt(idx)];
            return '<span class="token ' + token.type + '">' + token.text + '</span>';
        });

        return code;
    }

    function parseInline(text) {
        var out = '';
        var i = 0;
        while (i < text.length) {
            var ch = text[i];
            var next = text[i + 1] || '';

            // Ссылки [text](url)
            if (ch === '[') {
                var closeBracket = text.indexOf(']', i);
                var openParen = text.indexOf('(', closeBracket);
                var closeParen = text.indexOf(')', openParen);
                if (closeBracket !== -1 && openParen === closeBracket + 1 && closeParen !== -1) {
                    var linkText = text.substring(i + 1, closeBracket);
                    var linkUrl = text.substring(openParen + 1, closeParen);
                    out += '<a href="' + escapeHtml(linkUrl) + '" target="_blank">' + parseInline(linkText) + '</a>';
                    i = closeParen + 1;
                    continue;
                }
            }

            // Жирный ** или __
            if ((ch === '*' && next === '*') || (ch === '_' && next === '_')) {
                var marker = ch + ch;
                var end = text.indexOf(marker, i + 2);
                if (end !== -1) {
                    out += '<strong>' + parseInline(text.substring(i + 2, end)) + '</strong>';
                    i = end + 2;
                    continue;
                }
            }

            // Курсив * или _
            if (ch === '*' || ch === '_') {
                var end = text.indexOf(ch, i + 1);
                if (end !== -1) {
                    out += '<em>' + parseInline(text.substring(i + 1, end)) + '</em>';
                    i = end + 1;
                    continue;
                }
            }

            // Inline code `
            if (ch === '`') {
                var end = text.indexOf('`', i + 1);
                if (end !== -1) {
                    out += '<code>' + escapeHtml(text.substring(i + 1, end)) + '</code>';
                    i = end + 1;
                    continue;
                }
            }

            // Зачёркнутый ~~text~~
            if (ch === '~' && next === '~') {
                var end = text.indexOf('~~', i + 2);
                if (end !== -1) {
                    out += '<del>' + parseInline(text.substring(i + 2, end)) + '</del>';
                    i = end + 2;
                    continue;
                }
            }

            // Экранирование HTML
            if (ch === '&') { out += '&amp;'; i++; continue; }
            if (ch === '<') { out += '&lt;'; i++; continue; }
            if (ch === '>') { out += '&gt;'; i++; continue; }

            out += ch;
            i++;
        }
        return out;
    }

    function parse(text) {
        var lines = text.split('\n');
        var result = [];
        var inCodeBlock = false;
        var codeBlock = [];
        var inList = false;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var trimmed = line.trim();

            if (trimmed.indexOf('```') === 0) {
                if (inList) { result.push('</ul>'); inList = false; }
                if (inCodeBlock) {
                    var lang = codeBlock.lang || '';
                    var codeHtml = lang ? highlightCode(codeBlock.join('\n'), lang) : escapeHtml(codeBlock.join('\n'));
                    var langClass = lang ? ' class="language-' + lang + '"' : '';
                    result.push('<pre><code' + langClass + '>' + codeHtml + '</code></pre>');
                    codeBlock = [];
                    inCodeBlock = false;
                } else {
                    inCodeBlock = true;
                    codeBlock.lang = trimmed.substring(3).trim();
                }
                continue;
            }

            if (inCodeBlock) {
                codeBlock.push(line);
                continue;
            }

            // Заголовки
            var headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
            if (headerMatch) {
                if (inList) { result.push('</ul>'); inList = false; }
                var level = headerMatch[1].length;
                result.push('<h' + level + '>' + parseInline(headerMatch[2]) + '</h' + level + '>');
                continue;
            }

            // Горизонтальная линия
            if (/^---+\s*$/.test(trimmed) || /^\*\*\*+\s*$/.test(trimmed)) {
                if (inList) { result.push('</ul>'); inList = false; }
                result.push('<hr>');
                continue;
            }

            // Цитаты
            var quoteMatch = line.match(/^>\s?(.*)$/);
            if (quoteMatch) {
                if (inList) { result.push('</ul>'); inList = false; }
                result.push('<blockquote>' + parseInline(quoteMatch[1]) + '</blockquote>');
                continue;
            }

            // Списки
            var listMatch = line.match(/^[-*]\s+(.*)$/);
            if (listMatch) {
                if (!inList) { result.push('<ul>'); inList = true; }
                result.push('<li>' + parseInline(listMatch[1]) + '</li>');
                continue;
            }

            if (inList) { result.push('</ul>'); inList = false; }

            // Пустая строка
            if (trimmed === '') {
                continue;
            }

            result.push('<p>' + parseInline(line) + '</p>');
        }

        if (inList) { result.push('</ul>'); }
        if (inCodeBlock) {
            var lang = codeBlock.lang || '';
            var codeHtml = lang ? highlightCode(codeBlock.join('\n'), lang) : escapeHtml(codeBlock.join('\n'));
            var langClass = lang ? ' class="language-' + lang + '"' : '';
            result.push('<pre><code' + langClass + '>' + codeHtml + '</code></pre>');
        }

        return result.join('\n');
    }

    return { parse: parse };
})();
