import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Platform, StyleSheet, View } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

// 상수 분리 (이상적으론 constants/config.ts로)
const WEBVIEW_URL = 'https://moongeul.vercel.app/';
const BRAND_COLOR = '#272725';

// 플랫폼 분기 객체는 렌더와 무관하므로 모듈 스코프에서 한 번만 생성
const androidWebViewProps =
    Platform.OS === 'android'
        ? ({
            allowsPermissionRequests: true,
            mediaCapturePermissionGrantType: 'grantIfSameHostElsePrompt' as const,
        } as const)
        : {};

// LoadingIndicator 컴포넌트 분리 — renderLoading 인라인 방지
function LoadingIndicator() {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator color={BRAND_COLOR} size="large" />
        </View>
    );
}

export default function Home() {
    const webViewRef = useRef<WebView>(null);
    const [canGoBack, setCanGoBack] = useState(false);

    // 트래킹 권한 요청 — IIFE 대신 명명 함수로
    useEffect(() => {
        const requestTrackingPermission = async () => {
            await requestTrackingPermissionsAsync();
        };
        requestTrackingPermission();
    }, []);

    // 안드로이드 백버튼 핸들러
    useEffect(() => {
        const handleBackPress = () => {
            if (canGoBack && webViewRef.current) {
                webViewRef.current.goBack();
                return true; // 이벤트 소비 (앱 종료 방지)
            }
            return false; // 기본 동작 (앱 종료)
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
        return () => subscription.remove();
    }, [canGoBack]);

    // useCallback — onNavigationStateChange 렌더마다 재생성 방지
    const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
        setCanGoBack(navState.canGoBack);
    }, []);

    return (
        // SafeAreaProvider는 _layout.tsx 최상단으로 이동 필요
        // 여기선 SafeAreaView만 사용
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <WebView
                ref={webViewRef}
                source={{ uri: WEBVIEW_URL }}
                style={styles.webview}
                javaScriptEnabled
                domStorageEnabled
                originWhitelist={['https://*']}
                startInLoadingState
                renderLoading={() => <LoadingIndicator />}
                onNavigationStateChange={handleNavigationStateChange}
                {...androidWebViewProps}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    webview: {
        flex: 1,
    },
    // position: absolute + top: '50%' 제거
    // renderLoading은 WebView가 전체 영역을 오버레이로 덮으므로 flex로 중앙 정렬이 정확함
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
