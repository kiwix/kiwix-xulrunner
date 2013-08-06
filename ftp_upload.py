#!/usr/bin/env python
# -*- coding: utf-8 -*-
# vim: ai ts=4 sts=4 et sw=4 nu

from __future__ import (unicode_literals, absolute_import,
                        division, print_function)
import os
import sys
import imp
from ftplib import FTP

""" Kiwix nightly builds uploader

    Sends a build file to the nightly builds repository via FTP.
    Usage: script.py password_module source_path dest_folder

        password_module: path of a python file containing FTP_PASSWD variable
        source_path: path of file to transfer on local machine.
        dest_folder: relative path on FTP server. Usually `latest/` """

FTP_HOST = "download.kiwix.org"
FTP_PORT = 21
FTP_USER = "nightlybot"


def getpasswd(pathname):
    settings = imp.load_source('settings', os.path.expanduser(pathname))
    return settings.FTP_PASSWD


def main(argv):

    if len(argv) != 3:
        print("Usage:\t{0} passwd_module_path source_path destination_folder\n\n"
              "Missing arguments.".format(sys.argv[0]))
        sys.exit(1)

    passwd_module_path, source_path, dest_folder = argv
    FTP_PASSWD = getpasswd(passwd_module_path)
    filename = os.path.basename(source_path)

    if not os.path.exists(source_path):
        print("source_path not found: {}".format(source_path))

    print("Connecting to {} with user {}".format(FTP_HOST, FTP_USER))
    ftp = FTP(FTP_HOST, FTP_USER, FTP_PASSWD)
    print("Connected successfuly")

    print("Fetching folder list")
    ftp.retrlines('LIST')

    print("Moving to directory {}".format(dest_folder))
    ftp.cwd(dest_folder)

    print("Staring upload of {}".format(filename))
    ftp.storbinary('STOR {}'.format(filename), open(source_path, 'rb'))

    print("Transfer complete. Closing")
    ftp.quit()

if __name__ == '__main__':
    main(sys.argv[1:])