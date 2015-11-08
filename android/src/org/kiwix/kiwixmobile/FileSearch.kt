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

import android.os.Environment
import android.util.Log

import java.io.File
import java.io.FilenameFilter
import java.util.ArrayList
import java.util.Collections
import java.util.Comparator
import java.util.Vector

class FileSearch {

  // Scan through the file system and find all the files with .zim and .zimaa extensions
  fun findFiles(): ArrayList<DataModel> {
    val fileList = ArrayList<String>()
    val filter = arrayOfNulls<FilenameFilter>(zimFiles.size())

    // Android doesn't provide an easy way to enumerate additional sdcards
    // present on the device besides the primary one. If enumerating these
    // paths proves insufficient, the alternatives used by some projects
    // is to read and parse contents of /proc/mounts.
    val additionalRoots = arrayOf("/mnt")

    var i = 0
    for (extension in zimFiles) {
      filter[i] = object : FilenameFilter {
        override fun accept(dir: File, name: String): Boolean {
          return name.endsWith("." + extension)
        }
      }
      i++
    }

    val dirNamePrimary = File(
        Environment.getExternalStorageDirectory().absolutePath).toString()
    //        addFilesToFileList(dirNamePrimary, filter, fileList);

    for (dirName in additionalRoots) {
      if (dirNamePrimary == dirName) {
        // We already got this directory from getExternalStorageDirectory().
        continue
      }
      val f = File(dirName)
      if (f.isDirectory) {
        addFilesToFileList(dirName, filter, fileList)
      } else {
        Log.i(TAG_KIWIX, "Skipping missing directory " + dirName)
      }
    }

    return createDataForAdapter(fileList)
  }

  fun sortDataModel(data: ArrayList<DataModel>): ArrayList<DataModel> {

    // Sorting the data in alphabetical order
    Collections.sort(data, object : Comparator<DataModel> {
      override fun compare(a: DataModel, b: DataModel): Int {
        return a.title.compareTo(b.title, ignoreCase = true)
      }
    })

    return data
  }

  // Iterate through the file system
  private fun listFiles(directory: File, filter: Array<FilenameFilter>?, recurse: Int): Collection<File> {
    var recurse = recurse

    val files = Vector<File>()

    val entries = directory.listFiles()

    if (entries != null) {
      for (entry in entries) {
        for (filefilter in filter!!) {
          if (filter == null || filefilter.accept(directory, entry.name)) {
            files.add(entry)
          }
        }
        if ((recurse <= -1) || (recurse > 0 && entry.isDirectory)) {
          recurse--
          files.addAll(listFiles(entry, filter, recurse))
          recurse++
        }
      }
    }
    return files
  }

  private fun listFilesAsArray(directory: File, filter: Array<FilenameFilter>, recurse: Int): Array<File> {
    val files = listFiles(directory, filter, recurse)

    val arr = arrayOfNulls<File>(files.size)
    return files.toArray<File>(arr)
  }

  // Create an ArrayList with our DataModel
  private fun createDataForAdapter(list: List<String>): ArrayList<DataModel> {

    var data = ArrayList<DataModel>()
    for (file in list) {

      data.add(DataModel(getTitleFromFilePath(file), file))
    }

    data = sortDataModel(data)

    return data
  }

  // Fill fileList with files found in the specific directory
  private fun addFilesToFileList(directory: String, filter: Array<FilenameFilter>,
                                 fileList: MutableList<String>) {
    Log.d(TAG_KIWIX, "Searching directory " + directory)
    val foundFiles = listFilesAsArray(File(directory), filter, -1)
    for (f in foundFiles) {
      Log.d(TAG_KIWIX, "Found " + f.absolutePath)
      fileList.add(f.absolutePath)
    }
  }

  // Remove the file path and the extension and return a file name for the given file path
  private fun getTitleFromFilePath(path: String): String {
    return File(path).name.replaceFirst("[.][^.]+$".toRegex(), "")
  }

  companion object {

    val TAG_KIWIX = "kiwix"

    // Array of zim file extensions
    val zimFiles = arrayOf("zim", "zimaa")
  }
}
