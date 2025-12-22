import React, { useEffect, useMemo, useRef } from "react";
import { Animated, View, useWindowDimensions } from "react-native";

type FlowPagerProps = {
  index: number;
  children: React.ReactNode[] | React.ReactNode;
  animationMs?: number;
};

export default function FlowPager(props: FlowPagerProps) {
  const animationMs = props.animationMs ?? 300;
  const { width } = useWindowDimensions();
  const pages = useMemo(
    () => React.Children.toArray(props.children),
    [props.children],
  );
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: -props.index * width,
      duration: animationMs,
      useNativeDriver: true,
    }).start();
  }, [props.index, width, animationMs, translateX]);

  return (
    <View style={{ flex: 1, overflow: "hidden" }}>
      <Animated.View
        style={{
          flex: 1,
          height: "100%",
          flexDirection: "row",
          width: width * pages.length,
          transform: [{ translateX }],
        }}
      >
        {pages.map((child, idx) => (
          <View key={idx} style={{ width, flex: 1, height: "100%" }}>
            {React.isValidElement(child)
              ? React.cloneElement(child as React.ReactElement<any>, {
                  isActive: idx === props.index,
                })
              : child}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}
