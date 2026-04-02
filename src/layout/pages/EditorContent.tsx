import { FC } from 'react';
import { DesignFrame } from '../../components/editor';
const defaultData = [
  {
    name: '',
    notes: '',
    layers: {
      ROOT: {
        type: {
          resolvedName: 'RootLayer',
        },
        props: {
          boxSize: {
            width: 1640,
            height: 924,
          },
          position: {
            x: 0,
            y: 0,
          },
          rotate: 0,
          color: 'rgb(255, 255, 255)',
          image: null,
        },
        locked: false,
        child: [],
        parent: null,
      },
    },
  },
];

interface Props {
  data?: any;
  onChanges?: (changes: any) => void;
  userRole?: string;
}
const EditorContent: FC<Props> = ({ data = defaultData, userRole, ...props }) => {
  return <DesignFrame data={data} userRole={userRole} {...props} />;
};

export default EditorContent;
