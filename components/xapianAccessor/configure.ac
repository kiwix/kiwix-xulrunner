# initialisation
AC_INIT(xapianAccessor, 0.1, kelson@kiwix.org)

# Determine a C compiler to use
AC_PROG_CC

# Determine a C++ compiler to use
AC_PROG_CXX

# Set current language to C
AC_LANG(C)

# Compiler flags
case $build in
	*darwin*)
		CPPFLAGS="${CPPFLAGS} -fno-rtti -D_POSIX_ -O3"
		CXXFLAGS="${CXXFLAGS} -dynamiclib"
		LIBEXT="dylib"
		;;
	*)
		CPPFLAGS="${CPPFLAGS} -fno-rtti -shared -D_POSIX_ -O3 -fPIC"
		CXXFLAGS="${CXXFLAGS} -fPIC"
		LIBEXT="so"
		;;
esac

# Gecko
GECKO_INCLUDES="-fshort-wchar -I../../dependences/xulrunner-sdk/sdk/include/"
GECKO_LDFLAGS="-L../../dependences/xulrunner-sdk/sdk/lib/ -lxpcomglue_s -lxul -lxpcom -lplds4 -lplc4 -lnspr4 -lpthread -ldl"
GECKO_SDK_PATH="../../dependences/xulrunner-sdk/sdk/bin/"
GECKO_IDL_INCLUDES="-I../../dependences/xulrunner-sdk/sdk/idl/"
XPIDL="../../dependences/xulrunner-sdk/sdk/bin/xpidl"

# Set current language to C++
AC_LANG(C++)

# Extern
CPPFLAGS="${CPPFLAGS} -I../../dependences/xapian-core-1.0.13/include/ -I../../dependences/unac-1.8.0.orig/"
LDFLAGS="${LDFLAGS} -L../../dependences/xapian-core-1.0.13/.libs/ -L../../dependences/unac-1.8.0.orig/"

# Check if xapian is installed
AC_PATH_PROG(XAPIAN_CONFIG, xapian-config, no, [$PATH:../../dependences/xapian-core-1.0.13/])
if test "$XAPIAN_CONFIG" = "no" ; then
   AC_MSG_ERROR([Cannot find xapian-config command in $PATH.])
   exit 1
else
	LIBS=" -Wl,-Bstatic -lxapian -lunac -Wl,-Bdynamic $LIBS"
fi

# Env
AC_SUBST(GECKO_DEFINES)
AC_SUBST(GECKO_IDL_INCLUDES)
AC_SUBST(GECKO_INCLUDES)
AC_SUBST(GECKO_LDFLAGS)
AC_SUBST(XPIDL)
AC_SUBST(LIBEXT)

AC_CONFIG_FILES([
	Makefile
])
AC_OUTPUT
