
##################
# /!\ ATTENTION
# Before editting this file, please read the following:
#
# The platform is stored in IS_WIN, IS_OSX, IS_LINUX, IS_POSIX variables.
# Those are detected automatically from the host.
# Currently you can't cross-compile.
# IS_LINUX and IS_OSX implies IS_POSIX
#
# Each dependency have a set of variables set at the beginning of this file:
# X_CFLAGS, X_LDFLAGS: expected flags for shared linking.
# COMPILE_X: whether or not a download+compile will be performed.
# COMPILED_X_CFLAGS, COMPILED_X_LDFLAGS: expected flags once compiled locally.
# X_CFLAGS and X_LDFLAGS will be replace with COMPILED ones if appropriate.
#
# Each dependency has it own space for dependency resolution (although most
# look very similar)
# Process is the same for all:
# 1. get path from --with-x= and add it to LIBRARY_PATH
# 2. get path from --with-static-x (usually a .a file) and store it.
# 3. if no static requested, try to find the library automaticaly
# using pkg-config, AC_CHECK_LIB, etc. If not found, fail.
# 4. mark package for compile if static is SELF. If static is a path, try to
# find the archive and fail if not found.
##################

# Autotools initializations
AC_INIT([kiwix], [0.9])
IS_WIN=0
IS_OSX=0
IS_POSIX=0
IS_LINUX=0
IS_OLD_GCC=0

AC_CONFIG_AUX_DIR([.]) # where are autotools scripts located

AM_INIT_AUTOMAKE
AM_MAINTAINER_MODE

# I have commented out this. Default prefix should be /usr/local
#AC_PREFIX_PROGRAM("whoami")

# find C compiler
AC_PROG_CC

# Macro for "ln -s" and "cp" in fallback
AC_PROG_LN_S

# find C++ compiler
AC_PROG_CXX
AC_CHECK_TOOL(HAVE_CXX, "$CXX")
if test [ ! "$HAVE_CXX" ]
then
    AC_MSG_ERROR([[cannot find any C++ compiler]])
fi

# AC_CHECK_TOOL(HAVE_ZIP, zip)

# Check binary compressor
AC_CHECK_PROG(HAVE_UPX, upx, 1, 0)
AM_CONDITIONAL([HAVE_UPX], [test "$HAVE_UPX" = 1])

# Check if running on Windows
AC_CHECK_PROG(HAVE_CL, cl.exe, yes, no)
AM_CONDITIONAL([IS_WIN], [test "$HAVE_CL" = yes])
AM_CONDITIONAL([IS_POSIX], [test ! "$HAVE_CL" = yes])
if test [ "$HAVE_CL" = yes ]
then
    IS_WIN=1
else
    IS_POSIX=1
fi

# Check if running on OSX
AC_CHECK_PROG(HAVE_XCODE, Xcode, yes, no, [$PATH$PATH_SEPARATOR/Developer/Applications/Xcode.app/Contents/MacOS/$PATH_SEPARATOR,$PATH$PATH_SEPARATOR/Applications/Xcode.app/Contents/MacOS/$PATH_SEPARATOR])
AM_CONDITIONAL([IS_OSX], [test "$HAVE_XCODE" = yes])
if test [ "$HAVE_XCODE" = yes ]
then
    IS_OSX=1
else
	if test [ $IS_POSIX -eq 1 ]
	then
		IS_LINUX=1
	else
		IS_LINUX=3
	fi
fi

# check if running on Linux
AM_CONDITIONAL([IS_LINUX], [test $IS_POSIX -eq 1 -a $IS_OSX -eq 0 ])

# POSIX only checks
# Only for POSIX systems
if test [ $IS_POSIX -eq 1 ]
then

  # Chek zip
  AC_CHECK_TOOL([ZIP],[zip],[])
  if [[ "$ZIP" = "" ]]; then
    AC_MSG_ERROR([zip is required.])
  fi

  # Check the compiler version
  if test [ "$CXX" ]
  then
    CXX_VERSION=`$CXX --version | head -n 1 | cut -d " " -f 3`
    if [[ "$CXX_VERSION" \< "3.3" ]]
    then
      AC_MSG_ERROR([g++ 3.3.x or higher required])
    fi
  fi

  # Determine libtool
  AC_PROG_LIBTOOL
  AC_PROG_RANLIB
  AC_PROG_MAKE_SET

  # Check if the 'pkg-config' binary exists
  AC_CHECK_TOOL(HAVE_PKG_CONFIG, pkg-config)
  if test [ ! "$HAVE_PKG_CONFIG" ]
  then
    AC_MSG_ERROR([[cannot find pkg-config]])
  fi

fi

# Windows only checks
if test [ $IS_WIN -eq 1 ] ; then
   CL_VERSION=`cl.exe 2>&1 | grep Version | sed 's/.*Version //' | sed 's/\..*//'`
   AC_MSG_RESULT(checking for cl version... ${CL_VERSION})
fi

# Set current language to C++
AC_LANG(C++)

# Current path
CURRENT_PATH=`pwd`

# Check if their is a Perl binary
AC_CHECK_TOOL(HAVE_PERL, perl)

# check if java tools for Android are present
AC_CHECK_TOOL(HAVE_JAVA_BIN, java)
AC_CHECK_TOOL(HAVE_JAVAH_BIN, javah)
AC_CHECK_TOOL(HAVE_JARSIGNER_BIN, jarsigner)

# check if imagemagick's convert is present
AC_CHECK_TOOL(HAVE_CONVERT_BIN, convert)

# check if python-requests is installed
HAVE_PYTHON_REQUESTS=`python -c 'import requests; print("python-requests")' 2> /dev/null`
AC_MSG_RESULT(checking for python-requests... ${HAVE_PYTHON_REQUESTS})
HAVE_PYTHON_BEAUTIFULSOUP=`python -c 'import bs4; print("python-beautifulsoup")' 2> /dev/null`
AC_MSG_RESULT(checking for python-beautifulsoup... ${HAVE_PYTHON_BEAUTIFULSOUP})

# Check the existence of stat64 (to handle file >2GB) in the libc
AC_CHECK_FUNCS([stat64])

# used to display a warning message at end of configure
# if there are unmet dependencies which will be compiled.
MISSING_SELF_DEPS=0

function ErrorOrWarning {
	# parameters:
	# $1: condition on COMPILE_XX variable (check if it will be compiled)
	# $2: error message

	# if $1 is 1, we assume it will be compiled and just display warning
	if [[ $1 -eq 1 ]]
	then
		AC_MSG_WARN([[$2]])
		MISSING_SELF_DEPS=1
	# if not, it is supposed to be present so we send error
	else
		AC_MSG_ERROR([[$2]])
	fi
}

function yesno {
	if [[ $1 -eq 1 ]]
	then
		echo yes
	else
		echo no
	fi
}

function findLibrary {
	found=0
	for f in $(echo $LIBS_ROOT|tr ":" "\n") ; do
		sf=`find $f -name $1 | grep $ARCH | head -1 2> /dev/null`
		if [[ -f "$sf" -a $found -eq 0 ]]
		then
			found=1
			echo $sf
		fi
	done
	if [[ $found -eq 0 ]]
	then
		for f in $(echo $LIBS_ROOT|tr ":" "\n") ; do
			sf=`find $f -name $1 | head -1 2> /dev/null`
			if [[ -f "$sf" -a $found -eq 0 ]]
			then
				found=1
				echo $sf
			fi
		done
	fi
	if [[ $found -eq 0 ]]
	then
		echo "no"
	fi
}

####################################################
############ TARGET_ARCH
####################################################
# ARCH flags
#ARCH=`echo $MACHTYPE | cut -d- -f1`
ARCH=`uname -m`
AC_ARG_WITH(target-arch,
            AC_HELP_STRING([--with-target-arch=ARCH], [(OSX Only) Define the target architecture of the built (i386 or x86_64)]),
            XTARGET=${withval})
# only overwrite arch on OSX
if test [ $IS_OSX -eq 1 ] ; then
	AS_IF([test ! "${XTARGET}" = "i386" -a ! "${XTARGET}" = "x86_64"], [], [ARCH=${XTARGET}])
	CC="$CC -arch ${ARCH}"
	CXX="$CXX -arch ${ARCH}"
fi

if test [ "`uname -m | grep 64 | wc -l | awk '{ print $1}'`" = "0" ];
then
	IS_64B=0
else
	IS_64B=1
fi

if test [ "`uname -m | grep arm | wc -l | awk '{ print $1}'`" = "0" ];
then
	IS_ARM=0
else
	IS_ARM=1
fi

DEFAULT_CERTIFICATE="Developer ID Application: Renaud Gaudin (S3QKTMRU8F)"

####################################################
############ DEPENDENCIES DEFAULT VALUES
####################################################

SELF="SELF"
DEP_PATH="${CURRENT_PATH}/src/dependencies"
LIBS_ROOT="${LD_LIBRARY_PATH}:${LIBRARY_PATH}:/usr/lib:/lib"
SERVER_BIN="${CURRENT_PATH}/src/server/kiwix-serve"
DEP_MIRROR="http://download.kiwix.org/dev"
if test [ $IS_OSX -eq 1 ] ; then
CHECK_LDFLAGS=""
else
CHECK_LDFLAGS="-Wl,-z,defs"
fi
JAR_CONTENT=0
DEBIAN_RULES=0

COMPIL_DEPS=0
STATIC_BINS=0
STATIC_TMP="static_tmp"
DISTDEBIAN_TMP="debian_tmp"
SUGAR_TMP="sugar_tmp"
SUGAR_VERSION=`if test [ -f src/sugar/activity/activity.info ]; then grep activity_version src/sugar/activity/activity.info | cut -d " " -f3; fi`

# list of .so to copy to xulrunner/ path
EMBED_LIBS=""

SHARED_EXT="so"
if test [ $IS_OSX -eq 1 ] ; then
SHARED_EXT="dylib"
elif test [ $IS_WIN -eq 1 ] ; then
SHARED_EXT="dll"
fi

GECKO_SDK_PATH=""
COMPILE_GECKO_SDK=0
if test [ $IS_OSX -eq 1 ] ; then
COMPILED_GECKO_SDK_PATH="${DEP_PATH}/universal-sdk"
else
COMPILED_GECKO_SDK_PATH="${DEP_PATH}/xulrunner-sdk"
fi

if test [ $IS_OSX -eq 1 ]
then
	XULRUNNER_RUNTIME_PATH="${DEP_PATH}/xr_target/xulrunner-29.0.en-US.mac/XUL.framework"
else
	XULRUNNER_RUNTIME_PATH="${DEP_PATH}/xulrunner"
fi

ANDROID_NDK_PATH="${DEP_PATH}/android-ndk-r8e/"
ANDROID_SDK_PATH="${DEP_PATH}/android-sdk/sdk"
ANDROID_DEPS="android-deps"

ZLIB_CFLAGS=""
ZLIB_LDFLAGS=" -lz"
ZLIB_STATIC_LDFLAGS=""
COMPILE_ZLIB=0
COMPILED_ZLIB_CFLAGS="-I${DEP_PATH}/zlib-1.2.8"
COMPILED_ZLIB_LDFLAGS="-L${DEP_PATH}/zlib-1.2.8/shared/lib  -lz"
if test [ $IS_WIN -eq 1 ]
then
    COMPILED_ZLIB_FILES="${DEP_PATH}/zlib-1.2.8/zlib.lib"
else
    COMPILED_ZLIB_FILES="${DEP_PATH}/zlib-1.2.8/shared/lib/libz.${SHARED_EXT}"
fi
COMPILED_ZLIB_STATIC_LDFLAGS="${DEP_PATH}/zlib-1.2.8/static/lib/libz.a"
if test [ $IS_OSX -eq 1 ]
then
	COMPILED_ZLIB_LDFLAGS="-L${DEP_PATH}/zlib-1.2.8/build/shared/lib  -lz"
	COMPILED_ZLIB_FILES="${DEP_PATH}/zlib-1.2.8/build/shared/lib/libz.${SHARED_EXT}"
	COMPILED_ZLIB_STATIC_LDFLAGS="${DEP_PATH}/zlib-1.2.8/build/static/lib/libz.a"
fi

XAPIAN_CFLAGS=""
XAPIAN_LDFLAGS="-lxapian -lrt"
XAPIAN_STATIC_LDFLAGS=""
COMPILE_XAPIAN=0
COMPILED_XAPIAN_CFLAGS="-I${DEP_PATH}/xapian-core-1.4.0/include/"
if test [ $IS_WIN -eq 1 ] ; then
    COMPILED_XAPIAN_FILES="${DEP_PATH}/xapian-core-1.4.0/win32/Release/libs/libunicode.lib"
else
    COMPILED_XAPIAN_LDFLAGS="-L${DEP_PATH}/xapian-core-1.4.0/.libs -lxapian -lrt"
    COMPILED_XAPIAN_FILES="${DEP_PATH}/xapian-core-1.4.0/.libs/libxapian.${SHARED_EXT}"
    COMPILED_XAPIAN_STATIC_LDFLAGS="${DEP_PATH}/xapian-core-1.4.0/.libs/libxapian.a"
