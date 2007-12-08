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
		s_ns.Add ("Talk", 1);
		s_ns.Add ("User", 2);
		s_ns.Add ("User talk", 3);
		s_ns.Add ("Wikibooks", 4);
		s_ns.Add ("Wikibooks talk", 5);
		s_ns.Add ("Image", 6);
		s_ns.Add ("Image talk", 7);
		s_ns.Add ("MediaWiki", 8);
		s_ns.Add ("MediaWiki talk", 9);
		s_ns.Add ("Template", 10);
		s_ns.Add ("Template talk", 11);
		s_ns.Add ("Help", 12);
		s_ns.Add ("Help talk", 13);
		s_ns.Add ("Category", 14);
		s_ns.Add ("Category talk", 15);
      	}
 }
}
