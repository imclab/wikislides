/*
 * Javascript Wikimedia formatter
 * By Kalessin https://github.com/kalessin
 * Intructions
 * - Add this script in an html/javascript blogger widget:
 *   <script type="text/javascript" src="https://github.com/kalessin/wikislides/raw/master/mediawiki.js"></script>
 * - Add following code in post-body in template source:
 *       <script type='text/javascript'>
 *             var post = document.getElementById(&#39;post-body-&#39; + &#39;<data:post.id/>&#39;),
 *                 wiki = post.getElementsByClassName(&quot;wikiarea&quot;)[0];
 *             if (wiki) wiki.wiki2Html();
 *       </script>
 *
 * Supported:
 * - * lists
 * - # numbered lists
 * - [[w|<keyword>]] - convert to wikimedia link (spanish by default)
 * - [[w.<lang>|<keyword>]] - convert to wikimedia link with the specified language prefix
 * - [[l|<keyword>]] - convert to blog label link
 * - **bold**
 * - //italic//
 * - == headers ==
 * - [[@<link>|<link text>]] generic links
 * - ---- horizontal rule
 * - [<num>] superscript
*/
(function() {

    print = function(buff, str) {
        return buff + str + "\n";
    }

    var _LIST_RE = /^\*+/,
        _OLIST_RE = /^#+/,
        _WIKI_RE = /\[\[w(\.\w+)?\|(.+?)\]\]/g,
        _LABEL_RE = /\[\[l\|(.+?)\]\]/g,
        _HEADER_RE = /^(=+)(.+?)(=+)/,
        _BOLD_RE = /\*\*([^\*^\s][^\*]*?)\*\*/g,
        _ITALIC_RE = /\/\/(.+?)\/\//g,
        _LINK_RE = /\[\[@(.+?)\|(.+?)\]\]/g,
        _SUP_RE = /\[(\d+)\]/g;

    var format_line = function(line) {
        var insertParagraph = true;
        line = line.replace(_ITALIC_RE, function(m, l) {
            return "<i>" + l + "</i>";
        });
        line = line.replace(_HEADER_RE, function(m, p, l, s) {
            if (p.length == s.length && p.length < 6) {
                insertParagraph = false;
                return "<h" + p.length + ">" + l + "</h" + p.length + ">";
            };
            return line;
        });
        line = line.replace(_WIKI_RE, function(m, lang, l) {
            lang = lang? lang.slice(1) : "es";
            return "<a target='_blank' href='http://" + lang + ".wikipedia.com/wiki/" + l + "'>" + l +
                   "</a> <img class='wikiicon' src='http://dl.dropbox.com/u/12683952/plantae/slides/Wikipedia-icon16.png' />";
        });
        line = line.replace(_LABEL_RE, function(m, l) {
            return "<a href='http://naturalothlorien.blogspot.com/search/label/" + l + "'>" + l + "</a>";
        });
        line = line.replace(_LINK_RE, function(m, l, t) {
            return "<a target='_blank' href='" + l + "'>" + t + "</a>";
        });
        line = line.replace(_BOLD_RE, function(m, l) {
            return "<b>" + l + "</b>";
        });
        line = line.replace(_SUP_RE, function(m, l) {
            return "<sup>" + l + "</sup>";
        });
        return [line, insertParagraph];
    }

    var process_line = function(line) {
        if (line == "----")
            return [0, null, "<hr/>"];
        var level=0,
            ltype = null,
            fresult = format_line(line),
            line = fresult[0],
            insertParagraph = fresult[1];
        var m = _LIST_RE.exec(line);
        var n = _OLIST_RE.exec(line);
        if (m) {
            level = m[0].length;
            line = line.replace(_LIST_RE, "");
            ltype = "<ul>";
        } else if (n) {
            level = n[0].length;
            line = line.replace(_OLIST_RE, "");
            ltype = "<ol>";
        } else if (insertParagraph) line = "<p>" + line + "</p>";
        return [level, ltype, line];
    }

    var process_text = function(text) {
        var buff = "<style>.wikiicon {background:transparent !important;padding:0 !important;}</style>",
            levels = [];
        text.split(/[\r\n]+/).forEach(function(line) {
            line = line.trim();
            if (line) {
                var result = process_line(line);
                var newlevel = result[0],
                    level = levels.length,
                    ltype = result[1];
                line = result[2];
                if (newlevel > level)
                    for (var i=0; i < newlevel - level; i++) {
                        buff = print(buff, ltype);
                        levels.push(ltype.replace("<", "</"));
                    }
                else if (newlevel < level)
                    for (var i=0; i < level - newlevel; i++)
                        buff = print(buff, levels.pop());
                if (newlevel > 0)
                    buff = print(buff, "<li>");
                buff = print(buff, line);
                if (newlevel > 0)
                    buff = print(buff, "</li>");
            }
        });
        while (levels.length)
            buff = print(buff, levels.pop());
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
