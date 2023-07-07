AC_INIT(myconfig, version-0.1)
AC_MSG_NOTICE([Hello, world.])

m4_include([ax_have_select.m4])

# from https://www.gnu.org/software/autoconf-archive/ax_have_select.html
AX_HAVE_SELECT(
  [AX_CONFIG_FEATURE_ENABLE(select)],
  [AX_CONFIG_FEATURE_DISABLE(select)])
AX_CONFIG_FEATURE(
  [select], [This platform supports select(7)],
  [HAVE_SELECT], [This platform supports select(7).])