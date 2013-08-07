#!/usr/bin/env python
# -*- coding: utf-8 -*-
# vim: ai ts=4 sts=4 et sw=4 nu

import os
import shutil
import sys
import imp
try:
    import pexpect
    IS_WIN = False
except ImportError:
    # win32 doesn't support pexpect
    from ftplib import FTP
    IS_WIN = True

""" Kiwix nightly builds uploader

    Sends a build file to the nightly builds repository via FTP.
    Usage: script.py password_module source_path dest_folder dest_name

        password_module: path of a python file containing FTP_PASSWD variable
        source_path: path of file to transfer on local machine.
        dest_folder: relative path on FTP server. Usually `latest/`
        dest_name: filename to give on FTP server """

FTP_HOST = "download.kiwix.org"
FTP_PORT = 21
FTP_USER = "nightlybot"


def getpasswd(pathname):
    settings = imp.load_source('settings', os.path.expanduser(pathname))
    return settings.FTP_PASSWD


def main(argv):

    if len(argv) != 4:
        print("Usage:\t{0} passwd_module_path source_path "
              "destination_folder destination_name\n\n"
              "Missing arguments.".format(sys.argv[0]))
        sys.exit(1)

    passwd_module_path, source_path, dest_folder, dest_name = argv
    FTP_PASSWD = getpasswd(passwd_module_path)
    filename = os.path.basename(source_path)

    if not os.path.exists(source_path):
        print("source_path not found: {}".format(source_path))

    # create a symlink from source file to dest
    # so that FTP can submit using wanted remote name
    if not os.path.exists(dest_name) and not IS_WIN:
        if hasattr(os, 'symlink'):
            os.symlink(source_path, dest_name)
        else:
            shutil.copy(source_path, dest_name)

    print("Connecting to {} with user {}".format(FTP_HOST, FTP_USER))
    if IS_WIN:
        ftp = FTP(FTP_HOST, FTP_USER, FTP_PASSWD)
    else:
        ftp = pexpect.spawn ('ftp -p {}'.format(FTP_HOST))
        ftp.expect ('Name .*: ')
        ftp.sendline (FTP_USER)
        ftp.expect ('Password:')
        ftp.sendline (FTP_PASSWD)
        ftp.expect ('ftp> ')
        if not ftp.before.strip().startswith('230'):
            print("Unable to authenticate user {}".format(FTP_USER))
            print(ftp.before)
            return 1
    print("Connected successfuly")

    print("Moving to directory {}".format(dest_folder))
    if IS_WIN:
        ftp.cwd(dest_folder)
    else:
        ftp.sendline ('cd {}'.format(dest_folder))
        ftp.expect('ftp> ')
        if not '250 ' in ftp.before.strip():
            print("Unable to move to directory `{}`".format(dest_folder))
            print(ftp.before)
            return 1

    print("Staring upload of {} to {}".format(filename, dest_name))
    if IS_WIN:
        ftp.storbinary('STOR {}'.format(dest_name),
                       open(source_path, 'rb'),
                       blocksize=8192 * 10)
    else:
        ftp.sendline ('put {}'.format(dest_name))
        ftp.expect('ftp> ', timeout=30*60)
        if not '226 ' in ftp.before.strip():
            print("Unable to complete tranfer.")
            print(ftp.before)
            return 1
        print(ftp.before.strip().split('\n')[-1])
    print("Transfer complete. Closing")

    if IS_WIN:
        ftp.quit()
    else:
        ftp.sendline ('bye')
    return 0

if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))