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


import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.DialogInterface
import android.content.Intent
import android.content.res.Configuration
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.preference.PreferenceManager
import android.support.v4.view.GravityCompat
import android.support.v4.widget.DrawerLayout
import android.support.v7.app.ActionBarDrawerToggle
import android.support.v7.app.AlertDialog
import android.support.v7.app.AppCompatActivity
import android.support.v7.widget.Toolbar
import android.util.Log
import android.view.*
import android.view.animation.AnimationUtils
import android.webkit.*
import android.widget.*
import org.kiwix.kiwixmobile.settings.Constants
import org.kiwix.kiwixmobile.settings.KiwixSettingsActivity
import java.io.*
import java.util.*


class KiwixMobileActivity : AppCompatActivity(), BookmarkDialog.BookmarkDialogListener {

  var menu: Menu? = null

  var isFullscreenOpened: Boolean = false

  var exitFullscreenButton: ImageButton? = null

  protected var requestClearHistoryAfterLoad: Boolean = false

  protected var requestInitAllMenuItems: Boolean = false

  protected var requestWebReloadOnFinished: Int = 0

  private var mIsBacktotopEnabled: Boolean = false

  private var mBackToTopButton: Button? = null

  private var mDrawerList: ListView? = null

  private var mDrawerLayout: DrawerLayout? = null

  private var bookmarks: ArrayList<String>? = null

  private val mWebViews = ArrayList<KiwixWebView>()

  private var tts: KiwixTextToSpeech? = null

  private var mCompatCallback: CompatFindActionModeCallback? = null

  private var mDrawerAdapter: ArrayAdapter<KiwixWebView>? = null

  private var mContentFrame: FrameLayout? = null

  private var mToolbarContainer: RelativeLayout? = null

  private var mCurrentWebViewIndex = 0

  private var mProgressBar: AnimatedProgressBar? = null

  // Initialized when onActionModeStarted is triggered.
  private var mActionMode: ActionMode? = null

  override fun onActionModeStarted(mode: ActionMode) {
    if (mActionMode == null) {
      mActionMode = mode
      val menu = mode.menu
      // Inflate custom menu icon.
      menuInflater.inflate(R.menu.menu_webview_action, menu)
      readAloudSelection(menu)
    }
    super.onActionModeStarted(mode)
  }

  override fun onActionModeFinished(mode: ActionMode) {
    mActionMode = null
    super.onActionModeFinished(mode)
  }

  private fun readAloudSelection(menu: Menu?) {
    if (menu != null) {
      menu.findItem(R.id.menu_speak_text).setOnMenuItemClickListener(object : MenuItem.OnMenuItemClickListener {
        override fun onMenuItemClick(item: MenuItem): Boolean {
          Log.i(TAG_KIWIX, "Speaking selection.")
          tts!!.readSelection()
          if (mActionMode != null) {
            mActionMode!!.finish()
          }
          return true
        }
      })
    }
  }

  public override fun onCreate(savedInstanceState: Bundle?) {
    requestWindowFeature(Window.FEATURE_PROGRESS)

    super.onCreate(savedInstanceState)
    handleLocaleCheck()

    setContentView(R.layout.main)
    window.setFeatureInt(Window.FEATURE_PROGRESS, Window.PROGRESS_VISIBILITY_ON)

    val toolbar = findViewById(R.id.toolbar) as Toolbar
    setSupportActionBar(toolbar)
    bookmarks = ArrayList<String>()
    requestClearHistoryAfterLoad = false
    requestWebReloadOnFinished = 0
    requestInitAllMenuItems = false
    mIsBacktotopEnabled = false
    isFullscreenOpened = false
    mBackToTopButton = findViewById(R.id.button_backtotop) as Button
    mPrefState = ArrayList<State>()
    mToolbarContainer = findViewById(R.id.toolbar_layout) as RelativeLayout
    mProgressBar = findViewById(R.id.progress_view) as AnimatedProgressBar
    exitFullscreenButton = findViewById(R.id.FullscreenControlButton) as ImageButton

    val newTabButton = findViewById(R.id.new_tab_button) as RelativeLayout
    newTabButton.setOnClickListener(object : View.OnClickListener {

      override fun onClick(v: View) {
        newTab()
      }
    })
    val nextButton = findViewById(R.id.action_forward) as RelativeLayout
    nextButton.setOnClickListener(object : View.OnClickListener {

      override fun onClick(v: View) {
        if (currentWebView.canGoForward()) {
          currentWebView.goForward()
        }
      }
    })
    val previousButton = findViewById(R.id.action_back) as RelativeLayout
    previousButton.setOnClickListener(object : View.OnClickListener {

      override fun onClick(v: View) {
        if (currentWebView.canGoBack()) {
          currentWebView.goBack()
        }
      }
    })

    mDrawerAdapter = KiwixWebViewAdapter(this, R.layout.tabs_list, mWebViews)
    mDrawerLayout = findViewById(R.id.drawer_layout) as DrawerLayout
    mDrawerList = findViewById(R.id.left_drawer_list) as ListView
    mDrawerList!!.divider = null
    mDrawerList!!.dividerHeight = 0
    mDrawerList!!.adapter = mDrawerAdapter

    mDrawerList!!.onItemClickListener = object : AdapterView.OnItemClickListener {
      override fun onItemClick(parent: AdapterView<*>, view: View, position: Int, id: Long) {
        selectTab(position)
      }
    }
    val drawerToggle = ActionBarDrawerToggle(this, mDrawerLayout, toolbar,
        0, 0)

    mDrawerLayout!!.setDrawerListener(drawerToggle)
    supportActionBar!!.setDisplayHomeAsUpEnabled(true)
    supportActionBar!!.setHomeButtonEnabled(true)
    drawerToggle.syncState()

    mCompatCallback = CompatFindActionModeCallback(this)
    mIsFullscreenOpened = false
    mContentFrame = findViewById(R.id.content_frame) as FrameLayout
    newTab()

    manageExternalLaunchAndRestoringViewState(savedInstanceState)
    setUpWebView()
    setUpExitFullscreenButton()
    setUpTTS()
    loadPrefs()
    updateTitle(ZimContentProvider.zimFileTitle)
  }

