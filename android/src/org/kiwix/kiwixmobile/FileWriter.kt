/*
 * Copyright 2013 Rashiq Ahmad <rashiq.z@gmail.com>
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
import android.util.Log

import java.io.File
import java.io.IOException
import java.io.InputStream
import java.util.ArrayList
import java.util.Arrays

class FileWriter {

  private var mContext: Context? = null

  private val mDataList: ArrayList<DataModel>

  constructor(context: Context) {
    mContext = context
  }

  constructor(context: Context, dataList: ArrayList<DataModel>) {
    mDataList = dataList
    mContext = context
  }

  // Build a CSV list from the file paths
  fun saveArray(files: ArrayList<DataModel>) {

    val list = ArrayList<String>()

    for (file in files) {
      list.add(file.path)
    }

    val sb = StringBuilder()
    for (s in list) {
      sb.append(s)
      sb.append(",")
    }

    saveCsvToPrefrences(sb.toString())
  }

  // Read the locales.txt file in the assets folder, that has been created at compile time by the
  // build script
  fun readFileFromAssets(): ArrayList<String> {

    var content = ""

    try {
      val stream = mContext!!.assets.open("locales.txt")

      val size = stream.available()
      val buffer = ByteArray(size)
      stream.read(buffer)
      stream.close()
      content = String(buffer)

    } catch (e: IOException) {

    }

    return readCsv(content)
  }

  // Add items to the MediaStore list, that are not in the MediaStore database.
  // These will be loaded from a previously saved CSV file.
  // We are checking, if these file still exist as well.
  val dataModelList: ArrayList<DataModel>
    get() {

      for (file in readCsv()) {
        if (!mDataList.contains(DataModel(getTitleFromFilePath(file), file))) {
          Log.i(TAG_KIWIX, "Added file: " + file)
          mDataList.add(DataModel(getTitleFromFilePath(file), file))
        }
      }

      return mDataList
    }

  // Split the CSV by the comma and return an ArrayList with the file paths
  private fun readCsv(): ArrayList<String> {

    val csv = csvFromPrefrences

    return readCsv(csv)
  }

  private fun readCsv(csv: String): ArrayList<String> {

    val csvArray = csv.split(",".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()

    return ArrayList(Arrays.asList(*csvArray))
  }

  // Save a CSV file to the prefrences
  private fun saveCsvToPrefrences(csv: String) {

    val preferences = mContext!!.getSharedPreferences(PREF_NAME, 0)
    val editor = preferences.edit()
    editor.putString(CSV_PREF_NAME, csv)

    editor.commit()
  }

  // Load the CSV from the prefrences
  private val csvFromPrefrences: String
    get() {
      val preferences = mContext!!.getSharedPreferences(PREF_NAME, 0)

      return preferences.getString(CSV_PREF_NAME, "")
    }

  // Remove the file path and the extension and return a file name for the given file path
  private fun getTitleFromFilePath(path: String): String {
    return File(path).name.replaceFirst("[.][^.]+$".toRegex(), "")
  }

  companion object {

    val TAG_KIWIX = "kiwix"

    private val PREF_NAME = "csv_file"

    private val CSV_PREF_NAME = "csv_string"
  }
}


