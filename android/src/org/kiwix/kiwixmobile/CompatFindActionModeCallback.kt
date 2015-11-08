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
import android.support.v7.view.ActionMode
import android.text.Editable
import android.text.Selection
import android.text.Spannable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.view.inputmethod.InputMethodManager
import android.webkit.WebView
import android.widget.EditText

import java.lang.reflect.Method

class CompatFindActionModeCallback(context: Context) : ActionMode.Callback, TextWatcher, View.OnClickListener {

  var mIsActive: Boolean = false

  private val mCustomView: View

  private val mEditText: EditText

  private var mWebView: WebView? = null

  private val mInput: InputMethodManager

  private var mMatchesFound: Boolean = false

  private var mActionMode: ActionMode? = null

  init {
    mCustomView = LayoutInflater.from(context).inflate(R.layout.webview_search, null)
    mEditText = mCustomView.findViewById(R.id.edit) as EditText
    mEditText.setOnClickListener(this)
    mInput = context.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
    mIsActive = false
    setText("")
  }

  fun setActive() {
    mIsActive = true
  }

  fun finish() {
    mActionMode!!.finish()
    mWebView!!.clearMatches()
  }

  // Place text in the text field so it can be searched for.  Need to press
  // the find next or find previous button to find all of the matches.
  fun setText(text: String) {
    mEditText.setText(text)
    val span = mEditText.text
    val length = span.length

    // Ideally, we would like to set the selection to the whole field,
    // but this brings up the Text selection CAB, which dismisses this
    // one.
    Selection.setSelection(span, length, length)

    // Necessary each time we set the text, so that this will watch
    // changes to it.
    span.setSpan(this, 0, length, Spannable.SPAN_INCLUSIVE_INCLUSIVE)
    mMatchesFound = false
  }

  // Set the WebView to search.  Must be non null, and set before calling startActionMode.
  fun setWebView(webView: WebView?) {
    if (null == webView) {
      throw AssertionError(
          "WebView supplied to CompatFindActionModeCallback cannot be null")
    }
    mWebView = webView
  }

  // Move the highlight to the next match.
  // If true, find the next match further down in the document.
  // If false, find the previous match, up in the document.
  private fun findNext(next: Boolean) {

    if (mWebView == null) {
      throw AssertionError("No WebView for CompatFindActionModeCallback::findNext")
    }

    mWebView!!.findNext(next)
  }

  // Highlight all the instances of the string from mEditText in mWebView.
  fun findAll() {
    if (mWebView == null) {
      throw AssertionError("No WebView for CompatFindActionModeCallback::findAll")
    }
    val find = mEditText.text
    if (find.length == 0) {
      mWebView!!.clearMatches()
      mMatchesFound = false
      mWebView!!.findAll(null)
    } else {
      mMatchesFound = true
      mWebView!!.findAll(find.toString())

      // Enable word highlighting with reflection
      try {
        for (ms in WebView::class.java.declaredMethods) {
          if (ms.name == "setFindIsUp") {
            ms.isAccessible = true
            ms.invoke(mWebView, true)
            break
          }
        }
      } catch (ignored: Exception) {

      }

    }
  }

  // Show on screen keyboard
  fun showSoftInput() {
    mEditText.requestFocus()
    mEditText.isFocusable = true
    mEditText.isFocusableInTouchMode = true
    mEditText.requestFocusFromTouch()

    if (mEditText.requestFocus()) {
      mInput.showSoftInput(mEditText, InputMethodManager.SHOW_IMPLICIT)
    }
  }

  override fun onClick(v: View) {
    findNext(true)
  }

  override fun onCreateActionMode(mode: ActionMode, menu: Menu): Boolean {
    mode.customView = mCustomView
    mode.menuInflater.inflate(R.menu.menu_webview, menu)
    mActionMode = mode
    val edit = mEditText.text
    Selection.setSelection(edit, edit.length)
    mMatchesFound = false
    mEditText.requestFocus()
    return true
  }

  override fun onDestroyActionMode(mode: ActionMode) {
    mActionMode = null
    mIsActive = false
    mWebView!!.clearMatches()
    mInput.hideSoftInputFromWindow(mWebView!!.windowToken, 0)
  }

  override fun onPrepareActionMode(mode: ActionMode, menu: Menu): Boolean {
    return false
  }

  override fun onActionItemClicked(mode: ActionMode, item: MenuItem): Boolean {
    if (mWebView == null) {
      throw AssertionError(
          "No WebView for CompatFindActionModeCallback::onActionItemClicked")
    }

    mInput.hideSoftInputFromWindow(mWebView!!.windowToken, 0)

    when (item.itemId) {
      R.id.find_prev -> findNext(false)
      R.id.find_next -> findNext(true)
      else -> return false
    }
    return true
  }

  override fun beforeTextChanged(s: CharSequence, start: Int, count: Int, after: Int) {
    // Does nothing. Needed to implement a TextWatcher.
  }

  override fun onTextChanged(s: CharSequence, start: Int, before: Int, count: Int) {
    findAll()
  }

  override fun afterTextChanged(s: Editable) {
    // Does nothing. Needed to implement a TextWatcher.
  }
}