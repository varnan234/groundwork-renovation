export type TradeId =
  | "basement"
  | "framing"
  | "drywall"
  | "painting"
  | "flooring"
  | "tiling"
  | "plumbing";

export type Trade = {
  id: TradeId;
  /** The trade, set as the chip's colour name. */
  name: string;
  /** Chip formula code printed under the name, like a paint colour number. */
  code: string;
  /** Five-step ramp, lightest first. Step 4 (index 3) is the trade's signature colour. */
  ramp: [string, string, string, string, string];
  /** One line, plain trade language. */
  line: string;
  /** What the job covers. Scope, not promises. */
  includes: string[];
  /** How a quote usually happens for this trade. */
  quote: "Site visit" | "Photo estimate or site visit";
};

export const trades: Trade[] = [
  {
    id: "basement",
    name: "Basement Renovation",
    code: "GW-101",
    ramp: ["#dfe8df", "#b5cbb7", "#7fa386", "#4a7556", "#2f4a3a"],
    line: "Bare concrete to a finished room you'll use.",
    includes: [
      "Layout and planning with you on site",
      "Framing, insulation and drywall",
      "Flooring, trim and paint",
      "Bathroom or wet bar rough-in and finish",
    ],
    quote: "Site visit",
  },
  {
    id: "framing",
    name: "Framing",
    code: "GW-204",
    ramp: ["#fbefd2", "#f4d796", "#ebbd57", "#e2a52c", "#8a5c0a"],
    line: "Walls, bulkheads and openings, square and plumb.",
    includes: [
      "Partition and exterior-wall framing",
      "Bulkheads around ducts and beams",
      "Door and closet openings",
      "Stud repair and sistering",
    ],
    quote: "Site visit",
  },
  {
    id: "drywall",
    name: "Drywall Repair",
    code: "GW-318",
    ramp: ["#ecebe7", "#d6d4ce", "#b4b1a8", "#8c887e", "#5c5951"],
    line: "Holes, cracks and water damage, patched flat.",
    includes: [
      "Hole and dent patching",
      "Crack and tape-joint repair",
      "Water-damaged section replacement",
      "Mud, sand and prime, ready for paint",
    ],
    quote: "Photo estimate or site visit",
  },
  {
    id: "painting",
    name: "Painting",
    code: "GW-422",
    ramp: ["#f6ddd6", "#e9ad9e", "#d77560", "#b4432f", "#7f2a1d"],
    line: "Clean lines, covered floors, two full coats.",
    includes: [
      "Walls, ceilings and trim",
      "Surface prep and minor repairs",
      "Doors, railings and cabinets",
      "Colour matching from a chip you bring",
    ],
    quote: "Photo estimate or site visit",
  },
  {
    id: "flooring",
    name: "Flooring",
    code: "GW-536",
    ramp: ["#efe1d3", "#d8b896", "#b38558", "#8a5a33", "#5a3820"],
    line: "Vinyl plank, laminate and hardwood, laid tight.",
    includes: [
      "Old floor removal and subfloor prep",
      "Vinyl plank, laminate and engineered hardwood",
      "Underlay and moisture barrier for basements",
      "Baseboard and transitions",
    ],
    quote: "Photo estimate or site visit",
  },
  {
    id: "tiling",
    name: "Tiling",
    code: "GW-641",
    ramp: ["#dde5ee", "#b2c3d6", "#7d98b6", "#3d5a7a", "#263b54"],
    line: "Floors, showers and backsplashes, even grout lines.",
    includes: [
      "Bathroom floors and shower walls",
      "Kitchen backsplashes",
      "Waterproofing behind wet-area tile",
      "Re-grouting and cracked-tile replacement",
    ],
    quote: "Photo estimate or site visit",
  },
  {
    id: "plumbing",
    name: "Plumbing",
    code: "GW-755",
    ramp: ["#d8ecea", "#a6d3cf", "#5fada6", "#2d7f78", "#17534f"],
    line: "Fixtures in, leaks out, drains running.",
    includes: [
      "Sink, toilet and faucet installs",
      "Leak and drain repair",
      "Basement bathroom rough-in",
      "Shut-off valve and supply line replacement",
    ],
    quote: "Photo estimate or site visit",
  },
];

export const tradeById = Object.fromEntries(trades.map((t) => [t.id, t])) as Record<TradeId, Trade>;
