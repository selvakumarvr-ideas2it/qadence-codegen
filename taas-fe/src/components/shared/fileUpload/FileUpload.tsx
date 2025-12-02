import BinIcon from '@/assets/icons/BinIcon.svg?react';
import CheckIcon from '@/assets/icons/CheckIcon.svg?react';
import Document from '@/assets/icons/Document.svg?react';
import Exclamation from '@/assets/icons/Exclamation.svg?react';
import Upload from '@/assets/icons/Upload.svg?react';
import type { TOAST_TYPE } from '@/constants/appConstant';
import React, { useCallback, useRef, useState } from 'react';

type BaseProps = {
  error?: string;
  disabled?: boolean;
  className?: string;
  controlClassName?: string;
  accept?: string;
  maxSizeMb?: number; // per-file max size
  onBlur?: () => void;
  statusType?: (typeof TOAST_TYPE)[keyof typeof TOAST_TYPE];
  statusMessage?: string;
  fileNameMaxChars?: number;
};

type SingleProps = {
  multiple?: false;
  value?: File | null;
  onChange: (file: File | null) => void;
};

type MultipleProps = {
  multiple: true;
  value?: File[];
  onChange: (files: File[]) => void;
};

type FileUploadProps = BaseProps & (SingleProps | MultipleProps);

const FileUpload: React.FC<FileUploadProps> = ({
  error,
  disabled,
  className,
  controlClassName,
  accept = '',
  maxSizeMb = 20,
  onBlur,
  statusType,
  statusMessage,
  fileNameMaxChars = 40,
  ...rest
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const toArray = (files: FileList): File[] => Array.from(files ?? []);

  const truncateMiddle = (text: string, max: number) => {
    if (!text || text.length <= max) return text;
    const half = Math.max(1, Math.floor((max - 3) / 2));
    return `${text.slice(0, half)}...${text.slice(-half)}`;
  };

  const validateFiles = (
    files: File[]
  ): { valid: File[]; rejected: string[] } => {
    const maxBytes = maxSizeMb * 1024 * 1024;
    const exts = accept
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const matchesAccept = (file: File) => {
      if (!exts.length) return true;
      const name = file.name.toLowerCase();
      const type = (file.type || '').toLowerCase();

      return exts.some((acc) => {
        if (acc.startsWith('.')) {
          return name.endsWith(acc);
        }
        // e.g. text/csv, application/json, image/*
        if (acc.endsWith('/*')) {
          const prefix = acc.replace('/*', '');
          return type.startsWith(prefix);
        }
        return type === acc;
      });
    };

    const valid: File[] = [];
    const rejected: string[] = [];
    for (const f of files) {
      if (f.type !== 'text/csv' || f.name.toLowerCase().endsWith('.csv')) {
        valid.push(f);
        continue;
      }
      if (f.size > maxBytes) {
        rejected.push(`${f.name} exceeds ${maxSizeMb}MB`);
        continue;
      }
      if (!matchesAccept(f)) {
        rejected.push(`${f.name} is not an accepted type`);
        continue;
      }
      valid.push(f);
    }
    return { valid, rejected };
  };

  const handleFiles = useCallback(
    (incoming: File[]) => {
      const { valid } = validateFiles(incoming);

      if ('multiple' in rest && rest.multiple) {
        const current = rest.value ?? [];
        const deduped = [
          ...current,
          ...valid.filter(
            (f) =>
              !current.some(
                (c) =>
                  c.name === f.name &&
                  c.size === f.size &&
                  c.lastModified === f.lastModified
              )
          ),
        ];
        rest.onChange(deduped);
      } else {
        // Only accept a valid file; otherwise clear
        const next = valid[0] ?? null;
        rest.onChange(next);
      }
    },
    [rest]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const files = toArray(e.target.files as FileList);
    handleFiles(files);
    onBlur?.();
    // reset input to allow same file selection again
    if (inputRef.current) inputRef.current.value = '';
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    const files = toArray(e.dataTransfer.files);
    handleFiles(files);
    onBlur?.();
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const removeAt = (index: number) => {
    if (!('multiple' in rest && rest.multiple)) return;
    const next = (rest.value ?? []).slice();
    next.splice(index, 1);
    rest.onChange(next);
  };

  const clearSingle = () => {
    if ('multiple' in rest && rest.multiple) return;
    rest.onChange(null);
  };

  const hasValue =
    'multiple' in rest && rest.multiple
      ? (rest.value?.length ?? 0) > 0
      : !!rest.value;

  const statusColor =
    statusType === 'error'
      ? 'text-red-500'
      : statusType === 'info'
        ? 'text-blue-500'
        : 'text-green-500';

  return (
    <div className={className}>
      <div
        className={[
          'w-full border border-dashed border-gray-200 rounded-md bg-white',
          'transition-colors',
          disabled
            ? 'bg-gray-100 cursor-not-allowed text-gray-400'
            : 'cursor-pointer',
          isDragging ? 'ring-2 ring-blue-400 ring-offset-1' : '',
          controlClassName || '',
        ].join(' ')}
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            inputRef.current?.click();
          }
        }}
        aria-disabled={disabled}
      >
        <div className="px-3 py-3">
          {!hasValue ? (
            <div className="flex items-center justify-center text-center gap-2">
              <div>
                <Upload />
              </div>
              <div className="text-start">
                <p className="text-black">
                  Upload the completed test case file here
                </p>
                <p className="text-gray-600">
                  Drag and drop or click here to add files
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {'multiple' in rest && rest.multiple ? (
                <div className="flex flex-wrap gap-2">
                  {(rest.value ?? []).map((f, i) => (
                    <div
                      key={`${f.name}-${f.size}-${f.lastModified}-${i}`}
                      className="px-2 py-1 rounded-full border border-gray-200 bg-white text-xs flex items-center gap-2"
                    >
                      <span className="max-w-[220px] truncate" title={f.name}>
                        {truncateMiddle(f.name, fileNameMaxChars)}
                      </span>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAt(i);
                        }}
                        aria-label={`Remove ${f.name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex mx-auto items-center gap-5">
                  <div>
                    <Document />
                  </div>
                  <div>
                    <div className="flex gap-2">
                      <span
                        className="text-md truncate max-w-[75%]"
                        title={(rest.value as File | null)?.name || ''}
                      >
                        {truncateMiddle(
                          (rest.value as File | null)?.name || '',
                          fileNameMaxChars
                        )}
                      </span>
                      <BinIcon
                        className="text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearSingle();
                        }}
                        aria-label="Clear selected file"
                      />
                    </div>
                    <div className={`flex gap-2 ${statusColor}`}>
                      {statusType === 'error' ? (
                        <Exclamation className="text-red-500" />
                      ) : (
                        <CheckIcon />
                      )}
                      <p className="text-sm mt-0.5">{statusMessage}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={onInputChange}
          accept={accept}
          multiple={('multiple' in rest && rest.multiple) || false}
          disabled={disabled}
          onBlur={onBlur}
        />
      </div>
      {error && !statusMessage && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;
