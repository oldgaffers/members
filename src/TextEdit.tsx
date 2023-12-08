import { useCallback } from 'react';
import { Box } from '@mui/material';
import 'tiny-editor';

type TextEditProps = {
    text: string
    onChange: Function
}

export default function TextEdit({ text, onChange, ...props }: TextEditProps) {
    const editorRef = useCallback((editorNode: any) => {
        if (editorNode) {
            window.__tinyEditor.transformToEditor(editorNode);
            editorNode.addEventListener('input', (e: { target: { innerHTML: any; }; }) => onChange(e.target.innerHTML));
        }
      }, [onChange]);

    return (<Box {...props} ref={editorRef}>{text}</Box>);
}
