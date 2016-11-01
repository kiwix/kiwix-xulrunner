package org.kiwix.kiwixmobile.feedback;

import android.os.AsyncTask;

import org.json.JSONObject;
import org.kiwix.kiwixmobile.library.entity.MetaLinkNetworkEntity;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;

/**
 * This class is responsible for posting HTTP feedbacks from KIWIX to mediawiki page
 * The url parameters are
 * action (edit for creating or editing a page)
 * section = new (for creating a new thread into a page)
 * title = "title of the page we want to edit"
 * sectiontitle (title for the feedback)
 * text (feedback text)
 * timestamp
  */

/**
 * Created by zaeemsiddiq on 01/11/16.
 */
public class RemoteConnection extends AsyncTask<Void,Void,JSONObject> {

    static int TIMEOUT = 10000;
    static String domain = "https://en.wikipedia.org";
    static String CHARSET = "UTF-8";
    static String token = "%2B%5C"; // URL equivalent to +\ (wikimedia edit API token for non registered user)
    String action;
    String title;
    String sectiontitle;
    String text;
    JSONObject data;
    JSONObject result;
    RemoteConnectionComplete listener;


    public RemoteConnection(final String action, String title, String sectiontitle, String text, RemoteConnectionComplete listener ) throws UnsupportedEncodingException {
        this.action = action; //edit
        this.title = URLEncoder.encode(title, CHARSET); //User_talk%3AZaeemsiddiq
        this.sectiontitle = URLEncoder.encode(sectiontitle, CHARSET);   //Postman(Title)
        this.text = URLEncoder.encode(text, CHARSET);
        this.listener = listener;
    }

    @Override
    protected JSONObject doInBackground(Void... params) {
        String urlString = ""+domain+"/w/api.php?action="+action+"&format=json&title="+title+"&section=new&sectiontitle="+sectiontitle+"&text="+text+"&basetimestamp=2006-08-24T12%3A34%3A54.000Z"; // URL to call
        String responseString = "";

        InputStream in = null;
        try {

            URL url = new URL(urlString);

            HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();
            urlConnection.setRequestMethod("POST");
            urlConnection.setDoInput(true);
            urlConnection.setInstanceFollowRedirects(false);
            urlConnection.connect();

            OutputStreamWriter writer = new OutputStreamWriter(urlConnection.getOutputStream(), "UTF-8");
            writer.write("token="+token+"");
            writer.close();

            in = new BufferedInputStream(urlConnection.getInputStream());
            responseString = convertStreamToString(in);
            return new JSONObject(responseString);

        } catch (Exception e) {

            System.out.println(e.getMessage());

        }
        return null;
    }

    public static String convertStreamToString(InputStream is) {
        BufferedReader reader = new BufferedReader(new InputStreamReader(is));
        StringBuilder sb = new StringBuilder();

        String line = null;
        try {
            while ((line = reader.readLine()) != null) {
                sb.append(line + "\n");
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                is.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return sb.toString();
    }

    @Override
    protected void onPostExecute(JSONObject result){
        this.listener.remoteConnectionComplete( result );
    }
}
