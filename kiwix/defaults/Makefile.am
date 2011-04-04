defaultsdir = $(datarootdir)/kiwix/defaults
install:
	-mkdir -p $(defaultsdir)
	-cp -rf preferences $(defaultsdir)
	-ln -s -f $(defaultsdir) ${DESTDIR}/${libdir}/kiwix/defaults
uninstall:
	-rm -rf $(defaultsdir) ${DESTDIR}/${libdir}/kiwix/defaults
