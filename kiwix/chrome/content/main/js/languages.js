/* Global variables */
var _languagesHashOld       = Array();
var _languagesHash          = Array();
var _languagesRegexHash     = Array();

/* Initialize the languages arrays */
/* Based in ISO 639-2 and 639-3 codes */
/* Order alphabetically by _languagesHash key */

_languagesHash['aar']          = 'Afaraf';
_languagesHash['abk']          = 'аҧсуа бызшәа, аҧсшәа';
_languagesHash['abk']          = 'аҧсуа бызшәа, аҧсшәа';
_languagesHash['aeb']          = 'زَوُن';
_languagesHash['afr']          = _languagesHashOld['af']          = 'Afrikaans';
_languagesHash['aka']          = 'Akan';
_languagesHash['amh']          = 'አማርኛ';
_languagesHash['ara']          = _languagesHashOld['ar']          = 'العربية';
_languagesHash['ara']          = 'العربية';
_languagesHash['arg']          = 'Aragonés';
_languagesHash['asm']          = _languagesHashOld['as']          = 'অসমীয়া';
_languagesHash['ava']          = 'авар мацӀ, магӀарул мацӀ';
_languagesHash['ave']          = 'avesta';
_languagesHash['aym']          = 'aymar aru';
_languagesHash['ary']          = 'الدارجة';
_languagesHash['ast']          = 'Asturianu';
_languagesHash['aze']          = _languagesHashOld['az']          = 'azərbaycanca';
_languagesHash['azb']          = 'South Azerbaijani';
_languagesHash['bak']          = _languagesHashOld['ba']          = 'Bašqort';
_languagesHash['bam']          = _languagesHashOld['bm']          = 'Bamanankan';
_languagesHash['bel']          = _languagesHashOld['be']          = 'Беларуская';
_languagesHash['ben']          = _languagesHashOld['bn']          = 'বাংলা';
_languagesHash['bis']          = 'Bislama';
_languagesHash['bod']          = 'བོད་ཡིག';
_languagesHash['bos']          = 'bosanski jezik';
_languagesHash['bre']          = _languagesHashOld['br']          = 'Brezhoneg';
_languagesHash['bul']          = _languagesHashOld['bg']          = 'Български';
_languagesHash['bcc']          = 'balojî Balójí';
_languagesHash['bel-tasrask']  = _languagesHashOld['be-tarask']   = 'тарашкевіца, клясычны правапіс';
_languagesHash['bjn']          = 'Bahasa Banjar';
_languagesHash['cat']          = _languagesHashOld['ca']          = 'Català';
_languagesHash['ces']          = _languagesHashOld['cs']          = 'Česky';
_languagesHash['cha']          = 'Chamoru';
_languagesHash['che']          = 'нохчийн мотт';
_languagesHash['chu']          = 'ѩзыкъ словѣньскъ';
_languagesHash['chv']          = _languagesHashOld['cv']          = 'Чӑвашла';
_languagesHash['cor']          = 'Kernewek';
_languagesHash['cos']          = 'corsu, lingua corsa';
_languagesHash['cre']          = 'ᓀᐦᐃᔭᐍᐏᐣ';
_languagesHash['cym']          = _languagesHashOld['cy']          = 'Cymraeg';
_languagesHash['ckb']          = 'کوردیی ناوەندی';
_languagesHash['dan']          = _languagesHashOld['da']          = 'Dansk';
_languagesHash['dsb']          = 'Dolnoserbski';
_languagesHash['deu']          = _languagesHashOld['de']          = 'Deutsch';
_languagesHash['div']          = 'ދިވެހި';
_languagesHash['dzo']          = ' རྫོང་ཁ';
_languagesHash['ell']          = _languagesHashOld['el']          = 'Ελληνικά';
_languagesHash['eng']          = _languagesHashOld['en']          = 'English';
_languagesHash['epo']          = _languagesHashOld['eo']          = 'Esperanto';
_languagesHash['est']          = _languagesHashOld['et']          = 'Eesti';
_languagesHash['eus']          = 'euskara';
_languagesHash['ewe']          = 'Eʋegbe';
_languagesHash['ebn']          = _languagesHashOld['bn']          ='বাংলা';
_languagesHash['fao']          = _languagesHashOld['fo']          = 'Føroyskt';
_languagesHash['fas']          = _languagesHashOld['fa']          = 'فارسی';
_languagesHash['fij']          = 'vosa Vakaviti';
_languagesHash['fin']          = _languagesHashOld['fi']          = 'Suomi';
_languagesHash['fra']          = _languagesHashOld['fr']          = 'Français';
_languagesHash['fry']          = 'Frysk';
_languagesHash['ful']          = _languagesHashOld['ff']          = 'Fulfulde';
_languagesHash['frp']          = 'Provençau';
_languagesHash['gla']          = 'Gàidhlig';
_languagesHash['gle']          = 'Gaeilge';
_languagesHash['glg']          = _languagesHashOld['gl']          = 'Galego';
_languagesHash['glv']          = 'Gaelg';
_languagesHash['grn']          = _languagesHashOld['gn']          = 'Avañe\'ẽ';
_languagesHash['guj']          = _languagesHashOld['gu']          = 'ગુજરાતી';
_languagesHash['gsw']          = 'Schwyzerdütsch';
_languagesHash['hat']          = _languagesHashOld['ht']          = 'Kreyol ayisyen';
_languagesHash['hau']          = _languagesHashOld['ha']          = 'Hausa';
_languagesHash['heb']          = _languagesHashOld['he']          = 'עברית';
_languagesHash['her']          = 'Otjiherero';
_languagesHash['hin']          = _languagesHashOld['hi']          = 'हिन्दी';
_languagesHash['her']          = 'Otjiherero';
_languagesHash['hmo']          = 'Hiri Motu';
_languagesHash['hrv']          = _languagesHashOld['hr']          = 'Олык Марий';
_languagesHash['hun']          = _languagesHashOld['hu']          = 'Magyar';
_languagesHash['hye']          = _languagesHashOld['hy']          = 'Հայերեն';
_languagesHash['hif-latn']     = 'Fiji Baat';
_languagesHash['hrx']          = 'Riograndenser Hunsrückisch';
_languagesHash['hsb']          = 'Hornjoserbsce';
_languagesHash['ibo']          = 'Asụsụ Igbo';
_languagesHash['ido']          = 'Ido';
_languagesHash['iii']          = 'ꆈꌠ꒿ Nuosuhxop';
_languagesHash['iku']          = 'ᐃᓄᒃᑎᑐᑦ';
_languagesHash['ile']          = _languagesHashOld['ie']          = 'Interlingue';
_languagesHash['ina']          = _languagesHashOld['ia']          = 'Interlingua';
_languagesHash['ind']          = _languagesHashOld['id']          = 'Bahasa Indonesia';
_languagesHash['ipk']          = 'Iñupiaq';
_languagesHash['isl']          = 'Íslenska';
_languagesHash['ita']          = _languagesHashOld['it']          = 'Italiano';
_languagesHash['ilo']          = 'Ilokano';
_languagesHash['jav']          = _languagesHashOld['jv']          = 'Basa Jawa';
_languagesHash['jpn']          = _languagesHashOld['ja']          = '日本語';
_languagesHash['kal']          = 'Kalaallisut';
_languagesHash['kan']          = _languagesHashOld['kn']          = 'ಕನ್ನಡ';
_languagesHash['kas']          = 'कश्मीरी';
_languagesHash['kat']          = _languagesHashOld['ka']          = 'ქართული';
_languagesHash['kau']          = 'Kanuri';
_languagesHash['kaz']          = _languagesHashOld['kk']          = 'Қазақша';
_languagesHash['khm']          = _languagesHashOld['km']          = 'ភាសាខ្មែរ';
_languagesHash['kik']          = 'Gĩkũyũ';
_languagesHash['kin']          = 'Ikinyarwanda';
_languagesHash['kir']          = _languagesHashOld['ky']          = 'قىرعىز تىلى';
_languagesHash['kom']          = 'коми кыв';
_languagesHash['kon']          = 'Kikongo';
_languagesHash['kor']          = _languagesHashOld['ko']          = '한국어';
_languagesHash['kor-kp']       = _languagesHashOld['ko-kp']       = '조선어';
_languagesHash['kua']          = 'Kuanyama';
_languagesHash['kur']          = _languagesHashOld['ku']          = 'kurdî';
_languagesHash['ksh']          = 'Ripoarisch';
_languagesHash['lao']          = 'ພາສາລາວ';
_languagesHash['lat']          = _languagesHashOld['la']          = 'Lingua Latīna';
_languagesHash['lav']          = _languagesHashOld['lv']          = 'Latviešu';
_languagesHash['lim']          = _languagesHashOld['li']          = 'Limburgs';
_languagesHash['lin']          = 'Lingála';
_languagesHash['lit']          = _languagesHashOld['lt']          = 'Lietuvių';
_languagesHash['ltz']          = _languagesHashOld['lb']          = 'Lëtzebuergesch';
_languagesHash['lub']          = 'Tshiluba';
_languagesHash['lug']          = 'Luganda';
_languagesHash['mah']          = 'Kajin M̧ajeļ';
_languagesHash['mal']          = _languagesHashOld['ml']          = 'മലയാളം';
_languagesHash['mar']          = _languagesHashOld['mr']          = 'मराठी';
_languagesHash['map-bms']      = 'Basa Banyumasan';
_languagesHash['mkd']          = _languagesHashOld['mk']          = 'Македонски';
_languagesHash['mlg']          = _languagesHashOld['mg']          = 'Malagasy';
_languagesHash['mlt']          = _languagesHashOld['mt']          = 'Malti';
_languagesHash['mon']          = _languagesHashOld['mn']          = 'Монгол хэл';
_languagesHash['mri']          = 'Te reo Māori';
_languagesHash['msa']          = _languagesHashOld['ms']          = 'Bahasa Melayu';
_languagesHash['mul']          = 'multilingual';
_languagesHash['mya']          = _languagesHashOld['my']          = 'မြန်မာဘာသာ';
_languagesHash['nau']          = 'Ekakairũ Naoero';
_languagesHash['nav']          = 'Diné bizaad';
_languagesHash['nbl']          = 'isiNdebele';
_languagesHash['nde']          = 'isiNdebele';
_languagesHash['ndo']          = 'Owambo';
_languagesHash['nep']          = _languagesHashOld['ne']          = 'नेपाली';
_languagesHash['nld']          = _languagesHashOld['nl']          = 'Nederlands';
_languagesHash['nno']          = _languagesHashOld['nn']          = 'Norsk (nynorsk)';
_languagesHash['nob']          = _languagesHashOld['nb']          = 'Norsk (bokmål)';
_languagesHash['nor']          = _languagesHashOld['no']          = 'Norsk (bokmål)';
_languagesHash['nya']          = 'ChiCheŵa';
_languagesHash['new']          = 'नेपाल भाषा';
_languagesHash['oci']          = _languagesHashOld['oc']          = 'Occitan';
_languagesHash['oji']          = 'ᐊᓂᔑᓈᐯᒧᐎᓐ';
_languagesHash['ori']          = _languagesHashOld['or']          = 'ଓଡ଼ିଆ';
_languagesHash['orm']          = 'Afaan Oromoo';
_languagesHash['oss']          = 'ирон æвзаг';
_languagesHash['pan']          = 'ਪੰਜਾਬੀ';
_languagesHash['pli']          = 'पाऴि';
_languagesHash['pol']          = _languagesHashOld['pl']          = 'Język polski';
_languagesHash['por']          = _languagesHashOld['pt']          = 'Português';
_languagesHash['por-pt']       = _languagesHashOld['pt-br']       = 'Português do Brasil';
_languagesHash['pus']          = _languagesHashOld['ps']           = 'پښتو';
_languagesHash['pdc']          = 'Pennsilfaanisch Deitsch';
_languagesHash['pms']          = 'Piemontèis';
_languagesHash['que']          = _languagesHashOld['qu']           = 'Runa Simi';
_languagesHash['roh']          = _languagesHash['rm']              = 'Rumantsch';
_languagesHash['ron']          = _languagesHashOld['ro']          = 'Română';
_languagesHash['run']          = 'Ikirundi';
_languagesHash['rus']          = _languagesHashOld['ru']          = 'Русский';
_languagesHash['rue']          = 'Русиньскый';
_languagesHash['sag']          = 'yângâ tî sängö';
_languagesHash['san']          = _languagesHashOld['sa']          = 'संस्कृतम्';
_languagesHash['sin']          = _languagesHashOld['si']          = 'සිංහල';
_languagesHash['skr']          = 'सराइकी';
_languagesHash['slk']          = _languagesHashOld['sk']          = 'Slovenčina';
_languagesHash['slv']          = _languagesHashOld['sl']          = 'Slovenščina';
_languagesHash['sme']          = 'Davvisámegiella';
_languagesHash['smo']          = 'gagana fa\'a Samoa';
_languagesHash['sna']          = 'chiShona';
_languagesHash['snd']          = 'सिन्धी';
_languagesHash['som']          = 'Soomaaliga';
_languagesHash['sot']          = 'Sesotho';
_languagesHash['spa']          = _languagesHashOld['es']          = 'Español';
_languagesHash['sqi']          = _languagesHashOld['sq']          = 'Shqip';
_languagesHash['srd']          = 'sardu';
_languagesHash['srp']          = _languagesHashOld['sr']          = 'Српски';
_languagesHash['srp-ec']       = _languagesHashOld['sr-ec']       = 'Српски (ћирилица)';
_languagesHash['srp-el']       = _languagesHashOld['sr-el']       = 'Srpski (latinica)';
_languagesHash['ssw']          = 'SiSwati';
_languagesHash['sun']          = _languagesHashOld['su']          = 'Basa Sunda';
_languagesHash['swa']          = _languagesHashOld['sw']          = 'Kiswahili';
_languagesHash['swe']          = _languagesHashOld['sv']          = 'Svenska';
_languagesHash['ses']          = 'Koyraboro Senni';
_languagesHash['sh']           = 'Srpskohrvatski / Српскохрватски';
_languagesHash['tah']          = 'Reo Tahiti';
_languagesHash['tam']          = _languagesHashOld['ta']          = 'தமிழ்';
_languagesHash['tat']          = 'татар теле';
_languagesHash['tel']          = _languagesHashOld['te']          = 'తెలుగు';
_languagesHash['tgk']          = 'тоҷикӣ';
_languagesHash['tgl']          = _languagesHashOld['tl']          = 'Wikang Tagalog';
_languagesHash['tha']          = _languagesHashOld['th']          = 'ไทย';
_languagesHash['tir']          = 'ትግርኛ';
_languagesHash['ton']          = 'faka Tonga';
_languagesHash['tsn']          = 'Setswana';
_languagesHash['tso']          = 'Xitsonga';
_languagesHash['tuk']          = _languagesHashOld['tk']          = 'Türkmen dili';
_languagesHash['tur']          = _languagesHashOld['tr']          = 'Türkçe';
_languagesHash['twi']          = 'Twi';
_languagesHash['tcy']          = 'ತುಳು';
_languagesHash['tly']          = 'толышә зывон';
_languagesHash['tt-cyrl']      = 'Татарча';
_languagesHash['uig']          = 'ئۇيغۇرچە';
_languagesHash['ug-arab']      = 'ئۇيغۇرچە';
_languagesHash['ukr']          = _languagesHashOld['uk']          = 'Українська';
_languagesHash['urd']          = _languagesHashOld['ur']          = 'اردو';
_languagesHash['uzb']          = _languagesHashOld['uz']          = 'Oʻzbekcha';
_languagesHash['ven']          = 'Tshivenḓa';
_languagesHash['vec']          = 'Vèneto'
_languagesHash['vie']          = _languagesHashOld['vi']          = 'Tiếng Việt';
_languagesHash['vol']          = 'Volapük';
_languagesHash['wln']          = 'walon';
_languagesHash['wol']          = _languagesHashOld['yo']          = 'Wolof';
_languagesHash['xho']          = 'isiXhosa';
_languagesHash['yid']          = _languagesHashOld['yi']           = 'ייִדיש';
_languagesHash['yor']          = 'Yorùbá';
_languagesHash['zha']          = 'Saɯ cueŋƅ';
_languagesHash['zho']          = _languagesHashOld['zh']          = '中文';
_languagesHash['zho-hans']     = _languagesHashOld['zh-hans']     = '中文(简体)';
_languagesHash['zho-hant']     = _languagesHashOld['zh-hant']     = '中文(繁體)';
_languagesHash['zho-hk']       = _languagesHashOld['zh-hk']       = '中文(香港)';
_languagesHash['zul']          = 'isiZulu';
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
		if (i < codeArray.length-1) {			
			result += ', ';
		}
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
    return _languagesRegexHash[language] || '';
}