  private fun updateTitle(zimFileTitle: String?) {
    if (zimFileTitle == null || zimFileTitle.trim { it <= ' ' }.isEmpty()) {
      supportActionBar!!.title = getString(R.string.app_name)
    } else {
      supportActionBar!!.title = zimFileTitle
    }
  }

  private fun setUpTTS() {
    tts = KiwixTextToSpeech(this, currentWebView,
        object : KiwixTextToSpeech.OnInitSucceedListener {
          override fun onInitSucceed() {
          }
        }, object : KiwixTextToSpeech.OnSpeakingListener {
      override fun onSpeakingStarted() {
        runOnUiThread(object : Runnable {
          override fun run() {
            menu!!.findItem(R.id.menu_read_aloud).setTitle(
                resources.getString(R.string.menu_read_aloud_stop))
          }
        })
      }

      override fun onSpeakingEnded() {
        runOnUiThread(object : Runnable {
          override fun run() {
            menu!!.findItem(R.id.menu_read_aloud).setTitle(
                resources.getString(R.string.menu_read_aloud))
          }
        })
      }
    })
  }

  // Reset the Locale and change the font of all TextViews and its subclasses, if necessary
  private fun handleLocaleCheck() {
    LanguageUtils.handleLocaleChange(this)
    LanguageUtils(this).changeFont(layoutInflater)
  }

  override fun onDestroy() {
    super.onDestroy()
    // TODO create a base Activity class that class this.
    FileUtils.deleteCachedFiles(this)
    tts!!.shutdown()
  }

  private fun newTab(): KiwixWebView {
    val mainPage = Uri.parse(ZimContentProvider.CONTENT_URI.toString() + ZimContentProvider.mainPage!!).toString()
    return newTab(mainPage)
  }

  private fun newTab(url: String): KiwixWebView {
    val webView = KiwixWebView(this@KiwixMobileActivity)
    webView.setWebViewClient(KiwixWebViewClient(this@KiwixMobileActivity, mDrawerAdapter!!))
    webView.setWebChromeClient(KiwixWebChromeClient())
    webView.loadUrl(url)
    webView.loadPrefs()

    mWebViews.add(webView)
    mDrawerAdapter!!.notifyDataSetChanged()
    selectTab(mWebViews.size - 1)
    setUpWebView()
    return webView
  }

  private fun closeTab(index: Int) {

    if (mWebViews.size > 1) {
      if (mCurrentWebViewIndex == index) {
        if (mCurrentWebViewIndex >= 1) {
          selectTab(mCurrentWebViewIndex - 1)
          mWebViews.removeAt(index)
        } else {
          selectTab(mCurrentWebViewIndex + 1)
          mWebViews.removeAt(index)
        }
      } else {
        mWebViews.removeAt(index)
        if (index < mCurrentWebViewIndex) {
          mCurrentWebViewIndex--
        }
        mDrawerList!!.setItemChecked(mCurrentWebViewIndex, true)
      }
    }
    mDrawerAdapter!!.notifyDataSetChanged()
  }

  private fun selectTab(position: Int) {
    mCurrentWebViewIndex = position
    mDrawerList!!.setItemChecked(position, true)
    mContentFrame!!.removeAllViews()
    mContentFrame!!.addView(mWebViews[position])
    mDrawerList!!.setItemChecked(mCurrentWebViewIndex, true)

    if (mDrawerLayout!!.isDrawerOpen(GravityCompat.START)) {
      val handler = Handler()
      handler.postDelayed(object : Runnable {
        override fun run() {
          mDrawerLayout!!.closeDrawers()
        }
      }, 150)
    }
    loadPrefs()
  }

