import { UploadProps } from "antd";
import { Dayjs } from "dayjs";

export interface IBaseToDo {
  text: any;
  title: any;
  date: string;
  isDone: boolean;
  files: IFile[];
}

export interface IToDo extends IBaseToDo {
  id: string;
}

export interface IFile {
  uid: string;
  name: string;
  url: string;
}

export interface IFormData extends Omit<IBaseToDo, 'files' | 'date'> {
  date: Dayjs,
  files: UploadProps;
}