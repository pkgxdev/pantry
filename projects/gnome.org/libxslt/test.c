#include <libxml/parser.h>
#include <libxslt/xslt.h>
#include <libxslt/xsltInternals.h>


int main() {
  xmlDocPtr doc = xmlNewDoc(BAD_CAST "1.0");
  xsltStylesheetPtr cur = NULL;
  cur = xsltLoadStylesheetPI(doc);
  xsltFreeStylesheet(cur);
  xmlFreeDoc(doc);
  return 0;
}