namespace WikiMoulin {

	using System;
	using System.Collections.Generic;
    
    class WikiLangMap {
    
        static Dictionary<string, int> s_ns = new Dictionary<string, int> ();
        
        public Dictionary<string, int> Ns { get{return s_ns;} }

        static WikiLangMap () {
		s_ns.Add ("Media", -2);
		s_ns.Add ("Special", -1);
		s_ns.Add ("", 0);
		s_ns.Add ("Discuter", 1);
		s_ns.Add ("Utilisateur", 2);
		s_ns.Add ("Discussion Utilisateur", 3);
		s_ns.Add ("Wiktionnaire", 4);
		s_ns.Add ("Discussion Wiktionnaire", 5);
		s_ns.Add ("Image", 6);
		s_ns.Add ("Discussion Image", 7);
		s_ns.Add ("MediaWiki", 8);
		s_ns.Add ("Discussion MediaWiki", 9);
		s_ns.Add ("Modèle", 10);
		s_ns.Add ("Discussion Modèle", 11);
		s_ns.Add ("Aide", 12);
		s_ns.Add ("Discussion Aide", 13);
		s_ns.Add ("Catégorie", 14);
		s_ns.Add ("Discussion Catégorie", 15);
		s_ns.Add ("Annexe", 100);
		s_ns.Add ("Discussion Annexe", 101);
		s_ns.Add ("Transwiki", 102);
		s_ns.Add ("Discussion Transwiki", 103);
		s_ns.Add ("Portail", 104);
		s_ns.Add ("Discussion Portail", 105);
      	}
 }
}
