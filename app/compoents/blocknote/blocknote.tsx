import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import { useContext, useEffect } from 'react';
import { text } from './index';
import { BlockNoteEditor } from '@blocknote/core';
import { Block } from '@blocknote/core';
import { useLightMode } from '~/context/light_toggle_context';

export default function View({
  getEditor,
  defaultdata,
}: {
  getEditor: (data: BlockNoteEditor) => void;
  defaultdata?: Block[];
}) {
  const { isLightMode } = useLightMode();
  const editor = useCreateBlockNote({
    defaultStyles: true,
    initialContent: defaultdata,
  });
  useEffect(() => {
    getEditor(editor);
  }, []);
  return (
    <div>
      <BlockNoteView
        editor={editor}
        theme={isLightMode ? 'light' : 'dark'}
        sideMenu={false}
        slashMenu={false}
        linkToolbar={false}
        tableHandles={false}
        formattingToolbar={false}
      ></BlockNoteView>
    </div>
  );
}
