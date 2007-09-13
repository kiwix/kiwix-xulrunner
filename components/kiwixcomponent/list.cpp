/*  KiwixComponent - XP-COM component for Kiwix, offline reader of Wikipedia
    Copyright (C) 2007, LinterWeb (France), Fabien Coulon

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA */

#include "list.h"
#include <stdlib.h>
#include <stdio.h>

inline int minimum( int a, int b ) {

  return ( a>b )? b : a ;	
}

listElements::listElements( int sz ) {

  size = sz;
  maxElement = 0;
  if ( size > 0 ) list = (intIndex*)gg_malloc( 2*size*sizeof(intIndex ) );
  else list = NULL;
}

listElements::~listElements() {

  if ( size > 0 ) gg_free( list );
}

void listElements::cut( int i ) {

  if ( maxElement > i ) maxElement = i;
}

void listElements::cutZero() {

  int i;
  for ( i = 0 ; (i < maxElement)&&(list[2*i+1]) ; i++ ) ;;
  maxElement = i;
}

void listElements::fillIndexZero() {

  for ( int i = 0 ; i < size ; i++ ) {

    list[2*i] = i; list[2*i+1] = 0;
  }
  maxElement = size;
}

void listElements::addCount( int idx, int c ) {

  list[2*idx+1] += c;
}

listElements::listElements( listElements* l1, listElements* l2 ) {

  size = l1->maxElement + l2->maxElement;
  l1->sortElements(); l2->sortElements();
  if ( size > 0 ) 
    list = (intIndex*)gg_malloc( 2*size*sizeof(intIndex) );
  int i = 0;
  int j = 0;
  int k = 0;
  while (( i < l1->maxElement )||( j < l2->maxElement )) {
  	
  	if (( i == l1->maxElement )||((j<l2->maxElement)&&(l1->element(i) < l2->element(j)))) {
  	
  	  list[2*k] = l2->list[2*j];
  	  list[2*k+1] = l2->list[2*j+1];
  	  k++; j++;	
  	}
  	else if (( j == l2->maxElement )||((i<l1->maxElement)&&(l1->element(i) > l2->element(j)))) {
  	
  	  list[2*k] = l1->list[2*i];
  	  list[2*k+1] = l1->list[2*i+1];
  	  k++; i++;	
  	}
  	else {
  	  list[2*k] = l1->list[2*i];
  	  list[2*k+1] = l1->list[2*i+1] + l2->list[2*j+1];
  	  k++; i++; j++;	
  	}
  }
  maxElement = k;
  delete l1;
  delete l2;
}

listElements::listElements( listElements* l1, listElements* l2, int type ) {

  switch ( type ) {
  	
  	case 1: {
     size = minimum( l1->maxElement, l2->maxElement );
     l1->sortElements(); l2->sortElements();
     if ( size > 0 ) 
       list = (intIndex*)gg_malloc( 2*size*sizeof(intIndex) );
     int i = 0;
     int j = 0;
     int k = 0;
     while (( i < l1->maxElement )&&( j < l2->maxElement )) {
  	
  	   if ( l1->element(i) > l2->element(j) ) i++;
  	   else if ( l2->element(j) >l1->element(i) ) j++;
  	   else {
  	   	  list[2*k] = l1->list[2*i];
  	   	  list[2*k+1] = minimum( l1->list[2*i+1], l2->list[2*j+1] );
  	   	  i++; j++; k++;
  	   }
     }
     maxElement = k;
     delete l1;
     delete l2;  	  	
  	}
  	break;
  	default : printf( "Internal error, illegal call to listElements constructor\n");
  }	
}

void listElements::intersectWith( listElements* l ) {

   sortElements(); l->sortElements();
   int i = 0;
   int j = 0;
   int k = 0;
   while (( i < maxElement )&&( j < l->maxElement )) {
	
   if ( element(i) > l->element(j) ) i++;
     else if ( l->element(j) > element(i) ) j++;
     else {
     	  list[2*k] = list[2*i];
     	  list[2*k+1] = minimum( list[2*i+1], l->list[2*j+1] );
     	  i++; j++; k++;
     }
   }
   maxElement = k;
}

