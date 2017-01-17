package org.kiwix.kiwixmobile.database;


import com.yahoo.squidb.data.SquidCursor;
import com.yahoo.squidb.sql.Query;

import org.kiwix.kiwixmobile.database.entity.FeedbackDatabaseEntity;

import java.util.ArrayList;

/**
 * Dao class for feedbacks.
 */

public class FeedbacksDao {
  private KiwixDatabase mDb;


  public FeedbacksDao(KiwixDatabase kiwikDatabase) {
    this.mDb = kiwikDatabase;
  }

  /**
   * Delete feedback satisfying:
   * @param Id - the feedback Id
     */
  public void deleteFeedback(String Id) {
    mDb.deleteWhere(FeedbackDatabaseEntity.class, FeedbackDatabaseEntity.ID.eq(Id) );
  }
    
  public void deleteAll(){
    mDb.clear();
  }

}
