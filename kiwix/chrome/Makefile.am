chromedir=$(datarootdir)/kiwix/chrome

install-data-hook:
	-mkdir -p $(chromedir)
	-cp -rf locale.jar content.jar skin.jar content icons locale modules skin chrome.manifest $(chromedir)
	-ln -s -f $(chromedir) ${DESTDIR}/${libdir}/kiwix/chrome
	-ln -s -f $(datarootdir)/kiwix/static $(chromedir)/static

uninstall-hook:
	-rm -rf $(chromedir) ${DESTDIR}/${libdir}/kiwix/chrome