void listElements::debug( const char *text ) {

  printf( "%s, %d :", text, maxElement );
  int i;
  for ( i = 0 ; i < 4 ; i++ ) 
     printf( " (%d,%d)", list[2*i], list[2*i+1] );
  printf( " ... " );
  for ( i = maxElement-4 ; i < maxElement ; i++ ) 
     printf( " (%d,%d)", list[2*i], list[2*i+1] );  
  printf( "\n" );
}

void listElements::insert( intIndex e ) {
	
  int i;
  for ( i=0 ; i < maxElement ; i++ ) {
  	
  	if ( list[2*i] == e ) {
  	
  	  list[2*i+1] += 1;
  	  return;	
  	}
  }
  if ( i < size ) {
  	
  	list[2*i] = e;
  	list[2*i+1] = 1;
  	maxElement++;
  }
}

void listElements::insertArray( const intIndex* a, intIndex codeStop ) {

  int i;
  for ( i = 0 ; i < size ; i++ ) {
  	
  	if ( a[i] == codeStop ) {
  		
  	  maxElement = i;
  	  return;	
  	}
  	list[2*i] = a[i];
  	list[2*i+1] = 1;
  }
  maxElement = i;
}

void listElements::insertArrayArticle( const intIndex* a, intIndex codeStop ) {

  const intIndexArticle *aa = (intIndexArticle*)a;
  int i;
  for ( i = 0 ; i < size ; i++ ) {
  	
  	if ( aa[i] == codeStop ) {
  		
  	  maxElement = i;
  	  return;	
  	}
  	list[2*i] = aa[i];
  	list[2*i+1] = 1;
  }
  maxElement = i;
}

void listElements::insertAllArray( const intIndex* a, intIndex exclude ) {

  int i;
  for ( i = 0 ; (i < size)&&(a[i]!=exclude) ; i++ ) {
  	
      list[2*i] = a[i];
  	  list[2*i+1] = 1; 	
  	}
  for ( ; i < size-1 ; i++ ) {
  	
    list[2*i] = a[i+1];
    list[2*i+1] = 1; 	 	  
  }
  maxElement = i;
}

void listElements::insertAllArrayArticle( const intIndex* a, intIndex exclude ) {

  const intIndexArticle *aa = (intIndexArticle*)a;
  int i;
  for ( i = 0 ; (i < size)&&(aa[i]!=exclude) ; i++ ) {
  	
      list[2*i] = aa[i];
  	  list[2*i+1] = 1; 	
  	}
  for ( ; i < size-1 ; i++ ) {
  	
    list[2*i] = aa[i+1];
    list[2*i+1] = 1; 	 	  
  }
  maxElement = i;  	
}

void listElements::insertAllArray( const intIndex* a, intIndex exclude, intIndex codeStop ) {
	
  int i;
  for ( i = 0 ; (i < size)&&(a[i]!=exclude)&&(a[i]!=codeStop) ; i++ ) {
  	
      list[2*i] = a[i];
  	  list[2*i+1] = 1; 	
  	}
  if ( a[i] == codeStop ) { maxElement = i; return; }
  for ( ; (i < size-1)&&(a[i+1]!=codeStop) ; i++ ) {

    list[2*i] = a[i+1];
    list[2*i+1] = 1;
  }
  maxElement = i;	
}

void listElements::setCount( int i, intIndex c ) {

  list[2*i+1] = c;
}

intIndex listElements::count( int i ) {

  return list[2*i+1];	
}

intIndex listElements::element( int i ) {

  return list[2*i];	
}

static int listCountCompare( const intIndex* v1, const intIndex *v2 ) {
	
	return (*(v1+1)>*(v2+1))?-1:+1;
}

void listElements::sortCounts() {
	
  qsort( list, maxElement, 2*sizeof(intIndex), 
    (int(*) (const void*, const void*))listCountCompare );
}

static int listElementCompare( const intIndex* v1, const intIndex *v2 ) {
	
	return (*(v1)>*(v2))?-1:+1;
}

void listElements::sortElements() {
	
  qsort( list, maxElement, 2*sizeof(intIndex), 
    (int(*) (const void*, const void*))listElementCompare );
}

/*
  listElements( int sz );
  listElements( listElements& l1, listElements& l2 );
  void insert( intIndex e );
  
protected:
  int size;
  int maxElement;
  intIndex *list;
  
 */
