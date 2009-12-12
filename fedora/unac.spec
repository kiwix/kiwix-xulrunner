Summary: A C library and a command that remove accents.
Name: unac
Version: 1.7.0
Release: 1
License: GPL
Vendor: Senga
Group: Development/Libraries
Source: http://www.senga.org/download/unac/unac-%{version}.tar.gz
Prefix: %{_prefix}
BuildRoot: %{_tmppath}/%{name}-root

%description
unac is a C library and command that remove accents from a string.
For instance the string été will become ete.  It provides a command
line interface that removes accents from a string given in argument
(unaccent command). In the library function and the command, the
charset of the input string is specified as an argument. The input
string is converted to UTF-16 using iconv(3), accents are stripped and
the result is converted back to the original charset. The iconv --list
command on GNU/Linux will show all charset supported.

%prep
%setup -q

%build

%configure
make

%install
make DESTDIR=$RPM_BUILD_ROOT install

%clean
rm -rf ${RPM_BUILD_ROOT}

%post -p /sbin/ldconfig

%postun -p /sbin/ldconfig

%files
%defattr(-,root,root)
%doc ChangeLog README
%{_bindir}/*
%{_libdir}/*
%{_includedir}/*
%{_mandir}/man*/*

%changelog
* Fri Sep 21 2000 Loic Dachary <loic@senga.org>
- Create
