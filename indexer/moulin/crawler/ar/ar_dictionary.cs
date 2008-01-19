namespace WikiMoulin {

	using System;
	using System.Collections.Generic;
    
    class WikiLangMap {
    
        static Dictionary<string, int> s_ns = new Dictionary<string, int> ();
        
        public Dictionary<string, int> Ns { get{return s_ns;} }

        static WikiLangMap () {
		s_ns.Add ("ميديا", -2);
		s_ns.Add ("خاص", -1);
		s_ns.Add ("", 0);
		s_ns.Add ("نقاش", 1);
		s_ns.Add ("مستخدم", 2);
		s_ns.Add ("نقاش المستخدم", 3);
		s_ns.Add ("ويكاموس", 4);
		s_ns.Add ("نقاش ويكاموس", 5);
		s_ns.Add ("صورة", 6);
		s_ns.Add ("نقاش الصورة", 7);
		s_ns.Add ("ميدياويكي", 8);
		s_ns.Add ("نقاش ميدياويكي", 9);
		s_ns.Add ("قالب", 10);
		s_ns.Add ("نقاش القالب", 11);
		s_ns.Add ("مساعدة", 12);
		s_ns.Add ("نقاش المساعدة", 13);
		s_ns.Add ("تصنيف", 14);
		s_ns.Add ("نقاش التصنيف", 15);
      	}
 }
}
