import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Modules

// Settings Modules
import { ConfigHub } from "@/components/profile/config/ConfigHub";

export default function Profile() {
    const navigate = useNavigate();

    return (
        <div className="page-container pb-24">

            {/* Back Button (Mobile friendly) */}
            <div className="mb-4 flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-white pl-0">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                </Button>
            </div>

            {/* 2. Settings Hub (Direct View) */}
            <ConfigHub />

        </div>
    );
}
