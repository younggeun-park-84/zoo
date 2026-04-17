export interface Segment {
  id: string;
  label: string;
  color: string;
}

export const DEFAULT_SEGMENTS: Segment[] = [
  { id: "1", label: "1원", color: "#FF6B6B" },
  { id: "2", label: "20원", color: "#FF9F43" },
  { id: "3", label: "50원", color: "#FECA57" },
  { id: "4", label: "100원", color: "#48DBFB" },
  { id: "5", label: "500원", color: "#1DD1A1" },
  { id: "6", label: "1,000원", color: "#54A0FF" },
  { id: "7", label: "10,000원", color: "#A29BFE" },
  { id: "8", label: "1,000,000원", color: "#FD79A8" },
];