fi
XAPIAN_COMPACT=""
COMPILED_XAPIAN_COMPACT="${DEP_PATH}/xapian-core-1.4.0/build/bin/xapian-compact"

ICU_CFLAGS=""
ICU_LDFLAGS="-licui18n -licuuc -licudata" # replaced by icu-config
ICU_STATIC_LDFLAGS=""
COMPILE_ICU=0
COMPILED_ICU_CFLAGS="-I${DEP_PATH}/icu/source/build/include"
if test [ $IS_WIN -eq 1 ] ; then
	COMPILED_ICU_FILES="${DEP_PATH}/icu/lib/icuio.lib ${DEP_PATH}/icu/lib/icudata.lib ${DEP_PATH}/icu/lib/icuuc.lib ${DEP_PATH}/icu/lib/icui18n.lib"
else
	COMPILED_ICU_LDFLAGS="-L${DEP_PATH}/icu/source/build/lib -licui18n -licuuc -licudata"
	COMPILED_ICU_STATIC_LDFLAGS="${DEP_PATH}/icu/source/build/lib/libicui18n.a ${DEP_PATH}/icu/source/build/lib/libicuuc.a ${DEP_PATH}/icu/source/build/lib/libicudata.a"
	COMPILED_ICU_CFLAGS="-I${DEP_PATH}/icu/source/build/include"
	COMPILED_ICU_FILES="${DEP_PATH}/icu/source/build/lib/libicui18n.${SHARED_EXT} ${DEP_PATH}/icu/source/build/lib/libicuuc.${SHARED_EXT} ${DEP_PATH}/icu/source/build/lib/libicudata.${SHARED_EXT}"
fi
COMPILED_ICUDATA_DAT="${DEP_PATH}/icudt49l.dat"

# used only for building kiwix-serve.
MICROHTTPD_CFLAGS=""
MICROHTTPD_LDFLAGS="-lmicrohttpd"
MICROHTTPD_STATIC_LDFLAGS=""
COMPILE_MICROHTTPD=0
if test [ $IS_WIN -eq 1 ]
then
   COMPILED_MICROHTTPD_FILES="${DEP_PATH}/libmicrohttpd/lib/libmicrohttpd.dll.a"
   COMPILED_MICROHTTPD_CFLAGS="-I${DEP_PATH}/libmicrohttpd/inlcude"
   COMPILED_MICROHTTPD_LDFLAGS="-L${DEP_PATH}/libmicrohttpd/lib"
   COMPILED_MICROHTTPD_STATIC_LDFLAGS="${DEP_PATH}/libmicrohttpd/lib/libmicrohttpd.dll.a"
else
   COMPILED_MICROHTTPD_FILES="${DEP_PATH}/libmicrohttpd-0.9.19/build/lib/libmicrohttpd.${SHARED_EXT}"
   COMPILED_MICROHTTPD_CFLAGS="-I${DEP_PATH}/libmicrohttpd-0.9.19/build/include"
   COMPILED_MICROHTTPD_LDFLAGS="-L${DEP_PATH}/libmicrohttpd-0.9.19/build/lib -lmicrohttpd"
   COMPILED_MICROHTTPD_STATIC_LDFLAGS="${DEP_PATH}/libmicrohttpd-0.9.19/build/lib/libmicrohttpd.a"
fi

LZMA_CFLAGS=""
LZMA_LDFLAGS=" -llzma"
LZMA_STATIC_LDFLAGS=""
COMPILE_LZMA=0
if test [ $IS_WIN -eq 1 ] ; then
	COMPILED_LZMA_FILES="${DEP_PATH}/xz-win/bin_i486/liblzma.lib"
else
	COMPILED_LZMA_LDFLAGS="-L${DEP_PATH}/xz/build/lib  -llzma"
	COMPILED_LZMA_STATIC_LDFLAGS="${DEP_PATH}/xz/build/lib/liblzma.a"
	COMPILED_LZMA_FILES="${DEP_PATH}/xz/build/lib/liblzma.${SHARED_EXT}"
fi
COMPILED_LZMA_CFLAGS="-I${DEP_PATH}/xz/src/liblzma/api"

LIBZIM_CFLAGS=" -I${prefix}/include -I${prefix}/include"
LIBZIM_LDFLAGS=" -lzim"
LIBZIM_STATIC_LDFLAGS=""
COMPILE_LIBZIM=0
if test [ $IS_WIN -eq 1 ] ; then
	COMPILED_LIBZIM_FILES="${DEP_PATH}/zimlib-1.3/src/zim.lib"
else
	COMPILED_LIBZIM_CFLAGS="-I${DEP_PATH}/zimlib-1.3/include"
	COMPILED_LIBZIM_LDFLAGS="-L${DEP_PATH}/zimlib-1.3/build/lib -lzim"
	COMPILED_LIBZIM_STATIC_LDFLAGS="${DEP_PATH}/zimlib-1.3/build/lib/libzim.a"
	COMPILED_LIBZIM_FILES="${DEP_PATH}/zimlib-1.3/build/lib/libzim.${SHARED_EXT}"
fi

LIBPUGIXML_CFLAGS=" -I${prefix}/include"
LIBPUGIXML_LDFLAGS=" -lpugixml"
LIBPUGIXML_STATIC_LDFLAGS=""
COMPILE_LIBPUGIXML=0
if test [ $IS_WIN -eq 1 ] ; then
	COMPILED_LIBPUGIXML_FILES="${DEP_PATH}/pugixml-1.2/src/pugixml.lib"
else
	COMPILED_LIBPUGIXML_CFLAGS="-I${DEP_PATH}/pugixml-1.2/src"
	COMPILED_LIBPUGIXML_LDFLAGS="-L${DEP_PATH}/pugixml-1.2 -lpugixml"
	COMPILED_LIBPUGIXML_STATIC_LDFLAGS="${DEP_PATH}/pugixml-1.2/libpugixml.a"
	COMPILED_LIBPUGIXML_FILES="${DEP_PATH}/pugixml-1.2/libpugixml.${SHARED_EXT} ${DEP_PATH}/pugixml-1.2/libpugixml.a"
fi
if test [ $IS_OSX -eq 1 ] ; then
	COMPILED_LIBPUGIXML_STATIC_LDFLAGS="${DEP_PATH}/pugixml-1.2/build/libpugixml.a"
	COMPILED_LIBPUGIXML_LDFLAGS="-L${DEP_PATH}/pugixml-1.2/build -lpugixml"
	COMPILED_LIBPUGIXML_STATIC_LDFLAGS="${DEP_PATH}/pugixml-1.2/build/libpugixml.a"
	COMPILED_LIBPUGIXML_FILES="${DEP_PATH}/pugixml-1.2/build/libpugixml.${SHARED_EXT} ${DEP_PATH}/pugixml-1.2/build/libpugixml.a"
fi

LIBCTPP2_CFLAGS=" -I${prefix}/include "
LIBCTPP2_LDFLAGS=" -lctpp2"
LIBCTPP2_STATIC_LDFLAGS=""
COMPILE_LIBCTPP2=0
if test [ $IS_WIN -eq 1 ] ; then
	COMPILED_LIBCTPP2_FILES="${DEP_PATH}/ctpp2-2.8.3/src/ctpp2.lib"
else
	COMPILED_LIBCTPP2_CFLAGS="-I${DEP_PATH}/ctpp2-2.8.3/build/complete/include"
	COMPILED_LIBCTPP2_LDFLAGS="-L${DEP_PATH}/ctpp2-2.8.3/build/complete/lib -lctpp2"
	COMPILED_LIBCTPP2_STATIC_LDFLAGS="${DEP_PATH}/ctpp2-2.8.3/build/complete/lib/libctpp2-st.a"
	COMPILED_LIBCTPP2_FILES="${DEP_PATH}/ctpp2-2.8.3/build/complete/lib/libctpp2.${SHARED_EXT}"

	# find C++ compiler
        AC_CHECK_TOOL(HAVE_CMAKE, "cmake")
        if test [ ! "$HAVE_CMAKE" ]
        then
            AC_MSG_ERROR([[cannot find cmake]])
        fi
fi
if test [ $IS_OSX -eq 1 ] ; then
	COMPILED_LIBCTPP2_STATIC_LDFLAGS="ctpp2-2.8.3/build/lib/libctpp2-st.a"
	COMPILED_LIBCTPP2_FILES="${DEP_PATH}/ctpp2-2.8.3/build/lib/libctpp2.${SHARED_EXT}"
	COMPILED_LIBCTPP2_LDFLAGS="-L${DEP_PATH}/ctpp2-2.8.3/build/lib -lctpp2"
	COMPILED_LIBCTPP2_CFLAGS="-I${DEP_PATH}/ctpp2-2.8.3/build/include"
fi

ARIA2_CFLAGS=""
ARIA2_LDFLAGS=""
COMPILE_ARIA2=0
if test [ $IS_OSX -eq 1 ] ; then
	COMPILED_ARIA2_FILES="${DEP_PATH}/aria2c-1.18.5-universal"
elif test [ $IS_WIN -eq 1 ] ; then
	COMPILED_ARIA2_FILES="${DEP_PATH}/aria2c.exe"
else
	COMPILED_ARIA2_FILES="${DEP_PATH}/aria2c"
fi

# OSX only
if test [ $IS_OSX -eq 1 ] ; then
	COMPILED_XULRUNNERBIN_FILES="${DEP_PATH}/kiwix-osx-xulrunner-bin"
else
	COMPILED_XULRUNNERBIN_FILES=""
fi

# uuid is used for binaries. only static.
UUID_CFLAGS=""
UUID_LDFLAGS=""
UUID_STATIC_LDFLAGS=""
COMPILE_UUID=0
COMPILED_UUID_CFLAGS="-I${DEP_PATH}/e2fsprogs-1.42/lib"
COMPILED_UUID_LDFLAGS=""
if test [ $IS_OSX -eq 1 -o $IS_WIN -eq 1 ] ; then
	COMPILED_UUID_STATIC_LDFLAGS=""
	COMPILED_UUID_FILES=""
else
	COMPILED_UUID_STATIC_LDFLAGS="${DEP_PATH}/e2fsprogs-1.42/lib/libuuid.a"
	COMPILED_UUID_FILES="${DEP_PATH}/e2fsprogs-1.42/lib/libuuid.a"
fi

# for binaries
LIBICONV_CFLAGS=""
LIBICONV_LDFLAGS="-liconv"
LIBICONV_STATIC_LDFLAGS=""
COMPILE_LIBICONV=0
if test [ $IS_OSX -eq 1 ]
then
   COMPILE_LIBICONV=1
   COMPILED_LIBICONV_FILES="${DEP_PATH}/libiconv-1.13.1/build/lib/libiconv.${SHARED_EXT}"
   COMPILED_LIBICONV_CFLAGS="-I${DEP_PATH}/libiconv-1.13.1/build-x86_64/include"
   COMPILED_LIBICONV_LDFLAGS="-L${DEP_PATH}/libiconv-1.13.1/build/lib/ -liconv"
   COMPILED_LIBICONV_STATIC_LDFLAGS="${DEP_PATH}/libiconv-1.13.1/build/lib/libiconv.a"

   LIBICONV_CFLAGS=$COMPILED_LIBICONV_CFLAGS
   LIBICONV_LDFLAGS=$COMPILED_LIBICONV_LDFLAGS
   LIBICONV_FILES=$COMPILED_LIBICONV_FILES
   LIBICONV_STATIC_LDFLAGS=$COMPILED_LIBICONV_STATIC_LDFLAGS
fi

# for binaries
GETTEXT_CFLAGS=""
GETTEXT_LDFLAGS="-lintl"
GETTEXT_STATIC_LDFLAGS=""
COMPILE_GETTEXT=0
if test [ $IS_OSX -eq 1 ]
then
   COMPILE_GETTEXT=1
   COMPILED_GETTEXT_FILES="${DEP_PATH}/gettext-0.18.3.2/build/lib/libintl.${SHARED_EXT}"
   COMPILED_GETTEXT_CFLAGS="-I${DEP_PATH}/gettext-0.18.3.2/build-x86_64/include"
   COMPILED_GETTEXT_LDFLAGS="-L${DEP_PATH}/gettext-0.18.3.2/build/lib/ -lintl"
   COMPILED_GETTEXT_STATIC_LDFLAGS="${DEP_PATH}/gettext-0.18.3.2/build/lib/libintl.a"

   GETTEXT_CFLAGS=$COMPILED_GETTEXT_CFLAGS
   GETTEXT_LDFLAGS=$COMPILED_GETTEXT_LDFLAGS
   GETTEXT_FILES=$COMPILED_GETTEXT_FILES
   GETTEXT_STATIC_LDFLAGS=$COMPILED_GETTEXT_STATIC_LDFLAGS
fi

# argtable & pthread is required only on Windows
COMPILED_ARGTABLE_FILES="${DEP_PATH}/argtable2-13/src/argtable2.lib"
COMPILED_PTHREAD_FILES="${DEP_PATH}/pthread-win32/lib/pthreadVC2.lib"
COMPILED_MSVC_FILES="${DEP_PATH}/msvc100/msvcr100.dll ${DEP_PATH}/msvc100/msvcp100.dll"

