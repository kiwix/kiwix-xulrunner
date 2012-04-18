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

};

/* Implementation file */
NS_IMPL_ISUPPORTS1(ServerManager, IServerManager)

/* Constructor */
ServerManager::ServerManager() {
}

/* Destructor */
ServerManager::~ServerManager() {
}

NS_IMETHODIMP ServerManager::Start(const nsAString &libraryPath, const nsAString &port, mozbool *retVal) {
  *retVal = PR_TRUE;
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
  mib[3]=this->aria2cPid;
  
  int ret = sysctl(mib, MIBSIZE, &kp, &len, NULL, 0);
  if (ret != -1 && len > 0) {
    *retVal = PR_TRUE;
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
  return NS_OK;
}

NS_IMETHODIMP ServerManager::GetLocalIp(nsACString &ip, mozbool *retVal) {
  *retVal = PR_TRUE;
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
