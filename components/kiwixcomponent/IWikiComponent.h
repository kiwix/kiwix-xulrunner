/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM IWikiComponent.idl
 */

#ifndef __gen_IWikiComponent_h__
#define __gen_IWikiComponent_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    iWikiSearch */
#define IWIKISEARCH_IID_STR "d60c4196-1f36-43bc-9957-240bd0392837"

#define IWIKISEARCH_IID \
  {0xd60c4196, 0x1f36, 0x43bc, \
    { 0x99, 0x57, 0x24, 0x0b, 0xd0, 0x39, 0x28, 0x37 }}

class NS_NO_VTABLE iWikiSearch : public nsISupports {
 public: 

  NS_DEFINE_STATIC_IID_ACCESSOR(IWIKISEARCH_IID)

  /* PRUint32 search (in AUTF8String word); */
  NS_IMETHOD Search(const nsACString & word, PRUint32 *_retval) = 0;

  /* string getResult (in PRUint32 idx); */
  NS_IMETHOD GetResult(PRUint32 idx, char **_retval) = 0;

  /* string getTitle (in PRUint32 idx); */
  NS_IMETHOD GetTitle(PRUint32 idx, char **_retval) = 0;

  /* PRUint32 getScore (in PRUint32 idx); */
  NS_IMETHOD GetScore(PRUint32 idx, PRUint32 *_retval) = 0;

  /* string getRootPath (); */
  NS_IMETHOD GetRootPath(char **_retval) = 0;

  /* string getVocSpe (in PRUint32 idx); */
  NS_IMETHOD GetVocSpe(PRUint32 idx, char **_retval) = 0;

  /* PRUint32 completionStart (in AUTF8String word); */
  NS_IMETHOD CompletionStart(const nsACString & word, PRUint32 *_retval) = 0;

  /* string getCompletion (in PRUint32 idx); */
  NS_IMETHOD GetCompletion(PRUint32 idx, char **_retval) = 0;

};

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_IWIKISEARCH \
  NS_IMETHOD Search(const nsACString & word, PRUint32 *_retval); \
  NS_IMETHOD GetResult(PRUint32 idx, char **_retval); \
  NS_IMETHOD GetTitle(PRUint32 idx, char **_retval); \
  NS_IMETHOD GetScore(PRUint32 idx, PRUint32 *_retval); \
  NS_IMETHOD GetRootPath(char **_retval); \
  NS_IMETHOD GetVocSpe(PRUint32 idx, char **_retval); \
  NS_IMETHOD CompletionStart(const nsACString & word, PRUint32 *_retval); \
  NS_IMETHOD GetCompletion(PRUint32 idx, char **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_IWIKISEARCH(_to) \
  NS_IMETHOD Search(const nsACString & word, PRUint32 *_retval) { return _to Search(word, _retval); } \
  NS_IMETHOD GetResult(PRUint32 idx, char **_retval) { return _to GetResult(idx, _retval); } \
  NS_IMETHOD GetTitle(PRUint32 idx, char **_retval) { return _to GetTitle(idx, _retval); } \
  NS_IMETHOD GetScore(PRUint32 idx, PRUint32 *_retval) { return _to GetScore(idx, _retval); } \
  NS_IMETHOD GetRootPath(char **_retval) { return _to GetRootPath(_retval); } \
  NS_IMETHOD GetVocSpe(PRUint32 idx, char **_retval) { return _to GetVocSpe(idx, _retval); } \
  NS_IMETHOD CompletionStart(const nsACString & word, PRUint32 *_retval) { return _to CompletionStart(word, _retval); } \
  NS_IMETHOD GetCompletion(PRUint32 idx, char **_retval) { return _to GetCompletion(idx, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_IWIKISEARCH(_to) \
  NS_IMETHOD Search(const nsACString & word, PRUint32 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Search(word, _retval); } \
  NS_IMETHOD GetResult(PRUint32 idx, char **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetResult(idx, _retval); } \
  NS_IMETHOD GetTitle(PRUint32 idx, char **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetTitle(idx, _retval); } \
  NS_IMETHOD GetScore(PRUint32 idx, PRUint32 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetScore(idx, _retval); } \
  NS_IMETHOD GetRootPath(char **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetRootPath(_retval); } \
  NS_IMETHOD GetVocSpe(PRUint32 idx, char **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetVocSpe(idx, _retval); } \
  NS_IMETHOD CompletionStart(const nsACString & word, PRUint32 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CompletionStart(word, _retval); } \
  NS_IMETHOD GetCompletion(PRUint32 idx, char **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCompletion(idx, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class _MYCLASS_ : public iWikiSearch
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_IWIKISEARCH

  _MYCLASS_();

private:
  ~_MYCLASS_();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(_MYCLASS_, iWikiSearch)

_MYCLASS_::_MYCLASS_()
{
  /* member initializers and constructor code */
}

_MYCLASS_::~_MYCLASS_()
{
  /* destructor code */
}

/* PRUint32 search (in AUTF8String word); */
NS_IMETHODIMP _MYCLASS_::Search(const nsACString & word, PRUint32 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* string getResult (in PRUint32 idx); */
NS_IMETHODIMP _MYCLASS_::GetResult(PRUint32 idx, char **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* string getTitle (in PRUint32 idx); */
NS_IMETHODIMP _MYCLASS_::GetTitle(PRUint32 idx, char **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* PRUint32 getScore (in PRUint32 idx); */
NS_IMETHODIMP _MYCLASS_::GetScore(PRUint32 idx, PRUint32 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* string getRootPath (); */
NS_IMETHODIMP _MYCLASS_::GetRootPath(char **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* string getVocSpe (in PRUint32 idx); */
NS_IMETHODIMP _MYCLASS_::GetVocSpe(PRUint32 idx, char **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* PRUint32 completionStart (in AUTF8String word); */
NS_IMETHODIMP _MYCLASS_::CompletionStart(const nsACString & word, PRUint32 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* string getCompletion (in PRUint32 idx); */
NS_IMETHODIMP _MYCLASS_::GetCompletion(PRUint32 idx, char **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_IWikiComponent_h__ */
