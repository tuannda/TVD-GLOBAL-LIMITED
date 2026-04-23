"use client";

import SunEditor from "suneditor-react";

interface SunEditorComponentProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SunEditorComponent({
  value,
  onChange,
}: SunEditorComponentProps) {
  return (
    <SunEditor
      setContents={value}
      onChange={onChange}
      setOptions={{
        height: "500",
        buttonList: [
          ["undo", "redo"],
          ["font", "fontSize", "formatBlock"],
          ["bold", "underline", "italic", "strike", "subscript", "superscript"],
          ["fontColor", "hiliteColor"],
          ["removeFormat"],
          ["outdent", "indent"],
          ["align", "horizontalRule", "list", "lineHeight"],
          ["table", "link", "image", "video"],
          ["fullScreen", "showBlocks", "codeView"],
          ["preview", "print"],
        ],
        defaultStyle:
          "font-size: 18px; line-height: 1.8; font-family: var(--font-editor), Arial, Helvetica, sans-serif; color: #111827;",
      }}
    />
  );
}
