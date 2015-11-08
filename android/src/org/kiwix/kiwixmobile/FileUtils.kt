package org.kiwix.kiwixmobile

import org.kiwix.kiwixmobile.settings.Constants

import java.io.File

import android.content.Context
import android.os.Environment

object FileUtils {

  fun getFileCacheDir(context: Context): File {
    val external = Environment.MEDIA_MOUNTED == Environment.getExternalStorageState()

    if (external) {
      return context.externalCacheDir

    } else {
      return context.cacheDir
    }
  }

  @Synchronized fun deleteCachedFiles(context: Context) {
    try {
      for (file in getFileCacheDir(context).listFiles()) {
        file.delete()
      }
    } catch (e: Exception) {
      e.printStackTrace()
    }

  }

  /**
   * Returns the file name (without full path) for an Expansion APK file from the given context.

   * @param mainFile true for menu_main file, false for patch file
   * *
   * @return String the file name of the expansion file
   */
  fun getExpansionAPKFileName(mainFile: Boolean): String {
    return (if (mainFile) "main." else "patch.") + Constants.CUSTOM_APP_VERSION_CODE + "." + Constants.CUSTOM_APP_ID + ".obb"
  }

  /**
   * Returns the filename (where the file should be saved) from info about a download
   */
  fun generateSaveFileName(fileName: String): String {
    return saveFilePath + File.separator + fileName
  }

  val saveFilePath: String
    get() {
      val obbFolder = File.separator + "Android" + File.separator + "obb" + File.separator
      val root = Environment.getExternalStorageDirectory()
      return root.toString() + obbFolder + Constants.CUSTOM_APP_ID
    }

  /**
   * Helper function to ascertain the existence of a file and return true/false appropriately

   * @param fileName             the name (sans path) of the file to query
   * *
   * @param fileSize             the size that the file must match
   * *
   * @param deleteFileOnMismatch if the file sizes do not match, delete the file
   * *
   * @return true if it does exist, false otherwise
   */
  fun doesFileExist(fileName: String, fileSize: Long,
                    deleteFileOnMismatch: Boolean): Boolean {
    // the file may have been delivered by Market --- let's make sure
    // it's the size we expect
    val fileForNewFile = File(fileName)
    if (fileForNewFile.exists()) {
      if (fileForNewFile.length() == fileSize) {
        return true
      }
      if (deleteFileOnMismatch) {
        // delete the file --- we won't be able to resume
        // because we cannot confirm the integrity of the file
        fileForNewFile.delete()
      }
    }
    return false
  }
}
