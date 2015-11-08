package org.kiwix.kiwixmobile

import android.content.Context
import android.widget.ArrayAdapter
import android.widget.Filter
import android.widget.Filterable
import java.util.*


class AutoCompleteAdapter(context: Context) : ArrayAdapter<String>(context, android.R.layout.simple_list_item_1), Filterable {

  private var mData: List<String>? = null

  private val mFilter: KiwixFilter

  init {
    mData = ArrayList<String>()
    mFilter = KiwixFilter()
  }

  override fun getCount(): Int {
    return mData!!.size
  }

  override fun getItem(index: Int): String {
    return mData!![index]
  }

  override fun getFilter(): Filter {
    return mFilter
  }

  internal inner class KiwixFilter : Filter() {

    override fun performFiltering(constraint: CharSequence?): Filter.FilterResults {
      val filterResults = Filter.FilterResults()
      val data = ArrayList<String>()
      if (constraint != null) {
        // A class that queries a web API, parses the data and returns an ArrayList<Style>
        try {
          val prefix = constraint.toString()

          ZimContentProvider.searchSuggestions(prefix, 200)
          var suggestion = ZimContentProvider.nextSuggestion

          data.clear()
          while (suggestion != null) {
            data.add(suggestion)
            suggestion = ZimContentProvider.nextSuggestion
          }
        } catch (e: Exception) {
        }

        // Now assign the values and count to the FilterResults object
        filterResults.values = data
        filterResults.count = data.size
      }
      return filterResults
    }

    override fun publishResults(contraint: CharSequence, results: Filter.FilterResults) {
      mData = results.values as ArrayList<String>
      if (results.count > 0) {
        notifyDataSetChanged()
      } else {
        notifyDataSetInvalidated()
      }
    }
  }
}