  private val currentWebView: KiwixWebView
    get() = mDrawerAdapter!!.getItem(mCurrentWebViewIndex)

  override fun onOptionsItemSelected(item: MenuItem): Boolean {

    val webView = currentWebView
    when (item.itemId) {

      R.id.menu_home, android.R.id.home -> openMainPage()
      R.id.menu_searchintext -> {
        mCompatCallback!!.setActive()
        mCompatCallback!!.setWebView(webView)
        mCompatCallback!!.showSoftInput()
        startSupportActionMode(mCompatCallback)
      }
      R.id.menu_bookmarks -> viewBookmarks()
      R.id.menu_randomarticle -> openRandomArticle()
      R.id.menu_help -> showHelp()
      R.id.menu_openfile -> selectZimFile()
      R.id.menu_settings -> selectSettings()
      R.id.menu_read_aloud -> readAloud()
      R.id.menu_fullscreen -> if (mIsFullscreenOpened) {
        closeFullScreen()
      } else {
        openFullScreen()
      }
    }

    return super.onOptionsItemSelected(item)
  }

  private fun openFullScreen() {

    mToolbarContainer!!.visibility = View.GONE
    exitFullscreenButton!!.visibility = View.VISIBLE
    menu!!.findItem(R.id.menu_fullscreen).setTitle(resources.getString(R.string.menu_exitfullscreen))
    val fullScreenFlag = WindowManager.LayoutParams.FLAG_FULLSCREEN
    val classicScreenFlag = WindowManager.LayoutParams.FLAG_FORCE_NOT_FULLSCREEN
    window.addFlags(fullScreenFlag)
    window.clearFlags(classicScreenFlag)
    mIsFullscreenOpened = true
  }

  private fun closeFullScreen() {

    mToolbarContainer!!.visibility = View.VISIBLE
    menu!!.findItem(R.id.menu_fullscreen).setTitle(resources.getString(R.string.menu_fullscreen))
    exitFullscreenButton!!.visibility = View.INVISIBLE
    val fullScreenFlag = WindowManager.LayoutParams.FLAG_FULLSCREEN
    val classicScreenFlag = WindowManager.LayoutParams.FLAG_FORCE_NOT_FULLSCREEN
    window.clearFlags(fullScreenFlag)
    window.addFlags(classicScreenFlag)
    mIsFullscreenOpened = false
  }

  //These two methods are used with the BookmarkDialog.
  override fun onListItemSelect(choice: String) {
    openArticleFromBookmark(choice)
  }

  override fun onBookmarkButtonPressed() {
    toggleBookmark()
  }

  fun showWelcome() {
    currentWebView.loadUrl("file:///android_res/raw/welcome.html")
  }

  fun showHelp() {
    if (Constants.IS_CUSTOM_APP) {
      // On custom app, inject a Javascript object which contains some branding data
      // so we just have to maintain a generic help page for them.
      class JsObject {

        val isCustomApp: Boolean
          @JavascriptInterface
          get() = Constants.IS_CUSTOM_APP

        @JavascriptInterface
        fun appId(): String {
          return Constants.CUSTOM_APP_ID
        }

        @JavascriptInterface
        fun hasEmbedZim(): Boolean {
          return Constants.CUSTOM_APP_HAS_EMBEDDED_ZIM
        }

        @JavascriptInterface
        fun zimFileName(): String {
          return Constants.CUSTOM_APP_ZIM_FILE_NAME
        }

        @JavascriptInterface
        fun zimFileSize(): Long {
          return Constants.CUSTOM_APP_ZIM_FILE_SIZE
        }

        @JavascriptInterface
        fun versionName(): String {
          return Constants.CUSTOM_APP_VERSION_NAME
        }

        @JavascriptInterface
        fun versionCode(): Int {
          return Constants.CUSTOM_APP_VERSION_CODE
        }

        @JavascriptInterface
        fun website(): String {
          return Constants.CUSTOM_APP_WEBSITE
        }

        @JavascriptInterface
        fun email(): String {
          return Constants.CUSTOM_APP_EMAIL
        }

        @JavascriptInterface
        fun supportEmail(): String {
          return Constants.CUSTOM_APP_SUPPORT_EMAIL
        }

        @JavascriptInterface
        fun enforcedLang(): String {
          return Constants.CUSTOM_APP_ENFORCED_LANG
        }

      }
      currentWebView.addJavascriptInterface(JsObject(), "branding")
      currentWebView.loadUrl("file:///android_res/raw/help_custom.html")
    } else {
      // Load from resource. Use with base url as else no images can be embedded.
      // Note that this leads inclusion of welcome page in browser history
      // This is not perfect, but good enough. (and would be significant effort to remove file)
      currentWebView.loadUrl("file:///android_res/raw/help.html")
    }
  }