WITH_COMPONENTS=1
WITH_MANAGER=1
WITH_SERVER=1
WITH_LAUNCHER=1
WITH_INDEXER=1
WITH_INSTALLER=1
WITH_SEARCHER=0
WITH_READER=0
WITH_ANDROID=0
COMPILE_ARGTABLE=0
COMPILE_PTHREAD=0

# --enable-compileall
AC_ARG_ENABLE(compileall,
			  AC_HELP_STRING([--enable-compileall],
			  				 [mark every package for self compilation (default is no)]),
			  [], [enable_compileall=no])
AS_IF([test "x$enable_compileall" = "xyes"], [COMPIL_DEPS=1], [COMPIL_DEPS=0])

if test [ $COMPIL_DEPS -eq 1 ]
then
	COMPILE_GECKO_SDK=1
	COMPILE_ZLIB=1
	COMPILE_XAPIAN=1
	COMPILE_ICU=1
	COMPILE_MICROHTTPD=1
	COMPILE_LZMA=1
	COMPILE_LIBZIM=1
	COMPILE_LIBPUGIXML=1
	COMPILE_LIBCTPP2=1
	COMPILE_ARIA2=1
	COMPILE_UUID=1
	WITH_LAUNCHER=1
	WITH_SERVER=1
	WITH_ANDROID=1
	WITH_READER=1
	WITH_SEARCHER=1
	REQUIRE_STATIC=1
elif test [ $IS_WIN -eq 1 ]
then
	COMPILE_GECKO_SDK=1
	COMPILE_ZLIB=1
	COMPILE_XAPIAN=1
	COMPILE_ICU=1
	COMPILE_MICROHTTPD=1
	COMPILE_LZMA=1
	COMPILE_LIBZIM=1
	COMPILE_LIBPUGIXML=1
	COMPILE_LIBCTPP2=1
	COMPILE_ARIA2=1
	COMPILE_UUID=0
	COMPILE_ARGTABLE=1
	COMPILE_PTHREAD=1
	WITH_LAUNCHER=1
	WITH_SERVER=1
	WITH_INDEXER=1
	REQUIRE_STATIC=1
else
	COMPIL_DEPS=0
	REQUIRE_STATIC=0
fi

####################################################
############ Optional packages
####################################################

# enable this to compile binaries (CLI) staticaly
AC_ARG_ENABLE(staticbins,
			  AC_HELP_STRING([--enable-staticbins],
			  				 [compile CLI binaries staticaly (default is no)]),
			  [], [enable_staticbins=$STATIC_BINS])
AS_IF([test "x$enable_staticbins" = "xyes" -o "x$enable_staticbins" = "x1" ], [STATIC_BINS=1], [STATIC_BINS=0])

# manager is a command line to to build library
AC_ARG_ENABLE(manager,
			  AC_HELP_STRING([--enable-manager],
			  				 [compile manager (default is no)]),
			  [], [enable_manager=$WITH_MANAGER])
AS_IF([test "x$enable_manager" = "xyes" -o "x$enable_manager" = "x1" ], [WITH_MANAGER=1], [WITH_MANAGER=0])

# HTTP server
AC_ARG_ENABLE(server,
			  AC_HELP_STRING([--enable-server],
			  				 [compile HTTP server (default is yes)]),
			  [], [enable_server=$WITH_SERVER])
AS_IF([test "x$enable_server" = "xyes" -o "x$enable_server" = "x1" ], [WITH_SERVER=1], [WITH_SERVER=0])

# static launcher
AC_ARG_ENABLE(launcher,
			  AC_HELP_STRING([--enable-launcher],
			  				 [compile launcher for static (default is yes)]),
			  [], [enable_launcher=$WITH_LAUNCHER])
AS_IF([test "x$enable_launcher" = "xyes" -o "x$enable_launcher" = "x1" ], [WITH_LAUNCHER=1], [WITH_LAUNCHER=0])

# zim indexer is a command line tool to create xapian index
AC_ARG_ENABLE(indexer,
			  AC_HELP_STRING([--enable-indexer],
			  				 [compile indexer (default is no)]),
			  [], [enable_indexer=$WITH_INDEXER])
AS_IF([test "x$enable_indexer" = "xyes" -o "x$enable_indexer" = "x1" ], [WITH_INDEXER=1], [WITH_INDEXER=0])

# installer is GUI on windows or command line on linux
AC_ARG_ENABLE(installer,
			  AC_HELP_STRING([--enable-installer],
			  				 [compile installer (default is no)]),
			  [], [enable_installer=$WITH_INSTALLER])
AS_IF([test "x$enable_installer" = "xyes" -o "x$enable_installer" = "x1" ], [WITH_INSTALLER=1], [WITH_INSTALLER=0])

# searcher is a command line binary to test search engine
AC_ARG_ENABLE(searcher,
			  AC_HELP_STRING([--enable-searcher],
			  				 [compile searcher (default is no)]),
			  [], [enable_searcher=$WITH_SEARCHER])
AS_IF([test "x$enable_searcher" = "xyes" -o "x$enable_searcher" = "x1" ], [WITH_SEARCHER=1], [WITH_SEARCHER=0])

# reader is a command line tool
AC_ARG_ENABLE(reader,
			  AC_HELP_STRING([--enable-reader],
			  				 [compile reader (default is no)]),
			  [], [enable_reader=$WITH_READER])
AS_IF([test "x$enable_reader" = "xyes" -o "x$enable_reader" = "x1" ], [WITH_READER=1], [WITH_READER=0])

# HTTP server
AC_ARG_ENABLE(components,
			  AC_HELP_STRING([--enable-components],
			  				 [compile gecko components (default is yes)]),
			  [], [enable_components=$WITH_COMPONENTS])
AS_IF([test "x$enable_components" = "xyes" -o "x$enable_components" = "x1" ], [WITH_COMPONENTS=1], [WITH_COMPONENTS=0])

# android version
AC_ARG_ENABLE(android,
			  AC_HELP_STRING([--enable-android],
			  				 [compile android version (default is no)]),
			  [], [enable_android=$WITH_ANDROID])
AS_IF([test "x$enable_android" = "xyes" -o "x$enable_android" = "x1" ], [WITH_ANDROID=1], [WITH_ANDROID=0])

# all enables all optional tools
AC_ARG_ENABLE(all,
			  AC_HELP_STRING([--enable-all],
			  				 [compile all optionnal tools (default is no)]),
			  [], [enable_all=no])
AS_IF([test "x$enable_all" = "xyes"], [WITH_LAUNCHER=1;WITH_INDEXER=1;WITH_INSTALLER=1;WITH_SEARCHER=1;WITH_READER=1;WITH_MANAGER=1;WITH_SERVER=1;WITH_COMPONENTS=1], [])

# --enable-oldicu
AC_ARG_ENABLE(oldicu,
			  AC_HELP_STRING([--enable-oldicu],
			  				 [download and use ICU 4.4 of latest (default is no)]),
			  [], [enable_oldicu=$IS_OLD_ICU])
AS_IF([test "x$enable_oldicu" = "xyes" -o "x$enable_oldicu" = "x1" ], [IS_OLD_ICU=1], [IS_OLD_ICU=0])

# --enable-oldgcc for GCC < 3.4 without char16_t (fedora9 for sugar)
AC_ARG_ENABLE(oldgcc,
			  AC_HELP_STRING([--enable-oldgcc],
			  				 [gcc has no support for char16_t (default is no)]),
			  [], [enable_oldgcc=$IS_OLD_GCC])
AS_IF([test "x$enable_oldgcc" = "xyes" -o "x$enable_oldgcc" = "x1" ], [IS_OLD_GCC=1], [IS_OLD_GCC=0])

# extra includes allow to specify extra -I paths
AC_ARG_WITH(extra-includes,
            [  --with-extra-includes=DIR:DIR	PATH like list of folder to add to include lookup],
            export CPATH="${withval}")

# add debug symbols
AC_ARG_WITH([debug],
			AC_HELP_STRING([--with-debug],
						   [add debug symbols]),
		    CFLAGS="${CFLAGS} -g3 -O0 -Wall -W -ansi"; CXXFLAGS="${CXXFLAGS} -g3 -O0 -Wall -W -ansi")

# add limited debug symbols
AC_ARG_WITH([minor-debug],
			AC_HELP_STRING([--with-minor-debug],
						   [add minor debug symbols]),
		    CFLAGS="${CFLAGS} -g3 -O0"; CXXFLAGS="${CXXFLAGS} -g3 -O0")

# test hardening
AC_ARG_WITH([hardening],
			AC_HELP_STRING([--with-hardening],
						   [add hardening flags]),
		    CXXFLAGS="${CXXFLAGS} -D_FORTIFY_SOURCE=2 ")

# manager is a command line to to build library
AC_ARG_ENABLE(ldcheck,
			  AC_HELP_STRING([--enable-ldcheck],
			  				 [enable ld check for unresolved dependencies (default is yes)]),
							 [], [enable_ldchecks=yes])
 							 AS_IF([test "x$enable_ldchecks" = "xyes"], [], [CHECK_LDFLAGS=""])

# move chrome content to a jar file
AC_ARG_ENABLE(jar,
			  AC_HELP_STRING([--enable-jar],
			  				 [pack chrome contents to jar files (default is no)]),
			  [], [enable_jar=$JAR_CONTENT])
AS_IF([test "x$enable_jar" = "xyes" -o "x$enable_jar" = "x1" ], [JAR_CONTENT=1], [JAR_CONTENT=0])

# apply debian cleaning rules
AC_ARG_ENABLE(debian,
			  AC_HELP_STRING([--enable-debian],
			  				 [apply Debian packaging cleaning rules (default is no)]),
			  [], [enable_debian=$DEBIAN_RULES])
AS_IF([test "x$enable_debian" = "xyes" -o "x$enable_debian" = "x1" ], [DEBIAN_RULES=1], [DEBIAN_RULES=0])

# TODO
#if test [ $WITH_MANAGER -eq 1 -o $WITH_SERVER -eq 1 -o $WITH_LAUNCHER -eq 1 -o $WITH_INDEXER -eq 1 -o $WITH_INSTALLER -eq 1 -o $WITH_SEARCHER -eq 1 -o $WITH_READER -eq 1 ] ; then
#	REQUIRE_STATIC=1
#else
#	REQUIRE_STATIC=0
#fi

####################################################
############ GECKO SDK
####################################################

# --enable-old-gecko
AC_ARG_ENABLE(oldgecko,
			  AC_HELP_STRING([--enable-oldgecko],
			  				 [download and use Gecko SDK 1.9.2 instead of latest (default is no)]),
			  [], [enable_oldgecko=no])
AS_IF([test "x$enable_oldgecko" = "xyes"], [IS_OLD_GECKO=1], [IS_OLD_GECKO=0])

AC_ARG_WITH(gecko-sdk,
            AC_HELP_STRING([--with-gecko-sdk=DIR], [Gecko SDK path]),
            GECKO_SDK_PATH=`echo "${withval}"`)

if test [ "$GECKO_SDK_PATH" != "" -a "$GECKO_SDK_PATH" != "$SELF" ]
then
	GECKO_SDK_PATH=`cd ${GECKO_SDK_PATH} && pwd || echo ""`
fi

# try to find installed gecko-sdk. default to SELF
if test [ "$GECKO_SDK_PATH" = "" ]
then
    GECKO_SDK_PATH=`pkg-config --variable=sdkdir libxul`
    if test [ ! "$GECKO_SDK_PATH" ]
    then
        GECKO_SDK_PATH=$SELF
    fi
fi

if test [ "$GECKO_SDK_PATH" = "$SELF" -o $COMPILE_GECKO_SDK -eq 1 ]
then
    COMPILE_GECKO_SDK=1
    GECKO_SDK_PATH=$COMPILED_GECKO_SDK_PATH
fi

if test [ $IS_OSX -eq 1 ] ; then
	GECKO_INCLUDE_PATH="${GECKO_SDK_PATH}/i386/include"
	GECKO_SDK_INCLUDE="${GECKO_SDK_PATH}/i386/sdk/include"
	GECKO_SDK_LIB="${GECKO_SDK_PATH}/${ARCH}/lib"
	GECKO_IDL_PATH=${GECKO_SDK_PATH}/i386/idl
	XPIDL_PATH=${GECKO_SDK_PATH}/i386/sdk/bin
else
	GECKO_INCLUDE_PATH="${GECKO_SDK_PATH}/include"
	GECKO_SDK_INCLUDE="${GECKO_SDK_PATH}/sdk/include"
	GECKO_SDK_LIB="${GECKO_SDK_PATH}/sdk/lib"
	GECKO_IDL_PATH=${GECKO_SDK_PATH}/idl
	XPIDL_PATH=${GECKO_SDK_PATH}/sdk/bin
fi

