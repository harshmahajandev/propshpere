import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, RotateCcw, PenTool } from 'lucide-react';

interface DigitalSignatureProps {
  onSignatureSave: (signatureDataUrl: string) => Promise<void>;
  isLoading?: boolean;
  customerName?: string;
  title?: string;
  disabled?: boolean;
}

const DigitalSignature: React.FC<DigitalSignatureProps> = ({
  onSignatureSave,
  isLoading = false,
  customerName,
  title = "Digital Signature",
  disabled = false
}) => {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [signatureComplete, setSignatureComplete] = useState(false);

  const handleBegin = () => {
    setIsEmpty(false);
  };

  const handleEnd = () => {
    if (signatureRef.current) {
      const canvas = signatureRef.current.getCanvas();
      const signatureData = signatureRef.current.getTrimmedCanvas().toDataURL('image/png');
      // Check if canvas is not empty
      setIsEmpty(signatureRef.current.isEmpty());
    }
  };

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setIsEmpty(true);
      setSignatureComplete(false);
    }
  };

  const handleSave = async () => {
    if (!signatureRef.current || isEmpty) {
      return;
    }

    setIsSaving(true);
    try {
      // Get the trimmed signature as data URL
      const signatureDataUrl = signatureRef.current.getTrimmedCanvas().toDataURL('image/png');
      
      // Call the parent component's save handler
      await onSignatureSave(signatureDataUrl);
      
      setSignatureComplete(true);
    } catch (error) {
      console.error('Error saving signature:', error);
      // You might want to show an error message here
    } finally {
      setIsSaving(false);
    }
  };

  if (signatureComplete) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Check className="h-5 w-5" />
            Signature Captured Successfully
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>
              Your digital signature has been saved and the snagging process is now complete.
              {customerName && ` Thank you, ${customerName}.`}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="h-5 w-5" />
          {title}
        </CardTitle>
        {customerName && (
          <p className="text-sm text-muted-foreground">
            Please provide your digital signature to confirm completion, {customerName}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Signature Canvas */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="relative">
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                width: 600,
                height: 200,
                className: 'signature-canvas w-full h-48 bg-white rounded border',
                style: { width: '100%', height: '200px' }
              }}
              onBegin={disabled || isLoading ? undefined : handleBegin}
              onEnd={disabled || isLoading ? undefined : handleEnd}
              backgroundColor="white"
              penColor="black"
              minWidth={1}
              maxWidth={3}
              velocityFilterWeight={0.7}
            />
            {isEmpty && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-gray-400 text-lg">Sign here</p>
              </div>
            )}
            {(disabled || isLoading) && (
              <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center">
                <p className="text-gray-500">Signature disabled</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={isEmpty || disabled || isLoading || isSaving}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Clear
          </Button>
          <Button
            onClick={handleSave}
            disabled={isEmpty || disabled || isLoading || isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Save Signature
              </>
            )}
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Use your mouse or touch screen to sign in the area above</p>
          <p>• Your signature will be saved as a digital record</p>
          <p>• Click "Clear" to start over, or "Save Signature" when complete</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DigitalSignature;
export type { DigitalSignatureProps };