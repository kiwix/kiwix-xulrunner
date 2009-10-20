AC_INIT([kiwix], [0.8])

# Determine a C compiler
AC_PROG_CC

# Determine a C++ compiler
AC_PROG_CXX

# Set current language to C++
AC_LANG(C++)

# Check if the 'pkg-config' binary exists
AC_CHECK_TOOL(HAVE_PKG_CONFIG, pkg-config)

# Check if their is a Perl binary
AC_CHECK_TOOL(HAVE_PERL, perl)

# Configuration for alternative zlib location
AC_ARG_WITH(zlib, [  --with-zlib=DIR          alternate location for zlib],
		 CPPFLAGS="${CPPFLAGS} -I${withval}"; LDFLAGS="-L${withval} ${LDFLAGS}")

# Check the zlib
AC_CHECK_HEADER([zlib.h],, [AC_MSG_ERROR([[cannot find zlib header]])])
AC_CHECK_LIB([z], [zlibVersion],, [AC_MSG_ERROR([[cannot find zlib]])])

# Configuration for alternative bz2lib location
AC_ARG_WITH(bz2, [  --with-bz2=DIR          alternate location for bz2 library],
		 CPPFLAGS="${CPPFLAGS} -I${withval}"; LDFLAGS="-L${withval} ${LDFLAGS}")

# Check for the libbz2
AC_CHECK_HEADER([bzlib.h],, [AC_MSG_ERROR([[cannot find bzip2 header]])])
AC_CHECK_LIB([bz2], [main],, [AC_MSG_ERROR([[cannot find bzip2]])]) 

# Configuration for alternative unaclib location
AC_ARG_WITH(unac, [  --with-unac=DIR          alternate location for unac library],
		 CPPFLAGS="${CPPFLAGS} -I${withval}"; LDFLAGS="-L${withval} ${LDFLAGS}")

# Check the libunac
AC_CHECK_HEADER([unac.h],, [AC_MSG_ERROR([[cannot find unac header]])])
AC_CHECK_LIB([unac], [unac_string],, [AC_MSG_ERROR([[cannot find unac]])])