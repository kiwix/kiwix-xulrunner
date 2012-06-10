defaultsdir=$(DESTDIR)$(pkgdatadir)/defaults
defaults_DATA=

install-data-hook:
	-mkdir -p $(defaultsdir)
	-cp -rf preferences $(defaultsdir)
	-rm -rf `find $(defaultsdir)/preferences -type d -name .svn`
	-ln -s -f ../../share/kiwix/defaults $(DESTDIR)$(pkglibdir)/defaults

uninstall-hook:
	-rm -rf $(defaultsdir) $(DESTDIR)$(pkglibdir)/defaults
