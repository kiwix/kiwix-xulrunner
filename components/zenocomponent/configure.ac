AC_INIT(zenocomponent, 0.1)

AC_PROG_CC
AC_PROG_CXX

AC_LANG(C)

AC_CHECK_TOOL(HAVE_PKG, pkg-config)

libxul_pkgconfig_ok="no"
if test ! "x$HAVE_PKG" = "x" ; then
	if `$HAVE_PKG libxul --exists` ; then
		libxul_pkgconfig_ok="yes"
	fi
fi

if test "x$libxul_pkgconfig_ok" = "xyes" ; then
	GECKO_SDK_PATH=`pkg-config --variable=sdkdir libxul`
	GECKO_IDL_INCLUDES="-I `pkg-config --variable=idldir libxul`/`pkg-config --variable=includetype libxul`"
	GECKO_INCLUDES=`pkg-config --cflags libxul`
	GECKO_LDFLAGS=`pkg-config --libs libxul`
else
	GECKO_SDK_PATH="../../gecko_sdk/1.8"
	GECKO_DEFINES="-DXPCOM_BUILD -DXPCOM_GLUE -DMOZILLA_STRICT_API"
	GECKO_IDL_INCLUDES="-I $(GECKO_SDK_PATH)/idl"
	GECKO_INCLUDES="-I $(GECKO_SDK_PATH)/include"
	GECKO_LDFLAGS="-L $(GECKO_SDK_PATH)/lib -lxpcomglue -lnspr4 -lplds4 -lembed_base_s -lz"
fi

AC_SUBST(GECKO_SDK_PATH)
AC_SUBST(GECKO_DEFINES)
AC_SUBST(GECKO_IDL_INCLUDES)
AC_SUBST(GECKO_INCLUDES)
AC_SUBST(GECKO_LDFLAGS)

AC_LANG(C++)

AC_CHECK_LIB([zeno], [main], [LIBS="-Wl,-Bstatic -lzeno -lcxxtools -Wl,-Bdynamic $LIBS"], [AC_MSG_ERROR([libzeno is missing, please install it])])

AC_CONFIG_FILES([
	Makefile.real
])
AC_OUTPUT

if test ! "x$libxul_pkgconfig_ok" = "xyes" ; then
	echo "configure either didn't found pkg-config or libxul.pc,"
	echo "you should install them if you want to use another SDK"
	echo "than the 1.8 shipped with Kiwix."
fi
