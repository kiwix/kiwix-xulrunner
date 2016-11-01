package org.kiwix.kiwixmobile.utils;

import android.content.Context;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Handler;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.ArrayAdapter;
import android.widget.HeaderViewListAdapter;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import java.io.UnsupportedEncodingException;
import java.util.List;

import org.json.JSONObject;
import org.kiwix.kiwixmobile.KiwixMobileActivity;
import org.kiwix.kiwixmobile.feedback.RemoteConnection;
import org.kiwix.kiwixmobile.feedback.RemoteConnectionComplete;

public class HTMLUtils implements RemoteConnectionComplete{

  private List<KiwixMobileActivity.SectionProperties> sectionProperties;
  private List<TextView> textViews;
  private ArrayAdapter arrayAdapter;
  private KiwixMobileActivity context;
  private Handler mHandler;

  public HTMLUtils(List<KiwixMobileActivity.SectionProperties> sectionProperties, List<TextView> textViews, ListView listView, KiwixMobileActivity context, Handler handler) {
    this.sectionProperties = sectionProperties;
    this.textViews = textViews;
    this.arrayAdapter = ((ArrayAdapter)((HeaderViewListAdapter)listView.getAdapter()).getWrappedAdapter());
    this.context = context;
    this.mHandler = handler;
  }

  public void initInterface(WebView webView) {
    webView.addJavascriptInterface(new HTMLinterface(), "HTMLUtils");
  }

  @Override
  public void remoteConnectionComplete(JSONObject data) {
    System.out.println("testing success");
  }


  class HTMLinterface {
    int i = 0;

    @JavascriptInterface
    @SuppressWarnings("unused")
    public void parse(final String sectionTitle, final String element, final String id) {
      mHandler.post(new Runnable() {
        @Override
        public void run() {
          if (element.equals("H1")) {
              KiwixMobileActivity.headerView.setText(sectionTitle);
          } else {
            textViews.add(i, new TextView(context));
            sectionProperties.add(i, new KiwixMobileActivity.SectionProperties());
            KiwixMobileActivity.SectionProperties section = sectionProperties.get(i);
            section.sectionTitle = sectionTitle;
            section.sectionId = id;
            switch (element) {
              case "H2":
                section.leftPadding = (int) (16 * context.getResources().getDisplayMetrics().density);
                section.typeface = Typeface.DEFAULT;
                section.color = Color.BLACK;
                break;
              case "H3":
                section.leftPadding = (int) (36 * context.getResources().getDisplayMetrics().density);
                section.typeface = Typeface.DEFAULT;
                section.color = Color.GRAY;
                break;
              default:
                section.leftPadding = (int) (16 * context.getResources().getDisplayMetrics().density);
                section.typeface = Typeface.DEFAULT;
                section.color = Color.BLACK;
                break;
            }
            i++;
          }
        }
      });
    }

    @JavascriptInterface
    @SuppressWarnings("unused")
    public void start() {
      mHandler.post(new Runnable() {
        @Override
        public void run() {
          i = 0;
          textViews.clear();
          sectionProperties.clear();
          arrayAdapter.clear();
          arrayAdapter.notifyDataSetChanged();
        }
      });
    }

    @JavascriptInterface
    @SuppressWarnings("unused")
    public void stop() {
      mHandler.post(new Runnable() {
        @Override
        public void run() {
          arrayAdapter.notifyDataSetChanged();
        }
      });
    }

    @JavascriptInterface
    @SuppressWarnings("unused")
    public void postFeedbackFormData(final String data) {
      mHandler.post(new Runnable() {
        @Override
        public void run() {
          if(NetworkUtils.isNetworkAvailable(context)) {
            if(data.length() != 0) {
              try {
                Toast.makeText(context, ""+data, Toast.LENGTH_SHORT).show();
                new RemoteConnection("edit", "User_talk:Zaeemsiddiq", "From Kiwix", data, HTMLUtils.this).execute();
              } catch (UnsupportedEncodingException e) {
                e.printStackTrace();
              }
            } else {
              Toast.makeText(context, "Please enter your feedback", Toast.LENGTH_SHORT).show();
            }
          } else {  // network is offline, feedback needs to be saved locally. On start of application, check if there are any feedbacks with id = 0, if yes then post all
            Toast.makeText(context, "You must connect to internet in order to post feedbacks", Toast.LENGTH_SHORT).show();
          }

        }
      });
    }
  }
}


