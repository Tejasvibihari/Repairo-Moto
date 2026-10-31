import React, { useMemo, useRef } from 'react';
import JoditEditor from 'jodit-react';

// WYSIWYG editor for a service description (bold, lists, links...).
//
//   <ServiceDescriptionEditor initialValue={html} onChange={(html) => ...} />
//
// `initialValue` is read once (mount the editor with a `key` to load another value);
// feeding the value back on every keystroke would reset the cursor.
const BUTTONS = [
    'bold', 'italic', 'underline', 'strikethrough', '|',
    'ul', 'ol', '|',
    'paragraph', 'link', '|',
    'undo', 'redo', 'eraser',
];

export default function ServiceDescriptionEditor({ initialValue = '', onChange, placeholder = 'What is included in this service?' }) {
    const editor = useRef(null);
    const startValue = useRef(initialValue);

    const config = useMemo(() => ({
        height: 240,
        minHeight: 200,
        placeholder,
        buttons: BUTTONS,
        buttonsMD: BUTTONS,
        buttonsSM: BUTTONS,
        buttonsXS: BUTTONS,
        toolbarAdaptive: false,
        statusbar: false,
        showCharsCounter: false,
        showWordsCounter: false,
        showXPathInStatusbar: false,
        askBeforePasteHTML: false,
        askBeforePasteFromWord: false,
        defaultActionOnPaste: 'insert_clear_html',
        enter: 'p',
        link: { openInNewTabCheckbox: false, noFollowCheckbox: false },
    }), [placeholder]);

    return (
        <div className="mt-1 overflow-hidden rounded-xl border border-gray-200 focus-within:border-primary [&_.jodit-container]:!border-0">
            <JoditEditor
                ref={editor}
                value={startValue.current}
                config={config}
                onChange={(html) => onChange?.(html)}
            />
        </div>
    );
}