  fun openZimFile(file: File, clearHistory: Boolean): Boolean {
    if (file.exists()) {
      if (ZimContentProvider.setZimFile(file.absolutePath) != null) {

        // Apparently with webView.clearHistory() only history before currently (fully)
        // loaded page is cleared -> request clear, actual clear done after load.
        // Probably not working in all corners (e.g. zim file openend
        // while load in progress, mainpage of new zim file invalid, ...
        // but should be good enough.
        // Actually probably redundant if no zim file openend before in session,
        // but to be on save side don't clear history in such cases.
        if (clearHistory) {
          requestClearHistoryAfterLoad = true
        }
        if (menu != null) {
          initAllMenuItems()
        } else {
          // Menu may not be initialized yet. In this case
          // signal to menu create to show
          requestInitAllMenuItems = true
        }

        openMainPage()
        refreshBookmarks()
        return true
      } else {
        Toast.makeText(this, resources.getString(R.string.error_fileinvalid),
            Toast.LENGTH_LONG).show()
      }

    } else {
      Log.e(TAG_KIWIX, "ZIM file doesn't exist at " + file.absolutePath)
      Toast.makeText(this, resources.getString(R.string.error_filenotfound),
          Toast.LENGTH_LONG).show()
    }
    return false
  }

  private fun initAllMenuItems() {
    try {
      menu!!.findItem(R.id.menu_bookmarks).setVisible(true)
      menu!!.findItem(R.id.menu_fullscreen).setVisible(true)
      menu!!.findItem(R.id.menu_home).setVisible(true)
      menu!!.findItem(R.id.menu_randomarticle).setVisible(true)
      menu!!.findItem(R.id.menu_searchintext).setVisible(true)

      val searchItem = menu!!.findItem(R.id.menu_search)
      searchItem.setVisible(true)
      searchItem.setOnMenuItemClickListener(object : MenuItem.OnMenuItemClickListener {
        override fun onMenuItemClick(item: MenuItem): Boolean {
          val i = Intent(this@KiwixMobileActivity, SearchActivity::class.java)
          startActivityForResult(i, REQUEST_FILE_SEARCH)
          overridePendingTransition(0, 0)
          return true
        }
      })

      if (tts!!.isInitialized) {
        menu!!.findItem(R.id.menu_read_aloud).setVisible(true)
      }
    } catch (e: Exception) {
      e.printStackTrace()
    }

  }

  override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {
    if (event.action == KeyEvent.ACTION_DOWN) {
      when (keyCode) {
        KeyEvent.KEYCODE_BACK -> {
          if (currentWebView.canGoBack()) {
            currentWebView.goBack()
          } else {
            finish()
          }
          if (mCompatCallback!!.mIsActive) {
            mCompatCallback!!.finish()
          }
          return true
        }
        KeyEvent.KEYCODE_MENU -> {
          openOptionsMenu()
          return true
        }
      }
    }
    return false
  }

  fun toggleBookmark() {
    val title = currentWebView.title

    if (title != null && !bookmarks!!.contains(title)) {
      bookmarks!!.add(title)
    } else {
      bookmarks!!.remove(title)
    }
    supportInvalidateOptionsMenu()
  }

  fun viewBookmarks() {
    BookmarkDialog(bookmarks!!.toArray<String>(arrayOfNulls<String>(bookmarks!!.size)),
        bookmarks!!.contains(currentWebView.title)).show(supportFragmentManager, "BookmarkDialog")
  }

  private fun refreshBookmarks() {
    bookmarks!!.clear()
    if (ZimContentProvider.id != null) {
      try {
        val stream = openFileInput(ZimContentProvider.id!! + ".txt")
        if (stream != null) {
          val read = BufferedReader(InputStreamReader(stream))
          var `in` = read.readLine()
          while (`in` != null) {
            bookmarks!!.add(`in`)
            `in` = read.readLine()
          }
          Log.d(TAG_KIWIX, "Switched to bookmarkfile " + ZimContentProvider.id!!)
        }
      } catch (e: FileNotFoundException) {
        Log.e(TAG_KIWIX, "File not found: " + e.toString())
      } catch (e: IOException) {
        Log.e(TAG_KIWIX, "Can not read file: " + e.toString())
      }

    }
  }

  private fun saveBookmarks() {
    try {
      val stream = openFileOutput(ZimContentProvider.id!! + ".txt", Context.MODE_PRIVATE)
      if (stream != null) {
        for (s in bookmarks!!) {
          stream.write((s + "\n").toByteArray())
        }
      }
      Log.d(TAG_KIWIX, "Saved data in bookmarkfile " + ZimContentProvider.id!!)
    } catch (e: FileNotFoundException) {
      Log.e(TAG_KIWIX, "File not found: " + e.toString())
    } catch (e: IOException) {
      Log.e(TAG_KIWIX, "Can not read file: " + e.toString())
    }

  }

  fun openArticleFromBookmark(bookmarkTitle: String): Boolean {
    //        Log.d(TAG_KIWIX, "openArticleFromBookmark: " + articleSearchtextView.getText());
    return openArticle(ZimContentProvider.getPageUrlFromTitle(bookmarkTitle))
  }

