package org.kiwix.kiwixmobile

import android.animation.ObjectAnimator
import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Rect
import android.os.Bundle
import android.os.Parcelable
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.animation.Animation
import android.view.animation.DecelerateInterpolator
import android.view.animation.Transformation
import android.widget.LinearLayout

class AnimatedProgressBar : LinearLayout {

  private val mPaint = Paint()

  private val mRect = Rect()

  /**
   * Returns the current progress value between 0 and 100

   * @return progress of the view
   */
  /**
   * sets the progress as an integer value between 0 and 100. Values above or below that interval
   * will be adjusted to their nearest value within the interval, i.e. setting a value of 150 will
   * have the effect of setting the progress to 100. You cannot trick us.

   * @param progress an integer between 0 and 100
   */
  // progress cannot be greater than 100
  // progress cannot be less than 0
  // Set the drawing bounds for the ProgressBar
  // if the we only animate the view in one direction
  // then reset the view width if it is less than the
  // previous progress
  // we don't need to go any farther if the progress is unchanged
  // save the progress
  // calculate amount the width has to change
  // animate the width change
  var progress = 0
    set(progress) {
      var progress = progress

      if (progress > 100) {
        progress = 100
      } else if (progress < 0) {
        progress = 0
      }

      if (this.alpha < 1.0f) {
        fadeIn()
      }

      val mWidth = this.measuredWidth
      mRect.left = 0
      mRect.top = 0
      mRect.bottom = this.bottom - this.top
      if (progress < this.progress && !mBidirectionalAnimate) {
        mDrawWidth = 0
      } else if (progress == this.progress) {
        if (progress == 100) {
          fadeOut()
        }
        return
      }

      this.progress = progress

      val deltaWidth = (mWidth * this.progress / 100) - mDrawWidth

      animateView(mDrawWidth, mWidth, deltaWidth)
    }

  private var mBidirectionalAnimate = true

  private var mDrawWidth = 0

  private var mProgressColor: Int = 0

  constructor(context: Context, attrs: AttributeSet) : super(context, attrs) {
    init(context, attrs)
  }

  constructor(context: Context, attrs: AttributeSet, defStyleAttr: Int) : super(context, attrs, defStyleAttr) {
    init(context, attrs)
  }

  /**
   * Initialize the AnimatedProgressBar

   * @param context is the context passed by the constructor
   * *
   * @param attrs   is the attribute set passed by the constructor
   */
  private fun init(context: Context, attrs: AttributeSet) {
    val array = context.theme.obtainStyledAttributes(attrs, R.styleable.AnimatedProgressBar, 0, 0)
    val backgroundColor: Int
    try {
      // Retrieve the style of the progress bar that the user hopefully set
      val DEFAULT_BACKGROUND_COLOR = 4342338
      val DEFAULT_PROGRESS_COLOR = 2201331

      backgroundColor = array.getColor(R.styleable.AnimatedProgressBar_backgroundColor,
          DEFAULT_BACKGROUND_COLOR)
      mProgressColor = array.getColor(R.styleable.AnimatedProgressBar_progressColor,
          DEFAULT_PROGRESS_COLOR)
      mBidirectionalAnimate = array.getBoolean(R.styleable.AnimatedProgressBar_bidirectionalAnimate, false)
    } finally {
      array.recycle()
    }

    val inflater = context.getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
    inflater.inflate(R.layout.progress_bar, this, true)

    this.setBackgroundColor(
        backgroundColor)           // set the background color for this view

  }

  override fun onDraw(canvas: Canvas) {
    mPaint.color = mProgressColor
    mPaint.strokeWidth = 10f
    mRect.right = mRect.left + mDrawWidth
    canvas.drawRect(mRect, mPaint)
  }

  /**
   * private method used to create and run the animation used to change the progress

   * @param initialWidth is the width at which the progress starts at
   * *
   * @param maxWidth     is the maximum width (total width of the view)
   * *
   * @param deltaWidth   is the amount by which the width of the progress view will change
   */
  private fun animateView(initialWidth: Int, maxWidth: Int, deltaWidth: Int) {
    val fill = object : Animation() {

      override fun applyTransformation(interpolatedTime: Float, t: Transformation) {
        val width = initialWidth + (deltaWidth * interpolatedTime).toInt()
        if (width <= maxWidth) {
          mDrawWidth = width
          invalidate()
        }
        if ((1.0f - interpolatedTime) < 0.0005) {
          if (progress >= 100) {
            fadeOut()
          }
        }
      }

      override fun willChangeBounds(): Boolean {
        return false
      }
    }

    fill.duration = 500
    fill.interpolator = DecelerateInterpolator()
    this.startAnimation(fill)
  }

  /**
   * fades in the progress bar
   */
  private fun fadeIn() {
    val fadeIn = ObjectAnimator.ofFloat(this, "alpha", 1.0f)
    fadeIn.setDuration(200)
    fadeIn.interpolator = DecelerateInterpolator()
    fadeIn.start()
  }

  /**
   * fades out the progress bar
   */
  private fun fadeOut() {
    val fadeOut = ObjectAnimator.ofFloat(this, "alpha", 0.0f)
    fadeOut.setDuration(200)
    fadeOut.interpolator = DecelerateInterpolator()
    fadeOut.start()
  }

  override fun onRestoreInstanceState(state: Parcelable) {
    var state = state

    if (state is Bundle) {
      this.progress = state.getInt("progressState")
      state = state.getParcelable<Parcelable>("instanceState")


    }

    super.onRestoreInstanceState(state)
  }

  override fun onSaveInstanceState(): Parcelable {

    val bundle = Bundle()
    bundle.putParcelable("instanceState", super.onSaveInstanceState())
    bundle.putInt("progressState", progress)
    return bundle
  }

}
