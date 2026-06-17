import { PlusOutlined } from '@ant-design/icons';
import { Upload, message } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { useEffect, useState } from 'react';
import { api } from '../api';

type ImageUploadProps = {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
};

export default function ImageUpload({ value, onChange, label = 'Logo' }: ImageUploadProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (value) {
      setFileList([
        {
          uid: '-1',
          name: 'logo',
          status: 'done',
          url: value,
        },
      ]);
      return;
    }
    setFileList([]);
  }, [value]);

  const customRequest: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    try {
      const result = await api.uploadImage(file as File);
      onChange?.(result.url);
      onSuccess?.(result);
      message.success('上传成功');
    } catch (err) {
      message.error(err instanceof Error ? err.message : '上传失败');
      onError?.(err as Error);
    }
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: nextList }) => {
    setFileList(nextList);
    if (nextList.length === 0) {
      onChange?.('');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 8, color: 'rgba(0,0,0,0.65)' }}>{label}</div>
      <Upload
        listType="picture-card"
        maxCount={1}
        accept="image/*"
        fileList={fileList}
        customRequest={customRequest}
        onChange={handleChange}
        onRemove={() => {
          onChange?.('');
          return true;
        }}
      >
        {fileList.length >= 1 ? null : (
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>上传</div>
          </div>
        )}
      </Upload>
    </div>
  );
}
