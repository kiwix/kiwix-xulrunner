package org.kiwix.kiwixmobile.settings

import org.kiwix.kiwixmobile.R

import android.content.Context
import android.content.res.TypedArray
import android.preference.DialogPreference
import android.util.AttributeSet
import android.view.View
import android.widget.SeekBar
import android.widget.TextView

class SliderPreference : DialogPreference {

  protected var mSeekBarValue: Int = 0

  protected var mSummaries: Array<CharSequence>? = null

  private var mMessage: TextView? = null

  /**
   * @param context
   * *
   * @param attrs
   */
  constructor(context: Context, attrs: AttributeSet) : super(context, attrs) {
    setup(context, attrs)
  }

  /**
   * @param context
   * *
   * @param attrs
   * *
   * @param defStyle
   */
  constructor(context: Context, attrs: AttributeSet, defStyle: Int) : super(context, attrs, defStyle) {
    setup(context, attrs)
  }

  private fun setup(context: Context, attrs: AttributeSet) {
    dialogLayoutResource = R.layout.slider_dialog
    updateSummaryText(context, attrs)
  }

  fun updateSummaryText(context: Context, attrs: AttributeSet) {
    val a = context.obtainStyledAttributes(attrs, R.styleable.SliderPreference)
    try {
      setSummary(a.getTextArray(R.styleable.SliderPreference_android_summary))
    } catch (e: Exception) {
      // Do nothing
    }

    a.recycle()
  }

  override fun onGetDefaultValue(a: TypedArray, index: Int): Any {
    return a.getFloat(index, 0f)
  }

  override fun onSetInitialValue(restoreValue: Boolean, defaultValue: Any) {
    value = if (restoreValue) getPersistedFloat(mSeekBarValue.toFloat()) else defaultValue as Float
  }

  override fun getSummary(): CharSequence {
    if (mSummaries != null && mSummaries!!.size() > 0) {
      val piece = (SEEKBAR_MAX / mSummaries!!.size()).toDouble()
      var index = (mSeekBarValue / piece).toInt()
      if (index == mSummaries!!.size()) {
        --index
      }
      return mSummaries!![index]
    } else {
      return super.getSummary()
    }
  }

  fun setSummary(summaries: Array<CharSequence>) {
    mSummaries = summaries
  }

  override fun setSummary(summary: CharSequence) {
    super.setSummary(summary)
  }

  override fun setSummary(summaryResId: Int) {
    try {
      //noinspection ResourceType
      setSummary(context.resources.getStringArray(summaryResId))
    } catch (e: Exception) {
      super.setSummary(summaryResId)
    }

  }

  var value: Float
    get() = mSeekBarValue.toFloat()
    set(value) {
      if (shouldPersist()) {
        persistFloat(value)
      }
      if (value != mSeekBarValue) {
        mSeekBarValue = value.toInt()
        notifyChanged()

      }
    }

  override fun onCreateDialogView(): View {
    val view = super.onCreateDialogView()
    mMessage = view.findViewById(R.id.message) as TextView
    mMessage!!.text = mSeekBarValue.toString()
    val seekbar = view.findViewById(R.id.slider_preference_seekbar) as SeekBar
    seekbar.max = SEEKBAR_MAX
    seekbar.progress = mSeekBarValue
    seekbar.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {

      override fun onStopTrackingTouch(seekBar: SeekBar) {
      }

      override fun onStartTrackingTouch(seekBar: SeekBar) {
      }

      override fun onProgressChanged(seekBar: SeekBar, progress: Int, fromUser: Boolean) {
        if (fromUser) {
          mSeekBarValue = progress
          mMessage!!.text = mSeekBarValue.toString()
        }
      }
    })
    return view
  }

  override fun onDialogClosed(positiveResult: Boolean) {
    if (positiveResult && callChangeListener(mSeekBarValue)) {
      value = mSeekBarValue
    }
    super.onDialogClosed(positiveResult)
  }

  companion object {

    protected val SEEKBAR_MAX = 500
  }
}