  private fun openArticle(articleUrl: String?): Boolean {
    if (articleUrl != null) {
      currentWebView.loadUrl(Uri.parse(ZimContentProvider.CONTENT_URI.toString() + articleUrl).toString())
    }
    return true
  }

  fun openRandomArticle(): Boolean {
    val articleUrl = ZimContentProvider.randomArticleUrl
    Log.d(TAG_KIWIX, "openRandomArticle: " + articleUrl)
    return openArticle(articleUrl)
  }

  fun openMainPage(): Boolean {
    val articleUrl = ZimContentProvider.mainPage
    return openArticle(articleUrl)
  }

  fun readAloud() {
    tts!!.readAloud()
  }

  private fun setUpWebView() {

    currentWebView.settings.javaScriptEnabled = true
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
      WebView.setWebContentsDebuggingEnabled(true)
    }

    // webView.getSettings().setLoadsImagesAutomatically(false);
    // Does not make much sense to cache data from zim files.(Not clear whether
    // this actually has any effect)
    currentWebView.settings.cacheMode = WebSettings.LOAD_NO_CACHE

    // Should basically resemble the behavior when setWebClient not done
    // (i.p. internal urls load in webview, external urls in browser)
    // as currently no custom setWebViewClient required it is commented
    // However, it must notify the bookmark system when a page is finished loading
    // so that it can refresh the menu.

    currentWebView.setOnPageChangedListener(object : KiwixWebView.OnPageChangeListener {

      override fun onPageChanged(page: Int, maxPages: Int) {
        if (mIsBacktotopEnabled) {
          if (currentWebView.scrollY > 200) {
            if (mBackToTopButton!!.visibility == View.INVISIBLE) {
              mBackToTopButton!!.setText(R.string.button_backtotop)
              mBackToTopButton!!.visibility = View.VISIBLE

              mBackToTopButton!!.startAnimation(
                  AnimationUtils.loadAnimation(this@KiwixMobileActivity,
                      android.R.anim.fade_in))

            }
          } else {
            if (mBackToTopButton!!.visibility == View.VISIBLE) {
              mBackToTopButton!!.visibility = View.INVISIBLE

              mBackToTopButton!!.startAnimation(
                  AnimationUtils.loadAnimation(this@KiwixMobileActivity,
                      android.R.anim.fade_out))

            }
          }
        }
      }
    })

    currentWebView.setOnLongClickListener(object : KiwixWebView.OnLongClickListener {

      override fun onLongClick(url: String) {
        var handleEvent = false
        if (url.startsWith(ZimContentProvider.CONTENT_URI.toString())) {
          // This is my web site, so do not override; let my WebView load the page
          handleEvent = true

        } else if (url.startsWith("file://")) {
          // To handle help page (loaded from resources)
          handleEvent = true

        } else if (url.startsWith(ZimContentProvider.UI_URI.toString())) {
          handleEvent = true
        }

        if (handleEvent) {
          val builder = AlertDialog.Builder(this@KiwixMobileActivity)

          builder.setPositiveButton(android.R.string.yes,
              object : DialogInterface.OnClickListener {
                override fun onClick(dialog: DialogInterface, id: Int) {
                  newTab(url)
                }
              })
          builder.setNegativeButton(android.R.string.no, null)
          builder.setMessage(getString(R.string.open_in_new_tab))
          val dialog = builder.create()
          dialog.show()
        }
      }
    })

