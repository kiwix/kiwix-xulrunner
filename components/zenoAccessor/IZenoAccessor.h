/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM IZenoAccessor.idl
 */

#ifndef __gen_IZenoAccessor_h__
#define __gen_IZenoAccessor_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIURI; /* forward declaration */

class nsACString; /* forward declaration */


/* starting interface:    IZenoAccessor */
#define IZENOACCESSOR_IID_STR "0e41f9d0-f08e-11dd-ba2f-0800200c9a66"

#define IZENOACCESSOR_IID \
  {0x0e41f9d0, 0xf08e, 0x11dd, \
    { 0xba, 0x2f, 0x08, 0x00, 0x20, 0x0c, 0x9a, 0x66 }}

class NS_NO_VTABLE NS_SCRIPTABLE IZenoAccessor : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(IZENOACCESSOR_IID)

  /* ACString loadFile (in string path); */
  NS_SCRIPTABLE NS_IMETHOD LoadFile(const char *path, nsACString & _retval) = 0;

  /* ACString getContent (in nsIURI url, out string contentType); */
  NS_SCRIPTABLE NS_IMETHOD GetContent(nsIURI *url, char **contentType, nsACString & _retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(IZenoAccessor, IZENOACCESSOR_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_IZENOACCESSOR \
  NS_SCRIPTABLE NS_IMETHOD LoadFile(const char *path, nsACString & _retval); \
  NS_SCRIPTABLE NS_IMETHOD GetContent(nsIURI *url, char **contentType, nsACString & _retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_IZENOACCESSOR(_to) \
  NS_SCRIPTABLE NS_IMETHOD LoadFile(const char *path, nsACString & _retval) { return _to LoadFile(path, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetContent(nsIURI *url, char **contentType, nsACString & _retval) { return _to GetContent(url, contentType, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_IZENOACCESSOR(_to) \
  NS_SCRIPTABLE NS_IMETHOD LoadFile(const char *path, nsACString & _retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->LoadFile(path, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetContent(nsIURI *url, char **contentType, nsACString & _retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetContent(url, contentType, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class _MYCLASS_ : public IZenoAccessor
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_IZENOACCESSOR

  _MYCLASS_();

private:
  ~_MYCLASS_();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(_MYCLASS_, IZenoAccessor)

_MYCLASS_::_MYCLASS_()
{
  /* member initializers and constructor code */
}

_MYCLASS_::~_MYCLASS_()
{
  /* destructor code */
}

/* ACString loadFile (in string path); */
NS_IMETHODIMP _MYCLASS_::LoadFile(const char *path, nsACString & _retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* ACString getContent (in nsIURI url, out string contentType); */
NS_IMETHODIMP _MYCLASS_::GetContent(nsIURI *url, char **contentType, nsACString & _retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_IZenoAccessor_h__ */
