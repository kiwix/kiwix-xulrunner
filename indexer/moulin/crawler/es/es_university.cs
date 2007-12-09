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
		s_ns.Add ("Discusión", 1);
		s_ns.Add ("Usuario", 2);
		s_ns.Add ("Usuario Discusión", 3);
		s_ns.Add ("Wikiversidad", 4);
		s_ns.Add ("Wikiversidad Discusión", 5);
		s_ns.Add ("Imagen", 6);
		s_ns.Add ("Imagen Discusión", 7);
		s_ns.Add ("MediaWiki", 8);
		s_ns.Add ("MediaWiki Discusión", 9);
		s_ns.Add ("Plantilla", 10);
		s_ns.Add ("Plantilla Discusión", 11);
		s_ns.Add ("Ayuda", 12);
		s_ns.Add ("Ayuda Discusión", 13);
		s_ns.Add ("Categoría", 14);
		s_ns.Add ("Categoría Discusión", 15);
      	}
 }
}
