#ifndef LIST_H_
#define LIST_H_


#ifdef XPCOM_BUILD
#include "prtypes.h"
typedef PRInt16 intIndexArticle;
typedef PRInt32 intOffset;
typedef PRInt32 intIndex;
#else
#include "sys/types.h"
typedef int16_t intIndexArticle;
typedef int32_t intOffset;
typedef int32_t intIndex;
#endif

void *gg_malloc( long size );
void gg_free( void *ptr );
	
class listElements {
	
public:
  listElements( int sz );
  ~listElements();
  listElements( listElements* l1, listElements* l2 );
  listElements( listElements* l1, listElements* l2, int type );
  void intersectWith( listElements* l );
  void insertArray( const intIndex* a, intIndex codeStop );
  void insertArrayArticle( const intIndex* a, intIndex codeStop );
  void insertAllArray( const intIndex* a, intIndex exclude );
  void insertAllArrayArticle( const intIndex* a, intIndex exclude );
  void insertAllArray( const intIndex* a, intIndex exclude, intIndex codeStop );  
  void insert( intIndex e );
  void sortElements();
  void sortCounts();
  void setCount( int i, intIndex c );
  intIndex count( int i );
  intIndex element( int i );
  void cut( int i );
  int  length() const {return maxElement;}
  void fillIndexZero();
  void addCount( int idx, int c );
  void cutZero();
  void debug( const char *text );
  
protected:
  int size;
  int maxElement;
  intIndex *list;
  int *len;
};


#endif /*LIST_H_*/
