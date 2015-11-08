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


import android.app.Activity
import android.content.Context
import android.content.Intent
import android.database.Cursor
import android.net.Uri
import android.os.AsyncTask
import android.os.Build
import android.os.Bundle
import android.os.Parcelable
import android.provider.MediaStore
import android.support.v4.app.LoaderManager
import android.support.v4.content.CursorLoader
import android.support.v4.content.Loader
import android.support.v4.widget.SimpleCursorAdapter
import android.support.v7.app.AppCompatActivity
import android.support.v7.widget.Toolbar
import android.util.Log
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.view.ViewGroup
import android.view.animation.AlphaAnimation
import android.widget.*
import android.widget.AdapterView.OnItemClickListener
import java.io.File
import java.util.*

class ZimFileSelectActivity : AppCompatActivity(), LoaderManager.LoaderCallbacks<Cursor>, OnItemClickListener {

  // Adapter of the Data populated by the MediaStore
  private var mCursorAdapter: SimpleCursorAdapter? = null

  // Adapter of the Data populated by recanning the Filesystem by ourselves
  private var mRescanAdapter: RescanDataAdapter? = null

  private var mFiles: ArrayList<DataModel>? = null

  private var mZimFileList: ListView? = null

  private var mProgressBar: ProgressBar? = null

  private var mProgressBarMessage: TextView? = null

  public override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    LanguageUtils(this).changeFont(layoutInflater)

    setContentView(R.layout.zim_list)
    setUpToolbar()

    mProgressBar = findViewById(R.id.progressBar) as ProgressBar
    mProgressBarMessage = findViewById(R.id.progressbar_message) as TextView
    mZimFileList = findViewById(R.id.zimfilelist) as ListView
    mFiles = ArrayList<DataModel>()

    mZimFileList!!.onItemClickListener = this

