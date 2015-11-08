package org.kiwix.kiwixmobile

import android.annotation.SuppressLint
import android.app.Activity
import android.app.AlertDialog
import android.app.Dialog
import android.content.DialogInterface
import android.os.Bundle
import android.support.v4.app.DialogFragment

@SuppressLint("ValidFragment")
class BookmarkDialog(private val contents: Array<String>, private val isBookmarked: Boolean) : DialogFragment() {

  private var listen: BookmarkDialogListener? = null

  override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
    val build = AlertDialog.Builder(activity)
    //build.setTitle(R.string.menu_bookmarks);
    val buttonText: String
    if (isBookmarked) {
      buttonText = resources.getString(R.string.remove_bookmark)
    } else {
      buttonText = resources.getString(R.string.add_bookmark)
    }

    if (contents.size() != 0) {
      build.setItems(contents, object : DialogInterface.OnClickListener {
        override fun onClick(dialog: DialogInterface, choice: Int) {
          listen!!.onListItemSelect(contents[choice])
        }
      })
    }

    build.setNeutralButton(buttonText, object : DialogInterface.OnClickListener {
      override fun onClick(dialog: DialogInterface, choice: Int) {
        listen!!.onBookmarkButtonPressed()
      }
    })

    return build.create()
  }

  override fun onAttach(a: Activity?) {
    super.onAttach(a)
    try {
      listen = a as BookmarkDialogListener?
    } catch (e: ClassCastException) {
      throw ClassCastException(a!!.toString() + " must implement BookmarkDialogListener")
    }

  }

  interface BookmarkDialogListener {

    fun onListItemSelect(choice: String)

    fun onBookmarkButtonPressed()
  }
}
