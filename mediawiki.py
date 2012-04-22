#!/usr/bin/python

from cStringIO import StringIO
import re
import sys

_LIST_RE = re.compile("\*+")
_WIKI_RE = re.compile("\[\[w\|(.*?)\]\]")

def format_line(line):
    line = _LIST_RE.sub("", line)
    line = _WIKI_RE.sub("<a target='_blank' href='http://es.wikipedia.com/wiki/\g<1>'>\g<1></a>", line)
    return line

def process_line(line):
    line = line.strip()
    level = 0
    m = _LIST_RE.match(line)
    if m:
        level = len(m.group())
    return level, format_line(line)

def process_text(text):
    buff = StringIO()
    level = 0
    for line in text.splitlines():
        newlevel, line = process_line(line)
        if newlevel > level:
            print >> buff, "<ul>" * (newlevel - level)
        elif newlevel < level:
            print >> buff, "</ul>" * (level - newlevel)
        if newlevel > 0:
            print >> buff, "<li>"
        print >> buff, line.encode('ascii', 'xmlcharrefreplace')
        if newlevel > 0:
            print >> buff, "</li>"
        level = newlevel
    print >> buff, "</ul>" * level

    buff.reset()
    return buff.read()

def main():
    print process_text(sys.stdin.read().decode("utf-8"))

main()
