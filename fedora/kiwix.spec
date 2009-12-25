# Not build to debug rpm package
%define debug_package %{nil}

Name: kiwix
Summary: Kiwix is an offline reader for multimedia contents how Wikipedia.
Version: 0.9
Release: 1
License: GPLv3
Group: Applications/Productivity
URL: http://www.kiwix.org

Packager: Edwind Richzendy <richzendy@fedoraproject.org>
Vendor: Richzendy Repository, http://repo.Richzendy.org/

Source: http://repo.richzendy.org/kiwix/src/kiwix-%{version}.tar.gz
BuildRoot: %{_tmppath}/%{name}-%{version}-%{release}-root

BuildRequires: xulrunner-devel, bzip2-devel, xapian-core-devel, libmicrohttpd-devel
Requires: xulrunner, xapian-core, libmicrohttpd

%description
Kiwix is an offline reader for multimedia contents. 
It's especially thought to make Wikipedia available offline.
Kiwix use a .zim files for mediawiki compatible sites, 
download it from http://tmp.kiwix.org/zim/ 

%prep
%setup -q -n kiwix-0.9

%build
grep -v 'ln' Makefile.am > Makefile.am.new
mv -f Makefile.am.new Makefile.am
if [ -f ./autogen.sh ] ; then ./autogen.sh ; fi
./configure --with-xpidl=/usr/lib/xulrunner-*/ --with-gecko-idl=/usr/lib/xulrunner-sdk-*/sdk/idl/ --prefix=%{_prefix}
make 

%install
%{__rm} -rf %{buildroot}
#sed -i 's/ln/#ln/' Makefile.ac
install -dm 755 $RPM_BUILD_ROOT%{_datadir}/pixmaps
install -dm 755 $RPM_BUILD_ROOT%{_bindir}/
install -dm 755 $RPM_BUILD_ROOT%{_libdir}/kiwix

%makeinstall 

%clean
%{__rm} -rf %{buildroot}

%post 
ln -f -s /usr/lib/kiwix/kiwix.sh  /usr/bin/kiwix
ln -f -s /usr/lib/kiwix/kiwix-compact.sh /usr/bin/kiwix-compat

%postun 
rm ${prefix}/share/pixmaps/kiwix.png
rm ${prefix}/share/applications/kiwix.desktop
rm -rf ${prefix}/lib/kiwix
rm -f ${prefix}/bin/kiwix
rm -f ${prefix}/bin/kiwix-compact
rm -f ${prefix}/bin/kiwix-index

%files
%defattr(-,root,root)
%doc COPYING AUTHORS CHANGELOG README
%{_bindir}/*
%{_libdir}/*
%{_datadir}/*


%changelog
* Wed Dec 09 2009 Richzendy <richzendy@fedoraproject.org> - 1.9 alpha svn_09-12-2009
- Initial package. 
