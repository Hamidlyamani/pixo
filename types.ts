export type ToolEvent = { pos: { x: number; y: number }; target?: any };
export const BRUSH_TYPES = {
    GENERAL: "general",
    DRY: "dry",
    WET: "wet",
    SPECIAL: "special",
} as const;

export type BrushCategory = typeof BRUSH_TYPES[keyof typeof BRUSH_TYPES];

export type RoomUser = { id: string; name: string };






















// ---------------------------- Sockit io ----------------------------

export type ToolOptions = {
    color?: string;
    strokeWidth?: number;
    fontSize?: number;
    fill?: string;
    fontFamily:string;
    brushCategory?: BrushCategory;
    brushSubType?: string; 
    opacity?: number;      
    spacing?: number;      
    smoothing?: number;
   
};


export type BrushPayload = {
  points: number[]; 
};

export type LinePayload = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};


export type RectPayload = {
  x: number;      // top-left
  y: number;
  width: number;
  height: number;
};


export type EllipsePayload = {
  x: number;       // center
  y: number;
  radiusX: number;
  radiusY: number;
};


export type TextPayload = {
  x: number;
  y: number;
  text: string;
};

export type SelectPayload = {
  targetId: string | null;
};

export type transform= {
    x?: number;
    y?: number;
    rotation?: number;
    scaleX?: number;
    scaleY?: number;
  };


export type ToolPayload =
  | { tool: "brush"; payload: BrushPayload }
  | { tool: "eraser"; payload: BrushPayload }
  | { tool: "line"; payload: LinePayload }
  | { tool: "rect"; payload: RectPayload }
  | { tool: "ellipse"; payload: EllipsePayload }
  | { tool: "text"; payload: TextPayload }
  | { tool: "select"; payload: SelectPayload };


  export type ShapeStatus = "drawing" | "done";

export type Shape = {
  id: string;
  authorId: string;
  status: ShapeStatus;
  style?: ToolOptions;
  transform?:transform,
} & ToolPayload;
