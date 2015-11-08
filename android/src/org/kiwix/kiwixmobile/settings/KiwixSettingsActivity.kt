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

package org.kiwix.kiwixmobile.settings

import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.os.Bundle
import android.preference.EditTextPreference
import android.preference.ListPreference
import android.preference.Preference
import android.preference.PreferenceFragment
import android.support.v7.app.AppCompatActivity
import android.support.v7.widget.Toolbar
import android.view.View
import android.widget.BaseAdapter

import org.kiwix.kiwixmobile.LanguageUtils
import org.kiwix.kiwixmobile.R

import java.util.Locale

class KiwixSettingsActivity : AppCompatActivity() {

  public override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.settings)

    fragmentManager.beginTransaction().replace(R.id.content_frame, PrefsFragment()).commit()

    setUpToolbar()
  }

  private fun setUpToolbar() {
    val toolbar = findViewById(R.id.toolbar) as Toolbar
    setSupportActionBar(toolbar)

    supportActionBar!!.setHomeButtonEnabled(true)
    supportActionBar!!.setDisplayHomeAsUpEnabled(true)

    toolbar.setNavigationOnClickListener(object : View.OnClickListener {
      override fun onClick(v: View) {
        finish()
      }
    })
  }

  class PrefsFragment : PreferenceFragment(), SharedPreferences.OnSharedPreferenceChangeListener {


    private var mSlider: SliderPreference? = null

    override fun onCreate(savedInstanceState: Bundle?) {
      super.onCreate(savedInstanceState)
      addPreferencesFromResource(R.xml.preferences)

      mSlider = getPrefrence(PREF_ZOOM) as SliderPreference
      setSliderState()
      setUpSettings()
      LanguageUtils(activity).changeFont(activity.layoutInflater)
    }

    private fun setSliderState() {
      val enabled = preferenceManager.sharedPreferences.getBoolean(
          PREF_ZOOM_ENABLED, false)
      if (enabled) {
        mSlider!!.isEnabled = true
      } else {
        mSlider!!.isEnabled = false
      }
    }

    override fun onResume() {
      super.onResume()
      preferenceScreen.sharedPreferences.registerOnSharedPreferenceChangeListener(this)
    }

    override fun onPause() {
      super.onPause()
      preferenceScreen.sharedPreferences.unregisterOnSharedPreferenceChangeListener(this)
    }

    fun setUpSettings() {

      setUpLanguageChooser(PREF_LANG)
      setAppVersionNumber()
    }

    private fun setUpLanguageChooser(preferenceId: String) {

      val languageList = getPrefrence(preferenceId) as ListPreference
      val languageUtils = LanguageUtils(activity)

      languageList.title = Locale.getDefault().displayLanguage
      languageList.setEntries(languageUtils.values.toArray<String>(arrayOfNulls<String>(0)))
      languageList.setEntryValues(languageUtils.keys.toArray<String>(arrayOfNulls<String>(0)))
      languageList.setDefaultValue(Locale.getDefault().toString())
      languageList.onPreferenceChangeListener = object : Preference.OnPreferenceChangeListener {
        override fun onPreferenceChange(preference: Preference, newValue: Any): Boolean {

          if (newValue != Locale.getDefault().toString()) {

            LanguageUtils.handleLocaleChange(activity, newValue.toString())
            // Request a restart when the user returns to the Activity, that called this Activity
            restartActivity()
          }
          return true
        }
      }
    }

    private fun restartActivity() {
      activity.setResult(RESULT_RESTART)
      activity.finish()
      activity.startActivity(Intent(activity, activity.javaClass))
    }

    private fun setAppVersionNumber() {
      val version: String

      try {
        version = activity.packageManager.getPackageInfo("org.kiwix.kiwixmobile", 0).versionName
      } catch (e: PackageManager.NameNotFoundException) {
        return
      }

      val versionPref = this@PrefsFragment.findPreference(PREF_VERSION) as EditTextPreference
      versionPref.summary = version
    }

    private fun getPrefrence(preferenceId: String): Preference {
      return this@PrefsFragment.findPreference(preferenceId)
    }

    override fun onSharedPreferenceChanged(sharedPreferences: SharedPreferences, key: String) {

      if (key == PREF_ZOOM_ENABLED) {
        setSliderState()
      }
      if (key == PREF_ZOOM) {
        mSlider!!.summary = mSlider!!.summary
        (preferenceScreen.rootAdapter as BaseAdapter).notifyDataSetChanged()

      }
    }
  }

  companion object {

    val RESULT_RESTART = 1236

    val PREF_LANG = "pref_language_chooser"

    val PREF_VERSION = "pref_version"

    val PREF_ZOOM_ENABLED = "pref_zoom_enabled"

    val PREF_ZOOM = "pref_zoom_slider"
  }
}