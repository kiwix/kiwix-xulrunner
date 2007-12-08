namespace WikiMoulin {

	using System;
	using System.Collections.Generic;
	using System.Diagnostics;
	using System.IO;
	using System.Text;
	using System.Xml;
	using System.Xml.XPath;

	class Moulin {

		static string s_cmd = "/usr/bin/mysql";
		static string s_pageStart = "<page>";
		static string s_pageEnd = "</page>";
		static Dictionary<string, int> s_ns = new Dictionary<string, int> ();

		static Moulin () {
            WikiLangMap lm = new WikiLangMap();
            s_ns = lm.Ns;
		}

		static Process Popen ()
		{
			Process proc = new Process ();
			proc.StartInfo.FileName = s_cmd;
			proc.StartInfo.Arguments = "-uroot simple_dictionary";
			proc.StartInfo.CreateNoWindow = true;
			proc.StartInfo.UseShellExecute = false;
			proc.StartInfo.RedirectStandardInput = true;
			proc.Start ();

			return proc;
		}
		
		static string espace_string (string str)
		{

			return str.Replace ("\\", "\\\\").Replace ("'", "\\'");
		}

		static void Seakwale (StreamWriter writer, string page)
		{
			XmlTextReader reader = new XmlTextReader (new StringReader (page));
			XPathDocument doc = new XPathDocument (reader);
			XPathNavigator nav = doc.CreateNavigator ();

			string title	= nav.SelectSingleNode ("page/title").Value;
			int index = title.IndexOf (":");
			int ns = 0;
			if (index != -1) {
				//Console.WriteLine(title);
				if (s_ns.TryGetValue (title.Substring (0, index ), out ns)) {
					title = title.Substring (index + 1, title.Length - index -1);
				}
			}
			title = espace_string (title.Replace (" ", "_"));
			
			string id 		= nav.SelectSingleNode ("page/id").Value;
			string rev_id	= nav.SelectSingleNode ("page/revision/id").Value;
			string rev_ts	= nav.SelectSingleNode ("page/revision/timestamp").Value;
			string rev_c_n;
			string rev_c_id;
			if (nav.SelectSingleNode ("page/revision/contributor/username") != null && nav.SelectSingleNode ("page/revision/contributor/id") != null) {
				rev_c_n		= espace_string (nav.SelectSingleNode ("page/revision/contributor/username").Value);
				rev_c_id	= nav.SelectSingleNode ("page/revision/contributor/id").Value;
			} else {
				rev_c_n		= espace_string (nav.SelectSingleNode ("page/revision/contributor/ip").Value);
				rev_c_id	= "0";
			}
			string rev_comm	= String.Empty;
			if (nav.SelectSingleNode ("page/revision/comment") != null) {
				rev_comm	= espace_string (nav.SelectSingleNode ("page/revision/comment").Value);
			}
			string text		= espace_string (nav.SelectSingleNode ("page/revision/text").Value);
			int length		= text.Length;
			int redirect;
			if (length >= 9) {
				redirect	= (text.Substring (0, 9) == "#REDIRECT") ? 1 : 0;
			} else {
				redirect	= 0;
			}

			StringBuilder req = new StringBuilder ();
			const string stdsep = "', '";
			req.Append ("INSERT INTO text (old_id, old_flags, old_text) VALUES ( '").Append (rev_id).Append ("', 'utf-8', '").Append (text).Append ("');\n").Append ("INSERT INTO revision (rev_id, rev_page, rev_text_id, rev_comment, rev_user, rev_user_text, rev_timestamp, rev_minor_edit, rev_deleted) VALUES ( '").Append (rev_id).Append (stdsep).Append (id).Append (stdsep).Append (rev_id).Append (stdsep).Append (rev_comm).Append (stdsep).Append (rev_c_id).Append (stdsep).Append (rev_c_n).Append (stdsep).Append (rev_ts).Append ("', '1', '0');\n").Append ("INSERT INTO page (page_id, page_namespace, page_title, page_is_redirect, page_latest, page_len) VALUES ( '").Append (id).Append (stdsep).Append (ns.ToString ()).Append (stdsep).Append (title).Append (stdsep).Append (redirect.ToString ()).Append (stdsep).Append (rev_id).Append (stdsep).Append (length.ToString ()).Append ("');");

			writer.WriteLine (req.ToString ());
		}

		static void Main (string [] args)
		{
			if (args.Length != 1 || !File.Exists (args [0])) {
				Console.WriteLine ("usage: mono WikiMoulin SOURCE_FILE");
				return;
			}

			DateTime start = DateTime.Now;
			Console.WriteLine ("Wiki Moulin " + start.ToString ());
			using (Process mysql = Popen ()) {
				
				using (StreamReader sr = new StreamReader (
					new BufferedStream (File.OpenRead (args [0])))) {

					StringBuilder sb = new StringBuilder ();
					bool swallow = false;
					string line;
					while ((line = sr.ReadLine ()) != null) {

						int index = line.IndexOf (s_pageStart);
						if (index != -1) {
							sb = new StringBuilder ();
							sb.Append (line.Substring (index + s_pageStart.Length));
							swallow = true;
						}

						index = line.IndexOf (s_pageEnd);
						if (index != -1) {
							sb.Append (line.Substring (0, index));
							sb.Append (s_pageEnd);
							Seakwale (mysql.StandardInput, sb.ToString ());
							swallow = false;
						}

						if (swallow) {
							sb.Append (line);
							sb.Append ("\n");
						}
					}
				}
			}

			Console.WriteLine ("Wiki Moulin runned in " + (DateTime.Now - start).ToString ());
		}
	}
}
