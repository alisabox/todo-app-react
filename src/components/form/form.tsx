import {
  Form,
  Input,
  Button,
  DatePicker,
  Upload,
  UploadProps,
  UploadFile,
  Spin,
  notification,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  useEffect,
  memo,
  useState
} from 'react';
import {
  addTodo,
  addTodoFiles,
  getTodo,
  updateTodo
} from '../../store/firestore';
import {
  IFormData,
  IBaseToDo
} from '../../types/types';
import styles from './style.module.css';

interface TodoFormParams {
  isActive: boolean,
  handleFormStateChange: (id?: string) => void,
  editableTodoId: string | undefined,
}


const TodoForm: React.FC<TodoFormParams> = ({ isActive, handleFormStateChange, editableTodoId }) => {
  const [form] = Form.useForm<IFormData>();

  /**
   * List of files attached to the form.
   */
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  /**
   * State of form indicating if data sending/loading is in progress.
   */
  const [isSendingInProgress, setIsSendingInProgress] = useState<boolean>(false);
  const [isLoadingInProgress, setIsLoadingInProgress] = useState<boolean>(false);

  /**
   * Fetches todo from database if the form is open is edit mode.
   */
  useEffect(() => {
    const getEditableTodo = async (id: string) => {
      setIsLoadingInProgress(true);
      const { title, text, date, files } = await getTodo(id);

      form.setFieldsValue({
        title,
        text,
        date: dayjs(date),
      });

      files && setFileList(files);
      setIsLoadingInProgress(false);
    }

    editableTodoId && getEditableTodo(editableTodoId);
  }, [editableTodoId, form]);

  /**
   * Upload file properties and handlers.
   */
  const props: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);

      return false;
    },
    fileList,
    defaultFileList: fileList,
  };

  /**
   * Notifications configuration.
   */
  const [api, contextHolder] = notification.useNotification();
  const openNotification = (message: string, description: string = '') => {
    api.error({
      message,
      description,
      placement: 'top',
    });
  };

  /**
   * Pre-submits data handling including upload of files to storage.
   * @param formData - Form data
   */
  const handleSubmit = async (formData: IFormData): Promise<void> => {
    const { title, text, date, files } = formData;
    const dateString = dayjs(date).format('YYYY-MM-DD');

    // Firestore doesn't throw error if it cannot establish connection. Therefore, we need to explicitly check presence of the internet connection.
    if (!navigator.onLine) {
      openNotification('No internet connection', 'Try to add a task when internet connection is restored.');
      return;
    }

    setIsSendingInProgress(true);

    // Submit data without files or upload file to storage and then submit data with files data.
    try {
      if (!files) {
        submitFormData({ title, text, date: dateString });
      } else {
        const filesData = await addTodoFiles(files.fileList);
        submitFormData({ title, text, date: dateString, files: filesData });
      }
    } catch (err) {
      openNotification('Failed to load the file', 'Try to remove the file and upload it once again.');
      setIsSendingInProgress(false);
    }
  };

  /**
   * Submits form data to firestore.
   * @param newTask - New task data to submit
   */
  const submitFormData = async (newTask: Partial<IBaseToDo>) => {
    try {
      if (editableTodoId) {
        await updateTodo(editableTodoId, newTask);
      } else {
        await addTodo(newTask);
      }
      handleReset();
    } catch (err) {
      openNotification('Failed to add a todo');
      setIsSendingInProgress(false);
    }
  };

  /**
   * Clears form data, list of attached files and closes the form.
   */
  const handleReset = () => {
    form.resetFields();
    setFileList([]);
    setIsSendingInProgress(false);
    handleFormStateChange();
  }


  return (
    <div className={`${styles.overlay} ${isActive ? styles.active : ''}`}>
      <Form
        className={styles.form}
        form={form}
        name="addClient"
        onFinish={handleSubmit}
        scrollToFirstError
      >
        {contextHolder}
        <Spin spinning={isSendingInProgress || isLoadingInProgress}>
          {
            editableTodoId
              ? <h2>Edit todo</h2>
              : <h2>New todo</h2>
          }

          <Form.Item
            name="title"
            label="Title"
            rules={[
              {
                required: true,
                message: 'Required',
                whitespace: true,
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="text"
            label="Description"
            rules={[
              {
                required: true,
                message: 'Required',
                whitespace: true,
              },
            ]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="date"
            label="Completion date"
            rules={[
              {
                required: true,
                message: 'Required',
              },
            ]}
          >
            <DatePicker placeholder="Choose a date" disabledDate={(current) => dayjs().isAfter(current, 'day')} />
          </Form.Item>

          <Form.Item
            name="files"
            label="Attach files"
          >
            <Upload {...props}>
              <Button icon={<UploadOutlined />}>Choose a file</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">{editableTodoId ? 'Update' : 'Add'}</Button>
            <Button htmlType="button" onClick={handleReset}>Cancel</Button>
          </Form.Item>
        </Spin>
      </Form>
    </div>
  );
};

export default memo(TodoForm);
