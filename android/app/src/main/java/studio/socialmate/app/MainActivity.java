package studio.socialmate.app;

import android.content.Intent;
import android.net.Uri;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private boolean deepLinkConsumed = false;

    @Override
    public void onResume() {
        super.onResume();
        handleAuthDeepLink(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        deepLinkConsumed = false;
        handleAuthDeepLink(intent);
    }

    private void handleAuthDeepLink(Intent intent) {
        if (deepLinkConsumed || intent == null) return;
        Uri data = intent.getData();
        if (data == null || !"studio.socialmate.app".equals(data.getScheme())) return;

        deepLinkConsumed = true;

        // Translate custom scheme back to HTTPS so the WebView auth callback handles it
        String query    = data.getQuery();
        String fragment = data.getFragment();
        StringBuilder url = new StringBuilder("https://socialmate.studio/auth/callback");
        if (query    != null && !query.isEmpty())    url.append("?").append(query);
        if (fragment != null && !fragment.isEmpty()) url.append("#").append(fragment);

        final String callbackUrl = url.toString();
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().post(() ->
                getBridge().getWebView().loadUrl(callbackUrl)
            );
        }
    }
}
