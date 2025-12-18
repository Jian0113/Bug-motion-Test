const VIBE_CHILDREN = [
  {
    id: "ambiguity",
    label: "AMBIGUITY",
    type: "folder",
    children: [
      { id: "colordrift", label: "bug ( ColorDrift );", type: "file", route: "/WEB_Details/1_AMBIGUITY/A_4_ColorDrift" },
      { id: "dual-focus", label: "bug ( DualFocus );", type: "file", route: "/WEB_Details/1_AMBIGUITY/A_2_DualFocus" },
      { id: "blurry-boundary", label: "bug ( BlurryBoundary );", type: "file", route: "/WEB_Details/1_AMBIGUITY/A_3_BlurryBoundary" },
    ],
  },
  {
    id: "structure",
    label: "STRUCTURE",
    type: "folder",
    children: [
      { id: "misalign-form", label: "bug ( MisalignForm );", type: "file", route: "/WEB_Details/2_STRUCTURE/ST_1_MisalignForm" },
      { id: "amalgmation", label: "bug ( Amalgmation );", type: "file", route: "/WEB_Details/2_STRUCTURE/ST_2_Amalgmation" },
      { id: "patch-growth", label: "bug ( PatchGrowth );", type: "file", route: "/WEB_Details/2_STRUCTURE/ST_3_PatchGrowth" },
    ],
  },
  {
    id: "quant",
    label: "QUANTIATIV",
    type: "folder",
    children: [{ id: "overbloom", label: "bug ( OverBloom );", type: "file", route: "/WEB_Details/4_QUANTIATIV/Q_1_OverBloom" }],
  },
  {
    id: "scale",
    label: "SCALE",
    type: "folder",
    children: [
      { id: "ratiodrift", label: "bug ( RatioDrift );", type: "file", route: "/WEB_Details/5_SCALE/SC_1_RatioDrift" },
      { id: "macrobloom", label: "bug ( MacroBloom );", type: "file", route: "/WEB_Details/5_SCALE/SC_2_MacroBloom" },
      { id: "minifade", label: "bug ( MiniFade );", type: "file", route: "/WEB_Details/5_SCALE/SC_3_MiniFade" },
    ],
  },
  {
    id: "logic",
    label: "LOGIC",
    type: "folder",
    children: [
      { id: "ghostprint", label: "bug ( GhostPrint );", type: "file", route: "/WEB_Details/6_LOGIC/L_1_GhostPrint" },
      { id: "cachefootprint", label: "bug ( CacheFootprint );", type: "file", route: "/WEB_Details/6_LOGIC/L_4_CacheFootprint" },
    ],
  },
];

export const SIDEBAR_TREE = [{ id: "vibe", label: "VibeCodingBug", type: "folder", children: VIBE_CHILDREN }];

export default SIDEBAR_TREE;










