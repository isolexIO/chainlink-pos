import React from 'react';
import { WebView } from 'react-native-webview';
import { SafeAreaView, StyleSheet, Platform, StatusBar, View, ActivityIndicator } from 'react-native';
import Constants from 'expo-constants';

/**
 * DEBUGGING CONFIGURATION
 * -----------------------
 * In Development: Loads your local Vite server (usually http://[your-ip]:5173)
 * In Production: Loads the live website
 */
const PRODUCTION_URL = 'https://chainlink-pos.com';

const getAppUrl = () => {
  if (!__DEV__) return PRODUCTION_URL;

  // Constants.expoConfig.hostUri gives the IP of your computer (e.g., 192.168.1.5:8081)
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (!debuggerHost) return PRODUCTION_URL;

  const ip = debuggerHost.split(':')[0];
  // We point to 5173 which is the default Vite port
  return `http://${ip}:5173`;
};

const APP_URL = getAppUrl();

export default function App() {
  console.log('App starting. Target URL:', APP_URL);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.webviewWrapper}>
        <WebView
          source={{ uri: APP_URL }}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          )}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView HTTP error: ', nativeEvent.statusCode);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // Ensures the webview doesn't overlap the Android status bar
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  webviewWrapper: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  }
});
