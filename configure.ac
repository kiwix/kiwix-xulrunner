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

# Check cl.exe
# Check if their is a Perl binary
AC_CHECK_TOOL(HAVE_CL, cl)

# Check the platform
if test [ "$HAVE_CL" ]
then
  IS_WIN=1
fi

# Only for POSIX systems
if test [ ! "$IS_WIN" ]
then

  # Check the compiler version
  if test [ "$CXX" ]
  then
    CXX_VERSION=`$CXX --version | head -n 1 | cut -d " " -f 3` 
    if [[ "$CXX_VERSION" \< "3.3" ]]
    then
      AC_MSG_ERROR([g++ 4.3.x or higher required])
    fi
  fi

  # Determine libtool
  AC_PROG_LIBTOOL
  AC_PROG_RANLIB
  AC_PROG_MAKE_SET

  # default $CPPFLAGS and $LDFLAGS
  CPPFLAGS=""
  CFLAGS="-O6"
  LDFLAGS=""
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
		LIBXUL_CFLAGS="-I${GECKO_SDK_PATH}/sdk/include -fshort-wchar"
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
			AC_MSG_ERROR([[cannot find libxul]])
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
		AC_MSG_ERROR([[cannot find xpidl]])
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

	# Configuration for alternative libbz2 location
	AC_ARG_WITH(bz2, [  --with-bz2=DIR          alternate location for bz2 library],
		 	 LIBBZ2_PATH=`cd ${withval}; pwd`; CPPFLAGS="-I${LIBBZ2_PATH}"; LDFLAGS="-L${LIBBZ2_PATH}")

	# Check for the libbz2
	AC_CHECK_HEADER([bzlib.h], [], [AC_MSG_ERROR([[cannot find bzip2 header]])])
	AC_CHECK_LIB([bz2], [main],, [AC_MSG_ERROR([[cannot find bzip2]])]) 
	if test [ "$LIBBZ2_PATH" ]
	then
		LIBBZ2_CFLAGS="-I${LIBBZ2_PATH}"
		LIBBZ2_LDFLAGS="-L${LIBBZ2_PATH}"
	fi
	LIBBZ2_LDFLAGS="${LIBBZ2_LDFLAGS} -lbz2"

	# Configuration for alternative unaclib location
	if test [ ! "$with_unac" == "no" ]
	then
		AC_ARG_WITH(unac, [  --with-unac=DIR         alternate location for unac library],
				  LIBUNAC_PATH=`cd ${withval}; pwd`; CPPFLAGS="${LIBUNAC_PATH}"; LDFLAGS="${LDFLAGS}")

		# Check the libunac
		AC_CHECK_HEADER([unac.h],, [AC_MSG_ERROR([[cannot find unac header]])])
		AC_CHECK_LIB([unac], [unac_string],, [AC_MSG_ERROR([[cannot find unac]])])
		if test [ "$LIBUNAC_PATH" ]
		then
			LIBUNAC_CFLAGS="-I${LIBUNAC_PATH}"
			LIBUNAC_LDFLAGS="-L${LIBUNAC_PATH}"
		fi
		LIBUNAC_LDFLAGS="${LIBUNAC_LDFLAGS} -lunac"
	fi

	# Configure for libicu
	AC_ARG_WITH(icu, [  --with-icu=DIR         alternate location for icu library],
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
			LIBUNAC_CFLAGS=`$ICU_CONFIG --cflags`
			LIBUNAC_LDFLAGS=`$ICU_CONFIG --ldflags`
		else
			AC_MSG_ERROR([[cannot find icu-config]])
		fi
	fi

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
	GECKO_SDK_PATH=${CURRENT_PATH}/src/dependences/mozilla-1.9.1/dist/sdk/
	LIBXUL_CFLAGS="-I${GECKO_SDK_PATH}/include -fshort-wchar"
	LIBXUL_LDFLAGS="-L${GECKO_SDK_PATH}/lib -lxpcomglue_s -lxul -lxpcom -lplds4 -lplc4 -lnspr4 -lpthread -ldl"
	GECKO_IDL_PATH=${GECKO_SDK_PATH}/idl
	XPIDL_PATH=$GECKO_SDK_PATH/bin
	AC_PATH_PROG([XPIDL], "xpidl", [], $XPIDL_PATH)

	# zlib
	LIBZ_CFLAGS="-I${CURRENT_PATH}/src/dependences/zlib-1.2.3/"
	LIBZ_LDFLAGS="-L${CURRENT_PATH}/src/dependences/zlib-1.2.3/ -Bstatic -lz,"

	# libbip2
	LIBBZ2_CFLAGS="-I${CURRENT_PATH}/src/dependences/bzip2-1.0.5/"
	LIBBZ2_LDFLAGS="-L${CURRENT_PATH}/src/dependences/bzip2-1.0.5/ -Bstatic -lbz2,"

	# liblzma
	LIBLZMA_CFLAGS="-I${CURRENT_PATH}/src/dependences/xz-4.999.9beta/src/liblzma/api/"
	LIBLZMA_LDFLAGS="-L${CURRENT_PATH}/src/dependences/xz-4.999.9beta/src/liblzma/.libs/ -Bstatic -llzma,"

	# libunac
	LIBUNAC_CFLAGS="-I${CURRENT_PATH}/src/dependences/unac-1.7.0/"
	LIBUNAC_LDFLAGS="-L${CURRENT_PATH}/src/dependences/unac-1.7.0/ -lunac"

	# libxapian
	LIBXAPIAN_CFLAGS="-I${CURRENT_PATH}/src/dependences/xapian-core-1.0.16/include/";
	LIBXAPIAN_LDFLAGS="-L${CURRENT_PATH}/src/dependences/xapian-core-1.0.16/.libs/ -lxapian";

#	-Bstatic -lzim -lz -lbz2 -lzma -Wl,-Bdynamic

	# Xapian part
#	AC_SUBST(LIBXAPIAN_CFLAGS)
#	AC_SUBST(LIBXAPIAN_LDFLAGS)
#	AC_SUBST(LIBZ_CFLAGS)
#	AC_SUBST(LIBZ_LDFLAGS)
#	AC_SUBST(LIBBZ2_CFLAGS)
#	AC_SUBST(LIBBZ2_LDFLAGS)
#	AC_SUBST(LIBUNAC_CFLAGS)
#	AC_SUBST(LIBUNAC_LDFLAGS)
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
LIBZIM_LDFLAGS="${LIBZ_LDFLAGS} ${LIBLZMA_LDFLAGS} ${LIBBZ2_LDFLAGS}"
AC_DEFINE_UNQUOTED(CLUSTER_CACHE_SIZE, 16, [set zim cluster cache size to number of cached chunks])
AC_DEFINE_UNQUOTED(DIRENT_CACHE_SIZE, 512, [set zim dirent cache size to number of cached chunks])
AC_DEFINE_UNQUOTED(LZMA_MEMORY_SIZE, 128, [set lzma uncompress memory size to number of MB])
AC_DEFINE(ENABLE_ZLIB, [1], [defined if zlib compression is enabled])
AC_DEFINE(ENABLE_BZIP2, [1], [defined if bzip2 compression is enabled])
AC_DEFINE(ENABLE_LZMA, [1], [defined if lzma compression is enabled])

# debug
AC_ARG_WITH(debug, [  --with-debug-symbols    add debug symbols], CFLAGS="${CFLAGS} -g "; CXXFLAGS="${CXXFLAGS} -g ")

# Special Flags for XPCOM components
XPCOM_CFLAGS="-fno-rtti -D_POSIX_ -fPIC"
XPCOM_LDFLAGS="-Xcompiler -shared -Wl,-rpath-link,$GECKO_SDK_PATH/bin"

# Export variables
AC_SUBST(LIBXUL_CFLAGS)
AC_SUBST(LIBXUL_LDFLAGS)
AC_SUBST(XPCOM_CFLAGS)
AC_SUBST(XPCOM_LDFLAGS)
AC_SUBST(XPIDL)
AC_SUBST(GECKO_IDL_PATH)
AC_SUBST(LIBXAPIAN_CFLAGS)
AC_SUBST(LIBXAPIAN_LDFLAGS)
AC_SUBST(LIBZ_CFLAGS)
AC_SUBST(LIBZ_LDFLAGS)
AC_SUBST(LIBBZ2_CFLAGS)
AC_SUBST(LIBBZ2_LDFLAGS)
AC_SUBST(LIBLZMA_CFLAGS)
AC_SUBST(LIBLZMA_LDFLAGS)
AC_SUBST(LIBUNAC_CFLAGS)
AC_SUBST(LIBUNAC_LDFLAGS)
AC_SUBST(LIBICU_CFLAGS)
AC_SUBST(LIBICU_LDFLAGS)
AC_SUBST(LIBZIM_CFLAGS)
AC_SUBST(LIBZIM_LDFLAGS)
AC_SUBST(LIBMICROHTTPD_CFLAGS)
AC_SUBST(LIBMICROHTTPD_LDFLAGS)
AC_SUBST(ESCAPED_PREFIX)
AC_SUBST(BINDIST_INTRO_MESSAGE)
AC_SUBST(DEPENDENCES)
AC_SUBST(CURRENT_PATH)

# Check the existence of stat64 (to handle file >2GB) in the libc
AC_CHECK_FUNCS([stat64])

# Generate the headers
AC_CONFIG_HEADERS([src/zimlib/src/config.h])

# Configure the output files
AC_CONFIG_FILES([
  Makefile
  src/Makefile
  src/zimlib/Makefile
  src/zimlib/src/Makefile
  src/dependences/Makefile
  src/components/Makefile
  src/components/xapianAccessor/Makefile
  src/components/zimAccessor/Makefile
  src/components/zimXapianIndexer/Makefile
  src/indexer/Makefile
  src/server/Makefile
  ])

# Generate the Makefiles
AC_OUTPUT

# Only for POSIX systems
if test [ ! "$IS_WIN" ]
then

  # Generate a new BuildID
  REPLACE=`date "+%Y%m%d"`
  sed -i "s/^BuildID=[[0-9]]*/BuildID=$REPLACE/" ./kiwix/application.ini

  # Save the install prefix in the default application preferences
  sed -i "s/\"kiwix.install.prefix\"\,\ \"[[^\"]]*\"/\"kiwix.install.prefix\"\,\ \"$(echo $prefix | sed -e 's/\\/\\\\/g' -e 's/\//\\\//g' -e 's/&/\\\&/g')\"/" ./kiwix/defaults/preferences/preferences.js

fi