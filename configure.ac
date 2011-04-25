AC_INIT([kiwix], [0.9])

# Init. of automake
AM_INIT_AUTOMAKE

# Determine a C compiler
AC_PROG_CC

# Determine a C++ compiler
AC_PROG_CXX
AC_CHECK_TOOL(HAVE_CXX, "$CXX")
if test [ ! "$HAVE_CXX" ]
then 
	AC_MSG_ERROR([[cannot find any C++ compiler]])
fi

AC_CHECK_TOOL(HAVE_JAR, cl)

# Check cl.exe
# Check if their is a Perl binary
AC_CHECK_TOOL(HAVE_CL, cl)

# Check the platform
if test [ "$HAVE_CL" ]
then
  IS_WIN=1
fi

# Gecko version
GECKO_VERSION=1

AC_CHECK_PROG(HAVE_XCODE, Xcode, yes, no, [$PATH$PATH_SEPARATOR/Developer/Applications/Xcode.app/Contents/MacOS/$PATH_SEPARATOR])
AM_CONDITIONAL([IS_OSX], [test "$HAVE_XCODE" = yes])
if test [ "$HAVE_XCODE" ]
then
  IS_OSX=1
fi

# Only for POSIX systems
if test [ ! "$IS_WIN" ]
then

  # Chek jar
  AC_CHECK_TOOL([JAR],[jar],[])
  if [[ "$JAR" = "" ]]; then
    AC_MSG_ERROR([jar is required.])
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

  # default $CPPFLAGS and $LDFLAGS
  # CLucene has headers in /usr/lib
  CPPFLAGS="${CPPFLAGS} -I/usr/lib"
  if test "x${CFLAGS}" = "x"; then
    CFLAGS="-O6"
  fi
  CFLAGS="${CFLAGS}"
  LDFLAGS="${LDFLAGS}" 
  LIBS=""
  LD_PATH=""
  LD_LIBRARY_PATH=""

  # Check if the 'pkg-config' binary exists
  AC_CHECK_TOOL(HAVE_PKG_CONFIG, pkg-config)
  if test [ ! "$HAVE_PKG_CONFIG" ]
  then 
    AC_MSG_ERROR([[cannot find pkg-config]])
  fi

fi

# Set current language to C++
AC_LANG(C++)

# Current path
CURRENT_PATH=`pwd`

# Check if their is a Perl binary
AC_CHECK_TOOL(HAVE_PERL, perl)

# Check if user want local dependences
if test [ ! "$IS_WIN" ]
then
  AC_ARG_WITH(dependences, [  --with-dependences      use system or custom libraries, otherwise download them and compile staticaly against them [[default=yes]]], WITH_DEPENDENCES=${withval}, WITH_DEPENDENCES=${withval})
else
  WITH_DEPENDENCES="no"
fi