#GCC# -std=gnu++0x
#CLANG# -stdlib=libstdc++ -std=c++11
if test [ $IS_OSX -eq 1 ]
then
  CXXFLAGS="${CXXFLAGS} -stdlib=libstdc++ -std=c++11 -fexceptions -DMOZ_CPP_EXCEPTIONS -DMOZ_NO_MOZALLOC"
else
  CXXFLAGS="${CXXFLAGS} -std=gnu++0x -fexceptions -DMOZ_CPP_EXCEPTIONS -DMOZ_NO_MOZALLOC"
fi

# Gecko version
for FILE in mozilla-config64.h mozilla-config32.h mozilla-config.h
do
    if [[ -f "${GECKO_INCLUDE_PATH}/${FILE}" ]]
    then
	GECKO_VERSION=`grep MOZILLA_VERSION_U "${GECKO_INCLUDE_PATH}/${FILE}" | cut -d " " -f 3 | cut -d "." -f 1`
	MAJOR_GECKO_VERSION=`grep MOZILLA_VERSION_U "${GECKO_INCLUDE_PATH}/${FILE}" | cut -d " " -f 3 | cut -d "." -f1,2`
	EXACT_GECKO_VERSION=`grep MOZILLA_VERSION_U "${GECKO_INCLUDE_PATH}/${FILE}" | cut -d " " -f 3`
    fi

    if [[ ! "${GECKO_VERSION}" = "" ]]
    then
	break
    fi
done

if [[ "${GECKO_VERSION}" = "" ]]
then
    ErrorOrWarning "$COMPILE_GECKO_SDK" "unable to determine Gecko SDK version"
fi
let GECKO_VERSION=GECKO_VERSION

if [[ ${GECKO_VERSION} -lt 2 ]]
then
	XPIDL_PATH="${GECKO_SDK_PATH}/bin"
else
	if [[ ${GECKO_VERSION} -lt 10 ]]
	then
		GECKO_OLD_BOOL_TYPE=1
	fi

	if [[ ${GECKO_VERSION} -lt 17 ]]
	then
		GECKO_OLD_INT_TYPE=1
	fi
fi

AC_MSG_RESULT(checking for Gecko version... ${GECKO_VERSION})
AM_CONDITIONAL([GECKO_OLD_BOOL_TYPE], [test "$GECKO_OLD_BOOL_TYPE"])
AM_CONDITIONAL([GECKO_OLD_INT_TYPE], [test "$GECKO_OLD_INT_TYPE"])

LIBXUL_CFLAGS="-I${GECKO_SDK_INCLUDE} -I${GECKO_INCLUDE_PATH} -I${GECKO_INCLUDE_PATH}/nspr/ -I/usr/include/nspr4 -fshort-wchar"
if test [ $IS_OSX -eq 0 ]; then
LIBXUL_CFLAGS+=" -D__STDC_LIMIT_MACROS"
fi
# replaced -lxpcomglue_s with libxpcomglue_s_nomozalloc.a to prevent
# undefined symbols. supposed to be compatible wth 1.9.
# -lmozalloc ${GECKO_SDK_LIB}/libxpcomglue_s.a
if test [ $IS_OSX -eq 1 ] ; then
LIBXUL_LDFLAGS="-L${GECKO_SDK_LIB} ${GECKO_SDK_LIB}/libxpcomglue_s_nomozalloc.a ${GECKO_SDK_LIB}/XUL"
else
# LIBXUL_LDFLAGS="-L${GECKO_SDK_LIB} -lxul -lxpcom -lplds4 -lplc4 -lnspr4 -lpthread -ldl -lxpcomglue_s"
LIBXUL_LDFLAGS="-L${GECKO_SDK_LIB} -lxul -lplds4 -lplc4 -lnspr4 -lpthread -ldl ${GECKO_SDK_LIB}/libxpcomglue_s.a"
fi

if test [ ! -f "$GECKO_IDL_PATH/nsISupports.idl" ]
then
    ErrorOrWarning "$COMPILE_GECKO_SDK" "unable to find nsISupports.idl"
fi

AC_CHECK_TOOL(HAVE_XPIDL, "xpidl", [], $XPIDL_PATH)
if test [ "$HAVE_XPIDL" ]
then
    AC_PATH_PROG([XPIDL], "xpidl", [],  $XPIDL_PATH)
else
    # SDK 0.9 and further do not have an xpidl binary anymore
    # This is replace by the python script typelib.py and header.py
    AC_PATH_PROG([PYTHON], "python")
    if test [ ! "$PYTHON" ]
    then
             AC_MSG_ERROR([[cannot find python]])
    fi

    if test [ ! -f "$XPIDL_PATH/header.py" -o ! -f "$XPIDL_PATH/typelib.py" ]
    then
        ErrorOrWarning "$COMPILE_GECKO_SDK" "unable to find either the xpidl binary or the typelib.py or header.py scripts in '$XPIDL_PATH' directory."
    fi

    HEADER_PY="$PYTHON $XPIDL_PATH/header.py"
    TYPELIB_PY="$PYTHON $XPIDL_PATH/typelib.py"
fi

# special flags for XPCOM components
XPCOM_LDFLAGS="-Xcompiler -shared -Wl"

if test [ $IS_OLD_GCC -eq 1 ] ; then
XPCOM_CFLAGS="-fPIC"
else
XPCOM_CFLAGS="-fno-rtti -fPIC"
fi

####################################################
############ ZLIB
####################################################

# if --with-x, add path to LIBRARY_PATH
AC_ARG_WITH(z,
			AC_HELP_STRING([--with-z=DIR], [alternate location for zlib]),
			  	export LIBRARY_PATH="${withval}:${LIBRARY_PATH}";ZLIB_PATH=${withval})

# if --with-static-x, set path as X_ARCHIVE
AC_ARG_WITH(static-z,
            AC_HELP_STRING([--with-static-z=DIR/libx.a],
            			   [Path to static archive]),
            ZLIB_ARCHIVE=${withval})

# compilation required
if test [ $COMPILE_ZLIB -eq 1 -o "$ZLIB_PATH" == "$SELF" -o "$ZLIB_ARCHIVE" == "$SELF"] ; then
    COMPILE_ZLIB=1
    ZLIB_CFLAGS=$COMPILED_ZLIB_CFLAGS
    ZLIB_LDFLAGS=$COMPILED_ZLIB_LDFLAGS
    ZLIB_FILES=$COMPILED_ZLIB_FILES
    ZLIB_STATIC_LDFLAGS=$COMPILED_ZLIB_STATIC_LDFLAGS
else
	# look for shared library.
	AC_CHECK_HEADER([zlib.h],, [AC_MSG_ERROR([[cannot find zlib header]])])
	AC_CHECK_LIB([z], [zlibVersion],, [AC_MSG_ERROR([[cannot find zlib]]);COMPILE_ZLIB=1])
	ZLIB_FILES=`findLibrary "libz.${SHARED_EXT}"`

	# if static is required
	if test [ $REQUIRE_STATIC -eq 1 ] ; then
		AC_CHECK_FILE($ZLIB_ARCHIVE, [ZLIB_ARCHIVE_FOUND=1], [ZLIB_ARCHIVE_FOUND=0])
		AUTO_ZLIB_ARCHIVE=`findLibrary "libz.a"`

		if test [ $ZLIB_ARCHIVE_FOUND -eq 0 -a "$AUTO_ZLIB_ARCHIVE" == "no" ] ; then
			# can't stat files. force compile
  			COMPILE_ZLIB=1
			ZLIB_CFLAGS=$COMPILED_ZLIB_CFLAGS
		    ZLIB_LDFLAGS=$COMPILED_ZLIB_LDFLAGS
			ZLIB_FILES=$COMPILED_ZLIB_FILES
			ZLIB_STATIC_LDFLAGS=$COMPILED_ZLIB_STATIC_LDFLAGS
  		elif test [ $ZLIB_ARCHIVE_FOUND -eq 1 ] ; then
			# can stat suplied file.
  			ZLIB_STATIC_LDFLAGS="${ZLIB_ARCHIVE}"
  		else
  			# can stat auto file
  			ZLIB_STATIC_LDFLAGS="${AUTO_ZLIB_ARCHIVE}"
  		fi
  	fi
fi

####################################################
############ XAPIAN
####################################################

# if --with-x, add path to LIBRARY_PATH
AC_ARG_WITH(xapian,
			AC_HELP_STRING([--with-xapian=DIR], [alternate location for xapian-config]),
			  	export LIBRARY_PATH="${withval}:${LIBRARY_PATH}";XAPIAN_PATH=${withval})

# if --with-static-x, set path as X_ARCHIVE
AC_ARG_WITH(static-xapian,
            AC_HELP_STRING([--with-static-xapian=DIR/libx.a],
            			   [Path to static archive]),
            XAPIAN_ARCHIVE=${withval})

# compilation required
if test [ $COMPILE_XAPIAN -eq 1 -o "$XAPIAN_PATH" == "$SELF" -o "$XAPIAN_ARCHIVE" == "$SELF" ]
then
	COMPILE_XAPIAN=1
	XAPIAN_CFLAGS=$COMPILED_XAPIAN_CFLAGS
	XAPIAN_LDFLAGS=$COMPILED_XAPIAN_LDFLAGS
	XAPIAN_FILES=$COMPILED_XAPIAN_FILES
	XAPIAN_STATIC_LDFLAGS=$COMPILED_XAPIAN_STATIC_LDFLAGS
	XAPIAN_COMPACT=$COMPILED_XAPIAN_COMPACT
else
	# look for shared library.
	AC_CHECK_TOOL(HAVE_XAPIAN_CONFIG, xapian-config,, "${XAPIAN_PATH}:${PATH}")
	if test [ ! "$HAVE_XAPIAN_CONFIG" ]
	then
		AC_MSG_ERROR([[cannot find xapian-config]])
	else
		OLDPATH=$PATH
		PATH="${XAPIAN_PATH}:${PATH}"
		XAPIAN_CFLAGS=`xapian-config --cxxflags`;
		XAPIAN_LDFLAGS=`xapian-config --ltlibs`;
		XAPIAN_FILES=`findLibrary "libxapian.${SHARED_EXT}"`
		PATH=$OLDPATH
	fi

	AC_CHECK_TOOL([XAPIAN_COMPACT],[xapian-compact],[])
	XAPIAN_COMPACT=`which $XAPIAN_COMPACT`
	if test [ ! "$XAPIAN_COMPACT" ]
	then
	     AC_MSG_ERROR([[cannot find xapian-compact]])
	fi

	# if static is required
	if test [ $REQUIRE_STATIC -eq 1 ] ; then
		AC_CHECK_FILE($XAPIAN_ARCHIVE, [XAPIAN_ARCHIVE_FOUND=1], [XAPIAN_ARCHIVE_FOUND=0])
		AUTO_XAPIAN_ARCHIVE=`findLibrary "libxapian.a"`

		if test [ $XAPIAN_ARCHIVE_FOUND -eq 0 -a "$AUTO_XAPIAN_ARCHIVE" == "no" ] ; then
			# can't stat files. force compile
  			COMPILE_XAPIAN=1
			XAPIAN_CFLAGS=$COMPILED_XAPIAN_CFLAGS
			XAPIAN_LDFLAGS=$COMPILED_XAPIAN_LDFLAGS
			XAPIAN_FILES=$COMPILED_XAPIAN_FILES
			XAPIAN_STATIC_LDFLAGS=$COMPILED_XAPIAN_STATIC_LDFLAGS
			XAPIAN_COMPACT=$COMPILED_XAPIAN_COMPACT
  		elif test [ $XAPIAN_ARCHIVE_FOUND -eq 1 ] ; then
			# can stat suplied file.
  			XAPIAN_STATIC_LDFLAGS="${XAPIAN_ARCHIVE}"
  		else
  			# can stat auto file
  			XAPIAN_STATIC_LDFLAGS="${AUTO_XAPIAN_ARCHIVE}"
  		fi
  	fi
fi

####################################################
############ ICU
####################################################

# if --with-x, add path to LIBRARY_PATH
AC_ARG_WITH(icu,
			AC_HELP_STRING([--with-icu=DIR], [alternate location for icu-config]),
			  	export LIBRARY_PATH="${withval}:${LIBRARY_PATH}";ICU_PATH=${withval})

# if --with-static-x, set path as X_ARCHIVE
AC_ARG_WITH(static-icu,
            AC_HELP_STRING([--with-static-icu=DIR],
            			   [Path to static archives folder]),
            ICU_ARCHIVE=${withval})

# compilation required
if test [ $COMPILE_ICU -eq 1 -o "$ICU_PATH" == "$SELF" -o "$ICU_ARCHIVE" == "$SELF"] ; then
	COMPILE_ICU=1
	ICU_CFLAGS=$COMPILED_ICU_CFLAGS
	ICU_LDFLAGS=$COMPILED_ICU_LDFLAGS
	ICU_FILES=$COMPILED_ICU_FILES
	ICU_STATIC_LDFLAGS=$COMPILED_ICU_STATIC_LDFLAGS
