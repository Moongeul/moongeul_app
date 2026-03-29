import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    BackHandler
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

export default function Home() {
    const webViewRef = useRef<WebView>(null);
    const [canGoBack, setCanGoBack] = useState(false);

    useEffect(() => {
        (async () => {
            await requestTrackingPermissionsAsync();
        })();
    }, []);

    useEffect(() => {
        const backAction = () => {
            if (canGoBack && webViewRef.current) {
                webViewRef.current.goBack();
                return true;
            }
            return false;
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [canGoBack]);

    // 안드로이드 전용 속성들을 객체로 분리하여 타입 에러 방지
    const androidProps = Platform.OS === 'android' ? {
        allowsPermissionRequests: true,
        mediaCapturePermissionGrantType: 'grantIfSameHostElsePrompt' as const,
    } : {};

    return (
        <SafeAreaProvider>
            <StatusBar style="dark" />
            <SafeAreaView style={styles.container}>
                <WebView
                    ref={webViewRef}
                    source={{ uri: 'https://moongeul.vercel.app/' }}
                    style={styles.webview}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    originWhitelist={['https://*']}
                    startInLoadingState={true}

                    // 안드로이드 전용 속성 주입 (스프레드 연산자 사용)
                    {...androidProps}

                    onNavigationStateChange={(navState: WebViewNavigation) => {
                        setCanGoBack(navState.canGoBack);
                    }}
                    renderLoading={() => (
                        <ActivityIndicator color="#326BFF" size="large" style={styles.loading} />
                    )}
                />
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    webview: { flex: 1 },
    loading: { position: 'absolute', top: '50%', left: 0, right: 0 },
});
