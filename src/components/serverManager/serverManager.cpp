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

#include "xpcom-config.h"

#if GECKO_VERSION > 1
#if !defined(NS_ATTR_MALLOC)
  #define NS_ATTR_MALLOC
  #endif

#if !defined(NS_WARN_UNUSED_RESULT)
  #define NS_WARN_UNUSED_RESULT
  #endif

#if !defined(MOZ_CPP_EXCEPTIONS)
  #define MOZ_CPP_EXCEPTIONS
  #endif

  #include "mozilla/ModuleUtils.h"
  #include "nsIClassInfoImpl.h"
#else
  #include "nsIGenericFactory.h"
#endif

#if GECKO_VERSION > 9
  #define mozbool bool
#else
  #define mozbool PRBool
#endif

#ifdef _WIN32
#include <Windows.h>
#else
#include <unistd.h>
#include <signal.h>
#endif

#ifdef __APPLE__
#import <sys/types.h>
#import <sys/sysctl.h>
#define MIBSIZE 4
#endif

#include "IServerManager.h"
#include <string>
#include <iostream>

#include "nsXPCOM.h"
#include "nsEmbedString.h"
#include "nsStringAPI.h"

#include "nsIServiceManager.h"
#include "nsILocalFile.h"
#include "nsCOMPtr.h"
#include "nsIProperties.h"
#include "nsDirectoryServiceDefs.h"

#include <componentTools.h>

using namespace std;

class ServerManager : public IServerManager {

public:
  NS_DECL_ISUPPORTS
  NS_DECL_ISERVERMANAGER
  
  ServerManager();

private:
  ~ServerManager();

protected:
#ifdef _WIN32
  int serverPid;
#else
  pid_t serverPid;
#endif

