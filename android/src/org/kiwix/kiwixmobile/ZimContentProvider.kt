/*
 * Copyright 2013
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

import android.content.ContentProvider
import android.content.ContentValues
import android.content.Context
import android.database.Cursor
import android.net.Uri
import android.os.ParcelFileDescriptor
import android.os.ParcelFileDescriptor.AutoCloseOutputStream
import android.util.Log
import android.webkit.MimeTypeMap
import java.io.*
import java.util.regex.Matcher
import java.util.regex.Pattern

class ZimContentProvider : ContentProvider() {

  private var matcher: Matcher? = null

  override fun onCreate(): Boolean {
    jniKiwix = JNIKiwix()
    setIcuDataDirectory()
    return true
  }

  override fun getType(uri: Uri): String? {
    var mimeType: String

    // This is the code which makes a guess based on the file extenstion
    val extension = MimeTypeMap.getFileExtensionFromUrl(uri.toString().toLowerCase())
    mimeType = MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension)

    // This is the code which retrieve the mimeType from the libzim
    // "slow" and still bugyy
    if (mimeType.isEmpty()) {
      var t = uri.toString()
      var pos = uri.toString().indexOf(CONTENT_URI.toString())
      if (pos != -1) {
        t = uri.toString().substring(
            CONTENT_URI.toString().length)
      }
      // Remove fragment (#...) as not supported by zimlib
      pos = t.indexOf("#")
      if (pos != -1) {
        t = t.substring(0, pos)
      }

      mimeType = jniKiwix!!.getMimeType(t)

      // Truncate mime-type (everything after the first space
      mimeType = mimeType.replace("^([^ ]+).*$".toRegex(), "$1")
    }

    Log.d(TAG_KIWIX, "Getting mime-type for " + uri.toString() + " = " + mimeType)
    return mimeType
  }

  @Throws(FileNotFoundException::class)
  override fun openFile(uri: Uri, mode: String): ParcelFileDescriptor? {

    matcher = PATTERN.matcher(uri.toString())
    if (matcher!!.matches()) {
      try {
        return saveVideoToCache(uri)
      } catch (e: IOException) {
        e.printStackTrace()
      }

    }
    return loadContent(uri)
  }

  @Throws(FileNotFoundException::class)
  private fun loadContent(uri: Uri): ParcelFileDescriptor {
    val pipe: Array<ParcelFileDescriptor>
    try {
      pipe = ParcelFileDescriptor.createPipe()
      TransferThread(jniKiwix!!, uri, AutoCloseOutputStream(pipe[1])).start()
    } catch (e: IOException) {
      Log.e(TAG_KIWIX, "Exception opening pipe", e)
      throw FileNotFoundException("Could not open pipe for: " + uri.toString())
    }

    return (pipe[0])
  }

  @Throws(IOException::class)
  private fun saveVideoToCache(uri: Uri): ParcelFileDescriptor {
    val filePath = getFilePath(uri)

    var fileName = uri.toString()
    fileName = fileName.substring(fileName.lastIndexOf('/') + 1, fileName.length)

    val f = File(FileUtils.getFileCacheDir(context), fileName)

    val mime = JNIKiwixString()
    val size = JNIKiwixInt()
    val data = jniKiwix!!.getContent(filePath, mime, size)

    val out = FileOutputStream(f)

    out.write(data, 0, data.size())
    out.flush()

    return ParcelFileDescriptor.open(f, ParcelFileDescriptor.MODE_READ_ONLY)
  }

  override fun query(url: Uri, projection: Array<String>?, selection: String?,
                     selectionArgs: Array<String>?, sort: String?): Cursor? {
    throw RuntimeException("Operation not supported")
  }

  override fun insert(uri: Uri, initialValues: ContentValues?): Uri? {
    throw RuntimeException("Operation not supported")
  }

  override fun update(uri: Uri, values: ContentValues?, where: String?,
                      whereArgs: Array<String>?): Int {
    throw RuntimeException("Operation not supported")
  }

  override fun delete(uri: Uri, where: String?, whereArgs: Array<String>?): Int {
    throw RuntimeException("Operation not supported")
  }

  private fun setIcuDataDirectory() {
    val workingDir = this.context!!.filesDir
    val icuDirPath = loadICUData(this.context, workingDir)

    if (icuDirPath != null) {
      Log.d(TAG_KIWIX, "Setting the ICU directory path to " + icuDirPath)
      jniKiwix!!.setDataDirectory(icuDirPath)
    }
  }

  internal class TransferThread @Throws(IOException::class)
  constructor(var jniKiwix:

              JNIKiwix, var articleUri:

              Uri, var out:

              OutputStream) : Thread() {

    var articleZimUrl: String

    init {
      Log.d(TAG_KIWIX, "Retrieving: " + articleUri.toString())

      val filePath = getFilePath(articleUri)
      this.articleZimUrl = filePath
    }

    override fun run() {
      try {
        val mime = JNIKiwixString()
        val size = JNIKiwixInt()
        val data = jniKiwix.getContent(articleZimUrl, mime, size)
        out.write(data, 0, data.size())
        out.flush()

        Log.d(TAG_KIWIX, "reading  " + articleZimUrl + "(mime: " + mime.value + ", size: " + size.value + ") finished.")
      } catch (e: IOException) {
        Log.e(TAG_KIWIX, "Exception reading article $articleZimUrl from zim file",
            e)
      } catch (e: NullPointerException) {
        Log.e(TAG_KIWIX, "Exception reading article $articleZimUrl from zim file", e)
      } finally {
        try {
          out.close()
        } catch (e: IOException) {
          Log.e(TAG_KIWIX,
              "Custom exception by closing out stream for article " + articleZimUrl,
              e)
        }

      }
    }
  }

  companion object {

    val TAG_KIWIX = "kiwix"

    val CONTENT_URI = Uri.parse("content://org.kiwix.zim.base/")

    val UI_URI = Uri.parse("content://org.kiwix.ui/")

    private val VIDEO_PATTERN = "([^\\s]+(\\.(?i)(3gp|mp4|m4a|webm|mkv|ogg|ogv))$)"

    private val PATTERN = Pattern.compile(VIDEO_PATTERN, Pattern.CASE_INSENSITIVE)

    private var zimFileName: String? = null

    private var jniKiwix: JNIKiwix? = null

    @Synchronized fun setZimFile(fileName: String): String? {
      if (!jniKiwix!!.loadZIM(fileName)) {
        Log.e(TAG_KIWIX, "Unable to open the file " + fileName)
        zimFileName = null
      } else {
        zimFileName = fileName
      }
      return zimFileName
    }

    fun getZimFile(): String? {
      return zimFileName
    }

    val zimFileTitle: String?
      get() {
        if (jniKiwix == null || zimFileName == null) {
          return null
        } else {
          val title = JNIKiwixString()
          if (jniKiwix!!.getTitle(title)) {
            return title.value
          } else {
            return null
          }
        }
      }

    val mainPage: String?
      get() {
        if (jniKiwix == null || zimFileName == null) {
          return null
        } else {
          return jniKiwix!!.mainPage
        }
      }

    val id: String?
      get() {
        if (jniKiwix == null || zimFileName == null) {
          return null
        } else {
          return jniKiwix!!.id
        }
      }

    val language: String?
      get() {
        if (jniKiwix == null || zimFileName == null) {
          return null
        } else {
          return jniKiwix!!.language
        }
      }

    fun searchSuggestions(prefix: String, count: Int): Boolean {
      if (jniKiwix == null || zimFileName == null) {
        return false
      } else {
        return jniKiwix!!.searchSuggestions(prefix, count)
      }
    }

    val nextSuggestion: String?
      get() {
        if (jniKiwix == null || zimFileName == null) {
          return null
        } else {
          val title = JNIKiwixString()
          if (jniKiwix!!.getNextSuggestion(title)) {
            return title.value
          } else {
            return null
          }
        }
      }

    fun getPageUrlFromTitle(title: String): String? {
      if (jniKiwix == null || zimFileName == null) {
        return null
      } else {
        val url = JNIKiwixString()
        if (jniKiwix!!.getPageUrlFromTitle(title, url)) {
          return url.value
        } else {
          return null
        }
      }
    }

    val randomArticleUrl: String?
      get() {
        if (jniKiwix == null || zimFileName == null) {
          return null
        } else {
          val url = JNIKiwixString()
          if (jniKiwix!!.getRandomPage(url)) {
            return url.value
          } else {
            return null
          }
        }
      }

    private fun loadICUData(context: Context, workingDir: File): String? {
      val icuFileName = "icudt49l.dat"
      try {
        val icuDir = File(workingDir, "icu")
        if (!icuDir.exists()) {
          icuDir.mkdirs()
        }
        val icuDataFile = File(icuDir, icuFileName)
        if (!icuDataFile.exists()) {
          val `in` = context.assets.open(icuFileName)
          val out = FileOutputStream(icuDataFile)
          val buf = ByteArray(1024)
          var len = `in`.read(buf)
          while (len > 0) {
            out.write(buf, 0, len)
            len = `in`.read(buf)
          }
          `in`.close()
          out.flush()
          out.close()
        }
        return icuDir.absolutePath
      } catch (e: Exception) {
        Log.e(TAG_KIWIX, "Error copying icu data file", e)
        return null
      }

    }

    private fun getFilePath(articleUri: Uri): String {
      var filePath = articleUri.toString()
      var pos = articleUri.toString().indexOf(CONTENT_URI.toString())
      if (pos != -1) {
        filePath = articleUri.toString().substring(
            CONTENT_URI.toString().length)
      }
      // Remove fragment (#...) as not supported by zimlib
      pos = filePath.indexOf("#")
      if (pos != -1) {
        filePath = filePath.substring(0, pos)
      }
      return filePath
    }
  }
}