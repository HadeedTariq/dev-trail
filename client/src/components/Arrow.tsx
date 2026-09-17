import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "lucide-react";

const Arrow = () => {
  const { i18n } = useTranslation();
  return (
    <>
      {i18n.language === "en" ? (
        <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/button:translate-x-1" />
      ) : (
        <ArrowLeft className="ml-2 w-4 h-4 transition-transform group-hover/button:translate-x-1" />
      )}
    </>
  );
};

export default Arrow;
