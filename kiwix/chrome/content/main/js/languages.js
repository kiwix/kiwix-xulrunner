/* Global variables */
var _languagesHashOld       = Array();
var _languagesHash          = Array();
var _languagesRegexHash     = Array();

/* Initialize the languages arrays */
_languagesHash['aeb']          = 'زَوُن';
_languagesHash['afr']          = _languagesHashOld['af']          = 'Afrikaans';
_languagesHash['ara']          = _languagesHashOld['ar']          = 'العربية';
_languagesHash['ary']          = 'الدارجة';
_languagesHash['asm']          = _languagesHashOld['as']          = 'অসমীয়া';
_languagesHash['ast']          = 'Asturianu';
_languagesHash['azb']          = 'South Azerbaijani';
_languagesHash['ba']           = 'Bašqort';
_languagesHash['ben']          = _languagesHashOld['bn']          = 'বাংলা';
_languagesHash['bel']          = _languagesHashOld['be']          = 'Беларуская';
_languagesHash['bel-tasrask']  = _languagesHashOld['be-tarask']   = 'тарашкевіца, клясычны правапіс';
_languagesHash['bam']          = _languagesHashOld['bm']          = 'Bamanankan';
_languagesHash['bul']          = _languagesHashOld['bg']          = 'Български';
_languagesHash['bjn']          = 'Bahasa Banjar';
_languagesHash['ebn']          = _languagesHashOld['bn']          ='বাংলা';
_languagesHash['bre']          = _languagesHashOld['br']          = 'Brezhoneg';
_languagesHash['cat']          = _languagesHashOld['ca']          = 'Català';
_languagesHash['ces']          = _languagesHashOld['cs']          = 'Česky';
_languagesHash['chv']          = _languagesHashOld['cv']          = 'Чӑвашла';
_languagesHash['cym']          = _languagesHashOld['cy']          = 'Cymraeg';
_languagesHash['deu']          = _languagesHashOld['de']          = 'Deutsch';
_languagesHash['dan']          = _languagesHashOld['da']          = 'Dansk';
_languagesHash['dsb']          = 'Dolnoserbski';
_languagesHash['ell']          = _languagesHashOld['el']          = 'Ελληνικά';
_languagesHash['eng']          = _languagesHashOld['en']          = 'English';
_languagesHash['epo']          = _languagesHashOld['eo']          = 'Esperanto';
_languagesHash['ful']          = _languagesHashOld['ff']          = 'Fulfulde';
_languagesHash['spa']          = _languagesHashOld['es']          = 'Español';
_languagesHash['est']          = _languagesHashOld['et']          = 'Eesti';
_languagesHash['fin']          = _languagesHashOld['fi']          = 'Suomi';
_languagesHash['fo']           = 'Føroyskt';
_languagesHash['fra']          = _languagesHashOld['fr']          = 'Français';
_languagesHash['frp']          = 'Provençau';
_languagesHash['gl']           = 'Galego';
_languagesHash['grn']          = _languagesHashOld['gn']          = 'Avañe\'ẽ';
_languagesHash['guj']          = _languagesHashOld['gu']          = 'ગુજરાતી';
_languagesHash['gsw']          = 'Schwyzerdütsch';
_languagesHash['hau']          = _languagesHashOld['ha']          = 'Hausa';
_languagesHash['heb']          = _languagesHashOld['he']          = 'עברית';
_languagesHash['hin']          = _languagesHashOld['hi']          = 'हिन्दी';
_languagesHash['hif-latn']     = 'Fiji Baat';
_languagesHash['hrv']          = _languagesHashOld['hr']          = 'Олык Марий';
_languagesHash['hsb']          = 'Hornjoserbsce';
_languagesHash['hat']          = _languagesHashOld['ht']          = 'Kreyol ayisyen';
_languagesHash['hun']          = _languagesHashOld['hu']          = 'Magyar';
_languagesHash['hye']          = _languagesHashOld['hy']          = 'Հայերեն';
_languagesHash['ia']           = 'Interlingua';
_languagesHash['ind']          =_languagesHashOld['id']           = 'Bahasa Indonesia';
_languagesHash['ie']           = 'Interlingue';
_languagesHash['ilo']          = 'Ilokano';
_languagesHash['ita']          = _languagesHashOld['it']          = 'Italiano';
_languagesHash['jav']          = _languagesHashOld['jv']          = 'Basa Jawa';
_languagesHash['jpn']          = _languagesHashOld['ja']          = '日本語';
_languagesHash['ka']           = 'ქართული';
_languagesHash['kaz']          = _languagesHashOld['kk']          = 'Қазақша';
_languagesHash['khm']          = _languagesHashOld['km']          = 'ភាសាខ្មែរ';
_languagesHash['kir']          = _languagesHashOld['ky']          = 'قىرعىز تىلى';
_languagesHash['kn']           = 'ಕನ್ನಡ';
_languagesHash['kor']          = _languagesHashOld['ko']          = '한국어';
_languagesHash['kor-kp']       = _languagesHashOld['ko-kp']       = '조선어';
_languagesHash['ksh']          = 'Ripoarisch';
_languagesHash['kur']          = _languagesHashOld['ku']          = 'kurdî';
_languagesHash['lat']          = _languagesHashOld['la']          = 'Lingua Latīna';
_languagesHash['lb']           = 'Lëtzebuergesch';
_languagesHash['li']           = 'Limburgs';
_languagesHash['lit']          = _languagesHashOld['lt']          = 'Lietuvių';
_languagesHash['lv']           = 'Latviešu';
_languagesHash['map-bms']      = 'Basa Banyumasan';
_languagesHash['mk']           = 'Македонски';
_languagesHash['mal']          = _languagesHashOld['ml']          = 'മലയാളം';
_languagesHash['mon']          = _languagesHashOld['mn']          = 'Монгол хэл';
_languagesHash['mar']          = _languagesHashOld['mr']          = 'मराठी';
_languagesHash['msa']          = _languagesHashOld['ms']          = 'Bahasa Melayu';
_languagesHash['mt']           = 'Malti';
_languagesHash['mya']          = _languagesHashOld['my']          = 'မြန်မာဘာသာ';
_languagesHash['nep']          = _languagesHashOld['ne']          = 'नेपाली';
_languagesHash['new']          = 'नेपाल भाषा';
_languagesHash['nld']          = _languagesHashOld['nl']          = 'Nederlands';
_languagesHash['nob']          = _languagesHashOld['nb']          = 'Norsk (bokmål)';
_languagesHash['nor']          = _languagesHashOld['no']          = 'Norsk (bokmål)';
_languagesHash['nno']          = _languagesHashOld['nn']          = 'Norsk (nynorsk)';
_languagesHash['oci']          = _languagesHashOld['oc']          = 'Occitan';
_languagesHash['or']           = 'ଓଡ଼ିଆ';
_languagesHash['per']          = _languagesHashOld['fa']          = 'فارسی';
_languagesHash['pol']          = _languagesHashOld['pl']          = 'Język polski';
_languagesHash['pms']          = 'Piemontèis';
_languagesHash['ps']           = 'پښتو';
_languagesHash['por']          = _languagesHashOld['pt']          = 'Português';
_languagesHash['por-pt']       = _languagesHashOld['pt-br']       = 'Português do Brasil';
_languagesHash['qu']           = 'Runa Simi';
_languagesHash['rm']           = 'Rumantsch';
_languagesHash['ron']          = _languagesHashOld['ro']          = 'Română';
_languagesHash['rus']          = _languagesHashOld['ru']          = 'Русский';
_languagesHash['rue']          = 'Русиньскый';
_languagesHash['san']          = _languagesHashOld['sa']          = 'संस्कृतम्';
_languagesHash['sh']           = 'Srpskohrvatski / Српскохрватски';
_languagesHash['si']           = 'සිංහල';
_languagesHash['sk']           = 'Slovenčina';
_languagesHash['slv']          = _languagesHashOld['sl']          = 'Slovenščina';
_languagesHash['sq']           = 'Shqip';
_languagesHash['srp']          = _languagesHashOld['sr']          = 'Српски';
_languagesHash['srp-ec']       = _languagesHashOld['sr-ec']       = 'Српски (ћирилица)';
_languagesHash['srp-el']       = _languagesHashOld['sr-el']       = 'Srpski (latinica)';
_languagesHash['su']           = 'Basa Sunda';
_languagesHash['swe']          = _languagesHashOld['sv']          = 'Svenska';
_languagesHash['swa']          = _languagesHashOld['sw']          = 'Kiswahili';
_languagesHash['ta']           = 'தமிழ்';
_languagesHash['tuk']          = _languagesHashOld['tk']          = 'Türkmen dili';
_languagesHash['tcy']          = 'ತುಳು';
_languagesHash['tel']          = _languagesHashOld['te']          = 'తెలుగు';
_languagesHash['tgl']          = _languagesHashOld['tl']          = 'Wikang Tagalog';
_languagesHash['tha']          = _languagesHashOld['th']          = 'ไทย';
_languagesHash['tly']          = 'толышә зывон';
_languagesHash['tt-cyrl']      = 'Татарча';
_languagesHash['tur']          = _languagesHashOld['tr']          = 'Türkçe';
_languagesHash['ug-arab']      = 'ئۇيغۇرچە';
_languagesHash['ukr']          = _languagesHashOld['uk']          = 'Українська';
_languagesHash['urd']          = _languagesHashOld['ur']          = 'اردو';
_languagesHash['uzb']          = _languagesHashOld['uz']          = 'Oʻzbekcha';
_languagesHash['vie']          = _languagesHashOld['vi']          = 'Tiếng Việt';
_languagesHash['yi']           = 'ייִדיש';
_languagesHash['vec']          = 'Vèneto'
_languagesHash['wol']          = _languagesHashOld['yo']          = 'Wolof';
_languagesHash['zho']          = _languagesHashOld['zh']          = '中文';
_languagesHash['zho-hans']     = _languagesHashOld['zh-hans']     = '中文(简体)';
_languagesHash['zho-hant']     = _languagesHashOld['zh-hant']     = '中文(繁體)';
_languagesHash['zho-hk']       = _languagesHashOld['zh-hk']       = '中文(香港)';
_languagesHash['zza']          = _languagesHashOld['diq']         = 'Zāzākī';

function getLanguageNameFromISO(code) {
    var language = _languagesHash[code] || _languagesHashOld[code] || '';
    if (!language && code) {
	dump('"' + code + '" is not available in languages.js.\n');
    }
    return language;
}

function getLanguageNameFromISOCodes(codes) {
    var result = "";
    var codeArray = codes.split(',');
    for (var i in codeArray) {
	result += getLanguageNameFromISO(codeArray[i]);
	if (i < codeArray.length-1)
	    result += ', ';
    }
    return result;
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
	_languagesRegexHash[_languagesHashOld[code]] = '^(' + (regex ? regex + '|' : '') + code + ')$';
    }
}

function getLanguageRegex(language) {
    return _languagesRegexHash[language];
}