if test [ "$WITH_DEPENDENCES" = "yes" ]
then
	# Configuration for alternative zlib location
	AC_ARG_WITH(gecko-sdk, [  --with-gecko-sdk=DIR    alternate location for gecko SDK], 
			       GECKO_SDK_PATH=`cd ${withval}; pwd`)

	# Check for in standard way
	if test [ "$GECKO_SDK_PATH" ]
	then
		LIBXUL_CFLAGS="-I${GECKO_SDK_PATH}/sdk/include -I${GECKO_SDK_PATH}/include -fshort-wchar"
		LIBXUL_LDFLAGS="-L${GECKO_SDK_PATH}/sdk/lib -lxpcomglue_s -lxul -lxpcom -lplds4 -lplc4 -lnspr4 -lpthread -ldl"
		GECKO_IDL_PATH=${GECKO_SDK_PATH}/idl
	else
		# Configuration of the libxul
		HAVE_LIBXUL=`pkg-config --exists libxul; echo $(( ($?+1)%2 ))`
		if test [ "$HAVE_LIBXUL" ]
		then				
			LIBXUL_CFLAGS=`pkg-config --cflags libxul`
			LIBXUL_LDFLAGS=`pkg-config --libs libxul`		
		else
			AC_MSG_ERROR([[cannot find libxul (the file libxul.pc is missing)]])
		fi

		# Gecko paths
		GECKO_SDK_PATH=`pkg-config --variable=sdkdir libxul`
		GECKO_IDL_PATH=`pkg-config --variable=idldir libxul`
		AC_CHECK_FILE(${GECKO_IDL_PATH}/stable, GECKO_IDL_PATH=${GECKO_IDL_PATH}/stable,)
	fi

	# Possible to specify the IDL directory and check
	AC_ARG_WITH(gecko-idl, [  --with-gecko-idl=DIR]    path to Gecko IDL files,
			       GECKO_IDL_PATH=`cd ${withval}; pwd`)   
	AC_CHECK_FILE("$GECKO_IDL_PATH/nsISupports.idl", [], AC_MSG_ERROR([[unable to find nsISupports.idl]]))

	# Configuration of xpidl
	XPIDL_PATH=$GECKO_SDK_PATH/bin
	AC_ARG_WITH(xpidl, [  --with-xpidl=DIR        path to XPIDL binary directory],
			   XPIDL_PATH=`cd ${withval}; pwd`)

	AC_CHECK_TOOL(HAVE_XPIDL, "xpidl", [], $XPIDL_PATH)
	if test [ "$HAVE_XPIDL" ]
	then 
		AC_PATH_PROG([XPIDL], "xpidl", [],  $XPIDL_PATH)
	else
		AC_MSG_ERROR([[cannot find the xpidl binary]])
	fi

	# Configuration for alternative zlib location
	AC_ARG_WITH(zlib, [  --with-zlib=DIR         alternate location for zlib],
			  LIBZ_PATH=`cd ${withval}; pwd`; CPPFLAGS="-I${LIBZ_PATH}"; LDFLAGS="-L${LIBZ_PATH}")
	
	# Check the zlib
	AC_CHECK_HEADER([zlib.h],, [AC_MSG_ERROR([[cannot find zlib header]])])
	AC_CHECK_LIB([z], [zlibVersion],, [AC_MSG_ERROR([[cannot find zlib]])])
	if test [ "$LIBZ_PATH" ]
	then
	   LIBZ_CFLAGS="-I${LIBZ_PATH}"
	   LIBZ_LDFLAGS="-L${LIBZ_PATH}"
	fi   
	LIBZ_LDFLAGS="${LIBZ_LDFLAGS} -lz"

	# Configure for libicu
	AC_ARG_WITH(icu, [  --with-icu=DIR          alternate location for icu library],
		  LIBICU_PATH=`cd ${withval}; pwd`; CPPFLAGS="${LIBICU_PATH}"; LDFLAGS="${LDFLAGS}")

	if test [ "$LIBICU_PATH" ]
	then
		LIBICU_CFLAGS="-I${LIBICU_PATH}"
		LIBICU_LDFLAGS="-L${LIBICU_PATH} -licu"
	else
		ICU_CONFIG_PATH="$PATH"
		AC_PATH_PROG([ICU_CONFIG], "icu-config", [], $ICU_CONFIG_PATH)
		if test [ "$ICU_CONFIG" ]
		then
			ICU_VER=`$ICU_CONFIG --version`

			if [[ `icu-config --version` \< "4.2" ]]
			then 
			     AC_MSG_ERROR([[You need a version of libicu >= 4.2]])
			fi

			LIBICU_CFLAGS=`$ICU_CONFIG --cxxflags`
			LIBICU_LDFLAGS=`$ICU_CONFIG --ldflags`
		else
			AC_MSG_ERROR([[cannot find icu-config]])
		fi
	fi

	# Configuration for alternative libclucene location
	AC_ARG_WITH(clucene, [  --with-clucene=DIR      alternate location for the clucene library], LIBCLUCENE_PATH=`cd ${withval}; pwd`)

	# Check the libclucene
	AC_CHECK_HEADER([CLucene.h],, [AC_MSG_ERROR([[cannot find clucene header]])])
	AC_CHECK_LIB([clucene], [open],, [AC_MSG_ERROR([[cannot find clucene]])])

	if test [ "$LIBCLUCENE_PATH" ]
	then
		LIBCLUCENE_CFLAGS="-I${LIBCLUCENE_PATH}"
		LIBCLUCENE_LDFLAGS="-L${LIBCLUCENE_PATH}"
	fi
	LIBCLUCENE_LDFLAGS="${LIBCLUCENE_LDFLAGS} -lclucene"

	# Configuration for alternative xapianlib location
	XAPIAN_CONFIG_PATH="$PATH"
	AC_ARG_WITH(xapian, [  --with-xapian=DIR       alternate location for Xapian library],
			  XAPIAN_CONFIG_PATH="${withval}")

	AC_CHECK_TOOL(HAVE_XAPIAN_CONFIG, xapian-config,, $XAPIAN_CONFIG_PATH)
	if test [ ! "$HAVE_XAPIAN_CONFIG" ]
	then 
	     AC_MSG_ERROR([[cannot find xapian-config]])
	else
	     LIBXAPIAN_CFLAGS=`xapian-config --cxxflags`;
	     LIBXAPIAN_LDFLAGS=`xapian-config --ltlibs`;
	fi

	# Configuration for alternative libmicrohttpd location
	AC_ARG_WITH(microhttpd, [  --with-microhttpd=DIR   alternate location for microhttpd library],
			  LIBMICROHTTPD_PATH=`cd ${withval}; pwd`; CPPFLAGS="${LIBMICROHTTPD_PATH}"; LDFLAGS="${LDFLAGS}")

	# Check the libmicrohttpd
	AC_CHECK_HEADER([microhttpd.h], , [AC_MSG_ERROR([[cannot find microhttpd header]])])
	AC_CHECK_LIB([microhttpd], [MHD_start_daemon],, [AC_MSG_ERROR([[cannot find microhttpd]])])
	if test [ "$LIBMICROHTTPD_PATH" ]
	then
		LIBMICROHTTPD_CFLAGS="-I${LIBMICROHTTPD_PATH}"
		LIBMICROHTTPD_LDFLAGS="-L${LIBMICROHTTPD_PATH}"
	fi
	LIBMICROHTTPD_LDFLAGS="${LIBMICROHTTPD_LDFLAGS} -lmicrohttpd"

	# Check the libmicrohttpd version
	AC_COMPILE_IFELSE([AC_LANG_PROGRAM([[
					#include <stdint.h>
		    		       	#include <stdlib.h>
					#include <stdio.h>
				       	#include <unistd.h>
				       	#include <microhttpd.h>
					]],
                                     	[[
					#if MHD_VERSION >= 0x00040000
					// MHD_VERSION is high enough
					#else
					#  MHD_VERSION is to low
				     	#endif
				     	]])],
					[], [AC_MSG_ERROR([[The libmicrohttpd version must be 0.4.0 or higher.]])])

	# Configuration for alternative liblzma location
	AC_ARG_WITH(lzma, [  --with-lzma=DIR         alternate location for lzma library],
			  LIBLZMA_PATH=`cd ${withval}; pwd`; CPPFLAGS="${LIBLZMA_PATH}"; LDFLAGS="${LDFLAGS}")

	# Check the lzma
	AC_CHECK_HEADER([lzma.h],, [AC_MSG_ERROR([[cannot find lzma header]])])
	AC_CHECK_LIB([lzma], [lzma_code],, [AC_MSG_ERROR([[cannot find lzma]])])
	if test [ "$LIBLZMA_PATH" ]
       	then
		LIBLZMA_CFLAGS="-I${LIBLZNA_PATH}"
		LIBLZMA_LDFLAGS="-L${LIBLZMA_PATH}"
	fi
	LIBLZMA_LDFLAGS="${LIBLZMA_LDFLAGS} -llzma"

	# BINDIST_INTRO_* values
	BINDIST_INTRO_MESSAGE="echo You have to run configure with the '--without-dependences' argument."
