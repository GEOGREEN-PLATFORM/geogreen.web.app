export interface TaskEvent {
  id: string;
  geoPointId?: string;
  startDate: string;
  endDate: string;
  lastUpdateDate: string;
  statusCode: string;
  eventType: string;
  problemAreaType: string;
  description: string;
  name: string;
  operator: {
    id: string;
    firstName: string;
    lastName: string;
    patronymic: string;
  };
  author: {
    id: string;
    firstName: string;
    lastName: string;
    patronymic: string;
  };
  responsibleEmployeeOption?: ItemOption;
}
export interface TaskEventData {
  name: string;
  description: string;
  expectedDateEnd: string;
  responsibleEmployee: ItemOption | null;
  relatedHotbedId: string;
}
export interface TaskEventHistory {
  id: string;
  eventId: string;
  recordDate: string;
  recordType: string;
  description: string;
  photos: ImageObj[];
  operator: {
    id: string;
    firstName: string;
    lastName: string;
    patronymic: string;
  };
  createDate: string;
}
