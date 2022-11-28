import {
  Button,
  Spin
} from 'antd';
import {
  collection,
  onSnapshot,
  orderBy,
  query
} from 'firebase/firestore';
import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { firestore } from '../../store/firestore';
import { IToDo } from '../../types/types';
import CardComponent from '../card/card';
import TodoForm from '../form/form';
import styles from './style.module.css';

const App: React.FC = () => {

  /**
   * Adds subscriptions to database on first load that updates app data on database snapshot change
   */
  useEffect(() => {
    setIsLoading(true);
    onSnapshot(query(collection(firestore, 'todos'), orderBy('date')), (snapshot) => {
      const todos = snapshot.docs.map(doc => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      }) as IToDo[];

      setTodos(todos);
      setDoneTodosNumber(todos.filter(todo => todo.isDone).length);
      setIsLoading(false);
    });
  }, []);


  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [todos, setTodos] = useState<IToDo[]>([]);
  const [doneTodosNumber, setDoneTodosNumber] = useState(0);
  const [activeForm, setActiveForm] = useState(false);
  const [editableTodoId, setEditableTodoId] = useState<string | undefined>(undefined);

  /**
   * Changes form state to opened or closed and resets editable todo id
   * @param id - If form is opened in edit mode, pass editable todo id, by default set to `undefined`
   */
  const handleFormStateChange = useCallback((editableTotoId: string | undefined = undefined) => {
    setActiveForm((prevState) => !prevState);
    setEditableTodoId(editableTotoId);
  }, []);

  return (
    <>
      <div className={styles.header}>
        <Button type="primary" htmlType="button" onClick={() => handleFormStateChange()}>Add a todo</Button>
        <div className={styles.counts}>
          <p>All todos: {todos.length}</p>
          <p className={styles.green}>Done: {doneTodosNumber}</p>
          <p className={styles.red}>Left: {todos.length - doneTodosNumber}</p>
        </div>
      </div>
      {
        isLoading
          ? (
            <Spin className={styles.spinner} tip="Loading..."></Spin>
          )
          : (
            <div className={styles.list}>
              {
                todos.map((todo) =>
                  <CardComponent key={todo.id} handleFormStateChange={handleFormStateChange} todo={todo} />)
              }
            </div>
          )
      }
      <TodoForm isActive={activeForm} handleFormStateChange={handleFormStateChange} editableTodoId={editableTodoId} />
    </>
  )
}

export default App;