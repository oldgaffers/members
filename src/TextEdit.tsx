import { useCallback } from 'react';
import { Box } from '@mui/material';
import 'tiny-editor';

export default function TextEdit({ text, onChange, ...props }) {
    const editorRef = useCallback((editorNode) => {
        if (editorNode) {
            window.__tinyEditor.transformToEditor(editorNode);
            editorNode.addEventListener('input', e => onChange(e.target.innerHTML));
        }
      }, [onChange]);

    return (<Box {...props} ref={editorRef}>{text}</Box>);
}
