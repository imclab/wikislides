from itertools import cycle
import os
from urlparse import urljoin

from scrapy.selector import HtmlXPathSelector
from scrapy.contrib.linkextractors.sgml import SgmlLinkExtractor
from scrapy.contrib.spiders import CrawlSpider, Rule
from scrapy.exceptions import NotConfigured
from scrapy.http import Request
from scrapy.conf import settings

_INITIAL_BUFF = """
<script type="text/javascript" src="http://dl.dropbox.com/u/12683952/highslide/highslide.js"></script>
<link rel="stylesheet" type="text/css" href="http://dl.dropbox.com/u/12683952/highslide/highslide.css" />
<script type="text/javascript">
    // override Highslide settings here
    // instead of editing the highslide.js file
    hs.graphicsDir = 'http://dl.dropbox.com/u/12683952/highslide/graphics/';
    hs.align = 'center';
    hs.transitions = ['expand', 'crossfade'];
    hs.outlineType = 'glossy-dark';
    hs.wrapperClassName = 'dark';
    hs.fadeInOut = true;
    //hs.dimmingOpacity = 0.75;

    // Add the controlbar
    if (hs.addSlideshow) hs.addSlideshow({
        //slideshowGroup: 'group1',
        interval: 5000,
        repeat: false,
        useControls: true,
        fixedControls: 'fit',
        overlayOptions: {
            opacity: .6,
            position: 'bottom center',
            hideOnMouseOut: true
        }
    });
</script>
"""


class FlickrComSpider(CrawlSpider):
    name = 'flickr.com'
    allowed_domains = ['flickr.com']
    start_urls = ['http://www.flickr.com/photos/eyeoflobogris/']

    link_extractor = SgmlLinkExtractor(allow=r'/page\d+/$')

    def __init__(self, **kwargs):
        species = kwargs.pop("species", None)
        if species is None:
            raise NotConfigured
        self.species = species.lower()
        self.buff = open(os.path.join(os.environ.get("HOME"), "Dropbox/Public/plantae/slides/%s.html" % species.replace(" ", "_")), "w")
        self.buff.write(_INITIAL_BUFF)
        CrawlSpider.__init__(self, **kwargs)
        self.column = cycle([1, 2, 3])

    def start_requests(self):
        for url in self.start_urls:
            yield self.make_request(url)

    def make_request(self, url):
        return Request(url=url, callback=self.parse_list)

    def parse_list(self, response):
        hxs = HtmlXPathSelector(response)
        for ptitle in hxs.select("//h4[text()]"):
            text = ptitle.select("./text()").extract()[0].strip().lower()
            if self.species in text:
                container = ptitle.select("./ancestor::div[@class='hover-target']")
                img = container.select(".//img/@src")[0].extract()
                img_big = img.replace("_m.jpg", "_b.jpg")
                buff = '<a href="%s" class="highslide" onclick="return hs.expand(this)"><img src="%s" /></a>\n' % (img_big, img)
                self.buff.write(buff)

        links = self.link_extractor.extract_links(response)
        for link in links:
            yield self.make_request(link.url)

