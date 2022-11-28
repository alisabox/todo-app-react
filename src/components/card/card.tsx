import dayjs from 'dayjs';
import { Card } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { memo } from 'react';
import {
  deleteTodo,
  updateTodo
} from '../../store/firestore';
import {
  IFile,
  IToDo
} from '../../types/types';
import styles from './style.module.css';

interface CardComponentParams {
  handleFormStateChange: (id: string) => void,
  todo: IToDo,
}

const CardComponent: React.FC<CardComponentParams> = ({ handleFormStateChange, todo }) => {
  /**
   * Checks if the task is outdated.
   */
  const outdatedTask: boolean = !todo.isDone && dayjs().isAfter(dayjs(todo.date), 'day');

  return (

    <Card
      style={{ width: 300 }}
      className={`${outdatedTask ? styles.outdated : ''}`}
      actions={[
        <DeleteOutlined key="delete" onClick={() => deleteTodo(todo)} />,
        <EditOutlined key="edit" onClick={() => handleFormStateChange(todo.id)} />,
      ]}
      hoverable
    >
      <CheckOutlined
        className={`${styles.done} ${todo.isDone ? styles.active : ''}`}
        onClick={() => updateTodo(todo.id, { isDone: !todo.isDone })}
      />
      <div className={`${styles.text} ${todo.isDone ? styles.activeText : ''}`}>
        <h2>{todo.title}</h2>
        <div>{todo.text}</div>
        <div className={styles.date}>Completion date: {dayjs(todo.date).format('YYYY-MM-DD')}</div>
        {
          todo.files && todo.files.length
            ? (<div className={styles.date}>Attached files: {
              todo.files.map((file: IFile) => {
                return (<div key={file.url}><a href={file.url}>{file.name}</a></div>)
              })
            }</div>)
            : ''
        }
      </div>
    </Card>
  )
}

export default memo(CardComponent);