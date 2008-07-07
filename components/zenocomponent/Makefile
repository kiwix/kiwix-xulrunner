all: Makefile.real
	make -f Makefile.real all

clean: Makefile.real
	make -f Makefile.real clean

Makefile.real: configure
	./configure

configure: configure.ac
	autoconf
