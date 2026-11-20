package com.eldoria.cronicas;
import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import java.io.InputStream;
import java.io.IOException;
import android.view.ViewGroup;

public class MainActivity extends Activity {
  private WebView game;
  @Override public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    getWindow().getDecorView().setSystemUiVisibility(
        View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_FULLSCREEN);
    game = new WebView(this);
    game.setBackgroundColor(0xff0d1018);
    WebSettings settings = game.getSettings();
    settings.setJavaScriptEnabled(true);
    settings.setCacheMode(WebSettings.LOAD_DEFAULT);
    settings.setDefaultTextEncodingName("UTF-8");
    game.setLayerType(View.LAYER_TYPE_HARDWARE, null);
    settings.setDomStorageEnabled(true);
    settings.setAllowFileAccess(false);
    settings.setAllowContentAccess(false);
    settings.setMediaPlaybackRequiresUserGesture(false);
    game.setWebChromeClient(new WebChromeClient());
    game.setWebViewClient(new WebViewClient() {
      @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        return !isGameOrigin(request.getUrl());
      }
      @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        android.net.Uri uri = request.getUrl();
        if (!isGameOrigin(uri)) return null;
        String path = uri.getPath();
        if (path == null || path.contains("..")) return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", java.util.Collections.emptyMap(), new java.io.ByteArrayInputStream(new byte[0]));
        if (path.startsWith("/")) path = path.substring(1);
        if (path.isEmpty()) path = "index.html";
        String mime = path.endsWith(".html") ? "text/html" : path.endsWith(".js") ? "text/javascript" : path.endsWith(".css") ? "text/css" : path.endsWith(".svg") ? "image/svg+xml" : path.endsWith(".png") ? "image/png" : path.endsWith(".jpg") || path.endsWith(".jpeg") ? "image/jpeg" : path.endsWith(".webp") ? "image/webp" : path.endsWith(".json") ? "application/json" : "application/octet-stream";
        try { InputStream stream = getAssets().open(path); return new WebResourceResponse(mime, null, stream); }
        catch (IOException ex) { return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", java.util.Collections.emptyMap(), new java.io.ByteArrayInputStream(new byte[0])); }
      }
    });
    setContentView(game);
    game.loadUrl("https://appassets.androidplatform.net/index.html");
  }
  private static boolean isGameOrigin(android.net.Uri uri) {
    return "https".equals(uri.getScheme()) && "appassets.androidplatform.net".equals(uri.getHost())
        && uri.getPort() == -1;
  }

  private void sendActivityState(boolean paused) {
    game.evaluateJavascript(
        "window.dispatchEvent(new CustomEvent('eldoria-activity',{detail:" + paused + "}))", null);
  }

  @Override protected void onPause() {
    if (game != null) {
      sendActivityState(true);
      game.onPause();
    }
    super.onPause();
  }

  @Override protected void onResume() {
    super.onResume();
    if (game != null) {
      game.onResume();
      sendActivityState(false);
    }
  }

  @Override public void onBackPressed() {
    if (game != null && game.canGoBack()) game.goBack();
    else super.onBackPressed();
  }

  @Override protected void onDestroy() {
    if (game != null) {
      if (game.getParent() instanceof ViewGroup) ((ViewGroup) game.getParent()).removeView(game);
      game.destroy();
      game = null;
    }
    super.onDestroy();
  }
}
