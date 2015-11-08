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

import android.content.Context
import android.graphics.ColorMatrixColorFilter
import android.graphics.Paint
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.os.Handler
import android.os.Message
import android.preference.PreferenceManager
import android.util.AttributeSet
import android.util.Log
import android.view.ContextMenu
import android.view.MenuItem
import android.view.View
import android.webkit.WebView
import android.widget.Toast
import java.io.File
import java.io.FileOutputStream
import java.io.IOException


class KiwixWebView : WebView {

  private var mChangeListener: OnPageChangeListener? = null

  private var mOnLongClickListener: OnLongClickListener? = null

  private val saveHandler = object : Handler() {

    override fun handleMessage(msg: Message) {

      var url: String? = msg.data.get("url") as String?
      val src = msg.data.get("src") as String?

      if (url != null || src != null) {
        url = if (url == null) src else url
        url = url!!.substring(url.lastIndexOf('/') + 1, url.length)
        url = url.substring(url.indexOf("%3A") + 3, url.length)
        val dotIndex = url.lastIndexOf('.')

        var storageDir = File(Environment.getExternalStoragePublicDirectory(
            Environment.DIRECTORY_PICTURES), url)

        var newUrl: String = url
        var i = 2
        while (storageDir.exists()) {
          newUrl = url.substring(0, dotIndex) + "_" + i + url.substring(dotIndex, url.length)
          storageDir = File(Environment.getExternalStoragePublicDirectory(
              Environment.DIRECTORY_PICTURES), newUrl)
          i++
        }

        val source = Uri.parse(src)
        val toastText: String

        try {
          val input = context.contentResolver.openInputStream(source)
          val output = FileOutputStream(storageDir)

          val buffer = ByteArray(1024)
          var len = input.read(buffer)
          while (len  > 0) {
            output.write(buffer, 0, len)
            len = input.read(buffer)
          }
          input.close()
          output.close()

          val imageSaved = resources.getString(R.string.save_media_saved)
          toastText = imageSaved.format(newUrl)
        } catch (e: IOException) {
          Log.d("kiwix", "Couldn't save image", e)
          toastText = resources.getString(R.string.save_media_error)
        }

        Toast.makeText(context, toastText, Toast.LENGTH_LONG).show()
      }
    }
  }

  constructor(context: Context) : super(context) {
  }

  constructor(context: Context, attrs: AttributeSet) : super(context, attrs) {
  }

  constructor(context: Context, attrs: AttributeSet, defStyle: Int) : super(context, attrs, defStyle) {
  }

  fun loadPrefs() {
    disableZoomControls()

    val sharedPreferences = PreferenceManager.getDefaultSharedPreferences(context)
    val zoomEnabled = sharedPreferences.getBoolean(PREF_ZOOM_ENABLED, false)

    if (zoomEnabled) {
      val zoomScale = sharedPreferences.getFloat(PREF_ZOOM, 100.0f).toInt()
      setInitialScale(zoomScale)
    } else {
      setInitialScale(0)
    }
  }

  fun deactiviateNightMode() {
    setLayerType(View.LAYER_TYPE_NONE, null)
  }

  fun toggleNightMode() {

    val paint = Paint()
    val filterInvert = ColorMatrixColorFilter(mNegativeColorArray)
    paint.setColorFilter(filterInvert)

    setLayerType(View.LAYER_TYPE_HARDWARE, paint)
    try {
      val stream = context.assets.open("invertcode.js")
      val size = stream.available()
      val buffer = ByteArray(size)
      stream.read(buffer)
      stream.close()
      val JSInvert = String(buffer)

      if (Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
        evaluateJavascript("javascript:" + JSInvert, null)
      } else {
        //loadUrl("javascript:" + JSInvert);
      }

    } catch (e: IOException) {
      e.printStackTrace()
    }

  }

  override fun performLongClick(): Boolean {
    val result = hitTestResult

    if (result.type == WebView.HitTestResult.SRC_ANCHOR_TYPE) {
      mOnLongClickListener!!.onLongClick(result.extra)
      return true
    }
    return super.performLongClick()
  }

  override fun onCreateContextMenu(menu: ContextMenu) {
    super.onCreateContextMenu(menu)
    val result = hitTestResult
    if (result.type == WebView.HitTestResult.IMAGE_ANCHOR_TYPE || result.type == WebView.HitTestResult.IMAGE_TYPE || result.type == WebView.HitTestResult.SRC_IMAGE_ANCHOR_TYPE) {
      val saveMenu = menu.add(0, 1, 0, resources.getString(R.string.save_media))
      saveMenu.setOnMenuItemClickListener(object : MenuItem.OnMenuItemClickListener {
        override fun onMenuItemClick(item: android.view.MenuItem): Boolean {
          val msg = saveHandler.obtainMessage()
          requestFocusNodeHref(msg)
          return true
        }
      })
    }
  }

  override fun onScrollChanged(l: Int, t: Int, oldl: Int, oldt: Int) {
    super.onScrollChanged(l, t, oldl, oldt)
    val windowHeight = measuredHeight
    val pages = contentHeight / windowHeight
    val page = t / windowHeight

    // Alert the listener
    if (mChangeListener != null) {
      mChangeListener!!.onPageChanged(page, pages)
    }
  }

  fun disableZoomControls() {

    settings.builtInZoomControls = true
    settings.displayZoomControls = false
  }

  fun setOnPageChangedListener(listener: OnPageChangeListener) {
    mChangeListener = listener
  }

  fun setOnLongClickListener(listener: OnLongClickListener) {
    mOnLongClickListener = listener
  }

  interface OnPageChangeListener {

    fun onPageChanged(page: Int, maxPages: Int)
  }

  interface OnLongClickListener {

    fun onLongClick(url: String)
  }

  companion object {

    private val PREF_ZOOM = "pref_zoom_slider"

    private val PREF_ZOOM_ENABLED = "pref_zoom_enabled"

    private val mNegativeColorArray = floatArrayOf(-1.0f, 0f, 0f, 0f, 255f, // red
        0f, -1.0f, 0f, 0f, 255f, // green
        0f, 0f, -1.0f, 0f, 255f, // blue
        0f, 0f, 0f, 1.0f, 0f // alpha
    )
  }
}

