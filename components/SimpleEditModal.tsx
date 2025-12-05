import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useColorScheme } from "nativewind";
import { getColors } from "@/utls/colors";

export type Field = {
  name: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  options?: { label: string; value: string }[]; // if provided, render select
};

type SimpleEditModalProps<T extends Record<string, any>> = {
  visible: boolean;
  title: string;
  fields: Field[];
  initialValues?: Partial<T>;
  onSubmit: (values: T) => void;
  onCancel: () => void;
  submitText?: string;
};

export default function SimpleEditModal<T extends Record<string, any>>({
  visible,
  title,
  fields,
  initialValues,
  onSubmit,
  onCancel,
  submitText = "Lưu",
}: SimpleEditModalProps<T>) {
  const { colorScheme } = useColorScheme();
  const colors = getColors(colorScheme === "dark");
  const [values, setValues] = useState<Record<string, any>>({});

  useEffect(() => {
    setValues(initialValues || {});
  }, [initialValues, visible]);

  const setField = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const SCREEN_HEIGHT = Dimensions.get("window").height;
  const sheetHeight = Math.round(SCREEN_HEIGHT * 0.9); // 90% of screen height

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View
          style={[styles.backdrop, { backgroundColor: "rgba(0,0,0,0.45)" }]}
        />
      </TouchableWithoutFeedback>

      <View style={styles.container} pointerEvents="box-none">
        <View
          style={[
            styles.sheet,
            {
              height: sheetHeight,
              backgroundColor: colors.background.primary,
              borderColor: colors.border.primary,
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text.primary }]}>
            {title}
          </Text>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {fields.map((f) => (
              <View key={f.name} style={styles.fieldRow}>
                <Text style={[styles.label, { color: colors.text.secondary }]}>
                  {f.label}
                </Text>
                {f.options && f.options.length > 0 ? (
                  <View
                    style={[
                      styles.selectBox,
                      {
                        borderColor: colors.border.primary,
                        backgroundColor: colors.surface.secondary,
                      },
                    ]}
                  >
                    <Picker
                      selectedValue={(values[f.name] ?? "") as string}
                      onValueChange={(val) => setField(f.name, val as string)}
                      style={{ color: colors.text.primary }}
                    >
                      <Picker.Item label={`-- Chọn ${f.label} --`} value={""} />
                      {(f.options || [])
                        .sort(
                          (a, b) =>
                            a.label.charCodeAt(0) - b.label.charCodeAt(0),
                        )
                        .map((opt) => (
                          <Picker.Item
                            key={opt.value}
                            label={opt.label}
                            value={opt.value}
                          />
                        ))}
                    </Picker>
                  </View>
                ) : (
                  <TextInput
                    value={(values[f.name] ?? "") as string}
                    onChangeText={(t) => setField(f.name, t)}
                    placeholder={f.placeholder}
                    placeholderTextColor={colors.text.tertiary}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surface.secondary,
                        color: colors.text.primary,
                        borderColor: colors.border.primary,
                      },
                    ]}
                    multiline={!!f.multiline}
                  />
                )}
              </View>
            ))}
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onCancel}
              style={[
                styles.btn,
                {
                  backgroundColor: colors.surface.secondary,
                  borderColor: colors.border.primary,
                },
              ]}
            >
              <Text style={{ color: colors.text.primary }}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onSubmit(values as T)}
              style={[styles.btn, { backgroundColor: colors.primary.main }]}
            >
              <Text style={{ color: colors.text.button }}>{submitText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  fieldRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 12,
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectBox: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
  },
  selectItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
