import { PlusOutlined } from '@ant-design/icons';
import { Upload, message } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { useEffect, useState } from 'react';
import { api } from '../api';
import { isDisplayableMediaUrl, resolveMediaUrl } from '../media';

type MultiImageUploadProps = {
  value?: string[];
  onChange?: (value: string[]) => void;
  maxCount?: number;
};

export default function MultiImageUpload({
  value = [],
  onChange,
  maxCount = 9,
}: MultiImageUploadProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    setFileList(
      (value || [])
        .map(resolveMediaUrl)
        .filter(isDisplayableMediaUrl)
        .map((url, index) => ({
          uid: `${index}-${url}`,
          name: `photo-${index + 1}`,
          status: 'done' as const,
          url,
        })),
    );
  }, [value]);

  const customRequest: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    try {
      const result = await api.uploadImage(file as File);
      const next = [...(value || []), result.url];
      onChange?.(next);
      onSuccess?.(result);
      message.success('上传成功');
    } catch (err) {
      message.error(err instanceof Error ? err.message : '上传失败');
      onError?.(err as Error);
    }
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: nextList }) => {
    setFileList(nextList);
    const urls = nextList
      .filter((item) => item.status === 'done')
      .map((item) => item.url || item.response?.url)
      .filter((url): url is string => !!url);
    onChange?.(urls);
  };

  return (
    <Upload
      listType="picture-card"
      multiple
      maxCount={maxCount}
      accept="image/*"
      fileList={fileList}
      customRequest={customRequest}
      onChange={handleChange}
    >
      {fileList.length >= maxCount ? null : (
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>上传照片</div>
        </div>
      )}
    </Upload>
  );
}
