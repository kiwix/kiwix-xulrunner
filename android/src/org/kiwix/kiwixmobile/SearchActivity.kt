package org.kiwix.kiwixmobile


import android.content.Intent
import android.os.Bundle
import android.support.v4.view.MenuItemCompat
import android.support.v7.app.AppCompatActivity
import android.support.v7.widget.SearchView
import android.support.v7.widget.Toolbar
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.widget.AdapterView
import android.widget.ListView


class SearchActivity : AppCompatActivity(), AdapterView.OnItemClickListener {

  private var mListView: ListView? = null

  private var mAdapter: AutoCompleteAdapter? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.search)
    val toolbar = findViewById(R.id.toolbar) as Toolbar
    setSupportActionBar(toolbar)
    supportActionBar!!.setDisplayHomeAsUpEnabled(true)
    supportActionBar!!.setHomeButtonEnabled(true)

    mListView = findViewById(R.id.search_list) as ListView
    mAdapter = AutoCompleteAdapter(this)
    mListView!!.adapter = mAdapter
    mListView!!.onItemClickListener = this
  }

  override fun finish() {
    super.finish()
    overridePendingTransition(0, 0)
  }

  override fun onCreateOptionsMenu(menu: Menu): Boolean {
    // Inflate the menu; this adds items to the action bar if it is present.
    menuInflater.inflate(R.menu.menu_search, menu)
    val searchMenuItem = menu.findItem(R.id.menu_search)
    MenuItemCompat.expandActionView(searchMenuItem)
    val searchView = menu.findItem(R.id.menu_search).actionView as SearchView
    searchView.setOnQueryTextListener(object : SearchView.OnQueryTextListener {
      override fun onQueryTextSubmit(s: String): Boolean {
        return false
      }

      override fun onQueryTextChange(s: String): Boolean {
        mAdapter!!.filter.filter(s)
        return true
      }
    })

    MenuItemCompat.setOnActionExpandListener(searchMenuItem,
        object : MenuItemCompat.OnActionExpandListener {
          override fun onMenuItemActionExpand(item: MenuItem): Boolean {
            return false
          }

          override fun onMenuItemActionCollapse(item: MenuItem): Boolean {
            finish()
            return true
          }
        })
    return true
  }

  override fun onItemClick(parent: AdapterView<*>, view: View, position: Int, id: Long) {
    val title = mAdapter!!.getItem(position)
    sendMessage(title)
  }

  private fun sendMessage(uri: String) {
    val i = Intent()
    i.putExtra(KiwixMobileActivity.TAG_FILE_SEARCHED, uri)
    setResult(Activity.RESULT_OK, i)
    finish()
  }
}
