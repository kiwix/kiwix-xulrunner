/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/XR-Trunk/Linux_2.6.18-8.el5_Depend/mozilla/xpcom/io/nsIScriptableStreams.idl
 */

#ifndef __gen_nsIScriptableStreams_h__
#define __gen_nsIScriptableStreams_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIVariant; /* forward declaration */

class nsIFile; /* forward declaration */

class nsIInputStream; /* forward declaration */

class nsIOutputStream; /* forward declaration */

class nsIUnicharInputStream; /* forward declaration */

class nsIUnicharOutputStream; /* forward declaration */


/* starting interface:    nsIScriptableIOInputStream */
#define NS_ISCRIPTABLEIOINPUTSTREAM_IID_STR "9245740d-d22e-4065-a1a0-72f0ae45e6df"

#define NS_ISCRIPTABLEIOINPUTSTREAM_IID \
  {0x9245740d, 0xd22e, 0x4065, \
    { 0xa1, 0xa0, 0x72, 0xf0, 0xae, 0x45, 0xe6, 0xdf }}

/**
 * Streams used with scriptable IO, which is itself located within netwerk.
 */
class NS_NO_VTABLE nsIScriptableIOInputStream : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ISCRIPTABLEIOINPUTSTREAM_IID)

  /**
   * Called to initialize the stream.
   */
  /* void initWithStreams (in nsIInputStream aStream, in nsIUnicharInputStream aCharStream); */
  NS_IMETHOD InitWithStreams(nsIInputStream *aStream, nsIUnicharInputStream *aCharStream) = 0;

  /**
   * Read string of aCount characters from the stream. If the stream is
   * text, then the characters are read in the expected character set.
   * If the stream is non-text aCount bytes are read and returned as a
   * string. If the end of the stream, or the end of the available data
   * is reached, the returned string may be shorter than the desired
   * length.
   *
   * @param aCount the number of characters to read
   * @returns the string read from the stream 
   */
  /* AString readString (in unsigned long aCount); */
  NS_IMETHOD ReadString(PRUint32 aCount, nsAString & _retval) = 0;

  /**
   * Read from the stream until an end of line is reached and return a string
   * containing all characters up until that point. An end of line is
   * indicated by a 0x0A, 0x0D, a sequence of 0x0A 0x0D or a sequence of
   * 0x0D 0x0A. These characters are not returned as part of the string.
   *
   * @returns the next line from the stream
   */
  /* AString readLine (); */
  NS_IMETHOD ReadLine(nsAString & _retval) = 0;

  /**
   * Read a single byte from a stream and return false if the byte is zero and
   * true if the byte is non-zero.
   *
   * @param a boolean value for the next byte in the stream
   */
  /* boolean readBoolean (); */
  NS_IMETHOD ReadBoolean(PRBool *_retval) = 0;

  /**
   * Read a single byte from a stream.
   *
   * @returns the next byte in the stream
   */
  /* octet read8 (); */
  NS_IMETHOD Read8(PRUint8 *_retval) = 0;

  /**
   * Read and interpret the next two bytes in the stream as an unsigned
   * big endian integer.
   *
   * @returns the next 16-bit integer in the stream
   */
  /* unsigned short read16 (); */
  NS_IMETHOD Read16(PRUint16 *_retval) = 0;

  /**
   * Read and interpret the next four bytes in the stream as an unsigned
   * big endian integer.
   *
   * @returns the next 32-bit integer in the stream
   */
  /* unsigned long read32 (); */
  NS_IMETHOD Read32(PRUint32 *_retval) = 0;

  /**
   * Read and interpret the next four bytes in the stream as a floating point
   * value.
   *
   * @returns the next float in the stream
   */
  /* float readFloat (); */
  NS_IMETHOD ReadFloat(float *_retval) = 0;

  /**
   * Read and interpret the next eight bytes in the stream as a double
   * floating point value.
   *
   * @returns the next double in the stream
   */
  /* double readDouble (); */
  NS_IMETHOD ReadDouble(double *_retval) = 0;

  /**
   * Read aCount bytes from the stream and fill the aBytes array with
   * the bytes.
   *
   * @param aCount the number of bytes to read
   * @param aBytes [out] set to the array of read bytes
   */
  /* void readByteArray (in unsigned long aCount, [array, size_is (aCount), retval] out octet aBytes); */
  NS_IMETHOD ReadByteArray(PRUint32 aCount, PRUint8 **aBytes) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIScriptableIOInputStream, NS_ISCRIPTABLEIOINPUTSTREAM_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSISCRIPTABLEIOINPUTSTREAM \
  NS_IMETHOD InitWithStreams(nsIInputStream *aStream, nsIUnicharInputStream *aCharStream); \
  NS_IMETHOD ReadString(PRUint32 aCount, nsAString & _retval); \
  NS_IMETHOD ReadLine(nsAString & _retval); \
  NS_IMETHOD ReadBoolean(PRBool *_retval); \
  NS_IMETHOD Read8(PRUint8 *_retval); \
  NS_IMETHOD Read16(PRUint16 *_retval); \
  NS_IMETHOD Read32(PRUint32 *_retval); \
  NS_IMETHOD ReadFloat(float *_retval); \
  NS_IMETHOD ReadDouble(double *_retval); \
  NS_IMETHOD ReadByteArray(PRUint32 aCount, PRUint8 **aBytes); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSISCRIPTABLEIOINPUTSTREAM(_to) \
  NS_IMETHOD InitWithStreams(nsIInputStream *aStream, nsIUnicharInputStream *aCharStream) { return _to InitWithStreams(aStream, aCharStream); } \
  NS_IMETHOD ReadString(PRUint32 aCount, nsAString & _retval) { return _to ReadString(aCount, _retval); } \
  NS_IMETHOD ReadLine(nsAString & _retval) { return _to ReadLine(_retval); } \
  NS_IMETHOD ReadBoolean(PRBool *_retval) { return _to ReadBoolean(_retval); } \
  NS_IMETHOD Read8(PRUint8 *_retval) { return _to Read8(_retval); } \
  NS_IMETHOD Read16(PRUint16 *_retval) { return _to Read16(_retval); } \
  NS_IMETHOD Read32(PRUint32 *_retval) { return _to Read32(_retval); } \
  NS_IMETHOD ReadFloat(float *_retval) { return _to ReadFloat(_retval); } \
  NS_IMETHOD ReadDouble(double *_retval) { return _to ReadDouble(_retval); } \
  NS_IMETHOD ReadByteArray(PRUint32 aCount, PRUint8 **aBytes) { return _to ReadByteArray(aCount, aBytes); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSISCRIPTABLEIOINPUTSTREAM(_to) \
  NS_IMETHOD InitWithStreams(nsIInputStream *aStream, nsIUnicharInputStream *aCharStream) { return !_to ? NS_ERROR_NULL_POINTER : _to->InitWithStreams(aStream, aCharStream); } \
  NS_IMETHOD ReadString(PRUint32 aCount, nsAString & _retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ReadString(aCount, _retval); } \
  NS_IMETHOD ReadLine(nsAString & _retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ReadLine(_retval); } \
  NS_IMETHOD ReadBoolean(PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ReadBoolean(_retval); } \
  NS_IMETHOD Read8(PRUint8 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Read8(_retval); } \
  NS_IMETHOD Read16(PRUint16 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Read16(_retval); } \
  NS_IMETHOD Read32(PRUint32 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Read32(_retval); } \
  NS_IMETHOD ReadFloat(float *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ReadFloat(_retval); } \
  NS_IMETHOD ReadDouble(double *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ReadDouble(_retval); } \
  NS_IMETHOD ReadByteArray(PRUint32 aCount, PRUint8 **aBytes) { return !_to ? NS_ERROR_NULL_POINTER : _to->ReadByteArray(aCount, aBytes); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsScriptableIOInputStream : public nsIScriptableIOInputStream
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSISCRIPTABLEIOINPUTSTREAM

  nsScriptableIOInputStream();

private:
  ~nsScriptableIOInputStream();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsScriptableIOInputStream, nsIScriptableIOInputStream)

nsScriptableIOInputStream::nsScriptableIOInputStream()
{
  /* member initializers and constructor code */
}

nsScriptableIOInputStream::~nsScriptableIOInputStream()
{
  /* destructor code */
}

/* void initWithStreams (in nsIInputStream aStream, in nsIUnicharInputStream aCharStream); */
NS_IMETHODIMP nsScriptableIOInputStream::InitWithStreams(nsIInputStream *aStream, nsIUnicharInputStream *aCharStream)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* AString readString (in unsigned long aCount); */
NS_IMETHODIMP nsScriptableIOInputStream::ReadString(PRUint32 aCount, nsAString & _retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* AString readLine (); */
NS_IMETHODIMP nsScriptableIOInputStream::ReadLine(nsAString & _retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean readBoolean (); */
NS_IMETHODIMP nsScriptableIOInputStream::ReadBoolean(PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* octet read8 (); */
NS_IMETHODIMP nsScriptableIOInputStream::Read8(PRUint8 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* unsigned short read16 (); */
NS_IMETHODIMP nsScriptableIOInputStream::Read16(PRUint16 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* unsigned long read32 (); */
NS_IMETHODIMP nsScriptableIOInputStream::Read32(PRUint32 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* float readFloat (); */
NS_IMETHODIMP nsScriptableIOInputStream::ReadFloat(float *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* double readDouble (); */
NS_IMETHODIMP nsScriptableIOInputStream::ReadDouble(double *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void readByteArray (in unsigned long aCount, [array, size_is (aCount), retval] out octet aBytes); */
NS_IMETHODIMP nsScriptableIOInputStream::ReadByteArray(PRUint32 aCount, PRUint8 **aBytes)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


/* starting interface:    nsIScriptableIOOutputStream */
#define NS_ISCRIPTABLEIOOUTPUTSTREAM_IID_STR "11fae7e6-df5b-4d80-b4c9-61849378364d"

#define NS_ISCRIPTABLEIOOUTPUTSTREAM_IID \
  {0x11fae7e6, 0xdf5b, 0x4d80, \
    { 0xb4, 0xc9, 0x61, 0x84, 0x93, 0x78, 0x36, 0x4d }}

class NS_NO_VTABLE nsIScriptableIOOutputStream : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ISCRIPTABLEIOOUTPUTSTREAM_IID)

  /**
   * Called to initialize the stream.
   */
  /* void initWithStreams (in nsIOutputStream aStream, in nsIUnicharOutputStream aCharStream); */
  NS_IMETHOD InitWithStreams(nsIOutputStream *aStream, nsIUnicharOutputStream *aCharStream) = 0;

  /**
   * Write the string aString to the stream. For text streams, the string is
   * written in the expected character set. For other streams, the string is
   * interpreted as bytes, which means that characters above 255 are only
   * written using their low 8 bits.
   *
   * @param aString the string to write
   * @returns true if the entire string was written, false otherwise
   */
  /* boolean writeString (in AString aString); */
  NS_IMETHOD WriteString(const nsAString & aString, PRBool *_retval) = 0;

  /**
   * Write a boolean to the stream. If the boolean is false, 0 is written,
   * and if the boolean is true, 1 is written.
   *
   * @param aBoolean the value to write
   */
  /* void writeBoolean (in boolean aBoolean); */
  NS_IMETHOD WriteBoolean(PRBool aBoolean) = 0;

  /**
   * Write a single byte to the stream.
   *
   * @param aByte the value to write
   */
  /* void write8 (in octet aByte); */
  NS_IMETHOD Write8(PRUint8 aByte) = 0;

  /**
   * Write a 16-bit integer to the stream as an unsigned big endian value.
   *
   * @param a16 the value to write
   */
  /* void write16 (in unsigned short a16); */
  NS_IMETHOD Write16(PRUint16 a16) = 0;

  /**
   * Write a 32-bit integer to the stream as an unsigned big endian value.
   *
   * @param a32 the value to write
   */
  /* void write32 (in unsigned long a32); */
  NS_IMETHOD Write32(PRUint32 a32) = 0;

  /**
   * Write a floating point value to the stream in 4 bytes.
   *
   * @param aFloat the value to write
   */
  /* void writeFloat (in float aFloat); */
  NS_IMETHOD WriteFloat(float aFloat) = 0;

  /**
   * Write a double floating point value to the stream in 8 bytes.
   *
   * @param aDouble the value to write
   */
  /* void writeDouble (in double aDouble); */
  NS_IMETHOD WriteDouble(double aDouble) = 0;

  /**
   * Write aCount values from the array aBytes to the stream.
   *
   * @param aBytes the array of write
   * @param aCount the number of bytes to write
   */
  /* void writeByteArray ([array, size_is (aCount)] in octet aBytes, in unsigned long aCount); */
  NS_IMETHOD WriteByteArray(PRUint8 *aBytes, PRUint32 aCount) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIScriptableIOOutputStream, NS_ISCRIPTABLEIOOUTPUTSTREAM_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSISCRIPTABLEIOOUTPUTSTREAM \
  NS_IMETHOD InitWithStreams(nsIOutputStream *aStream, nsIUnicharOutputStream *aCharStream); \
  NS_IMETHOD WriteString(const nsAString & aString, PRBool *_retval); \
  NS_IMETHOD WriteBoolean(PRBool aBoolean); \
  NS_IMETHOD Write8(PRUint8 aByte); \
  NS_IMETHOD Write16(PRUint16 a16); \
  NS_IMETHOD Write32(PRUint32 a32); \
  NS_IMETHOD WriteFloat(float aFloat); \
  NS_IMETHOD WriteDouble(double aDouble); \
  NS_IMETHOD WriteByteArray(PRUint8 *aBytes, PRUint32 aCount); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSISCRIPTABLEIOOUTPUTSTREAM(_to) \
  NS_IMETHOD InitWithStreams(nsIOutputStream *aStream, nsIUnicharOutputStream *aCharStream) { return _to InitWithStreams(aStream, aCharStream); } \
  NS_IMETHOD WriteString(const nsAString & aString, PRBool *_retval) { return _to WriteString(aString, _retval); } \
  NS_IMETHOD WriteBoolean(PRBool aBoolean) { return _to WriteBoolean(aBoolean); } \
  NS_IMETHOD Write8(PRUint8 aByte) { return _to Write8(aByte); } \
  NS_IMETHOD Write16(PRUint16 a16) { return _to Write16(a16); } \
  NS_IMETHOD Write32(PRUint32 a32) { return _to Write32(a32); } \
  NS_IMETHOD WriteFloat(float aFloat) { return _to WriteFloat(aFloat); } \
  NS_IMETHOD WriteDouble(double aDouble) { return _to WriteDouble(aDouble); } \
  NS_IMETHOD WriteByteArray(PRUint8 *aBytes, PRUint32 aCount) { return _to WriteByteArray(aBytes, aCount); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSISCRIPTABLEIOOUTPUTSTREAM(_to) \
  NS_IMETHOD InitWithStreams(nsIOutputStream *aStream, nsIUnicharOutputStream *aCharStream) { return !_to ? NS_ERROR_NULL_POINTER : _to->InitWithStreams(aStream, aCharStream); } \
  NS_IMETHOD WriteString(const nsAString & aString, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->WriteString(aString, _retval); } \
  NS_IMETHOD WriteBoolean(PRBool aBoolean) { return !_to ? NS_ERROR_NULL_POINTER : _to->WriteBoolean(aBoolean); } \
  NS_IMETHOD Write8(PRUint8 aByte) { return !_to ? NS_ERROR_NULL_POINTER : _to->Write8(aByte); } \
  NS_IMETHOD Write16(PRUint16 a16) { return !_to ? NS_ERROR_NULL_POINTER : _to->Write16(a16); } \
  NS_IMETHOD Write32(PRUint32 a32) { return !_to ? NS_ERROR_NULL_POINTER : _to->Write32(a32); } \
  NS_IMETHOD WriteFloat(float aFloat) { return !_to ? NS_ERROR_NULL_POINTER : _to->WriteFloat(aFloat); } \
  NS_IMETHOD WriteDouble(double aDouble) { return !_to ? NS_ERROR_NULL_POINTER : _to->WriteDouble(aDouble); } \
  NS_IMETHOD WriteByteArray(PRUint8 *aBytes, PRUint32 aCount) { return !_to ? NS_ERROR_NULL_POINTER : _to->WriteByteArray(aBytes, aCount); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsScriptableIOOutputStream : public nsIScriptableIOOutputStream
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSISCRIPTABLEIOOUTPUTSTREAM

  nsScriptableIOOutputStream();

private:
  ~nsScriptableIOOutputStream();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsScriptableIOOutputStream, nsIScriptableIOOutputStream)

nsScriptableIOOutputStream::nsScriptableIOOutputStream()
{
  /* member initializers and constructor code */
}

nsScriptableIOOutputStream::~nsScriptableIOOutputStream()
{
  /* destructor code */
}

/* void initWithStreams (in nsIOutputStream aStream, in nsIUnicharOutputStream aCharStream); */
NS_IMETHODIMP nsScriptableIOOutputStream::InitWithStreams(nsIOutputStream *aStream, nsIUnicharOutputStream *aCharStream)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean writeString (in AString aString); */
NS_IMETHODIMP nsScriptableIOOutputStream::WriteString(const nsAString & aString, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void writeBoolean (in boolean aBoolean); */
NS_IMETHODIMP nsScriptableIOOutputStream::WriteBoolean(PRBool aBoolean)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void write8 (in octet aByte); */
NS_IMETHODIMP nsScriptableIOOutputStream::Write8(PRUint8 aByte)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void write16 (in unsigned short a16); */
NS_IMETHODIMP nsScriptableIOOutputStream::Write16(PRUint16 a16)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void write32 (in unsigned long a32); */
NS_IMETHODIMP nsScriptableIOOutputStream::Write32(PRUint32 a32)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void writeFloat (in float aFloat); */
NS_IMETHODIMP nsScriptableIOOutputStream::WriteFloat(float aFloat)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void writeDouble (in double aDouble); */
NS_IMETHODIMP nsScriptableIOOutputStream::WriteDouble(double aDouble)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void writeByteArray ([array, size_is (aCount)] in octet aBytes, in unsigned long aCount); */
NS_IMETHODIMP nsScriptableIOOutputStream::WriteByteArray(PRUint8 *aBytes, PRUint32 aCount)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIScriptableStreams_h__ */
