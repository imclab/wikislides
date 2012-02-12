# Scrapy settings for flickr project
#
# For simplicity, this file contains only the most important settings by
# default. All the other settings are documented here:
#
#     http://doc.scrapy.org/topics/settings.html
#
from os.path import dirname, realpath

PROJECT_ROOT = dirname(realpath(__file__))

BOT_NAME = 'flickr'
BOT_VERSION = '1.0'

SPIDER_MODULES = ['flickr.spiders']
NEWSPIDER_MODULE = 'flickr.spiders'
USER_AGENT = '%s/%s' % (BOT_NAME, BOT_VERSION)

