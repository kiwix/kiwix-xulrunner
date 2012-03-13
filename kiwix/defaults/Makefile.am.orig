defaultsdir=$(pkgdatadir)/defaults
defaults_DATA=

install-data-hook:
	-cp -rf preferences ${DESTDIR}/$(defaultsdir)
	-ln -s -f $(defaultsdir) ${DESTDIR}/${pkglibdir}/defaults

uninstall-hook:
	-rm -rf $(defaultsdir) ${DESTDIR}/${pkglibdir}/defaults
