import * as firebase from "firebase/app";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  updateDoc
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable
} from "firebase/storage";
import {
  IBaseToDo,
  IFile,
  IToDo
} from "../types/types";

/**
 * Firestore instance
 */
const app = firebase.initializeApp({
  apiKey: "AIzaSyDL6Ug2atxoT689YWJ0OkXKGvQWLkrlq9Y",
  authDomain: "todo-app-react-501d6.firebaseapp.com",
  projectId: "todo-app-react-501d6",
  storageBucket: "todo-app-react-501d6.appspot.com",
  messagingSenderId: "680586703408",
  appId: "1:680586703408:web:63e9881870371bbe5a33f5"
});

export const firestore = getFirestore(app);
export const firestorage = getStorage(app);

/**
 * Add a new todo to the database. `isDone` field is set to false by default.
 * @param newData - New todo data
 */
export const addTodo = async (newData: Partial<IToDo>): Promise<void> => {
  await addDoc(collection(firestore, 'todos'), { ...newData, isDone: false });
}

/**
 * Updates a todo by id.
 * @param id - Id of the todo to update
 * @param updatedData - New todo data
 */
export const updateTodo = async (id: string, updatedData: Partial<IToDo>): Promise<void> => {
  await updateDoc(doc(firestore, 'todos', id), { ...updatedData });
}

/**
 * Deletes a todo from database by id.
 * @param todo - Todo to delete
 */
export const deleteTodo = async (todo: IToDo): Promise<void> => {
  await deleteDoc(doc(firestore, 'todos', todo.id));
  await deleteTodoFiles(todo.files);
}

/**
 * Deletes all files attached to a todo.
 * @param files - Array of files data
 */
export const deleteTodoFiles = async (files: IFile[]): Promise<void> => {
  files && await Promise.all(files.map((file) => deleteObject(ref(firestorage, `files/${file.name}`))));
}

/**
 * Adds files attached to a todo to storage and return data with download url. If a file is already in storage (has url), does nothing for that file.
 * @param files - Array of files blobs
 * @return Array of files data 
 */
export const addTodoFiles = async (files: any): Promise<IFile[]> => {
  return await Promise.all(files.map(async (file: any) => {
    if (file.url) {
      return file;
    }

    const storageRef = ref(firestorage, `files/${file.uid}-${file.name}`);
    const uploadedFileSnapshot = (await uploadBytesResumable(storageRef, file)).ref;
    const url = await getDownloadURL(uploadedFileSnapshot);
    return {
      uid: file.uid,
      name: file.name,
      url,
    }
  }));
}

/**
 * Gets todo from database by id.
 * @param id - Id of the todo to query
 * @returns Todo if if exists, otherwise returns `null`
 */
export const getTodo = async (id: string): Promise<IBaseToDo> => {
  const todoSnapshot = await getDoc(doc(firestore, 'todos', id));

  return todoSnapshot.data() as IBaseToDo;
}