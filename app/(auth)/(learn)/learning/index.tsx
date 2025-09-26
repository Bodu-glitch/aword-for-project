import FlowPager from "@/components/FlowPager";
import NewWord from "@/components/NewWord";
import NewWordDetail from "@/components/NewWordDetail";
import QuizFourOptions from "@/components/QuizFourOptions";
import QuizResult from "@/components/QuizResult";
import { router } from "expo-router";
import React from "react";
import { View } from "react-native";

const Index = () => {
  const [step, setStep] = React.useState(0);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [checked, setChecked] = React.useState(false);

  return (
    <View className="flex-1">
      <FlowPager index={step}>
        <NewWord
          word="adventure"
          progress={0.15}
          onContinue={() => setStep(1)}
        />

        <NewWordDetail
          progress={0.3}
          wordParts={[
            { text: "ad", colorClass: "text-red-600" },
            { text: "·", colorClass: "text-black" },
            { text: "vent", colorClass: "text-black" },
            { text: "·", colorClass: "text-black" },
            { text: "ure", colorClass: "text-green-600" },
          ]}
          pos="noun"
          ipa="/ədˈvɛn(t)SHər/"
          viDefinition="Chuyến phiêu lưu, mạo hiểm"
          example="Her recent adventures in Italy"
          anatomy={[
            {
              badgeLabel: "Prefix",
              badgeColorClass: "bg-red-600",
              part: "ad-",
              meaning: "Hướng đến",
            },
            {
              badgeLabel: "Origin",
              badgeColorClass: "bg-black",
              part: "-vent-",
              meaning: "Đi",
            },
            {
              badgeLabel: "Postfix",
              badgeColorClass: "bg-green-600",
              part: "-ure",
              meaning: "hậu tố",
            },
          ]}
          onContinue={() => setStep(2)}
        />

        <QuizFourOptions
          progress={0.45}
          title="Nghĩa của tiền tố"
          prompt="ad-"
          promptColorClass="text-red-600"
          options={[
            "A. phù hợp, thích hợp",
            "B. thẳng đến",
            "C. hướng đến",
            "D. hấp dẫn, thu hút",
          ]}
          selectedIndex={selected}
          onSelect={(i) => {
            setSelected(i);
            if (checked) setChecked(false);
          }}
          correctIndex={2}
          checked={checked}
          onCheck={() => {
            if (!checked) setChecked(true);
            else setStep(3);
          }}
          checkLabel="Check"
          continueLabel="Continue"
          correctMessage="Chính xác"
          incorrectMessage="Nghĩa của tiền tố ad- là: hướng đến"
        />

        <QuizResult
          stats={[
            {
              icon: "timer-outline",
              color: "#6D28D9",
              text: "2:30 - Super fast",
            },
            { icon: "flame-outline", color: "#DC2626", text: "10 in a row" },
            { icon: "flash-outline", color: "#F59E0B", text: "40 exp" },
          ]}
          onContinue={() => router.replace("/home")}
        />
      </FlowPager>
    </View>
  );
};

export default Index;
