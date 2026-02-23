package com.aicodeverse.app;

import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Allow auth cookies from api.aicodeverse.com while app runs on localhost origin.
    WebView webView = this.bridge != null ? this.bridge.getWebView() : null;
    if (webView != null) {
      CookieManager cookieManager = CookieManager.getInstance();
      cookieManager.setAcceptCookie(true);
      cookieManager.setAcceptThirdPartyCookies(webView, true);
    }
  }
}
