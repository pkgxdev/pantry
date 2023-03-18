import site
import sys

# tea considers /usr/local the “πglobal install” location
# setting this is kinda nuts but brew does the same so
# we’re assuming they vetted all options
sys.prefix = "/usr/local"

# enable automatic user installs if pip makes the decision
# that this is good idea. eg. if /usr/local isn’t writable
# this is what it will do
site.ENABLE_USER_SITE = True
