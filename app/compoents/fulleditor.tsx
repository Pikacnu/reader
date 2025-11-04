import { createContext, useState } from 'react';

interface EditorProps {
  defaultText: string;
  onChange: (text: string) => void;
}

export function useEditor({ defaultText, onChange }: EditorProps) {
  const [text, setText] = useState(defaultText);
  const editorText = createContext({
    text,
    setText: (newText: string) => {
      setText(newText);
      onChange(newText);
    },
  });

  return [
    () => (
      <>
        <editorText.Provider
          value={{
            text,
            setText,
          }}
        ></editorText.Provider>
      </>
    ),
    editorText,
    setText,
  ];
}