else
	# look for shared library.
	# AC_CHECK_HEADER([zlib.h],, [AC_MSG_ERROR([[cannot find zlib header]])])
	# AC_CHECK_LIB([z], [zlibVersion],, [AC_MSG_ERROR([[cannot find zlib]]);COMPILE_ICU=1])
	# ICU_FILES=`findLibrary "libicuuc.${SHARED_EXT}"`

	AC_CHECK_TOOL(HAVE_ICU_CONFIG, icu-config,, "${ICU_PATH}:${PATH}")
	if test [ ! "$HAVE_ICU_CONFIG" ]
	then
	     AC_MSG_ERROR([[cannot find icu-config]])
	else
	    OLDPATH=$PATH
	    PATH="${ICU_PATH}:${PATH}"
	    ICU_CFLAGS=`icu-config --cxxflags`;
	    ICU_LDFLAGS=`icu-config --ldflags`;
	    ICU_VER=`icu-config --version`;
	    ICU_FILES="`findLibrary "libicuuc.${SHARED_EXT}"` `findLibrary "libicudata.${SHARED_EXT}"` `findLibrary "libicui18n.${SHARED_EXT}"`"
	    PATH=$OLDPATH
	    if [[ $ICU_VER \< "4.2" ]]
		then
		     AC_MSG_ERROR([[You need a version of libicu >= 4.2]])
		fi
	fi

	# if static is required
	if test [ $REQUIRE_STATIC -eq 1 ] ; then
		AC_CHECK_FILE("$ICU_ARCHIVE/libicuuc.a", [ICU_ARCHIVE_FOUND=1], [ICU_ARCHIVE_FOUND=0])
		AUTO_ICU_ARCHIVE=`findLibrary "libicuuc.a"`

		if test [ $ICU_ARCHIVE_FOUND -eq 0 -a "$AUTO_ICU_ARCHIVE" == "no" ] ; then
			# can't stat files. force compile
  			COMPILE_ICU=1
			ICU_CFLAGS=$COMPILED_ICU_CFLAGS
		    ICU_LDFLAGS=$COMPILED_ICU_LDFLAGS
			ICU_FILES=$COMPILED_ICU_FILES
			ICU_STATIC_LDFLAGS=$COMPILED_ICU_STATIC_LDFLAGS
  		elif test [ $ICU_ARCHIVE_FOUND -eq 1 ] ; then
			# can stat suplied file.
  			ICU_STATIC_LDFLAGS="$ICU_ARCHIVE/libicuuc.a $ICU_ARCHIVE/libicudata.a $ICU_ARCHIVE/libicui18n.a"
  		else
  			# can stat auto file
  			ICU_STATIC_LDFLAGS="`findLibrary 'libicuuc.a'` `findLibrary 'libicudata.a'` `findLibrary 'libicui18n.a'`"
  		fi
  	fi
fi

####################################################
############ MICROHTTPD (SERVER only)
####################################################

# if --with-x, add path to LIBRARY_PATH
AC_ARG_WITH(microhttpd,
			AC_HELP_STRING([--with-microhttpd=DIR], [alternate location for microhttpd]),
			  	export LIBRARY_PATH="${withval}:${LIBRARY_PATH}";MICROHTTPD_PATH=${withval})

# if --with-static-x, set path as X_ARCHIVE
AC_ARG_WITH(static-microhttpd,
            AC_HELP_STRING([--with-static-microhttpd=DIR/libx.a],
            			   [Path to static archive]),
            MICROHTTPD_ARCHIVE=${withval})

# compilation required
if test [ $COMPILE_MICROHTTPD -eq 1 -o "$MICROHTTPD_PATH" == "$SELF" -o "$MICROHTTPD_ARCHIVE" == "$SELF"] ; then
	COMPILE_MICROHTTPD=1
	MICROHTTPD_CFLAGS=$COMPILED_MICROHTTPD_CFLAGS
	MICROHTTPD_LDFLAGS=$COMPILED_MICROHTTPD_LDFLAGS
	MICROHTTPD_FILES=$COMPILED_MICROHTTPD_FILES
	MICROHTTPD_STATIC_LDFLAGS=$COMPILED_MICROHTTPD_STATIC_LDFLAGS
elif test [ $WITH_SERVER -eq 1 ]
then
	# look for shared library.
	AC_CHECK_HEADER([microhttpd.h],, [AC_MSG_ERROR([[cannot find microhttpd header]])])
	AC_CHECK_LIB([microhttpd], [MHD_start_daemon],, [AC_MSG_ERROR([[cannot find microhttpd]])])

	# Check the libmicrohttpd version
	`pkg-config --atleast-version="0.4.0" libmicrohttpd`
	MICROHTTPD_VERSION_OK=$?
	if test [ ! $MICROHTTPD_VERSION_OK -eq 0 ]
	then
		AC_MSG_ERROR([[The libmicrohttpd version must be 0.4.0 or higher.]])
	fi
	MICROHTTPD_FILES=`findLibrary "libmicrohttpd.${SHARED_EXT}"`

	# if static is required
	if test [ $REQUIRE_STATIC -eq 1 ] ; then
		AC_CHECK_FILE($MICROHTTPD_ARCHIVE, [MICROHTTPD_ARCHIVE_FOUND=1], [MICROHTTPD_ARCHIVE_FOUND=0])
		AUTO_MICROHTTPD_ARCHIVE=`findLibrary "libmicrohttpd.a"`

		if test [ $MICROHTTPD_ARCHIVE_FOUND -eq 0 -a "$AUTO_MICROHTTPD_ARCHIVE" == "no" ] ; then
			# can't stat files. force compile
  			COMPILE_MICROHTTPD=1
			MICROHTTPD_CFLAGS=$COMPILED_MICROHTTPD_CFLAGS
		    MICROHTTPD_LDFLAGS=$COMPILED_MICROHTTPD_LDFLAGS
			MICROHTTPD_FILES=$COMPILED_MICROHTTPD_FILES
			MICROHTTPD_STATIC_LDFLAGS=$COMPILED_MICROHTTPD_STATIC_LDFLAGS
  		elif test [ $MICROHTTPD_ARCHIVE_FOUND -eq 1 ] ; then
			# can stat suplied file.
  			MICROHTTPD_STATIC_LDFLAGS="${MICROHTTPD_ARCHIVE}"
  		else
  			# can stat auto file
  			MICROHTTPD_STATIC_LDFLAGS="${AUTO_MICROHTTPD_ARCHIVE}"
  		fi
  	fi
fi

####################################################
############ LZMA
####################################################

# if --with-x, add path to LIBRARY_PATH
AC_ARG_WITH(lzma,
			AC_HELP_STRING([--with-lzma=DIR], [alternate location for lzma]),
			  	export LIBRARY_PATH="${withval}:${LIBRARY_PATH}";LZMA_PATH=${withval})

# if --with-static-x, set path as X_ARCHIVE
AC_ARG_WITH(static-lzma,
            AC_HELP_STRING([--with-static-lzma=DIR/libx.a],
            			   [Path to static archive]),
            LZMA_ARCHIVE=${withval})

# compilation required
if test [ $COMPILE_LZMA -eq 1 -o "$LZMA_PATH" == "$SELF" -o "$LZMA_ARCHIVE" == "$SELF"] ; then
	COMPILE_LZMA=1
	LZMA_CFLAGS=$COMPILED_LZMA_CFLAGS
    LZMA_LDFLAGS=$COMPILED_LZMA_LDFLAGS
	LZMA_FILES=$COMPILED_LZMA_FILES
	LZMA_STATIC_LDFLAGS=$COMPILED_LZMA_STATIC_LDFLAGS
else
	# look for shared library.
	AC_CHECK_HEADER([lzma.h],, [AC_MSG_ERROR([[cannot find lzma header]])])
	AC_CHECK_LIB([lzma], [lzma_version_string],, [AC_MSG_ERROR([[cannot find lzma]])])

	# Check the liblzma version
	`pkg-config --atleast-version="0.4.0" liblzma`
	LZMA_VERSION_OK=$?
	if test [ ! $LZMA_VERSION_OK -eq 0 ]
	then
		AC_MSG_ERROR([[The liblzma version must be 0.4.0 or higher.]])
	fi
	LZMA_FILES=`findLibrary "liblzma.${SHARED_EXT}"`

	# if static is required
	if test [ $REQUIRE_STATIC -eq 1 ] ; then
		AC_CHECK_FILE($LZMA_ARCHIVE, [LZMA_ARCHIVE_FOUND=1], [LZMA_ARCHIVE_FOUND=0])
		AUTO_LZMA_ARCHIVE=`findLibrary "liblzma.a"`

		if test [ $LZMA_ARCHIVE_FOUND -eq 0 -a "$AUTO_LZMA_ARCHIVE" == "no" ] ; then
			# can't stat files. force compile
  			COMPILE_LZMA=1
			LZMA_CFLAGS=$COMPILED_LZMA_CFLAGS
		    LZMA_LDFLAGS=$COMPILED_LZMA_LDFLAGS
			LZMA_FILES=$COMPILED_LZMA_FILES
			LZMA_STATIC_LDFLAGS=$COMPILED_LZMA_STATIC_LDFLAGS
  		elif test [ $LZMA_ARCHIVE_FOUND -eq 1 ] ; then
			# can stat suplied file.
  			LZMA_STATIC_LDFLAGS="${LZMA_ARCHIVE}"
  		else
  			# can stat auto file
  			LZMA_STATIC_LDFLAGS="${AUTO_LZMA_ARCHIVE}"
  		fi
  	fi
fi

####################################################
############ LIBZIM
####################################################

# if --with-x, add path to LIBRARY_PATH
AC_ARG_WITH(libzim,
			AC_HELP_STRING([--with-libzim=DIR], [alternate location for libzim]),
			  	export LIBRARY_PATH="${withval}:${LIBRARY_PATH}";LIBZIM_PATH=${withval})

# if --with-static-x, set path as X_ARCHIVE
AC_ARG_WITH(static-libzim,
            AC_HELP_STRING([--with-static-libzim=DIR/libx.a],
            			   [Path to static archive]),
            LIBZIM_ARCHIVE=${withval})

# compilation required
if test [ $COMPILE_LIBZIM -eq 1 -o "$LIBZIM_PATH" == "$SELF" -o "$LIBZIM_ARCHIVE" == "$SELF"] ; then
	COMPILE_LIBZIM=1
	LIBZIM_CFLAGS=$COMPILED_LIBZIM_CFLAGS
    LIBZIM_LDFLAGS=$COMPILED_LIBZIM_LDFLAGS
	LIBZIM_FILES=$COMPILED_LIBZIM_FILES
	LIBZIM_STATIC_LDFLAGS=$COMPILED_LIBZIM_STATIC_LDFLAGS
else
	# look for shared library.
	AC_CHECK_HEADER([zim/zim.h],, [AC_MSG_ERROR([[cannot find libzim header]])])
	AC_CHECK_LIB([zim], [zim_MD5Init],, [AC_MSG_ERROR([[cannot find libzim]])])

	# Check the liblibzim version
	`pkg-config --atleast-version="1.1" libzim`
	LIBZIM_VERSION_OK=$?
	if test [ ! $LIBZIM_VERSION_OK -eq 0 ]
	then
		# TODO: uncomment once we release it with pkg-config file
		# AC_MSG_ERROR([[The libzim version must be 1.1 or higher.]])
		echo "Assuming libzim version is 1.1"
	else
		LIBZIM_CFLAGS=`pkg-config --cflags libzim`
		LIBZIM_LDFLAGS=`pkg-config --libs libzim`
	fi
	LIBZIM_FILES=`findLibrary "libzim.${SHARED_EXT}"`

	# if static is required
	if test [ $REQUIRE_STATIC -eq 1 ] ; then
		AC_CHECK_FILE($LIBZIM_ARCHIVE, [LIBZIM_ARCHIVE_FOUND=1], [LIBZIM_ARCHIVE_FOUND=0])
		AUTO_LIBZIM_ARCHIVE=`findLibrary "libzim.a"`

		if test [ $LIBZIM_ARCHIVE_FOUND -eq 0 -a "$AUTO_LIBZIM_ARCHIVE" == "no" ] ; then
			# can't stat files. force compile
  			COMPILE_LIBZIM=1
			LIBZIM_CFLAGS=$COMPILED_LIBZIM_CFLAGS
		    LIBZIM_LDFLAGS=$COMPILED_LIBZIM_LDFLAGS
			LIBZIM_FILES=$COMPILED_LIBZIM_FILES
			LIBZIM_STATIC_LDFLAGS=$COMPILED_LIBZIM_STATIC_LDFLAGS
  		elif test [ $LIBZIM_ARCHIVE_FOUND -eq 1 ] ; then
			# can stat suplied file.
  			LIBZIM_STATIC_LDFLAGS="${LIBZIM_ARCHIVE}"
  		else
  			# can stat auto file
  			LIBZIM_STATIC_LDFLAGS="${AUTO_LIBZIM_ARCHIVE}"
  		fi
  	fi
fi

####################################################
############ PUGIXML
####################################################

# if --with-x, add path to LIBRARY_PATH
AC_ARG_WITH(libpugixml,
			AC_HELP_STRING([--with-libpugixml=DIR], [alternate location for libpugixml]),
			  	export LIBRARY_PATH="${withval}:${LIBRARY_PATH}";LIBPUGIXML_PATH=${withval})

