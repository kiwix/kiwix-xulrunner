Name: kiwix
Summary: Is an offline reader for multimedia contents how Wikipedia
Version: svn
Release: 0.9_20100123_1%{?dist}
License: GPLv3
Group: Applications/Productivity
URL: http://www.kiwix.org

Source: http://tmp.kiwix.org/src/nightly/kiwix-%{version}-2010-01-23.tar.bz2
BuildRoot: %{_tmppath}/%{name}-%{version}-%{release}-root

BuildRequires: xulrunner-devel, bzip2-devel, xapian-core-devel, libmicrohttpd-devel, libtool
Requires: xulrunner, xapian-core, libmicrohttpd


%description
Kiwix is an offline reader for multimedia contents. 
It's especially thought to make Wikipedia available offline.
Kiwix use a .zim files for mediawiki compatible sites, 
download it from http://tmp.kiwix.org/zim/ 

%prep
%setup -q -n kiwix-0.9

%build
%configure --with-xpidl=%{_libdir}/xulrunner-*/ --with-gecko-idl=%{_libdir}/xulrunner-sdk-*/sdk/idl/ --prefix=%{_prefix}
make 

%install
%{__rm} -rf %{buildroot}
install -dm 755 $RPM_BUILD_ROOT%{_datadir}/
install -dm 755 $RPM_BUILD_ROOT%{_bindir}/
install -dm 755 $RPM_BUILD_ROOT%{_libdir}/

%makeinstall 

%clean
%{__rm} -rf %{buildroot}

%post 
rm -f /usr/bin/kiwix
ln -s /usr/lib/kiwix/kiwix.sh /usr/bin/kiwix

%postun 

%files
%defattr(-,root,root)
%doc CHANGELOG COPYING AUTHORS README
%{_bindir}/*
%{_libdir}/*
%{_datadir}/*


%changelog
* Sun Jan 24 2010 Richzendy <richzendy@fedoraproject.org> - 1.9  svn-2010-01-23
-  Nightly RPM BUILD. 
* Fri Dec 25 2009 Richzendy <richzendy@fedoraproject.org> - 1.9  svn-2009-12-25
- Initial package - Nightly RPM BUILD. 
