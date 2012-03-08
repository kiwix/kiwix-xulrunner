/* Global variables */
var _languagesHashOld       = Array();
var _languagesHash          = Array();
var _languagesRegexHash     = Array();

/* Initialize the languages arrays */
_languagesHash['af']        = "Afrikaans";
_languagesHash['ar']        = "العربية";
_languagesHash['ary']       = "الدارجة";
_languagesHash['as']        = "অসমীয়া";
_languagesHash['ast']       = "Asturianu";
_languagesHash['ba']        = "Bašqort";
_languagesHash['be']        = "Беларуская";
_languagesHash['be-tarask'] = "тарашкевіца, клясычны правапіс";
_languagesHash['bg']        = "Български";
_languagesHash['bjn']       = "Bahasa Banjar";
_languagesHash['bn']        = "বাংলা";
_languagesHash['br']        = "Brezhoneg";
_languagesHash['ca']        = "Català";
_languagesHash['cs']        = "Česky";
_languagesHash['cy']        = "Cymraeg";
_languagesHash['deu']       = _languagesHashOld['de']       = "Deutsch";
_languagesHash['dan']       = _languagesHashOld['da']       = "Dansk";
_languagesHash['dsb']       = "Dolnoserbski";
_languagesHash['ell']       = _languagesHashOld['el']       = "Ελληνικά";
_languagesHash['eng']       = _languagesHashOld['en']       = "English";
_languagesHash['eo']        = "Esperanto";
_languagesHash['es']        = "Español";
_languagesHash['et']        = "Eesti";
_languagesHash['fa']        = "فارسی";
_languagesHash['fi']        = "Suomi";
_languagesHash['fo']        = "Føroyskt";
_languagesHash['fra']       = _languagesHashOld['fr']       = "Français";
_languagesHash['frp']       = "Provençau";
_languagesHash['gl']        = "Galego";
_languagesHash['gu']        = "ગુજરાતી";
_languagesHash['gsw']       = "Schwyzerdütsch";
_languagesHash['he']        = "עברית";
_languagesHash['hi']        = "हिन्दी";
_languagesHash['hr']        = "Олык Марий";
_languagesHash['hsb']       = "Hornjoserbsce";
_languagesHash['hu']        = "Magyar";
_languagesHash['ia']        = "Interlingua";
_languagesHash['ie']        = "Interlingue";
_languagesHash['ilo']       = "Ilokano";
_languagesHash['it']        = "Italiano";
_languagesHash['ja']        = "日本語";
_languagesHash['ka']        = "ქართული";
_languagesHash['kn']        = "ಕನ್ನಡ";
_languagesHash['ko']        = "한국어";
_languagesHash['ko-kp']     = "한국어 (조선)";
_languagesHash['ksh']       = "Ripoarisch";
_languagesHash['lb']        = "Lëtzebuergesch";
_languagesHash['li']        = "Limburgs";
_languagesHash['lt']        = "Lietuvių";
_languagesHash['lv']        = "Latviešu";
_languagesHash['map-bms']   = "Basa Banyumasan";
_languagesHash['mk']        = "Македонски";
_languagesHash['ml']        = "മലയാളം";
_languagesHash['mr']        = "मराठी";
_languagesHash['ms']        = "Bahasa Melayu";
_languagesHash['mt']        = "Malti";
_languagesHash['my']        = "မြန်မာဘာသာ";
_languagesHash['ne']        = "नेपाली";
_languagesHash['nl']        = "Nederlands";
_languagesHash['nb']        = "Norsk (bokmål)";
_languagesHash['nn']        = "Norsk (nynorsk)";
_languagesHash['oc']        = "Occitan";
_languagesHash['or']        = "ଓଡ଼ିଆ";
_languagesHash['pl']        = "Język polski";
_languagesHash['pms']       = "Piemontèis";
_languagesHash['por']       = "Português";
_languagesHash['ps']        = "پښتو";
_languagesHash['pt']        = "Português";
_languagesHash['pt-br']     = "Português do Brasil";
_languagesHash['qu']        = "Runa Simi";
_languagesHash['rm']        = "Rumantsch";
_languagesHash['ro']        = "Română";
_languagesHash['ru']        = "Русский";
_languagesHash['rue']       = "Русиньскый";
_languagesHash['sh']        = "Srpskohrvatski / Српскохрватски";
_languagesHash['si']        = "සිංහල";
_languagesHash['sk']        = "Slovenčina";
_languagesHash['sl']        = "Slovenščina";
_languagesHash['sq']        = "Shqip";
_languagesHash['sr-ec']     = "Српски (ћирилица)";
_languagesHash['sr-el']     = "Srpski (latinica)";
_languagesHash['su']        = "Basa Sunda";
_languagesHash['sv']        = "Svenska";
_languagesHash['sw']        = "Kiswahili";
_languagesHash['ta']        = "தமிழ்";
_languagesHash['tcy']       = "ತುಳು";
_languagesHash['te']        = "తెలుగు";
_languagesHash['th']        = "ไทย";
_languagesHash['tt-cyrl']   = "Татарча";
_languagesHash['ug-arab']   = "ئۇيغۇرچە";
_languagesHash['uk']        = "Українська";
_languagesHash['ur']        = "اردو";
_languagesHash['vi']        = "Tiếng Việt";
_languagesHash['yi']        = "ייִדיש";
_languagesHash['yo']        = "Wolof";
_languagesHash['zh']        = "中文";
_languagesHash['zh-hans']   = "中文(简体)";
_languagesHash['zh-hant']   = "中文(繁體)";
_languagesHash['zh-hk']     = "中文(香港)";

function getLanguageNameFromISO(code) {
    return _languagesHash[code] || _languagesHashOld[code] || "";
}

/* Be careful, this function returns false, also if undefined - that
 * means nothing because the table _languagesHashOld is not complete */
function isOldLanguageCode(code) {
    return _languagesHashOld[iso] ? true : false;
}

function buildLanguagesRegexHash() {
    for (var code in _languagesHash) {
	_languagesRegexHash[_languagesHash[code]] = code;
    }

    for (var code in _languagesHashOld) {
	var regex = _languagesRegexHash[_languagesHashOld[code]];
	_languagesRegexHash[_languagesHashOld[code]] = (regex ? regex + "|" : "") + code;
    }
}

function getLanguageRegex(language) {
    return _languagesRegexHash[language];
}

