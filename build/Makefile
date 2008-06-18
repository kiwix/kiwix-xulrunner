all : kiwix

clean : clean_kiwix clean_moulin

clean_kiwix :
	if test -d kiwix ; then rm -rf ./kiwix/* ; fi

clean_moulin :
	if test -d moulin ; then rm -rf ./moulin/* ; fi

kiwix : kiwix_chrome kiwix_components

kiwix_chrome : kiwix_dir
	cp -r ../kiwix/* kiwix/
	for i in `find kiwix -name ".svn"` ; do rm -rf $$i ; done

kiwix_components : kiwix_dir
	rm -rf ./kiwix/components
	mkdir ./kiwix/components
	cp ../components/kiwixcomponent/IWikiComponent.xpt ./kiwix/components/
	cp ../components/kiwixcomponent/IWikiComponent.so ./kiwix/components/

kiwix_dir:
	if test ! -d kiwix ; then mkdir kiwix ; fi