else
	# Check if the 'wget' binary exists
	AC_CHECK_TOOL(HAVE_WGET, wget)
	if test [ ! "$HAVE_WGET" ]
	then 
	     AC_MSG_ERROR([[cannot find wget]])
	fi

	# BINDIST_INTRO_* values
	BINDIST_INTRO_MESSAGE="echo Building static binary tgz..."

	# add the "dependences" rep.
	DEPENDENCES="dependences"

	# Gecko stuff
	GECKO_SDK_PATH=${CURRENT_PATH}/src/dependences/xulrunner-sdk
	LIBXUL_CFLAGS="-I${GECKO_SDK_PATH}/include -fshort-wchar"
	LIBXUL_LDFLAGS="-L${GECKO_SDK_PATH}/sdk/lib -lxpcomglue_s -lxul -lxpcom -lplds4 -lplc4 -lnspr4 -lpthread -ldl"
	GECKO_IDL_PATH=${GECKO_SDK_PATH}/idl
	XPIDL_PATH=$GECKO_SDK_PATH/bin
	AC_PATH_PROG([XPIDL], "xpidl", [], $XPIDL_PATH)

	# zlib
	LIBZ_CFLAGS="-I${CURRENT_PATH}/src/dependences/zlib-1.2.3/"
	LIBZ_LDFLAGS="-L${CURRENT_PATH}/src/dependences/zlib-1.2.3/ -Bstatic -lz"
	LIBZ_STATIC_LDFLAGS="${CURRENT_PATH}/src/dependences/zlib-1.2.3/libz.a"

	# liblzma
	LIBLZMA_CFLAGS="-I${CURRENT_PATH}/src/dependences/xz-4.999.9beta/src/liblzma/api/"
	LIBLZMA_LDFLAGS="-L${CURRENT_PATH}/src/dependences/xz-4.999.9beta/src/liblzma/.libs/ -Bstatic -llzma"
	LIBLZMA_STATIC_LDFLAGS="${CURRENT_PATH}/src/dependences/xz-4.999.9beta/src/liblzma/.libs/liblzma.a"

	# libxapian
	LIBXAPIAN_CFLAGS="-I${CURRENT_PATH}/src/dependences/xapian-core-1.2.3/include/";
	LIBXAPIAN_LDFLAGS="-L${CURRENT_PATH}/src/dependences/xapian-core-1.2.3/.libs/ -lxapian";
	LIBXAPIAN_STATIC_LDFLAGS="${CURRENT_PATH}/src/dependences/xapian-core-1.2.3/.libs/libxapian.a";
	
	# libicu
	# even in with-dep mode we don't get it
	LIBICU_STATIC_LDFLAGS="/opt/local/lib/libicudata.a /opt/local/lib/libicui18n.a /opt/local/lib/libicuuc.a /opt/local/lib/libicuio.a /opt/local/lib/libicule.a /opt/local/lib/libiculx.a /opt/local/lib/libicutu.a /opt/local/lib/libicutest.a"