  string url;
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(ServerManager, IServerManager)

/* Constructor */
ServerManager::ServerManager() :
serverPid(0) {
}

/* Destructor */
ServerManager::~ServerManager() {
}

NS_IMETHODIMP ServerManager::Start(const nsAString &binaryPath, const nsAString &libraryPaths, const nsAString &port, mozbool *retVal) {
  *retVal = PR_TRUE;
  const char *cBinaryPath = strdup(nsStringToCString(binaryPath));
  const char *cLibraryPaths = strdup(nsStringToCString(libraryPaths));
  const char *cPort = strdup(nsStringToCString(port));
  string commandLine;


  /* Compute server url */
  string ipString;
  char hostName[255];
  gethostname(hostName, 255);
  struct hostent *hostEntry=gethostbyname(hostName);
  if (hostEntry != NULL) {
    struct in_addr **addrList = (struct in_addr **)hostEntry->h_addr_list;
    for(int i = 0; addrList[i] != NULL; i++) {
      ipString = string(inet_ntoa(*addrList[i]));
    }
  } else {
    ipString = "127.0.0.1";
  }
  this->url = "http://" + ipString + ":" + string(cPort) + "/";

  /* Get PPID */
#ifdef _WIN32
  int PID = GetCurrentProcessId();
#else
  pid_t PID = getpid(); 
#endif

  /* Launch child-process */
  char PIDStr[10];
  sprintf(PIDStr, "%d", PID);

#ifdef _WIN32
  commandLine = string(cBinaryPath) + " --library --port=\"" + string(cPort) + "\" --attachToProcess=\"" + string(PIDStr) + "\" \"" + string(cLibraryPaths) + "\"";
  STARTUPINFO startInfo = {0};
  PROCESS_INFORMATION procInfo;
  startInfo.cb = sizeof(startInfo);

  if(CreateProcess(NULL, _strdup(commandLine.c_str()),  NULL, NULL, FALSE, 
		   CREATE_NO_WINDOW, NULL, NULL, &startInfo, &procInfo)) {
    this->serverPid = procInfo.dwProcessId;
    CloseHandle(procInfo.hProcess);
    CloseHandle(procInfo.hThread);
  } else {
    cerr << "Unable to start kiwix-serve.exe from path " << commandLine << endl;
    this->serverPid = 0;
    *retVal = PR_FALSE;
    return NS_OK;
  }
#else
  /* Essential to avoid zombie kiwix-server process */
  signal(SIGCHLD, SIG_IGN);

  PID = fork();
  const string portArgument = "--port=" + string(cPort);
  const string libraryPathsArgument = string(cLibraryPaths);
  const string attachToProcessArgument = "--attachToProcess=" + string(PIDStr);
  switch (PID) {
  case -1:
    cerr << "Unable to fork before launching kiwix-serve" << endl;
    this->serverPid = 0;
    *retVal = PR_FALSE;
    return NS_OK;
    break;
  case 0: /* This is the child process */
    commandLine = string(cBinaryPath);
    if (execl(commandLine.c_str(), commandLine.c_str(), "--library", portArgument.c_str(), attachToProcessArgument.c_str(), libraryPathsArgument.c_str(), NULL) == -1) {
      cerr << "Unable to start kiwix-serve from path " << commandLine << endl;
      this->serverPid = 0;
      *retVal = PR_FALSE;
    }
    return NS_OK;
    break;
  default:
    this->serverPid = PID;
    break;
  }
#endif

  return NS_OK;
}

NS_IMETHODIMP ServerManager::IsRunning(mozbool *retVal) {
  *retVal = PR_FALSE;

#ifdef _WIN32
  HANDLE process = OpenProcess(SYNCHRONIZE, FALSE, this->serverPid);
  DWORD ret = WaitForSingleObject(process, 0);
  CloseHandle(process);
  if (ret == WAIT_TIMEOUT)
    *retVal = PR_TRUE;
#elif __APPLE__
  int mib[MIBSIZE];
  struct kinfo_proc kp;
  size_t len = sizeof(kp);
  
  mib[0]=CTL_KERN;
  mib[1]=KERN_PROC;
  mib[2]=KERN_PROC_PID;
  mib[3]=this->serverPid;

  if (this->serverPid < 100) {
    // we know this can't be the server
    *retVal = PR_FALSE;
  } else {   
    int ret = sysctl(mib, MIBSIZE, &kp, &len, NULL, 0);
    if (ret != -1 && len > 0) {
      *retVal = PR_TRUE;
    }
  }
#else
    char PIDStr[10];
    sprintf(PIDStr, "%d", this->serverPid);
    string procPath = "/proc/" + string(PIDStr);
    if (access(procPath.c_str(), F_OK) != -1)
      *retVal = PR_TRUE;
#endif

  return NS_OK;
}

NS_IMETHODIMP ServerManager::Stop(mozbool *retVal) {
  *retVal = PR_TRUE;

#ifdef _WIN32
  HANDLE ps = OpenProcess( SYNCHRONIZE|PROCESS_TERMINATE, 
			   FALSE, this->serverPid);
  TerminateProcess(ps, 0);
#else
  kill(this->serverPid, SIGTERM);
  this->url = "";
#endif
  this->serverPid = 0;
  
  return NS_OK;
}

NS_IMETHODIMP ServerManager::GetServerUrl(nsACString &url, mozbool *retVal) {
  *retVal = PR_TRUE;
  url = nsDependentCString(this->url.data(), this->url.size());
  return NS_OK;
}

#if GECKO_VERSION > 1

NS_GENERIC_FACTORY_CONSTRUCTOR(ServerManager)
NS_DEFINE_NAMED_CID(ISERVERMANAGER_IID);
static const mozilla::Module::CIDEntry kServerManagerCIDs[] = {
  { &kISERVERMANAGER_IID, false, NULL, ServerManagerConstructor },
  { NULL }
};

static const mozilla::Module::ContractIDEntry kServerManagerContracts[] = {
  { "@kiwix.org/serverManager", &kISERVERMANAGER_IID },
  { NULL }
};

static const mozilla::Module kServerManagerModule = {
  mozilla::Module::kVersion,
  kServerManagerCIDs,
  kServerManagerContracts,
  NULL
};

NSMODULE_DEFN(nsServerManager) = &kServerManagerModule;
NS_IMPL_MOZILLA192_NSGETMODULE(&kServerManagerModule)
#else
NS_GENERIC_FACTORY_CONSTRUCTOR(ServerManager)

static const nsModuleComponentInfo components[] =
{
   { "serverManager",
     ISERVERMANAGER_IID,
     "@kiwix.org/serverManager",
     ServerManagerConstructor
   }
};

NS_IMPL_NSGETMODULE(nsServerManager, components)
#endif
