namespace WikiMoulin {

	using System;
	using System.Collections.Generic;
    
    class WikiLangMap {
    
        static Dictionary<string, int> s_ns = new Dictionary<string, int> ();
        
        public Dictionary<string, int> Ns { get{return s_ns;} }
        
        static WikiLangMap () {
		s_ns.Add ("مدیا", -2);
		s_ns.Add ("ویژه", -1);
		s_ns.Add ("", 0);
		s_ns.Add ("بحث", 1);
		s_ns.Add ("کاربر", 2);
		s_ns.Add ("بحث کاربر", 3);
		s_ns.Add ("ویکی‌نبشته", 4);
		s_ns.Add ("بحث ویکی‌نبشته", 5);
		s_ns.Add ("تصویر", 6);
		s_ns.Add ("بحث تصویر", 7);
		s_ns.Add ("مدیاویکی" ,8);
		s_ns.Add ("بحث مدیاویکی", 9);
		s_ns.Add ("الگو", 10);
		s_ns.Add ("بحث الگو", 11);
		s_ns.Add ("راهنما", 12);
		s_ns.Add ("بحث راهنما", 13);
		s_ns.Add ("رده", 14);
		s_ns.Add ("بحث رده", 15);
		s_ns.Add ("درگاه", 100);
		s_ns.Add ("بحث درگاه", 101);
		s_ns.Add ("مؤلف", 102);
		s_ns.Add ("بحث مؤلف", 103);
		s_ns.Add ("برگه", 104);
		s_ns.Add ("بحث برگه", 105);
      	}
 }
}
