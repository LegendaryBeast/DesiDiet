import React from 'react';
import { Platform, View, Text } from 'react-native';

let _AnimatedView: any;
let _AnimatedText: any;
let _FadeInUp: any;
let _FadeIn: any;
let _FadeInDown: any;

if (Platform.OS !== 'web') {
  // Native: lazy-load reanimated so it never evaluates on web
  const Reanimated = require('react-native-reanimated');
  _AnimatedView = Reanimated.default.View;
  _AnimatedText = Reanimated.default.Text;
  _FadeInUp = Reanimated.FadeInUp;
  _FadeIn = Reanimated.FadeIn;
  _FadeInDown = Reanimated.FadeInDown;
} else {
  // Web: plain wrappers — strips reanimated-specific props
  const NoopView = (props: any) => {
    const { entering, layout, sharedTransitionTag, ...rest } = props;
    return <View {...rest} />;
  };
  const NoopText = (props: any) => {
    const { entering, layout, sharedTransitionTag, ...rest } = props;
    return <Text {...rest} />;
  };
  _AnimatedView = NoopView;
  _AnimatedText = NoopText;
  const noop = {
    delay: () => noop,
    duration: () => noop,
    springify: () => noop,
  };
  _FadeInUp = noop;
  _FadeIn = noop;
  _FadeInDown = noop;
}

export const Animated = { View: _AnimatedView, Text: _AnimatedText };
export const FadeInUp = _FadeInUp;
export const FadeIn = _FadeIn;
export const FadeInDown = _FadeInDown;
