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
#include <sys/types.h>
#include <unistd.h>
#include <stdio.h>

using namespace std;

int main(int argc, char** argv) {
  unsigned int delay = 10;
  string childBinaryPath="child-process";

  /* Get PPID */
  pid_t PID = getpid(); 
  cout << "parent-process: PID is " << PID << endl;

  /* Launch child-process */
  char PIDStr[10];
  sprintf(PIDStr, "%d", PID);
  cout << "parent-process: launching child-process from path " << childBinaryPath << "..."<< endl;

  PID = fork();
  switch (PID) {
  case -1:
    cerr << "parent-process: Unable to fork" << endl;
    return 1;
    break;
  case 0: /* This is the child process */
    if (execl(childBinaryPath.c_str(), childBinaryPath.c_str(), PIDStr, NULL) == -1) {
      cerr << "parent-process: unable to start child-process from path " << childBinaryPath << endl;
      return 1;
    }
    return 0;
    break;
  default:
    cout << "parent-process: has forked successfuly" << endl;
    cout << "parent-process: child-process PID is " << PID << endl;
    break;
  }

  /* Start countdown */
  cout << "parent-process: countdown started..." << endl;
  do {
    cout << "parent-process:" << delay << endl;
    sleep(1);
  } while (delay-- > 0);

  /* Exit, child-process should also exit consequently */
  cout << "parent-process: exiting..." << endl;

  return 0;
}
