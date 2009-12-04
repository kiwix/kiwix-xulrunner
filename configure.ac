AC_INIT([kiwix], [0.9])

# Init. of automake
AM_INIT_AUTOMAKE

# Check if cl.exe is there and use cccl if yes
AC_CHECK_FILE(cl.exe, CC=cccl; LD=cccl,)

# Determine a C compiler
AC_PROG_CC

# Determine a C++ compiler
AC_PROG_CXX

# Determine libtool
AC_PROG_LIBTOOL
AC_PROG_RANLIB
AC_PROG_MAKE_SET

# Set current language to C++
AC_LANG(C++)

# Current path
CURRENT_PATH=`pwd`

# Check if the 'pkg-config' binary exists
AC_CHECK_TOOL(HAVE_PKG_CONFIG, pkg-config)
if test [ ! "$HAVE_PKG_CONFIG" ]
then 
	AC_MSG_ERROR([[cannot find pkg-config]])
fi

# Check if their is a Perl binary
AC_CHECK_TOOL(HAVE_PERL, perl)

# Check if user want local dependences
AC_ARG_WITH(dependences, [  --with-dependences      download and compile dependences localy in src/dependences],
		 WITH_DEPENDENCES=1; CPPFLAGS="${CPPFLAGS} -I${withval}"; LDFLAGS="-L${withval} ${LDFLAGS}")

if test [ ! "$WITH_DEPENDENCES" ]
then
	# Configuration for alternative zlib location
	AC_ARG_WITH(gecko-sdk, [  --with-gecko-sdk=DIR    alternate location for gecko SDK], 
			       GECKO_SDK_PATH=`cd ${withval}; pwd`)

	# Check for in standard way
	if test [ "$GECKO_SDK_PATH" ]
	then
		LIBXUL_CFLAGS="-I${GECKO_SDK_PATH}/sdk/include -fshort-wchar"
		LIBXUL_LDFLAGS="-L${GECKO_SDK_PATH}/sdk/lib -lxpcomglue_s -lxul -lxpcom -lplds4 -lplc4 -lnspr4 -lpthread -ldl"
		GECKO_SDK_PATH=${GECKO_SDK_PATH}
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
		GECKO_IDL_PATH=`pkg-config --variable=idldir libxul`/stable
	fi

	# Configuration of xpidl
	AC_CHECK_TOOL(HAVE_XPIDL, "xpidl", [], $GECKO_SDK_PATH/bin)
	if test [ "$HAVE_XPIDL" ]
	then 
		AC_PATH_PROG([XPIDL], "xpidl", [], $GECKO_SDK_PATH/bin)
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

	# Configuration for alternative bz2lib location
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
else
	# Check if the 'wget' binary exists
	AC_CHECK_TOOL(HAVE_WGET, wget)
	if test [ ! "$HAVE_WGET" ]
	then 
	     AC_MSG_ERROR([[cannot find wget]])
	fi
fi

# clear $CPPFLAGS and $LDFLAGS
CPPFLAGS=""
LDFLAGS=""
LIBS=""

# libzim flags
LIBZIM_CFLAGS="-I${CURRENT_PATH}/src/zimlib/include"
LIBZIM_LDFLAGS="-lbz2 -lz"
AC_DEFINE_UNQUOTED(CLUSTER_CACHE_SIZE, 16, [set zim cluster cache size to number of cached chunks])
AC_DEFINE_UNQUOTED(DIRENT_CACHE_SIZE, 51200, [set zim dirent cache size to number of cached chunks])

# debug
AC_ARG_WITH(debug, [  --with-debug-symbols    add debug symbols], CFLAGS="${CFLAGS} -g "; CXXFLAGS="${CXXFLAGS} -g ")

# Special Flags for XPCOM components
XPCOM_CFLAGS="-fno-rtti -D_POSIX_ -O3 -fPIC"
XPCOM_LDFLAGS="-Xcompiler -shared -Wl,-rpath-link,$GECKO_SDK_PATH/bin"

# Export variables
AC_SUBST(LIBXUL_CFLAGS)
AC_SUBST(LIBXUL_LDFLAGS)
AC_SUBST(XPCOM_CFLAGS)
AC_SUBST(XPCOM_LDFLAGS)
AC_SUBST(LIBXAPIAN_CFLAGS)
AC_SUBST(LIBXAPIAN_LDFLAGS)
AC_SUBST(LIBZ_CFLAGS)
AC_SUBST(LIBZ_LDFLAGS)
AC_SUBST(LIBBZ2_CFLAGS)
AC_SUBST(LIBBZ2_LDFLAGS)
AC_SUBST(LIBUNAC_CFLAGS)
AC_SUBST(LIBUNAC_LDFLAGS)
AC_SUBST(LIBZIM_CFLAGS)
AC_SUBST(LIBZIM_LDFLAGS)

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
  src/components/Makefile
  src/components/xapianAccessor/Makefile
  src/components/zimAccessor/Makefile
  src/components/zimXapianIndexer/Makefile
  ])

# Generate the Makefiles
AC_OUTPUT

# Generation of the XPCOM header files
if test [ "$HAVE_XPIDL" ]
then 
     cd src/components/xapianAccessor ; $XPIDL -m header -I $GECKO_IDL_PATH IXapianAccessor.idl ; cd ../../..
     cd src/components/zimAccessor ; $XPIDL -m header -I $GECKO_IDL_PATH IZimAccessor.idl ; cd ../../..
     cd src/components/zimXapianIndexer ; $XPIDL -m header -I $GECKO_IDL_PATH IZimXapianIndexer.idl ; cd ../../..
fi

# Generation of the XPCOM xpt files
if test [ "$HAVE_XPIDL" ]
then 
     cd src/components/xapianAccessor ; $XPIDL -m typelib -I $GECKO_IDL_PATH IXapianAccessor.idl ; cd ../../..
     cd src/components/zimAccessor ; $XPIDL -m typelib -I $GECKO_IDL_PATH IZimAccessor.idl ; cd ../../..
     cd src/components/zimXapianIndexer ; $XPIDL -m typelib -I $GECKO_IDL_PATH IZimXapianIndexer.idl ; cd ../../..
fi

# Generate a new BuildID
REPLACE=`date "+%Y%m%d"`
sed -i -e "s/^BuildID=[[0-9]]*/BuildID=$REPLACE/" ./kiwix/application.ini