# if --with-static-x, set path as X_ARCHIVE
AC_ARG_WITH(static-libpugixml,
            AC_HELP_STRING([--with-static-libpugixml=DIR/libx.a],
            			   [Path to static archive]),
            LIBPUGIXML_ARCHIVE=${withval})

# compilation required
if test [ $COMPILE_LIBPUGIXML -eq 1 -o "$LIBPUGIXML_PATH" == "$SELF" -o "$LIBPUGIXML_ARCHIVE" == "$SELF"] ; then
	COMPILE_LIBPUGIXML=1
	LIBPUGIXML_CFLAGS=$COMPILED_LIBPUGIXML_CFLAGS
    LIBPUGIXML_LDFLAGS=$COMPILED_LIBPUGIXML_LDFLAGS
	LIBPUGIXML_FILES=$COMPILED_LIBPUGIXML_FILES
	LIBPUGIXML_STATIC_LDFLAGS=$COMPILED_LIBPUGIXML_STATIC_LDFLAGS
else
	# look for shared library.
	AC_CHECK_HEADER([pugixml.hpp],, [AC_MSG_ERROR([[cannot find libpugixml header]])])
	AC_CHECK_LIB([pugixml], [_init],, [AC_MSG_ERROR([[cannot find libpugixml]])])

	# Check the liblibpugixml version
	`pkg-config --atleast-version="1.2" libpugixml`
	LIBPUGIXML_VERSION_OK=$?
	if test [ ! $LIBPUGIXML_VERSION_OK -eq 0 ]
	then
		# TODO: uncomment once we release it with pkg-config file
		# AC_MSG_ERROR([[The libpugixml version must be 1.1 or higher.]])
		echo "Assuming libzim version is 1.2"
	else
		LIBPUGIXML_CFLAGS=`pkg-config --cflags libpugixml`
		LIBPUGIXML_LDFLAGS=`pkg-config --libs libpugixml`
	fi
	LIBPUGIXML_FILES=`findLibrary "libpugixml.${SHARED_EXT}"`

	# if static is required
	if test [ $REQUIRE_STATIC -eq 1 ] ; then
		AC_CHECK_FILE($LIBPUGIXML_ARCHIVE, [LIBPUGIXML_ARCHIVE_FOUND=1], [LIBPUGIXML_ARCHIVE_FOUND=0])
		AUTO_LIBPUGIXML_ARCHIVE=`findLibrary "libpugixml.a"`

		if test [ $LIBPUGIXML_ARCHIVE_FOUND -eq 0 -a "$AUTO_LIBPUGIXML_ARCHIVE" == "no" ] ; then
			# can't stat files. force compile
  			COMPILE_LIBPUGIXML=1
			LIBPUGIXML_CFLAGS=$COMPILED_LIBPUGIXML_CFLAGS
		    LIBPUGIXML_LDFLAGS=$COMPILED_LIBPUGIXML_LDFLAGS
			LIBPUGIXML_FILES=$COMPILED_LIBPUGIXML_FILES
			LIBPUGIXML_STATIC_LDFLAGS=$COMPILED_LIBPUGIXML_STATIC_LDFLAGS
  		elif test [ $LIBPUGIXML_ARCHIVE_FOUND -eq 1 ] ; then
			# can stat suplied file.
  			LIBPUGIXML_STATIC_LDFLAGS="${LIBPUGIXML_ARCHIVE}"
  		else
  			# can stat auto file
  			LIBPUGIXML_STATIC_LDFLAGS="${AUTO_LIBPUGIXML_ARCHIVE}"
  		fi
  	fi
fi

####################################################
############ CTPP2
####################################################

# if --with-x, add path to LIBRARY_PATH
AC_ARG_WITH(libctpp2,
			AC_HELP_STRING([--with-libctpp2=DIR], [alternate location for libctpp2]),
			  	export LIBRARY_PATH="${withval}:${LIBRARY_PATH}";LIBCTPP2_PATH=${withval})

# if --with-static-x, set path as X_ARCHIVE
AC_ARG_WITH(static-libctpp2,
            AC_HELP_STRING([--with-static-libctpp2=DIR/libx.a],
            			   [Path to static archive]),
            LIBCTPP2_ARCHIVE=${withval})

# compilation required
if test [ $COMPILE_LIBCTPP2 -eq 1 -o "$LIBCTPP2_PATH" == "$SELF" -o "$LIBCTPP2_ARCHIVE" == "$SELF" ]
then
	COMPILE_LIBCTPP2=1
	LIBCTPP2_CFLAGS=$COMPILED_LIBCTPP2_CFLAGS
	LIBCTPP2_LDFLAGS=$COMPILED_LIBCTPP2_LDFLAGS
	LIBCTPP2_FILES=$COMPILED_LIBCTPP2_FILES
	LIBCTPP2_STATIC_LDFLAGS=$COMPILED_LIBCTPP2_STATIC_LDFLAGS
else
	# look for shared library.
	AC_CHECK_HEADER([ctpp2/CTPP2GlobalDefines.h],, [AC_MSG_ERROR([[cannot find libctpp2 header]])])
	AC_CHECK_LIB([ctpp2], [_init],, [AC_MSG_ERROR([[cannot find libctpp2]])])

	# Check the liblibctpp2 version
	`pkg-config --atleast-version="2.8.3" libctpp2`
	LIBCTPP2_VERSION_OK=$?
	if test [ ! $LIBCTPP2_VERSION_OK -eq 0 ]
	then
		# TODO: uncomment once we release it with pkg-config file
		# AC_MSG_ERROR([[The libctpp2 version must be 1.1 or higher.]])
		echo "Assuming libctpp2 version is 2.8.3"
                AC_CHECK_TOOL(HAVE_CTPP2_CONFIG, "ctpp2-config", [], $CTPP2_CONFIG_PATH)
                if test [ "$HAVE_CTPP2_CONFIG" ]
                then
                       LIBCTPP2_CFLAGS=`ctpp2-config --includes2`
                       LIBCTPP2_LDFLAGS=-L`ctpp2-config --libs`
                fi
	else
		LIBCTPP2_CFLAGS=`pkg-config --cflags libctpp2`
		LIBCTPP2_LDFLAGS=`pkg-config --libs libctpp2`
	fi
	LIBCTPP2_FILES=`findLibrary "libctpp2.${SHARED_EXT}"`

	# if static is required
	if test [ $REQUIRE_STATIC -eq 1 ] ; then
		AC_CHECK_FILE($LIBCTPP2_ARCHIVE, [LIBCTPP2_ARCHIVE_FOUND=1], [LIBCTPP2_ARCHIVE_FOUND=0])
		AUTO_LIBCTPP2_ARCHIVE=`findLibrary "libctpp2.a"`

		if test [ $LIBCTPP2_ARCHIVE_FOUND -eq 0 -a "$AUTO_LIBCTPP2_ARCHIVE" == "no" ] ; then
			# can't stat files. force compile
  			COMPILE_LIBCTPP2=1
			LIBCTPP2_CFLAGS=$COMPILED_LIBCTPP2_CFLAGS
			LIBCTPP2_LDFLAGS=$COMPILED_LIBCTPP2_LDFLAGS
			LIBCTPP2_FILES=$COMPILED_LIBCTPP2_FILES
			LIBCTPP2_STATIC_LDFLAGS=$COMPILED_LIBCTPP2_STATIC_LDFLAGS
  		elif test [ $LIBCTPP2_ARCHIVE_FOUND -eq 1 ] ; then
			# can stat suplied file.
  			LIBCTPP2_STATIC_LDFLAGS="${LIBCTPP2_ARCHIVE}"
  		else
  			# can stat auto file
  			LIBCTPP2_STATIC_LDFLAGS="${AUTO_LIBCTPP2_ARCHIVE}"
  		fi
  	fi
fi

####################################################
############ ARIA2
####################################################

# if --with-static-x, set path as X_ARCHIVE
AC_ARG_WITH(aria2,
            AC_HELP_STRING([--with-aria2=DIR/aria2c],
            			   [Path to aria2c binary]),
            ARIA2_ARCHIVE=${withval})

# if no static argument, check for lib on system (which may contain the --with-x= path)
if test [ "$ARIA2_ARCHIVE" == "" -a $COMPILE_ARIA2 -eq 0 ]
then
	# fail if none found.
	AC_CHECK_TOOL([ARIA2_BIN],[aria2c],[])
	if [[ "$ARIA2_BIN" = "" ]];
	then
		AC_MSG_ERROR([aria2c is required.])
    fi
    # ARIA2_LDFLAGS=`which aria2c`
    ARIA2_BIN=`which aria2c`
# static argument supplied
else
	# if argument is SELF, add to compile queue
	if test [ "$ARIA2_ARCHIVE" == "$SELF" -o $COMPILE_ARIA2 -eq 1 ]
	then
	    COMPILE_ARIA2=1
	    # ARIA2_LDFLAGS=$COMPILED_ARIA2_LDFLAGS
	    ARIA2_FILES=$COMPILED_ARIA2_FILES
	# if path provided, test file existence (and fail)
	else
		# ARIA2_LDFLAGS=`readlink -f $ARIA2_ARCHIVE`
		AC_CHECK_FILE($ARIA2_ARCHIVE,,[AC_MSG_ERROR([[cannot stat aria2 archive at $ARIA2_ARCHIVE]])])
		ARIA2_BIN=$ARIA2_ARCHIVE
	fi
fi
if test [ "$ARIA2_BIN" ];
then
	ARIA2C_VERSION=`${ARIA2_BIN} -v | grep "aria2 version" | cut -d' ' -f3`
	ARIA2C_VERSION_CHK=`${ARIA2_BIN} -v | grep "aria2 version" | cut -d' ' -f3 | cut -d. -f-2 | sed "s/\.//"`
	AC_MSG_RESULT(checking for aria2c version... ${ARIA2C_VERSION})
	if [[ ${ARIA2C_VERSION_CHK} -lt 114 ]]
	then
		AC_MSG_ERROR([aria2c is too old, you need version 1.14 or newer.])
	fi
	ARIA2_FILES=$ARIA2_BIN
fi

####################################################
############ UUID
####################################################

# if --with-static-x, set path as X_ARCHIVE
AC_ARG_WITH(static-uuid,
            AC_HELP_STRING([--with-static-uuid=DIR/libx.a],
            			   [Path to static archive]),
            UUID_ARCHIVE=${withval})

# compilation required
if test [ $COMPILE_UUID -eq 1 -o "$UUID_PATH" == "$SELF" -o "$UUID_ARCHIVE" == "$SELF"] ; then
	COMPILE_UUID=1
	UUID_CFLAGS=$COMPILED_UUID_CFLAGS
	UUID_LDFLAGS=$COMPILED_UUID_LDFLAGS
	UUID_FILES=$COMPILED_UUID_FILES
	UUID_STATIC_LDFLAGS=$COMPILED_UUID_STATIC_LDFLAGS
elif test [ $WITH_SERVER -eq 1 ] ; then
	# if static is required
	if test [ $REQUIRE_STATIC -eq 1 ] ; then
		AC_CHECK_FILE($UUID_ARCHIVE, [UUID_ARCHIVE_FOUND=1], [UUID_ARCHIVE_FOUND=0])
		AUTO_UUID_ARCHIVE=`findLibrary "libuuid.a"`

		if test [ $UUID_ARCHIVE_FOUND -eq 0 -a "$AUTO_UUID_ARCHIVE" == "no" ] ; then
			# can't stat files. force compile
  			COMPILE_UUID=1
			UUID_CFLAGS=$COMPILED_UUID_CFLAGS
			UUID_LDFLAGS=$COMPILED_UUID_LDFLAGS
			UUID_FILES=$COMPILED_UUID_FILES
			UUID_STATIC_LDFLAGS=$COMPILED_UUID_STATIC_LDFLAGS
  		elif test [ $UUID_ARCHIVE_FOUND -eq 1 ] ; then
			# can stat suplied file.
  			UUID_STATIC_LDFLAGS="${UUID_ARCHIVE}"
  		else
  			# can stat auto file
  			UUID_STATIC_LDFLAGS="${AUTO_UUID_ARCHIVE}"
  		fi
  	fi
fi

####################################################
############ STATIC BINARIES COMMON
####################################################