#	-Bstatic -lzim -lz -lzma -Wl,-Bdynamic

	# Xapian part
#	AC_SUBST(LIBXAPIAN_CFLAGS)
#	AC_SUBST(LIBXAPIAN_LDFLAGS)
#	AC_SUBST(LIBZ_CFLAGS)
#	AC_SUBST(LIBZ_LDFLAGS)
#	AC_SUBST(LIBZIM_CFLAGS)
#	AC_SUBST(LIBZIM_LDFLAGS)
#	AC_SUBST(LIBMICROHTTPD_CFLAGS)
#	AC_SUBST(LIBMICROHTTPD_LDFLAGS)
#	AC_SUBST(ESCAPED_PREFIX)
fi

# default CXXFLAGS
CXXFLAGS=${CFLAGS}

# libzim flags
LIBZIM_CFLAGS="-I${CURRENT_PATH}/src/zimlib/include"
LIBZIM_LDFLAGS="${LIBZ_LDFLAGS} ${LIBLZMA_LDFLAGS}"
LIBZIM_STATIC_LDFLAGS="${LIBZ_STATIC_LDFLAGS} ${LIBLZMA_STATIC_LDFLAGS}"
LIBCTPP2_CFLAGS="-I${CURRENT_PATH}/src/ctpp2/include"
LIBCTPP2_LDFLAGS=""
AC_DEFINE_UNQUOTED(CLUSTER_CACHE_SIZE, 16, [set zim cluster cache size to number of cached chunks])
AC_DEFINE_UNQUOTED(DIRENT_CACHE_SIZE, 512, [set zim dirent cache size to number of cached chunks])
AC_DEFINE_UNQUOTED(LZMA_MEMORY_SIZE, 128, [set lzma uncompress memory size to number of MB])
AC_DEFINE(ENABLE_LZMA, [1], [defined if lzma compression is enabled])

# debug
AC_ARG_WITH(debug, [  --with-debug-symbols    add debug symbols], CFLAGS="${CFLAGS} -g "; CXXFLAGS="${CXXFLAGS} -g ")

# Special Flags for XPCOM components
XPCOM_CFLAGS="-fno-rtti -fPIC"
XPCOM_LDFLAGS="-Xcompiler -shared -Wl"
if test [ ! "$IS_OSX" ]
then
# osx don't need for rpath-link as we build static
XPCOM_LDFLAGS +=",-rpath-link,$GECKO_SDK_PATH/bin"
fi

