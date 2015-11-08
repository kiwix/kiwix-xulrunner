/*
 * Copyright 2013  Rashiq Ahmad <rashiq.z@gmail.com>
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

package org.kiwix.kiwixmobile

import android.content.Context
import android.content.SharedPreferences
import android.content.res.Configuration
import android.graphics.Typeface
import android.os.Handler
import android.preference.PreferenceManager
import android.util.AttributeSet
import android.util.Log
import android.util.TypedValue
import android.view.InflateException
import android.view.LayoutInflater
import android.view.View
import android.widget.TextView

import java.lang.reflect.Field
import java.util.ArrayList
import java.util.Collections
import java.util.Comparator
import java.util.HashMap
import java.util.Locale
import java.util.MissingResourceException

class LanguageUtils(private val mContext: Context) {

  private val mLanguageList: MutableList<LanguageContainer>

  private val mLocaleLanguageCodes: MutableList<String>

  init {

    mLanguageList = ArrayList<LanguageContainer>()

    mLocaleLanguageCodes = ArrayList<String>()

    getLanguageCodesFromAssets()

    setupLanguageList()

    sortLanguageList()
  }

  // Read the language codes, that are supported in this app from the locales.txt file
  private fun getLanguageCodesFromAssets() {

    val locales = ArrayList(FileWriter(mContext).readFileFromAssets())

    for (locale in locales) {

      if (!locale.isEmpty()) {
        mLocaleLanguageCodes.add(locale.trim { it <= ' ' })
      }
    }
  }

  // Create a list containing the language code and the corresponding (english) langauge name
  private fun setupLanguageList() {

    for (languageCode in mLocaleLanguageCodes) {
      mLanguageList.add(LanguageContainer(languageCode))
    }

  }

  // Sort the language list by the language name
  private fun sortLanguageList() {

    Collections.sort(mLanguageList, object : Comparator<LanguageContainer> {
      override fun compare(a: LanguageContainer, b: LanguageContainer): Int {
        return a.languageName!!.compareTo(b.languageName!!, ignoreCase = true)
      }
    })
  }

  // Check, if the selected Locale is supported and weather we actually need to change our font.
  // We do this by checking, if our Locale is available in the List, that Locale.getAvailableLocales() returns.
  private fun haveToChangeFont(): Boolean {

    for (s in Locale.getAvailableLocales()) {
      if (s.language == Locale.getDefault().toString()) {

        return false
      }

      // Don't change the language, if the options hasn't been set
      val prefs = PreferenceManager.getDefaultSharedPreferences(mContext)
      val language = prefs.getString("pref_language_chooser", "")

      if (language.isEmpty()) {
        return false
      }
    }
    return true
  }

  // Change the font of all the TextViews and its subclasses in our whole app by attaching a custom
  // Factory to the LayoutInflater of the Activity.
  // The Factory is called on each element name as the xml is parsed and we can therefore modify
  // the parsed Elements.
  // A Factory can only be set once on a LayoutInflater. And since we are using the support Library,
  // which also sets a Factory on the LayoutInflator, we have to access the private field of the
  // LayoutInflater, that handles this restriction via Java's reflection API
  // and make it accessible set it to false again.
  fun changeFont(layoutInflater: LayoutInflater) {

    if (!haveToChangeFont()) {
      return
    }

    try {
      val field = LayoutInflater::class.java.getDeclaredField("mFactorySet")
      field.isAccessible = true
      field.setBoolean(layoutInflater, false)
      layoutInflater.factory = LayoutInflaterFactory(mContext, layoutInflater)

    } catch (e: NoSuchFieldException) {
      Log.e(TAG_KIWIX, "could not access private field of the LayoutInflater")

    } catch (e: IllegalArgumentException) {
      Log.e(TAG_KIWIX, "could not access private field of the LayoutInflater")

    } catch (e: IllegalAccessException) {
      Log.e(TAG_KIWIX, "could not access private field of the LayoutInflater")
    }

  }

  // Get a list of all the language names
  val values: List<String>
    get() {

      val values = ArrayList<String>()

      for (value in mLanguageList) {
        values.add(value.languageName!!)
      }

      return values
    }

  // Get a list of all the language codes
  val keys: List<String>
    get() {

      val keys = ArrayList<String>()

      for (key in mLanguageList) {
        keys.add(key.languageCode)
      }

      return keys
    }

  // That's the Factory, that will handle the manipulation of all our TextView's and its subcalsses
  // while the content is being parsed
  class LayoutInflaterFactory(private val mContext: Context, private val mLayoutInflater: LayoutInflater) : LayoutInflater.Factory {

    override fun onCreateView(name: String, context: Context, attrs: AttributeSet): View? {

      // Apply the custom font, if the xml tag equals "TextView", "EditText" or "AutoCompleteTextView"
      if (name.equals("TextView", ignoreCase = true) || name.equals("EditText", ignoreCase = true) || name.equals("AutoCompleteTextView", ignoreCase = true)) {

        try {
          val inflater = mLayoutInflater
          val view = inflater.createView(name, null, attrs)
          Handler().post(object : Runnable {
            override fun run() {
              val textView = (view as TextView)

              // Set the custom typeface
              textView.typeface = Typeface.createFromAsset(mContext.assets, typeface)
              Log.d(TAG_KIWIX, "Applying custom font")

              // Reduce the text size
              textView.setTextSize(TypedValue.COMPLEX_UNIT_PX,
                  textView.textSize - 2f)
            }
          })

          return view

        } catch (e: InflateException) {
          Log.e(TAG_KIWIX,
              "Could not apply the custom font to " + name + " " + e.message)

        } catch (e: ClassNotFoundException) {
          Log.e(TAG_KIWIX,
              "Could not apply the custom font to " + name + " " + e.message)
        }

      }

      return null
    }

    // This method will determine which font will be applied to the not-supported-locale.
    // You can define exceptions to the default DejaVu font in the 'exceptions' Hashmap:

    private // Define the exceptions to the rule. The font has to be placed in the assets folder.
        // Key: the language code; Value: the name of the font.
        // These scripts could be supported via more Lohit fonts if DevaVu doesn't
        // support them.  That is untested now as they aren't even in the language
        // menu:
        //  * (no ISO code?) (Devanagari/Nagari) -- at 0% in translatewiki
        //  * mr (Marathi) -- at 21% in translatewiki
        //  * pa (Punjabi) -- at 3% in translatewiki
        // Check, if an exception applies to our current locale
        // Return the default font
    val typeface: String
      get() {
        val exceptions = HashMap<String, String?>()
        exceptions.put("km", "fonts/KhmerOS.ttf")
        exceptions.put("gu", "fonts/Lohit-Gujarati.ttf")
        exceptions.put("my", "fonts/Parabaik.ttf")
        exceptions.put("or", "fonts/Lohit-Odia.ttf")
        if (exceptions.containsKey(Locale.getDefault().language)) {
          return exceptions[Locale.getDefault().language]!!
        }
        return "fonts/DejaVuSansCondensed.ttf"
      }
  }

  class LanguageContainer// This constructor will take care of creating a language name for the given ISO 639-1 language code.
  // The language name will always be in english to ensure user friendliness and to prevent
  // possible incompatibilities, since not all language names are available in all languages.
  (val languageCode: String) {

    var languageName: String? = null
      private set

    init {

      try {
        languageName = Locale(languageCode).displayLanguage

        // Use the English name of the language, if the language name is not
        // available in the current Locale
        if (languageName!!.length == 2) {
          languageName = Locale(languageCode).getDisplayLanguage(Locale("en"))
        }

      } catch (e: Exception) {
        languageName = ""
      }

    }
  }

  companion object {

    val TAG_KIWIX = "kiwix"

    private var mLocaleMap: HashMap<String, Locale>? = null

    fun handleLocaleChange(context: Context) {

      val prefs = PreferenceManager.getDefaultSharedPreferences(context)
      val language = prefs.getString("pref_language_chooser", "")

      if (language.isEmpty()) {
        return
      }

      handleLocaleChange(context, language)
    }

    fun handleLocaleChange(context: Context, language: String) {

      val locale = Locale(language)
      Locale.setDefault(locale)
      val config = Configuration()
      config.locale = locale
      context.resources.updateConfiguration(config, context.resources.displayMetrics)
    }

    /**
     * Converts ISO3 language code to [java.util.Locale].

     * @param iso3 ISO3 language code
     * *
     * @return [java.util.Locale] that represents the language of the provided code
     */
    fun ISO3ToLocale(iso3: String): Locale {
      if (mLocaleMap == null) {
        val locales = Locale.getAvailableLocales()
        mLocaleMap = HashMap<String, Locale>()
        for (locale in locales) {
          try {
            mLocaleMap!!.put(locale.isO3Language.toUpperCase(), locale)
          } catch (e: MissingResourceException) {
            // Do nothing
          }

        }
      }
      return mLocaleMap!![iso3.toUpperCase()]!!
    }
  }
}