    mProgressBar!!.visibility = View.VISIBLE
    setAlpha(true)

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB) {
      startQuery()
    } else {
      RescanFileSystem().execute()
    }
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

  override fun onCreateLoader(i: Int, bundle: Bundle): Loader<Cursor> {

    val uri = MediaStore.Files.getContentUri("external")

    val projection = arrayOf(MediaStore.Files.FileColumns._ID, // File Name
        MediaStore.Files.FileColumns.TITLE, // File Path
        MediaStore.Files.FileColumns.DATA)

    // Exclude media files, they would be here also (perhaps
    // somewhat better performance), and filter for zim files
    // (normal and first split)
    val query = MediaStore.Files.FileColumns.MEDIA_TYPE + "=" + MediaStore.Files.FileColumns.MEDIA_TYPE_NONE + " AND" + " ( LOWER(" + MediaStore.Images.Media.DATA + ") LIKE '%." + FileSearch.zimFiles[0] + "'" + " OR LOWER(" + MediaStore.Images.Media.DATA + ") LIKE '%." + FileSearch.zimFiles[1] + "'" + " ) "

    val selectionArgs: Array<String>? = null // There is no ? in query so null here

    val sortOrder = MediaStore.Files.FileColumns.TITLE // Sorted alphabetical
    Log.d(TAG_KIWIX, " Performing query for zim files...")

    return CursorLoader(this, uri, projection, query, selectionArgs, sortOrder)
  }

  override fun onLoadFinished(cursorLoader: Loader<Cursor>, cursor: Cursor) {
    Log.d(TAG_KIWIX, "DONE querying Mediastore for .zim files")
    buildArrayAdapter(cursor)
    mCursorAdapter!!.swapCursor(cursor)
    mRescanAdapter = buildArrayAdapter(cursor)
    mZimFileList!!.adapter = mRescanAdapter

    // Done here to avoid that shown while loading.
    mZimFileList!!.emptyView = findViewById(R.id.zimfilelist_nozimfilesfound_view)

    if (mProgressBarMessage!!.visibility == View.GONE) {
      mProgressBar!!.visibility = View.GONE
      setAlpha(false)
    }

    mCursorAdapter!!.notifyDataSetChanged()
  }

  override fun onLoaderReset(cursorLoader: Loader<Cursor>) {
    mCursorAdapter!!.swapCursor(null)
  }

  override fun onSaveInstanceState(outState: Bundle) {

    // Check, if the user has rescanned the file system, if he has, then we want to save this list,
    // so this can be shown again, if the actvitity is recreated (on a device rotation for example)
    if (!mFiles!!.isEmpty()) {
      Log.i(TAG_KIWIX, "Saved state of the ListView")
      outState.putParcelableArrayList("rescanData", mFiles)
    }
    super.onSaveInstanceState(outState)
  }

  override fun onRestoreInstanceState(savedInstanceState: Bundle) {

    // Get the rescanned data, if available. Create an Adapter for the ListView and display the list
    if (savedInstanceState.getParcelableArrayList<Parcelable>("rescanData") != null) {
      val data = savedInstanceState.getParcelableArrayList<DataModel>("rescanData")
      mRescanAdapter = RescanDataAdapter(this@ZimFileSelectActivity, 0, data)

      mZimFileList!!.adapter = mRescanAdapter
    }
    super.onRestoreInstanceState(savedInstanceState)
  }

  override fun onCreateOptionsMenu(menu: Menu): Boolean {
    val inflater = menuInflater
    inflater.inflate(R.menu.menu_files, menu)
    return super.onCreateOptionsMenu(menu)
  }

  override fun onOptionsItemSelected(item: MenuItem): Boolean {

    when (item.itemId) {
      R.id.menu_rescan_fs -> // Execute our AsyncTask, that scans the file system for the actual data
        RescanFileSystem().execute()
    }// Make sure, that we set mNeedsUpdate to true and to false, after the MediaStore has been
    // updated. Otherwise it will result in a endless loop.

    return super.onOptionsItemSelected(item)
  }

  override fun onItemClick(parent: AdapterView<*>, view: View, position: Int, id: Long) {

    Log.d(TAG_KIWIX, " mZimFileList.onItemClick")

    val file: String

    // Check which one of the Adapters is currently filling the ListView.
    // If the data is populated by the LoaderManager cast the current selected mLibrary to Cursor,
    // if the data is populated by the ArrayAdapter, then cast it to the DataModel class.
    if (mZimFileList!!.getItemAtPosition(position) is DataModel) {

      val data = mZimFileList!!.getItemAtPosition(position) as DataModel
      file = data.path!!

    } else {
      val cursor = mZimFileList!!.getItemAtPosition(position) as Cursor
      file = cursor.getString(2)
    }

    finishResult(file)
  }

  // Query through the MediaStore
  protected fun startQuery() {

    // Defines a list of columns to retrieve from the Cursor and load into an output row
    val mZimListColumns = arrayOf(MediaStore.Files.FileColumns.TITLE, MediaStore.Files.FileColumns.DATA)

    // Defines a list of View IDs that will receive the Cursor columns for each row
    val mZimListItems = intArrayOf(android.R.id.text1, android.R.id.text2)

    mCursorAdapter = SimpleCursorAdapter(
        // The Context object
        this@ZimFileSelectActivity,
        // A layout in XML for one row in the ListView
        android.R.layout.simple_list_item_2,
        // The cursor, swapped later by cursorloader
        null,
        // A string array of column names in the cursor
        mZimListColumns,
        // An integer array of view IDs in the row layout
        mZimListItems,
        // Flags for the Adapter
        Adapter.NO_SELECTION)

    supportLoaderManager.initLoader(LOADER_ID, null, this)
  }

  // Get the data of our cursor and wrap it all in our ArrayAdapter.
  // We are doing this because the CursorAdapter does not allow us do remove rows from its dataset.
  private fun buildArrayAdapter(cursor: Cursor): RescanDataAdapter {

    var files = ArrayList<DataModel>()

    cursor.moveToFirst()
    while (!cursor.isAfterLast) {

      if (File(cursor.getString(2)).exists()) {
        files.add(DataModel(cursor.getString(1), cursor.getString(2)))
      }
      cursor.moveToNext()
    }

    files = FileWriter(this@ZimFileSelectActivity, files).dataModelList

    for (i in files.indices) {

      if (!File(files[i].path).exists()) {
        Log.e(TAG_KIWIX, "File removed: " + files[i].title)
        files.removeAt(i)
      }
    }

    files = FileSearch().sortDataModel(files)
    mFiles = files

    return RescanDataAdapter(this@ZimFileSelectActivity, 0, mFiles!!)
  }

  // Get the selected file and return the result to the Activity, that called this Activity
  private fun finishResult(path: String?) {

    if (path != null) {
      val file = File(path)
      val uri = Uri.fromFile(file)
      Log.i(TAG_KIWIX, "Opening " + uri)
      setResult(Activity.RESULT_OK, Intent().setData(uri))
      finish()
    } else {
      setResult(Activity.RESULT_CANCELED)
      finish()
    }
  }

  // Make the View transparent or opaque
  private fun setAlpha(transparent: Boolean) {

    val viewTransparency = if (transparent) 0.4f else 1f

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB) {
      mZimFileList!!.alpha = viewTransparency
    } else {
      val alpha = AlphaAnimation(viewTransparency, viewTransparency)
      alpha.duration = 0
      alpha.fillAfter = true
      mZimFileList!!.startAnimation(alpha)
    }
  }

  // The Adapter for the ListView for when the ListView is populated with the rescanned files
  private inner class RescanDataAdapter(context: Context, textViewResourceId: Int, objects: List<DataModel>) : ArrayAdapter<DataModel>(context, textViewResourceId, objects) {

    override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {
      var convertView = convertView

      val holder: ViewHolder

      // Check if we should inflate the layout for a new row, or if we can reuse a view.
      if (convertView == null) {
        convertView = View.inflate(context, android.R.layout.simple_list_item_2, null)
        holder = ViewHolder(
            convertView!!.findViewById(android.R.id.text1) as TextView,
            convertView.findViewById(android.R.id.text2) as TextView
        )
        convertView.tag = holder
      } else {
        holder = convertView.tag as ViewHolder
      }
      holder.title.text = getItem(position).title
      holder.path.text = getItem(position).path
      return convertView
    }

    // We are using the ViewHolder pattern in order to optimize the ListView by reusing
    // Views and saving them to this mLibrary class, and not inlating the layout every time
    // we need to create a row.

  }

  data class ViewHolder(var title: TextView, var path: TextView)
  // This AsyncTask will scan the file system for files with the Extension ".zim" or ".zimaa"
  private inner class RescanFileSystem : AsyncTask<Void, Void, Void>() {

    override fun onPreExecute() {

      mProgressBarMessage!!.visibility = View.VISIBLE
      mProgressBar!!.visibility = View.VISIBLE
      setAlpha(true)

      super.onPreExecute()
    }

    override fun doInBackground(vararg params: Void): Void? {

      mFiles = FileSearch().findFiles()
      return null
    }

    override fun onPostExecute(result: Void) {
      mRescanAdapter = RescanDataAdapter(this@ZimFileSelectActivity, 0, mFiles!!)

      mZimFileList!!.adapter = mRescanAdapter

      mProgressBarMessage!!.visibility = View.GONE
      mProgressBar!!.visibility = View.GONE
      setAlpha(false)

      FileWriter(this@ZimFileSelectActivity).saveArray(mFiles!!)

      super.onPostExecute(result)
    }
  }

  companion object {

    val TAG_KIWIX = "kiwix"

    private val LOADER_ID = 2
  }
}
