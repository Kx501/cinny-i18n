import React, { useEffect } from 'react';
import { Chip, Icon, IconButton, Icons, Text, color } from 'folds';
import { useTranslation, Trans } from 'react-i18next';
import { UploadCard, UploadCardError, CompactUploadCardProgress } from './UploadCard';
import { TUploadAtom, UploadStatus, UploadSuccess, useBindUploadAtom } from '../../state/upload';
import { useMatrixClient } from '../../hooks/useMatrixClient';
import { TUploadContent } from '../../utils/matrix';
import { bytesToSize, getFileTypeIcon } from '../../utils/common';
import { useMediaConfig } from '../../hooks/useMediaConfig';

type CompactUploadCardRendererProps = {
  isEncrypted?: boolean;
  uploadAtom: TUploadAtom;
  onRemove: (file: TUploadContent) => void;
  onComplete?: (upload: UploadSuccess) => void;
};
export function CompactUploadCardRenderer({
  isEncrypted,
  uploadAtom,
  onRemove,
  onComplete,
}: CompactUploadCardRendererProps) {
  const mx = useMatrixClient();
  const { t } = useTranslation();
  const mediaConfig = useMediaConfig();
  const allowSize = mediaConfig['m.upload.size'] || Infinity;

  const { upload, startUpload, cancelUpload } = useBindUploadAtom(mx, uploadAtom, isEncrypted);
  const { file } = upload;
  const fileSizeExceeded = file.size >= allowSize;

  if (upload.status === UploadStatus.Idle && !fileSizeExceeded) {
    startUpload();
  }

  const removeUpload = () => {
    cancelUpload();
    onRemove(file);
  };

  useEffect(() => {
    if (upload.status === UploadStatus.Success) {
      onComplete?.(upload);
    }
  }, [upload, onComplete]);

  return (
    <UploadCard
      compact
      outlined
      radii="300"
      before={<Icon src={getFileTypeIcon(Icons, file.type)} />}
      after={
        <>
          {upload.status === UploadStatus.Error && (
            <Chip
              as="button"
              onClick={startUpload}
              aria-label={t('components:upload-card.retry_upload')}
              variant="Critical"
              radii="Pill"
              outlined
            >
              <Text size="B300">{t('components:upload-card.retry')}</Text>
            </Chip>
          )}
          <IconButton
            onClick={removeUpload}
            aria-label={t('components:upload-card.cancel_upload')}
            variant="SurfaceVariant"
            radii="Pill"
            size="300"
          >
            <Icon src={Icons.Cross} size="200" />
          </IconButton>
        </>
      }
    >
      {upload.status === UploadStatus.Success ? (
        <>
          <Text size="H6" truncate>
            {file.name}
          </Text>
          <Icon style={{ color: color.Success.Main }} src={Icons.Check} size="100" />
        </>
      ) : (
        <>
          {upload.status === UploadStatus.Idle && !fileSizeExceeded && (
            <CompactUploadCardProgress sentBytes={0} totalBytes={file.size} />
          )}
          {upload.status === UploadStatus.Loading && (
            <CompactUploadCardProgress sentBytes={upload.progress.loaded} totalBytes={file.size} />
          )}
          {upload.status === UploadStatus.Error && (
            <UploadCardError>
              <Text size="T200">{upload.error.message}</Text>
            </UploadCardError>
          )}
          {upload.status === UploadStatus.Idle && fileSizeExceeded && (
            <UploadCardError>
              <Text size="T200">
                <Trans
                  i18nKey="components:upload-card.the_file_size_exceeds_the_limit"
                  values={{ max: bytesToSize(allowSize), size: bytesToSize(file.size) }}
                  components={{ b: <b /> }}
                />
              </Text>
            </UploadCardError>
          )}
        </>
      )}
    </UploadCard>
  );
}
