import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from "@/components/ui/button";
import { canvasPreview } from '@/lib/canvas-utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight,
    )
}

interface ImageCropperProps {
    open: boolean;
    imageSrc: string | null;
    onClose: () => void;
    onComplete: (blob: Blob) => void;
}

export function ImageCropper({ open, imageSrc, onClose, onComplete }: ImageCropperProps) {
    const [imgSrc, setImgSrc] = useState(imageSrc || '');
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);

    useEffect(() => {
        if (imageSrc) setImgSrc(imageSrc);
    }, [imageSrc]);

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height, 1));
    }

    const handleSave = async () => {
        const image = imgRef.current;
        const canvas = previewCanvasRef.current;
        if (!image || !canvas || !completedCrop) return;

        // Draw to canvas
        canvasPreview(image, canvas, completedCrop, scale, rotate);

        // Get Blob
        canvas.toBlob((blob) => {
            if (!blob) return;
            onComplete(blob);
            onClose();
        }, 'image/jpeg', 0.9);
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Editar Foto de Perfil</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center gap-4 py-4">
                    {!!imgSrc && (
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={1}
                            circularCrop
                            className="max-h-[300px]"
                        >
                            <img
                                ref={imgRef}
                                alt="Crop me"
                                src={imgSrc}
                                style={{ transform: `scale(${scale}) rotate(${rotate}deg)`, maxHeight: '300px' }}
                                onLoad={onImageLoad}
                            />
                        </ReactCrop>
                    )}

                    <div className="w-full space-y-4 px-4">
                        <div className="space-y-2">
                            <Label>Zoom</Label>
                            <Slider
                                value={[scale]}
                                min={1}
                                max={3}
                                step={0.1}
                                onValueChange={([v]) => setScale(v)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Rotação</Label>
                            <Slider
                                value={[rotate]}
                                min={0}
                                max={360}
                                step={1}
                                onValueChange={([v]) => setRotate(v)}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave}>Salvar Foto</Button>
                </DialogFooter>

                {/* Hidden Canvas for computation */}
                <canvas ref={previewCanvasRef} className="hidden" />
            </DialogContent>
        </Dialog>
    );
}
