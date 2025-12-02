import type { IDownloadScriptRequest } from '@/interfaces/UploadTestCase';
import { UploadTestCase } from '@/services/UploadTestCase';
import { useMutation } from '@tanstack/react-query';

const useDownloadScriptFileMutation = () => {
  return useMutation<Blob, Error, IDownloadScriptRequest>({
    mutationFn: async (payload) => {
      return await UploadTestCase.downloadScriptFile(payload);
    },
  });
};

export default useDownloadScriptFileMutation;
