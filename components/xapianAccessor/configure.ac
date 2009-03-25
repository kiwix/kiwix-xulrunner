# initialisation
AC_INIT(xapianAccessor, 0.1, kelson@kiwix.org)

# Determine a C compiler to use
AC_PROG_CC

# Determine a C++ compiler to use
AC_PROG_CXX

# Set current language to C
AC_LANG(C)

# check if the 'pkg-config' binary exists
AC_CHECK_TOOL(HAVE_PKG, pkg-config)

libxul_pkgconfig_ok="no"
if test ! "x$HAVE_PKG" = "x" ; then
	if `$HAVE_PKG libxul --exists` ; then
		libxul_pkgconfig_ok="yes"
	fi
fi

if test "x$libxul_pkgconfig_ok" = "xyes" ; then
	GECKO_INCLUDES=`pkg-config --cflags libxul`
	GECKO_LDFLAGS=`pkg-config --libs libxul`

	GECKO_SDK_PATH="`pkg-config --variable=sdkdir libxul`/bin"
	AC_PATH_PROG([XPIDL], "xpidl", [], $GECKO_SDK_PATH)
	if test "x$XPIDL"  = "x" ; then
		GECKO_SDK_PATH=`pkg-config --variable=libdir libxul`
		AC_PATH_PROG([XPIDL], "xpidl", [], $GECKO_SDK_PATH)
		if test "x$XPIDL"  = "x" ; then
			AC_MSG_ERROR([Can't find xpidl])
		fi
	fi
	AC_SUBST(XPIDL)

	IDLPATH=`pkg-config --variable=idldir libxul`
	if test ! -e "$IDLPATH/nsISupports.idl" ; then
		IDLPATH="$IDLPATH/`pkg-config --variable=includetype libxul`"
		if test ! -e "$IDLPATH/nsISupports.idl" ; then
			AC_MSG_ERROR([Can't find idl directory])
		fi
	fi
	GECKO_IDL_INCLUDES="-I $IDLPATH"
else
	geckopath="../../gecko_sdk/1.8"
	AC_ARG_WITH([gecko-sdk], AC_HELP_STRING([--with-gecko-sdk=somepath], [provide Gecko SDK path]), [geckopath=$withval])

	GECKO_SDK_PATH="${geckopath}"

	GECKO_INCLUDES="-I ${GECKO_SDK_PATH}/include/xpcom"
	GECKO_INCLUDES="${GECKO_INCLUDES} -I ${GECKO_SDK_PATH}/include/string"
	GECKO_INCLUDES="${GECKO_INCLUDES} -I ${GECKO_SDK_PATH}/include/nspr"
	GECKO_INCLUDES="${GECKO_INCLUDES} -I ${GECKO_SDK_PATH}/include/necko"

	GECKO_DEFINES="-DXP_UNIX"
	GECKO_IDL_INCLUDES="-I ${GECKO_SDK_PATH}/idl"

	GECKO_LDFLAGS="-L${GECKO_SDK_PATH}/lib"

	case $build in
		*darwin*)
			GECKO_LDFLAGS="${GECKO_LDFLAGS} -L${GECKO_SDK_PATH}/bin -Wl,-executable_path,${GECKO_SDK_PATH}/bin"
			;;
	esac

	GECKO_LDFLAGS="${GECKO_LDFLAGS} -lxpcomglue_s -lxpcom -lnspr4"
	XPIDL="${GECKO_SDK_PATH}/bin/xpidl"

	case $build in
		*darwin*)
			GECKO_DEFINES="${GECKO_DEFINES} -DXP_MACOSX"
			;;
	esac
fi

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

AC_SUBST(GECKO_DEFINES)
AC_SUBST(GECKO_IDL_INCLUDES)
AC_SUBST(GECKO_INCLUDES)
AC_SUBST(GECKO_LDFLAGS)
AC_SUBST(XPIDL)
AC_SUBST(LIBEXT)

# Set current language to C++
AC_LANG(C++)

# extern
CPPFLAGS="${CPPFLAGS} -I../../dependences/xapian-core-1.0.11/include/"
LDFLAGS="${LDFLAGS} -L../../dependences/xapian-core-1.0.11/.libs/"

# Check if xapian is installed
AC_PATH_PROG(XAPIAN_CONFIG, xapian-config, no, [$PATH:../../dependences/xapian-core-1.0.11/])
if test "$XAPIAN_CONFIG" = "no" ; then
   AC_MSG_ERROR([Cannot find xapian-config command in $PATH.])
   exit 1
else
	LIBS=" -Wl,-Bstatic -lxapian -Wl,-Bdynamic $LIBS"
fi

AC_CONFIG_FILES([
	Makefile
])
AC_OUTPUT

if test ! "x$libxul_pkgconfig_ok" = "xyes" ; then
	echo "configure either didn't found pkg-config or libxul.pc,"
	echo "you should install them if you want to use another SDK"
	echo "than the 1.8 shipped with Kiwix."
fi
