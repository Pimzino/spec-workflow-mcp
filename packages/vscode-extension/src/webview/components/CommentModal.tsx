import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Palette, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isValidHex, hexToRgba } from '@/lib/colorUtils';
import { useVSCodeTheme } from '@/hooks/useVSCodeTheme';
import { useTranslation } from 'react-i18next';
import iro from '@jaames/iro';

interface CommentModalProps {
  selectedText: string;
  existingComment?: {
    id: string;
    text: string;
    highlightColor?: {
      bg: string;
      border: string;
      name: string;
    };
    timestamp: string;
  } | null;
  onSave: (comment: string, color: string) => void;
  onCancel: () => void;
}

export function CommentModal({ selectedText, existingComment, onSave, onCancel }: CommentModalProps) {
  const theme = useVSCodeTheme();
  const { t } = useTranslation();
  // Initialize state based on whether we're editing or creating new
  const [comment, setComment] = useState(existingComment?.text || '');
  const [currentColor, setCurrentColor] = useState(
    existingComment?.highlightColor?.border || '#FFEB3B'
  );
  const [colorPicker, setColorPicker] = useState<any | null>(null);
  const colorWheelRef = useRef<HTMLDivElement>(null);

  // Initialize iro.js color picker
  useEffect(() => {
    if (colorWheelRef.current && !colorPicker) {
      const picker = new (iro as any).ColorPicker(colorWheelRef.current, {
        width: 200,
        color: currentColor,
        borderWidth: 2,
        borderColor: '#fff',
        layout: [
          {
            component: (iro as any).ui.Wheel,
            options: {}
          },
          {
            component: (iro as any).ui.Slider,
            options: {
              sliderType: 'value'
            }
          }
        ]
      });

      picker.on('color:change', (color: any) => {
        setCurrentColor(color.hexString.toUpperCase());
      });

      setColorPicker(picker);
    }

    return () => {
      if (colorPicker) {
        colorPicker.off('color:change');
      }
    };
  }, [colorPicker]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [comment, currentColor, onCancel]);

  const handleSave = () => {
    if (comment.trim() && isValidHex(currentColor)) {
      onSave(comment.trim(), currentColor);
    }
  };

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value.toUpperCase();
    if (isValidHex(color)) {
      setCurrentColor(color);
      if (colorPicker) {
        colorPicker.color.hexString = color;
      }
    } else {
      setCurrentColor(color); // Allow partial input
    }
  };

  const getColorPreviewStyle = () => {
    if (isValidHex(currentColor)) {
      return {
        backgroundColor: hexToRgba(currentColor, 0.3),
        borderColor: currentColor,
        borderWidth: '2px'
      };
    }
    return {};
  };

  const isFormValid = comment.trim().length > 0 && isValidHex(currentColor);

  return (
    <div className={cn("h-full flex flex-col overflow-hidden p-6", `vscode-${theme}`)}>
      {/* Fixed Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">
            {existingComment ? t('commentModal.title.edit') : t('commentModal.title.add')}
          </h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
        {/* Selected Text Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{t('commentModal.selectedText')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="p-3 rounded-md bg-muted font-mono text-sm leading-relaxed max-h-32 overflow-y-auto border"
            style={getColorPreviewStyle()}
          >
            {selectedText}
          </div>
        </CardContent>
      </Card>

      {/* Color Picker Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Palette className="h-4 w-4" />
            {t('commentModal.highlightColor')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Color Wheel */}
          <div className="flex justify-center p-4 bg-muted/30 rounded-lg border">
            <div ref={colorWheelRef} />
          </div>
          
          {/* Color Input and Preview */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {t('commentModal.hexColor')}
              </label>
              <input
                type="text"
                value={currentColor}
                onChange={handleColorInputChange}
                className="w-full px-3 py-2 text-sm font-mono bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="#FFEB3B"
                maxLength={7}
              />
            </div>
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-12 h-12 border-2 rounded-md shadow-sm"
                style={{
                  backgroundColor: isValidHex(currentColor) ? currentColor : '#gray',
                  borderColor: isValidHex(currentColor) ? currentColor : '#gray'
                }}
              />
              <span className="text-xs text-muted-foreground">{t('commentModal.preview')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comment Input */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{t('commentModal.yourComment')}</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full min-h-24 px-3 py-2 text-sm bg-background border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder={t('commentModal.placeholder')}
            autoFocus
          />
          <div className="mt-2 text-xs text-muted-foreground">
            {t('commentModal.tip')}
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Fixed Action Buttons */}
      <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-border flex-shrink-0">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          {t('commentModal.cancel')}
        </Button>
        <Button
          onClick={handleSave}
          disabled={!isFormValid}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {existingComment ? t('commentModal.update') : t('commentModal.add')}
        </Button>
      </div>
    </div>
  );
}