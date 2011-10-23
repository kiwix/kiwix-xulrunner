/*
 * Copyright 2011 Renaud Gauin <reg@kiwix.org>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU  General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301, USA.
 */

/* Mini Logger to output stuff to JS Console. */
function L () {};

L.info = function (str) {
	try { 
		Components.classes['@mozilla.org/consoleservice;1']
		.getService (Components.interfaces.nsIConsoleService)
		.logStringMessage (str);
	} catch (e) {
		dump ("can't log info via nsIConsoleService: " + e.toString ());
	}
}

L.error = function (str) {
	try {
		Components.utils.reportError (str);
	} catch (e) {
		dump ("can't log error via reportError: " + e.toString ());
	}
}
