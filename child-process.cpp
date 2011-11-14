/*
 * Copyright 2011 Emmanuel Engelhart <kelson@kiwix.org>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU  General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301, USA.
 */

#include <string>
#include <iostream>
#include <stdio.h>
#include <stdlib.h>

#ifdef _WIN32
#include <Windows.h>
#endif

using namespace std;

int main(int argc, char* argv[]) {
  if (argc<2) {
    cerr << "Usage: child-process PPID" << endl;
    return 1;
  }
  string PPIDString = argv[1];
  unsigned int PPID = atoi(PPIDString.c_str());
  cout << "child-process: PPID is " << PPID << endl; 

  bool waiting = true;
  do {

#ifdef _WIN32
    HANDLE process = OpenProcess(SYNCHRONIZE, FALSE, PPID);
    DWORD ret = WaitForSingleObject(process, 0);
    CloseHandle(process);
    if (ret == WAIT_TIMEOUT) {
      Sleep(1000);
#elif __APPLE__
    const string PNAME = "parent-process";
    string procPath = "/usr/bin/killall -s " + PNAME + " &> /dev/null";
    if (system(procPath.c_str()) == 0) {
      sleep(1);
#else
    string procPath = "/proc/" + string(PPIDString);
    if (access(procPath.c_str(), F_OK) != -1) {
     sleep(1);
#endif
      cout << "child-process: PPID " << PPIDString << " is running" << endl;
    } else {
      cout << "child-process: PPID " << PPIDString << " is NOT running" << endl;
      waiting = false;
    }
  } while (waiting);

  cout << "child-process: exiting..." << endl; 
  return 0;
}

