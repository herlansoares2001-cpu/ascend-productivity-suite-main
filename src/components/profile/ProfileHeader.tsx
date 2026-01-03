import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Edit2, Check, X } from "lucide-react";
import { ImageCropper } from './ImageCropper';
import { toast } from "sonner";

interface ProfileHeaderProps {
    user: any; // Supabase user
    level: number;
    xpProgress: number;
    onUpdateProfile: (data: any) => void;
}

export function ProfileHeader({ user, level, xpProgress, onUpdateProfile }: ProfileHeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState("Herlan Soares");
    const [username, setUsername] = useState("@herlan");
    const [bio, setBio] = useState("Focado em produtividade e alta performance. 🚀");
    const [avatarSrc, setAvatarSrc] = useState<string | null>(`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`);

    // Cropper State
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [tempImgSrc, setTempImgSrc] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.onload = () => {
                setTempImgSrc(reader.result as string);
                setIsCropperOpen(true);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSaveCrop = (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        setAvatarSrc(url);
        toast.success("Foto de perfil atualizada!");
        // Here we would upload 'blob' to Supabase Storage
    };

    const handleSaveProfile = () => {
        onUpdateProfile({ name, username, bio });
        setIsEditing(false);
        toast.success("Perfil salvo com sucesso!");
    };

    return (
        <div className="relative mb-8 bg-card rounded-2xl p-6 shadow-sm border">
            <div className="absolute top-4 right-4">
                {isEditing ? (
                    <div className="flex gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => setIsEditing(false)}><X className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500" onClick={handleSaveProfile}><Check className="w-4 h-4" /></Button>
                    </div>
                ) : (
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsEditing(true)}><Edit2 className="w-4 h-4" /></Button>
                )}
            </div>

            <div className="flex flex-col items-center">
                {/* Avatar */}
                <div className="relative mb-4 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Avatar className="w-24 h-24 border-4 border-background ring-2 ring-primary">
                        <AvatarImage src={avatarSrc!} className="object-cover" />
                        <AvatarFallback>{name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-8 h-8 text-white" />
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                </div>

                {/* Identity */}
                {isEditing ? (
                    <div className="w-full space-y-3 text-center animate-in fade-in">
                        <Input value={name} onChange={e => setName(e.target.value)} className="text-center font-semibold" placeholder="Nome" />
                        <Input value={username} onChange={e => setUsername(e.target.value)} className="text-center text-sm" placeholder="@usuario" />
                        <Textarea value={bio} onChange={e => setBio(e.target.value)} className="text-center text-sm min-h-[60px]" placeholder="Sua bio..." />
                    </div>
                ) : (
                    <div className="text-center space-y-1">
                        <h1 className="text-2xl font-semibold">{name}</h1>
                        <p className="text-sm text-primary font-medium">{username}</p>
                        <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">{bio}</p>
                    </div>
                )}

                {/* XP Bar */}
                <div className="w-full mt-6 max-w-xs">
                    <div className="flex justify-between text-xs mb-1.5 font-medium text-muted-foreground">
                        <span>Nível {level}</span>
                        <span>{Math.round(xpProgress)}% XP</span>
                    </div>
                    <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-1000 ease-out"
                            style={{ width: `${xpProgress}%` }}
                        />
                    </div>
                </div>
            </div>

            <ImageCropper
                open={isCropperOpen}
                imageSrc={tempImgSrc}
                onClose={() => setIsCropperOpen(false)}
                onComplete={handleSaveCrop}
            />
        </div>
    );
}
