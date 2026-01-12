import { WebView } from 'react-native-webview';

export default function App() {
  return (
    <WebView
      source={{ uri: 'https://chainlink-pos.com' }}
      originWhitelist={['*']}
      javaScriptEnabled
      domStorageEnabled
    />
  );
}
