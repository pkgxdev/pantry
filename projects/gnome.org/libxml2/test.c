#include <libxml/tree.h>

int main() {
  xmlDocPtr doc = xmlNewDoc(BAD_CAST "1.0");
  xmlNodePtr root_node = xmlNewNode(NULL, BAD_CAST "root");
  xmlDocSetRootElement(doc, root_node);
  xmlFreeDoc(doc);
  return 0;
}
