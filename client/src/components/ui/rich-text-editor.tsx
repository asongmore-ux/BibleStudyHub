import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bold, Italic, Underline, List, ListOrdered, Quote, Undo, Redo } from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  "data-testid"?: string;
}

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = "Start writing...",
  className,
  "data-testid": testId
}: RichTextEditorProps) {
  const [isEditing, setIsEditing] = useState(false);

  // In a real implementation, you'd use a proper rich text editor like TipTap or Quill
  // For this demo, we'll use a simple textarea with HTML content
  const handleContentChange = (value: string) => {
    onChange(value);
  };

  const formatText = (command: string) => {
    document.execCommand(command, false);
    // In a real implementation, you'd update the content state
  };

  const insertList = (ordered: boolean = false) => {
    const listType = ordered ? 'insertOrderedList' : 'insertUnorderedList';
    document.execCommand(listType, false);
  };

  const insertQuote = () => {
    document.execCommand('formatBlock', false, 'blockquote');
  };

  return (
    <div className={cn("border border-input rounded-lg", className)} data-testid={testId}>
      {/* Toolbar */}
      <div className="border-b bg-muted/30 p-3 rounded-t-lg">
        <div className="flex items-center space-x-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('bold')}
            data-testid="format-bold"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('italic')}
            data-testid="format-italic"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('underline')}
            data-testid="format-underline"
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6 mx-2" />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertList(false)}
            data-testid="format-list"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertList(true)}
            data-testid="format-ordered-list"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={insertQuote}
            data-testid="format-quote"
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6 mx-2" />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('undo')}
            data-testid="format-undo"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('redo')}
            data-testid="format-redo"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="p-4 min-h-[300px]">
        <div
          contentEditable
          className="w-full h-full outline-none text-foreground font-bible leading-relaxed lesson-content"
          suppressContentEditableWarning={true}
          onInput={(e) => {
            const target = e.target as HTMLDivElement;
            handleContentChange(target.innerHTML);
          }}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          dangerouslySetInnerHTML={{ __html: content || `<p>${placeholder}</p>` }}
          data-testid="editor-content"
        />
      </div>
    </div>
  );
}
