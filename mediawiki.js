(function() {

    stringMul = function(str, num) {
            var acc = [];
            for (var i = 0; (1 << i) <= num; i++) {
                if ((1 << i) & num)
                    acc.push(str);
                str += str;
            }
            return acc.join("");
    }

    print = function(buff, str) {
        return buff + str + "\n";
    }

    var _LIST_RE = /\*+/,
        _WIKI_RE = /\[\[w\|(.*?)\]\]/g,
        _LABEL_RE = /\[\[l\|(.*?)\]\]/g;

    var format_line = function(line) {
        var line = line.replace(_LIST_RE, "");
        line = line.replace(_WIKI_RE, function(m, l) {
            return "<a target='_blank' href='http://es.wikipedia.com/wiki/" + l + "'>" + l + "</a>"
        });
        line = line.replace(_LABEL_RE, function(m, l) {
            return "<a href='http://naturalothlorien.blogspot.com/search/label/" + l + "'>" + l + "</a>"
        });
        return line;
    }

    var process_line = function(line) {
        var line = line.trim(),
            level = 0,
            m = _LIST_RE.exec(line);
        if (m)
            level = m[0].length;
        return [level, format_line(line)];
    }

    var process_text = function(text) {
        var buff = "",
            level = 0;
        text.split(/[\r\n]+/).forEach(function(line) {
            var result = process_line(line);
            var newlevel = result[0];
            line = result[1];
            if (newlevel > level)
                buff = print(buff, stringMul("<ul>", newlevel - level));
            else if (newlevel < level)
                buff = print(buff, stringMul("</ul>", level - newlevel));
            if (newlevel > 0)
                buff = print(buff, "<li>");
            buff = print(buff, line);
            if (newlevel > 0)
                buff = print(buff, "</li>");
            level = newlevel;
        });
        buff = print(buff, stringMul("</ul>", level));
        return buff;
    }

    Element.prototype.wiki2Html = function () {
        this.innerHTML = process_text(this.textContent);
    }

/*    window.onload = function(e) {
        var wikiareas = document.getElementsByClassName("wikiarea");
        for (var i=0; i < wikiareas.length; i++)
            wikiareas[i].wiki2Html();
    }*/
})();
