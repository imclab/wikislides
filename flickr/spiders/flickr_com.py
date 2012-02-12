from itertools import cycle
from os.path import join
from urlparse import urljoin

from scrapy.selector import HtmlXPathSelector
from scrapy.contrib.linkextractors.sgml import SgmlLinkExtractor
from scrapy.contrib.spiders import CrawlSpider, Rule
from scrapy.exceptions import NotConfigured
from scrapy.http import Request
from scrapy.conf import settings

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
        self.buff = open(join(settings.get("PROJECT_ROOT"), "data/%s.txt" % species.replace(" ", "_")), "w")
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
                link = urljoin("http://www.flickr.com", container.select(".//a/@href")[-1].extract() + "sizes/l/in/photostream/")
                buff = ""
                buff += '|| [[image:%s link="%s"]] ' % (img, link)
                if self.column.next () == 3:
                    buff += "||\n"
                self.buff.write(buff)

        links = self.link_extractor.extract_links(response)
        for link in links:
            yield self.make_request(link.url)
