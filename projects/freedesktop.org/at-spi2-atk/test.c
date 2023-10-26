#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <glib.h>
#include <atk/atk.h>
#include <atk-bridge.h>

static AtkObject *root_accessible;
static GMainLoop *mainloop;
static gchar *tdata_path = NULL;

AtkObject *test_get_root(void)
{
    return root_accessible;
}

static AtkObject *get_root(void)
{
    return test_get_root();
}

const gchar *get_toolkit_name(void)
{
    return strdup("atspitesting-toolkit");
}

static void setup_atk_util(void)
{
    AtkUtilClass *klass;

    klass = g_type_class_ref(ATK_TYPE_UTIL);
    klass->get_root = get_root;
    klass->get_toolkit_name = get_toolkit_name;
    g_type_class_unref(klass);
}

static GOptionEntry optentries[] = {
    {"test-data-file", 0, 0, G_OPTION_ARG_STRING, &tdata_path, "Path to file of test data", NULL},
    {NULL}};

int main(int argc, char *argv[])
{
    GOptionContext *opt;
    GError *err = NULL;
    opt = g_option_context_new(NULL);
    g_option_context_add_main_entries(opt, optentries, NULL);
    g_option_context_set_ignore_unknown_options(opt, TRUE);

    if (!g_option_context_parse(opt, &argc, &argv, &err))
        g_error("Option parsing failed: %s", err->message);

    setup_atk_util();
    atk_bridge_adaptor_init(NULL, NULL);

    return 0;
}