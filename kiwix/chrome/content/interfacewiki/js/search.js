
/* Kiwix 0.5 - a XUL/XPCOM based offline reader for Wikipedia
    Copyright (C) 2006-2007, LinterWeb (France), Emmanuel Engelhart

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

function rechercheXpcom(motR){

	var resCount;
	var result0;
	var corpus = corpusgetactive();
	var wikisearch = getSearchEngine(corpus);
	if (wikisearch == null) return false;

	resCount = wikisearch.search(motR);
        if ( resCount > NB_SEARCH_RETURN ) resCount = NB_SEARCH_RETURN;
        if ( resCount == 0 ) setVisible( "wk-noresult", false );
        for ( var i = 0 ; i < resCount ; i++ ) {
         var score = wikisearch.getScore(i);
         if (( i == 0 )&&( score > AUTO_OPEN_SCORE )&&( !bNoAutoOpen )) 
               goTo(wikisearch.getResult(i));
         bNoAutoOpen = false;
         if ( score < 2 ) break;
         var page = wikisearch.getTitle(i);
         var chemin = "javascript:goTo('"+wikisearch.getResult(i)+"')";
	 addList(page, chemin, score );
        }
        addBackground('wk-resultat');
	return true;
}
