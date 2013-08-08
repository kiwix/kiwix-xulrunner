#!/usr/bin/env python
# -*- coding: utf-8 -*-
# vim: ai ts=4 sts=4 et sw=4 nu

import os
import shutil
import sys
import imp
import subprocess

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
IS_WIN = os.name == 'nt'


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

    if not os.path.exists(source_path):
        print("source_path not found: {}".format(source_path))

    # create a symlink from source file to dest
    # so that FTP can submit using wanted remote name
    if not os.path.exists(dest_name):
        if hasattr(os, 'symlink'):
            os.symlink(source_path, dest_name)
        else:
            shutil.copy(source_path, dest_name)

    if IS_WIN:
        script = ("open -u {user},{passwd} {host}\n\r"
                  "cd {dest_folder}\n\r"
                  "put {dest_name}\n\r"
                  "quit")
        script_name = 'ftp_cmd.txt'
    else:
        script = ("machine {host} login {user} password {passwd}\n\n"
                  "macdef init\n"
                  "put {dest_name} {dest_folder}/\n"
                  "quit\n\n\n")
        script_name = 'netrc'

    f = open(script_name, 'w')
    f.write(script.format(user=FTP_USER, passwd=FTP_PASSWD,
                          host=FTP_HOST, dest_folder=dest_folder,
                          dest_name=dest_name))
    f.close()

    if IS_WIN:
        cmd = "lftp -f {script}"
    else:
        cmd = "ftp -p -N {script} {host}"
    cmd = cmd.format(script=script_name, host=FTP_HOST)

    return subprocess.call(cmd.split())

if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