    mBackToTopButton!!.setOnClickListener(object : View.OnClickListener {
      override fun onClick(view: View) {
        currentWebView.pageUp(true)
      }
    })
  }

  private fun setUpExitFullscreenButton() {

    exitFullscreenButton!!.setOnClickListener(object : View.OnClickListener {
      override fun onClick(v: View) {
        closeFullScreen()
      }
    })
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
  }

  public override fun onSaveInstanceState(outState: Bundle) {
    super.onSaveInstanceState(outState)

    currentWebView.saveState(outState)
    outState.putString(TAG_CURRENT_FILE, ZimContentProvider.getZimFile())
    outState.putString(TAG_CURRENT_ARTICLE, currentWebView.url)
  }

  public override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent) {

    Log.i(TAG_KIWIX, "Intent data: " + data)

    when (requestCode) {
      REQUEST_FILE_SELECT -> if (resultCode == Activity.RESULT_OK) {
        // The URI of the selected file
        val uri = data.data
        var file: File? = null
        if (uri != null) {
          val path = uri.path
          if (path != null) {
            file = File(path)
          }
        }
        if (file == null) {
          return
        }
        // Create a File from this Uri
        openZimFile(file, true)
        Handler(Looper.getMainLooper()).post(object : Runnable {
          override fun run() {
            finish()
            startActivity(Intent(this@KiwixMobileActivity,
                KiwixMobileActivity::class.java))
          }
        })
      }
      REQUEST_FILE_SEARCH -> if (resultCode == Activity.RESULT_OK) {
        val title = data.getStringExtra(TAG_FILE_SEARCHED)
        val articleUrl = ZimContentProvider.getPageUrlFromTitle(title)
        openArticle(articleUrl)
      }
      REQUEST_PREFERENCES -> {
        if (resultCode == KiwixSettingsActivity.RESULT_RESTART) {
          finish()
          startActivity(Intent(this@KiwixMobileActivity, KiwixMobileActivity::class.java))
        }

        loadPrefs()
        for (state in KiwixMobileActivity.mPrefState!!) {
          state.setHasToBeRefreshed(true)
          Log.e(TAG_KIWIX, KiwixMobileActivity.mPrefState!![0].hasToBeRefreshed().toString())
        }
      }
    }

    super.onActivityResult(requestCode, resultCode, data)
  }

  override fun onCreateOptionsMenu(menu: Menu): Boolean {
    val inflater = menuInflater
    inflater.inflate(R.menu.menu_main, menu)
    this.menu = menu

    if (requestInitAllMenuItems) {
      initAllMenuItems()
    }
    return true
  }

  // This method refreshes the menu for the bookmark system.
  override fun onPrepareOptionsMenu(menu: Menu): Boolean {
    super.onPrepareOptionsMenu(menu)

    if (menu.findItem(R.id.menu_bookmarks) != null && currentWebView.url != null && currentWebView.url != "file:///android_res/raw/help.html" && ZimContentProvider.id != null) {
      menu.findItem(R.id.menu_bookmarks).setVisible(true)
      if (bookmarks!!.contains(currentWebView.title)) {
        menu.findItem(R.id.menu_bookmarks).setIcon(R.drawable.action_bookmark_active)
      } else {
        menu.findItem(R.id.menu_bookmarks).setIcon(R.drawable.action_bookmark)
      }
    }
    return true
  }

  fun loadPrefs() {

    val sharedPreferences = PreferenceManager.getDefaultSharedPreferences(this)
    val nightMode = sharedPreferences.getBoolean(PREF_NIGHTMODE, false)
    mIsBacktotopEnabled = sharedPreferences.getBoolean(PREF_BACKTOTOP, false)
    val isZoomEnabled = sharedPreferences.getBoolean(PREF_ZOOM_ENABLED, false)

    if (isZoomEnabled) {
      val zoomScale = sharedPreferences.getFloat(PREF_ZOOM, 100.0f).toInt()
      currentWebView.setInitialScale(zoomScale)
    } else {
      currentWebView.setInitialScale(0)
    }

    if (!mIsBacktotopEnabled) {
      mBackToTopButton!!.visibility = View.INVISIBLE
    }

    // Night mode status
    Log.d(TAG_KIWIX, "mNightMode value ($nightMode)")
    if (nightMode) {
      currentWebView.toggleNightMode()
    } else {
      currentWebView.deactiviateNightMode()
    }
  }

  fun selectZimFile() {
    saveBookmarks()
    val target = Intent(this, ZimFileSelectActivity::class.java)
    target.setAction(Intent.ACTION_GET_CONTENT)
    // The MIME data type filter
    target.setType("//")
    // Only return URIs that can be opened with ContentResolver
    target.addCategory(Intent.CATEGORY_OPENABLE)
    // Force use of our file selection component.
    // (Note may make sense to just define a custom intent instead)

    startActivityForResult(target, REQUEST_FILE_SELECT)
  }

  fun selectSettings() {
    val i = Intent(this, KiwixSettingsActivity::class.java)
    startActivityForResult(i, REQUEST_PREFERENCES)
  }

  private fun manageExternalLaunchAndRestoringViewState(savedInstanceState: Bundle?) {

    if (intent.data != null) {
      val filePath = intent.data.path
      Log.d(TAG_KIWIX, " Kiwix started from a filemanager. Intent filePath: $filePath -> open this zimfile and load menu_main page")
      openZimFile(File(filePath), false)

    } else if (savedInstanceState != null) {
      Log.d(TAG_KIWIX,
          " Kiwix started with a savedInstanceState (That is was closed by OS) -> restore webview state and zimfile (if set)")
      if (savedInstanceState.getString(TAG_CURRENT_FILE) != null) {
        openZimFile(File(savedInstanceState.getString(TAG_CURRENT_FILE)), false)
      }
      if (savedInstanceState.getString(TAG_CURRENT_ARTICLE) != null) {
        currentWebView.loadUrl(savedInstanceState.getString(TAG_CURRENT_ARTICLE))

      }
      currentWebView.restoreState(savedInstanceState)

      // Restore the state of the WebView
      // (Very ugly) Workaround for  #643 Android article blank after rotation and app reload
      // In case of restore state, just reload page multiple times. Probability
      // that after two refreshes page is still blank is low.
      // TODO: implement better fix
      // requestWebReloadOnFinished = 2;
    } else {
      val settings = getSharedPreferences(PREF_KIWIX_MOBILE, 0)
      val zimFile = settings.getString(TAG_CURRENT_FILE, null)
      if (zimFile != null) {
        Log.d(TAG_KIWIX,
            " Kiwix normal start, zimFile loaded last time -> Open last used zimFile " + zimFile)
        openZimFile(File(zimFile), false)
        // Alternative would be to restore webView state. But more effort to implement, and actually
        // fits better normal android behavior if after closing app ("back" button) state is not maintained.
      } else {

        if (Constants.IS_CUSTOM_APP) {
          Log.d(TAG_KIWIX,
              "Kiwix Custom App starting for the first time. Check Companion ZIM.")

          val currentLocaleCode = Locale.getDefault().toString()
          // Custom App recommends to start off a specific language
          if (Constants.CUSTOM_APP_ENFORCED_LANG.length > 0 && Constants.CUSTOM_APP_ENFORCED_LANG != currentLocaleCode) {

            // change the locale machinery
            LanguageUtils.handleLocaleChange(this, Constants.CUSTOM_APP_ENFORCED_LANG)

            // save new locale into preferences for next startup
            val sharedPreferences = PreferenceManager.getDefaultSharedPreferences(this)
            val editor = sharedPreferences.edit()
            editor.putString("pref_language_chooser",
                Constants.CUSTOM_APP_ENFORCED_LANG)
            editor.commit()

            // restart activity for new locale to take effect
            this.setResult(1236)
            this.finish()
            this.startActivity(Intent(this, this.javaClass))
          }

          val filePath: String
          if (Constants.CUSTOM_APP_HAS_EMBEDDED_ZIM) {
            filePath = "/data/data/%s/lib/%s".format(Constants.CUSTOM_APP_ID, Constants.CUSTOM_APP_ZIM_FILE_NAME)
          } else {
            val fileName = FileUtils.getExpansionAPKFileName(true)
            filePath = FileUtils.generateSaveFileName(fileName)
          }

          Log.d(TAG_KIWIX, "Looking for: " + filePath + " -- filesize: " + Constants.CUSTOM_APP_ZIM_FILE_SIZE)
          if (!FileUtils.doesFileExist(filePath, Constants.CUSTOM_APP_ZIM_FILE_SIZE, false)) {
            Log.d(TAG_KIWIX, "... doesn't exist.")

            val zimFileMissingBuilder = AlertDialog.Builder(
                this)
            zimFileMissingBuilder.setTitle(R.string.app_name)
            zimFileMissingBuilder.setMessage(R.string.customapp_missing_content)
            zimFileMissingBuilder.setIcon(R.mipmap.kiwix_icon)
            val activity = this
            zimFileMissingBuilder.setPositiveButton(getString(R.string.go_to_play_store),
                object : DialogInterface.OnClickListener {
                  override fun onClick(dialog: DialogInterface, which: Int) {
                    val market_uri = "market://details?id=" + Constants.CUSTOM_APP_ID
                    val intent = Intent(Intent.ACTION_VIEW)
                    intent.setData(Uri.parse(market_uri))
                    startActivity(intent)
                    activity.finish()
                    System.exit(0)
                  }
                })
            zimFileMissingBuilder.setCancelable(false)
            val zimFileMissingDialog = zimFileMissingBuilder.create()
            zimFileMissingDialog.show()
          } else {
            openZimFile(File(filePath), true)
          }
        } else {
          Log.d(TAG_KIWIX,
              " Kiwix normal start, no zimFile loaded last time  -> display welcome page")
          showWelcome()
        }
      }
    }
  }

  public override fun onPause() {
    super.onPause()
    val settings = getSharedPreferences(PREF_KIWIX_MOBILE, 0)
    val editor = settings.edit()
    editor.putString(TAG_CURRENT_FILE, ZimContentProvider.getZimFile())

    // Commit the edits!
    editor.apply()

    // Save bookmarks
    saveBookmarks()

    Log.d(TAG_KIWIX,
        "onPause Save currentzimfile to preferences:" + ZimContentProvider.getZimFile())
  }

  inner class State private constructor(private var hasToBeRefreshed: Boolean) {

    fun hasToBeRefreshed(): Boolean {
      return hasToBeRefreshed
    }

    fun setHasToBeRefreshed(hasToBeRefreshed: Boolean) {
      this.hasToBeRefreshed = hasToBeRefreshed
    }
  }

  private inner class KiwixWebViewClient(private val mActivity: KiwixMobileActivity, private val mAdapter: ArrayAdapter<KiwixWebView>) : WebViewClient() {

    internal var documentTypes: HashMap<String, String> = object : HashMap<String, String>() {
      init {
        put("epub", "application/epub+zip")
        put("pdf", "application/pdf")
      }
    }

    override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean {

      if (url.startsWith(ZimContentProvider.CONTENT_URI.toString())) {

        val extension = MimeTypeMap.getFileExtensionFromUrl(url)
        if (documentTypes.containsKey(extension)) {
          val intent = Intent(Intent.ACTION_VIEW)
          val uri = Uri.parse(url)
          intent.setDataAndType(uri, documentTypes[extension])
          intent.setFlags(Intent.FLAG_ACTIVITY_NO_HISTORY)
          try {
            startActivity(intent)
          } catch (e: ActivityNotFoundException) {
            Toast.makeText(this@KiwixMobileActivity,
                getString(R.string.no_reader_application_installed),
                Toast.LENGTH_LONG).show()
          }

          return true
        }

        return false

      } else if (url.startsWith("file://")) {
        // To handle help page (loaded from resources)
        return true

      } else if (url.startsWith("javascript:")) {
        // Allow javascript for HTML functions and code execution (EX: night mode)
        return true

      } else if (url.startsWith(ZimContentProvider.UI_URI.toString())) {
        // To handle links which access user interface (i.p. used in help page)
        if (url == ZimContentProvider.UI_URI.toString() + "selectzimfile") {
          selectZimFile()
        } else if (url == ZimContentProvider.UI_URI.toString() + "gotohelp") {
          showHelp()
        } else {
          Log.e(TAG_KIWIX, "UI Url $url not supported.")
        }
        return true
      }

      // Otherwise, the link is not for a page on my site, so launch another Activity that handles URLs
      val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))

      startActivity(intent)

      return true
    }

    override fun onReceivedError(view: WebView, errorCode: Int, description: String,
                                 failingUrl: String) {

      val errorString = resources.getString(R.string.error_articleurlnotfound).format(failingUrl)
      // TODO apparently screws up back/forward
      currentWebView.loadDataWithBaseURL("file://error",
          "<html><body>$errorString</body></html>", "text/html", "utf-8",
          failingUrl)
      val title = resources.getString(R.string.app_name)
      updateTitle(title)
    }

    override fun onPageFinished(view: WebView, url: String) {

      // Workaround for #643
      if (requestWebReloadOnFinished > 0) {
        requestWebReloadOnFinished = requestWebReloadOnFinished - 1
        Log.d(TAG_KIWIX, "Workaround for #643: onPageFinished. Trigger reloading. ($requestWebReloadOnFinished reloads left to do)")
        view.reload()
      }
      mAdapter.notifyDataSetChanged()
    }
  }

  private inner class KiwixWebChromeClient : WebChromeClient() {

    override fun onProgressChanged(view: WebView, progress: Int) {
      mProgressBar!!.progress = progress
      if (progress > 20) {
        supportInvalidateOptionsMenu()
      }

      if (progress == 100) {
        Log.d(TAG_KIWIX, "Loading article finished.")
        if (requestClearHistoryAfterLoad) {
          Log.d(TAG_KIWIX,
              "Loading article finished and requestClearHistoryAfterLoad -> clearHistory")
          currentWebView.clearHistory()
          requestClearHistoryAfterLoad = false
        }

        Log.d(TAG_KIWIX, "Loaded URL: " + currentWebView.url)
      }

    }
  }

  private inner class KiwixWebViewAdapter(private val mContext: Context, private val mLayoutResource: Int, private val mWebViews: List<KiwixWebView>) : ArrayAdapter<KiwixWebView>(mContext, mLayoutResource, mWebViews) {

    override fun getView(position: Int, convertView: View, parent: ViewGroup): View {
      var row: View? = convertView
      val holder: ViewHolder

      if (row == null) {
        val inflater = (mContext as Activity).layoutInflater
        row = inflater.inflate(mLayoutResource, parent, false)

        holder = ViewHolder()
        holder.txtTitle = row!!.findViewById(R.id.textTab) as TextView
        holder.exit = row.findViewById(R.id.deleteButton) as ImageView
        holder.exit!!.tag = position
        row.tag = holder
      } else {
        holder = row.tag as ViewHolder
      }

      holder.exit!!.setOnClickListener(object : View.OnClickListener {

        override fun onClick(view: View) {
          closeTab(position)
        }

      })

      val webView = mWebViews[position]
      holder.txtTitle!!.text = webView.title

      return row
    }

    internal inner class ViewHolder {

      var txtTitle: TextView? = null

      var exit: ImageView? = null
    }
  }

  companion object {


    val TAG_KIWIX = "kiwix"

    val TAG_FILE_SEARCHED = "searchedarticle"

    val REQUEST_FILE_SEARCH = 1236

    private val TAG_CURRENT_FILE = "currentzimfile"

    private val TAG_CURRENT_ARTICLE = "currentarticle"

    private val PREF_NIGHTMODE = "pref_nightmode"

    private val PREF_KIWIX_MOBILE = "kiwix-mobile"

    private val PREF_BACKTOTOP = "pref_backtotop"

    private val PREF_ZOOM = "pref_zoom_slider"

    private val PREF_ZOOM_ENABLED = "pref_zoom_enabled"

    private val REQUEST_FILE_SELECT = 1234

    private val REQUEST_PREFERENCES = 1235

    var mPrefState: ArrayList<State>? = null

    var mIsFullscreenOpened: Boolean = false
  }
}
