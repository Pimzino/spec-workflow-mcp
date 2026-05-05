export type EditorMode = 'view' | 'edit' | 'source';

export interface MDXEditorWrapperProps {
  /** The markdown content to display/edit */
  content: string;

  /** Current editor mode */
  mode: EditorMode;

  /** Called when content changes (only in edit mode) */
  onChange?: (content: string) => void;

  /** Called when save is triggered (Ctrl+S or toolbar button) */
  onSave?: () => void;

  /** Whether a save operation is in progress */
  saving?: boolean;

  /** Whether the last save was successful */
  saved?: boolean;

  /** Error message from last save attempt */
  error?: string;

  /** Custom placeholder text for empty editor */
  placeholder?: string;

  /** CSS class name for the container */
  className?: string;

  /** Whether to enable Mermaid diagram rendering */
  enableMermaid?: boolean;

  /** Height configuration */
  height?: 'auto' | 'full' | string;
}
