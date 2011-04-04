chromedir = $(datarootdir)/kiwix/chrome
install:
	-mkdir -p $(chromedir)
	-cp -rf *.jar content icons locale modules skin static chrome.manifest chrome.manifest.prod $(chromedir)
	-ln -s -f $(chromedir) ${DESTDIR}/${libdir}/kiwix/chrome
uninstall:
	-rm -rf $(chromedir) ${DESTDIR}/${libdir}/kiwix/chrome
