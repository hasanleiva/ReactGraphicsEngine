import React, { FC } from 'react';
import CloseSidebarButton from './CloseButton';
import useMobileDetect from 'canva-editor/hooks/useMobileDetect';
import UploadContentTab from './components/image/UploadContentTab';

const ImageContent: FC<{ onClose: () => void }> = ({ onClose }) => {
  const isMobile = useMobileDetect();
  
  return (
    <div
      css={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {!isMobile && <CloseSidebarButton onClose={onClose} />}
      <UploadContentTab visibility={true} onClose={onClose} />
    </div>
  );
};

export default ImageContent;
