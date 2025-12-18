import noteCategories from "@/data/noteCategories";

const fallbackImages = ["/bugs/1.svg", "/bugs/2.svg", "/bugs/3.svg", "/bugs/4.svg", "/bugs/5.svg"];

/**
 * noteCategories 기반으로 상세 페이지용 데이터를 생성합니다.
 * - descriptionLines: causes + visualResult를 "/" 구분자로 분할해 문단화
 * - cards: bugs 목록을 카드로 변환, causeLines/ prompts는 causes/visualResult를 동일하게 사용
 */
export function buildDetailById(categoryId) {
  const categories = Array.isArray(noteCategories) ? noteCategories : [];
  const categoryIndex = categories.findIndex((c) => c.id === categoryId);
  const category = categoryIndex >= 0 ? categories[categoryIndex] : null;

  if (!category) {
    return {
      categoryNumber: "00",
      categoryTitle: categoryId || "UNKNOWN",
      categorySubtitle: "",
      headline: "",
      descriptionLines: ["데이터를 찾을 수 없습니다."],
      cards: [],
    };
  }

  const splitLines = (text = "") =>
    text
      .split("/")
      .map((s) => s.trim())
      .filter(Boolean);

  const causesLines = splitLines(category.causes);
  const visualLines = splitLines(category.visualResult);

  const cards = (category.bugs || []).map((bug, idx) => ({
    number: String(idx + 1).padStart(2, "0"),
    title: bug.name,
    subtitle: bug.description,
    image: fallbackImages[idx % fallbackImages.length],
    causeLines: causesLines.length ? causesLines : [category.causes],
    prompts: visualLines.length ? visualLines : [category.visualResult],
  }));

  return {
    categoryNumber: String(categoryIndex + 1).padStart(2, "0"),
    categoryTitle: category.title,
    categorySubtitle: category.subtitle,
    headline: category.subtitle,
    descriptionLines: [...causesLines, ...visualLines],
    cards,
  };
}