if test [ $STATIC_BINS -eq 1 -a $IS_OSX -eq 0 ]
then
	# libm
	STATIC_LIBM_ARCHIVE=`findLibrary "libm.a"`
	if test [ "$STATIC_LIBM_ARCHIVE" == "no" ] ; then
		AC_MSG_ERROR([Unable to find libm.a])
	fi

	# librt
	STATIC_LIBRT_ARCHIVE=`findLibrary "librt.a"`
	if test [ "$STATIC_LIBRT_ARCHIVE" == "no" ] ; then
		AC_MSG_ERROR([Unable to find librt.a])
	fi

	# libstdc++
	STATIC_LIBSTDCPP_ARCHIVE=`findLibrary "libstdc++.a"`
	if test [ "$STATIC_LIBSTDCPP_ARCHIVE" == "no" ] ; then
		AC_MSG_ERROR([Unable to find libstdc++.a])
	fi

	# libstdc++
	STATIC_LIBDL_ARCHIVE=`findLibrary "libdl.a"`
	if test [ "$STATIC_LIBDL_ARCHIVE" == "no" ] ; then
		AC_MSG_ERROR([Unable to find libdl.a])
	fi

	# libgcc
	STATIC_LIBGCC_ARCHIVE=`findLibrary "libgcc.a"`
	if test [ "$STATIC_LIBGCC_ARCHIVE" == "no" ] ; then
		AC_MSG_ERROR([Unable to find libgcc.a])
	fi

	# libpthread
	STATIC_LIBPTHREAD_ARCHIVE=`findLibrary "libpthread.a"`
	if test [ "$STATIC_LIBPTHREAD_ARCHIVE" == "no" ] ; then
		AC_MSG_ERROR([Unable to find libpthread.a])
	fi

fi

####################################################
############ SRC/DEPENDENCIES Makefile
####################################################

DEP_LIST=""

if test [ $COMPILE_LZMA -eq 1 ]
then
    DEP_LIST+=" $COMPILED_LZMA_FILES"
fi
EMBED_LIBS+=" $LZMA_FILES"

if test [ $COMPILE_LIBZIM -eq 1 ]
then
    DEP_LIST+=" $COMPILED_LIBZIM_FILES"
fi
EMBED_LIBS+=" $LIBZIM_FILES"

if test [ $COMPILE_LIBPUGIXML -eq 1 ]
then
    DEP_LIST+=" $COMPILED_LIBPUGIXML_FILES"
fi
EMBED_LIBS+=" $LIBPUGIXML_FILES"

if test [ $COMPILE_LIBCTPP2 -eq 1 ]
then
    DEP_LIST+=" $COMPILED_LIBCTPP2_FILES"
fi
EMBED_LIBS+=" $LIBCTPP2_FILES"

if test [ $COMPILE_GECKO_SDK -eq 1 -a $IS_ARM -eq 0 ]
then
    DEP_LIST+=" $COMPILED_GECKO_SDK_PATH"
    DEP_LIST+=" $XULRUNNER_RUNTIME_PATH"
fi

if test [ $WITH_ANDROID -eq 1 ]
then
	if test [ "$HAVE_CONVERT_BIN" = "" ]
	then
		AC_MSG_ERROR([Unable to find convert (imagemagick)])
	fi
	if test [ "$HAVE_PYTHON_REQUESTS" = "" ]
	then
		AC_MSG_WARN([[Unable to find python-requests (pip install requests)]])
	fi
	if test [ "$HAVE_PYTHON_BEAUTIFULSOUP" = "" ]
	then
		AC_MSG_WARN([[Unable to find python beautifulsoup v4 (pip install python-bs4)]])
	fi
	if test [ "$HAVE_JAVA_BIN" = "" ]
	then
		AC_MSG_ERROR([Unable to find java])
	fi
	if test [ "$HAVE_JAVAH_BIN" = "" ]
	then
		AC_MSG_ERROR([Unable to find javah])
	fi
	if test [ "$HAVE_JARSIGNER_BIN" = "" ]
	then
		AC_MSG_ERROR([Unable to find jarsigner])
	fi
    DEP_LIST+=" $ANDROID_DEPS"
fi

if test [ $COMPILE_ZLIB -eq 1 ]
then
    DEP_LIST+=" $COMPILED_ZLIB_FILES"
fi
EMBED_LIBS+=" $ZLIB_FILES"

if test [ $COMPILE_XAPIAN -eq 1 ]
then
    DEP_LIST+=" $COMPILED_XAPIAN_FILES"
fi
EMBED_LIBS+=" $XAPIAN_FILES"

if test [ $COMPILE_ICU -eq 1 ]
then
    DEP_LIST+=" $COMPILED_ICU_FILES"
fi
EMBED_LIBS+=" $ICU_FILES"

if test [ $COMPILE_MICROHTTPD -eq 1 ]
then
    DEP_LIST+=" $COMPILED_MICROHTTPD_FILES"
fi
EMBED_LIBS+=" $MICROHTTPD_FILES"

if test [ $COMPILE_ARIA2 -eq 1 -a $IS_ARM -eq 0 ]
then
    DEP_LIST+=" $COMPILED_ARIA2_FILES"
fi

if test [ $COMPILE_UUID -eq 1 ]
then
    DEP_LIST+=" $COMPILED_UUID_FILES"
fi

if test [ $COMPILE_ARGTABLE -eq 1 ]
then
    DEP_LIST+=" $COMPILED_ARGTABLE_FILES"
fi

if test [ $COMPILE_PTHREAD -eq 1 ]
then
    DEP_LIST+=" $COMPILED_PTHREAD_FILES"
fi

if test [ $IS_WIN -eq 1 ]
then
    DEP_LIST+=" $COMPILED_MSVC_FILES"
fi

if test [ $COMPILE_LIBICONV -eq 1 ]
then
    DEP_LIST+=" $COMPILED_LIBICONV_FILES"
fi

if test [ $COMPILE_GETTEXT -eq 1 ]
then
    DEP_LIST+=" $COMPILED_GETTEXT_FILES"
fi

if test [ $IS_OSX -eq 1 ] ; then
	DEP_LIST+=" $COMPILED_XULRUNNERBIN_FILES"
	DEP_LIST+=" $COMPILED_ICUDATA_DAT"
	EMBED_LIBS+=" $COMPILED_ICUDATA_DAT"
fi

DEP_LIST=`echo $DEP_LIST | sed -e "s,$DEP_PATH/,,g"`

####################################################
############ DEPENDENCIES MIRROR
####################################################

# sets URI to dependencies mirror
AC_ARG_WITH(mirror,
			AC_HELP_STRING([--with-mirror=URI], [alternate location for dependencies download]),
			  			   DEP_MIRROR=${withval})

# sets URI to dependencies mirror
AC_ARG_WITH(downloader,
			AC_HELP_STRING([--with-downloader=(wget|curl|command)], [alternate download tool (default is wget)]),
			  			   DOWNLOADERREQ=${withval})

# wget is default
echo "$DOWNLOADERREQ"
if test [ "$DOWNLOADERREQ" = "" -o "$DOWNLOADERREQ" = "wget" ]
then
	DOWNLOADER="wget --wait=10 --timeout=600 --retry-connrefused --no-check-certificate -c"
	wgetvers=`wget -V | head -n 1 | cut -f 3 -d " " | cut -f 1,2 -d "."`
	if [ test $IS_WIN -eq 0 -a `echo "$wgetvers >= 1.13" | bc` -eq 1 ]
	then
		DOWNLOADER="$DOWNLOADER --no-use-server-timestamps"
	fi
	DOWNLOADER="$DOWNLOADER -O"
elif test [ "$DOWNLOADERREQ" = "curl" ]
then
	DOWNLOADER="curl -L -C - --retry 10 --retry-delay 10 -o"
else
	DOWNLOADER=$DOWNLOADERREQ
fi

####################################################
############ CODE SIGNING
####################################################

# --enable-signature
AC_ARG_ENABLE(signature,
			  AC_HELP_STRING([--enable-signature],
			  				 [Code Sign the resulting build (OSX only) (default is no)]),
			  [], [enable_signature=no])
AS_IF([test "x$enable_signature" = "xyes"], [SIGN_BUILD=1], [SIGN_BUILD=0])

# sets URI to dependencies mirror
AC_ARG_WITH(certificate,
			AC_HELP_STRING([--with-certificate=(wget|curl|command)], [Specify a custome certificate Common Name (default is Kiwix one)]),
			  			   CERTIFICATE=${withval})

# Only OSX for now
if test [ "$CERTIFICATE" = "" ]
then
	CERTIFICATE=$DEFAULT_CERTIFICATE
fi

####################################################
############ EXPORTS & OUTPUT
####################################################

# defines for compilation of zimlib
AC_DEFINE_UNQUOTED(CLUSTER_CACHE_SIZE, 16, [set zim cluster cache size to number of cached chunks])
AC_DEFINE_UNQUOTED(DIRENT_CACHE_SIZE, 512, [set zim dirent cache size to number of cached chunks])
AC_DEFINE_UNQUOTED(LZMA_MEMORY_SIZE, 128, [set lzma uncompress memory size to number of MB])
AC_DEFINE(ENABLE_LZMA, [1], [defined if lzma compression is enabled])

# export variables
#CXXFLAGS=" -arch x86_64 $CXXFLAGS"
AC_SUBST(CPATH)
AC_SUBST(CXXFLAGS)
AC_SUBST(CURRENT_PATH)
AC_SUBST(COMPIL_DEPS)
AC_SUBST(STATIC_TMP)
AC_SUBST(DISTDEBIAN_TMP)
AC_SUBST(SUGAR_TMP)
AC_SUBST(SUGAR_VERSION)
AC_SUBST(EMBED_LIBS)
AC_SUBST(IS_WIN)
AC_SUBST(IS_OSX)
AC_SUBST(IS_LINUX)
AC_SUBST(IS_POSIX)
AC_SUBST(DEP_LIST)
AC_SUBST(IS_64B)
AC_SUBST(IS_ARM)
AC_SUBST(ARCH)
AC_SUBST(DEP_PATH)
AC_SUBST(IS_OLD_GECKO)
AC_SUBST(IS_OLD_ICU)
AC_SUBST(SERVER_BIN)
AC_SUBST(STATIC_BINS)
AC_SUBST(DEP_MIRROR)
AC_SUBST(DOWNLOADER)
AC_SUBST(CHECK_LDFLAGS)
AC_SUBST(SHARED_EXT)
AC_SUBST(JAR_CONTENT)
AC_SUBST(DEBIAN_RULES)
AC_SUBST(IS_OLD_GCC)
AC_SUBST(CL_VERSION)

AC_SUBST(XPCOM_CFLAGS)
AC_SUBST(XPCOM_LDFLAGS)

AM_CONDITIONAL([COMPIL_DEPS], [test $COMPIL_DEPS -eq 1])
AM_CONDITIONAL([IS_WIN], [test $IS_WIN -eq 1])
AM_CONDITIONAL([IS_OSX], [test $IS_OSX -eq 1])
AM_CONDITIONAL([IS_LINUX], [test $IS_LINUX -eq 1])
AM_CONDITIONAL([IS_POSIX], [test $IS_POSIX -eq 1])

AM_CONDITIONAL([WITH_COMPONENTS], [test $WITH_COMPONENTS -eq 1])
AM_CONDITIONAL([WITH_MANAGER], [test $WITH_MANAGER -eq 1])
AM_CONDITIONAL([WITH_SERVER], [test $WITH_SERVER -eq 1])
AM_CONDITIONAL([WITH_LAUNCHER], [test $WITH_LAUNCHER -eq 1])
AM_CONDITIONAL([WITH_INDEXER], [test $WITH_INDEXER -eq 1])
AM_CONDITIONAL([WITH_INSTALLER], [test $WITH_INSTALLER -eq 1])
AM_CONDITIONAL([WITH_SEARCHER], [test $WITH_SEARCHER -eq 1])
AM_CONDITIONAL([WITH_READER], [test $WITH_READER -eq 1])
AM_CONDITIONAL([WITH_ANDROID], [test $WITH_ANDROID -eq 1])
AM_CONDITIONAL([IS_OLD_GECKO], [test $IS_OLD_GECKO -eq 1])
AM_CONDITIONAL([IS_OLD_ICU], [test $IS_OLD_ICU -eq 1])
AM_CONDITIONAL([STATIC_BINS], [test $STATIC_BINS -eq 1])
AM_CONDITIONAL([JAR_CONTENT], [test $JAR_CONTENT -eq 1])
AM_CONDITIONAL([DEBIAN_RULES], [test $DEBIAN_RULES -eq 1])
AM_CONDITIONAL([IS_OLD_GCC], [test $IS_OLD_GCC -eq 1])

AC_SUBST(WITH_COMPONENTS)
AC_SUBST(WITH_MANAGER)
AC_SUBST(WITH_SERVER)
AC_SUBST(WITH_LAUNCHER)
AC_SUBST(WITH_INDEXER)
AC_SUBST(WITH_INSTALLER)
AC_SUBST(WITH_SEARCHER)
AC_SUBST(WITH_READER)
AC_SUBST(WITH_ANDROID)

AC_SUBST(GECKO_SDK_PATH)
AC_SUBST(XULRUNNER_RUNTIME_PATH)
AC_SUBST(COMPILE_GECKO_SDK)
AC_SUBST(GECKO_VERSION)
AC_SUBST(MAJOR_GECKO_VERSION)
AC_SUBST(EXACT_GECKO_VERSION)
AC_SUBST(GECKO_IDL_PATH)
AC_SUBST(LIBXUL_CFLAGS)
AC_SUBST(LIBXUL_LDFLAGS)
AM_CONDITIONAL([HAVE_XPIDL], [test "$HAVE_XPIDL"])
AC_SUBST(XPIDL)
AC_SUBST(HEADER_PY)
AC_SUBST(TYPELIB_PY)

