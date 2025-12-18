const ambiguityDetail = {
  categoryNumber: "01",
  categoryTitle: "AMBIQUITY",
  categorySubtitle: ": 명확성 부족으로 발생하는 시각적 혼탁",
  headline: "명확성 부족으로 발생하는 시각적 혼탁",
  descriptionLines: [
    "사용자의 지시가 ‘무엇’을 대상으로 하는지, ‘어떤 결과(형태·기능·우선순위)’를 원하는지, 혹은 그 결과를 판단할 기준을 빠뜨릴 때 발생하는 버그 군이다.",
    "AI는 빈칸을 통계적·일반적 판단으로 채워 넣는 경향이 있어, 본래 의도와 다른 ‘평균값·대표 형태’로 수렴하거나 경계와 중심이 흐려진 시각물을 만들어낸다.",
    "이 과의 핵심은 정보의 결여가 해석(interpretation)으로 전환되며, 그 해석이 곧 ‘버그의 외형’으로 드러난다는 점이다.",
    "따라서 관람자는 결과만 보고 ‘시각적 실패’로 보지만, 그 원인은 사용자 프롬프트의 구조적 빈칸에 있다.",
  ],
  cards: [
    {
      number: "01",
      title: "Blurry Boundary",
      subtitle: "흐릿한 경계",
      image: "/bugs/1.svg",
      causeLines: [
        "프롬프트에서 대상(what)·경계 처리 방식(border handling)·우선시할 요소(priority)를 명시하지 않았을 때 발생.",
      ],
      prompts: [
        "“그림을 자연스럽게 처리해줘. 경계는 부드럽게.”",
        "“윤곽은 흐릿하게, 딱딱하지 않게 해줘.”",
        "“어떤 요소든 서로 섞이게 해. 선명도는 크게 신경 안 써도 돼.”",
      ],
    },
    {
      number: "02",
      title: "DUAL FOCUS",
      subtitle: "이중초점",
      image: "/bugs/3.svg",
      causeLines: [
        "AI에게 두 개 이상의 초점을 동일한 우선순위로 요구할 때 발생.",
        "지정되지 않은 채 두 개 이상을 강조하라는 지시가 들어가며 구조적 모호성이 생김.",
      ],
      prompts: [
        "“메인과 서브를 둘 다 강조해줘.”",
        "“두 영역을 똑같이 돋보이게 해.”",
        "“둘 다 메인처럼 보여야 해.”",
      ],
    },
    {
      number: "03",
      title: "Soft Edge",
      subtitle: "흐린 디테일",
      image: "/bugs/4.svg",
      causeLines: [
        "디테일 레벨(detail level), 텍스처(texture), 레이어 밀도(depth) 등이 지정되지 않았거나 '대충', '적당히' 등의 모호한 지시로 발생.",
      ],
      prompts: [
        "“대충 디테일을 살리면서 전체적으로 자연스럽게 정리해줘.”",
        "“질감은 있지만 너무 명확하진 않게.”",
        "“정보는 많지만 답답하지 않게 표현해줘.”",
      ],
    },
  ],
};

export default ambiguityDetail;
