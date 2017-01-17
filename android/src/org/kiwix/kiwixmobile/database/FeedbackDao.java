package org.kiwix.kiwixmobile.database;


import com.yahoo.squidb.data.SquidCursor;
import com.yahoo.squidb.sql.Query;

import org.kiwix.kiwixmobile.database.entity.Bookmarks;
import org.kiwix.kiwixmobile.database.entity.Feedback;

import java.util.ArrayList;

/**
 * Dao class for feedbacks.
 */

public class FeedbackDao {
  private KiwixDatabase mDb;


  public FeedbackDao(KiwixDatabase kiwikDatabase) {
    this.mDb = kiwikDatabase;
  }

  /**
   * Delete feedback satisfying:
   * @param Id - the feedback Id
     */
  public void deleteFeedback(String Id) {
    mDb.deleteWhere(Feedback.class, Feedback.FEEDBACK_ID.eq(Id) );
  }
  public ArrayList<Feedback> getOfflineFeedbacks() {
      SquidCursor<Feedback> feedbackCursor = mDb.query(
              Feedback.class,
              Query.select() );
      ArrayList<Feedback> result = new ArrayList<>();
      try {
          while (feedbackCursor.moveToNext()) {
              Feedback feedback = new Feedback();
              //System.out.println(feedback.getFeedbackId());
              feedback.readPropertiesFromCursor(feedbackCursor);
              result.add(feedback);
          }
      } finally {
          feedbackCursor.close();
      }
      return result;
  }

  public void saveFeedback(Feedback feedback) {
      mDb.persist(feedback);
  }

  public void deleteAll(){
    mDb.clear();
  }

}
