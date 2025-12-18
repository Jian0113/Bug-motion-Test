const noteCategories = [
  {
    id: "AMBIGUITY",
    title: "AMBIGUITY",
    subtitle: "명확성 부족으로 발생하는 시각적 혼란",
    bugs: [
      { name: "Soft Edge", description: "부드러운 경계" },
      { name: "Dual Focus", description: "이중 초점" },
      { name: "Muddy Detail", description: "흐린 디테일" },
    ],
    causes: "경계를 어떻게 처리할지 명확히 지시되지 않음 / 핵심 요소가 무엇인지 판단 정보 부족 / 세부 요소 요구가 불충분",
    visualResult: "형태가 혼잡하게 번지거나 경계가 모호해짐 / 초점이 분산되고 시선이 분명히 머물 지점이 없음 / 텍스처·디테일이 뭉개지거나 완성도가 낮아짐",
  },
  {
    id: "STRUCTURE",
    title: "STRUCTURE",
    subtitle: "구조 규칙 미지시로 발생하는 변형·융합",
    bugs: [
      { name: "Misalign Form", description: "연결된 형태" },
      { name: "Hybrid Body", description: "혼합체" },
      { name: "Patch Growth", description: "불균형 성장" },
    ],
    causes: "경계를 어떻게 처리할지 명확히 지시되지 않음 / 핵심 요소가 무엇인지 판단 정보 부족 / 세부 요소 요구가 불충분",
    visualResult: "요소가 찌그러지거나 어긋난 형태로 합쳐짐 / 둘 이상의 구조가 부적절하게 합쳐져 하이브리드 상태 발생 / 성장/확장 과정이 매끄럽지 않고 지저분하게 퍼짐",
  },
  {
    id: "CAUSALITY",
    title: "CAUSALITY",
    subtitle: "과정·사서 걸어 → 결과만 남는 오류",
    bugs: [
      { name: "Cause Slip", description: "인과 단절" },
      { name: "Dual Focus", description: "이중 초점" },
      { name: "Result Loop", description: "결과 반복" },
    ],
    causes: "경계를 어떻게 처리할지 명확히 지시되지 않음 / 핵심 요소가 무엇인지 판단 정보 부족 / 세부 요소 요구가 불충분",
    visualResult: "결과만 남아있고 과정이 비정상적·끊김 / 둘 이상의 단계가 동시에 일어난 것처럼 보임 / 동일 요소가 반복·중첩되어 불필요하게 증식",
  },
  {
    id: "QUANTIATIV",
    title: "QUANTIATIV",
    subtitle: "수량·중치 조건 미정의 → 과다/과소 생성",
    bugs: [
      { name: "Over Bloom", description: "과다생성" },
      { name: "Sparse Field", description: "희박한 증식" },
      { name: "Stack Spread", description: "누적 확산" },
    ],
    causes: "경계를 어떻게 처리할지 명확히 지시되지 않음 / 핵심 요소가 무엇인지 판단 정보 부족 / 세부 요소 요구가 불충분",
    visualResult: "요소가 폭발적으로 증식 (예: 2 → 4 → 8 → 16) / 화면이 허전하거나 빈 공간 발생 / 겹쳐 쌓이거나 점진적 증가가 무질서함",
  },
  {
    id: "SCALE",
    title: "SCALE",
    subtitle: "비율·크기 기준 모호로 인해 발생하는 확대/축소 불균형",
    bugs: [
      { name: "Ratio Drift", description: "비율 이탈" },
      { name: "Micro Stretch", description: "미세 왜곡" },
      { name: "Shape Inflate", description: "과팽창/상실" },
    ],
    causes: "경계를 어떻게 처리할지 명확히 지시되지 않음 / 핵심 요소가 무엇인지 판단 정보 부족 / 세부 요소 요구가 불충분",
    visualResult: "팔다리가 기형적으로 길어짐 / 두부·사지가 과장 / 확대·축소가 단계 없이 훌쩍 / 특정 포맷만 과장되게 부풀어오름",
  },
  {
    id: "LOGIC",
    title: "LOGIC",
    subtitle: "절차 규칙 미비 → 단계 혼합·조건 붕괴",
    bugs: [
      { name: "Rule Void", description: "룰 공백" },
      { name: "Phase Mix", description: "단계 혼합" },
      { name: "Loose Constraint", description: "조건 붕괴" },
    ],
    causes: "절차·규칙 설계 없음 / 초기화·완성형이 동시에 존재하는 상태 / 금지/예외가 작동하지 않아 무질서한 결과 생성",
    visualResult: "전체 모양 통일되지 않고 들쭉날쭉 / 초기형과 완성형이 동시에 나타남 / 무질서한 결과 생성",
  },
];

export default noteCategories;