# Export variables
AC_SUBST(LIBXUL_CFLAGS)
AC_SUBST(LIBXUL_LDFLAGS)
AC_SUBST(XPCOM_CFLAGS)
AC_SUBST(XPCOM_LDFLAGS)
AC_SUBST(XPIDL)
AC_SUBST(GECKO_IDL_PATH)
AC_SUBST(LIBXAPIAN_CFLAGS)
AC_SUBST(LIBXAPIAN_LDFLAGS)
AC_SUBST(LIBXAPIAN_STATIC_LDFLAGS)
AC_SUBST(LIBCLUCENE_CFLAGS)
AC_SUBST(LIBCLUCENE_LDFLAGS)
AC_SUBST(LIBCLUCENE_STATIC_LDFLAGS)
AC_SUBST(LIBZ_CFLAGS)
AC_SUBST(LIBZ_LDFLAGS)
AC_SUBST(LIBZ_STATIC_LDFLAGS)
AC_SUBST(LIBLZMA_CFLAGS)
AC_SUBST(LIBLZMA_LDFLAGS)
AC_SUBST(LIBLZMA_STATIC_LDFLAGS)
AC_SUBST(LIBICU_CFLAGS)
AC_SUBST(LIBICU_LDFLAGS)
AC_SUBST(LIBICU_STATIC_LDFLAGS)
AC_SUBST(LIBZIM_CFLAGS)
AC_SUBST(LIBZIM_LDFLAGS)
AC_SUBST(LIBZIM_STATIC_LDFLAGS)
AC_SUBST(LIBCTPP2_CFLAGS)
AC_SUBST(LIBCTPP2_LDFLAGS)
AC_SUBST(LIBMICROHTTPD_CFLAGS)
AC_SUBST(LIBMICROHTTPD_LDFLAGS)
AC_SUBST(ESCAPED_PREFIX)
AC_SUBST(BINDIST_INTRO_MESSAGE)
AC_SUBST(DEPENDENCES)
AC_SUBST(JAR)
AC_SUBST(CURRENT_PATH)
AC_SUBST(GECKO_VERSION)
AC_SUBST(IS_OSX)

# Check the existence of stat64 (to handle file >2GB) in the libc
AC_CHECK_FUNCS([stat64])

# Checks for header files.
AC_CHECK_HEADERS([fcntl.h float.h libintl.h limits.h stddef.h stdint.h stdlib.h string.h strings.h sys/socket.h sys/time.h unistd.h wchar.h])

# Checks for typedefs, structures, and compiler characteristics.
AC_HEADER_STDBOOL
AC_C_INLINE
AC_TYPE_INT16_T
AC_TYPE_INT32_T
AC_TYPE_INT64_T
AC_TYPE_INT8_T
AC_TYPE_OFF_T
AC_TYPE_PID_T
AC_TYPE_SIZE_T
AC_TYPE_UINT16_T
AC_TYPE_UINT32_T
AC_TYPE_UINT64_T
AC_TYPE_UINT8_T
AC_CHECK_TYPES([ptrdiff_t])

# Checks for library functions.
AC_FUNC_FORK
AC_FUNC_MALLOC
AC_FUNC_STRTOD
AC_CHECK_FUNCS([getcwd gettimeofday memmove memset pow regcomp sqrt strcasecmp strchr strdup strerror strtol])

# Generate the headers
AC_CONFIG_HEADERS([src/zimlib/src/config.h])

# Configure the output files
AC_CONFIG_FILES([
  Makefile
  src/Makefile
  src/dependences/Makefile
  src/zimlib/Makefile
  src/zimlib/src/Makefile
  src/ctpp2/Makefile
  src/ctpp2/src/Makefile
  src/pugixml/Makefile
  src/components/Makefile
  src/components/xapianAccessor/Makefile
  src/components/zimAccessor/Makefile
  src/components/zimXapianIndexer/Makefile
  src/components/zimCluceneIndexer/Makefile
  src/components/cluceneAccessor/Makefile
  src/indexer/Makefile
  src/server/Makefile
  src/manager/Makefile
  kiwix/Makefile
  kiwix/chrome/Makefile
  kiwix/defaults/Makefile
  kiwix/components/Makefile
  desktop/Makefile
  static/Makefile
])

AC_PROG_INSTALL
AC_OUTPUT
