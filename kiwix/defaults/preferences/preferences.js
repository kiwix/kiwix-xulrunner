/* Start XUL page */
pref("toolkit.defaultChromeURI", "chrome://main/content/main.xul");

/* Default skin */
pref("general.skins.selectedSkin", "default");

/* Charset */
pref("intl.charset.default", "UTF-8");

/* Don't inherit OS locale */
pref("intl.locale.matchOS", "false");

/* Choose own fallback locale; later it can be overridden by the user */
pref("general.useragent.locale", "en-US");

/* Warn for http */
pref("network.protocol-handler.warn-external.http", false);

/* Debug preferences */
pref("javascript.options.showInConsole", true);
pref("browser.dom.window.dump.enabled", true);
pref("nglayout.debug.disable_xul_cache", true);
pref("javascript.options.strict", true);
pref("extensions.logging.enabled", true);
pref("dom.report_all_js_exceptions", true);

/* Caching strategy */
pref("browser.cache.disk.enable", true);
pref("browser.cache.disk.capacity", 50000);
pref("browser.cache.memory.enable", true);
pref("browser.cache.memory.capacity", 32768);

/* Privacy */
pref("kiwix.removeprofileonclose", true);
pref("kiwix.removeprofileonclose.confirm", false);

/* Download Manager (for Save Page) */
pref("browser.download.manager.closeWhenDone", true);
pref("browser.download.manager.showWhenStarting", false);
