/*                                                                                                                                                           * Copyright 2011 Emmanuel Engelhart <kelson@kiwix.org>                                                                                                      *                                                                                                                                                           * This program is free software; you can redistribute it and/or modify                                                                                      * it under the terms of the GNU  General Public License as published by                                                                                     * the Free Software Foundation; either version 3 of the License, or                                                                                         * any later version.                                                                                                                                        *                                                                                                                                                           * This program is distributed in the hope that it will be useful,                                                                                           * but WITHOUT ANY WARRANTY; without even the implied warranty of                                                                                            * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the                                                                                              * GNU General Public License for more details.                                                                                                              *                                                                                                                                                           * You should have received a copy of the GNU General Public License                                                                                         * along with this program; if not, write to the Free Software                                                                                               * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,                                                                                                * MA 02110-1301, USA.                                                                                                                                       */

#include <string>
#include <iostream>
#include <stdio.h>
#include <stdlib.h>

using namespace std;

int main(int argc, char* argv[]) {
  if (argc<2) {
    cerr << "Usage: child-process PPID" << endl;
    return 1;
  }

  unsigned int PPID = atoi(argv[1]);
  cout << "child-process: PPID is " << PPID << endl; 

  string procPath = "/proc/" + string(argv[1]);
  bool waiting = true;
  do {
    if (access(procPath.c_str(), F_OK) != -1) {
      cout << "child-process: PPID " << argv[1] << " is running" << endl;
      sleep(1);
    } else {
      cout << "child-process: PPID " << argv[1] << " is NOT running" << endl;
      waiting = false;
    }
  } while (waiting);

  cout << "child-process: exiting..." << endl; 
  return 0;
}

