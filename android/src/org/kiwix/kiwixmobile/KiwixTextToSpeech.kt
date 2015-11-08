package org.kiwix.kiwixmobile

import android.annotation.TargetApi
import android.content.Context
import android.os.Build
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.widget.Toast
import java.util.*

class KiwixTextToSpeech
/**
 * Constructor.

 * @param context               the context to create TextToSpeech with
 * *
 * @param webView               [android.webkit.WebView] to take contents from
 * *
 * @param onInitSucceedListener listener that receives event when initialization of TTS is done
 * *                              (and does not receive if it failed)
 * *
 * @param onSpeakingListener    listener that receives an event when speaking just started or
 * *                              ended
 */
(private val context: Context, private val webView: WebView,
 onInitSucceedListener: KiwixTextToSpeech.OnInitSucceedListener,
 private val onSpeakingListener: KiwixTextToSpeech.OnSpeakingListener) {

  private var tts: TextToSpeech? = null

  /**
   * Returns whether the TTS is initialized.

   * @return `true` if TTS is initialized; `false` otherwise
   */
  var isInitialized = false
    private set

  init {
    Log.d(TAG_KIWIX, "Initializing TextToSpeech")
    this.webView.addJavascriptInterface(TTSJavaScriptInterface(), "tts")

    initTTS(onInitSucceedListener)
  }

  @TargetApi(Build.VERSION_CODES.ICE_CREAM_SANDWICH_MR1)
  private fun initTTS(onInitSucceedListener: OnInitSucceedListener) {
    tts = TextToSpeech(context, object : TextToSpeech.OnInitListener {
      override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
          Log.d(TAG_KIWIX, "TextToSpeech was initialized successfully.")
          isInitialized = true
          onInitSucceedListener.onInitSucceed()
        } else {
          Log.e(TAG_KIWIX, "Initilization of TextToSpeech Failed!")
        }
      }
    })

    tts!!.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
      override fun onStart(utteranceId: String) {
      }

      override fun onDone(utteranceId: String) {
        Log.e(TAG_KIWIX, "TextToSpeech: " + utteranceId)
        onSpeakingListener.onSpeakingEnded()
      }

      override fun onError(utteranceId: String) {
        Log.e(TAG_KIWIX, "TextToSpeech: " + utteranceId)
        onSpeakingListener.onSpeakingEnded()
      }
    })
  }

  /**
   * Reads the currently selected text in the WebView.
   */
  fun readSelection() {
    webView.loadUrl("javascript:tts.speakAloud(window.getSelection().toString());", null)
  }

  /**
   * Starts speaking the WebView content aloud (or stops it if TTS is speaking now).
   */
  fun readAloud() {
    if (tts!!.isSpeaking) {
      if (tts!!.stop() == TextToSpeech.SUCCESS) {
        onSpeakingListener.onSpeakingEnded()
      }
    } else {
      val locale = LanguageUtils.ISO3ToLocale(ZimContentProvider.language!!)
      val result = tts!!.isLanguageAvailable(locale)
      if (locale == null ||
          result == TextToSpeech.LANG_MISSING_DATA ||
          result == TextToSpeech.LANG_NOT_SUPPORTED) {
        Log.d(TAG_KIWIX, "TextToSpeech: language not supported: " + ZimContentProvider.language + " (" + locale.language + ")")
        Toast.makeText(context,
            context.resources.getString(R.string.tts_lang_not_supported),
            Toast.LENGTH_LONG).show()
      } else {
        tts!!.setLanguage(locale)

        // We use JavaScript to get the content of the page conveniently, earlier making some
        // changes in the page
        webView.loadUrl("javascript:" + "body = document.getElementsByTagName('body')[0].cloneNode(true);" + // Remove some elements that are shouldn't be read (table of contents,
            // references numbers, thumbnail captions, duplicated title, etc.)
            "toRemove = body.querySelectorAll('sup.reference, #toc, .thumbcaption, " + "    title, .navbox');" + "Array.prototype.forEach.call(toRemove, function(elem) {" + "    elem.parentElement.removeChild(elem);" + "});" + "tts.speakAloud(body.innerText);")
      }
    }
  }

  /**
   * Releases the resources used by the engine.

   * @see android.speech.tts.TextToSpeech.shutdown
   */
  fun shutdown() {
    tts!!.shutdown()
  }

  /**
   * The listener which is notified when initialization of the TextToSpeech engine is successfully
   * done.
   */
  interface OnInitSucceedListener {

    fun onInitSucceed()
  }

  /**
   * The listener that is notified when speaking starts or stops (regardless of whether it was a
   * result of error, user, or because whole text was read).

   * Note that the methods of this interface may not be called from the UI thread.
   */
  interface OnSpeakingListener {

    fun onSpeakingStarted()

    fun onSpeakingEnded()
  }

  private inner class TTSJavaScriptInterface {

    @JavascriptInterface
    @SuppressWarnings("unused")
    fun speakAloud(content: String) {
      val lines = content.split("\n".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()
      for (i in 0..lines.size() - 1 - 1) {
        val line = lines[i]
        tts!!.speak(line, TextToSpeech.QUEUE_ADD, null)
      }

      val params = HashMap<String, String>()
      // The utterance ID isn't actually used anywhere, the param is passed only to force
      // the utterance listener to be notified
      params.put("utteranceId", "kiwixLastMessage")
      tts!!.speak(lines[lines.size() - 1], TextToSpeech.QUEUE_ADD, params)

      if (lines.size() > 0) {
        onSpeakingListener.onSpeakingStarted()
      }
    }
  }

  companion object {

    val TAG_KIWIX = "kiwix"
  }
}
