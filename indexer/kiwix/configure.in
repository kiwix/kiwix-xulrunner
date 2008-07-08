AC_INIT(kiwixnormalizer, 0.1)
AC_CONFIG_SRCDIR(src/main.c)

AC_CANONICAL_HOST
AC_CANONICAL_TARGET

AM_INIT_AUTOMAKE(kiwixnormalizer, 0.1)

AC_PROG_CC
AC_PROG_CXX
AC_PROG_INSTALL

AC_LANG(C)

AC_CHECK_TOOL(HAVE_PKG, pkg-config)

if test ! x$HAVE_PKG = x ; then
  if ! `$HAVE_PKG glib-2.0 --exists` ; then
    AC_MSG_ERROR([pkg-config cannot find glib-2.0.])
  fi
  GLIB_CXXFLAGS=`$HAVE_PKG glib-2.0 --cflags`
  GLIB_LIBS=`$HAVE_PKG glib-2.0 --libs`
fi

PWD=`pwd`

ZENO_CXXFLAGS="-I$PWD/../../../extern/zeno/tntzenoreader/include/"
ZENO_LDFLAGS="-L$PWD/../../../extern/zeno/tntzenoreader/src/zenolib/.libs/"

CXXFLAGS="$CXXFLAGS -ggdb $GLIB_CXXFLAGS $ZENO_CXXFLAGS"
LIBS="$GLIB_LIBS $LIBS"
LDFLAGS="$LDFLAGS $ZENO_LDFLAGS"

AC_CHECK_LIB([z], [gzread])

CFLAGS=$CXXFLAGS

AC_LANG(C++)

AC_CHECK_LIB([zeno], [main])

AC_CONFIG_FILES([
	Makefile src/Makefile
])
AC_OUTPUT
