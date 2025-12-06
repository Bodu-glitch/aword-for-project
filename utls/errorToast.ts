import Toast from "react-native-toast-message";

// Show an error toast and return an RTK Query friendly error object
export default function showErrorToast(err: any) {
  try {
    const msg =
      err?.message ?? (typeof err === "string" ? err : JSON.stringify(err));
    Toast.show({
      type: "error",
      text1: "Lỗi",
      text2: msg,
      visibilityTime: 5000,
    });
  } catch (errCatch) {
    // swallow toast errors
    console.debug("Toast display failed", errCatch);
  }
  return { error: { message: err?.message ?? String(err), code: err?.code } };
}
