import type { Coordinate } from "ol/coordinate";

export interface ApplicationData {
  id: string;
  coordinates: Coordinate;
  userId: string;
  userComment: string;
  images: {
    previewImageId: string;
    fullImageId: string;
  }[];
  status: "Создана" | "Одобрена" | "Отклонена";
  createDate: string;
  operatorComment: string;
  photoVerification: boolean;
  updateDate: string;
  operatorName: string | null;
  operatorId: string | null;
  problemAreaType: string;
}