AC_SUBST(ZLIB_CFLAGS)
AC_SUBST(ZLIB_LDFLAGS)
AC_SUBST(ZLIB_STATIC_LDFLAGS)
AC_SUBST(COMPILE_ZLIB)
AC_SUBST(ZLIB_FILES)

AC_SUBST(XAPIAN_CFLAGS)
AC_SUBST(XAPIAN_LDFLAGS)
AC_SUBST(XAPIAN_STATIC_LDFLAGS)
AC_SUBST(COMPILE_XAPIAN)
AC_SUBST(XAPIAN_FILES)
AC_SUBST(XAPIAN_COMPACT)

AC_SUBST(ICU_CFLAGS)
AC_SUBST(ICU_LDFLAGS)
AC_SUBST(ICU_STATIC_LDFLAGS)
AC_SUBST(COMPILE_ICU)
AC_SUBST(ICU_FILES)
AC_SUBST(COMPILED_ICUDATA_DAT)

AC_SUBST(MICROHTTPD_CFLAGS)
AC_SUBST(MICROHTTPD_LDFLAGS)
AC_SUBST(MICROHTTPD_STATIC_LDFLAGS)
AC_SUBST(COMPILE_MICROHTTPD)
AC_SUBST(MICROHTTPD_FILES)

AC_SUBST(LZMA_CFLAGS)
AC_SUBST(LZMA_LDFLAGS)
AC_SUBST(LZMA_STATIC_LDFLAGS)
AC_SUBST(COMPILE_LZMA)
AC_SUBST(LZMA_FILES)

AC_SUBST(LIBZIM_CFLAGS)
AC_SUBST(LIBZIM_LDFLAGS)
AC_SUBST(LIBZIM_STATIC_LDFLAGS)
AC_SUBST(COMPILE_LIBZIM)
AC_SUBST(LIBZIM_FILES)

AC_SUBST(LIBPUGIXML_CFLAGS)
AC_SUBST(LIBPUGIXML_LDFLAGS)
AC_SUBST(LIBPUGIXML_STATIC_LDFLAGS)
AC_SUBST(COMPILE_LIBPUGIXML)
AC_SUBST(LIBPUGIXML_FILES)

AC_SUBST(LIBCTPP2_CFLAGS)
AC_SUBST(LIBCTPP2_LDFLAGS)
AC_SUBST(LIBCTPP2_STATIC_LDFLAGS)
AC_SUBST(COMPILE_LIBCTPP2)
AC_SUBST(LIBCTPP2_FILES)

AC_SUBST(ARIA2_CFLAGS)
AC_SUBST(ARIA2_LDFLAGS)
AC_SUBST(COMPILE_ARIA2)
AC_SUBST(ARIA2_FILES)

AC_SUBST(UUID_CFLAGS)
AC_SUBST(UUID_LDFLAGS)
AC_SUBST(UUID_STATIC_LDFLAGS)
AC_SUBST(COMPILE_UUID)
AC_SUBST(UUID_FILES)

AC_SUBST(COMPILED_ARGTABLE_FILES)
AC_SUBST(COMPILED_PTHREAD_FILES)

AC_SUBST(STATIC_LIBM_ARCHIVE)
AC_SUBST(STATIC_LIBRT_ARCHIVE)
AC_SUBST(STATIC_LIBSTDCPP_ARCHIVE)
AC_SUBST(STATIC_LIBDL_ARCHIVE)
AC_SUBST(STATIC_LIBGCC_ARCHIVE)
AC_SUBST(STATIC_LIBPTHREAD_ARCHIVE)

AC_SUBST(HAVE_UPX)

# OSX XR binary
AC_SUBST(COMPILED_XULRUNNERBIN_FILES)

AM_CONDITIONAL([SIGN_BUILD], [test $SIGN_BUILD -eq 1])
AC_SUBST(CERTIFICATE)

# Configure the output files
AC_CONFIG_FILES([
  Makefile
  src/Makefile
  src/man/Makefile
  src/man/fr/Makefile
  src/dependencies/Makefile

  src/components/Makefile
  src/components/xapianAccessor/Makefile
  src/components/zimAccessor/Makefile
  src/components/zimXapianIndexer/Makefile
  src/components/contentManager/Makefile
  src/components/serverManager/Makefile

  src/launcher/Makefile
  src/server/Makefile
  src/manager/Makefile
  src/indexer/Makefile
  src/searcher/Makefile
  src/reader/Makefile
  src/installer/Makefile
  kiwix/Makefile
  kiwix/chrome/Makefile
  kiwix/defaults/Makefile
  kiwix/components/Makefile
  desktop/Makefile
  desktop/8x8/Makefile
  desktop/16x16/Makefile
  desktop/22x22/Makefile
  desktop/24x24/Makefile
  desktop/32x32/Makefile
  desktop/48x48/Makefile
  desktop/256x256/Makefile
  static/Makefile
  etc/Makefile
])

AC_PROG_INSTALL
AC_OUTPUT

####################################################
############ NOTICE
####################################################
# using the binary echo program instead of shell function
# since OSX default (SH) does not support -n.
BINECHO=`which echo`
$BINECHO ""
$BINECHO "Build details:"
$BINECHO -n "ARCH				" ; $BINECHO $ARCH
$BINECHO -n "IS_64B				" ; yesno $IS_64B
$BINECHO -n "IS_ARM				" ; yesno $IS_ARM
$BINECHO -n "IS_POSIX			" ; yesno $IS_POSIX
$BINECHO -n "IS_LINUX			" ; yesno $IS_LINUX
$BINECHO -n "IS_OSX				" ; yesno $IS_OSX
$BINECHO -n "IS_WIN				" ; yesno $IS_WIN
$BINECHO -n "IS_OLD_GECKO			" ; yesno $IS_OLD_GECKO
$BINECHO -n "IS_OLD_ICU			" ; yesno $IS_OLD_ICU
$BINECHO -n "IS_OLD_GCC			" ; yesno $IS_OLD_GCC
$BINECHO -n "COMPIL_DEPS			" ; yesno $COMPIL_DEPS
$BINECHO -n "WITH_COMPONENTS			" ; yesno $WITH_COMPONENTS
$BINECHO -n "STATIC_BINS			" ; yesno $STATIC_BINS
$BINECHO -n "WITH_MANAGER			" ; yesno $WITH_MANAGER
$BINECHO -n "WITH_SERVER			" ; yesno $WITH_SERVER
$BINECHO -n "WITH_LAUNCHER			" ; yesno $WITH_LAUNCHER
$BINECHO -n "WITH_INDEXER			" ; yesno $WITH_INDEXER
$BINECHO -n "WITH_INSTALLER			" ; yesno $WITH_INSTALLER
$BINECHO -n "WITH_SEARCHER			" ; yesno $WITH_SEARCHER
$BINECHO -n "WITH_READER			" ; yesno $WITH_READER
$BINECHO -n "JAR_CONTENT			" ; yesno $JAR_CONTENT
$BINECHO -n "DEBIAN_RULES			" ; yesno $DEBIAN_RULES
$BINECHO -n "SIGN_BUILD			" ; yesno $SIGN_BUILD
$BINECHO -n "CERTIFICATE			" ; $BINECHO $CERTIFICATE
echo ""
$BINECHO -n "GECKO_VERSION			" ; $BINECHO $GECKO_VERSION
$BINECHO -n "MAJOR_GECKO_VERSION		" ; $BINECHO $MAJOR_GECKO_VERSION
$BINECHO -n "EXACT_GECKO_VERSION		" ; $BINECHO $EXACT_GECKO_VERSION
echo ""
$BINECHO -n "DEP_MIRROR			" ; $BINECHO $DEP_MIRROR
$BINECHO -n "DOWNLOADER			" ; $BINECHO $DOWNLOADER
$BINECHO -n "DEP_LIST			" ; $BINECHO $DEP_LIST
echo ""
$BINECHO -n "EMBED_LIBS			" ; $BINECHO $EMBED_LIBS
echo ""
$BINECHO -n "CC				" ; $BINECHO $CC
$BINECHO -n "CXX				" ; $BINECHO $CXX
$BINECHO -n "CPP				" ; $BINECHO $CPP
$BINECHO -n "CXXCPP				" ; $BINECHO $CXXCPP
$BINECHO -n "CFLAGS				" ; $BINECHO $CFLAGS
$BINECHO -n "CXXFLAGS			" ; $BINECHO $CXXFLAGS
$BINECHO -n "XPCOM_CFLAGS			" ; $BINECHO $XPCOM_CFLAGS
$BINECHO -n "CHECK_LDFLAGS			" ; $BINECHO $CHECK_LDFLAGS
$BINECHO ""
$BINECHO -n "GECKO_SDK_PATH			" ; $BINECHO $GECKO_SDK_PATH
$BINECHO -n "XULRUNNER_RUNTIME_PATH		" ; $BINECHO $XULRUNNER_RUNTIME_PATH
$BINECHO -n "ZLIB_LDFLAGS			" ; $BINECHO $ZLIB_LDFLAGS
$BINECHO -n "XAPIAN_LDFLAGS			" ; $BINECHO $XAPIAN_LDFLAGS
$BINECHO -n "MICROHTTPD_LDFLAGS		" ; $BINECHO $MICROHTTPD_LDFLAGS
$BINECHO -n "LZMA_LDFLAGS			" ; $BINECHO $LZMA_LDFLAGS
$BINECHO -n "LIBZIM_LDFLAGS			" ; $BINECHO $LIBZIM_LDFLAGS
$BINECHO -n "LIBPUGIXML_LDFLAGS		" ; $BINECHO $LIBPUGIXML_LDFLAGS
$BINECHO -n "LIBCTPP2_LDFLAGS		" ; $BINECHO $LIBCTPP2_LDFLAGS
$BINECHO -n "ARIA2_FILES			" ; $BINECHO $ARIA2_FILES
$BINECHO -n "ICU_LDFLAGS			" ; $BINECHO $ICU_LDFLAGS
$BINECHO -n "XAPIAN_COMPACT			" ; $BINECHO $XAPIAN_COMPACT
$BINECHO -n "UUID_LDFLAGS			" ; $BINECHO $UUID_LDFLAGS
echo ""
$BINECHO -n "ZLIB_STATIC_LDFLAGS		" ; $BINECHO $ZLIB_STATIC_LDFLAGS
$BINECHO -n "XAPIAN_STATIC_LDFLAGS		" ; $BINECHO $XAPIAN_STATIC_LDFLAGS
$BINECHO -n "MICROHTTPD_STATIC_LDFLAGS	" ; $BINECHO $MICROHTTPD_STATIC_LDFLAGS
$BINECHO -n "LZMA_STATIC_LDFLAGS		" ; $BINECHO $LZMA_STATIC_LDFLAGS
$BINECHO -n "LIBZIM_STATIC_LDFLAGS		" ; $BINECHO $LIBZIM_STATIC_LDFLAGS
$BINECHO -n "LIBPUGIXML_STATIC_LDFLAGS	" ; $BINECHO $LIBPUGIXML_STATIC_LDFLAGS
$BINECHO -n "LIBCTPP2_STATIC_LDFLAGS		" ; $BINECHO $LIBCTPP2_STATIC_LDFLAGS
$BINECHO -n "UUID_STATIC_LDFLAGS		" ; $BINECHO $UUID_STATIC_LDFLAGS
$BINECHO -n "ICU_STATIC_LDFLAGS		" ; $BINECHO $ICU_STATIC_LDFLAGS
echo ""
$BINECHO -n "STATIC_LIBM_ARCHIVE		" ; $BINECHO $STATIC_LIBM_ARCHIVE
$BINECHO -n "STATIC_LIBRT_ARCHIVE		" ; $BINECHO $STATIC_LIBRT_ARCHIVE
$BINECHO -n "STATIC_LIBSTDCPP_ARCHIVE	" ; $BINECHO $STATIC_LIBSTDCPP_ARCHIVE
$BINECHO -n "STATIC_LIBDL_ARCHIVE		" ; $BINECHO $STATIC_LIBDL_ARCHIVE
$BINECHO -n "STATIC_LIBGCC_ARCHIVE		" ; $BINECHO $STATIC_LIBGCC_ARCHIVE
$BINECHO -n "STATIC_LIBPTHREAD_ARCHIVE	" ; $BINECHO $STATIC_LIBPTHREAD_ARCHIVE
echo ""
$BINECHO -n "HAVE_UPX			" ; yesno $HAVE_UPX

if test $IS_64B -eq 1
then
	$BINECHO ""
	$BINECHO "/!\ When linking static archive (.a file) on 64b system, the archive must have been compiled with -fPIC. If not, compilation will fail with “Bad Value” message."
fi

if [[ $MISSING_SELF_DEPS -eq 1 ]]
then
	$BINECHO "
******************

You have unmet dependencies.
Those dependencies will be downloaded and compiled during the make process.
You NEED to make src/dependencies first THEN re-run configure and make the rest.

******************"
fi
$BINECHO ""
